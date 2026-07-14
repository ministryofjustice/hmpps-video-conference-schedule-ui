import nock from 'nock'

import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import ManageUsersApiClient from './manageUsersApiClient'
import createUser from '../testutils/createUser'
import InMemoryTokenStore from './tokenStore/inMemoryTokenStore'

const user = createUser([])

describe('manageUsersApiClient', () => {
  let fakeManageUsersApiClient: nock.Scope
  let mockAuthenticationClient: jest.Mocked<AuthenticationClient>
  let manageUsersApiClient: ManageUsersApiClient

  beforeEach(() => {
    mockAuthenticationClient = {
      getToken: jest.fn().mockResolvedValue('systemToken'),
    } as unknown as jest.Mocked<AuthenticationClient>

    fakeManageUsersApiClient = nock(config.apis.manageUsersApi.url)
    manageUsersApiClient = new ManageUsersApiClient(mockAuthenticationClient)
    jest.spyOn(InMemoryTokenStore.prototype, 'getToken').mockResolvedValue('systemToken')
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('getUser', () => {
    it('should return data from api', async () => {
      const response = { data: 'data' }

      fakeManageUsersApiClient
        .get('/users/jbloggs')
        .matchHeader('authorization', `Bearer systemToken`)
        .reply(200, response)

      const output = await manageUsersApiClient.getUser(user)
      expect(output).toEqual(response)
    })
  })

  describe('getUserByUsername', () => {
    it('should return data from api', async () => {
      const response = { data: 'data' }

      fakeManageUsersApiClient
        .get('/users/jsmith')
        .matchHeader('authorization', `Bearer systemToken`)
        .reply(200, response)

      const output = await manageUsersApiClient.getUserByUsername('jsmith', user)
      expect(output).toEqual(response)
    })
  })
})
