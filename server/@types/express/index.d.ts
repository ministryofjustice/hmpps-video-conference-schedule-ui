import { ScheduleFilters } from '../../routes/journeys/dailySchedule/journey'
import { components } from '../bookAVideoLinkApi'
import { HmppsUser } from '../../interfaces/hmppsUser'

export default {}

export interface JourneyData extends Journey {
  instanceUnixEpoch: number
}

export interface Journey {
  scheduleFilters?: ScheduleFilters
}

declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    nowInMinutes: number
    activeCaseLoadId: string
    journey: Journey
    journeyData: Record<string, JourneyData>
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    rawBody: object
  }

  interface Response {
    addSuccessMessage?(heading: string, message?: string): void
    addValidationError?(message: string, field?: string): void
    validationFailed?(message?: string, field?: string): void
  }
}

export declare global {
  namespace Express {
    interface User extends Partial<HmppsUser> {
      token: string
      authSource: string
      activeCaseLoad?: CaseLoad | undefined
    }

    interface Request {
      verified?: boolean
      id: string
      logout(done: (err: unknown) => void): void

      middleware?: {
        prison?: components['schemas']['Prison']
      }
    }

    interface Locals {
      user: Express.User
    }
  }
}
