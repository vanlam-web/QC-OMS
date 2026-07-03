import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PosShell } from './PosShell'
import type { CatalogService } from '../catalog/catalog-service'
import type { OrderService } from '../orders/order-service'
import type { ProductionQueueService } from '../production-queue/production-queue-service'
import { saveQuoteReopenPayload } from './quote-draft-handoff'

function makeCatalogService(overrides: Partial<CatalogService> = {}): CatalogService {
  return {
    listProducts: vi.fn(async () => ({
      items: [
        {
          id: 'p-1',
          code: 'MICA-3MM',
          name: 'Mica 3mm',
          status: 'active' as const,
          unit_name: 'm',
          sell_method: 'linear_m' as const,
        },
      ],
      page: 1,
      page_size: 20,
      total: 1,
    })),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    listCustomers: vi.fn(async () => ({
      items: [
        {
          id: 'customer-1',
          code: 'KH000001',
          name: 'Khach le',
          phone: null,
          tax_code: null,
          address: null,
          customer_group_id: null,
          customer_group: null,
        },
      ],
      page: 1,
      page_size: 20,
      total: 1,
    })),
    createCustomer: vi.fn(),
    resolvePrices: vi.fn(async () => ({
      items: [
        {
          product_id: 'p-1',
          unit_price: 120000,
          price_source: 'default_price_list' as const,
          price_list_id: 'pl-1',
        },
      ],
    })),
    listPriceLists: vi.fn(async () => ({ items: [] })),
    previewPriceFormula: vi.fn(),
    applyPriceFormula: vi.fn(),
    ...overrides,
  }
}

function makeOrderService(): OrderService {
  return {
    validateCart: vi.fn(),
    checkout: vi.fn(),
    saveQuote: vi.fn(async () => ({
      id: 'quote-1',
      code: 'BG000001',
      order_type: 'quote' as const,
      status: 'active' as const,
      total_amount: 120000,
    })),
    getQuoteReopenPayload: vi.fn(),
    listFinanceAccounts: vi.fn(async () => ({ items: [] })),
    getCustomerDebt: vi.fn(async () => ({ customer_id: 'customer-1', total_debt: 0, invoices: [] })),
    listRecentCustomerProductPrices: vi.fn(async () => ({ items: [] })),
  }
}

beforeEach(() => {
  window.sessionStorage.clear()
})

function makeProductionQueueService(
  overrides: Partial<ProductionQueueService> = {},
): ProductionQueueService {
  return {
    listQueue: vi.fn(async () => ({ items: [], page: 1, page_size: 20, total: 0 })),
    listHistory: vi.fn(async () => ({ items: [], page: 1, page_size: 20, total: 0 })),
    addToDraft: vi.fn(),
    dismiss: vi.fn(),
    restore: vi.fn(),
    ...overrides,
  }
}

it('renders POS landmarks, profile identity, and active product grid', async () => {
  render(
    <PosShell
      catalogService={makeCatalogService()}
      orderService={makeOrderService()}
      productionQueueService={makeProductionQueueService()}
      currentUser={{
        user: { id: 'u-1', email: 'cashier@example.test', display_name: 'Cashier' },
        organization: { id: 'o-1', code: 'VAN-LAM', name: 'Xưởng Văn Lâm' },
        workstation: null,
        permissions: ['perm.create_order'],
      }}
      onSignOut={vi.fn()}
      onOpenAdmin={vi.fn()}
      onOpenDashboard={vi.fn()}
    />,
  )

  expect(screen.getByLabelText('K01 topbar')).toBeInTheDocument()
  expect(screen.getByLabelText('K02 giỏ hàng')).toBeInTheDocument()
  expect(screen.getByLabelText('K03 sản phẩm')).toBeInTheDocument()
  expect(screen.getByText('Đã kết nối')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '👤 Cashier' })).toBeInTheDocument()
  expect(await screen.findByRole('heading', { name: 'Sản phẩm nhanh' })).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: /Mica 3mm/ }))
  const cart = screen.getByLabelText('K02 giỏ hàng')
  expect(within(cart).getByText('Mica 3mm')).toBeInTheDocument()
  expect(within(cart).getByText('120.000')).toBeInTheDocument()
})

