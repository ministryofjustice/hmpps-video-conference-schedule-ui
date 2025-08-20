import { RequestHandler } from 'express'
import logger from '../../logger'
import UserService from '../services/userService'
import AppointmentService from '../services/appointmentService'

export default function populateCurrentUser(
  userService: UserService,
  appointmentService: AppointmentService,
): RequestHandler {
  return async (req, res, next) => {
    try {
      if (res.locals.user) {
        req.middleware ??= {}

        const user = await userService.getUser(res.locals.user)
        if (user) {
          res.locals.user = { ...user, ...res.locals.user }
          if (req.session.activeCaseLoadId !== user.activeCaseLoadId) {
            delete req.session.journey
            delete req.session.journeyData
            req.session.activeCaseLoadId = user.activeCaseLoadId
          }

          req.middleware.prison = await appointmentService.getPrison(user.activeCaseLoadId, res.locals.user)
        } else {
          logger.info('No user available')
        }
      }
      next()
    } catch (error) {
      logger.error(error, `Failed to retrieve user for: ${res.locals.user && res.locals.user.username}`)
      next(error)
    }
  }
}
