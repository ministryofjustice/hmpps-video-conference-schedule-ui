import { RequestHandler } from 'express'
import AppointmentService from '../services/appointmentService'
import logger from '../../logger'

export default function populatePrisonConfig(appointmentService: AppointmentService): RequestHandler {
  return async (req, res, next) => {
    req.middleware ??= {}

    try {
      req.middleware.prison = await appointmentService.getPrison(res.locals.user.activeCaseLoadId, res.locals.user)

      return next()
    } catch (error) {
      logger.error(error, `Failed to populate prison middleware`)
      return next(error)
    }
  }
}
