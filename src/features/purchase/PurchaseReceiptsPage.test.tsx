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
  supplier_payments: [],
}

const postedReceipt = {
  ...receipt,
  id: 'receipt-posted',
  code: 'PN000674',
  status: 'posted' as const,
  remaining_amount: 130000,
  supplier_payments: [
    {
      id: 'payment-1',
      code: 'PCPN000001',
      paid_at: '2026-07-02T07:00:00.000Z',
      created_by: 'user-1',
      payment_method: 'cash' as const,
      status: 'posted' as const,
      amount: 50000,
    },
  ],
}

function makeService(overrides: Partial<PurchaseReceiptService> = {}): PurchaseReceiptService {
  return {
    listReceipts: vi.fn(async () => ({ items: [receipt], page: 1, page_size: 20, total: 1 })),
    getReceipt: vi.fn(async () => receipt),
    createReceipt: vi.fn(async () => receipt),
    updateReceipt: vi.fn(async () => ({ ...receipt, notes: 'Đã sửa' })),
    postReceipt: vi.fn(async () => ({
      purchase_receipt_id: 'receipt-1',
      status: 'posted' as const,
      posted_at: '2026-07-02T03:00:00.000Z',
      cashbook_voucher_id: 'voucher-1',
    })),
    paySupplier: vi.fn(async () => ({
      supplier_payment_id: 'payment-2',
      code: 'PCPN000002',
      amount: 80000,
      cashbook_voucher_id: 'voucher-2',
    })),
    listSuppliers: vi.fn(async () => ({ items: suppliers, page: 1, page_size: 20, total: 1 })),
    listProducts: vi.fn(async () => ({ items: products, page: 1, page_size: 20, total: 2 })),
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
    ...overrides,
  }
}

it('lists draft purchase receipts with totals and opens post action for draft detail', async () => {
  const service = makeService()

  render(<PurchaseReceiptsPage service={service} onOpenDashboard={vi.fn()} />)

  expect(screen.getByText('Đang tải phiếu nhập...')).toBeInTheDocument()
  expect(await screen.findByText('PN000673')).toBeInTheDocument()
  const table = screen.getByRole('table')
  expect(within(table).getByText('NCC000031 - Nguyễn Phong')).toBeInTheDocument()
  expect(within(table).getByText('180.000 ₫')).toBeInTheDocument()
  expect(within(table).getByText('130.000 ₫')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Hoàn thành nhập hàng' })).not.toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Sửa PN000673' }))
  expect(screen.getByRole('button', { name: 'Hoàn thành nhập hàng' })).toBeInTheDocument()
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
  expect(within(form).getByLabelText('Đơn vị dòng 1')).toHaveAttribute('readonly')
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

it('opens posted receipts as view-only details', async () => {
  const service = makeService({
    listReceipts: vi.fn(async () => ({ items: [postedReceipt], page: 1, page_size: 20, total: 1 })),
    getReceipt: vi.fn(async () => postedReceipt),
  })

  render(<PurchaseReceiptsPage service={service} onOpenDashboard={vi.fn()} />)

  await userEvent.click(await screen.findByRole('button', { name: 'Xem PN000674' }))
  const form = screen.getByRole('form', { name: 'Thông tin phiếu nhập' })

  expect(within(form).getByRole('heading', { name: 'Xem phiếu nhập' })).toBeInTheDocument()
  expect(within(form).queryByRole('button', { name: 'Hoàn thành nhập hàng' })).not.toBeInTheDocument()
  expect(within(form).queryByRole('button', { name: 'Lưu draft phiếu nhập' })).not.toBeInTheDocument()
  expect(within(form).getByLabelText('Nhà cung cấp')).toBeDisabled()
})

it('shows supplier payment history and pays remaining amount from posted receipt detail', async () => {
  const service = makeService({
    listReceipts: vi.fn(async () => ({ items: [postedReceipt], page: 1, page_size: 20, total: 1 })),
    getReceipt: vi.fn(async () => postedReceipt),
  })

  render(<PurchaseReceiptsPage service={service} onOpenDashboard={vi.fn()} />)

  await userEvent.click(await screen.findByRole('button', { name: 'Xem PN000674' }))
  const form = screen.getByRole('form', { name: 'Thông tin phiếu nhập' })

  expect(within(form).getByText('Lịch sử thanh toán NCC')).toBeInTheDocument()
  expect(within(form).getByText('PCPN000001')).toBeInTheDocument()
  expect(within(form).getByText('50.000 ₫')).toBeInTheDocument()
  await userEvent.click(within(form).getByRole('button', { name: 'Thanh toán NCC' }))
  const paymentForm = screen.getByRole('form', { name: 'Thanh toán nhà cung cấp' })
  expect(within(paymentForm).getByText('PN000674')).toBeInTheDocument()
  expect(within(paymentForm).getByText('Còn nợ: 80.000 ₫')).toBeInTheDocument()
  await userEvent.selectOptions(within(paymentForm).getByLabelText('Phương thức trả NCC'), 'cash')
  await userEvent.click(within(paymentForm).getByRole('button', { name: 'Lưu thanh toán NCC' }))

  expect(service.paySupplier).toHaveBeenCalledWith('supplier-1', {
    payment_method: 'cash',
    allocations: [{ purchase_receipt_id: 'receipt-posted', amount: 80000 }],
  })
})

it('warns on low purchase cost and posts with a selected bank account', async () => {
  const lowCostReceipt = {
    ...receipt,
    items: [{ ...receipt.items[0], unit_cost: 80000, line_amount: 150000 }],
  }
  const service = makeService({
    getReceipt: vi.fn(async () => lowCostReceipt),
  })

  render(<PurchaseReceiptsPage service={service} onOpenDashboard={vi.fn()} />)

  await userEvent.click(await screen.findByRole('button', { name: 'Sửa PN000673' }))
  const form = screen.getByRole('form', { name: 'Thông tin phiếu nhập' })

  expect(within(form).getByText(/thấp hơn giá nhập cuối/i)).toBeInTheDocument()
  await userEvent.selectOptions(within(form).getByLabelText('Phương thức trả ngay'), 'bank_transfer')
  await userEvent.selectOptions(within(form).getByLabelText('Tài khoản chuyển khoản'), 'bank-1')
  await userEvent.click(within(form).getByRole('button', { name: 'Hoàn thành nhập hàng' }))

  expect(service.postReceipt).toHaveBeenCalledWith('receipt-1', {
    payment_method: 'bank_transfer',
    finance_account_id: 'bank-1',
  })
})
