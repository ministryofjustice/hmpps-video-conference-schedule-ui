import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import config from '../config'
import logger from '../../logger'
import { Prisoner } from '../@types/prisonerSearchApi/types'

export default class PrisonerSearchApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Prisoner Search API', config.apis.prisonerSearchApi, logger, authenticationClient)
  }

  public async getByPrisonerNumbers(prisonerNumbers: string[], user: Express.User): Promise<Prisoner[]> {
    return prisonerNumbers.length
      ? this.post({ path: `/prisoner-search/prisoner-numbers`, data: { prisonerNumbers } }, asSystem(user.username))
      : []
  }
}
