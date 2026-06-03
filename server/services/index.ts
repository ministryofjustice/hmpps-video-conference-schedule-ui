import { dataAccess } from '../data'
import AuditService from './auditService'
import PrisonService from './prisonService'
import ScheduleService from './scheduleService'
import AppointmentService from './appointmentService'
import ReferenceDataService from './referenceDataService'
import OfficialVisitsService from './officialVisitsService'

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
    officialVisitsApiClient,
  } = dataAccess()

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
  const officialVisitsService = new OfficialVisitsService(officialVisitsApiClient)
  const scheduleService = new ScheduleService(
    appointmentService,
    referenceDataService,
    nomisMappingApiClient,
    bookAVideoLinkApiClient,
    prisonerSearchApiClient,
    manageUsersApiClient,
    officialVisitsService,
  )

  return {
    applicationInfo,
    referenceDataService,
    auditService,
    prisonService,
    scheduleService,
    appointmentService,
  }
}

export type Services = ReturnType<typeof services>
