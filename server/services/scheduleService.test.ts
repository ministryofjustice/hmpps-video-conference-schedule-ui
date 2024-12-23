import createUser from '../testutils/createUser'
import AppointmentService from './appointmentService'
import ScheduleService from './scheduleService'
import LocationsService from './locationsService'
import BookAVideoLinkApiClient from '../data/bookAVideoLinkApiClient'
import PrisonerSearchApiClient from '../data/prisonerSearchApiClient'
import { ScheduledAppointment } from '../@types/prisonApi/types'
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

  let appointments: ScheduledAppointment[]
  let bvlsAppointments: BvlsAppointment[]
  let prisoners: Prisoner[]

  beforeEach(() => {
    appointmentService = new AppointmentService(null) as jest.Mocked<AppointmentService>
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
        startTime: '2024-12-12T07:45:00Z',
        endTime: '2024-12-12T08:00:00Z',
        locationId: 1,
        locationDescription: 'ROOM 1',
        appointmentTypeDescription: 'Video Link - Court Hearing',
      },
      {
        id: 2,
        offenderNo: 'ABC123',
        startTime: '2024-12-12T08:00:00Z',
        endTime: '2024-12-12T09:00:00Z',
        locationId: 1,
        locationDescription: 'ROOM 1',
        appointmentTypeDescription: 'Video Link - Court Hearing',
      },
      {
        id: 3,
        offenderNo: 'ABC123',
        startTime: '2024-12-12T09:00:00Z',
        endTime: '2024-12-12T09:15:00Z',
        locationId: 1,
        locationDescription: 'ROOM 1',
        appointmentTypeDescription: 'Video Link - Court Hearing',
      },
      {
        id: 4,
        offenderNo: 'ZXY321',
        startTime: '2024-12-12T08:30:00Z',
        endTime: '2024-12-12T09:00:00Z',
        locationId: 2,
        locationDescription: 'ROOM 2',
        appointmentTypeDescription: 'Video Link - Official Other',
      },
      {
        id: 5,
        offenderNo: 'ZXY321',
        startTime: '2024-12-12T11:00:00Z',
        endTime: '2024-12-12T12:00:00Z',
        locationId: 3,
        locationDescription: 'ROOM 3',
        appointmentTypeDescription: 'Video Link - Probation',
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
    bookAVideoLinkApiClient.getScheduledVideoLinkAppointments.mockResolvedValue(bvlsAppointments)
    prisonerSearchApiClient.getByPrisonerNumbers.mockResolvedValue(prisoners)
    locationsService.getLocationByNomisId = jest.fn(
      async (id, _) => ({ 1: { key: 'ROOM_1' }, 3: { key: 'ROOM_3' } })[id] as Location,
    )
  })

  describe('getSchedule', () => {
    it('builds a daily schedule', async () => {
      const date = new Date('2024-12-12')
      const result = await scheduleService.getSchedule('MDI', date, user)

      expect(result).toEqual({
        appointmentGroups: [
          [
            {
              appointmentDescription: 'Pre-hearing',
              appointmentId: 1,
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
              startTime: '07:45',
              endTime: '08:00',
              tags: [],
              videoBookingId: 1,
              videoLinkRequired: false,
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
              tags: [],
              videoBookingId: 1,
              videoLinkRequired: true,
            },
            {
              appointmentDescription: 'Post-hearing',
              appointmentId: 3,
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
              startTime: '09:00',
              endTime: '09:15',
              tags: [],
              videoBookingId: 1,
              videoLinkRequired: false,
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
              tags: [],
              videoBookingId: 2,
              videoLinkRequired: false,
            },
          ],
          [
            {
              appointmentDescription: 'Official Other',
              appointmentId: 4,
              appointmentLocationDescription: 'ROOM 2',
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
              tags: [],
              videoLinkRequired: false,
            },
          ],
        ],
        appointmentsListed: 5,
        missingVideoLinks: 1,
      })

      expect(appointmentService.getVideoLinkAppointments).toHaveBeenLastCalledWith('MDI', date, user)
      expect(bookAVideoLinkApiClient.getScheduledVideoLinkAppointments).toHaveBeenLastCalledWith('MDI', date, user)
      expect(prisonerSearchApiClient.getByPrisonerNumbers).toHaveBeenLastCalledWith(['ABC123', 'ZXY321'], user)
      expect(locationsService.getLocationByNomisId).toHaveBeenCalledTimes(4)
      expect(locationsService.getLocationByNomisId).toHaveBeenNthCalledWith(1, 1, user)
      expect(locationsService.getLocationByNomisId).toHaveBeenNthCalledWith(2, 1, user)
      expect(locationsService.getLocationByNomisId).toHaveBeenNthCalledWith(3, 1, user)
      expect(locationsService.getLocationByNomisId).toHaveBeenNthCalledWith(4, 3, user)
    })
  })
})
