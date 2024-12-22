import { dataAccess } from '../data'
import AuditService from './auditService'
import UserService from './userService'
import PrisonService from './prisonService'
import AppointmentService from './appointmentService'

export const services = () => {
  const { applicationInfo, manageUsersApiClient, hmppsAuditClient, prisonRegisterApiClient, prisonApiClient } =
    dataAccess()

  const userService = new UserService(manageUsersApiClient)
  const auditService = new AuditService(hmppsAuditClient)
  const prisonService = new PrisonService(prisonRegisterApiClient)
  const appointmentService = new AppointmentService(prisonApiClient)

  return {
    applicationInfo,
    userService,
    auditService,
    prisonService,
    appointmentService,
  }
}

export type Services = ReturnType<typeof services>
