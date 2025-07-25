import { stubGet, stubPost } from './wiremock'

export default {
  stubNomisMappingApiPing: () => stubGet('/nomis-mapping-api/health/ping'),
  stubGetLocationMapping: () =>
    stubPost('/nomis-mapping-api/api/locations/nomis', [
      { nomisLocationId: 67126, dpsLocationId: '1c7d77da-3193-45ef-81a9-1e2f4d9ad54e' },
    ]),
}
