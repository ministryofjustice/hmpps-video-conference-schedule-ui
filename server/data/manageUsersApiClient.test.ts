import nock from 'nock'

import config from '../config'
import ManageUsersApiClient from './manageUsersApiClient'
import createUser from '../testutils/createUser'

const user = createUser([])

describe('manageUsersApiClient', () => {
  let fakeManageUsersApiClient: nock.Scope
  let manageUsersApiClient: ManageUsersApiClient

  beforeEach(() => {
    fakeManageUsersApiClient = nock(config.apis.manageUsersApi.url)
    manageUsersApiClient = new ManageUsersApiClient()
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('getUser', () => {
    it('should return data from api', async () => {
      const response = { data: 'data' }

      fakeManageUsersApiClient
        .get('/users/me')
        .matchHeader('authorization', `Bearer ${user.token}`)
        .reply(200, response)

      const output = await manageUsersApiClient.getUser(user)
      expect(output).toEqual(response)
    })
  })
})
