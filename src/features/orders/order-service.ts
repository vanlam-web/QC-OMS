import { createApiClient } from '../../lib/api/client'
import type { CheckoutInput, CheckoutResult, CustomerDebtDetail, FinanceAccount, RecentPriceList } from './types'

export type { CheckoutCartLine, CheckoutResult, FinanceAccount, RecentPriceList } from './types'

export interface OrderApiRequester {
  request<T>(path: string, init?: RequestInit): Promise<T>
}

export function createOrderService(api: OrderApiRequester) {
  return {
    validateCart: (input: CheckoutInput) =>
      api.request<{ valid: boolean }>('/api/v1/pos/cart/validate', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    checkout: (input: CheckoutInput) =>
      api.request<CheckoutResult>('/api/v1/orders/checkout', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    listFinanceAccounts: () => api.request<{ items: FinanceAccount[] }>('/api/v1/finance/accounts'),
    getCustomerDebt: (customerId: string) =>
      api.request<CustomerDebtDetail>(`/api/v1/finance/customers/${customerId}/debt`),
    listRecentCustomerProductPrices: (customerId: string, productId: string) =>
      api.request<RecentPriceList>(
        `/api/v1/customers/${customerId}/products/${productId}/recent-prices`,
      ),
  }
}

export type OrderService = ReturnType<typeof createOrderService>

export function createBrowserOrderService(getAccessToken: () => Promise<string | null>) {
  return createOrderService(
    createApiClient({
      baseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
      getAccessToken,
    }),
  )
}
