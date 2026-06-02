import OfficialVisitsApiClient from '../data/officialVisitsApiClient'
import OfficialVisitsService from './officialVisitsService'
import createUser from '../testutils/createUser'
import { mockOfficialVisit } from '../testutils/mocks'

jest.mock('../data/officialVisitsApiClient')

describe('Official visit service', () => {
  let officialVisitsApiClient: jest.Mocked<OfficialVisitsApiClient>
  let officialVisitsService: OfficialVisitsService

  beforeEach(() => {
    officialVisitsApiClient = new OfficialVisitsApiClient() as jest.Mocked<OfficialVisitsApiClient>
    officialVisitsService = new OfficialVisitsService(officialVisitsApiClient)
  })

  describe('getOfficialVisits', () => {
    it('gets official visits using API client', async () => {
      officialVisitsApiClient.getOfficialVisits.mockResolvedValue([mockOfficialVisit])
      const result = await officialVisitsService.getOfficialVisits('MDI', new Date('2024-12-12'), createUser([]))
      expect(result).toEqual([mockOfficialVisit])
    })
  })
})
