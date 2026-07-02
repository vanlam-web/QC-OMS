import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PurchaseReceiptsPage } from './PurchaseReceiptsPage'
import type { PurchaseReceiptService } from './purchase-receipt-service'

const suppliers = [
  {
    id: 'supplier-1',
    code: 'NCC000031',
    name: 'Nguyễn Phong',
    phone: null,
    email: null,
    address: null,
    tax_code: null,
    linked_customer_id: null,
    linked_customer: null,
    notes: null,
    status: 'active' as const,
    current_payable_amount: 0,
    total_purchase_amount: 0,
  },
]

const products = [
  {
    id: 'product-1',
    code: 'SP0001',
    name: 'Decal sữa',
    status: 'active' as const,
    unit_name: 'm',
    sell_method: 'quantity' as const,
    latest_purchase_cost: 85000,
    latest_purchase_cost_at: null,
  },
  {
    id: 'product-2',
    code: 'SP0002',
    name: 'Fomex',
    status: 'active' as const,
    unit_name: 'tấm',
    sell_method: 'quantity' as const,
    latest_purchase_cost: null,
    latest_purchase_cost_at: null,
  },
]

const receipt = {
  id: 'receipt-1',
  code: 'PN000673',
  supplier_id: 'supplier-1',
  supplier: { id: 'supplier-1', code: 'NCC000031', name: 'Nguyễn Phong' },
  received_at: '2026-07-01T03:00:00.000Z',
  status: 'draft' as const,
  supplier_document_no: 'HD-NCC-001',
  subtotal_amount: 190000,
  discount_amount: 10000,
  payable_amount: 180000,
  paid_amount: 50000,
  remaining_amount: 130000,
  notes: 'Nhập hàng thường',
  created_by: 'user-1',
  created_at: '2026-07-01T03:00:00.000Z',
  updated_at: '2026-07-01T03:00:00.000Z',
  items: [
    {
      id: 'item-1',
      product_id: 'product-1',
      product: { id: 'product-1', code: 'SP0001', name: 'Decal sữa' },
      line_no: 1,
      inventory_shape: 'normal' as const,
      unit_name_snapshot: 'm',
      quantity: 2,
      unit_cost: 100000,
      discount_amount: 10000,
      line_amount: 190000,
    },
  ],
}

function makeService(overrides: Partial<PurchaseReceiptService> = {}): PurchaseReceiptService {
  return {
    listReceipts: vi.fn(async () => ({ items: [receipt], page: 1, page_size: 20, total: 1 })),
    getReceipt: vi.fn(async () => receipt),
    createReceipt: vi.fn(async () => receipt),
    updateReceipt: vi.fn(async () => ({ ...receipt, notes: 'Đã sửa' })),
    listSuppliers: vi.fn(async () => ({ items: suppliers, page: 1, page_size: 20, total: 1 })),
    listProducts: vi.fn(async () => ({ items: products, page: 1, page_size: 20, total: 2 })),
    ...overrides,
  }
}

