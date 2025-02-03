import createHttpError from 'http-errors'
import { Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import type { Services } from '../../../services'
import DailyScheduleHandler from './handlers/dailyScheduleHandler'
import SelectDateHandler from './handlers/selectDateHandler'
import { PageHandler } from '../../interfaces/pageHandler'
import logPageViewMiddleware from '../../../middleware/logPageViewMiddleware'
import validationMiddleware from '../../../middleware/validationMiddleware'
import DownloadCsvHandler from './handlers/downloadCsvHandler'

export default function Index({
  auditService,
  referenceDataService,
  prisonService,
  scheduleService,
}: Services): Router {
  const router = Router({ mergeParams: true })

  const route = (path: string | string[], handler: PageHandler) =>
    router.get(path, logPageViewMiddleware(auditService, handler), asyncMiddleware(handler.GET)) &&
    router.post(path, validationMiddleware(handler.BODY), asyncMiddleware(handler.POST))

  // Only prison users are authorized to use this service
  router.use((req, res, next) =>
    res.locals.user.authSource === 'nomis' ? next() : next(createHttpError.Unauthorized()),
  )

  route('/', new DailyScheduleHandler(referenceDataService, prisonService, scheduleService))
  route('/download-csv', new DownloadCsvHandler(scheduleService))
  route('/select-date', new SelectDateHandler())

  return router
}
