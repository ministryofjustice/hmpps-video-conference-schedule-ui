import { stubGet } from './wiremock'

export default {
  stubComponents: () =>
    stubGet('/frontend-components-api/components\\?component=header&component=footer', {
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
        html: '',
        css: [''],
        javascript: [''],
      },
      footer: {
        html: '',
        css: [''],
        javascript: [],
      },
    }),
}
