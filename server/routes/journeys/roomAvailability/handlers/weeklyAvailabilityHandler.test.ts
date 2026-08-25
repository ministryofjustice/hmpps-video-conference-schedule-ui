import type { Express } from 'express'
import request from 'supertest'
import { load } from 'cheerio'
import { addWeeks, isMonday, previousMonday, startOfDay, subWeeks } from 'date-fns'
import { appWithAllRoutes, user } from '../../../testutils/appSetup'
import AuditService, { Page } from '../../../../services/auditService'
import RoomAvailabilityService, { RoomAvailability } from '../../../../services/roomAvailabilityService'
import { existsByDataQa, getByDataQa, getPageHeader } from '../../../testutils/cheerio'
import config from '../../../../config'
import { Prison } from '../../../../@types/bookAVideoLinkApi/types'
import { expectErrorMessages } from '../../../testutils/expectErrorMessage'
import { formatDate } from '../../../../utils/utils'
import TelemetryService from '../../../../services/telemetryService'

jest.mock('../../../../services/auditService')
jest.mock('../../../../services/roomAvailabilityService')
jest.mock('../../../../services/telemetryService')

const auditService = new AuditService(null) as jest.Mocked<AuditService>
const roomAvailabilityService = new RoomAvailabilityService(null) as jest.Mocked<RoomAvailabilityService>
const telemetryService = new TelemetryService(null) as jest.Mocked<TelemetryService>

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

const pageHeader = 'Check video room availability: Risley (HMP)'

