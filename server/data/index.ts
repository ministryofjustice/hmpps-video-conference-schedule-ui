/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import { AuthenticationClient, InMemoryTokenStore, RedisTokenStore } from '@ministryofjustice/hmpps-auth-clients'
import { createRedisClient } from './redisClient'
import { buildAppInsightsClient, initialiseAppInsights } from '../utils/azureAppInsights'
import applicationInfoSupplier from '../applicationInfo'
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
import OfficialVisitsApiClient from './officialVisitsApiClient'
import logger from '../../logger'

const applicationInfo = applicationInfoSupplier()
initialiseAppInsights()
buildAppInsightsClient(applicationInfo)

export const dataAccess = () => {
  const hmppsAuthClient = new AuthenticationClient(
    config.apis.hmppsAuth,
    logger,
    config.redis.enabled ? new RedisTokenStore(createRedisClient()) : new InMemoryTokenStore(),
  )

  return {
    applicationInfo,
    frontendComponentApiClient: new FrontendComponentApiClient(hmppsAuthClient),
    hmppsAuditClient: new HmppsAuditClient(config.sqs.audit),
    manageUsersApiClient: new ManageUsersApiClient(hmppsAuthClient),
    activitiesAndAppointmentsApiClient: new ActivitiesAndAppointmentsApiClient(hmppsAuthClient),
    bookAVideoLinkApiClient: new BookAVideoLinkApiClient(hmppsAuthClient),
    nomisMappingApiClient: new NomisMappingApiClient(hmppsAuthClient),
    prisonApiClient: new PrisonApiClient(hmppsAuthClient),
    prisonRegisterApiClient: new PrisonRegisterApiClient(hmppsAuthClient),
    prisonerSearchApiClient: new PrisonerSearchApiClient(hmppsAuthClient),
    locationsInsidePrisonApiClient: new LocationsInsidePrisonApiClient(hmppsAuthClient),
    officialVisitsApiClient: new OfficialVisitsApiClient(hmppsAuthClient),
  }
}

export type DataAccess = ReturnType<typeof dataAccess>
