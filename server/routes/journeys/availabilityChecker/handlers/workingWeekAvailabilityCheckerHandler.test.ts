import type { Express } from 'express'
import request from 'supertest'
import { load } from 'cheerio'
import { startOfDay } from 'date-fns'
import { appWithAllRoutes, user } from '../../../testutils/appSetup'
import AuditService, { Page } from '../../../../services/auditService'
import RoomAvailabilityService, { RoomAvailability } from '../../../../services/roomAvailabilityService'
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
    config.featureToggles.workingWeekAvailabilityChecker = true
    config.featureToggles.availabilityCheckerPrisons = 'RSI'

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

  it('should render tabbed weekly availability checker at Risley prison', () => {
    roomAvailabilityService.getRoomAvailability.mockResolvedValue(morningRoomAvailability)

    return request(app)
      .get(`/availability-checker?period=AM&date=2026-07-28`)
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = load(res.text)

        expect(getPageHeader($)).toEqual('Video link availability checker: Risley (HMP)')
        expect(getByDataQa($, 'appointments-link').attr('href')).toEqual('http://localhost:3000/appointments')

        // Availability on 2026-07-27
        expect(existsByDataQa($, '1-booked-2026-07-27-8')).toBe(true)
        expect(existsByDataQa($, '1-available-2026-07-27-09:00-09:30')).toBe(true)
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
        expect(existsByDataQa($, '1-available-2026-07-29-09:15-10:00')).toBe(true)
        expect(existsByDataQa($, '1-available-2026-07-29-10:40-11:00')).toBe(true)
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
        expect(existsByDataQa($, '1-available-2026-07-31-12:00-12:15')).toBe(true)
        expect(existsByDataQa($, '1-available-2026-07-31-12:30-13:00')).toBe(true)

        expect(roomAvailabilityService.getRoomAvailability).toHaveBeenCalledWith(
          'RSI',
          startOfDay('2026-07-27'),
          startOfDay('2026-07-31'),
          'AM',
          risleyUser,
        )
        expect(auditService.logPageView).toHaveBeenCalledWith(Page.WOKRING_WEEK_AVAILABILTY_CHECKER_PAGE, {
          who: user.username,
          correlationId: expect.any(String),
          details: JSON.stringify({ query: { period: 'AM', date: '2026-07-28' } }),
        })
      })
  })
})

describe('POST', () => {
  beforeEach(() => {
    config.featureToggles.workingWeekAvailabilityChecker = true
    config.featureToggles.availabilityCheckerPrisons = 'RSI'
    appSetup()
  })

  it.each([
    ['10/12/2024', 'AM', '2024-12-10', 'tuesday'],
    ['11/12/2024', 'PM', '2024-12-11', 'wednesday'],
    ['12/12/2024', 'ED', '2024-12-12', 'thursday'],
  ])(
    'should redirect to date and period (%s) (%s)',
    (date: string, period: string, parsedDate: string, day: string) => {
      return request(app)
        .post('/availability-checker')
        .send({ date, period })
        .expect(302)
        .expect('location', `availability-checker?date=${parsedDate}&period=${period}#${day}`)
    },
  )

  it.each([['25/07/2026'], ['26/07/2026']])('should validate date is a working day', (date: string) => {
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
