import PrisonRegisterApiClient from '../data/prisonRegisterApiClient'
import ActivitiesAndAppointmentsApiClient from '../data/activitiesAndAppointmentsApiClient'

export default class PrisonService {
  constructor(
    private readonly prisonRegisterApiClient: PrisonRegisterApiClient,
    private readonly activitiesAndAppointmentsApiClient: ActivitiesAndAppointmentsApiClient,
  ) {}

  public getPrison(prisonId: string, user: Express.User) {
    return this.prisonRegisterApiClient.getPrison(prisonId, user)
  }

  public isAppointmentsRolledOutAt(prisonId: string, user: Express.User) {
    return this.activitiesAndAppointmentsApiClient.isAppointmentsRolledOutAt(prisonId, user)
  }
}
