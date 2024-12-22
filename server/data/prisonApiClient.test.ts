import nock from 'nock'

import config from '../config'
import createUser from '../testutils/createUser'
import PrisonApiClient from './prisonApiClient'
import InMemoryTokenStore from './tokenStore/inMemoryTokenStore'

jest.mock('./tokenStore/inMemoryTokenStore')

const user = createUser([])

describe('prisonApiClient', () => {
  let fakePrisonApiClient: nock.Scope
  let prisonApiClient: PrisonApiClient

  beforeEach(() => {
    fakePrisonApiClient = nock(config.apis.prisonApi.url)
    prisonApiClient = new PrisonApiClient()
    jest.spyOn(InMemoryTokenStore.prototype, 'getToken').mockResolvedValue('systemToken')
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('getScheduledAppointments', () => {
    it('should return data from api', async () => {
      const response = { data: 'data' }

      fakePrisonApiClient
        .get('/api/schedules/MDI/appointments?date=2024-12-12')
        .matchHeader('authorization', `Bearer systemToken`)
        .reply(200, response)

      const output = await prisonApiClient.getScheduledAppointments('MDI', new Date('2024-12-12'), user)
      expect(output).toEqual(response)
    })
  })
})
