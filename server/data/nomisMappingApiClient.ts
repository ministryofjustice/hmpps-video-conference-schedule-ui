import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import config from '../config'
import logger from '../../logger'
import { LocationMapping } from '../@types/nomisMappingApi/types'

export default class NomisMappingApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Nomis Mapping API', config.apis.nomisMappingApi, logger, authenticationClient)
  }

  getLocationMappingsByNomisIds(nomisLocationIds: number[], user: Express.User): Promise<LocationMapping[]> {
    return this.post({ path: `/api/locations/nomis`, data: nomisLocationIds }, asSystem(user.username))
  }
}
