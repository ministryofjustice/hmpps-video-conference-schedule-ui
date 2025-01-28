import config from '../config'
import RestClient from './restClient'
import { User } from '../@types/manageUsersApi/types'

export default class ManageUsersApiClient extends RestClient {
  constructor() {
    super('Manage Users Api Client', config.apis.manageUsersApi)
  }

  public getUser(user: Express.User): Promise<User> {
    return this.getUserByUsername(user.username, user)
  }

  public getUserByUsername(username: string, user: Express.User): Promise<User> {
    return this.get({ path: `/users/${username}` }, user)
  }
}
