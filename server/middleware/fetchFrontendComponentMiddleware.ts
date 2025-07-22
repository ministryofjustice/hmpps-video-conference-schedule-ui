import { Router } from 'express'
import { DataAccess } from '../data'
import logger from '../../logger'

export default function setUpFrontendComponents({ frontendComponentApiClient }: DataAccess): Router {
  const router = Router({ mergeParams: true })

  router.get('*feComponents', async (req, res, next) => {
    try {
      const { user } = res.locals
      const { header, footer } = await frontendComponentApiClient.getComponents(['header', 'footer'], user)
      res.locals.feComponents = {
        header: header.html,
        footer: footer.html,
        cssIncludes: [...header.css, ...footer.css],
        jsIncludes: [...header.javascript, ...footer.javascript],
      }
    } catch (error) {
      logger.error(error, 'Failed to retrieve front end components')
    }
    next()
  })

  return router
}
