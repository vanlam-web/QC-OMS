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
  current_payable_amount: 0,
  total_purchase_amount: 0,
}

function makeService(overrides: Partial<SupplierService> = {}): SupplierService {
  return {
    listSuppliers: vi.fn(async () => ({ items: [supplier], page: 1, page_size: 20, total: 1 })),
    getSupplier: vi.fn(async () => supplier),
    createSupplier: vi.fn(async () => ({ ...supplier, id: 'supplier-2', code: 'NCC000001', phone: null })),
    updateSupplier: vi.fn(async () => ({ ...supplier, status: 'inactive' as const })),
    listCustomers: vi.fn(async () => ({ items: customers, page: 1, page_size: 20, total: 1 })),
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
  expect(screen.getAllByText('0 ₫')).toHaveLength(2)
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
