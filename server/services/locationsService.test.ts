import createUser from '../testutils/createUser'
import LocationsService from './locationsService'
import NomisMappingApiClient from '../data/nomisMappingApiClient'

jest.mock('../data/nomisMappingApiClient')

const user = createUser([])

describe('Locations service', () => {
  let nomisMappingApiClient: jest.Mocked<NomisMappingApiClient>
  let locationsService: LocationsService

  beforeEach(() => {
    nomisMappingApiClient = new NomisMappingApiClient() as jest.Mocked<NomisMappingApiClient>
    locationsService = new LocationsService(nomisMappingApiClient)
  })

  describe('getLocationByNomisId', () => {
    it('Retrieves the location by its nomis ID', async () => {
      nomisMappingApiClient.getLocationMappingByNomisId.mockResolvedValue({
        nomisLocationId: 1,
        dpsLocationId: 'abc-123',
      })

      const result = await locationsService.getLocationMappingByNomisId(1, user)

      expect(result.dpsLocationId).toEqual('abc-123')
      expect(nomisMappingApiClient.getLocationMappingByNomisId).toHaveBeenLastCalledWith(1, user)
    })
  })
})