it('resolves prices again with the selected customer', async () => {
  const service = makeCatalogService()

  render(
    <PosShell
      catalogService={service}
      orderService={makeOrderService()}
      productionQueueService={makeProductionQueueService()}
      currentUser={{
        user: { id: 'u-1', email: 'cashier@example.test', display_name: 'Cashier' },
        organization: { id: 'o-1', code: 'VAN-LAM', name: 'Xưởng Văn Lâm' },
        workstation: null,
        permissions: ['perm.create_order'],
      }}
      onSignOut={vi.fn()}
      onOpenAdmin={vi.fn()}
      onOpenDashboard={vi.fn()}
    />,
  )

  await userEvent.type(screen.getByLabelText('Tìm khách'), 'khach')
  await userEvent.click(screen.getByRole('button', { name: 'Tìm khách' }))
  await userEvent.click(await screen.findByRole('button', { name: 'Chọn KH000001 Khach le' }))

  expect(await screen.findByText('Đã chọn KH000001 - Khach le')).toBeInTheDocument()
  expect(service.resolvePrices).toHaveBeenCalledWith(['p-1'], 'customer-1')
})

it('lets the cashier edit quantity and unit price in the cart', async () => {
  render(
    <PosShell
      catalogService={makeCatalogService()}
      orderService={makeOrderService()}
      productionQueueService={makeProductionQueueService()}
      currentUser={{
        user: { id: 'u-1', email: 'cashier@example.test', display_name: 'Cashier' },
        organization: { id: 'o-1', code: 'VAN-LAM', name: 'Xưởng Văn Lâm' },
        workstation: null,
        permissions: ['perm.create_order'],
      }}
      onSignOut={vi.fn()}
      onOpenAdmin={vi.fn()}
      onOpenDashboard={vi.fn()}
    />,
  )

  await userEvent.click(await screen.findByRole('button', { name: /Mica 3mm/ }))
  const cart = screen.getByLabelText('K02 giỏ hàng')
  await userEvent.clear(screen.getByLabelText('Số lượng Mica 3mm'))
  await userEvent.type(screen.getByLabelText('Số lượng Mica 3mm'), '3')
  expect(within(cart).getByText('360.000')).toBeInTheDocument()

  await userEvent.clear(screen.getByLabelText('Đơn giá Mica 3mm'))
  await userEvent.type(screen.getByLabelText('Đơn giá Mica 3mm'), '100000')

  expect(within(cart).getByText('Giá sửa tay')).toBeInTheDocument()
  expect(within(cart).getByText('300.000')).toBeInTheDocument()
})

it('lets operators with apply_discount enter a line discount', async () => {
  const orderService = makeOrderService()
  render(
    <PosShell
      catalogService={makeCatalogService()}
      orderService={orderService}
      productionQueueService={makeProductionQueueService()}
      currentUser={{
        user: { id: 'u-1', email: 'cashier@example.test', display_name: 'Cashier' },
        organization: { id: 'o-1', code: 'VAN-LAM', name: 'Xưởng Văn Lâm' },
        workstation: null,
        permissions: ['perm.create_order', 'perm.apply_discount'],
      }}
      onSignOut={vi.fn()}
      onOpenAdmin={vi.fn()}
      onOpenDashboard={vi.fn()}
    />,
  )

  await userEvent.click(await screen.findByRole('button', { name: /Mica 3mm/ }))
  await userEvent.clear(screen.getByLabelText('Giảm Mica 3mm'))
  await userEvent.type(screen.getByLabelText('Giảm Mica 3mm'), '40000')

  const cart = screen.getByLabelText('K02 giỏ hàng')
  expect(within(cart).getByText('80.000')).toBeInTheDocument()

  await userEvent.clear(screen.getByLabelText('Tiền mặt trả hóa đơn'))
  await userEvent.type(screen.getByLabelText('Tiền mặt trả hóa đơn'), '80000')
  await userEvent.click(screen.getByRole('button', { name: 'Tạo hóa đơn' }))

  expect(orderService.checkout).toHaveBeenCalledWith(
    expect.objectContaining({
      items: [expect.objectContaining({ discount_amount: 40000 })],
      payment: expect.objectContaining({ cash_amount: 80000 }),
    }),
  )
})

it('hides line discount editing without apply_discount permission', async () => {
  render(
    <PosShell
      catalogService={makeCatalogService()}
      orderService={makeOrderService()}
      productionQueueService={makeProductionQueueService()}
      currentUser={{
        user: { id: 'u-1', email: 'cashier@example.test', display_name: 'Cashier' },
        organization: { id: 'o-1', code: 'VAN-LAM', name: 'Xưởng Văn Lâm' },
        workstation: null,
        permissions: ['perm.create_order'],
      }}
      onSignOut={vi.fn()}
      onOpenAdmin={vi.fn()}
      onOpenDashboard={vi.fn()}
    />,
  )

  await userEvent.click(await screen.findByRole('button', { name: /Mica 3mm/ }))

  expect(screen.queryByLabelText('Giảm Mica 3mm')).not.toBeInTheDocument()
  expect(screen.getByLabelText('K02 giỏ hàng')).toHaveTextContent('120.000')
})

