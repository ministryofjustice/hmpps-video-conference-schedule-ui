import nock from 'nock'

import config from '../config'
import createUser from '../testutils/createUser'
import InMemoryTokenStore from './tokenStore/inMemoryTokenStore'
import ActivitiesAndAppointmentsApiClient from './activitiesAndAppointmentsApiClient'

jest.mock('./tokenStore/inMemoryTokenStore')

const user = createUser([])

describe('activitiesAndAppointmentsApiClient', () => {
  let fakeActivitiesAndAppointmentsApiClient: nock.Scope
  let activitiesAndAppointmentsApiClient: ActivitiesAndAppointmentsApiClient

  beforeEach(() => {
    fakeActivitiesAndAppointmentsApiClient = nock(config.apis.activitiesAndAppointmentsApi.url)
    activitiesAndAppointmentsApiClient = new ActivitiesAndAppointmentsApiClient()
    jest.spyOn(InMemoryTokenStore.prototype, 'getToken').mockResolvedValue('systemToken')
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('getAppointments', () => {
    it('should return data from api', async () => {
      const response = { data: 'data' }

      fakeActivitiesAndAppointmentsApiClient
        .post('/appointments/MDI/search', { startDate: '2024-12-12' })
        .matchHeader('authorization', `Bearer systemToken`)
        .matchHeader('Caseload-Id', `MDI`)
        .reply(200, response)

      const output = await activitiesAndAppointmentsApiClient.getAppointments(
        'MDI',
        { date: new Date('2024-12-12') },
        user,
      )
      expect(output).toEqual(response)
    })

    it('should return data from api when time slots are provided', async () => {
      const response = { data: 'data' }

      fakeActivitiesAndAppointmentsApiClient
        .post('/appointments/MDI/search', { startDate: '2024-12-12', timeSlots: ['AM', 'PM'] })
        .matchHeader('authorization', `Bearer systemToken`)
        .matchHeader('Caseload-Id', `MDI`)
        .reply(200, response)

      const output = await activitiesAndAppointmentsApiClient.getAppointments(
        'MDI',
        { date: new Date('2024-12-12'), timeSlots: ['AM', 'PM'] },
        user,
      )
      expect(output).toEqual(response)
    })
  })

  describe('isAppointmentsRolledOutAt', () => {
    it('should return a boolean', async () => {
      const response = { prisonLive: true }

      fakeActivitiesAndAppointmentsApiClient
        .get('/rollout/MDI')
        .matchHeader('authorization', `Bearer systemToken`)
        .reply(200, response)

      const output = await activitiesAndAppointmentsApiClient.isAppointmentsRolledOutAt('MDI', user)
      expect(output).toEqual(true)
    })
  })

  describe('getAppointmentCategories', () => {
    it('should return data from api', async () => {
      const response = { data: 'data' }

      fakeActivitiesAndAppointmentsApiClient
        .get('/appointment-categories')
        .matchHeader('authorization', `Bearer systemToken`)
        .matchHeader('Caseload-Id', `MDI`)
        .reply(200, response)

      const output = await activitiesAndAppointmentsApiClient.getAppointmentCategories(user)
      expect(output).toEqual(response)
    })
  })
})
