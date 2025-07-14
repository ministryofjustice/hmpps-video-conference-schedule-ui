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
import config from '../../../../config'
import { Location } from '../../../../@types/locationsInsidePrisonApi/types'

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
  config.featureToggles.pickUpTimes = false
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

        expect(heading).toContain('Video link daily schedule: Moorland (HMP)')
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

        expect(heading).toContain('Video link daily schedule: Moorland (HMP)')
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

  it('should set isFutureDay correctly', () => {
    const renderSpy = jest.spyOn(app, 'render')

    return request(app)
      .get('/?date=2050-01-01')
      .expect(res => {
        const date = new Date('2050-01-01')

        expect(auditService.logPageView).toHaveBeenCalledWith(Page.DAILY_SCHEDULE_PAGE, {
          who: user.username,
          correlationId: expect.any(String),
          details: JSON.stringify({ query: { date: '2050-01-01' } }),
        })

        expect(scheduleService.getSchedule).toHaveBeenLastCalledWith('MDI', startOfDay(date), filters, 'ACTIVE', user)

        expect(renderSpy).toHaveBeenCalledWith(
          'pages/dailySchedule/dailySchedule',
          {
            prisonName: 'Moorland (HMP)',
            date,
            isFutureDay: true,
            isPastDay: false,
            _locals: expect.any(Object),
          },
          expect.anything(),
        )
      })
  })

  it('should set isPastDay correctly', () => {
    const renderSpy = jest.spyOn(app, 'render')

    return request(app)
      .get('/?date=2024-01-01')
      .expect(res => {
        const date = new Date('2024-01-01')

        expect(auditService.logPageView).toHaveBeenCalledWith(Page.DAILY_SCHEDULE_PAGE, {
          who: user.username,
          correlationId: expect.any(String),
          details: JSON.stringify({ query: { date: '2024-01-01' } }),
        })

        expect(scheduleService.getSchedule).toHaveBeenLastCalledWith('MDI', startOfDay(date), filters, 'ACTIVE', user)

        expect(renderSpy).toHaveBeenCalledWith(
          'pages/dailySchedule/dailySchedule',
          {
            prisonName: 'Moorland (HMP)',
            date,
            isFutureDay: false,
            isPastDay: true,
            _locals: expect.any(Object),
          },
          expect.anything(),
        )
      })
  })

  it('should render index page for today if given date is invalid', () => {
    return request(app)
      .get('/?date=nonsense')
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = cheerio.load(res.text)
        const heading = $('h1').text().trim()

        expect(heading).toContain('Video link daily schedule: Moorland (HMP)')
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

        expect(heading).toContain('Video link daily schedule: Moorland (HMP)')
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

        expect(heading).toEqual('Video link daily schedule: Moorland (HMP)')
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

        expect(heading).toEqual('Video link daily schedule: Moorland (HMP)')
        expect(backLinkText).toEqual('Back to prisoner whereabouts')
      })
  })
})

describe('GET - with pick-up time enabled', () => {
  beforeEach(() => {
    config.featureToggles.pickUpTimes = true
    appSetup({ scheduleFilters: filters })
    prisonService.getPrison.mockResolvedValue({ prisonName: 'Moorland (HMP)' } as Prison)
  })

  it('should render page with pick-up times toggled on', () => {
    prisonService.isAppointmentsRolledOutAt.mockResolvedValue(true)
    referenceDataService.getAppointmentCategories.mockResolvedValue([
      { code: 'VLB', description: 'Video link - court hearing' },
    ])
    referenceDataService.getAppointmentLocations.mockResolvedValue([{ id: 'test' } as Location])
    referenceDataService.getCourtsAndProbationTeams.mockResolvedValue([
      { courtId: 1, code: 'MANCM', description: 'Manchester Magistrates', enabled: true },
    ])
    referenceDataService.getCellsByWing.mockResolvedValue([
      { localName: 'A Wing', fullLocationPath: 'A', cells: ['A-1-001', 'A-1-002', 'A-2-001'] },
    ])

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
          },
        ],
      ],
    })

    return request(app)
      .get('/?date=2024-12-12')
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = cheerio.load(res.text)
        const heading = $('h1').text().trim()
        const date = new Date('2024-12-12')
        const backLinkText = $('.govuk-back-link').text().trim()

        expect(heading).toContain('Video link daily schedule: Moorland (HMP)')
        expect(backLinkText).toEqual("Back to today's schedule")
        expect(auditService.logPageView).toHaveBeenCalledWith(Page.DAILY_SCHEDULE_PAGE, {
          who: user.username,
          correlationId: expect.any(String),
          details: JSON.stringify({ query: { date: '2024-12-12' } }),
        })

        const pickUps = getByClass($, 'show-hide-details')
        expect(pickUps.text()).toContain('Pick-up time')
        expect(scheduleService.getSchedule).toHaveBeenLastCalledWith('MDI', startOfDay(date), filters, 'ACTIVE', user)
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
