import { dataAccess } from '../data'
import AuditService from './auditService'
import UserService from './userService'
import PrisonService from './prisonService'

export const services = () => {
  const { applicationInfo, manageUsersApiClient, hmppsAuditClient, prisonRegisterApiClient } = dataAccess()

  const userService = new UserService(manageUsersApiClient)
  const auditService = new AuditService(hmppsAuditClient)
  const prisonService = new PrisonService(prisonRegisterApiClient)

  return {
    applicationInfo,
    userService,
    auditService,
    prisonService,
  }
}

export type Services = ReturnType<typeof services>
