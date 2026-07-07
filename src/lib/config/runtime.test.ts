import { runtimeConfig } from './runtime'

it('keeps browser runtime importable when CI does not provide frontend env', () => {
  expect(runtimeConfig.supabaseUrl).toBe('https://yentlbgbtmumilbzttge.supabase.co')
  expect(runtimeConfig.apiBaseUrl).toBe('https://yentlbgbtmumilbzttge.supabase.co/functions/v1')
  expect(runtimeConfig.supabaseAnonKey).not.toBe('')
  expect(runtimeConfig.sentryDsn).toBeUndefined()
  expect(runtimeConfig.sentryTracesSampleRate).toBe(0)
})
