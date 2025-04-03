import config from '../config'
import RestClient from './restClient'
import { LocationMapping } from '../@types/nomisMappingApi/types'

export default class NomisMappingApiClient extends RestClient {
  constructor() {
    super('Nomis Mapping API', config.apis.nomisMappingApi)
  }

  getLocationMappingsByNomisIds(nomisLocationIds: number[], user: Express.User): Promise<LocationMapping[]> {
    return this.post({ path: `/api/locations/nomis`, data: nomisLocationIds }, user)
  }
}
