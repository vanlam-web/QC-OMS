import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PosShell } from './PosShell'
import type { CatalogService } from '../catalog/catalog-service'
import type { OrderService } from '../orders/order-service'

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
    ...overrides,
  }
}

function makeOrderService(): OrderService {
  return {
    validateCart: vi.fn(),
    checkout: vi.fn(),
    listFinanceAccounts: vi.fn(async () => ({ items: [] })),
    getCustomerDebt: vi.fn(),
    listRecentCustomerProductPrices: vi.fn(async () => ({ items: [] })),
  }
}

it('renders POS landmarks, profile identity, and active product grid', async () => {
  render(
    <PosShell
      catalogService={makeCatalogService()}
      orderService={makeOrderService()}
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
