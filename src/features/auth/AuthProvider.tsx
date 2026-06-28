import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { createAuthService, type AuthService } from './auth-service'
import { supabase } from '../../lib/auth/supabase'

const AuthContext = createContext<AuthService | null>(null)

export function AuthProvider({ children, service }: { children: ReactNode; service?: AuthService }) {
  const value = useMemo(() => service ?? createAuthService(supabase), [service])
  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuthService() {
  const service = useContext(AuthContext)
  if (!service) {
    throw new Error('AuthProvider is required')
  }
  return service
}
