import { stubGet } from './wiremock'

const stubUser = (name: string = 'john smith') =>
  stubGet('/manage-users-api/users/USER1', {
    username: 'USER1',
    active: true,
    userId: '123456',
    authSource: 'nomis',
    activeCaseLoadId: 'MDI',
    name,
  })

export default {
  stubManageUsersPing: () => stubGet('/manage-users-api/health/ping'),
  stubUser,
}
