import config from '../config'
import RestClient from './restClient'

export default class BookAVideoLinkApiClient extends RestClient {
  constructor() {
    super('Book A Video Link API', config.apis.bookAVideoLinkApi)
  }
}
