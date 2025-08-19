import createUser from '../testutils/createUser'
import PrisonApiClient from '../data/prisonApiClient'
import AppointmentService, { Period } from './appointmentService'
import { Appointment as PrisonApiAppointment } from '../@types/prisonApi/types'
import { Appointment as ActivitiesAndAppointmentsApiAppointment } from '../@types/activitiesAndAppointmentsApi/types'
import ActivitiesAndAppointmentsApiClient from '../data/activitiesAndAppointmentsApiClient'
import BookAVideoLinkApiClient from '../data/bookAVideoLinkApiClient'
import { BvlsAppointment } from '../@types/bookAVideoLinkApi/types'

jest.mock('../data/prisonApiClient')
jest.mock('../data/activitiesAndAppointmentsApiClient')
jest.mock('../data/bookAVideoLinkApiClient')

const user = createUser([])

describe('Appointment service', () => {
  let prisonApiClient: jest.Mocked<PrisonApiClient>
  let appointmentsApiClient: jest.Mocked<ActivitiesAndAppointmentsApiClient>
  let bookAVideoLinkApiClient: jest.Mocked<BookAVideoLinkApiClient>
  let appointmentService: AppointmentService
  let prisonApiAppointments: PrisonApiAppointment[]
  let bvlsAppointments: BvlsAppointment[]
  let appointmentsApiAppointments: ActivitiesAndAppointmentsApiAppointment[]

  beforeEach(() => {
    prisonApiClient = new PrisonApiClient() as jest.Mocked<PrisonApiClient>
    appointmentsApiClient = new ActivitiesAndAppointmentsApiClient() as jest.Mocked<ActivitiesAndAppointmentsApiClient>
    bookAVideoLinkApiClient = new BookAVideoLinkApiClient() as jest.Mocked<BookAVideoLinkApiClient>
    appointmentService = new AppointmentService(prisonApiClient, appointmentsApiClient, bookAVideoLinkApiClient)

    prisonApiAppointments = [
      {
        id: 1,
        locationId: 1,
        locationDescription: 'Video link room',
        date: '2024-12-12',
        offenderNo: 'ABC123',
        appointmentTypeCode: 'VLBP',
        appointmentTypeDescription: 'Video Link - Probation Meeting',
        startTime: '2024-12-12T09:00:00Z',
      },
      {
        id: 2,
        locationId: 1,
        locationDescription: 'Video link room',
        date: '2024-12-12',
        offenderNo: 'ABC123',
        appointmentTypeCode: 'VISIT',
        appointmentTypeDescription: 'Visit',
        startTime: '2024-12-12T10:00:00Z',
        endTime: '2024-12-12T11:00:00Z',
      },
      {
        id: 3,
        locationId: 1,
        locationDescription: 'Video link room',
        date: '2024-12-12',
        offenderNo: 'ABC123',
        appointmentTypeCode: 'CHAP',
        appointmentTypeDescription: 'Chaplaincy',
        startTime: '2024-12-12T11:00:00Z',
        endTime: '2024-12-12T12:00:00Z',
      },
      {
        id: 4,
        locationId: 1,
        locationDescription: 'Video link room',
        date: '2024-12-12',
        offenderNo: 'ZYX321',
        appointmentTypeCode: 'VLB',
        appointmentTypeDescription: 'Video Link - Court Hearing',
        startTime: '2024-12-12T14:00:00Z',
        endTime: '2024-12-12T15:00:00Z',
      },
    ]

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
        internalLocation: { description: 'Video Link Room', dpsLocationId: '00000000-0000-0000-0000-000000000000' },
        startDate: '2024-12-12',
        startTime: '08:00',
        endTime: '09:00',
        createdTime: '2024-12-22T17:54:00Z',
        updatedTime: '2024-12-22T18:01:00Z',
      },
    ] as ActivitiesAndAppointmentsApiAppointment[]

    prisonApiClient.getAppointments.mockResolvedValue(prisonApiAppointments)
    bookAVideoLinkApiClient.getVideoLinkAppointments.mockResolvedValue(bvlsAppointments)
    appointmentsApiClient.getAppointments.mockResolvedValue(appointmentsApiAppointments)
  })

  describe('getVideoLinkAppointments', () => {
    it('Retrieves appointments for a date, filters by VLBs, and supplements cancelled BVLS appointments for a prison which does not have A&A rolled out', async () => {
      appointmentsApiClient.isAppointmentsRolledOutAt.mockResolvedValue(false)

      const result = await appointmentService.getVideoLinkAppointments('MDI', new Date('2024-12-12'), [], user)

      expect(result).toEqual([
        {
          id: 1,
          appointmentTypeCode: 'VLBP',
          appointmentTypeDescription: 'Video Link - Probation Meeting',
          date: '2024-12-12',
          startTime: '09:00',
          locationId: 1,
          locationDescription: 'Video link room',
          offenderNo: 'ABC123',
          status: 'ACTIVE',
          viewAppointmentLink: 'http://localhost:3000/appointment-details/1',
        },
        {
          id: 4,
          appointmentTypeCode: 'VLB',
          appointmentTypeDescription: 'Video Link - Court Hearing',
          date: '2024-12-12',
          startTime: '14:00',
          endTime: '15:00',
          locationId: 1,
          locationDescription: 'Video link room',
          offenderNo: 'ZYX321',
          status: 'ACTIVE',
          viewAppointmentLink: 'http://localhost:3000/appointment-details/4',
        },
        {
          id: 2,
          appointmentTypeCode: 'VL+',
          appointmentTypeDescription: 'Court - main hearing',
          startTime: '20:00',
          endTime: '21:00',
          dpsLocationId: 'abc-123',
          locationDescription: 'Video link room',
          offenderNo: 'ZYX321',
          status: 'CANCELLED',
          createdTime: '2024-12-22T17:54:00Z',
          updatedTime: '2024-12-22T18:01:00Z',
          cancelledTime: '2024-12-22T18:01:00Z',
          cancelledBy: 'jsmith',
        },
      ])

      expect(prisonApiClient.getAppointments).toHaveBeenLastCalledWith('MDI', new Date('2024-12-12'), user)
      expect(bookAVideoLinkApiClient.getVideoLinkAppointments).toHaveBeenLastCalledWith(
        'MDI',
        new Date('2024-12-12'),
        user,
      )
    })

    it.each(['AM', 'PM', 'ED'] as Period[])(
      'should filter appointments by %s time period correctly for a prison which does not have A&A rolled out ',
      async period => {
        appointmentsApiClient.isAppointmentsRolledOutAt.mockResolvedValue(false)

        const result = await appointmentService.getVideoLinkAppointments('MDI', new Date('2024-12-12'), [period], user)

        switch (period) {
          case 'AM':
            expect(result).toEqual([
              {
                id: 1,
                appointmentTypeCode: 'VLBP',
                appointmentTypeDescription: 'Video Link - Probation Meeting',
                date: '2024-12-12',
                startTime: '09:00',
                locationId: 1,
                locationDescription: 'Video link room',
                offenderNo: 'ABC123',
                status: 'ACTIVE',
                viewAppointmentLink: 'http://localhost:3000/appointment-details/1',
              },
            ])
            break
          case 'PM':
            expect(result).toEqual([
              {
                id: 4,
                appointmentTypeCode: 'VLB',
                appointmentTypeDescription: 'Video Link - Court Hearing',
                date: '2024-12-12',
                startTime: '14:00',
                endTime: '15:00',
                locationId: 1,
                locationDescription: 'Video link room',
                offenderNo: 'ZYX321',
                status: 'ACTIVE',
                viewAppointmentLink: 'http://localhost:3000/appointment-details/4',
              },
            ])
            break
          case 'ED':
            expect(result).toEqual([
              {
                id: 2,
                appointmentTypeCode: 'VL+',
                appointmentTypeDescription: 'Court - main hearing',
                startTime: '20:00',
                endTime: '21:00',
                dpsLocationId: 'abc-123',
                locationDescription: 'Video link room',
                offenderNo: 'ZYX321',
                status: 'CANCELLED',
                createdTime: '2024-12-22T17:54:00Z',
                updatedTime: '2024-12-22T18:01:00Z',
                cancelledTime: '2024-12-22T18:01:00Z',
                cancelledBy: 'jsmith',
              },
            ])
            break
          default:
            throw Error('Unsupported period')
        }
      },
    )

    it('Retrieves appointments for a date and filters by VLBs for a prison which is rolled out with A&A', async () => {
      appointmentsApiClient.isAppointmentsRolledOutAt.mockResolvedValue(true)

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
