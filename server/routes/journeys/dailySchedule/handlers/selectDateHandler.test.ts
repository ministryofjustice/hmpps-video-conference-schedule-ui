import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, user } from '../../../testutils/appSetup'
import AuditService, { Page } from '../../../../services/auditService'
import { expectErrorMessages } from '../../../testutils/expectErrorMessage'

jest.mock('../../../../services/auditService')

const auditService = new AuditService(null) as jest.Mocked<AuditService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    services: { auditService },
    userSupplier: () => user,
  })
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
        })
      })
  })
})

describe('POST', () => {
  it('should validate an empty form', () => {
    return request(app)
      .post('/select-date')
      .send({ date: {} })
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

  it('should validate an invalid date', () => {
    return request(app)
      .post('/select-date')
      .send({ date: { day: 31, month: 2, year: 2024 } })
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
      .send({ date: { day: 12, month: 12, year: 2024 } })
      .expect(302)
      .expect('location', '/?date=2024-12-12')
  })
})
