import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { createAuthService, type AuthService } from './auth-service'
import { supabase } from '../../lib/auth/supabase'
import { createApiClient, ApiError } from '../../lib/api/client'
import type { CurrentUserData } from '../../lib/api/types'
import {
  clearWorkstationId,
  createFoundationService,
  getWorkstationId,
  setWorkstationId,
  type ApiRequester,
} from '../users/foundation-service'
import type { Workstation } from '../users/types'

export interface AuthContextValue extends AuthService {
  initialized: boolean
  currentUser: CurrentUserData | null
  workstations: Workstation[]
  loadWorkstations(): Promise<void>
  refreshMe(): Promise<void>
  selectWorkstation(id: string): Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({
  children,
  service,
  api,
}: {
  children: ReactNode
  service?: AuthService
  api?: ApiRequester
}) {
  const authService = useMemo(() => service ?? createAuthService(supabase), [service])
  const foundation = useMemo(() => {
    if (api) return createFoundationService(api)

    const client = createApiClient({
      baseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
      getAccessToken: authService.getAccessToken,
      getWorkstationId,
    })
    return createFoundationService(client)
  }, [api, authService])
  const [initialized, setInitialized] = useState(true)
  const [currentUser, setCurrentUser] = useState<CurrentUserData | null>(null)
  const [workstations, setWorkstations] = useState<Workstation[]>([])

  const signOut = useCallback(async () => {
    await authService.signOut()
    clearWorkstationId()
    setCurrentUser(null)
    setWorkstations([])
  }, [authService])

  const refreshMe = useCallback(async () => {
    try {
      const me = await foundation.getMe()
      setCurrentUser(me)
    } catch (cause) {
      if (cause instanceof ApiError && cause.code === 'WORKSTATION_INVALID') {
        clearWorkstationId()
        const me = await foundation.getMe()
        setCurrentUser(me)
        return
      }

      if (cause instanceof ApiError && ['AUTH_REQUIRED', 'ACCOUNT_INACTIVE'].includes(cause.code)) {
        await signOut()
        return
      }

      throw cause
    } finally {
      setInitialized(true)
    }
  }, [foundation, signOut])

  const signIn = useCallback(
    async (email: string, password: string) => {
      setInitialized(false)
      await authService.signIn(email, password)
      await refreshMe()
    },
    [authService, refreshMe],
  )

  const loadWorkstations = useCallback(async () => {
    setWorkstations(await foundation.listWorkstations())
  }, [foundation])

  const selectWorkstation = useCallback(
    async (id: string) => {
      setWorkstationId(id)
      await refreshMe()
    },
    [refreshMe],
  )

  useEffect(() => {
    let active = true

    void authService.getAccessToken().then(async (token) => {
      if (!active || !token) return
      await refreshMe()
    })

    return () => {
      active = false
    }
  }, [authService, refreshMe])

  const value = useMemo<AuthContextValue>(
    () => ({
      initialized,
      currentUser,
      workstations,
      signIn,
      signOut,
      getAccessToken: authService.getAccessToken,
      refreshMe,
      loadWorkstations,
      selectWorkstation,
    }),
    [
      authService.getAccessToken,
      currentUser,
      initialized,
      loadWorkstations,
      refreshMe,
      selectWorkstation,
      signIn,
      signOut,
      workstations,
    ],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth() {
  const service = useContext(AuthContext)
  if (!service) {
    throw new Error('AuthProvider is required')
  }
  return service
}

export const useAuthService = useAuth
