import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { RestClient, asUser } from '@ministryofjustice/hmpps-rest-client'
import config from '../config'
import logger from '../../logger'

type AvailableComponent = 'header' | 'footer'

interface Component {
  html: string
  css: string[]
  javascript: string[]
}

export default class FrontendComponentApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Frontend Component API', config.apis.frontendComponents, logger, authenticationClient)
  }

  getComponents(components: AvailableComponent[], user: Express.User): Promise<Record<AvailableComponent, Component>> {
    return this.get(
      {
        path: `/components`,
        query: `component=${components.join('&component=')}`,
        headers: { 'x-user-token': user.token },
      },
      asUser(user.token),
    )
  }
}
