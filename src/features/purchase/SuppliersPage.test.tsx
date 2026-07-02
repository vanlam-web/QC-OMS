import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SuppliersPage } from './SuppliersPage'
import type { SupplierService } from './supplier-service'

const customers = [
  { id: 'customer-1', code: 'KH000123', name: 'Nguyễn Phong', phone: '0909000000' },
]

const supplier = {
  id: 'supplier-1',
  code: 'NCC000031',
  name: 'Nguyễn Phong',
  phone: null,
  email: 'ncc@example.test',
  address: 'Quận 12',
  tax_code: '0312345678',
  linked_customer_id: 'customer-1',
  linked_customer: { id: 'customer-1', code: 'KH000123', name: 'Nguyễn Phong' },
  notes: 'NCC cũng là khách hàng',
  status: 'active' as const,
  current_payable_amount: 250000,
  total_purchase_amount: 300000,
}

const payableReceipts = [
  {
    id: 'receipt-1',
    code: 'PN000673',
    supplier_document_no: 'HD-NCC-001',
    received_at: '2026-07-02T03:00:00.000Z',
    payable_amount: 300000,
    paid_amount: 0,
    remaining_amount: 300000,
    paid_after_post_amount: 50000,
    outstanding_amount: 250000,
  },
]

function makeService(overrides: Partial<SupplierService> = {}): SupplierService {
  return {
    listSuppliers: vi.fn(async () => ({ items: [supplier], page: 1, page_size: 20, total: 1 })),
    getSupplier: vi.fn(async () => supplier),
    createSupplier: vi.fn(async () => ({ ...supplier, id: 'supplier-2', code: 'NCC000001', phone: null })),
    updateSupplier: vi.fn(async () => ({ ...supplier, status: 'inactive' as const })),
    listCustomers: vi.fn(async () => ({ items: customers, page: 1, page_size: 20, total: 1 })),
    listPayableReceipts: vi.fn(async () => ({ items: payableReceipts })),
    listFinanceAccounts: vi.fn(async () => ({
      items: [
        {
          id: 'bank-1',
          code: 'VCB',
          name: 'Vietcombank',
          account_type: 'bank' as const,
          is_default_cash: false,
          is_active: true,
        },
      ],
    })),
    paySupplier: vi.fn(async () => ({
      supplier_payment_id: 'payment-1',
      code: 'PCPN000001',
      amount: 250000,
      cashbook_voucher_id: 'voucher-1',
    })),
    ...overrides,
  }
}

it('lists suppliers with payable and purchase totals plus linked customer', async () => {
  const service = makeService()

  render(<SuppliersPage service={service} onOpenDashboard={vi.fn()} />)

  expect(screen.getByText('Đang tải nhà cung cấp...')).toBeInTheDocument()
  expect(await screen.findByText('NCC000031')).toBeInTheDocument()
  expect(screen.getByText('Nguyễn Phong')).toBeInTheDocument()
  const table = screen.getByRole('table')
  expect(within(table).getByText('KH000123 - Nguyễn Phong')).toBeInTheDocument()
  expect(screen.getByText('250.000 ₫')).toBeInTheDocument()
  expect(screen.getByText('300.000 ₫')).toBeInTheDocument()
})

it('filters suppliers by search and status', async () => {
  const service = makeService()

  render(<SuppliersPage service={service} onOpenDashboard={vi.fn()} />)

  await screen.findByText('NCC000031')
  const filterForm = screen.getByRole('form', { name: 'Lọc nhà cung cấp' })
  await userEvent.type(within(filterForm).getByLabelText('Tìm NCC'), 'Nguyen')
  await userEvent.selectOptions(within(filterForm).getByLabelText('Trạng thái'), 'all')
  await userEvent.click(within(filterForm).getByRole('button', { name: 'Lọc' }))

  expect(service.listSuppliers).toHaveBeenLastCalledWith({ search: 'Nguyen', status: 'all' })
})

