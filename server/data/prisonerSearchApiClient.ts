import config from '../config'
import RestClient from './restClient'
import { Prisoner } from '../@types/prisonerSearchApi/types'

export default class PrisonerSearchApiClient extends RestClient {
  constructor() {
    super('Prisoner Search API', config.apis.prisonerSearchApi)
  }

  public async getByPrisonerNumbers(prisonerNumbers: string[], user: Express.User): Promise<Prisoner[]> {
    return prisonerNumbers.length
      ? this.post({ path: `/prisoner-search/prisoner-numbers`, data: { prisonerNumbers } }, user)
      : []
  }
}
