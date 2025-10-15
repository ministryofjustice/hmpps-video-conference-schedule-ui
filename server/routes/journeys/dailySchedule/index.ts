import { RequestHandler, Router } from 'express'
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

  const get = (path: string, handler: PageHandler) =>
    router.get(path, logPageViewMiddleware(auditService, handler), handler.GET)
  const post = (path: string, handler: RequestHandler, type?: new () => object) =>
    router.post(path, validationMiddleware(type), handler)

  const getAndPost = (path: string, handler: PageHandler) => {
    get(path, handler)
    post(path, handler.POST, handler.BODY)
  }

  getAndPost('/', new DailyScheduleHandler(referenceDataService, prisonService, scheduleService))
  get('/clear-filter', new ClearFilterHandler())
  get('/download-csv', new DownloadCsvHandler(scheduleService))
  getAndPost('/select-date', new SelectDateHandler())
  get('/movement-slips', new MovementSlipsHandler(scheduleService))

  return router
}
