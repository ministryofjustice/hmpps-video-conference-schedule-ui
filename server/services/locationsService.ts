import NomisMappingApiClient from '../data/nomisMappingApiClient'

export default class LocationsService {
  constructor(private readonly nomisMappingApiClient: NomisMappingApiClient) {}

  public async getLocationMappingByNomisId(nomisLocationId: number, user: Express.User) {
    return this.nomisMappingApiClient.getLocationMappingByNomisId(nomisLocationId, user)
  }
}
