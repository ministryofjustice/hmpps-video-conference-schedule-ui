import { Router } from 'express'
import dailySchedule from './journeys/dailySchedule'
import { Services } from '../services'

export default function routes(services: Services): Router {
  const router = Router()

  router.use('/', dailySchedule(services))

  return router
}
