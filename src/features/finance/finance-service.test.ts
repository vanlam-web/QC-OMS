import { describe, expect, it } from 'vitest'
import { createFinanceService } from './finance-service'
import type { FinanceApiRequester } from './finance-service'

describe('finance-service', () => {
  it('builds debt and cashbook list filters', async () => {
    const calls: Array<[string, RequestInit | undefined]> = []
    const request: FinanceApiRequester['request'] = async <T>(path: string, init?: RequestInit) => {
      calls.push([path, init])
      return { items: [], page: 2, page_size: 20, total: 0 } as T
    }
    const service = createFinanceService({ request })

    await service.listCustomerDebts({ search: 'an', page: 2, page_size: 20 })
    await service.listCashbookEntries({
      search: 'PT0001',
      finance_account_id: 'bank-1',
      direction: 'in',
      page: 3,
      page_size: 15,
    })

    expect(calls).toEqual([
      ['/api/v1/finance/customer-debts?search=an&page=2&page_size=20', undefined],
      ['/api/v1/finance/cashbook?search=PT0001&finance_account_id=bank-1&direction=in&page=3&page_size=15', undefined],
    ])
  })

  it('posts debt collection payload', async () => {
    const calls: Array<[string, RequestInit | undefined]> = []
    const request: FinanceApiRequester['request'] = async <T>(path: string, init?: RequestInit) => {
      calls.push([path, init])
      return { payment_receipt_id: 'receipt-1', allocated_amount: 500000 } as T
    }
    const service = createFinanceService({ request })

    await service.collectCustomerDebt({
      customer_id: 'customer-1',
      amount: 500000,
      payment_method: {
        cash_amount: 200000,
        bank_amount: 300000,
        bank_account_id: 'bank-1',
        bank_transaction_ref: 'MB-123',
      },
      note: 'Khách trả nợ',
    })

    expect(calls).toEqual([
      [
        '/api/v1/finance/debt-collections',
        {
          method: 'POST',
          body: JSON.stringify({
            customer_id: 'customer-1',
            amount: 500000,
            payment_method: {
              cash_amount: 200000,
              bank_amount: 300000,
              bank_account_id: 'bank-1',
              bank_transaction_ref: 'MB-123',
            },
            note: 'Khách trả nợ',
          }),
        },
      ],
    ])
  })
})
