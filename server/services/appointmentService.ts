import _ from 'lodash'
import ActivitiesAndAppointmentsApiClient from '../data/activitiesAndAppointmentsApiClient'
import config from '../config'
import BookAVideoLinkApiClient from '../data/bookAVideoLinkApiClient'

export type Appointment = {
  id: number
  offenderNo?: string
  date?: string
  startTime?: string
  endTime?: string
  appointmentTypeCode?: string
  appointmentTypeDescription?: string
  dpsLocationId?: string
  locationDescription?: string
  status?: Status
  viewAppointmentLink?: string
  createdTime?: string
  updatedTime?: string
  cancelledTime?: string
  cancelledBy?: string
  notesForStaff?: string
  notesForPrisoner?: string
}

export type Status = 'ACTIVE' | 'CANCELLED'
export type Period = 'AM' | 'PM' | 'ED'

export default class AppointmentService {
  constructor(
    private readonly activitiesAndAppointmentsApiClient: ActivitiesAndAppointmentsApiClient,
    private readonly bookAVideoLinkApiClient: BookAVideoLinkApiClient,
  ) {}

  public async getPrison(prisonId: string, user: Express.User) {
    return this.bookAVideoLinkApiClient.getPrison(prisonId, user)
  }

  public async getVideoLinkAppointments(prisonId: string, date: Date, periods: Period[], user: Express.User) {
    return this.getAppointmentsFromActivitiesAndAppointmentsApi(prisonId, date, periods, user)
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
            status: apt.isCancelled || apt.isDeleted ? 'CANCELLED' : 'ACTIVE',
            viewAppointmentLink: `${config.activitiesAndAppointmentsUrl}/appointments/${apt.appointmentId}`,
            createdTime: apt.createdTime,
            updatedTime: apt.updatedTime,
            cancelledTime: apt.cancelledTime,
            cancelledBy: apt.cancelledBy,
            notesForStaff: apt.extraInformation,
            notesForPrisoner: apt.prisonerExtraInformation,
          })),
        ),
      )
  }
}
