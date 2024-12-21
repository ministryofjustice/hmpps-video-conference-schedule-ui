import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, user } from '../../../testutils/appSetup'
import AuditService, { Page } from '../../../../services/auditService'
import PrisonService from '../../../../services/prisonService'
import { Prison } from '../../../../@types/prisonRegisterApi/types'

jest.mock('../../../../services/auditService')
jest.mock('../../../../services/prisonService')

const auditService = new AuditService(null) as jest.Mocked<AuditService>
const prisonService = new PrisonService(null) as jest.Mocked<PrisonService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    services: { auditService, prisonService },
    userSupplier: () => user,
  })

  prisonService.getPrison.mockResolvedValue({ prisonName: 'Moorland (HMP)' } as Prison)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET', () => {
  it('should render index page', () => {
    return request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = cheerio.load(res.text)
        const heading = $('h1').text().trim()

        expect(heading).toContain('Video daily schedule: Moorland (HMP)')
        expect(auditService.logPageView).toHaveBeenCalledWith(Page.DAILY_SCHEDULE_PAGE, {
          who: user.username,
          correlationId: expect.any(String),
        })
        expect(prisonService.getPrison).toHaveBeenLastCalledWith('MDI', user)
      })
  })
})
