import type { Express } from 'express'
import request from 'supertest'
import { formatDate, startOfDay, startOfToday } from 'date-fns'
import { appWithAllRoutes, user } from '../../../testutils/appSetup'
import AuditService, { Page } from '../../../../services/auditService'
import ScheduleService, { DailySchedule } from '../../../../services/scheduleService'
import config from '../../../../config'

jest.mock('../../../../services/auditService')
jest.mock('../../../../services/scheduleService')

const auditService = new AuditService(null) as jest.Mocked<AuditService>
const scheduleService = new ScheduleService(null, null, null, null, null, null) as jest.Mocked<ScheduleService>

let app: Express
const filters = { wing: ['A'] }

const appSetup = (journeySession = {}) => {
  app = appWithAllRoutes({
    services: { auditService, scheduleService },
    userSupplier: () => user,
    journeySessionSupplier: () => journeySession,
  })
}

const expectedCsvNoPickupTimes =
  'Prisoner name,Prison number,Cell number,Appointment start time,Appointment end time,Appointment type,Appointment subtype,Room location,Court or probation team,Video link,Last updated' +
  '\nJohn Smith,ABC123,A-1-001,10:45,11:00,Court Hearing,,A Wing Video Link,,http://video.url,10 December 2024 at 00:00' +
  '\nJohn Smith,ABC123,A-1-001,11:00,12:00,Court Hearing,,A Wing Video Link,,http://video.url,10 December 2024 at 00:00' +
  '\nJohn Doe,DEF123,B-1-001,11:00,12:00,Court Hearing,,B Wing Video Link,,HMCTS 54321,10 December 2024 at 00:00' +
  '\nJane Doe,HIJ123,C-1-001,11:00,12:00,Court Hearing,,C Wing Video Link,,,10 December 2024 at 00:00'

const expectedCsvWithPickupTimes =
  'Prisoner name,Prison number,Cell number,Pick-up time,Appointment start time,Appointment end time,Appointment type,Appointment subtype,Room location,Court or probation team,Video link,Last updated' +
  '\nJohn Smith,ABC123,A-1-001,10:15,10:45,11:00,Court Hearing,,A Wing Video Link,,http://video.url,10 December 2024 at 00:00' +
  '\nJohn Smith,ABC123,A-1-001,,11:00,12:00,Court Hearing,,A Wing Video Link,,http://video.url,10 December 2024 at 00:00' +
  '\nJohn Doe,DEF123,B-1-001,10:30,11:00,12:00,Court Hearing,,B Wing Video Link,,HMCTS 54321,10 December 2024 at 00:00' +
  '\nJane Doe,HIJ123,C-1-001,10:30,11:00,12:00,Court Hearing,,C Wing Video Link,,,10 December 2024 at 00:00'

beforeEach(() => {
  scheduleService.getSchedule.mockResolvedValue({
    appointmentGroups: [
      [
        {
          prisoner: { firstName: 'John', lastName: 'Smith', prisonerNumber: 'ABC123', cellLocation: 'A-1-001' },
          startTime: '10:45',
          endTime: '11:00',
          appointmentTypeDescription: 'Court Hearing',
          appointmentLocationDescription: 'A Wing Video Link',
          lastUpdatedOrCreated: '2024-12-10T00:00:00Z',
          videoLink: 'http://video.url',
          videoLinkRequired: true,
          videoLinkId: 1,
        },
        {
          prisoner: { firstName: 'John', lastName: 'Smith', prisonerNumber: 'ABC123', cellLocation: 'A-1-001' },
          startTime: '11:00',
          endTime: '12:00',
          appointmentTypeDescription: 'Court Hearing',
          appointmentLocationDescription: 'A Wing Video Link',
          lastUpdatedOrCreated: '2024-12-10T00:00:00Z',
          videoLink: 'http://video.url',
          videoLinkRequired: true,
          videoLinkId: 1,
        },
      ],
      [
        {
          prisoner: { firstName: 'John', lastName: 'Doe', prisonerNumber: 'DEF123', cellLocation: 'B-1-001' },
          startTime: '11:00',
          endTime: '12:00',
          appointmentTypeDescription: 'Court Hearing',
          appointmentLocationDescription: 'B Wing Video Link',
          lastUpdatedOrCreated: '2024-12-10T00:00:00Z',
          hmctsNumber: '54321',
          videoLinkRequired: true,
        },
      ],
      [
        {
          prisoner: { firstName: 'Jane', lastName: 'Doe', prisonerNumber: 'HIJ123', cellLocation: 'C-1-001' },
          startTime: '11:00',
          endTime: '12:00',
          appointmentTypeDescription: 'Court Hearing',
          appointmentLocationDescription: 'C Wing Video Link',
          lastUpdatedOrCreated: '2024-12-10T00:00:00Z',
          videoLinkRequired: true,
        },
      ],
    ],
  } as unknown as DailySchedule)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET - with no pick-up times', () => {
  beforeEach(() => {
    config.featureToggles.pickUpTimes = false
    appSetup({ scheduleFilters: filters })
  })

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

        expect(res.text).toEqual(expectedCsvNoPickupTimes)

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
        expect(res.text).toEqual(expectedCsvNoPickupTimes)

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
        expect(res.text).toEqual(expectedCsvNoPickupTimes)
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

        expect(res.text).toEqual(expectedCsvNoPickupTimes)
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
        expect(res.text).toEqual(expectedCsvNoPickupTimes)
        expect(scheduleService.getSchedule).toHaveBeenLastCalledWith('MDI', startOfToday(), filters, 'ACTIVE', user)
      })
  })
})

describe('GET - with pickup times', () => {
  beforeEach(() => {
    config.featureToggles.pickUpTimes = true
    appSetup({ scheduleFilters: filters })
  })

  it('should download csv for today with pickup times ', () => {
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

        expect(res.text).toEqual(expectedCsvWithPickupTimes)

        expect(scheduleService.getSchedule).toHaveBeenLastCalledWith('MDI', startOfToday(), filters, 'ACTIVE', user)
      })
  })
})
