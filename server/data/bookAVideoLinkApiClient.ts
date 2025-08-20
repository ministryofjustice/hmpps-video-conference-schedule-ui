import config from '../config'
import RestClient from './restClient'
import { formatDate } from '../utils/utils'
import { BvlsAppointment, Court, ProbationTeam, Prison } from '../@types/bookAVideoLinkApi/types'

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

  public getCourts(user: Express.User): Promise<Court[]> {
    return this.get({ path: '/courts' }, user)
  }

  public getProbationTeams(user: Express.User): Promise<ProbationTeam[]> {
    return this.get({ path: '/probation-teams' }, user)
  }

  public getPrison(prisonId: string, user: Express.User): Promise<Prison> {
    return this.get({ path: `/prisons/${prisonId}` }, user)
  }
}
