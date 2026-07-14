import nock, { RequestBodyMatcher } from 'nock'

import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import createUser from '../testutils/createUser'
import InMemoryTokenStore from './tokenStore/inMemoryTokenStore'
import OfficialVisitsApiClient from './officialVisitsApiClient'
import { OfficialVisit } from '../@types/officialVisitsApi/types'
import { mockOfficialVisit, mockOfficialVisitSearchResults } from '../testutils/mocks'

jest.mock('./tokenStore/inMemoryTokenStore')

const user = createUser([])

describe('prisonApiClient', () => {
  let fakeOfficialVisitsApiClient: nock.Scope
  let mockAuthenticationClient: jest.Mocked<AuthenticationClient>
  let officialVisitsApiClient: OfficialVisitsApiClient

  beforeEach(() => {
    mockAuthenticationClient = {
      getToken: jest.fn().mockResolvedValue('systemToken'),
    } as unknown as jest.Mocked<AuthenticationClient>

    fakeOfficialVisitsApiClient = nock(config.apis.officialVisitsApi.url)
    officialVisitsApiClient = new OfficialVisitsApiClient(mockAuthenticationClient)
    jest.spyOn(InMemoryTokenStore.prototype, 'getToken').mockResolvedValue('systemToken')
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('getOfficialVisits', () => {
    it('should return data from api', async () => {
      const onDate = '2024-12-12'
      const prisonCode = 'AAA'
      const expected = [mockOfficialVisit] as OfficialVisit[]

      fakeOfficialVisitsApiClient
        .post(`/official-visit/prison/${prisonCode}/find-by-criteria?page=0&size=200`, {
          startDate: onDate,
          endDate: onDate,
          visitTypes: ['VIDEO'],
        } as RequestBodyMatcher)
        .matchHeader('authorization', 'Bearer systemToken')
        .reply(200, mockOfficialVisitSearchResults)

      const response = await officialVisitsApiClient.getOfficialVisits(prisonCode, new Date(onDate), user)
      expect(response).toEqual(expected)
    })
  })
})
