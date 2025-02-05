/* eslint-disable import/first */
/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import { initialiseAppInsights, buildAppInsightsClient } from '../utils/azureAppInsights'
import applicationInfoSupplier from '../applicationInfo'

const applicationInfo = applicationInfoSupplier()
initialiseAppInsights()
buildAppInsightsClient(applicationInfo)

import config from '../config'
import ManageUsersApiClient from './manageUsersApiClient'
import HmppsAuditClient from './hmppsAuditClient'
import BookAVideoLinkApiClient from './bookAVideoLinkApiClient'
import FrontendComponentApiClient from './frontendComponentApiClient'
import PrisonRegisterApiClient from './prisonRegisterApiClient'
import PrisonApiClient from './prisonApiClient'
import PrisonerSearchApiClient from './prisonerSearchApiClient'
import NomisMappingApiClient from './nomisMappingApiClient'
import ActivitiesAndAppointmentsApiClient from './activitiesAndAppointmentsApiClient'
import LocationsInsidePrisonApiClient from './locationsInsidePrisonApiClient'

export const dataAccess = () => ({
  applicationInfo,
  frontendComponentApiClient: new FrontendComponentApiClient(),
  hmppsAuditClient: new HmppsAuditClient(config.sqs.audit),
  manageUsersApiClient: new ManageUsersApiClient(),
  activitiesAndAppointmentsApiClient: new ActivitiesAndAppointmentsApiClient(),
  bookAVideoLinkApiClient: new BookAVideoLinkApiClient(),
  nomisMappingApiClient: new NomisMappingApiClient(),
  prisonApiClient: new PrisonApiClient(),
  prisonRegisterApiClient: new PrisonRegisterApiClient(),
  prisonerSearchApiClient: new PrisonerSearchApiClient(),
  locationsInsidePrisonApiClient: new LocationsInsidePrisonApiClient(),
})

export type DataAccess = ReturnType<typeof dataAccess>
