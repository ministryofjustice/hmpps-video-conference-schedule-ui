import config from '../config'
import RestClient from './restClient'
import { formatDate } from '../utils/utils'
import { ReferenceCode, ScheduledVideoLinkBooking } from '../@types/bookAVideoLinkApi/types'

export default class BookAVideoLinkApiClient extends RestClient {
  constructor() {
    super('Book A Video Link API', config.apis.bookAVideoLinkApi)
  }

  public getReferenceCodesForGroup(groupCode: string, user: Express.User): Promise<ReferenceCode[]> {
    return this.get({ path: `/reference-codes/group/${groupCode}` }, user)
  }

  public getScheduledVideoLinkBookings(
    prisonId: string,
    date: Date,
    user: Express.User,
  ): Promise<ScheduledVideoLinkBooking[]> {
    return this.get({ path: `/schedule/prison/${prisonId}`, query: { date: formatDate(date, 'yyyy-MM-dd') } }, user)
  }
}
