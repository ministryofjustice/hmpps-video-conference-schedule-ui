import type { Express } from 'express'
import request from 'supertest'
import { formatDate, startOfDay, startOfToday } from 'date-fns'
import { appWithAllRoutes, user } from '../../../testutils/appSetup'
import AuditService, { Page } from '../../../../services/auditService'
import ScheduleService, { DailySchedule } from '../../../../services/scheduleService'

jest.mock('../../../../services/auditService')
jest.mock('../../../../services/scheduleService')

const auditService = new AuditService(null) as jest.Mocked<AuditService>
const scheduleService = new ScheduleService(null, null, null, null) as jest.Mocked<ScheduleService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    services: { auditService, scheduleService },
    userSupplier: () => user,
  })

  scheduleService.getSchedule.mockResolvedValue({
    appointmentGroups: [[{ data: 'abc123' }]],
  } as unknown as DailySchedule)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET', () => {
  it('should download csv for today', () => {
    return request(app)
      .get('/download-csv')
      .expect('Content-Type', /text\/csv; charset=utf-8/)
      .expect(
        'Content-Disposition',
        `attachment; filename="daily-schedule-${formatDate(new Date(), 'yyyy-MM-dd')}.csv"`,
      )
      .expect(res => {
        expect(auditService.logPageView).toHaveBeenCalledWith(Page.DOWNLOAD_DAILY_SCHEDULE, {
          who: user.username,
          correlationId: expect.any(String),
        })

        expect(res.text).toEqual('data\nabc123')

        expect(scheduleService.getSchedule).toHaveBeenLastCalledWith('MDI', startOfToday(), 'ACTIVE', user)
      })
  })

  it('should download csv for specific date', () => {
    return request(app)
      .get('/download-csv?date=2024-12-12')
      .expect('Content-Type', /text\/csv; charset=utf-8/)
      .expect('Content-Disposition', `attachment; filename="daily-schedule-2024-12-12.csv"`)
      .expect(res => {
        const date = new Date('2024-12-12')
        expect(res.text).toEqual('data\nabc123')

        expect(scheduleService.getSchedule).toHaveBeenLastCalledWith('MDI', startOfDay(date), 'ACTIVE', user)
      })
  })

  it('should download csv for today if given date is invalid', () => {
    return request(app)
      .get('/download-csv?date=nonsense')
      .expect('Content-Type', /text\/csv; charset=utf-8/)
      .expect(
        'Content-Disposition',
        `attachment; filename="daily-schedule-${formatDate(new Date(), 'yyyy-MM-dd')}.csv"`,
      )
      .expect(res => {
        expect(res.text).toEqual('data\nabc123')
        expect(scheduleService.getSchedule).toHaveBeenLastCalledWith('MDI', startOfToday(), 'ACTIVE', user)
      })
  })

  it('should download csv for cancelled appointments', () => {
    return request(app)
      .get('/download-csv?status=CANCELLED')
      .expect('Content-Type', /text\/csv; charset=utf-8/)
      .expect(
        'Content-Disposition',
        `attachment; filename="daily-schedule-cancelled-${formatDate(new Date(), 'yyyy-MM-dd')}.csv"`,
      )
      .expect(res => {
        expect(res.text).toEqual('data\nabc123')
        expect(scheduleService.getSchedule).toHaveBeenLastCalledWith('MDI', startOfToday(), 'CANCELLED', user)
      })
  })

  it('should download csv for active appointments if status is invalid', () => {
    return request(app)
      .get('/download-csv?status=NONSENSE')
      .expect('Content-Type', /text\/csv; charset=utf-8/)
      .expect(
        'Content-Disposition',
        `attachment; filename="daily-schedule-${formatDate(new Date(), 'yyyy-MM-dd')}.csv"`,
      )
      .expect(res => {
        expect(res.text).toEqual('data\nabc123')
        expect(scheduleService.getSchedule).toHaveBeenLastCalledWith('MDI', startOfToday(), 'ACTIVE', user)
      })
  })
})
