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
    ]),
}
