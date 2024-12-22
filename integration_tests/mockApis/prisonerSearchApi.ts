import { stubGet } from './wiremock'

export default {
  stubPrisonerSearchApiPing: () => stubGet('/prisoner-search-api/health/ping'),
}
