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

jest.mock('../../../../services/auditService')
jest.mock('../../../../services/prisonService')
jest.mock('../../../../services/scheduleService')

const auditService = new AuditService(null) as jest.Mocked<AuditService>
const prisonService = new PrisonService(null, null) as jest.Mocked<PrisonService>
const scheduleService = new ScheduleService(null, null, null, null, null, null) as jest.Mocked<ScheduleService>

let app: Express
const filters = {}

const appSetup = (journeySession = {}) => {
  app = appWithAllRoutes({
    services: { auditService, prisonService, scheduleService },
    userSupplier: () => user,
    journeySessionSupplier: () => journeySession,
  })
}

beforeEach(() => {
  appSetup({ scheduleFilters: filters })

  prisonService.getPrison.mockResolvedValue({ prisonName: 'Moorland (HMP)' } as Prison)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET', () => {
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
            notesForPrisoner: 'prisoner notes',
          },
          {
            appointmentTypeCode: 'VLB',
            appointmentTypeDescription: 'Court Hearing',
            appointmentId: 2,
            appointmentLocationId: 'test',
            appointmentLocationDescription: 'ROOM 1',
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
            notesForPrisoner: 'prisoner notes',
          },
        ],
      ],
    })

    return request(app)
      .get('/movement-slips?date=2025-07-16')
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = load(res.text)

        expect(getByClass($, 'movement-slip-header').text()).toContain('Moorland (HMP) Movement authorisation slip')
        expect(getByDataQa($, 'prisoner-name-and-number').text()).toContain('Joe Bloggs, ABC123')
        expect(getByDataQa($, 'pre-court-hearing').text()).toContain('07:45')
        expect(getByDataQa($, 'court-hearing---appeal').text()).toContain('08:00')
        expect(getByDataQa($, 'pick-up-time').text()).toContain('07:15')
        expect(getByDataQa($, 'location').text()).toContain('ROOM 1')
        expect(getByDataQa($, 'notes').text()).toContain('prisoner notes')
      })
  })
})