it('uses supplier filter presets, active chips, and reset action', async () => {
  const service = makeService()

  render(<SuppliersPage service={service} onOpenDashboard={vi.fn()} />)

  await screen.findByText('NCC000031')
  const filterForm = screen.getByRole('form', { name: 'Lọc nhà cung cấp' })
  await userEvent.type(within(filterForm).getByLabelText('Tìm NCC'), 'NCC000031')
  await userEvent.click(within(filterForm).getByRole('button', { name: 'Ngừng hoạt động' }))

  expect(service.listSuppliers).toHaveBeenLastCalledWith({ search: 'NCC000031', status: 'inactive' })
  expect(screen.getByRole('button', { name: 'Bỏ tìm: NCC000031' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Bỏ trạng thái: Ngừng hoạt động' })).toBeInTheDocument()

  await userEvent.click(within(filterForm).getByRole('button', { name: 'Đặt lại bộ lọc' }))

  expect(service.listSuppliers).toHaveBeenLastCalledWith({ status: 'active' })
})

it('creates supplier with blank phone and selected linked customer', async () => {
  const service = makeService()

  render(<SuppliersPage service={service} onOpenDashboard={vi.fn()} />)

  await screen.findByText('NCC000031')
  const form = screen.getByRole('form', { name: 'Thông tin nhà cung cấp' })
  await userEvent.type(within(form).getByLabelText('Tên NCC'), 'NCC mới')
  await userEvent.type(within(form).getByLabelText('Địa chỉ'), 'Quận 1')
  await userEvent.selectOptions(within(form).getByLabelText('Khách hàng liên kết'), 'customer-1')
  await userEvent.click(within(form).getByRole('button', { name: 'Lưu nhà cung cấp' }))

  expect(service.createSupplier).toHaveBeenCalledWith({
    code: '',
    name: 'NCC mới',
    phone: '',
    email: '',
    address: 'Quận 1',
    tax_code: '',
    linked_customer_id: 'customer-1',
    notes: '',
    status: 'active',
  })
})

it('opens supplier for editing and saves inactive status', async () => {
  const service = makeService()

  render(<SuppliersPage service={service} onOpenDashboard={vi.fn()} />)

  await userEvent.click(await screen.findByRole('button', { name: 'Sửa NCC000031' }))
  const form = screen.getByRole('form', { name: 'Thông tin nhà cung cấp' })
  await userEvent.selectOptions(within(form).getByLabelText('Trạng thái NCC'), 'inactive')
  await userEvent.click(within(form).getByRole('button', { name: 'Lưu nhà cung cấp' }))

  expect(service.getSupplier).toHaveBeenCalledWith('supplier-1')
  expect(service.updateSupplier).toHaveBeenCalledWith('supplier-1', expect.objectContaining({ status: 'inactive' }))
})

it('opens supplier payment form from payable supplier and submits explicit receipt allocation', async () => {
  const service = makeService()

  render(<SuppliersPage service={service} onOpenDashboard={vi.fn()} />)

  await userEvent.click(await screen.findByRole('button', { name: 'Thanh toán NCC000031' }))
  const form = screen.getByRole('form', { name: 'Thanh toán nhà cung cấp' })

  expect(service.listPayableReceipts).toHaveBeenCalledWith('supplier-1')
  expect(within(form).getByText('PN000673')).toBeInTheDocument()
  expect(within(form).getByText('Còn nợ: 250.000 ₫')).toBeInTheDocument()
  await userEvent.clear(within(form).getByLabelText('Số tiền trả cho PN000673'))
  await userEvent.type(within(form).getByLabelText('Số tiền trả cho PN000673'), '250000')
  await userEvent.selectOptions(within(form).getByLabelText('Phương thức trả NCC'), 'bank_transfer')
  await userEvent.selectOptions(within(form).getByLabelText('Tài khoản chuyển khoản NCC'), 'bank-1')
  await userEvent.type(within(form).getByLabelText('Ghi chú thanh toán'), 'Thanh toán NCC')
  await userEvent.click(within(form).getByRole('button', { name: 'Lưu thanh toán NCC' }))

  expect(service.paySupplier).toHaveBeenCalledWith('supplier-1', {
    payment_method: 'bank_transfer',
    finance_account_id: 'bank-1',
    note: 'Thanh toán NCC',
    allocations: [{ purchase_receipt_id: 'receipt-1', amount: 250000 }],
  })
})

it('blocks supplier payment over selected receipt outstanding amount in UI', async () => {
  const service = makeService()

  render(<SuppliersPage service={service} onOpenDashboard={vi.fn()} />)

  await userEvent.click(await screen.findByRole('button', { name: 'Thanh toán NCC000031' }))
  const form = screen.getByRole('form', { name: 'Thanh toán nhà cung cấp' })
  await userEvent.clear(within(form).getByLabelText('Số tiền trả cho PN000673'))
  await userEvent.type(within(form).getByLabelText('Số tiền trả cho PN000673'), '260000')
  await userEvent.click(within(form).getByRole('button', { name: 'Lưu thanh toán NCC' }))

  expect(await screen.findByRole('alert')).toHaveTextContent('Không được trả vượt số còn nợ của phiếu nhập.')
  expect(service.paySupplier).not.toHaveBeenCalled()
})
