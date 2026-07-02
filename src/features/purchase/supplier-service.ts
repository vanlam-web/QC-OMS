import { createApiClient } from '../../lib/api/client'
import { runtimeConfig } from '../../lib/config/runtime'
import type { Supplier, SupplierCustomerListResponse, SupplierListResponse, SupplierStatus } from './types'

export interface SupplierApiRequester {
  request<T>(path: string, init?: RequestInit): Promise<T>
}

export interface SupplierInput {
  code: string
  name: string
  phone: string
  email: string
  address: string
  tax_code: string
  linked_customer_id: string | null
  notes: string
  status: SupplierStatus
}

export function createSupplierService(api: SupplierApiRequester) {
  return {
    listSuppliers: (input: { search?: string; status?: SupplierStatus | 'all' } = {}) => {
      const params = new URLSearchParams()
      if (input.search) params.set('q', input.search)
      if (input.status) params.set('status', input.status)
      const query = params.toString()
      return api.request<SupplierListResponse>(`/api/v1/suppliers${query ? `?${query}` : ''}`)
    },
    getSupplier: (id: string) => api.request<Supplier>(`/api/v1/suppliers/${id}`),
    createSupplier: (input: SupplierInput) =>
      api.request<Supplier>('/api/v1/suppliers', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    updateSupplier: (id: string, input: SupplierInput) =>
      api.request<Supplier>(`/api/v1/suppliers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      }),
    listCustomers: (input: { search?: string } = {}) => {
      const params = new URLSearchParams()
      if (input.search) params.set('search', input.search)
      const query = params.toString()
      return api.request<SupplierCustomerListResponse>(`/api/v1/customers${query ? `?${query}` : ''}`)
    },
  }
}

export type SupplierService = ReturnType<typeof createSupplierService>

export function createBrowserSupplierService(getAccessToken: () => Promise<string | null>) {
  return createSupplierService(
    createApiClient({
      baseUrl: runtimeConfig.apiBaseUrl,
      getAccessToken,
    }),
  )
}
