import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CatalogPage } from './CatalogPage'
import type { CatalogService } from './catalog-service'

function makeService(overrides: Partial<CatalogService> = {}): CatalogService {
  return {
    listProducts: vi.fn(async (input = {}) => ({
      items: [
        {
          id: 'p-1',
          code: 'MICA-3MM',
          name: 'Mica 3mm',
          status: 'active' as const,
          unit_name: 'm',
          sell_method: 'linear_m' as const,
          latest_purchase_cost: 100000,
          inventory_shape: 'normal' as const,
        },
        {
          id: 'p-2',
          code: 'KEO',
          name: 'Keo dán',
          status: 'active' as const,
          unit_name: 'chai',
          sell_method: 'quantity' as const,
          latest_purchase_cost: 20000,
          inventory_shape: 'normal' as const,
        },
      ],
      page: input.page ?? 1,
      page_size: input.page_size ?? 15,
      total: 2,
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
    getProductBom: vi.fn(async () => null),
    saveProductBom: vi.fn(async () => ({
      id: 'bom-1',
      product_id: 'p-1',
      version: 1,
      status: 'active' as const,
      notes: null,
      created_at: '2026-07-05T00:00:00Z',
      items: [
        {
          id: 'bom-item-1',
          component_product_id: 'p-2',
          component_product: { id: 'p-2', code: 'KEO', name: 'Keo dán', unit_name: 'chai' },
          quantity: 2,
          sort_order: 1,
          notes: 'Dán mica',
        },
      ],
    })),
    listCustomers: vi.fn(async () => ({ items: [], page: 1, page_size: 20, total: 0 })),
    createCustomer: vi.fn(),
    resolvePrices: vi.fn(async () => ({ items: [] })),
    listPriceLists: vi.fn(async () => ({
      items: [
        { id: 'pl-default', code: 'DEFAULT', name: 'Bảng giá chung', is_default: true, is_active: true },
        { id: 'pl-25', code: '25', name: '25', is_default: false, is_active: true },
      ],
    })),
    previewPriceFormula: vi.fn(async () => ({
      affected_count: 1,
      items: [
        {
          product_id: 'p-1',
          product_code: 'MICA-3MM',
          product_name: 'Mica 3mm',
          latest_purchase_cost: 100000,
          current_mode: 'manual' as const,
          current_unit_price: 120000,
          computed_prices: [
            {
              price_list_id: 'pl-default',
              price_list_name: 'Bảng giá chung',
              current_unit_price: 120000,
              computed_unit_price: 150000,
              delta: 30000,
            },
            {
              price_list_id: 'pl-25',
              price_list_name: '25',
              current_unit_price: null,
              computed_unit_price: 150000,
              delta: null,
            },
          ],
        },
      ],
    })),
    applyPriceFormula: vi.fn(async () => ({ formula_rule_id: 'rule-1', affected_count: 1 })),
    ...overrides,
  }
}

it('lists products and creates a product', async () => {
  const service = makeService()
  render(<CatalogPage service={service} onOpenDashboard={vi.fn()} />)

  expect(screen.getByText('Đang tải hàng hóa...').closest('.management-list-surface')).not.toBeNull()
  expect(await screen.findByText('MICA-3MM')).toBeInTheDocument()
  expect(screen.getAllByText('Mica 3mm').length).toBeGreaterThan(0)
  expect(screen.getByRole('main')).toHaveClass('management-page')
  expect(screen.getByRole('heading', { name: 'Hàng hóa' }).closest('.management-page-header')).not.toBeNull()
  const sidebar = screen.getByRole('complementary', { name: 'Bộ lọc hàng hóa' })
  expect(sidebar).toHaveClass('management-filter-sidebar')
  expect(within(sidebar).queryByRole('heading', { name: 'Bộ lọc' })).not.toBeInTheDocument()
  expect(sidebar.querySelector('.management-filter-summary')).toBeNull()
  expect(within(sidebar).queryByRole('button', { name: 'Đặt lại bộ lọc' })).not.toBeInTheDocument()
  expect(screen.getByRole('region', { name: 'Danh sách hàng hóa' })).toHaveClass('management-list-surface')
  expect(screen.queryByRole('button', { name: 'Tạo công thức cho bộ lọc này' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Lọc' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Trang chủ' })).not.toBeInTheDocument()

  expect(screen.queryByRole('form', { name: 'Tạo hàng hóa' })).not.toBeInTheDocument()
  await userEvent.click(within(screen.getByRole('search', { name: 'Lọc hàng hóa' })).getByRole('button', { name: 'Tạo hàng hóa' }))
  const createForm = screen.getByRole('form', { name: 'Tạo hàng hóa' })
  expect(createForm.closest('.management-list-surface')).not.toBeNull()
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
  const filterForm = screen.getByRole('search', { name: 'Lọc hàng hóa' })
  expect(filterForm.closest('.management-page-header')).not.toBeNull()
  expect(within(filterForm).getByLabelText('Tìm hàng hóa').closest('.management-compact-search')).not.toBeNull()
  const createAction = within(filterForm).getByRole('button', { name: 'Tạo hàng hóa' })
  expect(createAction.closest('.management-compact-search')).not.toBeNull()
  expect(createAction).toHaveClass('management-compact-create-action')
  const searchInput = within(filterForm).getByLabelText('Tìm hàng hóa')
  await userEvent.click(screen.getByRole('radio', { name: 'Tất cả' }))
  await userEvent.type(searchInput, '{Enter}')
  expect(service.listProducts).toHaveBeenLastCalledWith({ page: 1, page_size: 15, search: undefined, status: 'all' })
  expect(screen.queryByText('Trạng thái: Tất cả')).not.toBeInTheDocument()

  await userEvent.click(screen.getAllByRole('button', { name: 'Ngưng bán' })[0])
  expect(service.updateProduct).toHaveBeenCalledWith('p-1', { status: 'inactive' })
})

it('renders products as a goods and inventory-oriented list, not a pricebook workspace', async () => {
  const service = makeService()
  render(<CatalogPage service={service} onOpenDashboard={vi.fn()} />)

  const grid = await screen.findByRole('table', { name: 'Danh sách hàng hóa' })
  expect(grid.closest('.management-table-viewport')).not.toBeNull()
  const header = within(grid).getByRole('row', {
    name: 'Mã hàng Tên hàng Giá nhập cuối Đơn vị Cách bán Trạng thái Thao tác',
  })
  expect(header).toBeInTheDocument()
  const footer = screen.getByRole('navigation', { name: 'Phân trang hàng hóa' })
  expect(footer).toHaveClass('management-table-footer')
  expect(footer).toContainElement(screen.getByText('1 - 2 trong 2 hàng hóa'))
  expect(within(footer).getByRole('textbox', { name: 'Trang hiện tại' })).toHaveValue('1')
  expect(screen.queryByRole('table', { name: 'Lưới bảng giá' })).not.toBeInTheDocument()
  expect(screen.queryByRole('form', { name: 'Công thức bảng giá' })).not.toBeInTheDocument()
})

it('opens product BOM and saves single-level normal components', async () => {
  const service = makeService()
  render(<CatalogPage service={service} onOpenDashboard={vi.fn()} />)

  await userEvent.click(await screen.findByText('MICA-3MM'))
  const bomRegion = await screen.findByRole('region', { name: 'BOM MICA-3MM' })
  await userEvent.selectOptions(within(bomRegion).getByLabelText('Vật tư'), 'p-2')
  await userEvent.clear(within(bomRegion).getByLabelText('Định mức'))
  await userEvent.type(within(bomRegion).getByLabelText('Định mức'), '2')
  await userEvent.type(within(bomRegion).getByLabelText('Ghi chú'), 'Dán mica')
  await userEvent.click(within(bomRegion).getByRole('button', { name: 'Lưu BOM' }))

  expect(service.getProductBom).toHaveBeenCalledWith('p-1')
  expect(service.saveProductBom).toHaveBeenCalledWith('p-1', {
    items: [{ component_product_id: 'p-2', quantity: 2, notes: 'Dán mica' }],
  })
})

it('uses the shared table footer to move between product pages', async () => {
  const service = makeService({
    listProducts: vi.fn(async (input = {}) => ({
      items: [
        {
          id: `p-page-${input.page ?? 1}`,
          code: input.page === 2 ? 'DECAL-2' : 'MICA-3MM',
          name: input.page === 2 ? 'Decal trang 2' : 'Mica 3mm',
          status: 'active' as const,
          unit_name: 'm',
          sell_method: 'linear_m' as const,
          latest_purchase_cost: 100000,
        },
      ],
      page: input.page ?? 1,
      page_size: input.page_size ?? 15,
      total: 45,
    })),
  })
  render(<CatalogPage service={service} onOpenDashboard={vi.fn()} />)

  expect(await screen.findByText('MICA-3MM')).toBeInTheDocument()
  const footer = screen.getByRole('navigation', { name: 'Phân trang hàng hóa' })
  expect(footer).toContainElement(screen.getByText('1 - 15 trong 45 hàng hóa'))
  expect(within(footer).getByRole('textbox', { name: 'Trang hiện tại' })).toHaveValue('1')

  await userEvent.click(within(footer).getByRole('button', { name: 'Trang sau' }))

  expect(await screen.findByText('DECAL-2')).toBeInTheDocument()
  expect(footer).toContainElement(screen.getByText('16 - 30 trong 45 hàng hóa'))
  expect(within(footer).getByRole('textbox', { name: 'Trang hiện tại' })).toHaveValue('2')
  expect(service.listProducts).toHaveBeenLastCalledWith({ page: 2, page_size: 15, search: undefined, status: 'active' })
})

it('expands product details directly under the selected row and closes on second click', async () => {
  const service = makeService()
  render(<CatalogPage service={service} onOpenDashboard={vi.fn()} />)

  await userEvent.click(await screen.findByText('MICA-3MM'))
  const detail = screen.getByRole('region', { name: 'Chi tiết hàng hóa MICA-3MM' })
  const productRow = detail.closest('tr')?.previousElementSibling
  expect(productRow).toHaveTextContent('MICA-3MM')
  expect(productRow).toHaveClass('management-data-row-selected')
  expect(detail.closest('tr')).toHaveClass('management-detail-row')
  expect(within(detail).getByText('Mica 3mm')).toBeInTheDocument()
  expect(within(detail).getByText('m tới')).toBeInTheDocument()
  expect(within(detail).getByText('100 000')).toBeInTheDocument()

  await userEvent.click(productRow as HTMLElement)
  expect(screen.queryByRole('region', { name: 'Chi tiết hàng hóa MICA-3MM' })).not.toBeInTheDocument()
})
