import config from '../config'
import RestClient from './restClient'
import { formatDate } from '../utils/utils'
import { Appointment } from '../@types/prisonApi/types'

export default class PrisonApiClient extends RestClient {
  constructor() {
    super('Prison API', config.apis.prisonApi)
  }

  public getAppointments(prisonId: string, date: Date, timeSlot: string, user: Express.User): Promise<Appointment[]> {
    return this.get(
      { path: `/api/schedules/${prisonId}/appointments`, query: { date: formatDate(date, 'yyyy-MM-dd'), timeSlot } },
      user,
    )
  }
}
