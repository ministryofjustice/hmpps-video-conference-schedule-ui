import config from '../config'
import RestClient from './restClient'
import { Location } from '../@types/locationsInsidePrisonApi/types'

export default class LocationsInsidePrisonApiClient extends RestClient {
  constructor() {
    super('Locations Inside Prison API', config.apis.locationsInsidePrisonApi)
  }

  getLocationById(id: string, user: Express.User): Promise<Location> {
    return this.get({ path: `/locations/${id}`, query: { formatLocalName: true } }, user)
  }
}
