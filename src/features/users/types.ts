import type { CurrentUserData } from '../../lib/api/types'

export type PermissionCode = CurrentUserData['permissions'][number]

export interface Workstation {
  id: string
  code: string
  name: string
  status: 'active' | 'inactive'
}
