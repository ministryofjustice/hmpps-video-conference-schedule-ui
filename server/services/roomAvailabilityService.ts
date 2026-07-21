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
  fullyBooked: boolean
  free: StartTimeEndTime[]
}

export type StartTimeEndTime = {
  startTime: string
  endTime: string
}

export default class RoomAvailabilityService {
  constructor() {}

  public async getRoomAvailability(period: string): Promise<RoomAvailability[]> {
    if (period === 'AM') {
      return [
        {
          description: 'VCC Room 13',
          hourlySlots: [
            {
              hour: 8,
              fullyBooked: true,
              free: [],
            },
            {
              hour: 9,
              fullyBooked: false,
              free: [],
            },
            {
              hour: 10,
              fullyBooked: false,
              free: [],
            },
            {
              hour: 11,
              fullyBooked: false,
              free: [],
            },
            {
              hour: 12,
              fullyBooked: false,
              free: [],
            },
          ],
        },
        {
          description: 'VCC Room 14',
          hourlySlots: [
            {
              hour: 8,
              fullyBooked: true,
              free: [],
            },
            {
              hour: 9,
              fullyBooked: false,
              free: [
                {
                  startTime: '09:00',
                  endTime: '09:30',
                },
                {
                  startTime: '09:45',
                  endTime: '10:00',
                },
              ],
            },
            {
              hour: 10,
              fullyBooked: false,
              free: [],
            },
            {
              hour: 11,
              fullyBooked: false,
              free: [],
            },
            {
              hour: 12,
              fullyBooked: false,
              free: [],
            },
          ],
        },
      ] as unknown as RoomAvailability[]
    }

    if (period === 'PM') {
      return [
        {
          description: 'VCC Room 12',
          hourlySlots: [
            {
              hour: 13,
              fullyBooked: true,
              free: [],
            },
            {
              hour: 14,
              fullyBooked: false,
              free: [],
            },
            {
              hour: 15,
              fullyBooked: false,
              free: [],
            },
            {
              hour: 16,
              fullyBooked: true,
              free: [],
            },
            {
              hour: 17,
              fullyBooked: false,
              free: [],
            },
          ],
        },
      ] as unknown as RoomAvailability[]
    }

    return [
      {
        description: 'VCC Room 1',
        hourlySlots: [
          {
            hour: 18,
            fullyBooked: false,
            free: [],
          },
          {
            hour: 19,
            fullyBooked: false,
            free: [],
          },
          {
            hour: 20,
            fullyBooked: false,
            free: [],
          },
        ],
      },
    ] as unknown as RoomAvailability[]
  }
}
