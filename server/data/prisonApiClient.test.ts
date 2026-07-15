import nock from 'nock'

import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import createUser from '../testutils/createUser'
import PrisonApiClient from './prisonApiClient'
import InMemoryTokenStore from './tokenStore/inMemoryTokenStore'

jest.mock('./tokenStore/inMemoryTokenStore')

const user = createUser([])

describe('prisonApiClient', () => {
  let fakePrisonApiClient: nock.Scope
  let mockAuthenticationClient: jest.Mocked<AuthenticationClient>
  let prisonApiClient: PrisonApiClient

  beforeEach(() => {
    mockAuthenticationClient = {
      getToken: jest.fn().mockResolvedValue('systemToken'),
    } as unknown as jest.Mocked<AuthenticationClient>

    fakePrisonApiClient = nock(config.apis.prisonApi.url)
    prisonApiClient = new PrisonApiClient(mockAuthenticationClient)
    jest.spyOn(InMemoryTokenStore.prototype, 'getToken').mockResolvedValue('systemToken')
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('getAppointments', () => {
    it('should return data from api', async () => {
      const response = { data: 'data' }

      fakePrisonApiClient
        .get('/api/schedules/MDI/appointments?date=2024-12-12')
        .matchHeader('authorization', `Bearer systemToken`)
        .reply(200, response)

      const output = await prisonApiClient.getAppointments('MDI', new Date('2024-12-12'), user)
      expect(output).toEqual(response)
    })
  })
})
