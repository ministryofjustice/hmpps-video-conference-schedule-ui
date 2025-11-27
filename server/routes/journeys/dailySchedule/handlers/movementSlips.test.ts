import type { Express } from 'express'
import request from 'supertest'
import { startOfToday } from 'date-fns'
import { load } from 'cheerio'
import { appWithAllRoutes, user } from '../../../testutils/appSetup'
import AuditService from '../../../../services/auditService'
import PrisonService from '../../../../services/prisonService'
import ScheduleService from '../../../../services/scheduleService'
import { getByClass, getByDataQa } from '../../../testutils/cheerio'
import { formatDate } from '../../../../utils/utils'

jest.mock('../../../../services/auditService')
jest.mock('../../../../services/prisonService')
jest.mock('../../../../services/scheduleService')

const auditService = new AuditService(null) as jest.Mocked<AuditService>
const prisonService = new PrisonService(null, null) as jest.Mocked<PrisonService>
const scheduleService = new ScheduleService(null, null, null, null, null, null) as jest.Mocked<ScheduleService>

let app: Express

const appSetup = (journeySession = {}) => {
  app = appWithAllRoutes({
    services: { auditService, prisonService, scheduleService },
    userSupplier: () => user,
    journeySessionSupplier: () => journeySession,
  })
}

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET', () => {
  beforeEach(() => {
    appSetup()
  })

  it('should render a court movement slip', () => {
    scheduleService.getSchedule.mockResolvedValue({
      appointmentsListed: 2,
      numberOfPrisoners: 1,
      cancelledAppointments: 0,
      missingVideoLinks: 0,
      appointmentGroups: [
        [
          {
            appointmentTypeCode: 'VLB',
            appointmentTypeDescription: 'Pre-hearing',
            appointmentId: 1,
            appointmentLocationId: 'test',
            appointmentLocationDescription: 'ROOM 1',
            externalAgencyCode: 'MANCM',
            externalAgencyDescription: 'Manchester Magistrates',
            lastUpdatedOrCreated: startOfToday().toISOString(),
            prisoner: {
              cellLocation: 'A-1-001',
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
            appointmentSubtypeDescription: '',
            notesForPrisoner: 'court prisoner notes',
          },
          {
            appointmentTypeCode: 'VLB',
            appointmentTypeDescription: 'Court Hearing',
            appointmentId: 2,
            appointmentLocationId: 'test',
            appointmentLocationDescription: 'COURT ROOM',
            appointmentSubtypeDescription: 'Appeal',
            externalAgencyCode: 'MANCM',
            externalAgencyDescription: 'Manchester Magistrates',
            lastUpdatedOrCreated: startOfToday().toISOString(),
            prisoner: {
              cellLocation: 'A-1-001',
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
            videoLink: 'http://video.url',
            videoLinkRequired: true,
            viewAppointmentLink: 'http://localhost:3000/appointment-details/2',
            notesForPrisoner: 'court prisoner notes',
          },
          {
            appointmentTypeCode: 'VLB',
            appointmentTypeDescription: 'Post-hearing',
            appointmentId: 3,
            appointmentLocationId: 'test',
            appointmentLocationDescription: 'COURT ROOM',
            appointmentSubtypeDescription: 'Appeal',
            externalAgencyCode: 'MANCM',
            externalAgencyDescription: 'Manchester Magistrates',
            lastUpdatedOrCreated: startOfToday().toISOString(),
            prisoner: {
              cellLocation: 'A-1-001',
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
            videoLink: 'http://video.url',
            videoLinkRequired: true,
            viewAppointmentLink: 'http://localhost:3000/appointment-details/3',
            notesForPrisoner: 'court prisoner notes',
          },
        ],
      ],
    })

    return request(app)
      .get('/movement-slips?date=2055-07-20')
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = load(res.text)

        expect(getByClass($, 'movement-slip-header').text().trim()).toEqual(
          'Moorland (HMP) Video appointment movement authorisation slip',
        )
        expect(getByDataQa($, 'date-1').text()).toEqual('20 July 2055')
        expect(getByDataQa($, 'prisoner-name-and-number-1').text().trim()).toEqual(
          'Joe Bloggs, ABC123. Location: A-1-001',
        )
        expect(getByDataQa($, 'pre-court-hearing-1').text().trim()).toEqual('07:45 to 08:00')
        expect(getByDataQa($, 'court-hearing---appeal-1').text().trim()).toEqual('08:00 to 09:00')
        expect(getByDataQa($, 'post-court-hearing-1').text().trim()).toEqual('09:00 to 09:15')
        expect(getByDataQa($, 'pick-up-time-1').text().trim()).toEqual('07:15')
        expect(getByDataQa($, 'location-1').text().trim()).toEqual('COURT ROOM')
        expect(getByDataQa($, 'notes-1').text().trim()).toEqual('court prisoner notes')
      })
  })

  it('should render a probation movement slip', () => {
    scheduleService.getSchedule.mockResolvedValue({
      appointmentsListed: 1,
      numberOfPrisoners: 1,
      cancelledAppointments: 0,
      missingVideoLinks: 0,
      appointmentGroups: [
        [
          {
            appointmentTypeCode: 'VLPM',
            appointmentTypeDescription: 'Probation Meeting',
            appointmentId: 2,
            appointmentLocationId: 'test',
            appointmentLocationDescription: 'PROBATION ROOM',
            appointmentSubtypeDescription: 'Other',
            externalAgencyCode: 'MANCM',
            externalAgencyDescription: 'Manchester Magistrates',
            lastUpdatedOrCreated: startOfToday().toISOString(),
            prisoner: {
              cellLocation: 'P-1-001',
              firstName: 'Fred',
              hasAlerts: false,
              inPrison: true,
              lastName: 'Flintrock',
              prisonerNumber: 'FRE123',
            },
            startTime: '10:00',
            endTime: '12:00',
            status: 'ACTIVE',
            tags: [],
            videoBookingId: 1,
            videoLinkRequired: false,
            notesForPrisoner: 'probation prisoner notes',
          },
        ],
      ],
    })

    return request(app)
      .get('/movement-slips?date=2055-07-19')
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = load(res.text)

        expect(getByClass($, 'movement-slip-header').text().trim()).toEqual(
          'Moorland (HMP) Video appointment movement authorisation slip',
        )
        expect(getByDataQa($, 'date-1').text()).toEqual('19 July 2055')
        expect(getByDataQa($, 'prisoner-name-and-number-1').text().trim()).toEqual(
          'Fred Flintrock, FRE123. Location: P-1-001',
        )
        expect(getByDataQa($, 'probation-meeting---other-1').text().trim()).toEqual('10:00 to 12:00')
        expect(getByDataQa($, 'pick-up-time-1').text().trim()).toEqual('09:30')
        expect(getByDataQa($, 'location-1').text().trim()).toEqual('PROBATION ROOM')
        expect(getByDataQa($, 'notes-1').text().trim()).toEqual('probation prisoner notes')
      })
  })

  it('should render another prison movement slip', () => {
    scheduleService.getSchedule.mockResolvedValue({
      appointmentsListed: 1,
      numberOfPrisoners: 1,
      cancelledAppointments: 0,
      missingVideoLinks: 0,
      appointmentGroups: [
        [
          {
            appointmentTypeCode: 'VLAP',
            appointmentTypeDescription: 'Custom description (Another Prison)',
            appointmentId: 1,
            appointmentLocationDescription: 'In Cell',
            lastUpdatedOrCreated: startOfToday().toISOString(),
            prisoner: {
              cellLocation: 'W-001',
              firstName: 'Wilma',
              hasAlerts: false,
              inPrison: true,
              lastName: 'Flintrock',
              prisonerNumber: 'WIL123',
            },
            startTime: '14:30',
            endTime: '15:00',
            status: 'ACTIVE',
            tags: [],
            videoLinkRequired: false,
            appointmentLocationId: '',
            appointmentSubtypeDescription: '',
            notesForPrisoner: 'Some VALP notes for prisoner',
          },
        ],
      ],
    })

    return request(app)
      .get('/movement-slips?date=2055-07-18')
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = load(res.text)

        expect(getByClass($, 'movement-slip-header').text().trim()).toEqual(
          'Moorland (HMP) Video appointment movement authorisation slip',
        )
        expect(getByDataQa($, 'date-1').text()).toEqual('18 July 2055')
        expect(getByDataQa($, 'prisoner-name-and-number-1').text().trim()).toEqual(
          'Wilma Flintrock, WIL123. Location: W-001',
        )
        expect(getByDataQa($, 'another-prison-1').text().trim()).toEqual('14:30 to 15:00')
        expect(getByDataQa($, 'pick-up-time-1').text().trim()).toEqual('14:00')
        expect(getByDataQa($, 'location-1').text().trim()).toEqual('In Cell')
        expect(getByDataQa($, 'notes-1').text().trim()).toEqual('Some VALP notes for prisoner')
      })
  })

  it('should render a legal movement slip', () => {
    scheduleService.getSchedule.mockResolvedValue({
      appointmentsListed: 1,
      numberOfPrisoners: 1,
      cancelledAppointments: 0,
      missingVideoLinks: 0,
      appointmentGroups: [
        [
          {
            appointmentTypeCode: 'VLLA',
            appointmentTypeDescription: 'Custom description (Legal Appointment)',
            appointmentId: 6,
            appointmentLocationDescription: 'In Cell',
            lastUpdatedOrCreated: startOfToday().toISOString(),
            prisoner: {
              cellLocation: 'W-002',
              firstName: 'Barney',
              hasAlerts: false,
              inPrison: true,
              lastName: 'Rabble',
              prisonerNumber: 'BAR123',
            },
            startTime: '16:30',
            endTime: '17:30',
            status: 'ACTIVE',
            tags: [],
            videoLinkRequired: false,
            appointmentLocationId: '',
            appointmentSubtypeDescription: '',
            notesForPrisoner: 'Some VLLA notes for prisoner',
          },
        ],
      ],
    })

    return request(app)
      .get('/movement-slips?date=2055-07-17')
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = load(res.text)

        expect(getByClass($, 'movement-slip-header').text().trim()).toEqual(
          'Moorland (HMP) Video appointment movement authorisation slip',
        )
        expect(getByDataQa($, 'date-1').text()).toEqual('17 July 2055')
        expect(getByDataQa($, 'prisoner-name-and-number-1').text().trim()).toEqual(
          'Barney Rabble, BAR123. Location: W-002',
        )
        expect(getByDataQa($, 'legal-appointment-1').text().trim()).toEqual('16:30 to 17:30')
        expect(getByDataQa($, 'pick-up-time-1').text().trim()).toEqual('16:00')
        expect(getByDataQa($, 'location-1').text().trim()).toEqual('In Cell')
        expect(getByDataQa($, 'notes-1').text().trim()).toEqual('Some VLLA notes for prisoner')
      })
  })

  it('should render a official other movement slip', () => {
    scheduleService.getSchedule.mockResolvedValue({
      appointmentsListed: 1,
      numberOfPrisoners: 1,
      cancelledAppointments: 0,
      missingVideoLinks: 0,
      appointmentGroups: [
        [
          {
            appointmentTypeCode: 'VLOO',
            appointmentTypeDescription: 'Custom description (Official Other)',
            appointmentId: 6,
            appointmentLocationDescription: 'In Cell',
            lastUpdatedOrCreated: startOfToday().toISOString(),
            prisoner: {
              cellLocation: 'X-001',
              firstName: 'Betty',
              hasAlerts: false,
              inPrison: true,
              lastName: 'Rabble',
              prisonerNumber: 'BET123',
            },
            startTime: '15:15',
            endTime: '16:00',
            status: 'ACTIVE',
            tags: [],
            videoLinkRequired: false,
            appointmentLocationId: '',
            appointmentSubtypeDescription: '',
            notesForPrisoner: 'Some VLOO notes for prisoner',
          },
        ],
      ],
    })

    return request(app)
      .get('/movement-slips?date=2055-07-16')
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = load(res.text)

        expect(getByClass($, 'movement-slip-header').text().trim()).toEqual(
          'Moorland (HMP) Video appointment movement authorisation slip',
        )
        expect(getByDataQa($, 'date-1').text()).toEqual('16 July 2055')
        expect(getByDataQa($, 'prisoner-name-and-number-1').text().trim()).toEqual(
          'Betty Rabble, BET123. Location: X-001',
        )
        expect(getByDataQa($, 'official-other-1').text().trim()).toEqual('15:15 to 16:00')
        expect(getByDataQa($, 'pick-up-time-1').text().trim()).toEqual('14:45')
        expect(getByDataQa($, 'location-1').text().trim()).toEqual('In Cell')
        expect(getByDataQa($, 'notes-1').text().trim()).toEqual('Some VLOO notes for prisoner')
      })
  })

  it('should render a parole movement slip', () => {
    scheduleService.getSchedule.mockResolvedValue({
      appointmentsListed: 1,
      numberOfPrisoners: 1,
      cancelledAppointments: 0,
      missingVideoLinks: 0,
      appointmentGroups: [
        [
          {
            appointmentTypeCode: 'VLPA',
            appointmentTypeDescription: 'Custom description (Parole Hearing)',
            appointmentId: 6,
            appointmentLocationDescription: 'In Cell',
            lastUpdatedOrCreated: startOfToday().toISOString(),
            prisoner: {
              cellLocation: 'D-055',
              firstName: 'Don',
              hasAlerts: false,
              inPrison: true,
              lastName: 'Key',
              prisonerNumber: 'DON123',
            },
            startTime: '09:15',
            endTime: '10:00',
            status: 'ACTIVE',
            tags: [],
            videoLinkRequired: false,
            appointmentLocationId: '',
            appointmentSubtypeDescription: '',
            notesForPrisoner: 'Some VLPA notes for prisoner',
          },
        ],
      ],
    })

    return request(app)
      .get('/movement-slips?date=2055-07-16')
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = load(res.text)

        expect(getByClass($, 'movement-slip-header').text().trim()).toEqual(
          'Moorland (HMP) Video appointment movement authorisation slip',
        )
        expect(getByDataQa($, 'date-1').text()).toEqual('16 July 2055')
        expect(getByDataQa($, 'prisoner-name-and-number-1').text().trim()).toEqual('Don Key, DON123. Location: D-055')
        expect(getByDataQa($, 'parole-hearing-1').text().trim()).toEqual('09:15 to 10:00')
        expect(getByDataQa($, 'pick-up-time-1').text().trim()).toEqual('08:45')
        expect(getByDataQa($, 'location-1').text().trim()).toEqual('In Cell')
        expect(getByDataQa($, 'notes-1').text().trim()).toEqual('Some VLPA notes for prisoner')
      })
  })

  it(`should render movements slip page for today`, () => {
    scheduleService.getSchedule.mockResolvedValue({
      appointmentsListed: 1,
      numberOfPrisoners: 1,
      cancelledAppointments: 0,
      missingVideoLinks: 0,
      appointmentGroups: [
        [
          {
            appointmentTypeCode: 'VLPA',
            appointmentTypeDescription: 'Custom description (Parole Hearing)',
            appointmentId: 6,
            appointmentLocationDescription: 'In Cell',
            lastUpdatedOrCreated: startOfToday().toISOString(),
            prisoner: {
              cellLocation: 'D-055',
              firstName: 'Don',
              hasAlerts: false,
              inPrison: true,
              lastName: 'Key',
              prisonerNumber: 'DON123',
            },
            startTime: '09:15',
            endTime: '10:00',
            status: 'ACTIVE',
            tags: [],
            videoLinkRequired: false,
            appointmentLocationId: '',
            appointmentSubtypeDescription: '',
            notesForPrisoner: 'Some VLPA notes for prisoner',
          },
        ],
      ],
    })

    return request(app)
      .get(`/movement-slips?date=${startOfToday().toISOString()}`)
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = load(res.text)

        expect(getByClass($, 'movement-slip-header').text().trim()).toEqual(
          'Moorland (HMP) Video appointment movement authorisation slip',
        )
        expect(getByDataQa($, 'date-1').text()).toEqual(formatDate(startOfToday()))
        expect(getByDataQa($, 'prisoner-name-and-number-1').text().trim()).toEqual('Don Key, DON123. Location: D-055')
        expect(getByDataQa($, 'parole-hearing-1').text().trim()).toEqual('09:15 to 10:00')
        expect(getByDataQa($, 'pick-up-time-1').text().trim()).toEqual('08:45')
        expect(getByDataQa($, 'location-1').text().trim()).toEqual('In Cell')
        expect(getByDataQa($, 'notes-1').text().trim()).toEqual('Some VLPA notes for prisoner')
      })
  })

  it(`should redirect to daily schedule when date is before today`, () => {
    return request(app).get('/movement-slips?date=2025-08-03').expect(302).expect('location', `/`)
  })
})
