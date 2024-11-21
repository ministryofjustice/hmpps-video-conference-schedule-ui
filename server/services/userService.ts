import { jwtDecode } from 'jwt-decode'
import { convertToTitleCase } from '../utils/utils'
import ManageUsersApiClient from '../data/manageUsersApiClient'
import { User } from '../@types/manageUsersApi/types'

export interface UserDetails extends User {
  displayName: string
  roles: string[]
}

export default class UserService {
  constructor(private readonly manageUsersApiClient: ManageUsersApiClient) {}

  public async getUser(user: Express.User): Promise<UserDetails> {
    const serviceUser = await this.manageUsersApiClient.getUser(user)
    const roles = this.getUserRoles(user.token)

    return {
      ...serviceUser,
      roles,
      displayName: convertToTitleCase(serviceUser.name),
    }
  }

  private getUserRoles(token: string): string[] {
    const { authorities: roles = [] } = jwtDecode(token) as { authorities?: string[] }
    return roles.map(role => role.substring(role.indexOf('_') + 1))
  }
}
