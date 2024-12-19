import config from '../config'
import RestClient from './restClient'

export default class PrisonRegisterApiClient extends RestClient {
  constructor() {
    super('Prison Register API', config.apis.prisonRegisterApi)
  }
}
