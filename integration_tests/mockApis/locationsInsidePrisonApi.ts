import { stubGet } from './wiremock'

export default {
  stubLocationsInsidePrisonApiPing: () => stubGet('/locations-inside-prison-api/health/ping'),
  stubGetLocation: () =>
    Promise.all([
      stubGet('/nomis-mapping-api/api/locations/nomis/1', { nomisLocationId: 1, dpsLocationId: 'abc-123' }),
      stubGet('/locations-inside-prison-api/locations/abc-123\\?(.)*', { key: 'ROOM_1' }),
    ]),
}
