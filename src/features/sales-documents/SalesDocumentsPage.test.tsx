import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SalesDocumentsPage } from './SalesDocumentsPage'
import type { SalesDocumentDetail, SalesDocumentService } from './sales-document-service'

const listItem = {
  id: 'order-1',
  code: 'HD010985',
  order_type: 'invoice' as const,
  status: 'completed' as const,
  created_at: '2026-06-30T17:08:00Z',
  customer: { id: 'cus-1', code: 'KH001', name: 'Công ty Phong Cảnh', phone: '0909000000' },
  seller: { id: 'seller-1', name: 'Admin' },
  subtotal_amount: 180000,
  discount_amount: 30000,
  total_amount: 150000,
  paid_amount: 0,
  debt_amount: 150000,
  payment_status: 'unpaid' as const,
  note: 'Khách lấy sau',
}

const detail: SalesDocumentDetail = {
  ...listItem,
  price_list: { id: 'pl-1', code: 'BGCHUNG', name: 'Bảng giá chung' },
  change_returned_amount: 0,
  items: [
    {
      id: 'item-1',
      line_no: 1,
      product: {
        id: 'product-1',
        code: 'DECAL-PP',
        name: 'Decal PP',
        unit_name: 'm²',
        sell_method: 'area_m2',
      },
      quantity: 8.25,
      unit_price: 20000,
      line_subtotal_amount: 165000,
      discount_amount: 15000,
      line_total: 150000,
      price_source: 'manual',
      note: '2.5m x 3.3m x 1 = 8.25m2',
    },
  ],
  payment_receipts: [],
  debt_entries: [
    {
      id: 'debt-1',
      entry_type: 'invoice_debt',
      amount_delta: 150000,
      balance_after_order: 150000,
      balance_after_customer: 150000,
      created_at: '2026-06-30T17:08:01Z',
    },
  ],
  stock_movements: [
    {
      id: 'stock-1',
      movement_type: 'sale_deduction',
      product_id: 'product-1',
      quantity_delta: -8.25,
      unit_name: 'm²',
      note: 'HD010985',
    },
  ],
  history: [{ at: '2026-06-30T17:08:00Z', action: 'created', actor_name: 'Admin', note: null }],
}

function makeService(overrides: Partial<SalesDocumentService> = {}): SalesDocumentService {
  return {
    listSalesDocuments: vi.fn(async () => ({
      items: [listItem],
      page: 1,
      page_size: 20,
      total: 1,
    })),
    getSalesDocument: vi.fn(async () => detail),
    ...overrides,
  }
}

it('lists invoices with money, seller and customer snapshots', async () => {
  const service = makeService()
  render(<SalesDocumentsPage service={service} onOpenDashboard={vi.fn()} />)

  expect(screen.getByText('Đang tải chứng từ...')).toBeInTheDocument()
  expect(await screen.findByText('HD010985')).toBeInTheDocument()
  expect(screen.getByText('Công ty Phong Cảnh')).toBeInTheDocument()
  expect(screen.getByText('Admin')).toBeInTheDocument()
  expect(screen.getByText('150.000 ₫')).toBeInTheDocument()
  expect(screen.getByText('Còn nợ 150.000 ₫')).toBeInTheDocument()
})

it('searches by document code and keeps filtered empty state clear', async () => {
  const service = makeService({
    listSalesDocuments: vi.fn(async () => ({ items: [], page: 1, page_size: 20, total: 0 })),
  })
  render(<SalesDocumentsPage service={service} onOpenDashboard={vi.fn()} />)

  await screen.findByText('Chưa có chứng từ phù hợp bộ lọc.')
  await userEvent.type(screen.getByLabelText('Tìm chứng từ'), 'HD010985')
  await userEvent.click(screen.getByRole('button', { name: 'Tìm' }))

  expect(service.listSalesDocuments).toHaveBeenLastCalledWith({ search: 'HD010985' })
  expect(screen.getByText('Không thấy chứng từ theo bộ lọc hiện tại.')).toBeInTheDocument()
  expect(screen.getByText('Hãy thử mở rộng thời gian hoặc bỏ bớt bộ lọc.')).toBeInTheDocument()
})

it('opens invoice detail with item, price list, debt and stock snapshots', async () => {
  const service = makeService()
  render(<SalesDocumentsPage service={service} onOpenDashboard={vi.fn()} />)

  await userEvent.click(await screen.findByRole('button', { name: 'Mở HD010985' }))

  expect(service.getSalesDocument).toHaveBeenCalledWith('order-1')
  const detailRegion = await screen.findByRole('region', { name: 'Chi tiết chứng từ HD010985' })
  expect(within(detailRegion).getByText('Bảng giá chung')).toBeInTheDocument()
  expect(within(detailRegion).getByText('2.5m x 3.3m x 1 = 8.25m2')).toBeInTheDocument()
  expect(within(detailRegion).getByText('Giảm giá 30.000 ₫')).toBeInTheDocument()
  expect(within(detailRegion).getByText('Khách đã trả 0 ₫')).toBeInTheDocument()
  expect(within(detailRegion).getByText('Công nợ hóa đơn 150.000 ₫')).toBeInTheDocument()
  expect(within(detailRegion).getByText('sale_deduction -8.25 m²')).toBeInTheDocument()
})

it('keeps saved invoice detail read-only until safe revise cancel and print flows exist', async () => {
  const service = makeService()
  render(<SalesDocumentsPage service={service} onOpenDashboard={vi.fn()} />)

  await userEvent.click(await screen.findByRole('button', { name: 'Mở HD010985' }))
  const detailRegion = await screen.findByRole('region', { name: 'Chi tiết chứng từ HD010985' })

  expect(within(detailRegion).queryByRole('button', { name: 'Sửa' })).not.toBeInTheDocument()
  expect(within(detailRegion).queryByRole('button', { name: 'Hủy' })).not.toBeInTheDocument()
  expect(within(detailRegion).queryByRole('button', { name: 'Huỷ' })).not.toBeInTheDocument()
  expect(within(detailRegion).queryByRole('button', { name: 'In' })).not.toBeInTheDocument()
  expect(within(detailRegion).queryByRole('button', { name: 'In lại' })).not.toBeInTheDocument()
})
