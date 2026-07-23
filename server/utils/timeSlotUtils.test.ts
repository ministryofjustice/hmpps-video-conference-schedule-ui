import { generateHourlySlots, simpleTimeToDate, calculateFreeTimeSlots } from './timeSlotUtils'

describe('generateHourlySlots', () => {
  it('generateHourlySlots for 30 mins', () => {
    const start = simpleTimeToDate('08:10')
    const end = simpleTimeToDate('08:40')

    expect(generateHourlySlots(start, end)).toEqual([
      { hour: 8, durationInMinutes: 30, startTime: '08:10', endTime: '08:40' },
    ])
  })

  it('generateHourlySlots for one hour on the hour', () => {
    const start = simpleTimeToDate('08:00')
    const end = simpleTimeToDate('09:00')

    expect(generateHourlySlots(start, end)).toEqual([
      { hour: 8, durationInMinutes: 60, startTime: '08:00', endTime: '09:00' },
    ])
  })

  it('generateHourlySlots for two hours on the hour', () => {
    const start = simpleTimeToDate('08:00')
    const end = simpleTimeToDate('10:00')

    expect(generateHourlySlots(start, end)).toEqual([
      { hour: 8, durationInMinutes: 60, startTime: '08:00', endTime: '09:00' },
      { hour: 9, durationInMinutes: 60, startTime: '09:00', endTime: '10:00' },
    ])
  })

  it('generateHourlySlots for partial hours', () => {
    const start = simpleTimeToDate('08:10')
    const end = simpleTimeToDate('09:30')

    expect(generateHourlySlots(start, end)).toEqual([
      { hour: 8, durationInMinutes: 50, startTime: '08:10', endTime: '09:00' },
      { hour: 9, durationInMinutes: 30, startTime: '09:00', endTime: '09:30' },
    ])
  })
})

describe('calculateFreeTimeSlots', () => {
  it('no free slot in the hour', () => {
    expect(
      calculateFreeTimeSlots(8, generateHourlySlots(simpleTimeToDate('08:00'), simpleTimeToDate('09:00'))),
    ).toEqual([])
  })

  it('one free slot in the hour', () => {
    expect(
      calculateFreeTimeSlots(8, generateHourlySlots(simpleTimeToDate('08:00'), simpleTimeToDate('08:30'))),
    ).toEqual([{ hour: 8, durationInMinutes: 30, startTime: '08:30', endTime: '09:00' }])
  })

  it('two free slots in the hour', () => {
    expect(
      calculateFreeTimeSlots(8, generateHourlySlots(simpleTimeToDate('08:20'), simpleTimeToDate('08:40'))),
    ).toEqual([
      { hour: 8, durationInMinutes: 20, startTime: '08:00', endTime: '08:20' },
      { hour: 8, durationInMinutes: 20, startTime: '08:40', endTime: '09:00' },
    ])
  })

  it('throw error if any slot does not match expected hour', () => {
    expect(() =>
      calculateFreeTimeSlots(9, generateHourlySlots(simpleTimeToDate('08:20'), simpleTimeToDate('08:40'))),
    ).toThrow('Invalid hour: 8')
  })
})
