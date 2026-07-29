import createUser from '../testutils/createUser'
import BookAVideoLinkApiClient from '../data/bookAVideoLinkApiClient'
import RoomAvailabilityService from './roomAvailabilityService'
import { VideoEvents } from '../@types/bookAVideoLinkApi/types'

jest.mock('../data/bookAVideoLinkApiClient')

const user = createUser([])

describe('Room availability service', () => {
  let bookAVideoLinkApiClient: jest.Mocked<BookAVideoLinkApiClient>
  let roomAvailabilityService: RoomAvailabilityService

  beforeEach(() => {
    bookAVideoLinkApiClient = new BookAVideoLinkApiClient(null) as jest.Mocked<BookAVideoLinkApiClient>
    roomAvailabilityService = new RoomAvailabilityService(bookAVideoLinkApiClient)
  })

  describe('getRoomAvailability', () => {
    it('gets room availability using API client', async () => {
      bookAVideoLinkApiClient.getVideoEvents.mockResolvedValue(videoEvents)
      const result = await roomAvailabilityService.getRoomAvailability(
        'MDI',
        new Date('2026-07-01'),
        new Date('2026-07-02'),
        'AM',
        user,
      )
      expect(result).toEqual([
        {
          id: '81b02c1e-1e26-46e5-b4ee-00830c0cff5e',
          description: 'VCC Room 1',
          date: '2026-07-01',
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
          id: '81b02c1e-1e26-46e5-b4ee-00830c0cff5e',
          description: 'VCC Room 1',
          date: '2026-07-02',
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
      ])
    })
  })

  const videoEvents = {
    prisonCode: 'MDI',
    startDate: '2026-07-01',
    endDate: '2026-07-02',
    timeSlot: 'AM',
    locations: [
      {
        dpsLocationId: '81b02c1e-1e26-46e5-b4ee-00830c0cff5e',
        localName: 'VCC Room 1',
        capacity: 6,
        events: [
          {
            eventType: 'APPOINTMENT',
            subType: 'VLOO',
            subTypeDescription: 'Video link - official other',
            eventDate: '2026-07-01',
            startTime: '08:00',
            endTime: '09:00',
            prisonerCode: 'G4950GV',
            eventId: 1234567,
          },
          {
            eventType: 'APPOINTMENT',
            subType: 'VLOO',
            subTypeDescription: 'Video link - official other',
            eventDate: '2026-07-01',
            startTime: '09:30',
            endTime: '10:30',
            prisonerCode: 'G4950GV',
            eventId: 1234567,
          },
          {
            eventType: 'COURT',
            subType: 'BAIL',
            subTypeDescription: 'Bail hearing',
            eventDate: '2026-07-01',
            startTime: '10:30',
            endTime: '11:30',
            prisonerCode: 'G4950GV',
            eventId: 1234568,
          },
          {
            eventType: 'PROBATION',
            subType: 'FTR56',
            subTypeDescription: 'Fixed term recall',
            eventDate: '2026-07-01',
            startTime: '11:30',
            endTime: '13:30',
            prisonerCode: 'G4950GV',
            eventId: 1234569,
          },
        ],
      },
    ],
  } as unknown as VideoEvents
})
