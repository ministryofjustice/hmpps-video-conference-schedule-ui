import { stubGet } from './wiremock'

export default {
  stubPrisonApiPing: () => stubGet('/prison-api/health/ping'),
}
