import sinon from 'sinon'
import { formatDate, set, startOfToday, startOfTomorrow, startOfYesterday, subMinutes } from 'date-fns'
import createUser from '../testutils/createUser'
import AppointmentService, { Appointment } from './appointmentService'
import ScheduleService from './scheduleService'
import BookAVideoLinkApiClient from '../data/bookAVideoLinkApiClient'
import PrisonerSearchApiClient from '../data/prisonerSearchApiClient'
import { BvlsAppointment } from '../@types/bookAVideoLinkApi/types'
import { Prisoner } from '../@types/prisonerSearchApi/types'
import { LocationMapping } from '../@types/nomisMappingApi/types'
import NomisMappingApiClient from '../data/nomisMappingApiClient'
import ManageUsersApiClient from '../data/manageUsersApiClient'
import { User } from '../@types/manageUsersApi/types'
import ReferenceDataService, { CellsByWing } from './referenceDataService'

jest.mock('../services/appointmentService')
jest.mock('../services/referenceDataService')
jest.mock('../data/nomisMappingApiClient')
jest.mock('../data/bookAVideoLinkApiClient')
jest.mock('../data/prisonerSearchApiClient')
jest.mock('../data/manageUsersApiClient')

const user = createUser([])

describe('Schedule service', () => {
  let appointmentService: jest.Mocked<AppointmentService>
  let referenceDataService: jest.Mocked<ReferenceDataService>
  let nomisMappingApiClient: jest.Mocked<NomisMappingApiClient>
  let bookAVideoLinkApiClient: jest.Mocked<BookAVideoLinkApiClient>
  let prisonerSearchApiClient: jest.Mocked<PrisonerSearchApiClient>
  let manageUsersApiClient: jest.Mocked<ManageUsersApiClient>

  let scheduleService: ScheduleService

  let appointments: Appointment[]
  let bvlsAppointments: BvlsAppointment[]
  let prisoners: Prisoner[]

  beforeEach(() => {
    appointmentService = new AppointmentService(null, null) as jest.Mocked<AppointmentService>
    referenceDataService = new ReferenceDataService(null, null, null) as jest.Mocked<ReferenceDataService>
    nomisMappingApiClient = new NomisMappingApiClient() as jest.Mocked<NomisMappingApiClient>
    bookAVideoLinkApiClient = new BookAVideoLinkApiClient() as jest.Mocked<BookAVideoLinkApiClient>
    prisonerSearchApiClient = new PrisonerSearchApiClient() as jest.Mocked<PrisonerSearchApiClient>
    manageUsersApiClient = new ManageUsersApiClient() as jest.Mocked<ManageUsersApiClient>
    scheduleService = new ScheduleService(
      appointmentService,
      referenceDataService,
      nomisMappingApiClient,
      bookAVideoLinkApiClient,
      prisonerSearchApiClient,
      manageUsersApiClient,
    )

    appointments = [
      {
        id: 1,
        date: '2024-12-12',
        offenderNo: 'ABC123',
        startTime: '07:45',
        endTime: '08:00',
        locationId: 1,
        locationDescription: 'ROOM 1',
        appointmentTypeCode: 'VLB',
        appointmentTypeDescription: 'Video Link - Court Hearing',
        status: 'ACTIVE',
        viewAppointmentLink: 'http://localhost:3000/appointment-details/1',
        createdTime: startOfToday().toISOString(),
      },
      {
        id: 2,
        date: '2024-12-12',
        offenderNo: 'ABC123',
        startTime: '08:00',
        endTime: '09:00',
        locationId: 1,
        locationDescription: 'ROOM 1',
        appointmentTypeCode: 'VLB',
        appointmentTypeDescription: 'Video Link - Court Hearing',
        status: 'ACTIVE',
        viewAppointmentLink: 'http://localhost:3000/appointment-details/2',
        createdTime: startOfToday().toISOString(),
      },
      {
        id: 3,
        date: '2024-12-12',
        offenderNo: 'ABC123',
        startTime: '09:00',
        endTime: '09:15',
        locationId: 1,
        locationDescription: 'ROOM 1',
        appointmentTypeCode: 'VLB',
        appointmentTypeDescription: 'Video Link - Court Hearing',
        status: 'ACTIVE',
        viewAppointmentLink: 'http://localhost:3000/appointment-details/3',
        createdTime: startOfToday().toISOString(),
      },
      {
        id: 4,
        date: '2024-12-12',
        offenderNo: 'ZXY321',
        startTime: '08:30',
        endTime: '09:00',
        locationId: 2,
        locationDescription: 'ROOM 2',
        appointmentTypeCode: 'VLOO',
        appointmentTypeDescription: 'Video Link - Official Other',
        status: 'ACTIVE',
        viewAppointmentLink: 'http://localhost:3000/appointment-details/4',
        createdTime: startOfToday().toISOString(),
      },
      {
        id: 4,
        date: '2024-12-12',
        offenderNo: 'ABC123',
        startTime: '08:30',
        endTime: '09:00',
        locationId: 2,
        locationDescription: 'ROOM 2',
        appointmentTypeCode: 'VLOO',
        appointmentTypeDescription: 'Video Link - Official Other',
        status: 'ACTIVE',
        viewAppointmentLink: 'http://localhost:3000/appointment-details/4',
        createdTime: startOfToday().toISOString(),
      },
      {
        id: 5,
        date: '2024-12-12',
        offenderNo: 'ZXY321',
        startTime: '11:00',
        endTime: '12:00',
        locationId: 3,
        locationDescription: 'ROOM 3',
        appointmentTypeCode: 'VLPM',
        appointmentTypeDescription: 'Video Link - Probation',
        status: 'ACTIVE',
        viewAppointmentLink: 'http://localhost:3000/appointment-details/5',
        createdTime: startOfToday().toISOString(),
      },
      {
        id: 6,
        date: '2024-12-12',
        offenderNo: 'ABC123',
        startTime: '16:30',
        endTime: '17:30',
        locationId: 2,
        locationDescription: 'ROOM 2',
        appointmentTypeCode: 'VLLA',
        appointmentTypeDescription: 'Video Link - Legal Appointment',
        status: 'CANCELLED',
        viewAppointmentLink: 'http://localhost:3000/appointment-details/6',
        cancelledBy: 'jbloggs',
        cancelledTime: '2024-12-14T11:59:00Z',
        createdTime: startOfToday().toISOString(),
      },
      {
        id: 7,
        date: '2024-12-12',
        offenderNo: 'ABC123',
        startTime: '16:30',
        endTime: '17:30',
        locationId: 2,
        locationDescription: 'ROOM 2',
        appointmentTypeCode: 'VLLA',
        appointmentTypeDescription: 'Video Link - Legal Appointment',
        status: 'ACTIVE',
        viewAppointmentLink: 'http://localhost:3000/appointment-details/7',
        createdTime: startOfToday().toISOString(),
      },
      {
        id: 8,
        date: '2024-12-12',
        offenderNo: 'ZXY321',
        startTime: '11:00',
        endTime: '12:00',
        locationId: 3,
        locationDescription: 'ROOM 3',
        appointmentTypeCode: 'VLPM',
        appointmentTypeDescription: 'Video Link - Probation',
        status: 'CANCELLED',
        viewAppointmentLink: 'http://localhost:3000/appointment-details/8',
        cancelledBy: 'EXTERNAL',
        cancelledTime: '2024-12-12T11:59:00Z',
        createdTime: startOfToday().toISOString(),
      },
    ]

    bvlsAppointments = [
      {
        videoBookingId: 1,
        statusCode: 'ACTIVE',
        prisonerNumber: 'ABC123',
        startTime: '07:45',
        endTime: '08:00',
        prisonLocKey: 'ROOM_1',
        dpsLocationId: 'abc-123',
        appointmentType: 'VLB_COURT_PRE',
        courtCode: 'ABERCV',
        courtDescription: 'Aberystwyth Civil',
        hearingTypeDescription: 'Appeal',
      },
      {
        videoBookingId: 1,
        statusCode: 'ACTIVE',
        prisonerNumber: 'ABC123',
        startTime: '08:00',
        endTime: '09:00',
        prisonLocKey: 'ROOM_1',
        dpsLocationId: 'abc-123',
        appointmentType: 'VLB_COURT_MAIN',
        courtCode: 'ABERCV',
        courtDescription: 'Aberystwyth Civil',
        hearingTypeDescription: 'Appeal',
      },
      {
        videoBookingId: 1,
        statusCode: 'ACTIVE',
        prisonerNumber: 'ABC123',
        startTime: '09:00',
        endTime: '09:15',
        prisonLocKey: 'ROOM_1',
        dpsLocationId: 'abc-123',
        appointmentType: 'VLB_COURT_POST',
        courtCode: 'ABERCV',
        courtDescription: 'Aberystwyth Civil',
        hearingTypeDescription: 'Appeal',
      },
      {
        videoBookingId: 2,
        statusCode: 'ACTIVE',
        prisonerNumber: 'ZXY321',
        startTime: '11:00',
        endTime: '12:00',
        prisonLocKey: 'ROOM_3',
        dpsLocationId: 'zyx-321',
        appointmentType: 'VLB_PROBATION',
        probationTeamCode: 'BURPP',
        probationTeamDescription: 'Burnley PP',
        probationMeetingTypeDescription: 'Recall report',
      },
      {
        videoBookingId: 3,
        statusCode: 'CANCELLED',
        prisonerNumber: 'ZXY321',
        startTime: '11:00',
        endTime: '12:00',
        prisonLocKey: 'ROOM_3',
        dpsLocationId: 'zyx-321',
        appointmentType: 'VLB_PROBATION',
        probationTeamCode: 'BURPP',
        probationTeamDescription: 'Burnley PP',
        probationMeetingTypeDescription: 'Recall report',
        updatedBy: 'jsmith',
        updatedTime: '2024-12-12T11:59:00Z',
      },
    ] as BvlsAppointment[]

    prisoners = [
      {
        prisonerNumber: 'ABC123',
        firstName: 'Joe',
        lastName: 'Bloggs',
        prisonId: 'MDI',
        cellLocation: 'A-001',
        alerts: [],
      },
      {
        prisonerNumber: 'ZXY321',
        firstName: 'John',
        lastName: 'Smith',
        prisonId: 'PVI',
        cellLocation: 'B-001',
        alerts: [{ alertCode: 'XCU' }],
      },
    ] as Prisoner[]

    appointmentService.getVideoLinkAppointments.mockResolvedValue(appointments)
    referenceDataService.getCellsByWing.mockResolvedValue([{ fullLocationPath: 'A', cells: ['A-001'] }] as CellsByWing)
    bookAVideoLinkApiClient.getVideoLinkAppointments.mockResolvedValue(bvlsAppointments)
    prisonerSearchApiClient.getByPrisonerNumbers.mockResolvedValue(prisoners)
    nomisMappingApiClient.getLocationMappingByNomisId = jest.fn(
      async (id, _) => ({ 1: { dpsLocationId: 'abc-123' }, 3: { dpsLocationId: 'zyx-321' } })[id] as LocationMapping,
    )
    manageUsersApiClient.getUserByUsername.mockImplementation(
      async username =>
        ({
          jbloggs: { name: 'Joe Bloggs', authSource: 'nomis' } as User,
          jsmith: { name: 'John Smith', authSource: 'auth' } as User,
        })[username],
    )
  })

  describe('getSchedule', () => {
    it('builds a daily schedule', async () => {
      const date = new Date('2024-12-12')
      const result = await scheduleService.getSchedule('MDI', date, undefined, 'ACTIVE', user)

      expect(result).toEqual({
        appointmentGroups: [
          [
            {
              appointmentTypeCode: 'VLB',
              appointmentTypeDescription: 'Pre-hearing',
              appointmentId: 1,
              appointmentLocationDescription: 'ROOM 1',
              externalAgencyCode: 'ABERCV',
              lastUpdatedOrCreated: startOfToday().toISOString(),
              prisoner: {
                cellLocation: 'A-001',
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
              videoLinkRequired: false,
              viewAppointmentLink: 'http://localhost:3000/appointment-details/1',
            },
            {
              appointmentTypeCode: 'VLB',
              appointmentTypeDescription: 'Court Hearing',
              appointmentId: 2,
              appointmentLocationDescription: 'ROOM 1',
              appointmentSubtypeDescription: 'Appeal',
              externalAgencyCode: 'ABERCV',
              externalAgencyDescription: 'Aberystwyth Civil',
              lastUpdatedOrCreated: startOfToday().toISOString(),
              prisoner: {
                cellLocation: 'A-001',
                firstName: 'Joe',
                hasAlerts: false,
                inPrison: true,
                lastName: 'Bloggs',
                prisonerNumber: 'ABC123',
              },
              startTime: '08:00',
              endTime: '09:00',
              status: 'ACTIVE',
              tags: ['LINK_MISSING'],
              videoBookingId: 1,
              videoLinkRequired: true,
              viewAppointmentLink: 'http://localhost:3000/appointment-details/2',
            },
            {
              appointmentTypeCode: 'VLB',
              appointmentTypeDescription: 'Post-hearing',
              appointmentId: 3,
              appointmentLocationDescription: 'ROOM 1',
              externalAgencyCode: 'ABERCV',
              lastUpdatedOrCreated: startOfToday().toISOString(),
              prisoner: {
                cellLocation: 'A-001',
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
              videoLinkRequired: false,
              viewAppointmentLink: 'http://localhost:3000/appointment-details/3',
            },
          ],
          [
            {
              appointmentTypeCode: 'VLOO',
              appointmentTypeDescription: 'Official Other',
              appointmentId: 4,
              appointmentLocationDescription: 'ROOM 2',
              lastUpdatedOrCreated: startOfToday().toISOString(),
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
              videoLinkRequired: false,
              viewAppointmentLink: 'http://localhost:3000/appointment-details/4',
            },
          ],
          [
            {
              appointmentTypeCode: 'VLOO',
              appointmentTypeDescription: 'Official Other',
              appointmentId: 4,
              appointmentLocationDescription: 'ROOM 2',
              lastUpdatedOrCreated: startOfToday().toISOString(),
              prisoner: {
                cellLocation: 'A-001',
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
              videoLinkRequired: false,
              viewAppointmentLink: 'http://localhost:3000/appointment-details/4',
            },
          ],
          [
            {
              appointmentTypeCode: 'VLPM',
              appointmentTypeDescription: 'Probation',
              appointmentId: 5,
              appointmentLocationDescription: 'ROOM 3',
              appointmentSubtypeDescription: 'Recall report',
              externalAgencyCode: 'BURPP',
              externalAgencyDescription: 'Burnley PP',
              lastUpdatedOrCreated: startOfToday().toISOString(),
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
              videoLinkRequired: false,
              viewAppointmentLink: 'http://localhost:3000/appointment-details/5',
            },
          ],
          [
            {
              appointmentTypeCode: 'VLLA',
              appointmentTypeDescription: 'Legal Appointment',
              appointmentId: 7,
              appointmentLocationDescription: 'ROOM 2',
              endTime: '17:30',
              lastUpdatedOrCreated: startOfToday().toISOString(),
              prisoner: {
                cellLocation: 'A-001',
                firstName: 'Joe',
                hasAlerts: false,
                inPrison: true,
                lastName: 'Bloggs',
                prisonerNumber: 'ABC123',
              },
              startTime: '16:30',
              status: 'ACTIVE',
              tags: [],
              videoLinkRequired: false,
              viewAppointmentLink: 'http://localhost:3000/appointment-details/7',
            },
          ],
        ],
        appointmentsListed: 7,
        numberOfPrisoners: 2,
        cancelledAppointments: 2,
        missingVideoLinks: 1,
      })

      expect(appointmentService.getVideoLinkAppointments).toHaveBeenLastCalledWith('MDI', date, undefined, user)
      expect(bookAVideoLinkApiClient.getVideoLinkAppointments).toHaveBeenLastCalledWith('MDI', date, user)
      expect(prisonerSearchApiClient.getByPrisonerNumbers).toHaveBeenLastCalledWith(['ABC123', 'ZXY321'], user)
      expect(nomisMappingApiClient.getLocationMappingByNomisId).toHaveBeenCalledTimes(5)
      expect(nomisMappingApiClient.getLocationMappingByNomisId).toHaveBeenNthCalledWith(1, 1, user)
      expect(nomisMappingApiClient.getLocationMappingByNomisId).toHaveBeenNthCalledWith(2, 1, user)
      expect(nomisMappingApiClient.getLocationMappingByNomisId).toHaveBeenNthCalledWith(3, 1, user)
      expect(nomisMappingApiClient.getLocationMappingByNomisId).toHaveBeenNthCalledWith(4, 3, user)
      expect(nomisMappingApiClient.getLocationMappingByNomisId).toHaveBeenNthCalledWith(5, 3, user)
    })

    it('filters the daily schedule by appointment type', async () => {
      const date = new Date('2024-12-12')
      const result = await scheduleService.getSchedule(
        'MDI',
        date,
        { appointmentType: ['VLLA', 'VLOO'] },
        'ACTIVE',
        user,
      )

      expect(result).toEqual({
        appointmentGroups: [
          [
            {
              appointmentTypeCode: 'VLOO',
              appointmentTypeDescription: 'Official Other',
              appointmentId: 4,
              appointmentLocationDescription: 'ROOM 2',
              lastUpdatedOrCreated: startOfToday().toISOString(),
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
              videoLinkRequired: false,
              viewAppointmentLink: 'http://localhost:3000/appointment-details/4',
            },
          ],
          [
            {
              appointmentTypeCode: 'VLOO',
              appointmentTypeDescription: 'Official Other',
              appointmentId: 4,
              appointmentLocationDescription: 'ROOM 2',
              lastUpdatedOrCreated: startOfToday().toISOString(),
              prisoner: {
                cellLocation: 'A-001',
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
              videoLinkRequired: false,
              viewAppointmentLink: 'http://localhost:3000/appointment-details/4',
            },
          ],
          [
            {
              appointmentTypeCode: 'VLLA',
              appointmentTypeDescription: 'Legal Appointment',
              appointmentId: 7,
              appointmentLocationDescription: 'ROOM 2',
              endTime: '17:30',
              lastUpdatedOrCreated: startOfToday().toISOString(),
              prisoner: {
                cellLocation: 'A-001',
                firstName: 'Joe',
                hasAlerts: false,
                inPrison: true,
                lastName: 'Bloggs',
                prisonerNumber: 'ABC123',
              },
              startTime: '16:30',
              status: 'ACTIVE',
              tags: [],
              videoLinkRequired: false,
              viewAppointmentLink: 'http://localhost:3000/appointment-details/7',
            },
          ],
        ],
        appointmentsListed: 3,
        numberOfPrisoners: 2,
        cancelledAppointments: 1,
        missingVideoLinks: 0,
      })
    })

    it('filters the daily schedule by residential wing', async () => {
      const date = new Date('2024-12-12')
      const result = await scheduleService.getSchedule('MDI', date, { wing: ['A'] }, 'ACTIVE', user)

      expect(result).toEqual({
        appointmentGroups: [
          [
            {
              appointmentTypeCode: 'VLB',
              appointmentTypeDescription: 'Pre-hearing',
              appointmentId: 1,
              appointmentLocationDescription: 'ROOM 1',
              externalAgencyCode: 'ABERCV',
              lastUpdatedOrCreated: startOfToday().toISOString(),
              prisoner: {
                cellLocation: 'A-001',
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
              videoLinkRequired: false,
              viewAppointmentLink: 'http://localhost:3000/appointment-details/1',
            },
            {
              appointmentTypeCode: 'VLB',
              appointmentTypeDescription: 'Court Hearing',
              appointmentId: 2,
              appointmentLocationDescription: 'ROOM 1',
              appointmentSubtypeDescription: 'Appeal',
              externalAgencyCode: 'ABERCV',
              externalAgencyDescription: 'Aberystwyth Civil',
              lastUpdatedOrCreated: startOfToday().toISOString(),
              prisoner: {
                cellLocation: 'A-001',
                firstName: 'Joe',
                hasAlerts: false,
                inPrison: true,
                lastName: 'Bloggs',
                prisonerNumber: 'ABC123',
              },
              startTime: '08:00',
              endTime: '09:00',
              status: 'ACTIVE',
              tags: ['LINK_MISSING'],
              videoBookingId: 1,
              videoLinkRequired: true,
              viewAppointmentLink: 'http://localhost:3000/appointment-details/2',
            },
            {
              appointmentTypeCode: 'VLB',
              appointmentTypeDescription: 'Post-hearing',
              appointmentId: 3,
              appointmentLocationDescription: 'ROOM 1',
              externalAgencyCode: 'ABERCV',
              lastUpdatedOrCreated: startOfToday().toISOString(),
              prisoner: {
                cellLocation: 'A-001',
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
              videoLinkRequired: false,
              viewAppointmentLink: 'http://localhost:3000/appointment-details/3',
            },
          ],
          [
            {
              appointmentTypeCode: 'VLOO',
              appointmentTypeDescription: 'Official Other',
              appointmentId: 4,
              appointmentLocationDescription: 'ROOM 2',
              lastUpdatedOrCreated: startOfToday().toISOString(),
              prisoner: {
                cellLocation: 'A-001',
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
              videoLinkRequired: false,
              viewAppointmentLink: 'http://localhost:3000/appointment-details/4',
            },
          ],
          [
            {
              appointmentTypeCode: 'VLLA',
              appointmentTypeDescription: 'Legal Appointment',
              appointmentId: 7,
              appointmentLocationDescription: 'ROOM 2',
              endTime: '17:30',
              lastUpdatedOrCreated: startOfToday().toISOString(),
              prisoner: {
                cellLocation: 'A-001',
                firstName: 'Joe',
                hasAlerts: false,
                inPrison: true,
                lastName: 'Bloggs',
                prisonerNumber: 'ABC123',
              },
              startTime: '16:30',
              status: 'ACTIVE',
              tags: [],
              videoLinkRequired: false,
              viewAppointmentLink: 'http://localhost:3000/appointment-details/7',
            },
          ],
        ],
        appointmentsListed: 5,
        numberOfPrisoners: 1,
        cancelledAppointments: 1,
        missingVideoLinks: 1,
      })
    })

    it('filters the daily schedule by time period', async () => {
      const date = new Date('2024-12-12')
      await scheduleService.getSchedule('MDI', date, { period: ['AM'] }, 'ACTIVE', user)
      expect(appointmentService.getVideoLinkAppointments).toHaveBeenLastCalledWith('MDI', date, ['AM'], user)
    })

    it('filters the daily schedule by court or probation team', async () => {
      const date = new Date('2024-12-12')
      const result = await scheduleService.getSchedule(
        'MDI',
        date,
        { courtOrProbationTeam: ['ABERCV', 'BURPP'] },
        'ACTIVE',
        user,
      )

      expect(result).toEqual({
        appointmentGroups: [
          [
            {
              appointmentTypeCode: 'VLB',
              appointmentTypeDescription: 'Pre-hearing',
              appointmentId: 1,
              appointmentLocationDescription: 'ROOM 1',
              externalAgencyCode: 'ABERCV',
              lastUpdatedOrCreated: startOfToday().toISOString(),
              prisoner: {
                cellLocation: 'A-001',
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
              videoLinkRequired: false,
              viewAppointmentLink: 'http://localhost:3000/appointment-details/1',
            },
            {
              appointmentTypeCode: 'VLB',
              appointmentTypeDescription: 'Court Hearing',
              appointmentId: 2,
              appointmentLocationDescription: 'ROOM 1',
              appointmentSubtypeDescription: 'Appeal',
              externalAgencyCode: 'ABERCV',
              externalAgencyDescription: 'Aberystwyth Civil',
              lastUpdatedOrCreated: startOfToday().toISOString(),
              prisoner: {
                cellLocation: 'A-001',
                firstName: 'Joe',
                hasAlerts: false,
                inPrison: true,
                lastName: 'Bloggs',
                prisonerNumber: 'ABC123',
              },
              startTime: '08:00',
              endTime: '09:00',
              status: 'ACTIVE',
              tags: ['LINK_MISSING'],
              videoBookingId: 1,
              videoLinkRequired: true,
              viewAppointmentLink: 'http://localhost:3000/appointment-details/2',
            },
            {
              appointmentTypeCode: 'VLB',
              appointmentTypeDescription: 'Post-hearing',
              appointmentId: 3,
              appointmentLocationDescription: 'ROOM 1',
              externalAgencyCode: 'ABERCV',
              lastUpdatedOrCreated: startOfToday().toISOString(),
              prisoner: {
                cellLocation: 'A-001',
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
              videoLinkRequired: false,
              viewAppointmentLink: 'http://localhost:3000/appointment-details/3',
            },
          ],
          [
            {
              appointmentTypeCode: 'VLPM',
              appointmentTypeDescription: 'Probation',
              appointmentId: 5,
              appointmentLocationDescription: 'ROOM 3',
              appointmentSubtypeDescription: 'Recall report',
              externalAgencyCode: 'BURPP',
              externalAgencyDescription: 'Burnley PP',
              lastUpdatedOrCreated: startOfToday().toISOString(),
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
              videoLinkRequired: false,
              viewAppointmentLink: 'http://localhost:3000/appointment-details/5',
            },
          ],
        ],
        appointmentsListed: 4,
        numberOfPrisoners: 2,
        cancelledAppointments: 1,
        missingVideoLinks: 1,
      })
    })

    it('builds a view of the cancelled appointments', async () => {
      const date = new Date('2024-12-12')
      const result = await scheduleService.getSchedule('MDI', date, undefined, 'CANCELLED', user)

      expect(result).toEqual({
        appointmentGroups: [
          [
            {
              appointmentTypeCode: 'VLPM',
              appointmentTypeDescription: 'Probation',
              appointmentId: 8,
              appointmentLocationDescription: 'ROOM 3',
              appointmentSubtypeDescription: 'Recall report',
              endTime: '12:00',
              externalAgencyCode: 'BURPP',
              externalAgencyDescription: 'Burnley PP',
              lastUpdatedOrCreated: '2024-12-12T11:59:00Z',
              prisoner: {
                cellLocation: 'Out of prison',
                firstName: 'John',
                hasAlerts: true,
                inPrison: false,
                lastName: 'Smith',
                prisonerNumber: 'ZXY321',
              },
              startTime: '11:00',
              status: 'CANCELLED',
              tags: [],
              videoBookingId: 3,
              videoLinkRequired: false,
              viewAppointmentLink: 'http://localhost:3000/appointment-details/8',
              cancelledBy: 'External user',
              cancelledTime: '2024-12-12T11:59:00Z',
            },
          ],
          [
            {
              appointmentTypeCode: 'VLLA',
              appointmentTypeDescription: 'Legal Appointment',
              appointmentId: 6,
              appointmentLocationDescription: 'ROOM 2',
              lastUpdatedOrCreated: startOfToday().toISOString(),
              prisoner: {
                cellLocation: 'A-001',
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
              videoLinkRequired: false,
              viewAppointmentLink: 'http://localhost:3000/appointment-details/6',
              cancelledBy: 'Joe Bloggs',
              cancelledTime: '2024-12-14T11:59:00Z',
            },
          ],
        ],
        appointmentsListed: 2,
        numberOfPrisoners: 2,
        cancelledAppointments: 2,
        missingVideoLinks: 0,
      })

      expect(appointmentService.getVideoLinkAppointments).toHaveBeenLastCalledWith('MDI', date, undefined, user)
      expect(bookAVideoLinkApiClient.getVideoLinkAppointments).toHaveBeenLastCalledWith('MDI', date, user)
      expect(prisonerSearchApiClient.getByPrisonerNumbers).toHaveBeenLastCalledWith(['ABC123', 'ZXY321'], user)
      expect(nomisMappingApiClient.getLocationMappingByNomisId).toHaveBeenCalledTimes(5)
      expect(nomisMappingApiClient.getLocationMappingByNomisId).toHaveBeenNthCalledWith(1, 1, user)
      expect(nomisMappingApiClient.getLocationMappingByNomisId).toHaveBeenNthCalledWith(2, 1, user)
      expect(nomisMappingApiClient.getLocationMappingByNomisId).toHaveBeenNthCalledWith(3, 1, user)
      expect(nomisMappingApiClient.getLocationMappingByNomisId).toHaveBeenNthCalledWith(4, 3, user)
      expect(nomisMappingApiClient.getLocationMappingByNomisId).toHaveBeenNthCalledWith(5, 3, user)
      expect(manageUsersApiClient.getUserByUsername).toHaveBeenCalledTimes(2)
      expect(manageUsersApiClient.getUserByUsername).toHaveBeenNthCalledWith(1, 'jbloggs', user)
      expect(manageUsersApiClient.getUserByUsername).toHaveBeenNthCalledWith(2, 'jsmith', user)
    })

    describe('tags', () => {
      let clock: sinon.SinonFakeTimers

      afterEach(() => {
        if (clock) {
          clock.restore()
        }
      })

      it("should add the NEW tag to appointments created today, if viewing today's appointments", async () => {
        appointments = [
          {
            id: 1,
            date: formatDate(startOfToday(), 'yyyy-MM-dd'),
            offenderNo: 'ABC123',
            startTime: '07:45',
            endTime: '08:00',
            locationId: 1,
            locationDescription: 'ROOM 1',
            appointmentTypeDescription: 'Video Link - Court Hearing',
            status: 'ACTIVE',
            viewAppointmentLink: 'http://localhost:3000/appointment-details/1',
            createdTime: new Date().toISOString(),
          },
        ]

        appointmentService.getVideoLinkAppointments.mockResolvedValue(appointments)
        bookAVideoLinkApiClient.getVideoLinkAppointments.mockResolvedValue(bvlsAppointments)

        const date = new Date()
        const result = await scheduleService.getSchedule('MDI', date, undefined, 'ACTIVE', user)

        expect(result.appointmentGroups.pop().pop()).toMatchObject({ tags: ['NEW'] })
      })

      it("should add the NEW tag to appointments created yesterday after 3pm, if viewing today's appointments and now is before 10pm", async () => {
        clock = sinon.useFakeTimers(new Date('2024-12-12T09:59:00Z').getTime())

        appointments = [
          {
            id: 1,
            date: formatDate(startOfToday(), 'yyyy-MM-dd'),
            offenderNo: 'ABC123',
            startTime: '07:45',
            endTime: '08:00',
            locationId: 1,
            locationDescription: 'ROOM 1',
            appointmentTypeDescription: 'Video Link - Court Hearing',
            status: 'ACTIVE',
            viewAppointmentLink: 'http://localhost:3000/appointment-details/1',
            createdTime: set(startOfYesterday(), { hours: 15, seconds: 1 }).toISOString(),
          },
        ]

        appointmentService.getVideoLinkAppointments.mockResolvedValue(appointments)

        const date = new Date()
        const result = await scheduleService.getSchedule('MDI', date, undefined, 'ACTIVE', user)

        expect(result.appointmentGroups.pop().pop()).toMatchObject({ tags: ['NEW'] })
      })

      it("should add the NEW tag to appointments created today after 3pm, if viewing tomorrow's appointments", async () => {
        clock = sinon.useFakeTimers(new Date('2024-12-12T15:59:00Z').getTime())

        appointments = [
          {
            id: 1,
            date: formatDate(startOfTomorrow(), 'yyyy-MM-dd'),
            offenderNo: 'ABC123',
            startTime: '07:45',
            endTime: '08:00',
            locationId: 1,
            locationDescription: 'ROOM 1',
            appointmentTypeDescription: 'Video Link - Court Hearing',
            status: 'ACTIVE',
            viewAppointmentLink: 'http://localhost:3000/appointment-details/1',
            createdTime: set(startOfToday(), { hours: 15, seconds: 1 }).toISOString(),
          },
        ]

        appointmentService.getVideoLinkAppointments.mockResolvedValue(appointments)

        const date = new Date()
        const result = await scheduleService.getSchedule('MDI', date, undefined, 'ACTIVE', user)

        expect(result.appointmentGroups.pop().pop()).toMatchObject({ tags: ['NEW'] })
      })

      it("should not add the NEW tag to appointments created yesterday after 3pm, if viewing today's appointments and now is after 10pm", async () => {
        clock = sinon.useFakeTimers(new Date('2024-12-12T10:00:00Z').getTime())

        appointments = [
          {
            id: 1,
            date: formatDate(startOfToday(), 'yyyy-MM-dd'),
            offenderNo: 'ABC123',
            startTime: '07:45',
            endTime: '08:00',
            locationId: 1,
            locationDescription: 'ROOM 1',
            appointmentTypeDescription: 'Video Link - Court Hearing',
            status: 'ACTIVE',
            viewAppointmentLink: 'http://localhost:3000/appointment-details/1',
            createdTime: set(startOfYesterday(), { hours: 15, seconds: 1 }).toISOString(),
          },
        ]

        appointmentService.getVideoLinkAppointments.mockResolvedValue(appointments)

        const date = new Date()
        const result = await scheduleService.getSchedule('MDI', date, undefined, 'ACTIVE', user)

        expect(result.appointmentGroups.pop().pop()).toMatchObject({ tags: [] })
      })

      it("should not add the NEW tag to appointments created yesterday before 3pm, if viewing today's appointments", async () => {
        clock = sinon.useFakeTimers(new Date('2024-12-12T09:59:00Z').getTime())

        appointments = [
          {
            id: 1,
            date: formatDate(startOfToday(), 'yyyy-MM-dd'),
            offenderNo: 'ABC123',
            startTime: '07:45',
            endTime: '08:00',
            locationId: 1,
            locationDescription: 'ROOM 1',
            appointmentTypeDescription: 'Video Link - Court Hearing',
            status: 'ACTIVE',
            viewAppointmentLink: 'http://localhost:3000/appointment-details/1',
            createdTime: set(startOfYesterday(), { hours: 14, seconds: 59 }).toISOString(),
          },
        ]

        appointmentService.getVideoLinkAppointments.mockResolvedValue(appointments)

        const date = new Date()
        const result = await scheduleService.getSchedule('MDI', date, undefined, 'ACTIVE', user)

        expect(result.appointmentGroups.pop().pop()).toMatchObject({ tags: [] })
      })

      it("should not add the NEW tag to appointments created today before 3pm, if viewing tomorrow's appointments", async () => {
        clock = sinon.useFakeTimers(new Date('2024-12-12T15:59:00Z').getTime())

        appointments = [
          {
            id: 1,
            date: formatDate(startOfTomorrow(), 'yyyy-MM-dd'),
            offenderNo: 'ABC123',
            startTime: '07:45',
            endTime: '08:00',
            locationId: 1,
            locationDescription: 'ROOM 1',
            appointmentTypeDescription: 'Video Link - Court Hearing',
            status: 'ACTIVE',
            viewAppointmentLink: 'http://localhost:3000/appointment-details/1',
            createdTime: set(startOfToday(), { hours: 14, seconds: 59 }).toISOString(),
          },
        ]

        appointmentService.getVideoLinkAppointments.mockResolvedValue(appointments)

        const date = new Date()
        const result = await scheduleService.getSchedule('MDI', date, undefined, 'ACTIVE', user)

        expect(result.appointmentGroups.pop().pop()).toMatchObject({ tags: [] })
      })

      it("should add the UPDATED tag to appointments updated today up to an hour ago, if viewing today's appointments", async () => {
        clock = sinon.useFakeTimers(new Date('2024-12-12T15:59:00Z').getTime())

        appointments = [
          {
            id: 1,
            date: formatDate(startOfToday(), 'yyyy-MM-dd'),
            offenderNo: 'ABC123',
            startTime: '07:45',
            endTime: '08:00',
            locationId: 1,
            locationDescription: 'ROOM 1',
            appointmentTypeDescription: 'Video Link - Court Hearing',
            status: 'ACTIVE',
            viewAppointmentLink: 'http://localhost:3000/appointment-details/1',
            createdTime: startOfYesterday().toISOString(),
            updatedTime: subMinutes(new Date(), 59).toISOString(),
          },
        ]

        appointmentService.getVideoLinkAppointments.mockResolvedValue(appointments)

        const date = new Date()
        const result = await scheduleService.getSchedule('MDI', date, undefined, 'ACTIVE', user)

        expect(result.appointmentGroups.pop().pop()).toMatchObject({ tags: expect.arrayContaining(['UPDATED']) })
      })

      it("should add the UPDATED tag to appointments updated after 3pm yesterday, if viewing today's appointments and now is before 10am", async () => {
        clock = sinon.useFakeTimers(new Date('2024-12-12T09:59:00Z').getTime())

        appointments = [
          {
            id: 1,
            date: formatDate(startOfToday(), 'yyyy-MM-dd'),
            offenderNo: 'ABC123',
            startTime: '07:45',
            endTime: '08:00',
            locationId: 1,
            locationDescription: 'ROOM 1',
            appointmentTypeDescription: 'Video Link - Court Hearing',
            status: 'ACTIVE',
            viewAppointmentLink: 'http://localhost:3000/appointment-details/1',
            createdTime: startOfYesterday().toISOString(),
            updatedTime: set(startOfYesterday(), { hours: 15, seconds: 1 }).toISOString(),
          },
        ]

        appointmentService.getVideoLinkAppointments.mockResolvedValue(appointments)

        const date = new Date()
        const result = await scheduleService.getSchedule('MDI', date, undefined, 'ACTIVE', user)

        expect(result.appointmentGroups.pop().pop()).toMatchObject({ tags: ['UPDATED'] })
      })

      it("should not add the UPDATED tag to appointments updated today more than an hour ago, if viewing today's appointments", async () => {
        clock = sinon.useFakeTimers(new Date('2024-12-12T15:59:00Z').getTime())

        appointments = [
          {
            id: 1,
            date: formatDate(startOfToday(), 'yyyy-MM-dd'),
            offenderNo: 'ABC123',
            startTime: '07:45',
            endTime: '08:00',
            locationId: 1,
            locationDescription: 'ROOM 1',
            appointmentTypeDescription: 'Video Link - Court Hearing',
            status: 'ACTIVE',
            viewAppointmentLink: 'http://localhost:3000/appointment-details/1',
            createdTime: startOfYesterday().toISOString(),
            updatedTime: subMinutes(new Date(), 61).toISOString(),
          },
        ]

        appointmentService.getVideoLinkAppointments.mockResolvedValue(appointments)

        const date = new Date()
        const result = await scheduleService.getSchedule('MDI', date, undefined, 'ACTIVE', user)

        expect(result.appointmentGroups.pop().pop()).toMatchObject({ tags: [] })
      })

      it("should not add the UPDATED tag to appointments updated after 3pm yesterday, if viewing today's appointments and now is after 10am", async () => {
        clock = sinon.useFakeTimers(new Date('2024-12-12T10:01:00Z').getTime())

        appointments = [
          {
            id: 1,
            date: formatDate(startOfToday(), 'yyyy-MM-dd'),
            offenderNo: 'ABC123',
            startTime: '07:45',
            endTime: '08:00',
            locationId: 1,
            locationDescription: 'ROOM 1',
            appointmentTypeDescription: 'Video Link - Court Hearing',
            status: 'ACTIVE',
            viewAppointmentLink: 'http://localhost:3000/appointment-details/1',
            createdTime: startOfYesterday().toISOString(),
            updatedTime: set(startOfYesterday(), { hours: 15, seconds: 1 }).toISOString(),
          },
        ]

        appointmentService.getVideoLinkAppointments.mockResolvedValue(appointments)

        const date = new Date()
        const result = await scheduleService.getSchedule('MDI', date, undefined, 'ACTIVE', user)

        expect(result.appointmentGroups.pop().pop()).toMatchObject({ tags: [] })
      })

      it("should not add the UPDATED tag to appointments updated before 3pm yesterday, if viewing today's appointments", async () => {
        clock = sinon.useFakeTimers(new Date('2024-12-12T09:59:00Z').getTime())

        appointments = [
          {
            id: 1,
            date: formatDate(startOfToday(), 'yyyy-MM-dd'),
            offenderNo: 'ABC123',
            startTime: '07:45',
            endTime: '08:00',
            locationId: 1,
            locationDescription: 'ROOM 1',
            appointmentTypeDescription: 'Video Link - Court Hearing',
            status: 'ACTIVE',
            viewAppointmentLink: 'http://localhost:3000/appointment-details/1',
            createdTime: startOfYesterday().toISOString(),
            updatedTime: set(startOfYesterday(), { hours: 14, seconds: 59 }).toISOString(),
          },
        ]

        appointmentService.getVideoLinkAppointments.mockResolvedValue(appointments)

        const date = new Date()
        const result = await scheduleService.getSchedule('MDI', date, undefined, 'ACTIVE', user)

        expect(result.appointmentGroups.pop().pop()).toMatchObject({ tags: [] })
      })
    })
  })
})
