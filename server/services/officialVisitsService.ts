import OfficialVisitsApiClient from '../data/officialVisitsApiClient'

export default class OfficialVisitsService {
  constructor(private readonly officialVisitsApiClient: OfficialVisitsApiClient) {}

  public async getOfficialVisits(prisonCode: string, date: Date, user: Express.User) {
    return this.officialVisitsApiClient.getOfficialVisits(prisonCode, date, user)
  }
}
