import createHttpError from 'http-errors'
import { Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import type { Services } from '../../../services'
import HomeHandler from './handlers/homeHandler'
import { PageHandler } from '../../interfaces/pageHandler'
import logPageViewMiddleware from '../../../middleware/logPageViewMiddleware'
import validationMiddleware from '../../../middleware/validationMiddleware'

export default function Index({ auditService, prisonService }: Services): Router {
  const router = Router({ mergeParams: true })

  const route = (path: string | string[], handler: PageHandler) =>
    router.get(path, logPageViewMiddleware(auditService, handler), asyncMiddleware(handler.GET)) &&
    router.post(path, validationMiddleware(handler.BODY), asyncMiddleware(handler.POST))

  // Only prison users are authorized to use this service
  router.use((req, res, next) =>
    res.locals.user.authSource === 'nomis' ? next() : next(createHttpError.Unauthorized()),
  )

  route('/', new HomeHandler(prisonService))

  return router
}
