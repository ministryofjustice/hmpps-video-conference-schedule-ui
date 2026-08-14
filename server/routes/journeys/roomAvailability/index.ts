import { RequestHandler, Router } from 'express'
import { PageHandler } from '../../interfaces/pageHandler'
import logPageViewMiddleware from '../../../middleware/logPageViewMiddleware'
import type { Services } from '../../../services'
import DailyAvailabilityHandler from './handlers/dailyAvailabilityHandler'
import validationMiddleware from '../../../middleware/validationMiddleware'
import config from '../../../config'
import WeeklyAvailabilityHandler from './handlers/weeklyAvailabilityHandler'
import TimelineAvailabilityHandler from './handlers/timelineAvailabilityHandler'

export default function Index({ auditService, roomAvailabilityService, telemetryService }: Services): Router {
  const router = Router({ mergeParams: true })

  const get = (path: string, handler: PageHandler) =>
    router.get(path, logPageViewMiddleware(auditService, handler), handler.GET)
  const post = (path: string, handler: RequestHandler, type?: new () => object) =>
    router.post(path, validationMiddleware(type), handler)
  const getAndPost = (path: string, handler: PageHandler) => {
    get(path, handler)
    post(path, handler.POST, handler.BODY)
  }

  // Several choices of implementation - in preference order
  if (config.featureToggles.timelineAvailability) {
    getAndPost('/', new TimelineAvailabilityHandler(roomAvailabilityService))
  } else if (config.featureToggles.workingWeekAvailability) {
    getAndPost('/', new WeeklyAvailabilityHandler(roomAvailabilityService, telemetryService))
  } else {
    getAndPost('/', new DailyAvailabilityHandler(roomAvailabilityService))
  }

  return router
}
