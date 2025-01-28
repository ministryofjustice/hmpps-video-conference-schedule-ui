import nock from 'nock'

import config from '../config'
import ManageUsersApiClient from './manageUsersApiClient'
import createUser from '../testutils/createUser'
import InMemoryTokenStore from './tokenStore/inMemoryTokenStore'

const user = createUser([])

describe('manageUsersApiClient', () => {
  let fakeManageUsersApiClient: nock.Scope
  let manageUsersApiClient: ManageUsersApiClient

  beforeEach(() => {
    fakeManageUsersApiClient = nock(config.apis.manageUsersApi.url)
    manageUsersApiClient = new ManageUsersApiClient()
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
