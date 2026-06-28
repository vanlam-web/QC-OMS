import type { SupabaseClient } from '@supabase/supabase-js'

export interface AuthService {
  signIn(email: string, password: string): Promise<void>
  signOut(): Promise<void>
  getAccessToken(): Promise<string | null>
}

export function createAuthService(client: SupabaseClient): AuthService {
  return {
    async signIn(email, password) {
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
