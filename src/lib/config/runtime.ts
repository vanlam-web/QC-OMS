const cloudSupabaseUrl = 'https://yentlbgbtmumilbzttge.supabase.co'
const missingSupabaseAnonKey = 'missing-supabase-anon-key'

export const runtimeConfig = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? cloudSupabaseUrl,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? missingSupabaseAnonKey,
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL ?? `${cloudSupabaseUrl}/functions/v1`,
  appEnv: import.meta.env.VITE_APP_ENV ?? 'cloud-dev',
}
