import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import config from '../config'
import logger from '../../logger'
import { formatDate } from '../utils/utils'
import { BvlsAppointment, Court, ProbationTeam, Prison, VideoEvents } from '../@types/bookAVideoLinkApi/types'

export default class BookAVideoLinkApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Book A Video Link API', config.apis.bookAVideoLinkApi, logger, authenticationClient)
  }

  public getVideoLinkAppointments(prisonId: string, date: Date, user: Express.User): Promise<BvlsAppointment[]> {
    return this.get(
      { path: `/schedule/prison/${prisonId}`, query: { date: formatDate(date, 'yyyy-MM-dd'), includeCancelled: true } },
      asSystem(user.username),
    )
  }

  public getCourts(user: Express.User): Promise<Court[]> {
    return this.get({ path: '/courts' }, asSystem(user.username))
  }

  public getProbationTeams(user: Express.User): Promise<ProbationTeam[]> {
    return this.get({ path: '/probation-teams' }, asSystem(user.username))
  }

  public getPrison(prisonId: string, user: Express.User): Promise<Prison> {
    return this.get({ path: `/prisons/${prisonId}` }, asSystem(user.username))
  }

  public getVideoEvents(
    prisonId: string,
    params: { fromDate: Date; endDate: Date; timeSlot?: 'AM' | 'PM' | 'ED' },
    user: Express.User,
  ): Promise<VideoEvents> {
    return this.post(
      {
        path: `/video-events/prison/${prisonId}/list-by-location`,
        data: {
          startDate: formatDate(params.fromDate, 'yyyy-MM-dd'),
          endDate: formatDate(params.endDate, 'yyyy-MM-dd'),
        },
      },
      asSystem(user.username),
    )
  }
}
