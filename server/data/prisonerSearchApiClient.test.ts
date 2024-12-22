import nock, { RequestBodyMatcher } from 'nock'

import config from '../config'
import InMemoryTokenStore from './tokenStore/inMemoryTokenStore'
import createUser from '../testutils/createUser'
import PrisonerSearchApiClient from './prisonerSearchApiClient'

jest.mock('./tokenStore/inMemoryTokenStore')

const user = createUser([])

describe('prisonerSearchApiClient', () => {
  let fakePrisonerSearchApiClient: nock.Scope
  let prisonerSearchApiClient: PrisonerSearchApiClient

  beforeEach(() => {
    fakePrisonerSearchApiClient = nock(config.apis.prisonerSearchApi.url)
    prisonerSearchApiClient = new PrisonerSearchApiClient()
    jest.spyOn(InMemoryTokenStore.prototype, 'getToken').mockResolvedValue('systemToken')
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('getByPrisonerNumbers', () => {
    it('should return data from api', async () => {
      const response = [{ data: 'data' }]

      fakePrisonerSearchApiClient
        .post('/prisoner-search/prisoner-numbers', { prisonerNumbers: ['ABC123'] } as RequestBodyMatcher)
        .matchHeader('authorization', `Bearer systemToken`)
        .reply(200, response)

      const output = await prisonerSearchApiClient.getByPrisonerNumbers(['ABC123'], user)
      expect(output).toEqual(response)
    })

    it('should return empty list by default', async () => {
      const response = <unknown>[]
      const output = await prisonerSearchApiClient.getByPrisonerNumbers([], user)
      expect(output).toEqual(response)
    })
  })
})
