import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { startOfDay, startOfToday } from 'date-fns'
import { appWithAllRoutes, user } from '../../../testutils/appSetup'
import AuditService, { Page } from '../../../../services/auditService'
import PrisonService from '../../../../services/prisonService'
import { Prison } from '../../../../@types/prisonRegisterApi/types'
import ScheduleService from '../../../../services/scheduleService'
import { existsByClass, existsByDataQa, getByClass } from '../../../testutils/cheerio'
import ReferenceDataService from '../../../../services/referenceDataService'
import expectJourneySession from '../../../testutils/testUtilRoute'

jest.mock('../../../../services/auditService')
jest.mock('../../../../services/referenceDataService')
jest.mock('../../../../services/prisonService')
jest.mock('../../../../services/scheduleService')

const auditService = new AuditService(null) as jest.Mocked<AuditService>
const referenceDataService = new ReferenceDataService(null, null, null) as jest.Mocked<ReferenceDataService>
const prisonService = new PrisonService(null, null) as jest.Mocked<PrisonService>
const scheduleService = new ScheduleService(null, null, null, null, null, null) as jest.Mocked<ScheduleService>

let app: Express
const filters = { wing: ['A'] }

const appSetup = (journeySession = {}) => {
  app = appWithAllRoutes({
    services: { auditService, referenceDataService, prisonService, scheduleService },
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
  it('should render index page for today', () => {
    return request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = cheerio.load(res.text)
        const heading = $('h1').text().trim()

        expect(heading).toContain('Video daily schedule: Moorland (HMP)')
        expect(existsByDataQa($, 'warning-text')).toBe(false)

        expect(auditService.logPageView).toHaveBeenCalledWith(Page.DAILY_SCHEDULE_PAGE, {
          who: user.username,
          correlationId: expect.any(String),
          details: JSON.stringify({ query: {} }),
        })
        expect(prisonService.getPrison).toHaveBeenLastCalledWith('MDI', user)
        expect(prisonService.isAppointmentsRolledOutAt).toHaveBeenLastCalledWith('MDI', user)
        expect(referenceDataService.getAppointmentCategories).toHaveBeenLastCalledWith(user)
        expect(referenceDataService.getAppointmentLocations).toHaveBeenLastCalledWith('MDI', user)
        expect(referenceDataService.getCourtsAndProbationTeams).toHaveBeenLastCalledWith(user)
        expect(referenceDataService.getCellsByWing).toHaveBeenLastCalledWith('MDI', user)
        expect(scheduleService.getSchedule).toHaveBeenLastCalledWith('MDI', startOfToday(), filters, 'ACTIVE', user)
      })
  })

  it('should render index page for specific date', () => {
    return request(app)
      .get('/?date=2024-12-12')
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = cheerio.load(res.text)
        const heading = $('h1').text().trim()
        const date = new Date('2024-12-12')
        const backLinkText = $('.govuk-back-link').text().trim()

        expect(heading).toContain('Video daily schedule: Moorland (HMP)')
        expect(backLinkText).toEqual("Back to today's schedule")
        expect(auditService.logPageView).toHaveBeenCalledWith(Page.DAILY_SCHEDULE_PAGE, {
          who: user.username,
          correlationId: expect.any(String),
          details: JSON.stringify({ query: { date: '2024-12-12' } }),
        })
        expect(existsByDataQa($, 'warning-text')).toBe(true)
        expect(scheduleService.getSchedule).toHaveBeenLastCalledWith('MDI', startOfDay(date), filters, 'ACTIVE', user)
      })
  })

  it('should render index page for today if given date is invalid', () => {
    return request(app)
      .get('/?date=nonsense')
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = cheerio.load(res.text)
        const heading = $('h1').text().trim()

        expect(heading).toContain('Video daily schedule: Moorland (HMP)')
        expect(scheduleService.getSchedule).toHaveBeenLastCalledWith(
          'MDI',
          startOfDay(new Date()),
          filters,
          'ACTIVE',
          user,
        )
      })
  })

  it('should render index page for cancelled appointments', () => {
    prisonService.isAppointmentsRolledOutAt.mockResolvedValue(true)

    return request(app)
      .get('/?status=CANCELLED')
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = cheerio.load(res.text)
        const heading = $('h1').text().trim()

        expect(heading).toContain('Cancelled video appointments: Moorland (HMP)')
        expect(existsByClass($, 'govuk-warning-text')).toBe(false)
        expect(auditService.logPageView).toHaveBeenCalledWith(Page.DAILY_SCHEDULE_PAGE, {
          who: user.username,
          correlationId: expect.any(String),
          details: JSON.stringify({ query: { status: 'CANCELLED' } }),
        })
        expect(scheduleService.getSchedule).toHaveBeenLastCalledWith('MDI', startOfToday(), filters, 'CANCELLED', user)
      })
  })

  it('should show warning text for the cancelled appointments page when the prison is not rolled out for A&A', () => {
    prisonService.isAppointmentsRolledOutAt.mockResolvedValue(false)

    return request(app)
      .get('/?status=CANCELLED')
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = cheerio.load(res.text)
        const heading = $('h1').text().trim()
        const warningText = getByClass($, 'govuk-warning-text').text().trim()

        expect(heading).toContain('Cancelled video appointments: Moorland (HMP)')
        expect(warningText).toContain('Only court hearings and probation meetings are shown.')
      })
  })

  it('should render index page for active appointments if status is invalid', () => {
    return request(app)
      .get('/?status=NONSENSE')
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = cheerio.load(res.text)
        const heading = $('h1').text().trim()

        expect(heading).toContain('Video daily schedule: Moorland (HMP)')
        expect(scheduleService.getSchedule).toHaveBeenLastCalledWith('MDI', startOfToday(), filters, 'ACTIVE', user)
      })
  })

  it('should render back link to A&A if prison is rolled out for A&A', () => {
    prisonService.isAppointmentsRolledOutAt.mockResolvedValue(true)

    return request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = cheerio.load(res.text)
        const heading = $('h1').text().trim()
        const backLinkText = $('.govuk-back-link').text().trim()

        expect(heading).toEqual('Video daily schedule: Moorland (HMP)')
        expect(backLinkText).toEqual('Back to all appointments tasks')
      })
  })

  it('should render back link to Whereabouts if prison is not rolled out for A&A', () => {
    prisonService.isAppointmentsRolledOutAt.mockResolvedValue(false)

    return request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = cheerio.load(res.text)
        const heading = $('h1').text().trim()
        const backLinkText = $('.govuk-back-link').text().trim()

        expect(heading).toEqual('Video daily schedule: Moorland (HMP)')
        expect(backLinkText).toEqual('Back to prisoner whereabouts')
      })
  })
})

describe('POST', () => {
  it('should set the posted filter values in session', async () => {
    return request(app)
      .post('/')
      .send({
        wing: ['A', 'B'],
        appointmentType: 'VLB',
        period: 'AM',
        appointmentLocation: 'VCC-ROOM-1',
        courtOrProbationTeam: 'ABERCV',
      })
      .expect(302)
      .expect('location', `/`)
      .then(() =>
        expectJourneySession(app, 'scheduleFilters', {
          wing: ['A', 'B'],
          appointmentType: ['VLB'],
          period: ['AM'],
          appointmentLocation: ['VCC-ROOM-1'],
          courtOrProbationTeam: ['ABERCV'],
        }),
      )
  })
})
