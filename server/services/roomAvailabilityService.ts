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

// Timeline specific type
export interface SessionConfig {
  name: string
  startHour: number // e.g., 8, 13, 18
  endHour: number // e.g., 12, 17, 20
}

// Timeline specific type
export interface MappedEvent {
  dpsLocationId: string
  eventType: string
  subType?: string | null
  subTypeDescription?: string | null
  eventDate: string
  startTime: string
  endTime: string
  prisonerNumber: string
  eventId?: number | null
  leftPct: string
  widthPct: string
  trackOffset: string
}

// Timeline specific type
export interface MappedSlot {
  startTime: string
  endTime: string
  leftPct: string
  widthPct: string
}

// Timeline specific type
export interface MappedLocation {
  dpsLocationId: string
  localName: string
  events: MappedEvent[]
  freeSlots: MappedSlot[]
  bookedSlots: MappedSlot[]
  totalRowHeight: string
}

// Timeline specific type
export interface SessionData {
  hourLabels: string[]
  totalHours: string
  locations: MappedLocation[]
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

  public async getTimelineAvailability(
    prisonCode: string,
    onDate: Date,
    period: string,
    user: Express.User,
  ): Promise<SessionData> {
    // Get the events taking place on this date at this prison, split by the locations they are planned into
    const events = await this.bookAVideoLinkApiClient.getVideoEvents(
      prisonCode,
      { fromDate: onDate, endDate: onDate },
      user,
    )

    // Set up the session hours based on the period requested
    let session: SessionConfig
    if (period === 'AM') {
      session = { name: 'Morning', startHour: 8, endHour: 13 }
    } else if (period === 'PM') {
      session = { name: 'Afternoon', startHour: 13, endHour: 18 }
    } else {
      session = { name: 'Evening', startHour: 18, endHour: 23 }
    }

    // Return the events taking place mapped to the locations within the session timeline
    return this.mapTimelineData(events.locations, session)
  }

  /**
   * Method which accepts an array of LocationEvent data retrieved from the API containing
   * the video locations at this prison, and all the events taking place there on the date provided.
   *
   * This function maps these locations and events into a SessionData object, used to display
   * them on a calendar-like view in their relative time positions and duration, stacking overlapping
   * events, and decorating them with the details of the event.
   *
   * @param locations LocationEvent[]
   * @param session SessionData
   * @private
   */
  private mapTimelineData(locations: LocationEvent[], session: SessionConfig): SessionData {
    const startMins = session.startHour * 60
    const endMins = session.endHour * 60
    const totalSessionMins = endMins - startMins

    const hourLabels: string[] = []
    const totalHours = session.endHour - session.startHour

    // Generate the hour labels in this session
    for (let i = 0; i <= totalHours; i += 1) {
      const currentHour = session.startHour + i
      const period = currentHour >= 12 ? 'pm' : 'am'
      let displayHour = currentHour > 12 ? currentHour - 12 : currentHour
      if (displayHour === 0) displayHour = 12
      hourLabels.push(`${displayHour}${period}`)
    }

    // Convert "HH:MM" string to absolute minutes from midnight
    const timeToMins = (timeStr: string): number => {
      const [h, m] = timeStr.split(':').map(Number)
      return h * 60 + m
    }

    // Format absolute minutes back to an elegant "HH:MM" timestamp
    const minsToTimeStr = (mins: number): string => {
      const h = Math.floor(mins / 60)
      const m = mins % 60
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
    }

    // For each location
    const mappedLocations = locations.map(loc => {
      // For each event taking place
      const sessionEvents = (loc.events || [])
        .filter(e => {
          const eStart = timeToMins(e.startTime)
          const eEnd = timeToMins(e.endTime)
          return eStart < endMins && eEnd > startMins
        })
        .sort((a, b) => timeToMins(a.startTime) - timeToMins(b.startTime))

      // Multi-row layout track allocation to prevent overlapping hidden cards and makes them stack
      const tracks: number[][] = []

      // Map percentage position values for events
      const mappedEvents = sessionEvents.map(e => {
        const eStart = Math.max(startMins, timeToMins(e.startTime))
        const eEnd = Math.min(endMins, timeToMins(e.endTime))

        const leftPct = ((eStart - startMins) / totalSessionMins) * 100
        const widthPct = ((eEnd - eStart) / totalSessionMins) * 100

        let assignedTrack = 0
        let placed = false

        for (let i = 0; i < tracks.length; i += 1) {
          if (eStart >= tracks[i][tracks[i].length - 1]) {
            assignedTrack = i
            tracks[i].push(eEnd)
            placed = true
            break
          }
        }

        if (!placed) {
          tracks.push([eEnd])
          assignedTrack = tracks.length - 1
        }

        return {
          ...e,
          leftPct: leftPct.toFixed(4),
          widthPct: widthPct.toFixed(4),
          trackOffset: (assignedTrack * 56 + 30).toString(),
        } as MappedEvent
      })

      const totalRowTracks = Math.max(1, tracks.length)

      // Calculate free intervals from the events
      const coveredMinutes = new Array(totalSessionMins).fill(false)
      sessionEvents.forEach(e => {
        const eStart = Math.max(startMins, timeToMins(e.startTime))
        const eEnd = Math.min(endMins, timeToMins(e.endTime))
        for (let m = eStart; m < eEnd; m += 1) {
          coveredMinutes[m - startMins] = true
        }
      })

      // Collate contiguous uncovered minutes back into concrete free and booked slot objects
      const derivedFreeSlots: Array<MappedSlot> = []
      const derivedBookedSlots: Array<MappedSlot> = []

      let insideGap = false
      let blockStart = startMins

      // Initialize tracking state based on first minute
      if (coveredMinutes.length > 0) {
        insideGap = !coveredMinutes[0]
      }

      for (let i = 0; i <= coveredMinutes.length; i += 1) {
        const isCurrentlyCovered = i === coveredMinutes.length ? true : coveredMinutes[i]
        const stateChanged = i === coveredMinutes.length || isCurrentlyCovered === insideGap

        if (stateChanged) {
          const blockEnd = startMins + i
          const left = ((blockStart - startMins) / totalSessionMins) * 100
          const width = ((blockEnd - blockStart) / totalSessionMins) * 100

          const slotData = {
            startTime: minsToTimeStr(blockStart),
            endTime: minsToTimeStr(blockEnd),
            leftPct: left.toFixed(4),
            widthPct: width.toFixed(4),
          }

          if (insideGap) {
            derivedFreeSlots.push(slotData)
          } else if (i !== coveredMinutes.length || blockStart !== blockEnd) {
            // Prevent empty blocks at final loop boundaries
            derivedBookedSlots.push(slotData)
          }

          insideGap = !isCurrentlyCovered
          blockStart = startMins + i
        }
      }

      return {
        dpsLocationId: loc.dpsLocationId,
        localName: loc.localName,
        events: mappedEvents,
        freeSlots: derivedFreeSlots,
        bookedSlots: derivedBookedSlots,
        totalRowHeight: (totalRowTracks * 56 + 40).toString(),
      } as MappedLocation
    })

    return {
      hourLabels,
      totalHours: totalHours.toString(),
      locations: mappedLocations,
    } as SessionData
  }
}
