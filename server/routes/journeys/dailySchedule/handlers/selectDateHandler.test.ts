import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, user } from '../../../testutils/appSetup'
import AuditService, { Page } from '../../../../services/auditService'
import { expectErrorMessages } from '../../../testutils/expectErrorMessage'
import expectJourneySession from '../../../testutils/testUtilRoute'

jest.mock('../../../../services/auditService')

const auditService = new AuditService(null) as jest.Mocked<AuditService>

let app: Express

const appSetup = (journeySession = {}) => {
  app = appWithAllRoutes({
    services: { auditService },
    userSupplier: () => user,
    journeySessionSupplier: () => journeySession,
  })
}

beforeEach(() => {
  appSetup({ scheduleFilters: { wing: ['A'] } })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET', () => {
  it('should render the page correctly', () => {
    return request(app)
      .get('/select-date')
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = cheerio.load(res.text)
        const heading = $('h1').text().trim()

        expect(heading).toContain('Select the date you want to view a daily schedule for')
        expect(auditService.logPageView).toHaveBeenCalledWith(Page.SELECT_DATE_PAGE, {
          who: user.username,
          correlationId: expect.any(String),
          details: JSON.stringify({ query: {} }),
        })
      })
  })
})

describe('POST', () => {
  it('should validate an empty form', () => {
    return request(app)
      .post('/select-date')
      .send({ date: '' })
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

  it('should validate an invalid date', () => {
    return request(app)
      .post('/select-date')
      .send({ date: 'invalid date' })
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

  it('should redirect to the daily schedule page with the input date', () => {
    return request(app)
      .post('/select-date')
      .send({ date: '12/12/2024' })
      .expect(302)
      .expect('location', '/?date=2024-12-12')
      .then(() => expectJourneySession(app, 'scheduleFilters', undefined))
  })
})
