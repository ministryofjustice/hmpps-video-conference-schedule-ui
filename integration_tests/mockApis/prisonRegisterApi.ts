import { stubGet } from './wiremock'

export default {
  stubPrisonRegisterPing: () => stubGet('/prison-register-api/health/ping'),
}
