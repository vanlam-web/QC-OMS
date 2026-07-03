import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SalesDocumentsPage } from './SalesDocumentsPage'
import type { SalesDocumentDetail, SalesDocumentService } from './sales-document-service'
import type { OrderService, QuoteReopenPayload } from '../orders/order-service'

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

const quoteListItem = {
  ...listItem,
  id: 'quote-1',
  code: 'BG000123',
  order_type: 'quote' as const,
  status: 'active' as const,
  paid_amount: 0,
  debt_amount: 0,
  payment_status: 'not_applicable' as const,
}

const quoteDetail: SalesDocumentDetail = {
  ...detail,
  ...quoteListItem,
  price_list: { id: 'pl-1', code: 'BGCHUNG', name: 'Bảng giá chung' },
  paid_amount: 0,
  debt_amount: 0,
  change_returned_amount: 0,
  payment_receipts: [],
  debt_entries: [],
  stock_movements: [],
}

const quoteReopenPayload: QuoteReopenPayload = {
  quote: {
    id: 'quote-1',
    code: 'BG000123',
    status: 'active',
  },
  customer: {
    customer_id: 'cus-1',
    snapshot: { code: 'KH001', name: 'Công ty Phong Cảnh', phone: '0909000000' },
    warnings: [],
  },
  price_list: {
    price_list_id: null,
    snapshot: { code: null, name: null },
    warnings: [],
  },
  items: [],
  summary: { subtotal_amount: 180000, discount_amount: 30000, total_amount: 150000 },
  note: null,
}

function makeService(overrides: Partial<SalesDocumentService> = {}): SalesDocumentService {
  return {
    listSalesDocuments: vi.fn(async () => ({
      items: [listItem],
      page: 1,
      page_size: 15,
      total: 1,
    })),
    getSalesDocument: vi.fn(async () => detail),
    ...overrides,
  }
}

function makeOrderService(overrides: Partial<OrderService> = {}): OrderService {
  return {
    validateCart: vi.fn(),
    checkout: vi.fn(),
    saveQuote: vi.fn(),
    getQuoteReopenPayload: vi.fn(async () => quoteReopenPayload),
    listFinanceAccounts: vi.fn(),
    getCustomerDebt: vi.fn(),
    listRecentCustomerProductPrices: vi.fn(),
    ...overrides,
  } as unknown as OrderService
}

