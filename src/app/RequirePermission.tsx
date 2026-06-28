import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { PermissionCode } from '../features/users/types'

export function RequirePermission({
  authenticated,
  pending = false,
  permissions,
  permission,
  children,
}: {
  authenticated: boolean
  pending?: boolean
  permissions: PermissionCode[]
  permission: PermissionCode
  children: ReactNode
}) {
  if (pending) return null
  if (!authenticated) return <Navigate to="/login" replace />
  if (!permissions.includes(permission)) return <Navigate to="/forbidden" replace />
  return children
}
