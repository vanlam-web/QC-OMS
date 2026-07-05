import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FinancePage } from './FinancePage'
import type { FinanceService } from './finance-service'
import type {
  CashbookBalance,
  CashbookEntry,
  CashbookVoucher,
  CustomerDebtDetail,
  CustomerDebtSummary,
  FinanceAccount,
} from './types'

const accounts: FinanceAccount[] = [
  { id: 'cash-1', code: 'CASH', name: 'Quỹ tiền mặt', account_type: 'cash', is_default_cash: true, is_active: true },
  { id: 'bank-1', code: 'MB01', name: 'MB Bank', account_type: 'bank', is_default_cash: false, is_active: true },
]

const balances: CashbookBalance[] = [
  { finance_account_id: 'cash-1', code: 'CASH', name: 'Quỹ tiền mặt', account_type: 'cash', balance: 200000 },
  { finance_account_id: 'bank-1', code: 'MB01', name: 'MB Bank', account_type: 'bank', balance: 300000 },
]

const debt: CustomerDebtSummary = {
  customer_id: 'customer-1',
  customer_code: 'KH001',
  customer_name: 'Anh Nam',
  total_debt: 500000,
  oldest_order_code: 'HD0001',
  open_invoice_count: 2,
}

const debtDetail: CustomerDebtDetail = {
  customer_id: 'customer-1',
  total_debt: 500000,
  invoices: [
    {
      order_id: 'order-1',
      order_code: 'HD0001',
      created_at: '2026-07-05T02:00:00Z',
      total_amount: 700000,
      paid_amount: 200000,
      debt_amount: 500000,
      remaining_debt: 500000,
    },
  ],
}

const entry: CashbookEntry = {
  id: 'entry-1',
  code: 'PT0001',
  status: 'posted',
  direction: 'in',
  amount_delta: 500000,
  finance_account: { id: 'cash-1', code: 'CASH', name: 'Quỹ tiền mặt', account_type: 'cash' },
  is_business_accounted: true,
  source_type: 'payment_receipt_method',
  created_at: '2026-07-05T02:05:00Z',
  note: 'Thu nợ',
}

const voucher: CashbookVoucher = {
  id: 'voucher-1',
  code: 'PT0001',
  source_type: 'payment_receipt',
  status: 'posted',
  amount: 500000,
}

function makeService(overrides: Partial<FinanceService> = {}): FinanceService {
  return {
    listAccounts: vi.fn(async () => ({ items: accounts })),
    listCustomerDebts: vi.fn(async () => ({ items: [debt], page: 1, page_size: 15, total: 1 })),
    getCustomerDebt: vi.fn(async () => debtDetail),
    collectCustomerDebt: vi.fn(async () => ({ payment_receipt_id: 'receipt-1', allocated_amount: 500000 })),
    listCashbookBalances: vi.fn(async () => ({ items: balances })),
    listCashbookEntries: vi.fn(async () => ({
      summary: { opening_balance: 100000, total_in: 500000, total_out: 100000, ending_balance: 500000 },
      items: [entry],
      page: 1,
      page_size: 15,
      total: 1,
    })),
    listCashbookVouchers: vi.fn(async () => ({ items: [voucher], total: 1 })),
    ...overrides,
  }
}

describe('FinancePage', () => {
  it('shows accounts, debts, cashbook, and vouchers', async () => {
    render(<FinancePage service={makeService()} />)

    expect(await screen.findByText('CASH')).toBeInTheDocument()
    expect(screen.getByText('Anh Nam')).toBeInTheDocument()
    expect(screen.getAllByText('PT0001').length).toBeGreaterThan(0)
    expect(screen.getByRole('table', { name: 'Phiếu thu chi' })).toBeInTheDocument()
  })

  it('filters debts and cashbook entries', async () => {
    const service = makeService()
    render(<FinancePage service={service} />)

    await userEvent.type(await screen.findByLabelText('Tìm công nợ'), 'nam')
    await userEvent.click(screen.getByRole('button', { name: 'Lọc nợ' }))

    expect(service.listCustomerDebts).toHaveBeenLastCalledWith({ search: 'nam', page: 1, page_size: 15 })

    await userEvent.type(screen.getByLabelText('Tìm sổ quỹ'), 'PT0001')
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Hướng thu chi' }), 'in')
    await userEvent.click(screen.getByRole('button', { name: 'Lọc sổ' }))

    expect(service.listCashbookEntries).toHaveBeenLastCalledWith({
      search: 'PT0001',
      direction: 'in',
      page: 1,
      page_size: 15,
    })
  })

  it('opens debt detail and submits collection payload', async () => {
    const service = makeService()
    render(<FinancePage service={service} />)

    await userEvent.click(await screen.findByRole('button', { name: 'Thu nợ Anh Nam' }))

    const form = await screen.findByRole('form', { name: 'Thu nợ khách hàng' })
    expect(within(screen.getByRole('region', { name: 'Hóa đơn còn nợ' })).getByText('HD0001')).toBeInTheDocument()

    await userEvent.clear(within(form).getByLabelText('Tiền mặt'))
    await userEvent.type(within(form).getByLabelText('Tiền mặt'), '200000')
    await userEvent.clear(within(form).getByLabelText('Chuyển khoản'))
    await userEvent.type(within(form).getByLabelText('Chuyển khoản'), '300000')
    await userEvent.selectOptions(within(form).getByLabelText('Tài khoản ngân hàng'), 'bank-1')
    await userEvent.type(within(form).getByLabelText('Mã giao dịch'), 'MB-123')
    await userEvent.type(within(form).getByLabelText('Ghi chú'), 'Khách trả nợ')
    await userEvent.click(within(form).getByRole('button', { name: 'Lưu thu nợ' }))

    expect(service.collectCustomerDebt).toHaveBeenCalledWith({
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
    await waitFor(() => expect(service.listCustomerDebts).toHaveBeenCalledTimes(2))
  })
})
