import { stubGet } from './wiremock'

export default {
  stubActivitiesAndAppointmentsPing: () => stubGet('/activities-and-appointments-api/health/ping'),
}
