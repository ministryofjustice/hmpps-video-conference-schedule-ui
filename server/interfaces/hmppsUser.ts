import { User } from '../@types/manageUsersApi/types'

/**
 * Prison users are those that have a user account in NOMIS.
 * HMPPS Auth automatically grants these users a `ROLE_PRISON` role.
 * Prison users have an additional numerical staffId. The userId is
 * a stringified version of the staffId. Some teams may need to separately
 * retrieve the user case load (which prisons that a prison user has access
 * to) and store it here, an example can be found in `hmpps-prisoner-profile`.
 */
export interface PrisonUser extends User {
  authSource: 'nomis'
  staffId: number
  activeCaseLoadId?: string
}

export interface HmppsUser extends PrisonUser {
  displayName: string
  roles: string[]
}
