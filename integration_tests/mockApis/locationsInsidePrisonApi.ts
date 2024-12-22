import { stubGet } from './wiremock'

export default {
  stubLocationsInsidePrisonApiPing: () => stubGet('/locations-inside-prison-api/health/ping'),
}
