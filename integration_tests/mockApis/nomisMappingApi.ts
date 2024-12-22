import { stubGet } from './wiremock'

export default {
  stubNomisMappingApiPing: () => stubGet('/nomis-mapping-api/health/ping'),
}
