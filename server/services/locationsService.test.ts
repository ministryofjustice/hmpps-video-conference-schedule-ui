import createUser from '../testutils/createUser'
import LocationsService from './locationsService'
import NomisMappingApiClient from '../data/nomisMappingApiClient'
import LocationsInsidePrisonApiClient from '../data/locationsInsidePrisonApiClient'
import { LocationMapping } from '../@types/nomisMappingApi/types'
import { Location } from '../@types/locationsInsidePrisonApi/types'

jest.mock('../data/locationsInsidePrisonApiClient')
jest.mock('../data/nomisMappingApiClient')

const user = createUser([])

describe('Locations service', () => {
  let locationsInsidePrisonApiClient: jest.Mocked<LocationsInsidePrisonApiClient>
  let nomisMappingApiClient: jest.Mocked<NomisMappingApiClient>
  let locationsService: LocationsService

  beforeEach(() => {
    locationsInsidePrisonApiClient = new LocationsInsidePrisonApiClient() as jest.Mocked<LocationsInsidePrisonApiClient>
    nomisMappingApiClient = new NomisMappingApiClient() as jest.Mocked<NomisMappingApiClient>
    locationsService = new LocationsService(locationsInsidePrisonApiClient, nomisMappingApiClient)
  })

  describe('getLocationByNomisId', () => {
    it('Retrieves the location by its nomis ID', async () => {
      nomisMappingApiClient.getLocationMappingByNomisId.mockResolvedValue({
        nomisLocationId: 1,
        dpsLocationId: 'abc-123',
      } as LocationMapping)

      locationsInsidePrisonApiClient.getLocationById.mockResolvedValue({ id: 'abc-123' } as Location)

      const result = await locationsService.getLocationByNomisId(1, user)

      expect(result.id).toEqual('abc-123')
      expect(nomisMappingApiClient.getLocationMappingByNomisId).toHaveBeenLastCalledWith(1, user)
      expect(locationsInsidePrisonApiClient.getLocationById).toHaveBeenLastCalledWith('abc-123', user)
    })
  })
})
