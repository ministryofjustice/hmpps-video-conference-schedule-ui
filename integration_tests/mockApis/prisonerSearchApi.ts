import { stubGet, stubPost } from './wiremock'

export default {
  stubPrisonerSearchApiPing: () => stubGet('/prisoner-search-api/health/ping'),
  stubGetPrisoners: () =>
    stubPost('/prisoner-search-api/prisoner-search/prisoner-numbers', [
      {
        prisonerNumber: 'G9566GQ',
        firstName: 'John',
        lastName: 'Smith',
        prisonId: 'MDI',
        cellLocation: 'MDI-1-1-001',
        alerts: [{ alertCode: 'XCU' }],
      },
      {
        prisonerNumber: 'W4356WE',
        firstName: 'Damire',
        lastName: 'Stoneheart',
        prisonId: 'MDI',
        cellLocation: 'MDI-3-4-001',
        alerts: [],
      },
      {
        prisonerNumber: 'B8965HE',
        firstName: 'Billy',
        lastName: 'Kid',
        prisonId: 'MDI',
        cellLocation: 'MDI-5-4-001',
        alerts: [],
      },
    ]),
}
