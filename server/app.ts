import 'reflect-metadata'
import express from 'express'

import createError from 'http-errors'

import { getFrontendComponents, retrieveCaseLoadData } from '@ministryofjustice/hmpps-connect-dps-components'

import nunjucksSetup from './utils/nunjucksSetup'
import errorHandler from './errorHandler'
import { appInsightsMiddleware } from './utils/azureAppInsights'
import setUpAuthentication from './middleware/setUpAuthentication'
import setUpCsrf from './middleware/setUpCsrf'
import setUpCurrentUser from './middleware/setUpCurrentUser'
import setUpHealthChecks from './middleware/setUpHealthChecks'
import setUpStaticResources from './middleware/setUpStaticResources'
import setUpWebRequestParsing from './middleware/setupRequestParsing'
import setUpWebSecurity from './middleware/setUpWebSecurity'
import setUpWebSession from './middleware/setUpWebSession'

import routes from './routes'
import type { Services } from './services'
import setUpFlash from './middleware/setUpFlash'
import authorisationMiddleware from './middleware/authorisationMiddleware'
import config from './config'
import logger from '../logger'
import resetFilterIfRequired from './middleware/resetFilterIfRequired'
import populatePrisonConfig from './middleware/populatePrisonConfig'

export default function createApp(services: Services): express.Application {
  const app = express()

  app.set('json spaces', 2)
  app.set('trust proxy', true)
  app.set('port', process.env.PORT || 3000)

  app.use(appInsightsMiddleware())
  app.use(setUpHealthChecks(services.applicationInfo))
  app.use(setUpWebSecurity())
  app.use(setUpWebSession())
  app.use(setUpWebRequestParsing())
  app.use(setUpStaticResources())
  nunjucksSetup(app, services.applicationInfo)
  app.use(setUpAuthentication())
  app.use(authorisationMiddleware(['ROLE_PRISON']))
  app.use(setUpCsrf())
  app.use(setUpFlash())
  app.use(setUpCurrentUser())

  app.get(
    /(.*)/,
    getFrontendComponents({
      requestOptions: { includeSharedData: true },
      componentApiConfig: config.apis.frontendComponents,
      dpsUrl: config.dpsUrl,
    }),
  )

  app.use(retrieveCaseLoadData({ logger, prisonApiConfig: config.apis.prisonApi }))

  // These must be after the caseload retrieval is carried out above.
  app.use(resetFilterIfRequired())
  app.use(populatePrisonConfig(services.appointmentService))

  app.use(routes(services))

  app.use((req, res, next) => next(createError(404, 'Not found')))
  app.use(errorHandler(process.env.NODE_ENV === 'production'))

  return app
}
