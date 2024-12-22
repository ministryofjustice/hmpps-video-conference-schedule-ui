import createUser from '../testutils/createUser'
import PrisonRegisterApiClient from '../data/prisonRegisterApiClient'
import PrisonService from './prisonService'
import { Prison } from '../@types/prisonRegisterApi/types'

jest.mock('../data/prisonRegisterApiClient')

describe('Prison service', () => {
  let prisonRegisterApiClient: jest.Mocked<PrisonRegisterApiClient>
  let prisonService: PrisonService

  beforeEach(() => {
    prisonRegisterApiClient = new PrisonRegisterApiClient() as jest.Mocked<PrisonRegisterApiClient>
    prisonService = new PrisonService(prisonRegisterApiClient)
  })

  describe('getPrison', () => {
    it('Retrieves the prison details by prison ID', async () => {
      prisonRegisterApiClient.getPrison.mockResolvedValue({ prisonName: 'Moorland (HMP)' } as Prison)

      const result = await prisonService.getPrison('MDI', createUser([]))

      expect(result.prisonName).toEqual('Moorland (HMP)')
    })
  })
})
