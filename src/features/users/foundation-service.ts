import type { CurrentUserData } from '../../lib/api/types'
import { createApiClient } from '../../lib/api/client'
import { runtimeConfig } from '../../lib/config/runtime'
import type { Permission, PermissionCode, UserListResponse } from './types'

export interface ApiRequester {
  request<T>(path: string, init?: RequestInit): Promise<T>
}

export function createFoundationService(api: ApiRequester) {
  return {
    getMe: () => api.request<CurrentUserData>('/api/v1/me'),
    listUsers: (input: { search?: string; status?: 'active' | 'inactive' } = {}) => {
      const params = new URLSearchParams()
      if (input.search) params.set('search', input.search)
      if (input.status) params.set('status', input.status)
      const query = params.toString()
      return api.request<UserListResponse>(`/api/v1/users${query ? `?${query}` : ''}`)
    },
    createUser: (input: {
      email: string
      username?: string | null
      phone?: string | null
      password: string
      display_name: string
      permissions: PermissionCode[]
    }) =>
      api.request<UserListResponse['items'][number]>('/api/v1/users', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    updateUser: (id: string, input: { display_name?: string; status?: 'active' | 'inactive' }) =>
      api.request<UserListResponse['items'][number]>(`/api/v1/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      }),
    replaceUserPermissions: (id: string, permissions: PermissionCode[]) =>
      api.request<UserListResponse['items'][number]>(`/api/v1/users/${id}/permissions`, {
        method: 'PUT',
        body: JSON.stringify({ permissions }),
      }),
    listPermissions: () => api.request<Permission[]>('/api/v1/permissions'),
  }
}

export type FoundationService = ReturnType<typeof createFoundationService>

export function createBrowserFoundationService(getAccessToken: () => Promise<string | null>) {
  return createFoundationService(
    createApiClient({
      baseUrl: runtimeConfig.apiBaseUrl,
      getAccessToken,
    }),
  )
}
