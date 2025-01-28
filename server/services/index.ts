import { dataAccess } from '../data'
import AuditService from './auditService'
import UserService from './userService'
import PrisonService from './prisonService'
import ScheduleService from './scheduleService'
import AppointmentService from './appointmentService'

export const services = () => {
  const {
    applicationInfo,
    manageUsersApiClient,
    hmppsAuditClient,
    prisonRegisterApiClient,
    prisonApiClient,
    nomisMappingApiClient,
    bookAVideoLinkApiClient,
    prisonerSearchApiClient,
    activitiesAndAppointmentsApiClient,
  } = dataAccess()

  const userService = new UserService(manageUsersApiClient)
  const auditService = new AuditService(hmppsAuditClient)
  const prisonService = new PrisonService(prisonRegisterApiClient, activitiesAndAppointmentsApiClient)
  const appointmentService = new AppointmentService(prisonApiClient, activitiesAndAppointmentsApiClient)
  const scheduleService = new ScheduleService(
    appointmentService,
    nomisMappingApiClient,
    bookAVideoLinkApiClient,
    prisonerSearchApiClient,
  )

  return {
    applicationInfo,
    userService,
    auditService,
    prisonService,
    scheduleService,
  }
}

export type Services = ReturnType<typeof services>
