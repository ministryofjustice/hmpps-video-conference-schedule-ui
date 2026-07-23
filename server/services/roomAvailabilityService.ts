import BookAVideoLinkApiClient from '../data/bookAVideoLinkApiClient'
import { LocationEvent } from '../@types/bookAVideoLinkApi/types'
import { calculateFreeTimeSlots, generateHourlySlots, simpleTimeToDate, TimeSlot } from '../utils/timeSlotUtils'

export type Room = {
  id: string
  description: string
}

export type RoomAvailability = {
  description: string
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

    if (period === 'AM') {
      return videoEvents.locations.map(le => this.toMorningRoomAvailability(le))
    }

    if (period === 'PM') {
      return videoEvents.locations.map(le => this.toAfternoonRoomAvailability(le))
    }

    return videoEvents.locations.map(le => this.toEveningRoomAvailability(le))
  }

  private toMorningRoomAvailability(locationEvent: LocationEvent): RoomAvailability {
    const busySlots: TimeSlot[] = this.getBusySlotsFor(locationEvent)

    return {
      description: locationEvent.localName,
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

  private toAfternoonRoomAvailability(locationEvent: LocationEvent): RoomAvailability {
    const busySlots: TimeSlot[] = this.getBusySlotsFor(locationEvent)

    return {
      description: locationEvent.localName,
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

  private toEveningRoomAvailability(locationEvent: LocationEvent): RoomAvailability {
    const busySlots: TimeSlot[] = this.getBusySlotsFor(locationEvent)

    return {
      description: locationEvent.localName,
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

  private getBusySlotsFor(locationEvent: LocationEvent): TimeSlot[] {
    let busySlots: TimeSlot[] = []

    locationEvent.events.forEach(event => {
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
