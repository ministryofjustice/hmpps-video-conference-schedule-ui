import { Router } from 'express'
import dailySchedule from './journeys/dailySchedule'
import availabilityChecker from './journeys/availabilityChecker'
import { Services } from '../services'

export default function routes(services: Services): Router {
  const router = Router()

  router.use('/', dailySchedule(services))
  router.use('/room-availability', availabilityChecker(services))

  return router
}