const appSetup = (journeySession = {}) => {
  app = appWithAllRoutes({
    services: { auditService, roomAvailabilityService, telemetryService },
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
    config.featureToggles.workingWeekAvailability = true
    config.featureToggles.roomAvailabilityEnabledPrisons = 'RSI'

    roomAvailabilityService.getRoomAvailability.mockResolvedValue([])

    appSetup()
  })

  const morningRoomAvailability = [
    {
      id: '1',
      description: 'VCC Room 1',
      date: '2026-07-27',
      hourlySlots: [
        {
          hour: 8,
          freeSlots: [],
        },
        {
          hour: 9,
          freeSlots: [
            {
              hour: 9,
              durationInMinutes: 30,
              startTime: '09:00',
              endTime: '09:30',
            },
          ],
        },
        {
          hour: 10,
          freeSlots: [],
        },
        {
          hour: 11,
          freeSlots: [],
        },
        {
          hour: 12,
          freeSlots: [],
        },
      ],
    },
    {
      id: '1',
      description: 'VCC Room 1',
      date: '2026-07-28',
      hourlySlots: [
        {
          hour: 8,
          freeSlots: [
            {
              hour: 8,
              durationInMinutes: 60,
              startTime: '08:00',
              endTime: '09:00',
            },
          ],
        },
        {
          hour: 9,
          freeSlots: [
            {
              hour: 9,
              durationInMinutes: 60,
              startTime: '09:00',
              endTime: '10:00',
            },
          ],
        },
        {
          hour: 10,
          freeSlots: [
            {
              hour: 10,
              durationInMinutes: 60,
              startTime: '10:00',
              endTime: '11:00',
            },
          ],
        },
        {
          hour: 11,
          freeSlots: [
            {
              hour: 11,
              durationInMinutes: 60,
              startTime: '11:00',
              endTime: '12:00',
            },
          ],
        },
        {
          hour: 12,
          freeSlots: [
            {
              hour: 12,
              durationInMinutes: 60,
              startTime: '12:00',
              endTime: '13:00',
            },
          ],
        },
      ],
    },
    {
      id: '1',
      description: 'VCC Room 1',
      date: '2026-07-29',
      hourlySlots: [
        {
          hour: 8,
          freeSlots: [
            {
              hour: 8,
              durationInMinutes: 60,
              startTime: '08:00',
              endTime: '09:00',
            },
          ],
        },
        {
          hour: 9,
          freeSlots: [
            {
              hour: 9,
              durationInMinutes: 45,
              startTime: '09:15',
              endTime: '10:00',
            },
          ],
        },
        {
          hour: 10,
          freeSlots: [
            {
              hour: 10,
              durationInMinutes: 20,
              startTime: '10:40',
              endTime: '11:00',
            },
          ],
        },
        {
          hour: 11,
          freeSlots: [],
        },
        {
          hour: 12,
          freeSlots: [],
        },
      ],
    },
    {
      id: '1',
      description: 'VCC Room 1',
      date: '2026-07-30',
      hourlySlots: [
        {
          hour: 8,
          freeSlots: [
            {
              hour: 8,
              durationInMinutes: 60,
              startTime: '08:00',
              endTime: '09:00',
            },
          ],
        },
        {
          hour: 9,
          freeSlots: [
            {
              hour: 9,
              durationInMinutes: 60,
              startTime: '09:00',
              endTime: '10:00',
            },
          ],
        },
        {
          hour: 10,
          freeSlots: [
            {
              hour: 10,
              durationInMinutes: 60,
              startTime: '10:00',
              endTime: '11:00',
            },
          ],
        },
        {
          hour: 11,
          freeSlots: [
            {
              hour: 11,
              durationInMinutes: 60,
              startTime: '11:00',
              endTime: '12:00',
            },
          ],
        },
        {
          hour: 12,
          freeSlots: [],
        },
      ],
    },
    {
      id: '1',
      description: 'VCC Room 1',
      date: '2026-07-31',
      hourlySlots: [
        {
          hour: 8,
          freeSlots: [],
        },
        {
          hour: 9,
          freeSlots: [],
        },
        {
          hour: 10,
          freeSlots: [],
        },
        {
          hour: 11,
          freeSlots: [],
        },
        {
          hour: 12,
          freeSlots: [
            {
              hour: 12,
              durationInMinutes: 15,
              startTime: '12:00',
              endTime: '12:15',
            },
            {
              hour: 12,
              durationInMinutes: 30,
              startTime: '12:30',
              endTime: '13:00',
            },
          ],
        },
      ],
    },
  ] as unknown as RoomAvailability[]

  it('should render tabbed weekly room availability at Risley prison', () => {
    roomAvailabilityService.getRoomAvailability.mockResolvedValue(morningRoomAvailability)

    return request(app)
      .get(`/room-availability?period=AM&date=2026-07-28`)
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = load(res.text)

        expect(getPageHeader($)).toEqual(pageHeader)
        expect(getByDataQa($, 'appointments-link').attr('href')).toEqual(
          'http://localhost:3000/appointments/create/start-group',
        )

        // Check back link is shown
        const backLinkText = $('nav a.govuk-back-link').text().trim()
        expect(backLinkText).toEqual("Back to all appointments tasks")

        // Availability on 2026-07-27
        expect(existsByDataQa($, '1-booked-2026-07-27-8')).toBe(true)
        expect(existsByDataQa($, '1-partial-2026-07-27-09:00-09:30')).toBe(true)
        expect(existsByDataQa($, '1-booked-2026-07-27-10')).toBe(true)
        expect(existsByDataQa($, '1-booked-2026-07-27-11')).toBe(true)
        expect(existsByDataQa($, '1-booked-2026-07-27-12')).toBe(true)

        // Availability on 2026-07-28
        expect(existsByDataQa($, '1-available-2026-07-28-8')).toBe(true)
        expect(existsByDataQa($, '1-available-2026-07-28-9')).toBe(true)
        expect(existsByDataQa($, '1-available-2026-07-28-10')).toBe(true)
        expect(existsByDataQa($, '1-available-2026-07-28-11')).toBe(true)
        expect(existsByDataQa($, '1-available-2026-07-28-12')).toBe(true)

        // Availability on 2026-07-29
        expect(existsByDataQa($, '1-available-2026-07-29-8')).toBe(true)
        expect(existsByDataQa($, '1-partial-2026-07-29-09:15-10:00')).toBe(true)
        expect(existsByDataQa($, '1-partial-2026-07-29-10:40-11:00')).toBe(true)
        expect(existsByDataQa($, '1-booked-2026-07-29-11')).toBe(true)
        expect(existsByDataQa($, '1-booked-2026-07-29-12')).toBe(true)

        // Availability on 2026-07-30
        expect(existsByDataQa($, '1-available-2026-07-30-8')).toBe(true)
        expect(existsByDataQa($, '1-available-2026-07-30-9')).toBe(true)
        expect(existsByDataQa($, '1-available-2026-07-30-10')).toBe(true)
        expect(existsByDataQa($, '1-available-2026-07-30-11')).toBe(true)
        expect(existsByDataQa($, '1-booked-2026-07-30-12')).toBe(true)

        // Availability on 2026-07-31
        expect(existsByDataQa($, '1-booked-2026-07-31-8')).toBe(true)
        expect(existsByDataQa($, '1-booked-2026-07-31-9')).toBe(true)
        expect(existsByDataQa($, '1-booked-2026-07-31-10')).toBe(true)
        expect(existsByDataQa($, '1-booked-2026-07-31-11')).toBe(true)
        expect(existsByDataQa($, '1-partial-2026-07-31-12:00-12:15')).toBe(true)
        expect(existsByDataQa($, '1-partial-2026-07-31-12:30-13:00')).toBe(true)

        expect(roomAvailabilityService.getRoomAvailability).toHaveBeenCalledWith(
          'RSI',
          startOfDay('2026-07-27'),
          startOfDay('2026-07-31'),
          'AM',
          risleyUser,
        )
        expect(auditService.logPageView).toHaveBeenCalledWith(Page.WORKING_WEEK_AVAILABILITY_PAGE, {
          who: user.username,
          correlationId: expect.any(String),
          details: JSON.stringify({ query: { period: 'AM', date: '2026-07-28' } }),
        })
        expect(telemetryService.trackEvent).toHaveBeenCalledWith('DailySchedule_ViewRoomAvailability', {
          date: '2026-07-28',
          period: 'AM',
          prisonCode: 'RSI',
          username: 'user1',
        })
      })
  })

  const mondayOfCurrentWeek = isMonday(new Date()) ? new Date() : previousMonday(new Date())

  it('should render current week navigation link when viewing previous week', () => {
    const previousWeek = subWeeks(new Date(), 1)

    roomAvailabilityService.getRoomAvailability.mockResolvedValue([])

    return request(app)
      .get(`/room-availability?period=PM&date=${formatDate(previousWeek, 'yyyy-MM-dd')}`)
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = load(res.text)

        expect(getPageHeader($)).toEqual(pageHeader)
        expect(existsByDataQa($, 'current-week')).toBe(true)
        expect(getByDataQa($, 'current-week').attr('href')).toEqual(
          `/room-availability?date=${formatDate(mondayOfCurrentWeek, 'yyyy-MM-dd')}&period=PM`,
        )
        expect(telemetryService.trackEvent).toHaveBeenCalledWith('DailySchedule_ViewRoomAvailability', {
          date: formatDate(previousWeek, 'yyyy-MM-dd'),
          period: 'PM',
          prisonCode: 'RSI',
          username: 'user1',
        })
      })
  })

  it('should render current week navigation link when viewing next week', () => {
    const nextWeek = addWeeks(new Date(), 1)

    roomAvailabilityService.getRoomAvailability.mockResolvedValue([])

    return request(app)
      .get(`/room-availability?period=AM&date=${formatDate(nextWeek, 'yyyy-MM-dd')}`)
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = load(res.text)

        expect(getPageHeader($)).toEqual(pageHeader)
        expect(existsByDataQa($, 'current-week')).toBe(true)
        expect(getByDataQa($, 'current-week').attr('href')).toEqual(
          `/room-availability?date=${formatDate(mondayOfCurrentWeek, 'yyyy-MM-dd')}&period=AM`,
        )
      })
  })

  it('should not render current week navigation link when viewing current week', () => {
    const today = new Date()

    roomAvailabilityService.getRoomAvailability.mockResolvedValue([])

    return request(app)
      .get(`/room-availability?period=AM&date=${formatDate(today, 'yyyy-MM-dd')}`)
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = load(res.text)

        expect(getPageHeader($)).toEqual(pageHeader)
        expect(existsByDataQa($, 'current-week')).toBe(false)
      })
  })

  it('should render boundary date tab labels inclusive of year', () => {
    roomAvailabilityService.getRoomAvailability.mockResolvedValue([])

    return request(app)
      .get(`/room-availability?period=AM&date=2025-12-31`)
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = load(res.text)

        expect(getPageHeader($)).toEqual(pageHeader)

        // boundary date tab labels are inclusive of year
        expect(getByDataQa($, 'wednesday_tab').text().trim()).toEqual('Wed 31 Dec 2025')
        expect(getByDataQa($, 'thursday_tab').text().trim()).toEqual('Thu 1 Jan 2026')

        // non-boundary date tab labels are exclusive of year
        expect(getByDataQa($, 'monday_tab').text().trim()).toEqual('Mon 29 Dec')
        expect(getByDataQa($, 'tuesday_tab').text().trim()).toEqual('Tue 30 Dec')
        expect(getByDataQa($, 'friday_tab').text().trim()).toEqual('Fri 2 Jan')
      })
  })
})

describe('POST', () => {
  beforeEach(() => {
    config.featureToggles.workingWeekAvailability = true
    config.featureToggles.roomAvailabilityEnabledPrisons = 'RSI'
    appSetup()
  })

  it.each([
    ['10/12/2024', 'AM', '2024-12-10'],
    ['11/12/2024', 'PM', '2024-12-11'],
    ['12/12/2024', 'ED', '2024-12-12'],
  ])('should redirect to date and period (%s) (%s)', (date: string, period: string, parsedDate: string) => {
    return request(app)
      .post('/room-availability')
      .send({ date, period })
      .expect(302)
      .expect('location', `room-availability?date=${parsedDate}&period=${period}#`)
  })

  it.each([['25/07/2026'], ['26/07/2026']])('should validate date is a working day', (date: string) => {
    return request(app)
      .post('/room-availability')
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
    return request(app)
      .post('/room-availability')
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
    return request(app)
      .post('/room-availability')
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
    return request(app)
      .post('/room-availability')
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
