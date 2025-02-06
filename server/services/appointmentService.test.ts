import createUser from '../testutils/createUser'
import PrisonApiClient from '../data/prisonApiClient'
import AppointmentService from './appointmentService'
import { Appointment as PrisonApiAppointment } from '../@types/prisonApi/types'
import { Appointment as ActivitiesAndAppointmentsApiAppointment } from '../@types/activitiesAndAppointmentsApi/types'
import ActivitiesAndAppointmentsApiClient from '../data/activitiesAndAppointmentsApiClient'

jest.mock('../data/prisonApiClient')
jest.mock('../data/activitiesAndAppointmentsApiClient')

const user = createUser([])

describe('Appointment service', () => {
  let prisonApiClient: jest.Mocked<PrisonApiClient>
  let appointmentsApiClient: jest.Mocked<ActivitiesAndAppointmentsApiClient>
  let appointmentService: AppointmentService
  let prisonApiAppointments: PrisonApiAppointment[]
  let appointmentsApiAppointments: ActivitiesAndAppointmentsApiAppointment[]

  beforeEach(() => {
    prisonApiClient = new PrisonApiClient() as jest.Mocked<PrisonApiClient>
    appointmentsApiClient = new ActivitiesAndAppointmentsApiClient() as jest.Mocked<ActivitiesAndAppointmentsApiClient>
    appointmentService = new AppointmentService(prisonApiClient, appointmentsApiClient)

    prisonApiAppointments = [
      {
        id: 1,
        date: '2024-12-12',
        offenderNo: 'ABC123',
        appointmentTypeCode: 'VLBP',
        startTime: '2024-12-12T09:00:00Z',
      },
      {
        id: 2,
        date: '2024-12-12',
        offenderNo: 'ABC123',
        appointmentTypeCode: 'DVLBW',
        startTime: '2024-12-12T10:00:00Z',
        endTime: '2024-12-12T11:00:00Z',
      },
      {
        id: 3,
        date: '2024-12-12',
        offenderNo: 'ABC123',
        appointmentTypeCode: 'CHAP',
        startTime: '2024-12-12T11:00:00Z',
        endTime: '2024-12-12T12:00:00Z',
      },
      {
        id: 4,
        date: '2024-12-12',
        offenderNo: 'ZYX321',
        appointmentTypeCode: 'VLB',
        startTime: '2024-12-12T08:00:00Z',
        endTime: '2024-12-12T09:00:00Z',
      },
    ]

    appointmentsApiAppointments = [
      {
        appointmentId: 1,
        attendees: [{ prisonerNumber: 'ABC123' }, { prisonerNumber: 'ZXY321' }],
        category: { code: 'VLBP', description: 'Video Link - Probation Meeting' },
        customName: 'Test probation meeting',
        inCell: true,
        startDate: '2024-12-12',
        startTime: '09:00',
        endTime: '10:00',
        createdTime: '2024-12-21T10:43:00Z',
      },
      {
        appointmentId: 2,
        attendees: [{ prisonerNumber: 'ABC123' }, { prisonerNumber: 'ZXY321' }],
        category: { code: 'DVLBW' },
        startDate: '2024-12-12',
        startTime: '10:00',
        endTime: '11:00',
        createdTime: '2024-12-21T12:30:00Z',
      },
      {
        appointmentId: 3,
        attendees: [{ prisonerNumber: 'ABC123' }, { prisonerNumber: 'ZXY321' }],
        category: { code: 'CHAP' },
        startDate: '2024-12-12',
        startTime: '11:00',
        endTime: '12:00',
        createdTime: '2024-12-22T13:24:00Z',
      },
      {
        appointmentId: 4,
        attendees: [{ prisonerNumber: 'ABC123' }, { prisonerNumber: 'ZXY321' }],
        category: { code: 'VLB', description: 'Video Link - Court Hearing' },
        internalLocation: { description: 'Video Link Room' },
        startDate: '2024-12-12',
        startTime: '08:00',
        endTime: '09:00',
        createdTime: '2024-12-22T17:54:00Z',
        updatedTime: '2024-12-22T18:01:00Z',
      },
    ] as ActivitiesAndAppointmentsApiAppointment[]
  })

  describe('getVideoLinkAppointments', () => {
    it('Retrieves appointments for a date and filters by VLBs for a prison which does not have A&A rolled out', async () => {
      appointmentsApiClient.isAppointmentsRolledOutAt.mockResolvedValue(false)
      prisonApiClient.getAppointments.mockResolvedValue(prisonApiAppointments)

      const result = await appointmentService.getVideoLinkAppointments(
        'MDI',
        new Date('2024-12-12'),
        ['AM', 'PM'],
        user,
      )

      expect(result).toEqual([
        {
          id: 4,
          date: '2024-12-12',
          offenderNo: 'ZYX321',
          appointmentTypeCode: 'VLB',
          startTime: '08:00',
          endTime: '09:00',
          status: 'ACTIVE',
          viewAppointmentLink: 'http://localhost:3000/appointment-details/4',
        },
        {
          id: 1,
          date: '2024-12-12',
          offenderNo: 'ABC123',
          appointmentTypeCode: 'VLBP',
          startTime: '09:00',
          status: 'ACTIVE',
          viewAppointmentLink: 'http://localhost:3000/appointment-details/1',
        },
      ])

      expect(prisonApiClient.getAppointments).toBeCalledTimes(2)
      expect(prisonApiClient.getAppointments).toHaveBeenNthCalledWith(1, 'MDI', new Date('2024-12-12'), 'AM', user)
      expect(prisonApiClient.getAppointments).toHaveBeenNthCalledWith(2, 'MDI', new Date('2024-12-12'), 'PM', user)
    })

    it('Retrieves appointments for a date and filters by VLBs for a prison which is rolled out with A&A', async () => {
      appointmentsApiClient.isAppointmentsRolledOutAt.mockResolvedValue(true)
      appointmentsApiClient.getAppointments.mockResolvedValue(appointmentsApiAppointments)

      const result = await appointmentService.getVideoLinkAppointments(
        'MDI',
        new Date('2024-12-12'),
        ['AM', 'PM'],
        user,
      )

      expect(result).toEqual([
        {
          createdTime: '2024-12-22T17:54:00Z',
          date: '2024-12-12',
          id: 4,
          offenderNo: 'ABC123',
          appointmentTypeCode: 'VLB',
          appointmentTypeDescription: 'Video Link - Court Hearing',
          locationDescription: 'Video Link Room',
          startTime: '08:00',
          endTime: '09:00',
          status: 'ACTIVE',
          updatedTime: '2024-12-22T18:01:00Z',
          viewAppointmentLink: 'http://localhost:3000/appointments/4',
        },
        {
          createdTime: '2024-12-22T17:54:00Z',
          date: '2024-12-12',
          id: 4,
          offenderNo: 'ZXY321',
          appointmentTypeCode: 'VLB',
          appointmentTypeDescription: 'Video Link - Court Hearing',
          locationDescription: 'Video Link Room',
          startTime: '08:00',
          endTime: '09:00',
          status: 'ACTIVE',
          updatedTime: '2024-12-22T18:01:00Z',
          viewAppointmentLink: 'http://localhost:3000/appointments/4',
        },
        {
          createdTime: '2024-12-21T10:43:00Z',
          date: '2024-12-12',
          id: 1,
          offenderNo: 'ABC123',
          appointmentTypeCode: 'VLBP',
          appointmentTypeDescription: 'Test probation meeting (Video Link - Probation Meeting)',
          locationDescription: 'In cell',
          startTime: '09:00',
          endTime: '10:00',
          status: 'ACTIVE',
          viewAppointmentLink: 'http://localhost:3000/appointments/1',
        },
        {
          createdTime: '2024-12-21T10:43:00Z',
          date: '2024-12-12',
          id: 1,
          offenderNo: 'ZXY321',
          appointmentTypeCode: 'VLBP',
          appointmentTypeDescription: 'Test probation meeting (Video Link - Probation Meeting)',
          locationDescription: 'In cell',
          startTime: '09:00',
          endTime: '10:00',
          status: 'ACTIVE',
          viewAppointmentLink: 'http://localhost:3000/appointments/1',
        },
      ])

      expect(appointmentsApiClient.getAppointments).toHaveBeenCalledTimes(1)
      expect(appointmentsApiClient.getAppointments).toHaveBeenLastCalledWith(
        'MDI',
        { date: new Date('2024-12-12'), timeSlots: ['AM', 'PM'] },
        user,
      )
    })
  })
})
