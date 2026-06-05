import OfficialVisitsApiClient from '../data/officialVisitsApiClient'
import { HmppsUser } from '../interfaces/hmppsUser'

enum OfficialVisitRole {
  OFFVIS_VIEW_ONLY = 'OFFVIS_VIEW_ONLY',
  OFFVIS_MANAGE = 'OFFVIS_MANAGE',
}

export default class OfficialVisitsService {
  constructor(private readonly officialVisitsApiClient: OfficialVisitsApiClient) {}

  public async getOfficialVisits(prisonCode: string, date: Date, user: Express.User) {
    return this.officialVisitsApiClient.getOfficialVisits(prisonCode, date, user)
  }

  public isPermittedToViewOfficialVisit(user: Express.User | HmppsUser) {
    if (this.isHmppsUser(user)) {
      return (
        user.roles.includes(OfficialVisitRole.OFFVIS_VIEW_ONLY) || user.roles.includes(OfficialVisitRole.OFFVIS_MANAGE)
      )
    }

    return false
  }

  /* eslint-disable  @typescript-eslint/no-explicit-any */
  private isHmppsUser(user: any): user is HmppsUser {
    return (user as HmppsUser).roles !== undefined
  }
}
