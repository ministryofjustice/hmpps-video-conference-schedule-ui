import { RequestHandler } from 'express'
import logger from '../../logger'
import UserService from '../services/userService'

export default function populateCurrentUser(userService: UserService): RequestHandler {
  return async (req, res, next) => {
    try {
      if (res.locals.user) {
        const user = await userService.getUser(res.locals.user)
        if (user) {
          res.locals.user = { ...user, ...res.locals.user }
          if (req.session.activeCaseLoadId !== user.activeCaseLoadId) {
            delete req.session.journey
            delete req.session.journeyData
            req.session.activeCaseLoadId = user.activeCaseLoadId
          }
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