it('updates automatic cart prices on customer change but preserves manual prices', async () => {
  const service = makeCatalogService({
    resolvePrices: vi
      .fn()
      .mockResolvedValueOnce({
        items: [
          {
            product_id: 'p-1',
            unit_price: 120000,
            price_source: 'default_price_list' as const,
            price_list_id: 'pl-default',
          },
        ],
      })
      .mockResolvedValue({
        items: [
          {
            product_id: 'p-1',
            unit_price: 90000,
            price_source: 'customer_group_price_list' as const,
            price_list_id: 'pl-customer',
          },
        ],
      }),
  })

  render(
    <PosShell
      catalogService={service}
      orderService={makeOrderService()}
      productionQueueService={makeProductionQueueService()}
      currentUser={{
        user: { id: 'u-1', email: 'cashier@example.test', display_name: 'Cashier' },
        organization: { id: 'o-1', code: 'VAN-LAM', name: 'Xưởng Văn Lâm' },
        workstation: null,
        permissions: ['perm.create_order'],
      }}
      onSignOut={vi.fn()}
      onOpenAdmin={vi.fn()}
      onOpenDashboard={vi.fn()}
    />,
  )

  await userEvent.click(
    within(await screen.findByLabelText('Sản phẩm nhanh')).getByRole('button', {
      name: /Mica 3mm/,
    }),
  )
  await userEvent.clear(screen.getByLabelText('Đơn giá Mica 3mm'))
  await userEvent.type(screen.getByLabelText('Đơn giá Mica 3mm'), '100000')

  await userEvent.type(screen.getByLabelText('Tìm khách'), 'khach')
  await userEvent.click(screen.getByRole('button', { name: 'Tìm khách' }))
  await userEvent.click(await screen.findByRole('button', { name: 'Chọn KH000001 Khach le' }))

  expect(await screen.findByText('Đã chọn KH000001 - Khach le')).toBeInTheDocument()
  expect(screen.getByLabelText('Đơn giá Mica 3mm')).toHaveValue(100000)
  expect(screen.getByText('Giá sửa tay')).toBeInTheDocument()

  await userEvent.click(
    within(screen.getByLabelText('Sản phẩm nhanh')).getByRole('button', { name: /Mica 3mm/ }),
  )
  const priceInputs = screen.getAllByLabelText('Đơn giá Mica 3mm')
  expect(priceInputs[1]).toHaveValue(90000)
})

it('adds a production queue payload to the local draft cart without checkout', async () => {
  const catalogService = makeCatalogService({
    resolvePrices: vi.fn(async () => ({
      items: [
        {
          product_id: 'p-2',
          unit_price: 65000,
          price_source: 'default_price_list' as const,
          price_list_id: 'pl-1',
        },
      ],
    })),
  })
  const orderService = makeOrderService()
  const productionQueueService = makeProductionQueueService({
    listQueue: vi.fn(async () => ({
      items: [
        {
          id: 'queue-1',
          production_machine: { id: 'machine-1', code: 'IN-DECAL', name: 'In decal' },
          raw_file_name: 'KH000001_DECAL-PP_120x50_x2',
          received_at: '2026-07-01T10:30:00Z',
          status: 'queued' as const,
          parse_status: 'ok' as const,
          parse_error: null,
          parsed: {},
        },
      ],
      page: 1,
      page_size: 20,
      total: 1,
    })),
    addToDraft: vi.fn(async () => ({
      queue_item_id: 'queue-1',
      customer: { id: 'customer-1', code: 'KH000001', name: 'Khach le' },
      draft_line: {
        product_id: 'p-2',
        product_code: 'DECAL-PP',
        product_name: 'Decal PP',
        unit_name: 'm²',
        sell_method: 'area_m2' as const,
        width_m: 1.2,
        height_m: 0.5,
        linear_m: null,
        quantity: 2,
        source: 'production_queue' as const,
      },
    })),
  })

  render(
    <PosShell
      catalogService={catalogService}
      orderService={orderService}
      productionQueueService={productionQueueService}
      currentUser={{
        user: { id: 'u-1', email: 'cashier@example.test', display_name: 'Cashier' },
        organization: { id: 'o-1', code: 'VAN-LAM', name: 'Xưởng Văn Lâm' },
        workstation: null,
        permissions: ['perm.create_order'],
      }}
      onSignOut={vi.fn()}
      onOpenAdmin={vi.fn()}
      onOpenDashboard={vi.fn()}
    />,
  )

  await userEvent.click(
    await screen.findByRole('button', { name: 'Thêm KH000001_DECAL-PP_120x50_x2 vào nháp' }),
  )

  const cart = screen.getByLabelText('K02 giỏ hàng')
  expect(await within(cart).findByText('Decal PP')).toBeInTheDocument()
  expect(within(cart).getByText('130.000')).toBeInTheDocument()
  expect(screen.getByText('Đã chọn KH000001 - Khach le')).toBeInTheDocument()
  expect(orderService.checkout).not.toHaveBeenCalled()
})

