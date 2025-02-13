import type { Express } from 'express'
import request from 'supertest'
import { formatDate, startOfDay, startOfToday } from 'date-fns'
import { appWithAllRoutes, user } from '../../../testutils/appSetup'
import AuditService, { Page } from '../../../../services/auditService'
import ScheduleService, { DailySchedule } from '../../../../services/scheduleService'

jest.mock('../../../../services/auditService')
jest.mock('../../../../services/scheduleService')

const auditService = new AuditService(null) as jest.Mocked<AuditService>
const scheduleService = new ScheduleService(null, null, null, null, null, null) as jest.Mocked<ScheduleService>

let app: Express
const filters = { wing: ['A'] }
const expectedCsv = `prisonerName,prisonerNumber,cellNumber,appointmentStartTime,appointmentEndTime,appointmentType,appointmentSubtype,roomLocation,courtOrProbationTeam,videoLink,lastUpdated\nJohn Smith,ABC123,A-1-001,11:00,12:00,Court Hearing,,A Wing Video Link,,,10 December 2024 at 00:00`

const appSetup = (journeySession = {}) => {
  app = appWithAllRoutes({
    services: { auditService, scheduleService },
    userSupplier: () => user,
    journeySessionSupplier: () => journeySession,
  })
}

beforeEach(() => {
  appSetup({ scheduleFilters: filters })

  scheduleService.getSchedule.mockResolvedValue({
    appointmentGroups: [
      [
        {
          prisoner: { firstName: 'John', lastName: 'Smith', prisonerNumber: 'ABC123', cellLocation: 'A-1-001' },
          startTime: '11:00',
          endTime: '12:00',
          appointmentTypeDescription: 'Court Hearing',
          appointmentLocationDescription: 'A Wing Video Link',
          lastUpdatedOrCreated: '2024-12-10T00:00:00Z',
        },
      ],
    ],
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
          details: JSON.stringify({ query: {} }),
        })

        expect(res.text).toEqual(expectedCsv)

        expect(scheduleService.getSchedule).toHaveBeenLastCalledWith('MDI', startOfToday(), filters, 'ACTIVE', user)
      })
  })

  it('should download csv for specific date', () => {
    return request(app)
      .get('/download-csv?date=2024-12-12')
      .expect('Content-Type', /text\/csv; charset=utf-8/)
      .expect('Content-Disposition', `attachment; filename="daily-schedule-2024-12-12.csv"`)
      .expect(res => {
        expect(auditService.logPageView).toHaveBeenCalledWith(Page.DOWNLOAD_DAILY_SCHEDULE, {
          who: user.username,
          correlationId: expect.any(String),
          details: JSON.stringify({ query: { date: '2024-12-12' } }),
        })

        const date = new Date('2024-12-12')
        expect(res.text).toEqual(expectedCsv)

        expect(scheduleService.getSchedule).toHaveBeenLastCalledWith('MDI', startOfDay(date), filters, 'ACTIVE', user)
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
        expect(res.text).toEqual(expectedCsv)
        expect(scheduleService.getSchedule).toHaveBeenLastCalledWith('MDI', startOfToday(), filters, 'ACTIVE', user)
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
        expect(auditService.logPageView).toHaveBeenCalledWith(Page.DOWNLOAD_DAILY_SCHEDULE, {
          who: user.username,
          correlationId: expect.any(String),
          details: JSON.stringify({ query: { status: 'CANCELLED' } }),
        })

        expect(res.text).toEqual(expectedCsv)
        expect(scheduleService.getSchedule).toHaveBeenLastCalledWith('MDI', startOfToday(), filters, 'CANCELLED', user)
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
        expect(res.text).toEqual(expectedCsv)
        expect(scheduleService.getSchedule).toHaveBeenLastCalledWith('MDI', startOfToday(), filters, 'ACTIVE', user)
      })
  })
})
