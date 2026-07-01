import { createApiClient } from '../../lib/api/client'
import { runtimeConfig } from '../../lib/config/runtime'
import type { SalesDocumentDetail, SalesDocumentListResponse } from './types'

export type { SalesDocumentDetail, SalesDocumentListItem, SalesDocumentListResponse } from './types'

export interface SalesDocumentApiRequester {
  request<T>(path: string, init?: RequestInit): Promise<T>
}

export function createSalesDocumentService(api: SalesDocumentApiRequester) {
  return {
    listSalesDocuments: (input: {
      search?: string
      type?: 'quote' | 'invoice'
      status?: 'active' | 'converted' | 'completed' | 'cancelled'
    } = {}) => {
      const params = new URLSearchParams()
      if (input.search) params.set('search', input.search)
      if (input.type) params.set('type', input.type)
      if (input.status) params.set('status', input.status)
      const query = params.toString()
      return api.request<SalesDocumentListResponse>(`/api/v1/sales-documents${query ? `?${query}` : ''}`)
    },
    getSalesDocument: (id: string) => api.request<SalesDocumentDetail>(`/api/v1/sales-documents/${id}`),
  }
}

export type SalesDocumentService = ReturnType<typeof createSalesDocumentService>

export function createBrowserSalesDocumentService(getAccessToken: () => Promise<string | null>) {
  return createSalesDocumentService(
    createApiClient({
      baseUrl: runtimeConfig.apiBaseUrl,
      getAccessToken,
    }),
  )
}
