import { createApiClient } from '../../lib/api/client'
import { runtimeConfig } from '../../lib/config/runtime'
import type {
  CashbookDirection,
  CashbookEntryDetail,
  CashbookStatus,
  CashbookListResponse,
  CashbookVoucherListResponse,
  CustomerDebtDetail,
  CustomerDebtListResponse,
  DebtCollectionInput,
  DebtCollectionResult,
  FinanceAccountListResponse,
  CashbookBalanceListResponse,
} from './types'

export interface FinanceApiRequester {
  request<T>(path: string, init?: RequestInit): Promise<T>
}

export function createFinanceService(api: FinanceApiRequester) {
  return {
    listAccounts: (input: { is_active?: boolean } = {}) => {
      const params = new URLSearchParams()
      if (input.is_active !== undefined) params.set('is_active', String(input.is_active))
      const query = params.toString()
      return api.request<FinanceAccountListResponse>(`/api/v1/finance/accounts${query ? `?${query}` : ''}`)
    },
    listCustomerDebts: (input: { search?: string; page?: number; page_size?: number } = {}) => {
      const params = new URLSearchParams()
      if (input.search) params.set('search', input.search)
      if (input.page) params.set('page', String(input.page))
      if (input.page_size) params.set('page_size', String(input.page_size))
      const query = params.toString()
      return api.request<CustomerDebtListResponse>(`/api/v1/finance/customer-debts${query ? `?${query}` : ''}`)
    },
    getCustomerDebt: (customerId: string) =>
      api.request<CustomerDebtDetail>(`/api/v1/finance/customers/${customerId}/debt`),
    collectCustomerDebt: (input: DebtCollectionInput) =>
      api.request<DebtCollectionResult>('/api/v1/finance/debt-collections', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    listCashbookBalances: () => api.request<CashbookBalanceListResponse>('/api/v1/finance/cashbook/balances'),
    listCashbookEntries: (input: {
      search?: string
      finance_account_id?: string
      direction?: CashbookDirection | 'all'
      status?: CashbookStatus | 'all'
      is_business_accounted?: boolean
      from?: string
      to?: string
      page?: number
      page_size?: number
    } = {}) => {
      const params = new URLSearchParams()
      if (input.search) params.set('search', input.search)
      if (input.finance_account_id) params.set('finance_account_id', input.finance_account_id)
      if (input.direction && input.direction !== 'all') params.set('direction', input.direction)
      if (input.status && input.status !== 'all') params.set('status', input.status)
      if (input.is_business_accounted !== undefined) params.set('is_business_accounted', String(input.is_business_accounted))
      if (input.from) params.set('from', input.from)
      if (input.to) params.set('to', input.to)
      if (input.page) params.set('page', String(input.page))
      if (input.page_size) params.set('page_size', String(input.page_size))
      const query = params.toString()
      return api.request<CashbookListResponse>(`/api/v1/finance/cashbook${query ? `?${query}` : ''}`)
    },
    getCashbookEntry: (entryId: string) => api.request<CashbookEntryDetail>(`/api/v1/finance/cashbook/${entryId}`),
    listCashbookVouchers: () => api.request<CashbookVoucherListResponse>('/api/v1/finance/cashbook/vouchers'),
  }
}

export type FinanceService = ReturnType<typeof createFinanceService>

export function createBrowserFinanceService(getAccessToken: () => Promise<string | null>) {
  return createFinanceService(
    createApiClient({
      baseUrl: runtimeConfig.apiBaseUrl,
      getAccessToken,
    }),
  )
}
