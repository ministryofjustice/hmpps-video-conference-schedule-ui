import config from '../config'
import RestClient from './restClient'
import { User } from '../@types/manageUsersApi/types'
import { formatDate } from '../utils/utils'

export default class PrisonApiClient extends RestClient {
  constructor() {
    super('Prison API', config.apis.prisonApi)
  }

  public getScheduledAppointments(prisonId: string, date: Date, user: Express.User): Promise<User> {
    return this.get(
      { path: `/api/schedules/${prisonId}/appointments`, query: { date: formatDate(date, 'yyyy-MM-dd') } },
      user,
    )
  }
}
