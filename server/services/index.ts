import { AuditServiceFactory } from '@ministryofjustice/hmpps-audit-client'
import { dataAccess } from '../data'
import PrisonService from './prisonService'
import ScheduleService from './scheduleService'
import AppointmentService from './appointmentService'
import ReferenceDataService from './referenceDataService'
import OfficialVisitsService from './officialVisitsService'
import RoomAvailabilityService from './roomAvailabilityService'
import TelemetryService from './telemetryService'
import logger from '../../logger'
import config from '../config'

export const services = () => {
  const {
    applicationInfo,
    manageUsersApiClient,
    prisonRegisterApiClient,
    bookAVideoLinkApiClient,
    prisonerSearchApiClient,
    activitiesAndAppointmentsApiClient,
    locationsInsidePrisonApiClient,
    officialVisitsApiClient,
    applicationInsightsClient,
  } = dataAccess()

  const auditService = AuditServiceFactory.createInstance(config.sqs.audit, logger)
  const prisonService = new PrisonService(prisonRegisterApiClient)
  const appointmentService = new AppointmentService(activitiesAndAppointmentsApiClient, bookAVideoLinkApiClient)
  const referenceDataService = new ReferenceDataService(
    locationsInsidePrisonApiClient,
    activitiesAndAppointmentsApiClient,
    bookAVideoLinkApiClient,
  )
  const officialVisitsService = new OfficialVisitsService(officialVisitsApiClient)
  const scheduleService = new ScheduleService(
    appointmentService,
    referenceDataService,
    bookAVideoLinkApiClient,
    prisonerSearchApiClient,
    manageUsersApiClient,
    officialVisitsService,
  )

  const roomAvailabilityService = new RoomAvailabilityService(bookAVideoLinkApiClient)
  const telemetryService = new TelemetryService(applicationInsightsClient)

  return {
    applicationInfo,
    referenceDataService,
    auditService,
    prisonService,
    scheduleService,
    appointmentService,
    roomAvailabilityService,
    telemetryService,
  }
}

export type Services = ReturnType<typeof services>
