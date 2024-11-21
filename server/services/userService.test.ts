import UserService from './userService'
import ManageUsersApiClient from '../data/manageUsersApiClient'
import { User } from '../@types/manageUsersApi/types'
import createUser from '../testutils/createUser'

jest.mock('../data/manageUsersApiClient')

describe('User service', () => {
  let manageUsersApiClient: jest.Mocked<ManageUsersApiClient>
  let userService: UserService

  beforeEach(() => {
    manageUsersApiClient = new ManageUsersApiClient() as jest.Mocked<ManageUsersApiClient>
    userService = new UserService(manageUsersApiClient)
  })

  describe('getUser', () => {
    it('Retrieves and formats user name', async () => {
      manageUsersApiClient.getUser.mockResolvedValue({ name: 'john smith' } as User)

      const result = await userService.getUser(createUser([]))

      expect(result.displayName).toEqual('John Smith')
    })

    it('Retrieves and formats roles', async () => {
      manageUsersApiClient.getUser.mockResolvedValue({ name: 'john smith' } as User)

      const result = await userService.getUser(createUser(['ROLE_ONE', 'ROLE_TWO']))

      expect(result.roles).toEqual(['ONE', 'TWO'])
    })
  })
})
