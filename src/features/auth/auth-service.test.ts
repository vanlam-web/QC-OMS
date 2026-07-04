import { createAuthService } from './auth-service'
import type { SupabaseClient } from '@supabase/supabase-js'

it('fails fast with a clear message when Supabase anon key is missing', async () => {
  const signInWithPassword = vi.fn()
  const client = {
    auth: {
      signInWithPassword,
      signOut: vi.fn(),
      getSession: vi.fn(),
    },
  } as unknown as SupabaseClient
  const service = createAuthService(client, {
    supabaseUrl: 'https://example.supabase.co',
    supabaseAnonKey: 'missing-supabase-anon-key',
    apiBaseUrl: 'https://example.supabase.co/functions/v1',
    appEnv: 'test',
  })

  await expect(service.signIn('admin@qc.local', '123456')).rejects.toThrow(
    'Thiếu cấu hình Supabase anon key.',
  )
  expect(signInWithPassword).not.toHaveBeenCalled()
})
