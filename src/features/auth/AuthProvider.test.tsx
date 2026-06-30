import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider } from './AuthProvider'
import { useAuth } from './auth-context'
import type { AuthService } from './auth-service'
import type { CurrentUserData } from '../../lib/api/types'
import type { RealtimeChannel } from '../../lib/realtime/access-channel'

const currentUser: CurrentUserData = {
  user: { id: 'u-1', email: 'cashier@example.test', display_name: 'Cashier' },
  organization: { id: 'o-1', code: 'VAN-LAM', name: 'Xưởng Văn Lâm' },
  workstation: null,
  permissions: ['perm.create_order'],
}

function makeAuthService(token: string | null): AuthService {
  return {
    signIn: vi.fn(),
    signOut: vi.fn(),
    getAccessToken: vi.fn().mockResolvedValue(token),
  }
}

function StatusProbe() {
  const auth = useAuth()
  return (
    <div>
      <span>{auth.initialized ? 'ready' : 'booting'}</span>
      <span>{auth.currentUser?.user.id ?? 'anonymous'}</span>
      <span>{auth.accessConnection}</span>
    </div>
  )
}

it('marks bootstrap ready when no stored session exists', async () => {
  render(
    <AuthProvider
      service={makeAuthService(null)}
      api={{ request: vi.fn() }}
      realtimeClient={{ channel: vi.fn(), removeChannel: vi.fn() }}
    >
      <StatusProbe />
    </AuthProvider>,
  )

  expect(await screen.findByText('ready')).toBeInTheDocument()
  expect(screen.getByText('anonymous')).toBeInTheDocument()
})

it('keeps protected routes pending while a stored session is being restored', () => {
  render(
    <AuthProvider
      service={{
        signIn: vi.fn(),
        signOut: vi.fn(),
        getAccessToken: vi.fn(() => new Promise<string | null>(() => undefined)),
      }}
      api={{ request: vi.fn() }}
      realtimeClient={{ channel: vi.fn(), removeChannel: vi.fn() }}
    >
      <StatusProbe />
    </AuthProvider>,
  )

  expect(screen.getByText('booting')).toBeInTheDocument()
  expect(screen.getByText('anonymous')).toBeInTheDocument()
})

it('marks bootstrap ready when restoring the session fails', async () => {
  render(
    <AuthProvider
      service={{
        signIn: vi.fn(),
        signOut: vi.fn(),
        getAccessToken: vi.fn().mockRejectedValue(new Error('offline')),
      }}
      api={{ request: vi.fn() }}
      realtimeClient={{ channel: vi.fn(), removeChannel: vi.fn() }}
    >
      <StatusProbe />
    </AuthProvider>,
  )

  expect(await screen.findByText('ready')).toBeInTheDocument()
  expect(screen.getByText('anonymous')).toBeInTheDocument()
})

it('returns to ready state when sign in fails', async () => {
  function SignInProbe() {
    const auth = useAuth()
    return (
      <button type="button" onClick={() => void auth.signIn('admin@qc.local', 'bad').catch(() => undefined)}>
        {auth.initialized ? 'ready' : 'booting'}
      </button>
    )
  }

  render(
    <AuthProvider
      service={{
        signIn: vi.fn(async () => {
          throw new Error('bad credentials')
        }),
        signOut: vi.fn(),
        getAccessToken: vi.fn().mockResolvedValue(null),
      }}
      api={{ request: vi.fn() }}
      realtimeClient={{ channel: vi.fn(), removeChannel: vi.fn() }}
    >
      <SignInProbe />
    </AuthProvider>,
  )

  await screen.findByRole('button', { name: 'ready' })
  await userEvent.click(screen.getByRole('button'))
  expect(await screen.findByRole('button', { name: 'ready' })).toBeInTheDocument()
})

it('restores /me and refreshes when the access channel changes', async () => {
  let signal: () => void = () => undefined
  const channel: RealtimeChannel = {
    on: (_type, _filter, callback) => {
      signal = callback
      return channel
    },
    subscribe: (callback) => {
      callback('SUBSCRIBED')
      return channel
    },
    unsubscribe: vi.fn(),
  }
  const api = { request: vi.fn().mockResolvedValue(currentUser) }

  render(
    <AuthProvider
      service={makeAuthService('token')}
      api={api}
      realtimeClient={{ channel: vi.fn(() => channel), removeChannel: vi.fn() }}
    >
      <StatusProbe />
    </AuthProvider>,
  )

  expect(await screen.findByText('u-1')).toBeInTheDocument()
  expect(await screen.findByText('connected')).toBeInTheDocument()

  signal()
  await waitFor(() => expect(api.request).toHaveBeenCalledTimes(2))
})
