import { stubGet } from './wiremock'

export default {
  stubLocationsInsidePrisonApiPing: () => stubGet('/locations-inside-prison-api/health/ping'),
  stubGetAppointmentLocations: () =>
    stubGet(
      '/locations-inside-prison-api/locations/prison/MDI/non-residential-usage-type/APPOINTMENT\\?formatLocalName=true&sortByLocalName=true',
      [],
    ),
  stubGetResidentialHierarchy: () =>
    stubGet('/locations-inside-prison-api/locations/prison/MDI/residential-hierarchy', [
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
    ]),
}
