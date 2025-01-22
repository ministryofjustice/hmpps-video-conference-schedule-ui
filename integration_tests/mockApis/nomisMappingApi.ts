import { stubGet } from './wiremock'

export default {
  stubNomisMappingApiPing: () => stubGet('/nomis-mapping-api/health/ping'),
  stubGetLocationMapping: () =>
    stubGet('/nomis-mapping-api/api/locations/nomis/1', { nomisLocationId: 1, dpsLocationId: 'abc-123' }),
}
