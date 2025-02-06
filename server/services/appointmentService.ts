import _ from 'lodash'
import PrisonApiClient from '../data/prisonApiClient'
import ActivitiesAndAppointmentsApiClient from '../data/activitiesAndAppointmentsApiClient'
import { Appointment as PrisonApiAppointment } from '../@types/prisonApi/types'
import config from '../config'
import { formatDate } from '../utils/utils'

export type Appointment = PrisonApiAppointment & {
  status: 'ACTIVE' | 'CANCELLED'
  viewAppointmentLink: string
  createdTime?: string
  updatedTime?: string
  cancelledTime?: string
  cancelledBy?: string
}

export type Period = 'AM' | 'PM' | 'ED'

export default class AppointmentService {
  constructor(
    private readonly prisonApiClient: PrisonApiClient,
    private readonly activitiesAndAppointmentsApiClient: ActivitiesAndAppointmentsApiClient,
  ) {}

  public async getVideoLinkAppointments(prisonId: string, date: Date, periods: Period[], user: Express.User) {
    const isAppointmentsRolledOut = await this.activitiesAndAppointmentsApiClient.isAppointmentsRolledOutAt(
      prisonId,
      user,
    )

    return (
      isAppointmentsRolledOut
        ? this.getAppointmentsFromActivitiesAndAppointmentsApi(prisonId, date, periods, user)
        : this.getAppointmentsFromPrisonApi(prisonId, date, periods, user)
    )
      .then(appts => appts.filter(apt => apt.appointmentTypeCode.startsWith('VL')))
      .then(appts => _.sortBy(appts, apt => apt.startTime))
  }

  private async getAppointmentsFromActivitiesAndAppointmentsApi(
    prisonId: string,
    date: Date,
    periods: Period[],
    user: Express.User,
  ): Promise<Appointment[]> {
    return this.activitiesAndAppointmentsApiClient
      .getAppointments(prisonId, { date, timeSlots: periods }, user)
      .then(appts =>
        appts.flatMap(apt =>
          apt.attendees.map(a => ({
            id: apt.appointmentId,
            offenderNo: a.prisonerNumber,
            date: apt.startDate,
            startTime: apt.startTime,
            endTime: apt.endTime,
            appointmentTypeCode: apt.category.code,
            appointmentTypeDescription: apt.customName
              ? `${apt.customName} (${apt.category.description})`
              : apt.category.description,
            locationId: apt.internalLocation?.id,
            locationDescription: apt.internalLocation?.description || (apt.inCell ? 'In cell' : undefined),
            status: apt.isCancelled ? 'CANCELLED' : 'ACTIVE',
            viewAppointmentLink: `${config.activitiesAndAppointmentsUrl}/appointments/${apt.appointmentId}`,
            createdTime: apt.createdTime,
            updatedTime: apt.updatedTime,
            cancelledTime: apt.cancelledTime,
            cancelledBy: apt.cancelledBy,
          })),
        ),
      )
  }

  private async getAppointmentsFromPrisonApi(
    prisonId: string,
    date: Date,
    periods: Period[],
    user: Express.User,
  ): Promise<Appointment[]> {
    const periodList = periods ?? [undefined]
    return Promise.all(periodList.map(p => this.prisonApiClient.getAppointments(prisonId, date, p, user)))
      .then(appts => appts.flat())
      .then(appts => _.uniq(appts))
      .then(appts =>
        appts.map(a => ({
          ...a,
          startTime: formatDate(a.startTime, 'HH:mm'),
          endTime: formatDate(a.endTime, 'HH:mm'),
          status: 'ACTIVE', // All appointments returned by Prison API are active appointments
          viewAppointmentLink: `${config.dpsUrl}/appointment-details/${a.id}`,
        })),
      )
  }
}
