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

jest.mock('../services/appointmentService')
jest.mock('../data/nomisMappingApiClient')
jest.mock('../data/bookAVideoLinkApiClient')
jest.mock('../data/prisonerSearchApiClient')
jest.mock('../data/manageUsersApiClient')

const user = createUser([])

describe('Schedule service', () => {
  let appointmentService: jest.Mocked<AppointmentService>
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
    nomisMappingApiClient = new NomisMappingApiClient() as jest.Mocked<NomisMappingApiClient>
    bookAVideoLinkApiClient = new BookAVideoLinkApiClient() as jest.Mocked<BookAVideoLinkApiClient>
    prisonerSearchApiClient = new PrisonerSearchApiClient() as jest.Mocked<PrisonerSearchApiClient>
    manageUsersApiClient = new ManageUsersApiClient() as jest.Mocked<ManageUsersApiClient>
    scheduleService = new ScheduleService(
      appointmentService,
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
      const result = await scheduleService.getSchedule('MDI', date, 'ACTIVE', user)

      expect(result).toEqual({
        appointmentGroups: [
          [
            {
              appointmentType: 'Pre-hearing',
              appointmentId: 1,
              appointmentLocationDescription: 'ROOM 1',
              appointmentSubtype: false,
              externalAgencyDescription: false,
              lastUpdatedOrCreated: startOfToday().toISOString(),
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
              appointmentType: 'Court Hearing',
              appointmentId: 2,
              appointmentLocationDescription: 'ROOM 1',
              appointmentSubtype: 'Appeal',
              externalAgencyDescription: 'Aberystwyth Civil',
              lastUpdatedOrCreated: startOfToday().toISOString(),
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
              tags: ['LINK_MISSING'],
              videoBookingId: 1,
              videoLinkRequired: true,
              viewAppointmentLink: 'http://localhost:3000/appointment-details/2',
            },
            {
              appointmentType: 'Post-hearing',
              appointmentId: 3,
              appointmentLocationDescription: 'ROOM 1',
              appointmentSubtype: false,
              externalAgencyDescription: false,
              lastUpdatedOrCreated: startOfToday().toISOString(),
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
              appointmentType: 'Official Other',
              appointmentId: 4,
              appointmentLocationDescription: 'ROOM 2',
              appointmentSubtype: false,
              externalAgencyDescription: false,
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
              videoLink: false,
              videoLinkRequired: false,
              viewAppointmentLink: 'http://localhost:3000/appointment-details/4',
            },
          ],
          [
            {
              appointmentType: 'Official Other',
              appointmentId: 4,
              appointmentLocationDescription: 'ROOM 2',
              appointmentSubtype: false,
              externalAgencyDescription: false,
              lastUpdatedOrCreated: startOfToday().toISOString(),
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
              appointmentType: 'Probation',
              appointmentId: 5,
              appointmentLocationDescription: 'ROOM 3',
              appointmentSubtype: 'Recall report',
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
              videoLink: false,
              videoLinkRequired: false,
              viewAppointmentLink: 'http://localhost:3000/appointment-details/5',
            },
          ],
          [
            {
              appointmentType: 'Legal Appointment',
              appointmentId: 7,
              appointmentLocationDescription: 'ROOM 2',
              appointmentSubtype: false,
              endTime: '17:30',
              externalAgencyDescription: false,
              lastUpdatedOrCreated: startOfToday().toISOString(),
              prisoner: {
                cellLocation: 'MDI-1-1-001',
                firstName: 'Joe',
                hasAlerts: false,
                inPrison: true,
                lastName: 'Bloggs',
                prisonerNumber: 'ABC123',
              },
              startTime: '16:30',
              status: 'ACTIVE',
              tags: [],
              videoLink: false,
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

      expect(appointmentService.getVideoLinkAppointments).toHaveBeenLastCalledWith('MDI', date, user)
      expect(bookAVideoLinkApiClient.getVideoLinkAppointments).toHaveBeenLastCalledWith('MDI', date, user)
      expect(prisonerSearchApiClient.getByPrisonerNumbers).toHaveBeenLastCalledWith(['ABC123', 'ZXY321'], user)
      expect(nomisMappingApiClient.getLocationMappingByNomisId).toHaveBeenCalledTimes(5)
      expect(nomisMappingApiClient.getLocationMappingByNomisId).toHaveBeenNthCalledWith(1, 1, user)
      expect(nomisMappingApiClient.getLocationMappingByNomisId).toHaveBeenNthCalledWith(2, 1, user)
      expect(nomisMappingApiClient.getLocationMappingByNomisId).toHaveBeenNthCalledWith(3, 1, user)
      expect(nomisMappingApiClient.getLocationMappingByNomisId).toHaveBeenNthCalledWith(4, 3, user)
      expect(nomisMappingApiClient.getLocationMappingByNomisId).toHaveBeenNthCalledWith(5, 3, user)
    })

    it('builds a view of the cancelled appointments', async () => {
      const date = new Date('2024-12-12')
      const result = await scheduleService.getSchedule('MDI', date, 'CANCELLED', user)

      expect(result).toEqual({
        appointmentGroups: [
          [
            {
              appointmentType: 'Probation',
              appointmentId: 8,
              appointmentLocationDescription: 'ROOM 3',
              appointmentSubtype: 'Recall report',
              endTime: '12:00',
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
              videoLink: false,
              videoLinkRequired: false,
              viewAppointmentLink: 'http://localhost:3000/appointment-details/8',
              cancelledBy: 'External user',
              cancelledTime: '2024-12-12T11:59:00Z',
            },
          ],
          [
            {
              appointmentType: 'Legal Appointment',
              appointmentId: 6,
              appointmentLocationDescription: 'ROOM 2',
              appointmentSubtype: false,
              externalAgencyDescription: false,
              lastUpdatedOrCreated: startOfToday().toISOString(),
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

      expect(appointmentService.getVideoLinkAppointments).toHaveBeenLastCalledWith('MDI', date, user)
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
        const result = await scheduleService.getSchedule('MDI', date, 'ACTIVE', user)

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
        const result = await scheduleService.getSchedule('MDI', date, 'ACTIVE', user)

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
        const result = await scheduleService.getSchedule('MDI', date, 'ACTIVE', user)

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
        const result = await scheduleService.getSchedule('MDI', date, 'ACTIVE', user)

        expect(result.appointmentGroups.pop().pop()).toMatchObject({ tags: [] })
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
        const result = await scheduleService.getSchedule('MDI', date, 'ACTIVE', user)

        expect(result.appointmentGroups.pop().pop()).toMatchObject({ tags: ['NEW'] })
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
        const result = await scheduleService.getSchedule('MDI', date, 'ACTIVE', user)

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
        const result = await scheduleService.getSchedule('MDI', date, 'ACTIVE', user)

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
        const result = await scheduleService.getSchedule('MDI', date, 'ACTIVE', user)

        expect(result.appointmentGroups.pop().pop()).toMatchObject({ tags: [] })
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
        const result = await scheduleService.getSchedule('MDI', date, 'ACTIVE', user)

        expect(result.appointmentGroups.pop().pop()).toMatchObject({ tags: ['UPDATED'] })
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
        const result = await scheduleService.getSchedule('MDI', date, 'ACTIVE', user)

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
        const result = await scheduleService.getSchedule('MDI', date, 'ACTIVE', user)

        expect(result.appointmentGroups.pop().pop()).toMatchObject({ tags: [] })
      })
    })
  })
})
