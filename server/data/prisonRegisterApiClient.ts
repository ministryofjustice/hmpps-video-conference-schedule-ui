import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import config from '../config'
import logger from '../../logger'
import { Prison } from '../@types/prisonRegisterApi/types'

export default class PrisonRegisterApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Prison Register API', config.apis.prisonRegisterApi, logger, authenticationClient)
  }

  getPrison(prisonId: string, user: Express.User): Promise<Prison> {
    return this.get({ path: `/prisons/id/${prisonId}` }, asSystem(user.username))
  }
}
