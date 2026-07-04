import { createApiClient } from '../../lib/api/client'
import { runtimeConfig } from '../../lib/config/runtime'
import type {
  Supplier,
  SupplierCustomerListResponse,
  SupplierFinanceAccountListResponse,
  SupplierListResponse,
  SupplierPayableReceiptListResponse,
  SupplierPaymentInput,
  SupplierPaymentResult,
  SupplierStatus,
} from './types'

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
    listSuppliers: (input: { search?: string; status?: SupplierStatus | 'all'; page?: number; page_size?: number } = {}) => {
      const params = new URLSearchParams()
      if (input.search) params.set('q', input.search)
      if (input.status) params.set('status', input.status)
      if (input.page) params.set('page', String(input.page))
      if (input.page_size) params.set('page_size', String(input.page_size))
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
    listPayableReceipts: (supplierId: string) =>
      api.request<SupplierPayableReceiptListResponse>(`/api/v1/suppliers/${supplierId}/payable-receipts`),
    listFinanceAccounts: () => api.request<SupplierFinanceAccountListResponse>('/api/v1/finance/accounts?is_active=true'),
    paySupplier: (supplierId: string, input: SupplierPaymentInput) =>
      api.request<SupplierPaymentResult>(`/api/v1/suppliers/${supplierId}/payments`, {
        method: 'POST',
        body: JSON.stringify(input),
      }),
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
