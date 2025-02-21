import createUser from '../testutils/createUser'
import ReferenceDataService from './referenceDataService'
import LocationsInsidePrisonApiClient from '../data/locationsInsidePrisonApiClient'
import { Location, ResidentialHierarchy } from '../@types/locationsInsidePrisonApi/types'
import BookAVideoLinkApiClient from '../data/bookAVideoLinkApiClient'
import ActivitiesAndAppointmentsApiClient from '../data/activitiesAndAppointmentsApiClient'
import { Court, ProbationTeam } from '../@types/bookAVideoLinkApi/types'

jest.mock('../data/locationsInsidePrisonApiClient')
jest.mock('../data/activitiesAndAppointmentsApiClient')
jest.mock('../data/bookAVideoLinkApiClient')

const user = createUser([])

describe('Reference data service', () => {
  let locationsInsidePrisonApiClient: jest.Mocked<LocationsInsidePrisonApiClient>
  let activitiesAndAppointmentsApiClient: jest.Mocked<ActivitiesAndAppointmentsApiClient>
  let bookAVideoLinkApiClient: jest.Mocked<BookAVideoLinkApiClient>
  let referenceDataService: ReferenceDataService

  beforeEach(() => {
    locationsInsidePrisonApiClient = new LocationsInsidePrisonApiClient() as jest.Mocked<LocationsInsidePrisonApiClient>
    activitiesAndAppointmentsApiClient =
      new ActivitiesAndAppointmentsApiClient() as jest.Mocked<ActivitiesAndAppointmentsApiClient>
    bookAVideoLinkApiClient = new BookAVideoLinkApiClient() as jest.Mocked<BookAVideoLinkApiClient>

    referenceDataService = new ReferenceDataService(
      locationsInsidePrisonApiClient,
      activitiesAndAppointmentsApiClient,
      bookAVideoLinkApiClient,
    )
  })

  describe('getAppointmentLocations', () => {
    it('Retrieves the location by its nomis ID', async () => {
      locationsInsidePrisonApiClient.getAppointmentLocations.mockResolvedValue([{ id: 'abc-123' } as Location])

      const result = await referenceDataService.getAppointmentLocations('MDI', user)

      expect(result).toEqual([{ id: 'abc-123' }])
      expect(locationsInsidePrisonApiClient.getAppointmentLocations).toHaveBeenCalledWith('MDI', user)
    })
  })

  describe('getAppointmentCategories', () => {
    it('Fetches the video link appointment categories', async () => {
      activitiesAndAppointmentsApiClient.getAppointmentCategories.mockResolvedValue([
        { code: 'CHAP', description: 'Chaplaincy' },
        { code: 'VLB', description: 'Video Link - Court Hearing' },
        { code: 'VLPM', description: 'Video Link - Probation Meeting' },
        { code: 'VLOO', description: 'Video Link - Official Other' },
      ])

      const result = await referenceDataService.getAppointmentCategories(user)

      expect(result).toEqual([
        { code: 'VLB', description: 'Video Link - Court Hearing' },
        { code: 'VLPM', description: 'Video Link - Probation Meeting' },
        { code: 'VLOO', description: 'Video Link - Official Other' },
      ])
      expect(activitiesAndAppointmentsApiClient.getAppointmentCategories).toHaveBeenCalledWith(user)
    })
  })

  describe('getCellsByWing', () => {
    it('Fetches a list of cell locations grouped by residential wing for a prison', async () => {
      locationsInsidePrisonApiClient.getResidentialHierarchy.mockResolvedValue([
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
        {
          locationType: 'WING',
          fullLocationPath: 'C',
          localName: 'C Wing',
          subLocations: undefined,
        },
      ] as ResidentialHierarchy[])

      const result = await referenceDataService.getCellsByWing('MDI', user)

      expect(result).toEqual([
        { localName: 'A Wing', fullLocationPath: 'A', cells: ['A-1-001', 'A-1-002', 'A-2-001'] },
        { localName: 'B Wing', fullLocationPath: 'B', cells: ['B-1-001'] },
        { localName: 'C Wing', fullLocationPath: 'C', cells: [] },
      ])
      expect(locationsInsidePrisonApiClient.getResidentialHierarchy).toHaveBeenCalledWith('MDI', user)
    })
  })

  describe('getCourtsAndProbationTeams', () => {
    it('Fetches combined list of courts and probation teams', async () => {
      bookAVideoLinkApiClient.getCourts.mockResolvedValue([
        { code: 'ABERCV', description: 'Aberystwyth Civil' },
        { code: 'MANCM', description: 'Manchester Magistrates' },
      ] as Court[])

      bookAVideoLinkApiClient.getProbationTeams.mockResolvedValue([
        { code: 'BLAKPP', description: 'Blackpool - Probation' },
      ] as ProbationTeam[])

      const result = await referenceDataService.getCourtsAndProbationTeams(user)

      expect(result).toStrictEqual([
        { code: 'ABERCV', description: 'Aberystwyth Civil' },
        { code: 'BLAKPP', description: 'Blackpool - Probation' },
        { code: 'MANCM', description: 'Manchester Magistrates' },
      ])
    })
  })
})
