import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FinancePage } from './FinancePage'
import type { FinanceService } from './finance-service'
import type {
  CashbookBalance,
  CashbookEntry,
  CashbookEntryDetail,
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

const cashbookDetail: CashbookEntryDetail = {
  ...entry,
  created_by: { id: 'user-1', name: 'Văn Viết Phương Lâm' },
  counterparty: { type: 'customer', name: 'Anh Nam', phone: '0900000000' },
  payment_method: 'cash',
  source: { type: 'payment_receipt', id: 'receipt-1', code: 'PT0001', order_code: 'HD0001' },
  allocations: [
    {
      order_id: 'order-1',
      order_code: 'HD0001',
      order_total_amount: 700000,
      collected_before: 200000,
      allocated_amount: 500000,
      remaining_after: 0,
    },
  ],
}

const voucher: CashbookVoucher = {
  id: 'voucher-1',
  code: 'PT0001',
  source_type: 'payment_receipt',
  status: 'posted',
  amount: 500000,
}

const manualVoucher: CashbookVoucher = {
  id: 'voucher-2',
  code: 'PC000001',
  source_type: 'manual_voucher',
  status: 'posted',
  amount: 45000,
}

function makeService(overrides: Partial<FinanceService> = {}): FinanceService {
  return {
    listAccounts: vi.fn(async () => ({ items: accounts })),
    listCustomerDebts: vi.fn(async () => ({ items: [debt], page: 1, page_size: 15, total: 1 })),
    getCustomerDebt: vi.fn(async () => debtDetail),
    collectCustomerDebt: vi.fn(async () => ({ payment_receipt_id: 'receipt-1', allocated_amount: 500000 })),
    createCashbookVoucher: vi.fn(async () => ({
      id: 'voucher-2',
      code: 'PC000001',
      source_type: 'manual_voucher' as const,
      status: 'posted' as const,
      amount: 45000,
    })),
    cancelCashbookVoucher: vi.fn(async () => ({
      ...manualVoucher,
      status: 'cancelled' as const,
    })),
    reviseCashbookVoucher: vi.fn(async () => ({
      ...manualVoucher,
      id: 'voucher-3',
      code: 'PC000001.01',
      amount: 50000,
    })),
    listCashbookBalances: vi.fn(async () => ({ items: balances })),
    getCashbookEntry: vi.fn(async () => cashbookDetail),
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
    expect(screen.getByRole('table', { name: 'Phiếu thu/chi' })).toBeInTheDocument()
  })

  it('filters debts and cashbook entries', async () => {
    const service = makeService()
    render(<FinancePage service={service} />)

    await userEvent.type(await screen.findByLabelText('Tìm công nợ'), 'nam')
    await userEvent.click(screen.getByRole('button', { name: 'Lọc công nợ' }))

    expect(service.listCustomerDebts).toHaveBeenLastCalledWith({ search: 'nam', page: 1, page_size: 15 })

    await userEvent.type(screen.getByLabelText('Tìm sổ quỹ'), 'PT0001')
    await userEvent.selectOptions(screen.getByLabelText('Loại chứng từ'), 'in')
    await userEvent.click(screen.getByRole('button', { name: 'Lọc sổ' }))

    expect(service.listCashbookEntries).toHaveBeenLastCalledWith({
      search: 'PT0001',
      search_scope: 'all',
      from: undefined,
      to: undefined,
      finance_account_id: undefined,
      direction: 'in',
      status: 'all',
      is_business_accounted: undefined,
      page: 1,
      page_size: 15,
    })
  })

  it('filters cashbook by account status and business accounting', async () => {
    const service = makeService()
    render(<FinancePage service={service} />)

    await screen.findByRole('table', { name: 'Sổ quỹ' })
    const sidebar = screen.getByRole('complementary', { name: 'Bộ lọc tài chính' })
    expect(within(sidebar).getByRole('heading', { name: 'Sổ quỹ' })).toBeInTheDocument()
    await userEvent.selectOptions(screen.getByLabelText('Quỹ tiền'), 'bank-1')
    await userEvent.selectOptions(screen.getByLabelText('Trạng thái sổ quỹ'), 'posted')
    await userEvent.selectOptions(screen.getByLabelText('Hạch toán KQKD'), 'false')
    await userEvent.click(screen.getByRole('button', { name: 'Lọc sổ' }))

    expect(service.listCashbookEntries).toHaveBeenLastCalledWith({
      search: undefined,
      search_scope: 'all',
      from: undefined,
      to: undefined,
      finance_account_id: 'bank-1',
      direction: 'all',
      status: 'posted',
      is_business_accounted: false,
      page: 1,
      page_size: 15,
    })
  })

  it('filters cashbook by search scope and date range', async () => {
    const service = makeService()
    render(<FinancePage service={service} />)

    await screen.findByRole('table', { name: 'Sổ quỹ' })
    await userEvent.selectOptions(screen.getByLabelText('Tìm theo'), 'code')
    await userEvent.type(screen.getByLabelText('Tìm sổ quỹ'), 'CTM001180')
    await userEvent.type(screen.getByLabelText('Từ ngày'), '2026-07-01')
    await userEvent.type(screen.getByLabelText('Đến ngày'), '2026-07-31')
    await userEvent.click(screen.getByRole('button', { name: 'Lọc sổ' }))

    expect(service.listCashbookEntries).toHaveBeenLastCalledWith(expect.objectContaining({
      search: 'CTM001180',
      search_scope: 'code',
      from: '2026-07-01',
      to: '2026-07-31',
    }))
  })

  it('resets cashbook filters from the shared sidebar action bar', async () => {
    const service = makeService()
    render(<FinancePage service={service} />)

    await screen.findByRole('table', { name: 'Sổ quỹ' })
    await userEvent.type(screen.getByLabelText('Tìm sổ quỹ'), 'PC000001')
    await userEvent.selectOptions(screen.getByLabelText('Quỹ tiền'), 'bank-1')
    await userEvent.click(screen.getByRole('button', { name: 'Đặt lại bộ lọc tài chính' }))

    const sidebar = screen.getByRole('complementary', { name: 'Bộ lọc tài chính' })
    expect(within(sidebar).getByRole('button', { name: 'Đặt lại bộ lọc tài chính' }).closest('.management-filter-actions')).not.toBeNull()
    expect(service.listCashbookEntries).toHaveBeenLastCalledWith({
      search: undefined,
      search_scope: 'all',
      from: undefined,
      to: undefined,
      finance_account_id: undefined,
      direction: 'all',
      status: 'all',
      is_business_accounted: undefined,
      page: 1,
      page_size: 15,
    })
  })

  it('toggles cashbook columns and exports visible rows', async () => {
    const service = makeService()
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:cashbook')
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    render(<FinancePage service={service} />)

    await screen.findByRole('table', { name: 'Sổ quỹ' })
    await userEvent.click(screen.getByRole('button', { name: 'Cột' }))
    await userEvent.click(screen.getByLabelText('Ghi chú'))
    expect(screen.getByRole('columnheader', { name: 'Ghi chú' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Xuất file' }))
    expect(screen.getByRole('status')).toHaveTextContent('Đã tạo file sổ quỹ')
    expect(createObjectURL).toHaveBeenCalled()
    expect(click).toHaveBeenCalled()

    createObjectURL.mockRestore()
    revokeObjectURL.mockRestore()
    click.mockRestore()
  })

  it('creates a manual cashbook expense voucher and reloads cashbook data', async () => {
    const service = makeService()
    render(<FinancePage service={service} />)

    await userEvent.click(await screen.findByRole('button', { name: 'Phiếu chi' }))
    const form = await screen.findByRole('form', { name: 'Tạo phiếu chi' })

    await userEvent.selectOptions(within(form).getByLabelText('Quỹ/tài khoản'), 'cash-1')
    await userEvent.selectOptions(within(form).getByLabelText('Loại phiếu'), 'staff_salary')
    await userEvent.selectOptions(within(form).getByLabelText('Công nợ đối tác'), 'not_affect_partner_debt')
    await userEvent.type(within(form).getByLabelText('Số tiền'), '45000')
    await userEvent.selectOptions(within(form).getByLabelText('Đối tượng'), 'employee')
    await userEvent.type(within(form).getByLabelText('Người nộp/nhận'), 'Nguyen Van A')
    await userEvent.type(within(form).getByLabelText('Số điện thoại'), '0900000000')
    await userEvent.click(within(form).getByLabelText('Không hạch toán KQKD'))
    await userEvent.type(within(form).getByLabelText('Lý do'), 'Mua văn phòng phẩm')
    await userEvent.click(within(form).getByRole('button', { name: 'Lưu phiếu chi' }))

    expect(service.createCashbookVoucher).toHaveBeenCalledWith({
      voucher_direction: 'out',
      voucher_type: 'staff_salary',
      finance_account_id: 'cash-1',
      amount: 45000,
      partner_debt_mode: 'not_affect_partner_debt',
      is_business_accounted: false,
      counterparty_type: 'employee',
      counterparty_name: 'Nguyen Van A',
      counterparty_phone: '0900000000',
      reason: 'Mua văn phòng phẩm',
    })
    await waitFor(() => expect(service.listCashbookEntries).toHaveBeenCalledTimes(2))
    expect(screen.getByRole('status')).toHaveTextContent('Đã tạo phiếu PC000001')
  })

  it('cancels a posted manual cashbook voucher and reloads cashbook data', async () => {
    const service = makeService({
      listCashbookVouchers: vi.fn(async () => ({ items: [voucher, manualVoucher], total: 2 })),
    })
    render(<FinancePage service={service} />)

    await userEvent.click(await screen.findByRole('button', { name: 'Hủy phiếu PC000001' }))

    expect(service.cancelCashbookVoucher).toHaveBeenCalledWith('voucher-2')
    await waitFor(() => expect(service.listCashbookEntries).toHaveBeenCalledTimes(2))
    expect(screen.getByRole('status')).toHaveTextContent('Đã hủy phiếu PC000001')
  })

  it('revises a posted manual cashbook voucher as a new version and reloads cashbook data', async () => {
    const service = makeService({
      listCashbookVouchers: vi.fn(async () => ({ items: [manualVoucher], total: 1 })),
    })
    render(<FinancePage service={service} />)

    await userEvent.click(await screen.findByRole('button', { name: 'Sửa phiếu PC000001' }))
    const form = await screen.findByRole('form', { name: 'Sửa phiếu PC000001' })

    await userEvent.clear(within(form).getByLabelText('Số tiền'))
    await userEvent.type(within(form).getByLabelText('Số tiền'), '50000')
    await userEvent.clear(within(form).getByLabelText('Lý do'))
    await userEvent.type(within(form).getByLabelText('Lý do'), 'Sửa phiếu chi')
    await userEvent.click(within(form).getByRole('button', { name: 'Lưu bản sửa' }))

    expect(service.reviseCashbookVoucher).toHaveBeenCalledWith('voucher-2', {
      voucher_direction: 'out',
      voucher_type: 'operating_expense',
      finance_account_id: 'cash-1',
      amount: 50000,
      partner_debt_mode: 'no_partner_debt',
      is_business_accounted: true,
      counterparty_type: 'none',
      reason: 'Sửa phiếu chi',
    })
    await waitFor(() => expect(service.listCashbookEntries).toHaveBeenCalledTimes(2))
    expect(screen.getByRole('status')).toHaveTextContent('Đã sửa phiếu PC000001.01')
  })

  it('opens cashbook entry detail with allocation rows', async () => {
    const service = makeService()
    render(<FinancePage service={service} />)

    await userEvent.click(await screen.findByRole('button', { name: 'Mở chi tiết PT0001' }))

    const detail = await screen.findByRole('region', { name: 'Chi tiết sổ quỹ PT0001' })
    expect(within(detail).getByText('Văn Viết Phương Lâm')).toBeInTheDocument()
    expect(within(detail).getByText('Anh Nam')).toBeInTheDocument()
    expect(within(detail).getAllByText('HD0001').length).toBeGreaterThan(0)
    expect(service.getCashbookEntry).toHaveBeenCalledWith('entry-1')
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
