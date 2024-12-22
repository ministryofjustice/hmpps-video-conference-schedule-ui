import nock from 'nock'

import config from '../config'
import createUser from '../testutils/createUser'
import InMemoryTokenStore from './tokenStore/inMemoryTokenStore'
import LocationsInsidePrisonApiClient from './locationsInsidePrisonApiClient'

jest.mock('./tokenStore/inMemoryTokenStore')

const user = createUser([])

describe('locationsInsidePrisonApiClient', () => {
  let fakeLocationsInsidePrisonApiClient: nock.Scope
  let locationsInsidePrisonApiClient: LocationsInsidePrisonApiClient

  beforeEach(() => {
    fakeLocationsInsidePrisonApiClient = nock(config.apis.locationsInsidePrisonApi.url)
    locationsInsidePrisonApiClient = new LocationsInsidePrisonApiClient()
    jest.spyOn(InMemoryTokenStore.prototype, 'getToken').mockResolvedValue('systemToken')
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('getLocationById', () => {
    it('should return data from api', async () => {
      const response = { data: 'data' }

      fakeLocationsInsidePrisonApiClient
        .get('/locations/abc-123?formatLocalName=true')
        .matchHeader('authorization', `Bearer systemToken`)
        .reply(200, response)

      const output = await locationsInsidePrisonApiClient.getLocationById('abc-123', user)
      expect(output).toEqual(response)
    })
  })
})
