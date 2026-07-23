import { enGB } from 'date-fns/locale'
import { addMinutes, differenceInMinutes, format, isValid, parse } from 'date-fns'
import { formatDate } from './utils'

export interface TimeSlot {
  hour: number
  durationInMinutes: number
  startTime: string
  endTime: string
}

export function simpleTimeToDate(time: string): Date | null {
  return time ? parse(time, 'HH:mm', new Date(0), { locale: enGB }) : null
}

export function generateHourlySlots(startTime: Date, endTime: Date): TimeSlot[] {
  const slots: TimeSlot[] = []

  let current = new Date(startTime)

  while (current < endTime) {
    // Calculate the next hour boundary
    const slotEnd = roundUpToNextHour(current)

    // Cap at end time if needed
    const actualEnd = slotEnd > endTime ? new Date(endTime) : slotEnd

    slots.push({
      hour: current.getHours(),
      durationInMinutes: differenceInMinutes(actualEnd, current),
      startTime: dateToSimpleTime(current),
      endTime: dateToSimpleTime(actualEnd),
    })

    current = actualEnd
  }

  return slots
}

function dateToSimpleTime(date: Date): string | undefined {
  if (!isValid(date)) return undefined
  const hour = format(date, 'HH')
  const minute = format(date, 'mm')
  return `${hour}:${minute}`
}

function roundUpToNextHour(time: Date): Date {
  const result = new Date(time)
  if (result.getMinutes() === 0 && result.getSeconds() === 0) {
    result.setHours(result.getHours() + 1, 0, 0, 0)
  } else {
    result.setHours(result.getHours() + 1, 0, 0, 0)
  }
  return result
}

interface TimeRange {
  start: number // minutes from the start of the hour (0-60)
  end: number // minutes from the start of the hour (0-60)
}

export function calculateFreeTimeSlots(hour: number, busySlots: TimeSlot[], minimumDuration = 5): TimeSlot[] {
  busySlots.forEach(slot => {
    if (slot.hour !== hour) {
      throw new Error(`Invalid hour: ${slot.hour}`)
    }
  })

  const freeSlots = calculateFreeMinuteSlots(toTimeRangesForGivenHour(hour, busySlots), minimumDuration)

  return freeSlots.map(slot => ({
    hour,
    durationInMinutes: slot.end - slot.start,
    startTime: plusMinutes(`${hour}:00`, slot.start),
    endTime: plusMinutes(`${hour}:00`, slot.end),
  }))
}

function plusMinutes(time: string, minutes: number = 15): string {
  return formatDate(addMinutes(parse(time, 'HH:mm', new Date()), minutes), 'HH:mm')
}

function toTimeRangesForGivenHour(hour: number, timeSlots: TimeSlot[]): TimeRange[] {
  const filtered = timeSlots.filter(slot => parseInt(slot.startTime.split(':')[0], 10) === hour)

  return filtered.map(slot => ({
    start: parseInt(slot.startTime.split(':')[1], 10),
    end: parseInt(slot.startTime.split(':')[1], 10) + minutesBetween(slot.startTime, slot.endTime),
  }))
}

function minutesBetween(startTime: string, endTime: string): number {
  const [startHours, startMinutes] = startTime.split(':').map(Number)
  const [endHours, endMinutes] = endTime.split(':').map(Number)

  const start = startHours * 60 + startMinutes
  const end = endHours * 60 + endMinutes

  return end - start
}

function calculateFreeMinuteSlots(busySlots: TimeRange[], minimumDuration = 5): TimeRange[] {
  if (minimumDuration < 5) {
    throw new Error('Minimum duration must be at least 5 minutes')
  }

  busySlots.forEach(slot => {
    if (slot.start < 0 || slot.start > 60) {
      throw new Error(`Invalid start time: ${slot.start}`)
    }

    if (slot.end < 0 || slot.end > 60) {
      throw new Error(`Invalid end time: ${slot.end}`)
    }

    if (slot.end < slot.start) {
      throw new Error(`End time must be greater than start time: ${slot.start} - ${slot.end}`)
    }
  })

  const sorted = [...busySlots].sort((a, b) => a.start - b.start)

  // Merge overlapping busy slots
  const merged: TimeRange[] = []

  for (const slot of sorted) {
    const last = merged[merged.length - 1]

    if (!last || slot.start > last.end) {
      merged.push({ ...slot })
    } else {
      last.end = Math.max(last.end, slot.end)
    }
  }

  const freeSlots: TimeRange[] = []
  let current = 0

  for (const busy of merged) {
    const gap = busy.start - current

    if (gap >= minimumDuration) {
      freeSlots.push({
        start: current,
        end: busy.start,
      })
    }

    current = busy.end
  }

  // Check the remaining time until the end of the hour
  if (60 - current >= minimumDuration) {
    freeSlots.push({
      start: current,
      end: 60,
    })
  }

  return freeSlots
}
