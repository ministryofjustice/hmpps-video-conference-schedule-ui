import createUser from '../testutils/createUser'
import PrisonRegisterApiClient from '../data/prisonRegisterApiClient'
import PrisonService from './prisonService'
import { Prison } from '../@types/prisonRegisterApi/types'
import ActivitiesAndAppointmentsApiClient from '../data/activitiesAndAppointmentsApiClient'

jest.mock('../data/prisonRegisterApiClient')
jest.mock('../data/activitiesAndAppointmentsApiClient')

describe('Prison service', () => {
  let prisonRegisterApiClient: jest.Mocked<PrisonRegisterApiClient>
  let activitiesAndAppointmentsApiClient: jest.Mocked<ActivitiesAndAppointmentsApiClient>
  let prisonService: PrisonService

  beforeEach(() => {
    prisonRegisterApiClient = new PrisonRegisterApiClient() as jest.Mocked<PrisonRegisterApiClient>
    activitiesAndAppointmentsApiClient =
      new ActivitiesAndAppointmentsApiClient() as jest.Mocked<ActivitiesAndAppointmentsApiClient>
    prisonService = new PrisonService(prisonRegisterApiClient, activitiesAndAppointmentsApiClient)
  })

  describe('getPrison', () => {
    it('Retrieves the prison details by prison ID', async () => {
      prisonRegisterApiClient.getPrison.mockResolvedValue({ prisonName: 'Moorland (HMP)' } as Prison)

      const result = await prisonService.getPrison('MDI', createUser([]))

      expect(result.prisonName).toEqual('Moorland (HMP)')
    })
  })

  describe('isAppointmentsRolledOutAt', () => {
    it('Returns whether the prison is rolled out for A&A by prison code', async () => {
      activitiesAndAppointmentsApiClient.isAppointmentsRolledOutAt.mockResolvedValue(true)

      const result = await prisonService.isAppointmentsRolledOutAt('MDI', createUser([]))

      expect(result).toEqual(true)
    })
  })
})
