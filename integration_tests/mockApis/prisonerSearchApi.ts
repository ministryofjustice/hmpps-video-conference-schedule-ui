import type { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

export default {
  stubPing: (httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/prisoner-search-api/health/ping',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { status: httpStatus === 200 ? 'UP' : 'DOWN' },
      },
    }),
  stubGetPrisoners: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: '/prisoner-search-api/prisoner-search/prisoner-numbers',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
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
        ],
      },
    }),
}
