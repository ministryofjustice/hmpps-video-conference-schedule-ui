import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import config from '../config'
import logger from '../../logger'
import {
  OfficialVisitSearchCriteria,
  OfficialVisitSearchResults,
  OfficialVisit,
} from '../@types/officialVisitsApi/types'
import { formatDate } from '../utils/utils'

export default class OfficialVisitsApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Official Visits API', config.apis.officialVisitsApi, logger, authenticationClient)
  }

  async getOfficialVisits(atPrisonCode: string, onDate: Date, user: Express.User): Promise<OfficialVisit[]> {
    return this.post<OfficialVisitSearchResults>(
      {
        path: `/official-visit/prison/${atPrisonCode}/find-by-criteria`,
        query: { page: 0, size: 200 },
        data: {
          startDate: formatDate(onDate, 'yyyy-MM-dd'),
          endDate: formatDate(onDate, 'yyyy-MM-dd'),
          visitTypes: ['VIDEO'],
        } as OfficialVisitSearchCriteria,
      },
      asSystem(user.username),
    ).then(result => result.content || [])
  }
}
