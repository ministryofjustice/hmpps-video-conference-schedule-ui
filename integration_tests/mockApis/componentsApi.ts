import type { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

export default {
  stubPing: (httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/frontend-components-api/health',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { status: httpStatus === 200 ? 'UP' : 'DOWN' },
      },
    }),
  stubComponents: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/frontend-components-api/components\\?component=header&component=footer',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          meta: {
            caseLoads: [
              {
                caseLoadId: 'MDI',
                description: 'Moorland (HMP)',
                currentlyActive: true,
              },
            ],
            activeCaseLoad: {
              caseLoadId: 'MDI',
              description: 'Moorland (HMP)',
              currentlyActive: true,
            },
            services: [],
          },
          header: {
            html: '<header>Sign in <a href="/sign-out">Sign out</a></header>',
            css: [''],
            javascript: [''],
          },
          footer: {
            html: '',
            css: [''],
            javascript: [],
          },
        },
      },
    }),
}
