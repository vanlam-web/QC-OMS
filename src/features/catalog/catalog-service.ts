import { createApiClient } from '../../lib/api/client'
import { runtimeConfig } from '../../lib/config/runtime'
import type {
  Customer,
  CustomerListResponse,
  Product,
  ProductListResponse,
  ProductStatus,
  ResolvePricesResponse,
  SellMethod,
} from './types'

export interface CatalogApiRequester {
  request<T>(path: string, init?: RequestInit): Promise<T>
}

export function createCatalogService(api: CatalogApiRequester) {
  return {
    listProducts: (input: { search?: string; status?: ProductStatus | 'all' } = {}) => {
      const params = new URLSearchParams()
      if (input.search) params.set('search', input.search)
      if (input.status) params.set('status', input.status)
      const query = params.toString()
      return api.request<ProductListResponse>(`/api/v1/products${query ? `?${query}` : ''}`)
    },
    createProduct: (input: {
      code: string
      name: string
      status: ProductStatus
      unit_name: string
      sell_method: SellMethod
    }) =>
      api.request<Product>('/api/v1/products', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    updateProduct: (
      id: string,
      input: Partial<{
        code: string
        name: string
        status: ProductStatus
        unit_name: string
        sell_method: SellMethod
      }>,
    ) =>
      api.request<Product>(`/api/v1/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      }),
    listCustomers: (input: { search?: string } = {}) => {
      const params = new URLSearchParams()
      if (input.search) params.set('search', input.search)
      const query = params.toString()
      return api.request<CustomerListResponse>(`/api/v1/customers${query ? `?${query}` : ''}`)
    },
    createCustomer: (input: {
      code?: string
      name: string
      phone?: string
      customer_group_id?: string | null
    }) =>
      api.request<Customer>('/api/v1/customers', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    resolvePrices: (productIds: string[], customerId?: string) =>
      api.request<ResolvePricesResponse>('/api/v1/pricing/resolve', {
        method: 'POST',
        body: JSON.stringify({ product_ids: productIds, customer_id: customerId }),
      }),
  }
}

export type CatalogService = ReturnType<typeof createCatalogService>

export function createBrowserCatalogService(getAccessToken: () => Promise<string | null>) {
  return createCatalogService(
    createApiClient({
      baseUrl: runtimeConfig.apiBaseUrl,
      getAccessToken,
    }),
  )
}
