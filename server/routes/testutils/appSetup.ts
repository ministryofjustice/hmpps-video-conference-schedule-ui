import express, { Express, RequestHandler } from 'express'
import { NotFound } from 'http-errors'
import { v4 as uuidv4 } from 'uuid'

import routes from '../index'
import nunjucksSetup from '../../utils/nunjucksSetup'
import errorHandler from '../../errorHandler'
import * as auth from '../../authentication/auth'
import type { Services } from '../../services'
import type { ApplicationInfo } from '../../applicationInfo'
import AuditService from '../../services/auditService'
import setUpWebSession from '../../middleware/setUpWebSession'
import { Journey } from '../../@types/express'
import { testUtilRoutes } from './testUtilRoute'
import setUpFlash from '../../middleware/setUpFlash'
import { Prison } from '../../@types/bookAVideoLinkApi/types'
import AppointmentService from '../../services/appointmentService'

jest.mock('../../services/auditService')
jest.mock('../../services/appointmentService')

export const journeyId = () => '9211b69b-826f-4f48-a43f-8af59dddf39f'

const testAppInfo: ApplicationInfo = {
  applicationName: 'test',
  buildNumber: '1',
  gitRef: 'long ref',
  gitShortHash: 'short ref',
  productId: '1',
  branchName: 'main',
}

export const user: Express.User = {
  name: 'FIRST LAST',
  userId: 'id',
  token: 'token',
  username: 'user1',
  displayName: 'First Last',
  active: true,
  authSource: 'nomis',
  activeCaseLoadId: 'MDI',
}

export const moorlandPrisonPickUpTime30: Prison = {
  prisonId: 1,
  code: 'MDI',
  name: 'Moorland (HMP)',
  enabled: true,
  pickUpTime: 30,
}

export const moorlandPrisonNoPickUpTime: Prison = {
  prisonId: 1,
  code: 'MDI',
  name: 'Moorland (HMP)',
  enabled: true,
  pickUpTime: null,
}

export const flashProvider = jest.fn()

function appSetup(
  services: Services,
  production: boolean,
  userSupplier: () => Express.User,
  journeySessionSupplier: () => Journey,
  middlewares: RequestHandler[] = [],
  prisonSupplier = () => moorlandPrisonPickUpTime30,
): Express {
  const app = express()

  flashProvider.mockReturnValue([])

  app.set('view engine', 'njk')

  app.use(setUpWebSession())
  app.use((req, res, next) => {
    req.user = userSupplier()
    req.session.journey = journeySessionSupplier()
    req.session.journeyData = {}
    req.session.journeyData[journeyId()] = { instanceUnixEpoch: Date.now(), ...journeySessionSupplier() }
    req.flash = flashProvider
    req.middleware ??= {}
    req.middleware.prison = prisonSupplier()
    res.locals = {
      user: { ...req.user },
    }
    next()
  })
  app.use((req, res, next) => {
    req.id = uuidv4()
    next()
  })
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(setUpFlash())
  nunjucksSetup(app, testAppInfo)
  middlewares.forEach(mw => app.use(mw))
  app.use(routes(services))
  app.use(testUtilRoutes())
  app.use((req, res, next) => next(new NotFound()))
  app.use(errorHandler(production))

  return app
}

export function appWithAllRoutes({
  production = false,
  services = {},
  userSupplier = () => user,
  journeySessionSupplier = () => ({}),
  middlewares = [],
  prisonSupplier = () => moorlandPrisonPickUpTime30,
}: {
  production?: boolean
  services?: Partial<Services>
  userSupplier?: () => Express.User
  journeySessionSupplier?: () => Journey
  middlewares?: RequestHandler[]
  prisonSupplier?: () => Prison
}): Express {
  const auditService = new AuditService(null) as jest.Mocked<AuditService>
  const appointmentService = new AppointmentService(null, null, null) as jest.Mocked<AppointmentService>

  auditService.logPageView.mockResolvedValue(null)
  appointmentService.getPrison.mockResolvedValue(prisonSupplier())

  auth.default.authenticationMiddleware = () => (req, res, next) => next()
  return appSetup(
    {
      auditService,
      appointmentService,
      ...services,
    } as Services,
    production,
    userSupplier,
    journeySessionSupplier,
    middlewares,
    prisonSupplier,
  )
}