it('lists draft purchase receipts with totals and disabled post action', async () => {
  const service = makeService()

  render(<PurchaseReceiptsPage service={service} onOpenDashboard={vi.fn()} />)

  expect(screen.getByText('Đang tải phiếu nhập...')).toBeInTheDocument()
  expect(await screen.findByText('PN000673')).toBeInTheDocument()
  const table = screen.getByRole('table')
  expect(within(table).getByText('NCC000031 - Nguyễn Phong')).toBeInTheDocument()
  expect(within(table).getByText('180.000 ₫')).toBeInTheDocument()
  expect(within(table).getByText('130.000 ₫')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Hoàn thành P3' })).toBeDisabled()
})

it('filters purchase receipts by search status and dates', async () => {
  const service = makeService()

  render(<PurchaseReceiptsPage service={service} onOpenDashboard={vi.fn()} />)

  await screen.findByText('PN000673')
  const filterForm = screen.getByRole('form', { name: 'Lọc phiếu nhập' })
  await userEvent.type(within(filterForm).getByLabelText('Tìm phiếu/NCC'), 'PN000673')
  await userEvent.selectOptions(within(filterForm).getByLabelText('Trạng thái'), 'all')
  await userEvent.type(within(filterForm).getByLabelText('Từ ngày'), '2026-06-01')
  await userEvent.type(within(filterForm).getByLabelText('Đến ngày'), '2026-07-31')
  await userEvent.click(within(filterForm).getByRole('button', { name: 'Lọc' }))

  expect(service.listReceipts).toHaveBeenLastCalledWith({
    search: 'PN000673',
    status: 'all',
    date_from: '2026-06-01',
    date_to: '2026-07-31',
  })
})

it('creates a draft receipt for normal items with computed totals shown locally', async () => {
  const service = makeService()

  render(<PurchaseReceiptsPage service={service} onOpenDashboard={vi.fn()} />)

  await screen.findByText('PN000673')
  const form = screen.getByRole('form', { name: 'Thông tin phiếu nhập' })
  await userEvent.selectOptions(within(form).getByLabelText('Nhà cung cấp'), 'supplier-1')
  await userEvent.clear(within(form).getByLabelText('Thời gian nhập'))
  await userEvent.type(within(form).getByLabelText('Thời gian nhập'), '2026-07-01T10:00')
  await userEvent.type(within(form).getByLabelText('Số chứng từ NCC'), 'HD-NCC-001')
  await userEvent.selectOptions(within(form).getByLabelText('Sản phẩm dòng 1'), 'product-1')
  await userEvent.clear(within(form).getByLabelText('Số lượng dòng 1'))
  await userEvent.type(within(form).getByLabelText('Số lượng dòng 1'), '2')
  await userEvent.clear(within(form).getByLabelText('Đơn giá dòng 1'))
  await userEvent.type(within(form).getByLabelText('Đơn giá dòng 1'), '100000')
  await userEvent.clear(within(form).getByLabelText('Giảm giá dòng 1'))
  await userEvent.type(within(form).getByLabelText('Giảm giá dòng 1'), '10000')
  await userEvent.clear(within(form).getByLabelText('Giảm giá phiếu'))
  await userEvent.type(within(form).getByLabelText('Giảm giá phiếu'), '10000')
  await userEvent.clear(within(form).getByLabelText('Đã trả tạm'))
  await userEvent.type(within(form).getByLabelText('Đã trả tạm'), '50000')

  expect(within(form).getByText('Tổng tiền hàng: 190.000 ₫')).toBeInTheDocument()
  expect(within(form).getByText('Cần trả NCC: 180.000 ₫')).toBeInTheDocument()
  expect(within(form).getByText('Còn phải trả: 130.000 ₫')).toBeInTheDocument()

  await userEvent.click(within(form).getByRole('button', { name: 'Lưu draft phiếu nhập' }))

  expect(service.createReceipt).toHaveBeenCalledWith({
    code: '',
    supplier_id: 'supplier-1',
    received_at: '2026-07-01T10:00',
    supplier_document_no: 'HD-NCC-001',
    notes: '',
    discount_amount: 10000,
    paid_amount: 50000,
    items: [
      {
        product_id: 'product-1',
        unit_name: 'm',
        quantity: 2,
        unit_cost: 100000,
        discount_amount: 10000,
      },
    ],
  })
})

it('opens a draft receipt for editing and saves updated lines', async () => {
  const service = makeService()

  render(<PurchaseReceiptsPage service={service} onOpenDashboard={vi.fn()} />)

  await userEvent.click(await screen.findByRole('button', { name: 'Sửa PN000673' }))
  const form = screen.getByRole('form', { name: 'Thông tin phiếu nhập' })
  await userEvent.clear(within(form).getByLabelText('Ghi chú'))
  await userEvent.type(within(form).getByLabelText('Ghi chú'), 'Đã sửa')
  await userEvent.click(within(form).getByRole('button', { name: 'Lưu draft phiếu nhập' }))

  expect(service.getReceipt).toHaveBeenCalledWith('receipt-1')
  expect(service.updateReceipt).toHaveBeenCalledWith('receipt-1', expect.objectContaining({ notes: 'Đã sửa' }))
})
