import { RequestHandler, Router } from 'express'
import { PageHandler } from '../../interfaces/pageHandler'
import logPageViewMiddleware from '../../../middleware/logPageViewMiddleware'
import type { Services } from '../../../services'
import AvailabilityCheckerHandler from './handlers/availabilityCheckerHandler'
import validationMiddleware from '../../../middleware/validationMiddleware'
import config from '../../../config'
import WorkingWeekAvailabilityCheckerHandler from './handlers/workingWeekAvailabilityCheckerHandler'
import TimelineAvailabilityCheckerHandler from './handlers/timelineAvailabilityCheckerHandler'

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
  if (config.featureToggles.timelineAvailabilityChecker) {
    getAndPost('/', new TimelineAvailabilityCheckerHandler(roomAvailabilityService))
  } else if (config.featureToggles.workingWeekAvailabilityChecker) {
    getAndPost('/', new WorkingWeekAvailabilityCheckerHandler(roomAvailabilityService, telemetryService))
  } else {
    getAndPost('/', new AvailabilityCheckerHandler(roomAvailabilityService))
  }

  return router
}
