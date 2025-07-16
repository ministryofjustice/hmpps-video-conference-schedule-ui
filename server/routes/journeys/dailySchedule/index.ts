import { Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import type { Services } from '../../../services'
import DailyScheduleHandler from './handlers/dailyScheduleHandler'
import ClearFilterHandler from './handlers/clearFilterHandler'
import SelectDateHandler from './handlers/selectDateHandler'
import { PageHandler } from '../../interfaces/pageHandler'
import logPageViewMiddleware from '../../../middleware/logPageViewMiddleware'
import validationMiddleware from '../../../middleware/validationMiddleware'
import DownloadCsvHandler from './handlers/downloadCsvHandler'
import MovementSlipsHandler from './handlers/movementSlips'

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

  route('/', new DailyScheduleHandler(referenceDataService, prisonService, scheduleService))
  route('/clear-filter', new ClearFilterHandler())
  route('/download-csv', new DownloadCsvHandler(scheduleService))
  route('/movement-slips', new MovementSlipsHandler(prisonService, scheduleService))
  route('/select-date', new SelectDateHandler())

  return router
}
