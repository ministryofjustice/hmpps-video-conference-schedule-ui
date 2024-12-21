import { stubGet } from './wiremock'

export default {
  stubPrisonRegisterPing: () => stubGet('/prison-register-api/health/ping'),
  stubGetPrison: () => stubGet('/prison-register-api/prisons/id/MDI', { prisonName: 'Moorland (HMP)' }),
}
