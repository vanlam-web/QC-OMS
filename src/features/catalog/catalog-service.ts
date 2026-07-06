import { createApiClient } from '../../lib/api/client'
import { runtimeConfig } from '../../lib/config/runtime'
import type {
  Customer,
  CustomerListResponse,
  ProductBom,
  PriceFormulaApplyResult,
  PriceFormulaInput,
  PriceFormulaPreview,
  PriceListResponse,
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
    listProducts: (input: {
      search?: string
      status?: ProductStatus | 'all'
      sell_method?: SellMethod
      inventory_shape?: Product['inventory_shape']
      page?: number
      page_size?: number
    } = {}) => {
      const params = new URLSearchParams()
      if (input.search) params.set('search', input.search)
      if (input.status) params.set('status', input.status)
      if (input.sell_method) params.set('sell_method', input.sell_method)
      if (input.inventory_shape) params.set('inventory_shape', input.inventory_shape)
      if (input.page) params.set('page', String(input.page))
      if (input.page_size) params.set('page_size', String(input.page_size))
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
        latest_purchase_cost: number | null
      }>,
    ) =>
      api.request<Product>(`/api/v1/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      }),
    getProductBom: (productId: string) => api.request<ProductBom | null>(`/api/v1/products/${productId}/bom`),
    saveProductBom: (
      productId: string,
      input: { notes?: string | null; items: Array<{ component_product_id: string; quantity: number; notes?: string | null }> },
    ) =>
      api.request<ProductBom>(`/api/v1/products/${productId}/bom`, {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    listCustomers: (input: { search?: string; page?: number; page_size?: number } = {}) => {
      const params = new URLSearchParams()
      if (input.search) params.set('search', input.search)
      if (input.page) params.set('page', String(input.page))
      if (input.page_size) params.set('page_size', String(input.page_size))
      const query = params.toString()
      return api.request<CustomerListResponse>(`/api/v1/customers${query ? `?${query}` : ''}`)
    },
    createCustomer: (input: {
      code?: string
      name: string
      phone?: string
      tax_code?: string
      address?: string
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
    listPriceLists: () => api.request<PriceListResponse>('/api/v1/price-lists'),
    previewPriceFormula: (input: PriceFormulaInput) =>
      api.request<PriceFormulaPreview>('/api/v1/price-lists/formulas/preview', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    applyPriceFormula: (input: {
      formula: PriceFormulaInput
      selected_items: Array<{ product_id: string; price_list_id: string }>
    }) =>
      api.request<PriceFormulaApplyResult>('/api/v1/price-lists/formulas/apply', {
        method: 'POST',
        body: JSON.stringify(input),
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
