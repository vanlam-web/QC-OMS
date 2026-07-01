import { createApiClient } from '../../lib/api/client'
import type { SalesDocumentDetail, SalesDocumentListResponse } from './types'

export type { SalesDocumentDetail, SalesDocumentListItem, SalesDocumentListResponse } from './types'

export interface SalesDocumentApiRequester {
  request<T>(path: string, init?: RequestInit): Promise<T>
}

export function createSalesDocumentService(api: SalesDocumentApiRequester) {
  return {
    listSalesDocuments: (input: { search?: string } = {}) => {
      const params = new URLSearchParams()
      if (input.search) params.set('search', input.search)
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
      baseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
      getAccessToken,
    }),
  )
}
