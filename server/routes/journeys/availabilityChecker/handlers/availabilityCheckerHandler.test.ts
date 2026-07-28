import type { Express } from 'express'
import request from 'supertest'
import { load } from 'cheerio'
import { startOfDay } from 'date-fns'
import { appWithAllRoutes, user } from '../../../testutils/appSetup'
import AuditService, { Page } from '../../../../services/auditService'
import RoomAvailabilityService from '../../../../services/roomAvailabilityService'
import { existsByDataQa, getByDataQa, getPageHeader } from '../../../testutils/cheerio'
import config from '../../../../config'
import { Prison } from '../../../../@types/bookAVideoLinkApi/types'
import { expectErrorMessages } from '../../../testutils/expectErrorMessage'

jest.mock('../../../../services/auditService')
jest.mock('../../../../services/roomAvailabilityService')

const auditService = new AuditService(null) as jest.Mocked<AuditService>
const roomAvailabilityService = new RoomAvailabilityService(null) as jest.Mocked<RoomAvailabilityService>

let app: Express

const risleyUser = {
  ...user,
  activeCaseLoadId: 'RSI',
}

const risleyPrison: Prison = {
  prisonId: 1,
  code: 'RSI',
  name: 'Risley (HMP)',
  enabled: true,
}

const appSetup = (journeySession = {}) => {
  app = appWithAllRoutes({
    services: { auditService, roomAvailabilityService },
    userSupplier: () => risleyUser,
    journeySessionSupplier: () => journeySession,
    prisonSupplier: () => risleyPrison,
  })
}

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET', () => {
  beforeEach(() => {
    appSetup()
  })

  it.each([
    ['AM', '2026-07-24', 'time-8'],
    ['PM', '2024-12-11', 'time-13'],
    ['ED', '2024-12-12', 'time-18'],
  ])(
    'should render period (%s) and date (%s) for availability checker at Risley prison is enabled',
    (period: string, date: string, time: string) => {
      config.featureToggles.availabilityCheckerPrisons = 'RSI'

      return request(app)
        .get(`/availability-checker?period=${period}&date=${date}`)
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = load(res.text)

          expect(getPageHeader($)).toEqual('Video link availability checker: Risley (HMP)')
          expect(existsByDataQa($, time)).toBe(true)
          expect(getByDataQa($, 'appointments-link').attr('href')).toEqual('http://localhost:3000/appointments')
          expect(roomAvailabilityService.getRoomAvailability).toHaveBeenCalledWith(
            'RSI',
            startOfDay(date),
            startOfDay(date),
            period,
            risleyUser,
          )
          expect(auditService.logPageView).toHaveBeenCalledWith(Page.AVAILABILTY_CHECKER_PAGE, {
            who: user.username,
            correlationId: expect.any(String),
            details: JSON.stringify({ query: { period, date } }),
          })
        })
    },
  )

  it.each([
    ['2026-07-25', '2026-07-27'],
    ['2026-07-26', '2026-07-27'],
  ])('should render Monday if date falls at the weekend (%s), date (%s)', (weekendDate: string, date: string) => {
    config.featureToggles.availabilityCheckerPrisons = 'RSI'

    return request(app)
      .get(`/availability-checker?period=AM&date=${weekendDate}`)
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = load(res.text)

        expect(getPageHeader($)).toEqual('Video link availability checker: Risley (HMP)')
        expect(roomAvailabilityService.getRoomAvailability).toHaveBeenCalledWith(
          'RSI',
          startOfDay(date),
          startOfDay(date),
          'AM',
          risleyUser,
        )
        expect(auditService.logPageView).toHaveBeenCalledWith(Page.AVAILABILTY_CHECKER_PAGE, {
          who: user.username,
          correlationId: expect.any(String),
          details: JSON.stringify({ query: { period: 'AM', date: weekendDate } }),
        })
      })
  })

  it('should not render availability checker when Risley prison is not enabled', () => {
    config.featureToggles.availabilityCheckerPrisons = 'MDI'

    return request(app)
      .get('/availability-checker')
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = load(res.text)

        expect(getPageHeader($)).toEqual('Page not found')
        expect(roomAvailabilityService.getRoomAvailability).not.toHaveBeenCalled()
        expect(auditService.logPageView).toHaveBeenCalledWith(Page.AVAILABILTY_CHECKER_PAGE, {
          who: user.username,
          correlationId: expect.any(String),
          details: JSON.stringify({ query: {} }),
        })
      })
  })

  it('should not render availability checker when no prison is enabled', () => {
    return request(app)
      .get('/availability-checker')
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = load(res.text)

        expect(getPageHeader($)).toEqual('Page not found')
        expect(roomAvailabilityService.getRoomAvailability).not.toHaveBeenCalled()
        expect(auditService.logPageView).toHaveBeenCalledWith(Page.AVAILABILTY_CHECKER_PAGE, {
          who: user.username,
          correlationId: expect.any(String),
          details: JSON.stringify({ query: {} }),
        })
      })
  })
})

describe('POST', () => {
  beforeEach(() => {
    appSetup()
  })

  it.each([
    ['10/12/2024', 'AM', '2024-12-10'],
    ['11/12/2024', 'PM', '2024-12-11'],
    ['12/12/2024', 'ED', '2024-12-12'],
  ])('should redirect to date and period (%s) (%s)', (date: string, period: string, parsedDate: string) => {
    config.featureToggles.availabilityCheckerPrisons = 'RSI'

    return request(app)
      .post('/availability-checker')
      .send({ date, period })
      .expect(302)
      .expect('location', `availability-checker?date=${parsedDate}&period=${period}`)
  })

  it.each([['25/07/2026'], ['26/07/2026']])('should validate date is a working day', (date: string) => {
    config.featureToggles.availabilityCheckerPrisons = 'RSI'

    return request(app)
      .post('/availability-checker')
      .send({ date, period: 'AM' })
      .expect(() => {
        expectErrorMessages([
          {
            fieldId: 'date',
            href: '#date',
            text: 'Select a working day',
          },
        ])
      })
  })

  it('should validate date provided', () => {
    config.featureToggles.availabilityCheckerPrisons = 'RSI'

    return request(app)
      .post('/availability-checker')
      .send({ period: 'AM' })
      .expect(() => {
        expectErrorMessages([
          {
            fieldId: 'date',
            href: '#date',
            text: 'Enter a date',
          },
        ])
      })
  })

  it('should validate date is valid', () => {
    config.featureToggles.availabilityCheckerPrisons = 'RSI'

    return request(app)
      .post('/availability-checker')
      .send({ date: '31/02/2026', period: 'AM' })
      .expect(() => {
        expectErrorMessages([
          {
            fieldId: 'date',
            href: '#date',
            text: 'Enter a valid date',
          },
        ])
      })
  })

  it('should validate session is provided', () => {
    config.featureToggles.availabilityCheckerPrisons = 'RSI'

    return request(app)
      .post('/availability-checker')
      .send({ date: '03/02/2026' })
      .expect(() => {
        expectErrorMessages([
          {
            fieldId: 'period',
            href: '#period',
            text: 'Select a session',
          },
        ])
      })
  })
})
