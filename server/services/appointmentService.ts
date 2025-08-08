import _ from 'lodash'
import PrisonApiClient from '../data/prisonApiClient'
import ActivitiesAndAppointmentsApiClient from '../data/activitiesAndAppointmentsApiClient'
import { Appointment as PrisonApiAppointment } from '../@types/prisonApi/types'
import config from '../config'
import { formatDate, parseDate } from '../utils/utils'
import BookAVideoLinkApiClient from '../data/bookAVideoLinkApiClient'

export type Appointment = PrisonApiAppointment & {
  status?: Status
  dpsLocationId?: string
  viewAppointmentLink?: string
  createdTime?: string
  updatedTime?: string
  cancelledTime?: string
  cancelledBy?: string
}

export type Status = 'ACTIVE' | 'CANCELLED'
export type Period = 'AM' | 'PM' | 'ED'

export default class AppointmentService {
  constructor(
    private readonly prisonApiClient: PrisonApiClient,
    private readonly activitiesAndAppointmentsApiClient: ActivitiesAndAppointmentsApiClient,
    private readonly bookAVideoLinkApiClient: BookAVideoLinkApiClient,
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
            dpsLocationId: apt.internalLocation?.dpsLocationId,
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
    return this.prisonApiClient
      .getAppointments(prisonId, date, user)
      .then(appts => appts.filter(a => a.eventStatus !== 'CANC'))
      .then(appts => appts.flat())
      .then(appts => _.uniq(appts))
      .then(appts =>
        appts.map(a => ({
          ...a,
          startTime: formatDate(a.startTime, 'HH:mm'),
          endTime: formatDate(a.endTime, 'HH:mm'),
          status: <Status>'ACTIVE', // All appointments returned by Prison API are active appointments
          viewAppointmentLink: `${config.dpsUrl}/appointment-details/${a.id}`,
        })),
      )
      .then(async appts => [...appts, ...(await this.supplementWithCancelledBvlsAppointments(prisonId, date, user))])
      .then(appts =>
        appts.filter(a => {
          const hours = parseDate(a.startTime, 'HH:mm').getHours()
          return (
            !periods?.length ||
            periods.some(
              p =>
                (p === 'AM' && hours < 12) || (p === 'PM' && hours >= 12 && hours < 17) || (p === 'ED' && hours >= 17),
            )
          )
        }),
      )
  }

  private async supplementWithCancelledBvlsAppointments(
    prisonId: string,
    date: Date,
    user: Express.User,
  ): Promise<Appointment[]> {
    // Since prison-api does not return CANCELLED video appointments, we supplement here using the cancelled appointments we know about in BVLS
    // We map the BVLS bookings onto the same model as prison API appointments, so that it appears as if it has come from prison API.

    return this.bookAVideoLinkApiClient
      .getVideoLinkAppointments(prisonId, date, user)
      .then(appts => appts.filter(a => a.statusCode === 'CANCELLED'))
      .then(appts =>
        appts.map(a => ({
          id: a.prisonAppointmentId,
          offenderNo: a.prisonerNumber,
          startTime: a.startTime,
          endTime: a.endTime,
          appointmentTypeCode: 'VL+', // BVLS bookings do not have an appointmentTypeCode, so we give it one here which matches the `VL` prefix in order to be displayed on the daily schedule
          appointmentTypeDescription: a.appointmentTypeDescription,
          dpsLocationId: a.dpsLocationId,
          locationDescription: a.prisonLocDesc,
          status: a.statusCode,
          createdTime: a.createdTime,
          updatedTime: a.updatedTime,
          cancelledTime: a.updatedTime,
          cancelledBy: a.updatedBy,
        })),
      )
  }
}
