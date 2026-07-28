import BookAVideoLinkApiClient from '../data/bookAVideoLinkApiClient'
import {LocationEvent} from '../@types/bookAVideoLinkApi/types'
import {calculateFreeTimeSlots, generateHourlySlots, simpleTimeToDate, TimeSlot} from '../utils/timeSlotUtils'
import logger from "../../logger";

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

export interface SessionConfig {
  name: string;
  startHour: number; // e.g., 8, 13, 18
  endHour: number;   // e.g., 12, 17, 20
}

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
  gridColumnInLine: string
  gridRowInLine: string
}

export interface FreeSlot {
  startTime: string
  endTime: string
  leftPct: string
  widthPct: string
}

export interface MappedLocation {
  dpsLocationId: string
  localName: string
  events: MappedEvent[]
  freeSlots: FreeSlot[]
}

export interface SessionData {
  totalGridColumns: number,
  backgroundHoursCount: number,
  hourLabels: string[],
  locations: MappedLocation[],
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

  public async getTimelineAvailability(prisonCode: string, onDate: Date, period: string, user: Express.User): Promise<SessionData> {

    logger.info(`Call to getTimeLineAvailability: ${prisonCode} ${onDate} ${period}`)

    // Get the events taking place in video locations on this date at this prison, split by the locations they are planned into
    const events = await this.bookAVideoLinkApiClient.getVideoEvents(prisonCode, { fromDate: onDate, endDate: onDate }, user)

    logger.info(`Events = ${JSON.stringify(events, null, 2)}`)

    // Set up the session hours based on the period requested
    let session: SessionConfig
    if (period === 'AM') {
      session = { name: 'Morning', startHour: 8, endHour: 13 }
    } else if (period === 'PM') {
      session = { name: 'Afternoon', startHour: 13, endHour: 18 }
    } else {
      session = { name: 'Evening', startHour: 18, endHour: 20 }
    }

    // Return the events taking place mapped to the locations within the session hours
    return this.mapTimelineData(events.locations, session)
  }

  private mapTimelineData (locations: LocationEvent[], session: SessionConfig): SessionData {
    const TRACK_MINUTES = 5; // 5-minute increments per grid cell
    const startMins = session.startHour * 60
    const endMins = session.endHour * 60
    const totalGridColumns = (endMins - startMins) / TRACK_MINUTES

    const hourLabels: string[] = [];
    const totalHours = session.endHour - session.startHour;
    for (let i = 0; i <= totalHours; i++) {
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

    // Convert absolute minutes to 1-based CSS Grid column line numbers
    const minsToGridColumn = (mins: number): number => {
      const relativeMins = mins - startMins
      const colIndex = Math.floor(relativeMins / TRACK_MINUTES) + 1
      return Math.max(1, Math.min(colIndex, totalGridColumns + 1))
    }

    const mappedLocations = locations.map(loc => {

      const sessionEvents = (loc.events || []).filter(e => {
        const eStart = timeToMins(e.startTime)
        const eEnd = timeToMins(e.endTime)
        return eStart < endMins && eEnd > startMins
      })
        .sort((a, b) => timeToMins(a.startTime) - timeToMins(b.startTime))

      // Dynamic multi-row layout track allocation to prevent overlapping hidden cards
      const tracks: number[][] = []

      // Map exact percentage position values for appointments
      const mappedEvents = sessionEvents.map(e => {

        const eStart = Math.max(startMins, timeToMins(e.startTime))
        const eEnd = Math.min(endMins, timeToMins(e.endTime))

        const colStart = minsToGridColumn(eStart)
        const colEnd = minsToGridColumn(eEnd)

        // Find first vertical layer track index where this card fits safely
        let assignedTrack = 0
        let placed = false

        for (let i = 0; i < tracks.length; i++) {
          const lastEndInTrack = tracks[i][tracks[i].length - 1];
          if (eStart >= lastEndInTrack) {
            assignedTrack = i
            tracks[i].push(eEnd)
            placed = true
            break;
          }
        }

        if (!placed) {
          tracks.push([eEnd])
          assignedTrack = tracks.length - 1
        }

        return {
          ...e,
          // Grid indices are 1-indexed, tracks are 0-indexed (add 1)
          gridColumnInLine: `${colStart} / ${colEnd}`,
          gridRowInLine: `${assignedTrack + 1}`,
        } as MappedEvent
      })

      logger.info(`Mapped events for location ${loc.dpsLocationId} ${loc.localName}`)
      logger.info(`${JSON.stringify(mappedEvents, null, 2)}`)

      // Calculate free intervals from the events
      const coveredMinutes = new Array(endMins - startMins).fill(false)
      sessionEvents.forEach(e => {
        const eStart = Math.max(startMins, timeToMins(e.startTime))
        const eEnd = Math.min(endMins, timeToMins(e.endTime))
        for (let m = eStart; m < eEnd; m++) {
          coveredMinutes[m - startMins] = true
        }
      });

      // Collate contiguous uncovered minutes back into concrete free-space objects
      const derivedFreeSlots: Array<FreeSlot> = []
      let insideFreeGap = false
      let gapStart = startMins

      for (let i = 0; i <= coveredMinutes.length; i++) {
        const isCurrentlyCovered = i === coveredMinutes.length ? true : coveredMinutes[i]

        if (!isCurrentlyCovered && !insideFreeGap) {
          insideFreeGap = true
          gapStart = startMins + i
        } else if (isCurrentlyCovered && insideFreeGap) {
          insideFreeGap = false
          const gapEnd = startMins + i

          const left = ((gapStart - startMins) / (endMins - startMins)) * 100
          const width = ((gapEnd - gapStart) / (endMins - startMins)) * 100

          derivedFreeSlots.push({
            startTime: minsToTimeStr(gapStart),
            endTime: minsToTimeStr(gapEnd),
            leftPct: `${left.toFixed(4)}%`,
            widthPct: `${width.toFixed(4)}%`,
          } as FreeSlot)
        }
      }

      return {
        dpsLocationId: loc.dpsLocationId,
        localName: loc.localName,
        events: mappedEvents,
        freeSlots: derivedFreeSlots,
      } as MappedLocation
    })

    return {
      totalGridColumns,
      backgroundHoursCount: totalHours,
      hourLabels,
      locations: mappedLocations
    }
  }
}
