import OfficialVisitsApiClient from '../data/officialVisitsApiClient'
import OfficialVisitsService from './officialVisitsService'
import createUser, { createHmppsUser } from '../testutils/createUser'
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

  describe('isPermittedToViewOfficialVisit', () => {
    it('express user is not permitted to view visits', async () => {
      const result = officialVisitsService.isPermittedToViewOfficialVisit(createUser([]))

      expect(result).toEqual(false)
    })

    it('hmpps user is not permitted to view visits', async () => {
      const result = officialVisitsService.isPermittedToViewOfficialVisit(createHmppsUser([]))

      expect(result).toEqual(false)
    })

    it('hmpps user with view role is permitted to view visits', async () => {
      const result = officialVisitsService.isPermittedToViewOfficialVisit(createHmppsUser([], ['OFFVIS_VIEW_ONLY']))

      expect(result).toEqual(true)
    })

    it('hmpps user with manage role is permitted to view visits', async () => {
      const result = officialVisitsService.isPermittedToViewOfficialVisit(createHmppsUser([], ['OFFVIS_MANAGE']))

      expect(result).toEqual(true)
    })
  })
})
