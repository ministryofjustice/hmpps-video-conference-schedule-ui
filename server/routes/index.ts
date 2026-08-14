import { Router } from 'express'
import dailySchedule from './journeys/dailySchedule'
import roomAvailability from './journeys/roomAvailability'
import { Services } from '../services'

export default function routes(services: Services): Router {
  const router = Router()

  router.use('/', dailySchedule(services))
  router.use('/room-availability', roomAvailability(services))

  return router
}
