import nock from 'nock'

import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import FrontendComponentApiClient from './frontendComponentApiClient'
import createUser from '../testutils/createUser'

const user = createUser([])

describe('frontendComponentApiClient', () => {
  let fakeFrontendComponentApi: nock.Scope
  let mockAuthenticationClient: jest.Mocked<AuthenticationClient>
  let frontendComponentApiClient: FrontendComponentApiClient

  beforeEach(() => {
    mockAuthenticationClient = {
      getToken: jest.fn().mockResolvedValue('systemToken'),
    } as unknown as jest.Mocked<AuthenticationClient>

    fakeFrontendComponentApi = nock(config.apis.frontendComponents.url)
    frontendComponentApiClient = new FrontendComponentApiClient(mockAuthenticationClient)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('getComponent', () => {
    it('should return data from api', async () => {
      const response = { header: 'testHeader', footer: 'testFooter' }

      fakeFrontendComponentApi
        .get('/components?component=header&component=footer')
        .matchHeader('authorization', `Bearer ${user.token}`)
        .matchHeader('x-user-token', `${user.token}`)
        .reply(200, response)

      const { header, footer } = await frontendComponentApiClient.getComponents(['header', 'footer'], user)

      expect(header).toEqual('testHeader')
      expect(footer).toEqual('testFooter')
      expect(nock.isDone()).toBe(true)
    })
  })
})
