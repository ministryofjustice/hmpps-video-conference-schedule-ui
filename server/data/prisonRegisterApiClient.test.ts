import nock from 'nock'

import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import createUser from '../testutils/createUser'
import PrisonRegisterApiClient from './prisonRegisterApiClient'
import InMemoryTokenStore from './tokenStore/inMemoryTokenStore'

jest.mock('./tokenStore/inMemoryTokenStore')

const user = createUser([])

describe('prisonRegisterApiClient', () => {
  let fakePrisonRegisterApiClient: nock.Scope
  let mockAuthenticationClient: jest.Mocked<AuthenticationClient>
  let prisonRegisterApiClient: PrisonRegisterApiClient

  beforeEach(() => {
    mockAuthenticationClient = {
      getToken: jest.fn().mockResolvedValue('systemToken'),
    } as unknown as jest.Mocked<AuthenticationClient>

    fakePrisonRegisterApiClient = nock(config.apis.prisonRegisterApi.url)
    prisonRegisterApiClient = new PrisonRegisterApiClient(mockAuthenticationClient)
    jest.spyOn(InMemoryTokenStore.prototype, 'getToken').mockResolvedValue('systemToken')
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('getPrison', () => {
    it('should return data from api', async () => {
      const response = { data: 'data' }

      fakePrisonRegisterApiClient
        .get('/prisons/id/MDI')
        .matchHeader('authorization', `Bearer systemToken`)
        .reply(200, response)

      const output = await prisonRegisterApiClient.getPrison('MDI', user)
      expect(output).toEqual(response)
    })
  })
})
