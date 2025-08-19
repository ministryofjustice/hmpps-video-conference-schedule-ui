import { dataAccess } from '../data'
import AuditService from './auditService'
import UserService from './userService'
import PrisonService from './prisonService'
import ScheduleService from './scheduleService'
import AppointmentService from './appointmentService'
import ReferenceDataService from './referenceDataService'

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
    locationsInsidePrisonApiClient,
  } = dataAccess()

  const userService = new UserService(manageUsersApiClient)
  const auditService = new AuditService(hmppsAuditClient)
  const prisonService = new PrisonService(prisonRegisterApiClient, activitiesAndAppointmentsApiClient)
  const appointmentService = new AppointmentService(
    prisonApiClient,
    activitiesAndAppointmentsApiClient,
    bookAVideoLinkApiClient,
  )
  const referenceDataService = new ReferenceDataService(
    locationsInsidePrisonApiClient,
    activitiesAndAppointmentsApiClient,
    bookAVideoLinkApiClient,
  )
  const scheduleService = new ScheduleService(
    appointmentService,
    referenceDataService,
    nomisMappingApiClient,
    bookAVideoLinkApiClient,
    prisonerSearchApiClient,
    manageUsersApiClient,
  )

  return {
    applicationInfo,
    referenceDataService,
    userService,
    auditService,
    prisonService,
    scheduleService,
    appointmentService,
  }
}

export type Services = ReturnType<typeof services>
