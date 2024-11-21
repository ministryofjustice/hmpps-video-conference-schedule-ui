import RestClient, { TokenType } from './restClient'
import config from '../config'

type AvailableComponent = 'header' | 'footer'

interface Component {
  html: string
  css: string[]
  javascript: string[]
}

export default class FrontendComponentApiClient extends RestClient {
  constructor() {
    super('Frontend Component API', config.apis.frontendComponents)
  }

  getComponents(components: AvailableComponent[], user: Express.User): Promise<Record<AvailableComponent, Component>> {
    return this.get(
      {
        path: `/components`,
        query: `component=${components.join('&component=')}`,
        headers: { 'x-user-token': user.token },
      },
      user,
      TokenType.USER_TOKEN,
    )
  }
}
