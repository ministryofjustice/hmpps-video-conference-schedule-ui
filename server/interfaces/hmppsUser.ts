import { User } from '../@types/manageUsersApi/types'

export interface HmppsUser extends User {
  displayName: string
  roles: string[]
}
