import nock from 'nock'
import config from '../config'
import InMemoryTokenStore from './tokenStore/inMemoryTokenStore'
import BookAVideoLinkApiClient from './bookAVideoLinkApiClient'
import createUser from '../testutils/createUser'

jest.mock('./tokenStore/inMemoryTokenStore')

const user = createUser([])

describe('bookAVideoLinkApiClient', () => {
  let fakeBookAVideoLinkApiClient: nock.Scope
  let bookAVideoLinkApiClient: BookAVideoLinkApiClient

  beforeEach(() => {
    fakeBookAVideoLinkApiClient = nock(config.apis.bookAVideoLinkApi.url)
    bookAVideoLinkApiClient = new BookAVideoLinkApiClient()
    jest.spyOn(InMemoryTokenStore.prototype, 'getToken').mockResolvedValue('systemToken')
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('getVideoLinkAppointments', () => {
    it('should return data from api', async () => {
      const response = { data: 'data' }

      fakeBookAVideoLinkApiClient
        .get('/schedule/prison/MDI?date=2024-07-12&includeCancelled=true')
        .matchHeader('authorization', `Bearer systemToken`)
        .reply(200, response)

      const output = await bookAVideoLinkApiClient.getVideoLinkAppointments('MDI', new Date('2024-07-12'), user)
      expect(output).toEqual(response)
    })
  })

  describe('getCourts', () => {
    it('should return data from api', async () => {
      const response = { data: 'data' }

      fakeBookAVideoLinkApiClient.get('/courts').matchHeader('authorization', `Bearer systemToken`).reply(200, response)

      const output = await bookAVideoLinkApiClient.getCourts(user)
      expect(output).toEqual(response)
    })
  })

  describe('getProbationTeams', () => {
    it('should return data from api', async () => {
      const response = { data: 'data' }

      fakeBookAVideoLinkApiClient
        .get('/probation-teams')
        .matchHeader('authorization', `Bearer systemToken`)
        .reply(200, response)

      const output = await bookAVideoLinkApiClient.getProbationTeams(user)
      expect(output).toEqual(response)
    })
  })
})
