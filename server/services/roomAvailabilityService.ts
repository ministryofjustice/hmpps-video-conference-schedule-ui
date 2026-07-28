import { addDays, interval, isWithinInterval } from 'date-fns'
import BookAVideoLinkApiClient from '../data/bookAVideoLinkApiClient'
import { LocationEvent } from '../@types/bookAVideoLinkApi/types'
import { calculateFreeTimeSlots, generateHourlySlots, simpleTimeToDate, TimeSlot } from '../utils/timeSlotUtils'
import { formatDate } from '../utils/utils'

export type Room = {
  id: string
  description: string
}

export type RoomAvailability = {
  description: string
  date: string
  hourlySlots: [HourlySlot]
}

export type HourlySlot = {
  hour: number
  freeSlots: TimeSlot[]
}

export type Period = 'AM' | 'PM' | 'ED'

export default class RoomAvailabilityService {
  constructor(private readonly bookAVideoLinkApiClient: BookAVideoLinkApiClient) {}

  public async getRoomAvailability(
    prisonId: string,
    fromDate: Date,
    endDate: Date,
    period: Period,
    user: Express.User,
  ): Promise<RoomAvailability[]> {
    const videoEvents = await this.bookAVideoLinkApiClient.getVideoEvents(prisonId, { fromDate, endDate }, user)

    let roomAvailability: RoomAvailability[] = []
    let date: Date = fromDate

    while (isWithinInterval(date, interval(fromDate, endDate))) {
      const immutableDate = date

      if (period === 'AM') {
        roomAvailability = roomAvailability.concat(
          videoEvents.locations.map(le => this.toMorningRoomAvailability(immutableDate, le)),
        )
      }

      if (period === 'PM') {
        roomAvailability = roomAvailability.concat(
          videoEvents.locations.map(le => this.toAfternoonRoomAvailability(immutableDate, le)),
        )
      }

      if (period === 'ED') {
        roomAvailability = roomAvailability.concat(
          videoEvents.locations.map(le => this.toEveningRoomAvailability(immutableDate, le)),
        )
      }

      date = addDays(date, 1)
    }

    return roomAvailability
  }

  private toMorningRoomAvailability(date: Date, locationEvent: LocationEvent): RoomAvailability {
    const busySlots: TimeSlot[] = this.getBusySlotsFor(date, locationEvent)

    return {
      description: locationEvent.localName,
      date: formatDate(date, 'yyyy-MM-dd'),
      hourlySlots: [
        {
          hour: 8,
          freeSlots: this.getFreeSlotsFor(8, busySlots),
        },
        {
          hour: 9,
          freeSlots: this.getFreeSlotsFor(9, busySlots),
        },
        {
          hour: 10,
          freeSlots: this.getFreeSlotsFor(10, busySlots),
        },
        {
          hour: 11,
          freeSlots: this.getFreeSlotsFor(11, busySlots),
        },
        {
          hour: 12,
          freeSlots: this.getFreeSlotsFor(12, busySlots),
        },
      ],
    } as unknown as RoomAvailability
  }

  private toAfternoonRoomAvailability(date: Date, locationEvent: LocationEvent): RoomAvailability {
    const busySlots: TimeSlot[] = this.getBusySlotsFor(date, locationEvent)

    return {
      description: locationEvent.localName,
      date: formatDate(date, 'yyyy-MM-dd'),
      hourlySlots: [
        {
          hour: 13,
          freeSlots: this.getFreeSlotsFor(13, busySlots),
        },
        {
          hour: 14,
          freeSlots: this.getFreeSlotsFor(14, busySlots),
        },
        {
          hour: 15,
          freeSlots: this.getFreeSlotsFor(15, busySlots),
        },
        {
          hour: 16,
          freeSlots: this.getFreeSlotsFor(16, busySlots),
        },
        {
          hour: 17,
          freeSlots: this.getFreeSlotsFor(17, busySlots),
        },
      ],
    } as unknown as RoomAvailability
  }

  private toEveningRoomAvailability(date: Date, locationEvent: LocationEvent): RoomAvailability {
    const busySlots: TimeSlot[] = this.getBusySlotsFor(date, locationEvent)

    return {
      description: locationEvent.localName,
      date: formatDate(date, 'yyyy-MM-dd'),
      hourlySlots: [
        {
          hour: 18,
          freeSlots: this.getFreeSlotsFor(18, busySlots),
        },
        {
          hour: 19,
          freeSlots: this.getFreeSlotsFor(19, busySlots),
        },
        {
          hour: 20,
          freeSlots: this.getFreeSlotsFor(20, busySlots),
        },
      ],
    } as unknown as RoomAvailability
  }

  private getBusySlotsFor(date: Date, locationEvent: LocationEvent): TimeSlot[] {
    let busySlots: TimeSlot[] = []

    locationEvent.events
      .filter(e => e.eventDate === formatDate(date, 'yyyy-MM-dd'))
      .forEach(event => {
        const startTime = simpleTimeToDate(event.startTime)
        const endTime = simpleTimeToDate(event.endTime)
        busySlots = busySlots.concat(generateHourlySlots(startTime, endTime))
      })

    return busySlots
  }

  private getFreeSlotsFor(hour: number, busySlots: TimeSlot[]): TimeSlot[] {
    return calculateFreeTimeSlots(
      hour,
      busySlots.filter(slot => slot.hour === hour),
    )
  }
}
