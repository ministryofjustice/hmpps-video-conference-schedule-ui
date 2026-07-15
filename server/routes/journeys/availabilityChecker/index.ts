import { Router } from 'express'
import { PageHandler } from '../../interfaces/pageHandler'
import logPageViewMiddleware from '../../../middleware/logPageViewMiddleware'
import type { Services } from '../../../services'
import AvailabilityCheckerHandler from './handlers/availabilityCheckerHandler'

export default function Index({ auditService }: Services): Router {
  const router = Router({ mergeParams: true })

  const get = (path: string, handler: PageHandler) =>
    router.get(path, logPageViewMiddleware(auditService, handler), handler.GET)

  get('/', new AvailabilityCheckerHandler())

  return router
}
