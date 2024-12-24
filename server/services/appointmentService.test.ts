import createUser from '../testutils/createUser'
import PrisonApiClient from '../data/prisonApiClient'
import AppointmentService from './appointmentService'
import { Appointment } from '../@types/prisonApi/types'

jest.mock('../data/prisonApiClient')

const user = createUser([])

describe('Appointment service', () => {
  let prisonApiClient: jest.Mocked<PrisonApiClient>
  let appointmentService: AppointmentService
  let appointments: Appointment[]

  beforeEach(() => {
    prisonApiClient = new PrisonApiClient() as jest.Mocked<PrisonApiClient>
    appointmentService = new AppointmentService(prisonApiClient)

    appointments = [
      { id: 1, appointmentTypeCode: 'VLB' },
      { id: 2, appointmentTypeCode: 'VLBP' },
      { id: 3, appointmentTypeCode: 'DVLBW' },
      { id: 4, appointmentTypeCode: 'CHAP' },
    ]
  })

  describe('getVideoLinkAppointments', () => {
    it('Retrieves retrieves appointments for a date and filters by VLBs', async () => {
      prisonApiClient.getAppointments.mockResolvedValue(appointments)

      const result = await appointmentService.getVideoLinkAppointments('MDI', new Date('2024-12-12'), user)

      expect(result).toEqual([
        { id: 1, appointmentTypeCode: 'VLB' },
        { id: 2, appointmentTypeCode: 'VLBP' },
      ])
      expect(prisonApiClient.getAppointments).toHaveBeenLastCalledWith('MDI', new Date('2024-12-12'), user)
    })
  })
})
