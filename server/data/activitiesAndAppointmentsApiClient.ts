import config from '../config'
import RestClient from './restClient'
import { Appointment } from '../@types/activitiesAndAppointmentsApi/types'
import { formatDate } from '../utils/utils'

export default class ActivitiesAndAppointmentsApiClient extends RestClient {
  constructor() {
    super('Activities And Appointments API', config.apis.activitiesAndAppointmentsApi)
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
      user,
    )
  }
}
