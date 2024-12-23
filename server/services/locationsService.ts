import LocationsInsidePrisonApiClient from '../data/locationsInsidePrisonApiClient'
import NomisMappingApiClient from '../data/nomisMappingApiClient'

export default class LocationsService {
  constructor(
    private readonly locationsInsidePrisonApiClient: LocationsInsidePrisonApiClient,
    private readonly nomisMappingApiClient: NomisMappingApiClient,
  ) {}

  public async getLocationByNomisId(nomisLocationId: number, user: Express.User) {
    return this.nomisMappingApiClient
      .getLocationMappingByNomisId(nomisLocationId, user)
      .then(mapping => this.locationsInsidePrisonApiClient.getLocationById(mapping.dpsLocationId, user))
  }
}
