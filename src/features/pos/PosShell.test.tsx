import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PosShell } from './PosShell'
import type { CatalogService } from '../catalog/catalog-service'

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

it('renders POS landmarks, profile identity, and active product grid', async () => {
  render(
    <PosShell
      catalogService={makeCatalogService()}
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
