import { stubGet, stubPost } from './wiremock'

export default {
  stubNomisMappingApiPing: () => stubGet('/nomis-mapping-api/health/ping'),
  stubGetLocationMapping: () =>
    stubPost('/nomis-mapping-api/api/locations/nomis', [{ nomisLocationId: 1, dpsLocationId: 'abc-123' }]),
}
