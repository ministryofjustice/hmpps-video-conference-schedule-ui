import config from '../config'
import RestClient from './restClient'
import { Location, ResidentialHierarchy } from '../@types/locationsInsidePrisonApi/types'

export default class LocationsInsidePrisonApiClient extends RestClient {
  constructor() {
    super('Locations Inside Prison API', config.apis.locationsInsidePrisonApi)
  }

  getAppointmentLocations(prisonId: string, user: Express.User): Promise<Location[]> {
    return this.get(
      {
        path: `/locations/prison/${prisonId}/non-residential-usage-type/APPOINTMENT`,
        query: { formatLocalName: true, sortByLocalName: true },
      },
      user,
    )
  }

  getResidentialHierarchy(prisonId: string, user: Express.User): Promise<ResidentialHierarchy[]> {
    return this.get({ path: `/locations/prison/${prisonId}/residential-hierarchy` }, user)
  }
}
