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

  describe('getReferenceCodesForGroup', () => {
    it('should return data from api', async () => {
      const response = { data: 'data' }

      fakeBookAVideoLinkApiClient
        .get('/reference-codes/group/GROUP')
        .matchHeader('authorization', `Bearer systemToken`)
        .reply(200, response)

      const output = await bookAVideoLinkApiClient.getReferenceCodesForGroup('GROUP', user)
      expect(output).toEqual(response)
    })
  })

  describe('getScheduledVideoLinkBookings', () => {
    it('should return data from api', async () => {
      const response = { data: 'data' }

      fakeBookAVideoLinkApiClient
        .get('/schedule/prison/MDI?date=2024-07-12')
        .matchHeader('authorization', `Bearer systemToken`)
        .reply(200, response)

      const output = await bookAVideoLinkApiClient.getScheduledVideoLinkBookings('MDI', new Date('2024-07-12'), user)
      expect(output).toEqual(response)
    })
  })
})
