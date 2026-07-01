import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CatalogPage } from './CatalogPage'
import type { CatalogService } from './catalog-service'

function makeService(overrides: Partial<CatalogService> = {}): CatalogService {
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
    createProduct: vi.fn(async () => ({
      id: 'p-2',
      code: 'DECAL',
      name: 'Decal',
      status: 'active' as const,
      unit_name: 'm²',
      sell_method: 'area_m2' as const,
    })),
    updateProduct: vi.fn(async () => ({
      id: 'p-1',
      code: 'MICA-3MM',
      name: 'Mica 3mm',
      status: 'inactive' as const,
      unit_name: 'm',
      sell_method: 'linear_m' as const,
    })),
    listCustomers: vi.fn(async () => ({ items: [], page: 1, page_size: 20, total: 0 })),
    createCustomer: vi.fn(),
    resolvePrices: vi.fn(async () => ({ items: [] })),
    ...overrides,
  }
}

it('lists products and creates a product', async () => {
  const service = makeService()
  render(<CatalogPage service={service} onOpenDashboard={vi.fn()} />)

  expect(screen.getByText('Đang tải hàng hóa...')).toBeInTheDocument()
  expect(await screen.findByText('MICA-3MM')).toBeInTheDocument()
  expect(screen.getByText('Mica 3mm')).toBeInTheDocument()

  const createForm = screen.getByRole('form', { name: 'Tạo hàng hóa' })
  await userEvent.type(within(createForm).getByLabelText('Mã hàng'), 'DECAL')
  await userEvent.type(within(createForm).getByLabelText('Tên hàng'), 'Decal')
  await userEvent.type(within(createForm).getByLabelText('Đơn vị'), 'm²')
  await userEvent.selectOptions(within(createForm).getByLabelText('Cách bán'), 'area_m2')
  await userEvent.click(within(createForm).getByRole('button', { name: 'Thêm hàng hóa' }))

  expect(service.createProduct).toHaveBeenCalledWith({
    code: 'DECAL',
    name: 'Decal',
    status: 'active',
    unit_name: 'm²',
    sell_method: 'area_m2',
  })
})

it('filters by status and toggles product active state', async () => {
  const service = makeService()
  render(<CatalogPage service={service} onOpenDashboard={vi.fn()} />)

  await screen.findByText('MICA-3MM')
  const filterForm = screen.getByRole('form', { name: 'Lọc hàng hóa' })
  await userEvent.selectOptions(within(filterForm).getByLabelText('Trạng thái'), 'all')
  await userEvent.click(within(filterForm).getByRole('button', { name: 'Lọc' }))
  expect(service.listProducts).toHaveBeenLastCalledWith({ search: '', status: 'all' })

  await userEvent.click(screen.getByRole('button', { name: 'Ngưng bán' }))
  expect(service.updateProduct).toHaveBeenCalledWith('p-1', { status: 'inactive' })
})
