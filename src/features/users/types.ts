import type { CurrentUserData } from '../../lib/api/types'

export type PermissionCode = CurrentUserData['permissions'][number]

export interface UserListItem {
  id: string
  email: string
  display_name: string
  status: 'active' | 'inactive'
  permissions: PermissionCode[]
}

export interface UserListResponse {
  items: UserListItem[]
  total: number
}

export interface Permission {
  code: PermissionCode
  module: string
  description: string
}
