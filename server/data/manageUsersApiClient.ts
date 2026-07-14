import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import config from '../config'
import logger from '../../logger'
import { User } from '../@types/manageUsersApi/types'

export default class ManageUsersApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Manage Users Api Client', config.apis.manageUsersApi, logger, authenticationClient)
  }

  public getUser(user: Express.User): Promise<User> {
    return this.getUserByUsername(user.username, user)
  }

  public getUserByUsername(username: string, user: Express.User): Promise<User> {
    return this.get({ path: `/users/${username}` }, asSystem(user.username))
  }
}
