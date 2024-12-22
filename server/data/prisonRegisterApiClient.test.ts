import nock from 'nock'

import config from '../config'
import createUser from '../testutils/createUser'
import PrisonRegisterApiClient from './prisonRegisterApiClient'
import InMemoryTokenStore from './tokenStore/inMemoryTokenStore'

jest.mock('./tokenStore/inMemoryTokenStore')

const user = createUser([])

describe('prisonRegisterApiClient', () => {
  let fakePrisonRegisterApiClient: nock.Scope
  let prisonRegisterApiClient: PrisonRegisterApiClient

  beforeEach(() => {
    fakePrisonRegisterApiClient = nock(config.apis.prisonRegisterApi.url)
    prisonRegisterApiClient = new PrisonRegisterApiClient()
    jest.spyOn(InMemoryTokenStore.prototype, 'getToken').mockResolvedValue('systemToken')
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('getPrison', () => {
    it('should return data from api', async () => {
      const response = { data: 'data' }

      fakePrisonRegisterApiClient
        .get('/prisons/id/MDI')
        .matchHeader('authorization', `Bearer systemToken`)
        .reply(200, response)

      const output = await prisonRegisterApiClient.getPrison('MDI', user)
      expect(output).toEqual(response)
    })
  })
})