it('lists invoices with money, seller and customer snapshots', async () => {
  const service = makeService()
  render(<SalesDocumentsPage service={service} onOpenDashboard={vi.fn()} />)

  expect(screen.getByText('Đang tải chứng từ...').closest('.management-list-surface')).not.toBeNull()
  expect(await screen.findByText('HD010985')).toBeInTheDocument()
  expect(screen.getByRole('main')).toHaveClass('management-page')
  expect(screen.getByRole('search', { name: 'Lọc chứng từ bán hàng' })).toHaveClass('management-compact-toolbar')
  expect(screen.getByRole('region', { name: 'Danh sách chứng từ bán hàng' })).toHaveClass('management-list-surface')
  const sidebar = screen.getByRole('complementary', { name: 'Bộ lọc chứng từ bán hàng' })
  expect(sidebar).toBeInTheDocument()
  expect(within(sidebar).getByRole('heading', { name: 'Bộ lọc' })).toBeInTheDocument()
  const typeFilterGroup = within(sidebar).getByRole('region', { name: 'Loại chứng từ' })
  const statusFilterGroup = within(sidebar).getByRole('region', { name: 'Trạng thái' })
  expect(within(typeFilterGroup).getByRole('radio', { name: 'Tất cả' })).toBeInTheDocument()
  expect(within(typeFilterGroup).getByRole('radio', { name: 'Hóa đơn' })).toBeInTheDocument()
  expect(within(typeFilterGroup).getByRole('radio', { name: 'Báo giá' })).toBeInTheDocument()
  expect(within(statusFilterGroup).getByRole('radio', { name: 'Tất cả' })).toBeInTheDocument()
  expect(within(statusFilterGroup).getByRole('radio', { name: 'Đang hiệu lực' })).toBeInTheDocument()
  expect(within(sidebar).getByRole('button', { name: 'Đặt lại bộ lọc' })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Danh sách chứng từ' })).not.toBeInTheDocument()
  expect(screen.queryByText('Tìm nhanh mã hóa đơn/báo giá, khách hàng hoặc ghi chú theo dữ liệu API hiện có.')).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Còn nợ' })).not.toBeInTheDocument()
  expect(screen.queryByText('Chưa có bộ lọc phụ.')).not.toBeInTheDocument()
  expect(screen.queryByText('Chọn một chứng từ để xem chi tiết.')).not.toBeInTheDocument()
  expect(screen.queryByRole('region', { name: 'Chi tiết chứng từ HD010985' })).not.toBeInTheDocument()
  expect(service.listSalesDocuments).toHaveBeenCalledWith({ page: 1, page_size: 15 })
  expect(screen.getByRole('columnheader', { name: 'Loại/Mã' })).toBeInTheDocument()
  expect(screen.getByRole('columnheader', { name: 'Khách đã trả' })).toBeInTheDocument()
  expect(screen.getByRole('columnheader', { name: 'Còn nợ' })).toBeInTheDocument()
  expect(screen.getByRole('columnheader', { name: 'Trạng thái' })).toBeInTheDocument()
  expect(screen.getByText('Công ty Phong Cảnh')).toBeInTheDocument()
  expect(screen.getByText('Admin')).toBeInTheDocument()
  expect(screen.getAllByText('150.000 ₫')).toHaveLength(2)
  expect(screen.getByText('0 ₫')).toBeInTheDocument()
  expect(screen.getByText('Hoàn tất', { selector: '.status-chip' })).toBeInTheDocument()
  const footer = screen.getByRole('navigation', { name: 'Phân trang chứng từ' })
  expect(footer).toHaveClass('management-table-footer')
  expect(within(footer).getByText('1-1 / 1 chứng từ')).toBeInTheDocument()
  expect(within(footer).getByText('Trang 1 / 1')).toBeInTheDocument()
  expect(within(footer).getByRole('button', { name: 'Trang trước' })).toBeDisabled()
  expect(within(footer).getByRole('button', { name: 'Trang sau' })).toBeDisabled()
})

it('searches by document code and keeps filtered empty state clear', async () => {
  const service = makeService({
    listSalesDocuments: vi.fn(async () => ({ items: [], page: 1, page_size: 15, total: 0 })),
  })
  render(<SalesDocumentsPage service={service} onOpenDashboard={vi.fn()} />)

  await screen.findByText('Chưa có chứng từ phù hợp bộ lọc.')
  await userEvent.type(screen.getByLabelText('Tìm chứng từ'), 'HD010985')
  await userEvent.click(screen.getByRole('button', { name: 'Lọc' }))

  expect(service.listSalesDocuments).toHaveBeenLastCalledWith({ search: 'HD010985', page: 1, page_size: 15 })
  const sidebar = screen.getByRole('complementary', { name: 'Bộ lọc chứng từ bán hàng' })
  expect(within(sidebar).getByText('Tìm: HD010985')).toHaveClass('management-filter-summary')
  expect(screen.getByText('Không thấy chứng từ theo bộ lọc hiện tại.')).toBeInTheDocument()
  expect(screen.getByText('Hãy thử mở rộng thời gian hoặc bỏ bớt bộ lọc.')).toBeInTheDocument()
})

it('uses 15-row pagination range and navigates pages through the list footer', async () => {
  const service = makeService({
    listSalesDocuments: vi.fn(async (input = {}) => ({
      items: [
        {
          ...listItem,
          id: `order-page-${input.page ?? 1}`,
          code: input.page === 2 ? 'HD010999' : 'HD010985',
        },
      ],
      page: input.page ?? 1,
      page_size: 15,
      total: 40,
    })),
  })
  render(<SalesDocumentsPage service={service} onOpenDashboard={vi.fn()} />)

  const footer = await screen.findByRole('navigation', { name: 'Phân trang chứng từ' })
  expect(within(footer).getByText('1-15 / 40 chứng từ')).toBeInTheDocument()
  expect(within(footer).getByText('Trang 1 / 3')).toBeInTheDocument()
  expect(within(footer).getByRole('button', { name: 'Trang trước' })).toBeDisabled()
  expect(within(footer).getByRole('button', { name: 'Trang sau' })).toBeEnabled()
  await userEvent.click(within(footer).getByRole('button', { name: 'Trang sau' }))

  expect(service.listSalesDocuments).toHaveBeenLastCalledWith({ page: 2, page_size: 15 })
  expect(await within(footer).findByText('16-30 / 40 chứng từ')).toBeInTheDocument()
  expect(within(footer).getByText('Trang 2 / 3')).toBeInTheDocument()
  expect(await screen.findByText('HD010999')).toBeInTheDocument()
})

it('filters quotes and exposes reopen only for active quote rows', async () => {
  const service = makeService({
    listSalesDocuments: vi.fn(async () => ({
      items: [quoteListItem],
      page: 1,
      page_size: 15,
      total: 1,
    })),
  })
  render(
    <SalesDocumentsPage
      service={service}
      orderService={makeOrderService()}
      onOpenDashboard={vi.fn()}
      onOpenQuoteInPos={vi.fn()}
    />,
  )

  await screen.findByText('BG000123')
  await userEvent.click(screen.getByRole('radio', { name: 'Báo giá' }))
  await userEvent.click(screen.getByRole('radio', { name: 'Đang hiệu lực' }))

  expect(service.listSalesDocuments).toHaveBeenLastCalledWith({
    type: 'quote',
    status: 'active',
    page: 1,
    page_size: 15,
  })
  expect(await screen.findByRole('button', { name: 'Mở tại POS BG000123' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Sửa' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Hủy' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'In' })).not.toBeInTheDocument()
})

it('stores reopen payload through callback when opening active quote in POS', async () => {
  const onOpenQuoteInPos = vi.fn()
  const orderService = makeOrderService()
  const service = makeService({
    listSalesDocuments: vi.fn(async () => ({
      items: [quoteListItem],
      page: 1,
      page_size: 15,
      total: 1,
    })),
  })
  render(
    <SalesDocumentsPage
      service={service}
      orderService={orderService}
      onOpenDashboard={vi.fn()}
      onOpenQuoteInPos={onOpenQuoteInPos}
    />,
  )

  await userEvent.click(await screen.findByRole('button', { name: 'Mở tại POS BG000123' }))

  expect(orderService.getQuoteReopenPayload).toHaveBeenCalledWith('quote-1')
  expect(onOpenQuoteInPos).toHaveBeenCalledWith(quoteReopenPayload)
})

it('opens quote print only from quote detail', async () => {
  const onOpenQuotePrint = vi.fn()
  const service = makeService({
    listSalesDocuments: vi.fn(async () => ({
      items: [quoteListItem],
      page: 1,
      page_size: 15,
      total: 1,
    })),
    getSalesDocument: vi.fn(async () => quoteDetail),
  })
  render(<SalesDocumentsPage service={service} onOpenDashboard={vi.fn()} onOpenQuotePrint={onOpenQuotePrint} />)

  await userEvent.click(await screen.findByRole('button', { name: 'Mở chi tiết BG000123' }))

  const detailRegion = await screen.findByRole('region', { name: 'Chi tiết chứng từ BG000123' })
  await userEvent.click(within(detailRegion).getByRole('button', { name: 'Xem/In báo giá' }))

  expect(onOpenQuotePrint).toHaveBeenCalledWith('quote-1')
})

it('opens invoice detail with item, price list, debt and stock snapshots', async () => {
  const service = makeService()
  render(<SalesDocumentsPage service={service} onOpenDashboard={vi.fn()} />)

  await userEvent.click(await screen.findByRole('button', { name: 'Mở chi tiết HD010985' }))

  expect(service.getSalesDocument).toHaveBeenCalledWith('order-1')
  const detailRegion = await screen.findByRole('region', { name: 'Chi tiết chứng từ HD010985' })
  expect(detailRegion).toHaveClass('management-inline-detail')
  expect(detailRegion.closest('.management-detail-row')).not.toBeNull()
  expect(within(detailRegion).getByText('Bảng giá chung')).toBeInTheDocument()
  expect(within(detailRegion).getByText('2.5m x 3.3m x 1 = 8.25m2')).toBeInTheDocument()
  expect(within(detailRegion).getByText('Giảm giá', { selector: 'dt' }).closest('div')).toHaveTextContent(/Giảm giá\s+30\.000/)
  expect(within(detailRegion).getByText('Khách đã trả', { selector: 'dt' }).closest('div')).toHaveTextContent(/Khách đã trả\s+0/)
  expect(within(detailRegion).getByText('Công nợ', { selector: 'dt' }).closest('div')).toHaveTextContent(/Công nợ hóa đơn\s+150\.000/)
  expect(within(detailRegion).getByText('sale_deduction -8.25 m²')).toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', { name: 'Đóng chi tiết HD010985' }))
  expect(screen.queryByRole('region', { name: 'Chi tiết chứng từ HD010985' })).not.toBeInTheDocument()
})

it('keeps saved invoice detail read-only until safe revise cancel and print flows exist', async () => {
  const service = makeService()
  render(<SalesDocumentsPage service={service} onOpenDashboard={vi.fn()} />)

  await userEvent.click(await screen.findByRole('button', { name: 'Mở chi tiết HD010985' }))
  const detailRegion = await screen.findByRole('region', { name: 'Chi tiết chứng từ HD010985' })

  expect(within(detailRegion).queryByRole('button', { name: 'Sửa' })).not.toBeInTheDocument()
  expect(within(detailRegion).queryByRole('button', { name: 'Hủy' })).not.toBeInTheDocument()
  expect(within(detailRegion).queryByRole('button', { name: 'Huỷ' })).not.toBeInTheDocument()
  expect(within(detailRegion).queryByRole('button', { name: 'In' })).not.toBeInTheDocument()
  expect(within(detailRegion).queryByRole('button', { name: 'In lại' })).not.toBeInTheDocument()
})
