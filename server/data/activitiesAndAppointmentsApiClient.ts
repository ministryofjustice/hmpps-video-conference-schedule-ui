import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import config from '../config'
import logger from '../../logger'
import { Appointment, AppointmentCategory, RolloutPrisonPlan } from '../@types/activitiesAndAppointmentsApi/types'
import { formatDate } from '../utils/utils'

export default class ActivitiesAndAppointmentsApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Activities And Appointments API', config.apis.activitiesAndAppointmentsApi, logger, authenticationClient)
  }

  public async isAppointmentsRolledOutAt(prisonId: string, user: Express.User): Promise<boolean> {
    return this.get<RolloutPrisonPlan>({ path: `/rollout/${prisonId}` }, asSystem(user.username)).then(
      r => r.prisonLive,
    )
  }

  public async getAppointmentCategories(user: Express.User): Promise<AppointmentCategory[]> {
    return this.get(
      { path: `/appointment-categories`, headers: { 'Caseload-Id': user.activeCaseLoadId } },
      asSystem(user.username),
    )
  }

  public getAppointments(
    prisonId: string,
    searchRequest: { date: Date; timeSlots?: ('AM' | 'PM' | 'ED')[] },
    user: Express.User,
  ): Promise<Appointment[]> {
    return this.post(
      {
        path: `/appointments/${prisonId}/search`,
        headers: { 'Caseload-Id': user.activeCaseLoadId },
        data: { startDate: formatDate(searchRequest.date, 'yyyy-MM-dd'), timeSlots: searchRequest.timeSlots },
      },
      asSystem(user.username),
    )
  }
}
