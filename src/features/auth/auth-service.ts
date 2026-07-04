import type { SupabaseClient } from '@supabase/supabase-js'
import { ApiError } from '../../lib/api/client'
import { isSupabaseAuthConfigured, runtimeConfig, type RuntimeConfig } from '../../lib/config/runtime'

export interface AuthService {
  signIn(email: string, password: string): Promise<void>
  signOut(): Promise<void>
  getAccessToken(): Promise<string | null>
}

export function createAuthService(client: SupabaseClient, config: RuntimeConfig = runtimeConfig): AuthService {
  return {
    async signIn(email, password) {
      if (!isSupabaseAuthConfigured(config)) {
        throw new ApiError(
          0,
          'CONFIGURATION_ERROR',
          'Thiếu cấu hình Supabase anon key. Vui lòng tạo .env.local từ .env.example và nhập VITE_SUPABASE_ANON_KEY.',
          'local',
        )
      }
      const { error } = await client.auth.signInWithPassword({ email, password })
      if (error) throw error
    },
    async signOut() {
      const { error } = await client.auth.signOut()
      if (error) throw error
    },
    async getAccessToken() {
      const { data } = await client.auth.getSession()
      return data.session?.access_token ?? null
    },
  }
}