it('reopened quote keeps snapshot price and checks out as a normal draft', async () => {
  saveQuoteReopenPayload({
    quote: {
      id: 'quote-1',
      code: 'BG000123',
      status: 'active',
    },
    customer: {
      customer_id: 'customer-1',
      snapshot: { code: 'KH000001', name: 'Khach le', phone: null },
      warnings: [],
    },
    price_list: {
      price_list_id: null,
      snapshot: { code: null, name: null },
      warnings: [],
    },
    items: [{
      order_item_id: 'quote-item-1',
      product_id: 'p-1',
      product_snapshot: { code: 'MICA-3MM', name: 'Mica 3mm', unit_name: 'm', sell_method: 'linear_m' },
      quantity: 1,
      unit_price: 99000,
      discount_amount: 0,
      price_source: 'manual',
      note: null,
      warnings: [{ code: 'CURRENT_PRICE_DIFFERS', message: 'Giá hiện tại khác báo giá.' }],
    }],
    summary: { subtotal_amount: 99000, discount_amount: 0, total_amount: 99000 },
    note: null,
  })
  const orderService = makeOrderService()

  render(
    <PosShell
      catalogService={makeCatalogService()}
      orderService={orderService}
      productionQueueService={makeProductionQueueService()}
      currentUser={{
        user: { id: 'u-1', email: 'cashier@example.test', display_name: 'Cashier' },
        organization: { id: 'o-1', code: 'VAN-LAM', name: 'Xưởng Văn Lâm' },
        workstation: null,
        permissions: ['perm.create_order'],
      }}
      onSignOut={vi.fn()}
      onOpenAdmin={vi.fn()}
      onOpenDashboard={vi.fn()}
    />,
  )

  expect((await screen.findAllByText('Từ báo giá BG000123')).length).toBeGreaterThan(0)
  expect(screen.getByLabelText('Đơn giá Mica 3mm')).toHaveValue(99000)
  expect(screen.getByText('Giá hiện tại khác báo giá.')).toBeInTheDocument()

  await userEvent.clear(screen.getByLabelText('Tiền mặt trả hóa đơn'))
  await userEvent.type(screen.getByLabelText('Tiền mặt trả hóa đơn'), '99000')
  await userEvent.click(screen.getByRole('button', { name: 'Tạo hóa đơn' }))

  expect(orderService.checkout).toHaveBeenCalledWith(
    expect.not.objectContaining({ source_quote_id: 'quote-1' }),
  )
})

it('blocks checkout when reopened quote has inactive or missing product warning', async () => {
  saveQuoteReopenPayload({
    quote: {
      id: 'quote-1',
      code: 'BG000123',
      status: 'active',
    },
    customer: {
      customer_id: null,
      snapshot: { code: null, name: 'Khach le', phone: null },
      warnings: [],
    },
    price_list: {
      price_list_id: null,
      snapshot: { code: null, name: null },
      warnings: [],
    },
    items: [{
      order_item_id: 'quote-item-1',
      product_id: null,
      product_snapshot: { code: 'OLD', name: 'Hang cu', unit_name: 'tam', sell_method: 'quantity' },
      quantity: 1,
      unit_price: 50000,
      discount_amount: 0,
      price_source: 'manual',
      note: null,
      warnings: [{ code: 'PRODUCT_MISSING', message: 'Sản phẩm không còn trong danh mục.' }],
    }],
    summary: { subtotal_amount: 50000, discount_amount: 0, total_amount: 50000 },
    note: null,
  })
  const orderService = makeOrderService()

  render(
    <PosShell
      catalogService={makeCatalogService()}
      orderService={orderService}
      productionQueueService={makeProductionQueueService()}
      currentUser={{
        user: { id: 'u-1', email: 'cashier@example.test', display_name: 'Cashier' },
        organization: { id: 'o-1', code: 'VAN-LAM', name: 'Xưởng Văn Lâm' },
        workstation: null,
        permissions: ['perm.create_order'],
      }}
      onSignOut={vi.fn()}
      onOpenAdmin={vi.fn()}
      onOpenDashboard={vi.fn()}
    />,
  )

  expect(await screen.findByText('Sản phẩm không còn trong danh mục.')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Tạo hóa đơn' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Báo giá' })).toBeDisabled()
  expect(orderService.checkout).not.toHaveBeenCalled()
})
