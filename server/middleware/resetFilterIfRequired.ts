import { RequestHandler } from 'express'
import logger from '../../logger'

export default function resetFilterIfRequired(): RequestHandler {
  return async (req, res, next) => {
    try {
      if (req.session.journey && req.session.journey.scheduleFilters) {
        if (req.session.activeCaseLoadId !== req.session.journey.scheduleFilters?.caseLoadId) {
          delete req.session.journey
          delete req.session.journeyData
        }
      }

      next()
    } catch (error) {
      logger.error(error, `Failed check active caseload middleware`)
      next(error)
    }
  }
}
