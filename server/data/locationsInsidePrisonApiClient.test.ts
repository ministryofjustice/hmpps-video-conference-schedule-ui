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

  describe('getAppointmentLocations', () => {
    it('should return data from api', async () => {
      const response = { data: 'data' }

      fakeLocationsInsidePrisonApiClient
        .get('/locations/prison/MDI/non-residential-usage-type/APPOINTMENT?formatLocalName=true&sortByLocalName=true')
        .matchHeader('authorization', `Bearer systemToken`)
        .reply(200, response)

      const output = await locationsInsidePrisonApiClient.getAppointmentLocations('MDI', user)
      expect(output).toEqual(response)
    })
  })
})
