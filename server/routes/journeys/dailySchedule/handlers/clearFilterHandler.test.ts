import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes, user } from '../../../testutils/appSetup'
import AuditService from '../../../../services/auditService'
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

beforeEach(() =>
  appSetup({
    scheduleFilters: {
      wing: ['A', 'B'],
      appointmentType: ['VLB'],
      period: ['AM'],
      appointmentLocation: ['VCC-ROOM-1'],
      courtOrProbationTeam: ['ABERCV'],
    },
  }),
)

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET', () => {
  it('should clear all filters', () => {
    return request(app)
      .get('/clear-filter?all=true')
      .expect(302)
      .expect('location', `/`)
      .then(() => expectJourneySession(app, 'scheduleFilters', undefined))
  })

  it('should a single filter', () => {
    return request(app)
      .get('/clear-filter?wing=A')
      .expect(302)
      .expect('location', `/`)
      .then(() =>
        expectJourneySession(app, 'scheduleFilters', {
          wing: ['B'],
          appointmentType: ['VLB'],
          period: ['AM'],
          appointmentLocation: ['VCC-ROOM-1'],
          courtOrProbationTeam: ['ABERCV'],
        }),
      )
  })
})
