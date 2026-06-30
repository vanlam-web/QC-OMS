const sharedServerHost = import.meta.env.VITE_SHARED_SERVER_HOST ?? '192.168.1.104'
const sharedDevAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

export const runtimeConfig = {
  sharedServerHost,
  supabaseUrl:
    import.meta.env.VITE_SUPABASE_URL ?? `http://${sharedServerHost}:54321`,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? sharedDevAnonKey,
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL ?? `http://${sharedServerHost}:54321/functions/v1/api`,
  appEnv: import.meta.env.VITE_APP_ENV ?? 'shared-dev',
}
