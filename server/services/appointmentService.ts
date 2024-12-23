import PrisonApiClient from '../data/prisonApiClient'

export default class AppointmentService {
  constructor(private readonly prisonApiClient: PrisonApiClient) {}

  public async getVideoLinkAppointments(prisonId: string, date: Date, user: Express.User) {
    // TODO: Fetch appointments from A&A here if rolled out in A&A

    return this.prisonApiClient
      .getScheduledAppointments(prisonId, date, user)
      .then(appts => appts.filter(appt => appt.appointmentTypeCode.startsWith('VL')))
  }
}
