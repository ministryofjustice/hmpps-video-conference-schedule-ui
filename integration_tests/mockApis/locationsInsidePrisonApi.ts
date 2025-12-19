import type { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

export default {
  stubPing: (httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/locations-inside-prison-api/health/ping',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { status: httpStatus === 200 ? 'UP' : 'DOWN' },
      },
    }),
  stubGetAppointmentLocations: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern:
          '/locations-inside-prison-api/locations/prison/MDI/non-residential-usage-type/APPOINTMENT\\?formatLocalName=true&sortByLocalName=true',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [],
      },
    }),
  stubGetResidentialHierarchy: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/locations-inside-prison-api/locations/prison/MDI/residential-hierarchy',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            locationType: 'WING',
            fullLocationPath: 'A',
            localName: 'A Wing',
            subLocations: [
              {
                locationType: 'LANDING',
                fullLocationPath: 'A-1',
                subLocations: [
                  {
                    locationType: 'CELL',
                    fullLocationPath: 'A-1-001',
                  },
                  {
                    locationType: 'CELL',
                    fullLocationPath: 'A-1-002',
                  },
                ],
              },
              {
                locationType: 'LANDING',
                fullLocationPath: 'A-2',
                subLocations: [
                  {
                    locationType: 'CELL',
                    fullLocationPath: 'A-2-001',
                  },
                ],
              },
            ],
          },
          {
            locationType: 'WING',
            fullLocationPath: 'B',
            localName: 'B Wing',
            subLocations: [
              {
                locationType: 'LANDING',
                fullLocationPath: 'B-1',
                subLocations: [
                  {
                    locationType: 'CELL',
                    fullLocationPath: 'B-1-001',
                  },
                ],
              },
            ],
          },
        ],
      },
    }),
}
