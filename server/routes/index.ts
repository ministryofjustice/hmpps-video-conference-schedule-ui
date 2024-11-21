import { Router } from 'express'
import home from './journeys/home'
import { Services } from '../services'

export default function routes(services: Services): Router {
  const router = Router()

  router.use('/', home(services))

  return router
}
