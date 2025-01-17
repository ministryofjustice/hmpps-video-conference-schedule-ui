import createUser from '../testutils/createUser'
import AppointmentService, { Appointment } from './appointmentService'
import ScheduleService from './scheduleService'
import LocationsService from './locationsService'
import BookAVideoLinkApiClient from '../data/bookAVideoLinkApiClient'
import PrisonerSearchApiClient from '../data/prisonerSearchApiClient'
import { BvlsAppointment } from '../@types/bookAVideoLinkApi/types'
import { Prisoner } from '../@types/prisonerSearchApi/types'
import { Location } from '../@types/locationsInsidePrisonApi/types'

jest.mock('../services/appointmentService')
jest.mock('../services/locationsService')
jest.mock('../data/bookAVideoLinkApiClient')
jest.mock('../data/prisonerSearchApiClient')

const user = createUser([])

describe('Schedule service', () => {
  let appointmentService: jest.Mocked<AppointmentService>
  let locationsService: jest.Mocked<LocationsService>
  let bookAVideoLinkApiClient: jest.Mocked<BookAVideoLinkApiClient>
  let prisonerSearchApiClient: jest.Mocked<PrisonerSearchApiClient>

  let scheduleService: ScheduleService

  let appointments: Appointment[]
  let bvlsAppointments: BvlsAppointment[]
  let prisoners: Prisoner[]

  beforeEach(() => {
    appointmentService = new AppointmentService(null, null) as jest.Mocked<AppointmentService>
    locationsService = new LocationsService(null, null) as jest.Mocked<LocationsService>
    bookAVideoLinkApiClient = new BookAVideoLinkApiClient() as jest.Mocked<BookAVideoLinkApiClient>
    prisonerSearchApiClient = new PrisonerSearchApiClient() as jest.Mocked<PrisonerSearchApiClient>
    scheduleService = new ScheduleService(
      appointmentService,
      locationsService,
      bookAVideoLinkApiClient,
      prisonerSearchApiClient,
    )

    appointments = [
      {
        id: 1,
        offenderNo: 'ABC123',
        startTime: '07:45',
        endTime: '08:00',
        locationId: 1,
        locationDescription: 'ROOM 1',
        appointmentTypeDescription: 'Video Link - Court Hearing',
        status: 'ACTIVE',
        viewAppointmentLink: 'http://localhost:3000/appointment-details/1',
      },
      {
        id: 2,
        offenderNo: 'ABC123',
        startTime: '08:00',
        endTime: '09:00',
        locationId: 1,
        locationDescription: 'ROOM 1',
        appointmentTypeDescription: 'Video Link - Court Hearing',
        status: 'ACTIVE',
        viewAppointmentLink: 'http://localhost:3000/appointment-details/2',
      },
      {
        id: 3,
        offenderNo: 'ABC123',
        startTime: '09:00',
        endTime: '09:15',
        locationId: 1,
        locationDescription: 'ROOM 1',
        appointmentTypeDescription: 'Video Link - Court Hearing',
        status: 'ACTIVE',
        viewAppointmentLink: 'http://localhost:3000/appointment-details/3',
      },
      {
        id: 4,
        offenderNo: 'ZXY321',
        startTime: '08:30',
        endTime: '09:00',
        locationId: 2,
        locationDescription: 'ROOM 2',
        appointmentTypeDescription: 'Video Link - Official Other',
        status: 'ACTIVE',
        viewAppointmentLink: 'http://localhost:3000/appointment-details/4',
      },
      {
        id: 4,
        offenderNo: 'ABC123',
        startTime: '08:30',
        endTime: '09:00',
        locationId: 2,
        locationDescription: 'ROOM 2',
        appointmentTypeDescription: 'Video Link - Official Other',
        status: 'ACTIVE',
        viewAppointmentLink: 'http://localhost:3000/appointment-details/4',
      },
      {
        id: 5,
        offenderNo: 'ZXY321',
        startTime: '11:00',
        endTime: '12:00',
        locationId: 3,
        locationDescription: 'ROOM 3',
        appointmentTypeDescription: 'Video Link - Probation',
        status: 'ACTIVE',
        viewAppointmentLink: 'http://localhost:3000/appointment-details/5',
      },
      {
        id: 6,
        offenderNo: 'ABC123',
        startTime: '16:30',
        endTime: '17:30',
        locationId: 2,
        locationDescription: 'ROOM 2',
        appointmentTypeDescription: 'Video Link - Legal Appointment',
        status: 'CANCELLED',
        viewAppointmentLink: 'http://localhost:3000/appointment-details/6',
      },
    ]

    bvlsAppointments = [
      {
        videoBookingId: 1,
        prisonerNumber: 'ABC123',
        startTime: '07:45',
        endTime: '08:00',
        prisonLocKey: 'ROOM_1',
        appointmentType: 'VLB_COURT_PRE',
        courtDescription: 'Aberystwyth Civil',
        hearingTypeDescription: 'Appeal',
      },
      {
        videoBookingId: 1,
        prisonerNumber: 'ABC123',
        startTime: '08:00',
        endTime: '09:00',
        prisonLocKey: 'ROOM_1',
        appointmentType: 'VLB_COURT_MAIN',
        courtDescription: 'Aberystwyth Civil',
        hearingTypeDescription: 'Appeal',
      },
      {
        videoBookingId: 1,
        prisonerNumber: 'ABC123',
        startTime: '09:00',
        endTime: '09:15',
        prisonLocKey: 'ROOM_1',
        appointmentType: 'VLB_COURT_POST',
        courtDescription: 'Aberystwyth Civil',
        hearingTypeDescription: 'Appeal',
      },
      {
        videoBookingId: 2,
        prisonerNumber: 'ZXY321',
        startTime: '11:00',
        endTime: '12:00',
        prisonLocKey: 'ROOM_3',
        appointmentType: 'VLB_PROBATION',
        probationTeamDescription: 'Burnley PP',
        probationMeetingTypeDescription: 'Recall report',
      },
    ] as BvlsAppointment[]

    prisoners = [
      {
        prisonerNumber: 'ABC123',
        firstName: 'Joe',
        lastName: 'Bloggs',
        prisonId: 'MDI',
        cellLocation: 'MDI-1-1-001',
        alerts: [],
      },
      {
        prisonerNumber: 'ZXY321',
        firstName: 'John',
        lastName: 'Smith',
        prisonId: 'PVU',
        cellLocation: 'PVI-1-1-001',
        alerts: [{ alertCode: 'XCU' }],
      },
    ] as Prisoner[]

    appointmentService.getVideoLinkAppointments.mockResolvedValue(appointments)
    bookAVideoLinkApiClient.getVideoLinkAppointments.mockResolvedValue(bvlsAppointments)
    prisonerSearchApiClient.getByPrisonerNumbers.mockResolvedValue(prisoners)
    locationsService.getLocationByNomisId = jest.fn(
      async (id, _) => ({ 1: { key: 'ROOM_1' }, 3: { key: 'ROOM_3' } })[id] as Location,
    )
  })

  describe('getSchedule', () => {
    it('builds a daily schedule', async () => {
      const date = new Date('2024-12-12')
      const result = await scheduleService.getSchedule('MDI', date, 'ACTIVE', user)

      expect(result).toEqual({
        appointmentGroups: [
          [
            {
              appointmentDescription: 'Pre-hearing',
              appointmentId: 1,
              appointmentLocationDescription: 'ROOM 1',
              appointmentType: false,
              externalAgencyDescription: false,
              prisoner: {
                cellLocation: 'MDI-1-1-001',
                firstName: 'Joe',
                hasAlerts: false,
                inPrison: true,
                lastName: 'Bloggs',
                prisonerNumber: 'ABC123',
              },
              startTime: '07:45',
              endTime: '08:00',
              status: 'ACTIVE',
              tags: [],
              videoBookingId: 1,
              videoLink: false,
              videoLinkRequired: false,
              viewAppointmentLink: 'http://localhost:3000/appointment-details/1',
            },
            {
              appointmentDescription: 'Court Hearing',
              appointmentId: 2,
              appointmentLocationDescription: 'ROOM 1',
              appointmentType: 'Appeal',
              externalAgencyDescription: 'Aberystwyth Civil',
              prisoner: {
                cellLocation: 'MDI-1-1-001',
                firstName: 'Joe',
                hasAlerts: false,
                inPrison: true,
                lastName: 'Bloggs',
                prisonerNumber: 'ABC123',
              },
              startTime: '08:00',
              endTime: '09:00',
              status: 'ACTIVE',
              tags: [],
              videoBookingId: 1,
              videoLinkRequired: true,
              viewAppointmentLink: 'http://localhost:3000/appointment-details/2',
            },
            {
              appointmentDescription: 'Post-hearing',
              appointmentId: 3,
              appointmentLocationDescription: 'ROOM 1',
              appointmentType: false,
              externalAgencyDescription: false,
              prisoner: {
                cellLocation: 'MDI-1-1-001',
                firstName: 'Joe',
                hasAlerts: false,
                inPrison: true,
                lastName: 'Bloggs',
                prisonerNumber: 'ABC123',
              },
              startTime: '09:00',
              endTime: '09:15',
              status: 'ACTIVE',
              tags: [],
              videoBookingId: 1,
              videoLink: false,
              videoLinkRequired: false,
              viewAppointmentLink: 'http://localhost:3000/appointment-details/3',
            },
          ],
          [
            {
              appointmentDescription: 'Official Other',
              appointmentId: 4,
              appointmentLocationDescription: 'ROOM 2',
              appointmentType: false,
              externalAgencyDescription: false,
              prisoner: {
                cellLocation: 'Out of prison',
                firstName: 'John',
                hasAlerts: true,
                inPrison: false,
                lastName: 'Smith',
                prisonerNumber: 'ZXY321',
              },
              startTime: '08:30',
              endTime: '09:00',
              status: 'ACTIVE',
              tags: [],
              videoLink: false,
              videoLinkRequired: false,
              viewAppointmentLink: 'http://localhost:3000/appointment-details/4',
            },
          ],
          [
            {
              appointmentDescription: 'Official Other',
              appointmentId: 4,
              appointmentLocationDescription: 'ROOM 2',
              appointmentType: false,
              externalAgencyDescription: false,
              prisoner: {
                cellLocation: 'MDI-1-1-001',
                firstName: 'Joe',
                hasAlerts: false,
                inPrison: true,
                lastName: 'Bloggs',
                prisonerNumber: 'ABC123',
              },
              startTime: '08:30',
              endTime: '09:00',
              status: 'ACTIVE',
              tags: [],
              videoLink: false,
              videoLinkRequired: false,
              viewAppointmentLink: 'http://localhost:3000/appointment-details/4',
            },
          ],
          [
            {
              appointmentDescription: 'Probation',
              appointmentId: 5,
              appointmentLocationDescription: 'ROOM 3',
              appointmentType: 'Recall report',
              externalAgencyDescription: 'Burnley PP',
              prisoner: {
                cellLocation: 'Out of prison',
                firstName: 'John',
                hasAlerts: true,
                inPrison: false,
                lastName: 'Smith',
                prisonerNumber: 'ZXY321',
              },
              startTime: '11:00',
              endTime: '12:00',
              status: 'ACTIVE',
              tags: [],
              videoBookingId: 2,
              videoLink: false,
              videoLinkRequired: false,
              viewAppointmentLink: 'http://localhost:3000/appointment-details/5',
            },
          ],
        ],
        appointmentsListed: 6,
        cancelledAppointments: 1,
        missingVideoLinks: 1,
      })

      expect(appointmentService.getVideoLinkAppointments).toHaveBeenLastCalledWith('MDI', date, user)
      expect(bookAVideoLinkApiClient.getVideoLinkAppointments).toHaveBeenLastCalledWith('MDI', date, user)
      expect(prisonerSearchApiClient.getByPrisonerNumbers).toHaveBeenLastCalledWith(['ABC123', 'ZXY321'], user)
      expect(locationsService.getLocationByNomisId).toHaveBeenCalledTimes(4)
      expect(locationsService.getLocationByNomisId).toHaveBeenNthCalledWith(1, 1, user)
      expect(locationsService.getLocationByNomisId).toHaveBeenNthCalledWith(2, 1, user)
      expect(locationsService.getLocationByNomisId).toHaveBeenNthCalledWith(3, 1, user)
      expect(locationsService.getLocationByNomisId).toHaveBeenNthCalledWith(4, 3, user)
    })

    it('builds a view of the cancelled appointments', async () => {
      const date = new Date('2024-12-12')
      const result = await scheduleService.getSchedule('MDI', date, 'CANCELLED', user)

      expect(result).toEqual({
        appointmentGroups: [
          [
            {
              appointmentDescription: 'Legal Appointment',
              appointmentId: 6,
              appointmentLocationDescription: 'ROOM 2',
              appointmentType: false,
              externalAgencyDescription: false,
              prisoner: {
                cellLocation: 'MDI-1-1-001',
                firstName: 'Joe',
                hasAlerts: false,
                inPrison: true,
                lastName: 'Bloggs',
                prisonerNumber: 'ABC123',
              },
              startTime: '16:30',
              endTime: '17:30',
              status: 'CANCELLED',
              tags: [],
              videoLink: false,
              videoLinkRequired: false,
              viewAppointmentLink: 'http://localhost:3000/appointment-details/6',
            },
          ],
        ],
        appointmentsListed: 1,
        cancelledAppointments: 1,
        missingVideoLinks: 0,
      })

      expect(appointmentService.getVideoLinkAppointments).toHaveBeenLastCalledWith('MDI', date, user)
      expect(bookAVideoLinkApiClient.getVideoLinkAppointments).toHaveBeenLastCalledWith('MDI', date, user)
      expect(prisonerSearchApiClient.getByPrisonerNumbers).toHaveBeenLastCalledWith(['ABC123', 'ZXY321'], user)
      expect(locationsService.getLocationByNomisId).toHaveBeenCalledTimes(4)
      expect(locationsService.getLocationByNomisId).toHaveBeenNthCalledWith(1, 1, user)
      expect(locationsService.getLocationByNomisId).toHaveBeenNthCalledWith(2, 1, user)
      expect(locationsService.getLocationByNomisId).toHaveBeenNthCalledWith(3, 1, user)
      expect(locationsService.getLocationByNomisId).toHaveBeenNthCalledWith(4, 3, user)
    })
  })
})
