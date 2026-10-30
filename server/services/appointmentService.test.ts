import createUser from '../testutils/createUser'
import AppointmentService from './appointmentService'
import { Appointment as ActivitiesAndAppointmentsApiAppointment } from '../@types/activitiesAndAppointmentsApi/types'
import ActivitiesAndAppointmentsApiClient from '../data/activitiesAndAppointmentsApiClient'
import BookAVideoLinkApiClient from '../data/bookAVideoLinkApiClient'
import { BvlsAppointment, Prison } from '../@types/bookAVideoLinkApi/types'

jest.mock('../data/activitiesAndAppointmentsApiClient')
jest.mock('../data/bookAVideoLinkApiClient')

const user = createUser([])

describe('Appointment service', () => {
  let appointmentsApiClient: jest.Mocked<ActivitiesAndAppointmentsApiClient>
  let bookAVideoLinkApiClient: jest.Mocked<BookAVideoLinkApiClient>
  let appointmentService: AppointmentService
  let bvlsAppointments: BvlsAppointment[]
  let appointmentsApiAppointments: ActivitiesAndAppointmentsApiAppointment[]

  beforeEach(() => {
    appointmentsApiClient = new ActivitiesAndAppointmentsApiClient(
      null,
    ) as jest.Mocked<ActivitiesAndAppointmentsApiClient>
    bookAVideoLinkApiClient = new BookAVideoLinkApiClient(null) as jest.Mocked<BookAVideoLinkApiClient>
    appointmentService = new AppointmentService(appointmentsApiClient, bookAVideoLinkApiClient)

    bvlsAppointments = [
      {
        prisonAppointmentId: 1,
        prisonerNumber: 'ABC123',
        statusCode: 'ACTIVE',
        startTime: '07:45',
        endTime: '08:00',
        appointmentTypeDescription: 'Court - main hearing',
        dpsLocationId: 'abc-123',
        prisonLocDesc: 'Video link room',
        createdTime: '2024-12-22T17:54:00Z',
        updatedTime: '2024-12-22T18:01:00Z',
        updatedBy: 'jsmith',
      },
      {
        prisonAppointmentId: 2,
        prisonerNumber: 'ZYX321',
        statusCode: 'CANCELLED',
        startTime: '20:00',
        endTime: '21:00',
        appointmentTypeDescription: 'Court - main hearing',
        dpsLocationId: 'abc-123',
        prisonLocDesc: 'Video link room',
        createdTime: '2024-12-22T17:54:00Z',
        updatedTime: '2024-12-22T18:01:00Z',
        updatedBy: 'jsmith',
      },
    ] as BvlsAppointment[]

    appointmentsApiAppointments = [
      {
        appointmentId: 1,
        attendees: [{ prisonerNumber: 'ABC123' }],
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
        attendees: [{ prisonerNumber: 'ABC123' }],
        category: { code: 'VLB', description: 'Video Link - Court Hearing' },
        internalLocation: { description: 'Video Link Room', dpsLocationId: '00000000-0000-0000-0000-000000000000' },
        startDate: '2024-12-12',
        startTime: '08:00',
        endTime: '09:00',
        createdTime: '2024-12-22T17:54:00Z',
        updatedTime: '2024-12-22T18:01:00Z',
      },
      {
        appointmentId: 5,
        attendees: [{ prisonerNumber: 'ABC123' }],
        category: { code: 'VLLA', description: 'Video Link Legal Appointment' },
        internalLocation: { description: 'Video Link Room', dpsLocationId: '00000000-0000-0000-0000-000000000000' },
        startDate: '2024-12-12',
        startTime: '13:00',
        endTime: '14:00',
        isCancelled: true,
        createdTime: '2024-12-11T09:00:00Z',
        updatedTime: '2024-12-11T10:00:00Z',
        cancelledTime: '2024-12-11T10:00:00Z',
        cancelledBy: 'Bob',
      },
      {
        appointmentId: 6,
        attendees: [{ prisonerNumber: 'ABC123' }],
        category: { code: 'VLLA', description: 'Video Link Legal Appointment' },
        internalLocation: { description: 'Video Link Room', dpsLocationId: '00000000-0000-0000-0000-000000000000' },
        startDate: '2024-12-12',
        startTime: '15:00',
        endTime: '16:00',
        isDeleted: true,
        createdTime: '2024-12-11T09:00:00Z',
        updatedTime: '2024-12-11T10:00:00Z',
        cancelledTime: '2024-12-11T10:00:00Z',
        cancelledBy: 'Fred',
        extraInformation: 'notes for staff',
      },
    ] as ActivitiesAndAppointmentsApiAppointment[]

    bookAVideoLinkApiClient.getVideoLinkAppointments.mockResolvedValue(bvlsAppointments)
    appointmentsApiClient.getAppointments.mockResolvedValue(appointmentsApiAppointments)
  })

  describe('getVideoLinkAppointments', () => {
    it('Retrieves appointments for a date and filters by VLBs for prison', async () => {
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
          dpsLocationId: '00000000-0000-0000-0000-000000000000',
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
          date: '2024-12-12',
          id: 5,
          offenderNo: 'ABC123',
          appointmentTypeCode: 'VLLA',
          appointmentTypeDescription: 'Video Link Legal Appointment',
          locationDescription: 'Video Link Room',
          startTime: '13:00',
          endTime: '14:00',
          status: 'CANCELLED',
          createdTime: '2024-12-11T09:00:00Z',
          updatedTime: '2024-12-11T10:00:00Z',
          cancelledTime: '2024-12-11T10:00:00Z',
          cancelledBy: 'Bob',
          dpsLocationId: '00000000-0000-0000-0000-000000000000',
          viewAppointmentLink: 'http://localhost:3000/appointments/5',
        },
        {
          date: '2024-12-12',
          id: 6,
          offenderNo: 'ABC123',
          appointmentTypeCode: 'VLLA',
          appointmentTypeDescription: 'Video Link Legal Appointment',
          locationDescription: 'Video Link Room',
          startTime: '15:00',
          endTime: '16:00',
          status: 'CANCELLED',
          createdTime: '2024-12-11T09:00:00Z',
          updatedTime: '2024-12-11T10:00:00Z',
          cancelledTime: '2024-12-11T10:00:00Z',
          cancelledBy: 'Fred',
          dpsLocationId: '00000000-0000-0000-0000-000000000000',
          viewAppointmentLink: 'http://localhost:3000/appointments/6',
          notesForStaff: 'notes for staff',
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

  describe('getPrison', () => {
    it('should get prison', async () => {
      const expectedPrison: Prison = {
        prisonId: 1,
        code: 'MDI',
        name: 'Moorland (HMP)',
        enabled: true,
        pickUpTime: 30,
      }

      bookAVideoLinkApiClient.getPrison.mockResolvedValue(expectedPrison)

      const actualPrison = await appointmentService.getPrison('MDI', user)

      expect(actualPrison).toEqual(expectedPrison)
    })
  })
})
