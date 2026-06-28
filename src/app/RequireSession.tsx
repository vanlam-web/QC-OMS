import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'

export function RequireSession({
  authenticated,
  pending = false,
  children,
}: {
  authenticated: boolean
  pending?: boolean
  children: ReactNode
}) {
  if (pending) return null
  if (!authenticated) return <Navigate to="/login" replace />
  return children
}
