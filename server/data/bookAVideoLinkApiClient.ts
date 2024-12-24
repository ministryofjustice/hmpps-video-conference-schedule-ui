import config from '../config'
import RestClient from './restClient'
import { formatDate } from '../utils/utils'
import { BvlsAppointment } from '../@types/bookAVideoLinkApi/types'

export default class BookAVideoLinkApiClient extends RestClient {
  constructor() {
    super('Book A Video Link API', config.apis.bookAVideoLinkApi)
  }

  public getVideoLinkAppointments(prisonId: string, date: Date, user: Express.User): Promise<BvlsAppointment[]> {
    return this.get(
      { path: `/schedule/prison/${prisonId}`, query: { date: formatDate(date, 'yyyy-MM-dd'), includeCancelled: true } },
      user,
    )
  }
}
