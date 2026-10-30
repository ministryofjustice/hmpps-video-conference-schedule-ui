import PrisonRegisterApiClient from '../data/prisonRegisterApiClient'

export default class PrisonService {
  constructor(private readonly prisonRegisterApiClient: PrisonRegisterApiClient) {}

  public getPrison(prisonId: string, user: Express.User) {
    return this.prisonRegisterApiClient.getPrison(prisonId, user)
  }
}
