const cloudSupabaseUrl = 'https://yentlbgbtmumilbzttge.supabase.co'
export const missingSupabaseAnonKey = 'missing-supabase-anon-key'

export const runtimeConfig = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? cloudSupabaseUrl,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? missingSupabaseAnonKey,
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL ?? `${cloudSupabaseUrl}/functions/v1`,
  appEnv: import.meta.env.VITE_APP_ENV ?? 'cloud-dev',
  sentryDsn: emptyToUndefined(import.meta.env.VITE_SENTRY_DSN),
  sentryTracesSampleRate: parseSampleRate(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE),
}

export type RuntimeConfig = typeof runtimeConfig

export function isSupabaseAuthConfigured(config = runtimeConfig) {
  return (
    config.supabaseUrl.trim().length > 0 &&
    config.supabaseAnonKey.trim().length > 0 &&
    config.supabaseAnonKey !== missingSupabaseAnonKey
  )
}

function emptyToUndefined(value: string | undefined) {
  if (value === undefined) return undefined
  const trimmed = value.trim()
  return trimmed.length === 0 ? undefined : trimmed
}

function parseSampleRate(value: string | undefined) {
  if (value === undefined || value.trim().length === 0) return 0
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return 0
  return Math.min(Math.max(parsed, 0), 1)
}
