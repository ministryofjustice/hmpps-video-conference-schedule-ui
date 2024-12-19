import config from '../config'
import RestClient from './restClient'
import { Prison } from '../@types/prisonRegisterApi/types'

export default class PrisonRegisterApiClient extends RestClient {
  constructor() {
    super('Prison Register API', config.apis.prisonRegisterApi)
  }

  getPrison(prisonId: string, user: Express.User): Promise<Prison> {
    return this.get({ path: `/prisons/id/${prisonId}` }, user)
  }
}
