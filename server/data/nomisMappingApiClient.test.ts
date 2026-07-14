import nock from 'nock'

import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import createUser from '../testutils/createUser'
import InMemoryTokenStore from './tokenStore/inMemoryTokenStore'
import NomisMappingApiClient from './nomisMappingApiClient'

jest.mock('./tokenStore/inMemoryTokenStore')

const user = createUser([])

describe('nomisMappingApiClient', () => {
  let fakeNomisMappingApiClient: nock.Scope
  let mockAuthenticationClient: jest.Mocked<AuthenticationClient>
  let nomisMappingApiClient: NomisMappingApiClient

  beforeEach(() => {
    mockAuthenticationClient = {
      getToken: jest.fn().mockResolvedValue('systemToken'),
    } as unknown as jest.Mocked<AuthenticationClient>

    fakeNomisMappingApiClient = nock(config.apis.nomisMappingApi.url)
    nomisMappingApiClient = new NomisMappingApiClient(mockAuthenticationClient)
    jest.spyOn(InMemoryTokenStore.prototype, 'getToken').mockResolvedValue('systemToken')
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('getLocationMappingsByNomisIds', () => {
    it('should return data from api', async () => {
      const response = [{ data: 'data' }]

      fakeNomisMappingApiClient
        .post('/api/locations/nomis', [1])
        .matchHeader('authorization', `Bearer systemToken`)
        .reply(200, response)

      const output = await nomisMappingApiClient.getLocationMappingsByNomisIds([1], user)
      expect(output).toEqual(response)
    })
  })
})
