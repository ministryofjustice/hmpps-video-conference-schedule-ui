import jwt from 'jsonwebtoken'
import { HmppsUser } from '../interfaces/hmppsUser'

function createUserToken(authorities: string[]) {
  const payload = {
    user_name: 'user1',
    scope: ['read', 'write'],
    auth_source: 'nomis',
    authorities,
    jti: 'a610a10-cca6-41db-985f-e87efb303aaf',
    client_id: 'clientid',
  }

  return jwt.sign(payload, 'secret', { expiresIn: '1h' })
}

export default function createUser(authorities: string[]) {
  return { token: createUserToken(authorities), username: 'jbloggs', activeCaseLoadId: 'MDI' } as Express.User
}

export function createHmppsUser(authorities: string[], roles: string[] = []) {
  return {
    token: createUserToken(authorities),
    username: 'jbloggs',
    activeCaseLoadId: 'MDI',
    displayName: 'Hmpps User',
    roles,
  } as unknown as HmppsUser
}
