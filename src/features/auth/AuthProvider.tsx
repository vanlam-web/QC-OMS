import {
  useCallback,
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
  createFoundationService,
  type ApiRequester,
} from '../users/foundation-service'
import { AccessSync } from './AccessSync'
import type { AccessConnectionState, RealtimeClient } from '../../lib/realtime/access-channel'
import { AuthContext, type AuthContextValue } from './auth-context'

const bootstrapTimeoutMs = 8000

export function AuthProvider({
  children,
  service,
  api,
  realtimeClient,
}: {
  children: ReactNode
  service?: AuthService
  api?: ApiRequester
  realtimeClient?: RealtimeClient
}) {
  const authService = useMemo(() => service ?? createAuthService(supabase), [service])
  const foundation = useMemo(() => {
    if (api) return createFoundationService(api)

    const client = createApiClient({
      baseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
      getAccessToken: authService.getAccessToken,
    })
    return createFoundationService(client)
  }, [api, authService])
  const [initialized, setInitialized] = useState(false)
  const [accessConnection, setAccessConnection] = useState<AccessConnectionState>('disconnected')
  const [currentUser, setCurrentUser] = useState<CurrentUserData | null>(null)

  const signOut = useCallback(async () => {
    await authService.signOut()
    setAccessConnection('disconnected')
    setCurrentUser(null)
  }, [authService])

  const refreshMe = useCallback(async () => {
    try {
      const me = await foundation.getMe()
      setCurrentUser(me)
    } catch (cause) {
      if (
        cause instanceof ApiError &&
        ['AUTH_REQUIRED', 'ACCOUNT_INACTIVE', 'PERMISSION_DENIED'].includes(cause.code)
      ) {
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
      try {
        await authService.signIn(email, password)
        await refreshMe()
      } catch (cause) {
        setInitialized(true)
        throw cause
      }
    },
    [authService, refreshMe],
  )

  useEffect(() => {
    let active = true

    void withTimeout(authService.getAccessToken(), bootstrapTimeoutMs)
      .then(async (token) => {
        if (!active) return
        if (!token) {
          setInitialized(true)
          return
        }
        await withTimeout(refreshMe(), bootstrapTimeoutMs)
      })
      .catch(() => {
        if (!active) return
        setInitialized(true)
      })

    return () => {
      active = false
    }
  }, [authService, refreshMe])

  const value = useMemo<AuthContextValue>(
    () => ({
      initialized,
      accessConnection,
      currentUser,
      signIn,
      signOut,
      getAccessToken: authService.getAccessToken,
      refreshMe,
    }),
    [
      accessConnection,
      authService.getAccessToken,
      currentUser,
      initialized,
      refreshMe,
      signIn,
      signOut,
    ],
  )

  const realtime = realtimeClient ?? supabase

  return (
    <AuthContext value={value}>
      <AccessSync
        client={realtime}
        userId={currentUser?.user.id ?? null}
        refreshMe={refreshMe}
        onConnectionChange={setAccessConnection}
      />
      {children}
    </AuthContext>
  )
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error('Timed out.')), timeoutMs)
    promise.then(
      (value) => {
        window.clearTimeout(timeout)
        resolve(value)
      },
      (cause) => {
        window.clearTimeout(timeout)
        reject(cause)
      },
    )
  })
}
