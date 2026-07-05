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
      summary: { opening_balance: 100000, total_in: 500000, total_out: 100000, ending_balance: 400000 },
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
  it('shows cashbook without auxiliary account debt and voucher sections', async () => {
    render(<FinancePage service={makeService()} />)

    expect(await screen.findByRole('table', { name: 'Sổ quỹ' })).toBeInTheDocument()
    expect(screen.getAllByText('PT0001').length).toBeGreaterThan(0)
    expect(screen.queryByRole('region', { name: 'Tài khoản quỹ' })).not.toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Công nợ khách hàng' })).not.toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Phiếu thu/chi' })).not.toBeInTheDocument()
    expect(screen.queryByText('Công nợ khách')).not.toBeInTheDocument()
  })

  it('moves opening and outflow summary cards into the left KPI stack', async () => {
    render(<FinancePage service={makeService()} />)

    await screen.findByRole('table', { name: 'Sổ quỹ' })
    const sidebarSummary = screen.getByRole('region', { name: 'Tổng quan sổ quỹ' })
    const sidebarLabels = within(sidebarSummary)
      .getAllByText(/Quỹ đầu kỳ|Tổng chi|Tồn quỹ|Tổng thu/)
      .map((node) => node.textContent)

    expect(sidebarLabels).toEqual(['Quỹ đầu kỳ', 'Tổng thu', 'Tổng chi', 'Tồn quỹ'])
    expect(within(sidebarSummary).getByText('400 000')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2, name: 'Sổ quỹ' })).not.toBeInTheDocument()
  })

  it('filters debts and cashbook entries', async () => {
    const service = makeService()
    render(<FinancePage service={service} />)

    await userEvent.type(await screen.findByLabelText('Tìm công nợ'), 'nam')
    const debtFilterButton = screen.getByRole('button', { name: 'Lọc công nợ' })
    expect(screen.getByLabelText('Tìm công nợ').closest('.management-compact-search')).toContainElement(debtFilterButton)
    expect(debtFilterButton).toHaveClass('management-compact-create-action')
    expect(debtFilterButton).toHaveTextContent('')
    await userEvent.click(debtFilterButton)

    expect(service.listCustomerDebts).toHaveBeenLastCalledWith({ search: 'nam', page: 1, page_size: 15 })

    await userEvent.click(screen.getByRole('checkbox', { name: 'Phiếu thu' }))
    expect(screen.queryByRole('button', { name: 'Lọc sổ' })).not.toBeInTheDocument()

    expect(service.listCashbookEntries).toHaveBeenLastCalledWith({
      search: undefined,
      search_scope: 'all',
      from: '2026-07-01',
      to: '2026-07-31',
      finance_account_id: 'cash-1',
      direction: 'in',
      status: 'posted',
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
    expect(within(sidebar).queryByRole('heading', { name: 'Sổ quỹ' })).not.toBeInTheDocument()
    expect(within(sidebar).queryByLabelText('Tìm sổ quỹ')).not.toBeInTheDocument()
    expect(within(sidebar).queryByLabelText('Tìm theo')).not.toBeInTheDocument()
    expect(within(sidebar).getByRole('radio', { name: 'CASH · Quỹ tiền mặt' })).toBeChecked()
    expect(within(sidebar).getByRole('radio', { name: 'MB01 · MB Bank' })).not.toBeChecked()
    expect(within(sidebar).queryByRole('combobox', { name: 'Quỹ tiền' })).not.toBeInTheDocument()
    expect(within(sidebar).queryByRole('combobox', { name: 'Loại chứng từ' })).not.toBeInTheDocument()
    expect(within(sidebar).queryByRole('combobox', { name: 'Trạng thái sổ quỹ' })).not.toBeInTheDocument()
    expect(within(sidebar).queryByRole('combobox', { name: 'Hạch toán KQKD' })).not.toBeInTheDocument()

    await userEvent.click(within(sidebar).getByRole('radio', { name: 'MB01 · MB Bank' }))
    await userEvent.click(within(sidebar).getByRole('checkbox', { name: 'Phiếu thu' }))
    await userEvent.click(within(sidebar).getByRole('checkbox', { name: 'Đã hủy' }))
    await userEvent.click(within(sidebar).getByRole('radio', { name: 'Không' }))

    expect(service.listCashbookEntries).toHaveBeenLastCalledWith({
      search: undefined,
      search_scope: 'all',
      from: '2026-07-01',
      to: '2026-07-31',
      finance_account_id: 'bank-1',
      direction: 'in',
      status: 'all',
      is_business_accounted: false,
      page: 1,
      page_size: 15,
    })
  })

  it('uses KV-style checkbox defaults for cashbook direction and status filters', async () => {
    const service = makeService()
    render(<FinancePage service={service} />)

    await screen.findByRole('table', { name: 'Sổ quỹ' })
    const sidebar = screen.getByRole('complementary', { name: 'Bộ lọc tài chính' })

    expect(within(sidebar).getByRole('checkbox', { name: 'Phiếu thu' })).not.toBeChecked()
    expect(within(sidebar).getByRole('checkbox', { name: 'Phiếu chi' })).not.toBeChecked()
    expect(within(sidebar).getByRole('checkbox', { name: 'Đã thanh toán' })).toBeChecked()
    expect(within(sidebar).getByRole('checkbox', { name: 'Đã hủy' })).not.toBeChecked()

    expect(service.listCashbookEntries).toHaveBeenLastCalledWith(expect.objectContaining({
      finance_account_id: 'cash-1',
      direction: 'all',
      status: 'posted',
    }))

    await userEvent.click(within(sidebar).getByRole('checkbox', { name: 'Phiếu chi' }))
    expect(service.listCashbookEntries).toHaveBeenLastCalledWith(expect.objectContaining({ direction: 'out' }))

    await userEvent.click(within(sidebar).getByRole('checkbox', { name: 'Phiếu thu' }))
    expect(service.listCashbookEntries).toHaveBeenLastCalledWith(expect.objectContaining({ direction: 'all' }))

    await userEvent.click(within(sidebar).getByRole('checkbox', { name: 'Đã thanh toán' }))
    await userEvent.click(within(sidebar).getByRole('checkbox', { name: 'Đã hủy' }))
    expect(service.listCashbookEntries).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'cancelled' }))
  })

  it('filters cashbook by date range', async () => {
    const service = makeService()
    render(<FinancePage service={service} />)

    await screen.findByRole('table', { name: 'Sổ quỹ' })
    const timeGroup = screen.getByRole('region', { name: 'Thời gian' })
    expect(within(timeGroup).getByRole('radio', { name: 'Tháng này' })).toBeChecked()
    expect(within(timeGroup).getByRole('radio', { name: 'Tùy chỉnh' })).toBeInTheDocument()
    await userEvent.click(within(timeGroup).getByText('Tháng này'))
    const quickTimeMenu = screen.getByRole('region', { name: 'Chọn nhanh thời gian' })
    expect(within(quickTimeMenu).getByRole('button', { name: 'Hôm nay' })).toBeInTheDocument()
    expect(within(quickTimeMenu).getByRole('button', { name: 'Tháng trước' })).toBeInTheDocument()
    await userEvent.click(within(timeGroup).getByRole('radio', { name: 'Tùy chỉnh' }))
    await userEvent.clear(screen.getByLabelText('Từ ngày'))
    await userEvent.type(screen.getByLabelText('Từ ngày'), '2026-07-01')
    await userEvent.clear(screen.getByLabelText('Đến ngày'))
    await userEvent.type(screen.getByLabelText('Đến ngày'), '2026-07-31')

    expect(service.listCashbookEntries).toHaveBeenLastCalledWith(expect.objectContaining({
      search: undefined,
      search_scope: 'all',
      from: '2026-07-01',
      to: '2026-07-31',
    }))
  })

  it('does not show a cashbook reset action in the filter sidebar', async () => {
    const service = makeService()
    render(<FinancePage service={service} />)

    await screen.findByRole('table', { name: 'Sổ quỹ' })
    await userEvent.click(screen.getByRole('radio', { name: 'MB01 · MB Bank' }))

    const sidebar = screen.getByRole('complementary', { name: 'Bộ lọc tài chính' })
    expect(within(sidebar).queryByRole('button', { name: 'Đặt lại bộ lọc tài chính' })).not.toBeInTheDocument()
  })

  it('exports visible rows without showing a cashbook column chooser', async () => {
    const service = makeService()
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:cashbook')
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    render(<FinancePage service={service} />)

    await screen.findByRole('table', { name: 'Sổ quỹ' })
    const voucherActions = screen.getByLabelText('Tạo phiếu thu chi')
    expect(within(voucherActions).getByRole('button', { name: 'Xuất file' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cột' })).not.toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Chọn cột sổ quỹ' })).not.toBeInTheDocument()

    await userEvent.click(within(voucherActions).getByRole('button', { name: 'Xuất file' }))
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

})
