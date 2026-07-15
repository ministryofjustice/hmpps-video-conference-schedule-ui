import nock from 'nock'

import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import createUser from '../testutils/createUser'
import InMemoryTokenStore from './tokenStore/inMemoryTokenStore'
import LocationsInsidePrisonApiClient from './locationsInsidePrisonApiClient'

jest.mock('./tokenStore/inMemoryTokenStore')

const user = createUser([])

describe('locationsInsidePrisonApiClient', () => {
  let fakeLocationsInsidePrisonApiClient: nock.Scope
  let mockAuthenticationClient: jest.Mocked<AuthenticationClient>
  let locationsInsidePrisonApiClient: LocationsInsidePrisonApiClient

  beforeEach(() => {
    mockAuthenticationClient = {
      getToken: jest.fn().mockResolvedValue('systemToken'),
    } as unknown as jest.Mocked<AuthenticationClient>

    fakeLocationsInsidePrisonApiClient = nock(config.apis.locationsInsidePrisonApi.url)
    locationsInsidePrisonApiClient = new LocationsInsidePrisonApiClient(mockAuthenticationClient)
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
        .get(
          '/locations/non-residential/prison/MDI/service/APPOINTMENT?formatLocalName=true&sortByLocalName=true&filterParents=false',
        )
        .matchHeader('authorization', `Bearer systemToken`)
        .reply(200, response)

      const output = await locationsInsidePrisonApiClient.getAppointmentLocations('MDI', user)
      expect(output).toEqual(response)
    })
  })

  describe('getResidentialHierarchy', () => {
    it('should return data from api', async () => {
      const response = { data: 'data' }

      fakeLocationsInsidePrisonApiClient
        .get('/locations/prison/MDI/residential-hierarchy')
        .matchHeader('authorization', `Bearer systemToken`)
        .reply(200, response)

      const output = await locationsInsidePrisonApiClient.getResidentialHierarchy('MDI', user)
      expect(output).toEqual(response)
    })
  })
})
