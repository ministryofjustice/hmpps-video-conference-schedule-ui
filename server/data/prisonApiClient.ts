import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import config from '../config'
import logger from '../../logger'
import { formatDate } from '../utils/utils'
import { Appointment } from '../@types/prisonApi/types'

export default class PrisonApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Prison API', config.apis.prisonApi, logger, authenticationClient)
  }

  public getAppointments(prisonId: string, date: Date, user: Express.User): Promise<Appointment[]> {
    return this.get(
      { path: `/api/schedules/${prisonId}/appointments`, query: { date: formatDate(date, 'yyyy-MM-dd') } },
      asSystem(user.username),
    )
  }
}
