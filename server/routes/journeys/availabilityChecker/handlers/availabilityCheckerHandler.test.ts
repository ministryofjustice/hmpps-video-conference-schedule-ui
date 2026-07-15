import type { Express } from 'express'
import request from 'supertest'
import { load } from 'cheerio'
import { appWithAllRoutes, user } from '../../../testutils/appSetup'
import AuditService, { Page } from '../../../../services/auditService'
import { getPageHeader } from '../../../testutils/cheerio'
import config from '../../../../config'

jest.mock('../../../../services/auditService')
jest.mock('../../../../services/prisonService')
jest.mock('../../../../services/scheduleService')

const auditService = new AuditService(null) as jest.Mocked<AuditService>

let app: Express

const risleyUser = {
  ...user,
  activeCaseLoadId: 'RSI',
}

const appSetup = (journeySession = {}) => {
  app = appWithAllRoutes({
    services: { auditService },
    userSupplier: () => risleyUser,
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

  it('should render availability checker when Risley prison is enabled', () => {
    config.featureToggles.availabilityCheckerPrisons = 'RSI'

    return request(app)
      .get('/availability-checker')
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = load(res.text)

        expect(getPageHeader($)).toEqual('The availability checker is currently unavailable')
        expect(auditService.logPageView).toHaveBeenCalledWith(Page.AVAILABILTY_CHECKER_PAGE, {
          who: user.username,
          correlationId: expect.any(String),
          details: JSON.stringify({ query: {} }),
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
        expect(auditService.logPageView).toHaveBeenCalledWith(Page.AVAILABILTY_CHECKER_PAGE, {
          who: user.username,
          correlationId: expect.any(String),
          details: JSON.stringify({ query: {} }),
        })
      })
  })
})
