import config from '../config'
import RestClient from './restClient'
import { LocationMapping } from '../@types/nomisMappingApi/types'

export default class NomisMappingApiClient extends RestClient {
  constructor() {
    super('Nomis Mapping API', config.apis.nomisMappingApi)
  }

  getLocationMappingByNomisId(nomisLocationId: number, user: Express.User): Promise<LocationMapping> {
    return this.get({ path: `/api/locations/nomis/${nomisLocationId}` }, user)
  }
}
