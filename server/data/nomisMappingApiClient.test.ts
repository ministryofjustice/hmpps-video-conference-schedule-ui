import nock from 'nock'

import config from '../config'
import createUser from '../testutils/createUser'
import InMemoryTokenStore from './tokenStore/inMemoryTokenStore'
import NomisMappingApiClient from './nomisMappingApiClient'

jest.mock('./tokenStore/inMemoryTokenStore')

const user = createUser([])

describe('nomisMappingApiClient', () => {
  let fakeNomisMappingApiClient: nock.Scope
  let nomisMappingApiClient: NomisMappingApiClient

  beforeEach(() => {
    fakeNomisMappingApiClient = nock(config.apis.nomisMappingApi.url)
    nomisMappingApiClient = new NomisMappingApiClient()
    jest.spyOn(InMemoryTokenStore.prototype, 'getToken').mockResolvedValue('systemToken')
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('getLocationMappingByNomisId', () => {
    it('should return data from api', async () => {
      const response = { data: 'data' }

      fakeNomisMappingApiClient
        .get('/mapping/locations/nomis/1')
        .matchHeader('authorization', `Bearer systemToken`)
        .reply(200, response)

      const output = await nomisMappingApiClient.getLocationMappingByNomisId(1, user)
      expect(output).toEqual(response)
    })
  })
})
