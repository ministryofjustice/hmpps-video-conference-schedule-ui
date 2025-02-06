import { Period } from '../../../services/appointmentService'

export type ScheduleFilters = {
  wing?: string[]
  appointmentType?: string[]
  period?: Period[]
  appointmentLocation?: string[]
  courtOrProbationTeam?: string[]
}
