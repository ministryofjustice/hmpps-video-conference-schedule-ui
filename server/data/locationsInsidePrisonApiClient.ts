import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import config from '../config'
import logger from '../../logger'
import { Location, ResidentialHierarchy } from '../@types/locationsInsidePrisonApi/types'

export default class LocationsInsidePrisonApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Locations Inside Prison API', config.apis.locationsInsidePrisonApi, logger, authenticationClient)
  }

  getAppointmentLocations(prisonId: string, user: Express.User): Promise<Location[]> {
    return this.get(
      {
        path: `/locations/non-residential/prison/${prisonId}/service/APPOINTMENT`,
        query: { formatLocalName: true, sortByLocalName: true, filterParents: false },
      },
      asSystem(user.username),
    )
  }

  getResidentialHierarchy(prisonId: string, user: Express.User): Promise<ResidentialHierarchy[]> {
    return this.get({ path: `/locations/prison/${prisonId}/residential-hierarchy` }, asSystem(user.username))
  }
}
