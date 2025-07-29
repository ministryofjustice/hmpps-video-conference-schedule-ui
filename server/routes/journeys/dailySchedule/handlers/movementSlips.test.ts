import type { Express } from 'express'
import request from 'supertest'
import { startOfToday } from 'date-fns'
import { load } from 'cheerio'
import { appWithAllRoutes, user } from '../../../testutils/appSetup'
import AuditService from '../../../../services/auditService'
import PrisonService from '../../../../services/prisonService'
import ScheduleService from '../../../../services/scheduleService'
import { Prison } from '../../../../@types/prisonRegisterApi/types'
import { getByClass, getByDataQa } from '../../../testutils/cheerio'
import config from '../../../../config'

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

beforeEach(() => {
  prisonService.getPrison.mockResolvedValue({ prisonName: 'Moorland (HMP)' } as Prison)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET with feature toggle on', () => {
  beforeEach(() => {
    config.featureBulkPrintMovementSlips = true
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
        ],
      ],
    })

    return request(app)
      .get('/movement-slips?date=2025-07-16')
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = load(res.text)

        expect(getByClass($, 'movement-slip-header').text()).toContain(
          'Moorland (HMP) Video appointment movement authorisation slip',
        )
        expect(getByDataQa($, 'prisoner-name-and-number').text()).toContain('Joe Bloggs, ABC123')
        expect(getByDataQa($, 'pre-court-hearing').text()).toContain('07:45')
        expect(getByDataQa($, 'court-hearing---appeal').text()).toContain('08:00')
        expect(getByDataQa($, 'pick-up-time').text()).toContain('07:15')
        expect(getByDataQa($, 'location').text()).toContain('COURT ROOM')
        expect(getByDataQa($, 'notes').text()).toContain('court prisoner notes')
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
      .get('/movement-slips?date=2025-07-16')
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = load(res.text)

        expect(getByClass($, 'movement-slip-header').text()).toContain(
          'Moorland (HMP) Video appointment movement authorisation slip',
        )
        expect(getByDataQa($, 'prisoner-name-and-number').text()).toContain('Fred Flintrock, FRE123')
        expect(getByDataQa($, 'probation-meeting---other').text()).toContain('10:00')
        expect(getByDataQa($, 'pick-up-time').text()).toContain('09:30')
        expect(getByDataQa($, 'location').text()).toContain('PROBATION ROOM')
        expect(getByDataQa($, 'notes').text()).toContain('probation prisoner notes')
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
            appointmentTypeDescription: 'Another Prison',
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
          },
        ],
      ],
    })

    return request(app)
      .get('/movement-slips?date=2025-07-16')
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = load(res.text)

        expect(getByClass($, 'movement-slip-header').text()).toContain(
          'Moorland (HMP) Video appointment movement authorisation slip',
        )
        expect(getByDataQa($, 'prisoner-name-and-number').text()).toContain('Wilma Flintrock, WIL123')
        expect(getByDataQa($, 'another-prison').text()).toContain('14:30')
        expect(getByDataQa($, 'pick-up-time').text()).toContain('14:00')
        expect(getByDataQa($, 'location').text()).toContain('In Cell')
        expect(getByDataQa($, 'notes').text()).toContain('')
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
            appointmentTypeDescription: 'Legal Appointment',
            appointmentId: 6,
            appointmentLocationDescription: 'In Cell',
            lastUpdatedOrCreated: startOfToday().toISOString(),
            prisoner: {
              cellLocation: 'W-001',
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
          },
        ],
      ],
    })

    return request(app)
      .get('/movement-slips?date=2025-07-16')
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = load(res.text)

        expect(getByClass($, 'movement-slip-header').text()).toContain(
          'Moorland (HMP) Video appointment movement authorisation slip',
        )
        expect(getByDataQa($, 'prisoner-name-and-number').text()).toContain('Barney Rabble, BAR123')
        expect(getByDataQa($, 'legal-appointment').text()).toContain('16:30')
        expect(getByDataQa($, 'pick-up-time').text()).toContain('16:00')
        expect(getByDataQa($, 'location').text()).toContain('In Cell')
        expect(getByDataQa($, 'notes').text()).toContain('')
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
            appointmentTypeDescription: 'Official Other',
            appointmentId: 6,
            appointmentLocationDescription: 'In Cell',
            lastUpdatedOrCreated: startOfToday().toISOString(),
            prisoner: {
              cellLocation: 'W-001',
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
          },
        ],
      ],
    })

    return request(app)
      .get('/movement-slips?date=2025-07-16')
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = load(res.text)

        expect(getByClass($, 'movement-slip-header').text()).toContain(
          'Moorland (HMP) Video appointment movement authorisation slip',
        )
        expect(getByDataQa($, 'prisoner-name-and-number').text()).toContain('Betty Rabble, BET123')
        expect(getByDataQa($, 'official-other').text()).toContain('15:15')
        expect(getByDataQa($, 'pick-up-time').text()).toContain('14:45')
        expect(getByDataQa($, 'location').text()).toContain('In Cell')
        expect(getByDataQa($, 'notes').text()).toContain('')
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
            appointmentTypeDescription: 'Parole Hearing',
            appointmentId: 6,
            appointmentLocationDescription: 'In Cell',
            lastUpdatedOrCreated: startOfToday().toISOString(),
            prisoner: {
              cellLocation: 'W-001',
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
          },
        ],
      ],
    })

    return request(app)
      .get('/movement-slips?date=2025-07-16')
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = load(res.text)

        expect(getByClass($, 'movement-slip-header').text()).toContain(
          'Moorland (HMP) Video appointment movement authorisation slip',
        )
        expect(getByDataQa($, 'prisoner-name-and-number').text()).toContain('Don Key, DON123')
        expect(getByDataQa($, 'parole-hearing').text()).toContain('09:15')
        expect(getByDataQa($, 'pick-up-time').text()).toContain('08:45')
        expect(getByDataQa($, 'location').text()).toContain('In Cell')
        expect(getByDataQa($, 'notes').text()).toContain('')
      })
  })
})

describe('GET with feature toggle off', () => {
  beforeEach(() => {
    config.featureBulkPrintMovementSlips = false
    appSetup()
  })

  it('should not render a movement slip', () => {
    return request(app)
      .get('/movement-slips?date=2025-07-16')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(load(res.text).html()).toContain('Page not found')
      })
  })
})
