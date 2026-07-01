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
          latest_purchase_cost: 100000,
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

it('renders pricebook as a grid-first pricing workspace', async () => {
  const service = makeService()
  render(<CatalogPage service={service} onOpenDashboard={vi.fn()} />)

  const grid = await screen.findByRole('table', { name: 'Lưới bảng giá' })
  const header = within(grid).getByRole('row', {
    name: 'Mã hàng Tên hàng Giá nhập cuối Chi phí Lợi nhuận Bảng giá chung 25 Cách bán Trạng thái Thao tác',
  })
  expect(header).toBeInTheDocument()
  expect(within(grid).getAllByRole('cell', { name: 'Chưa cấu hình' })).toHaveLength(2)
  expect(within(grid).getAllByRole('cell', { name: 'Chưa xem' })).toHaveLength(2)
  expect(screen.queryByText('Theo preview: giá từng bảng được xem và áp dụng qua phần công thức ở trên.')).not.toBeInTheDocument()
})

it('previews formula results in the pricebook grid instead of placeholder cells', async () => {
  const service = makeService()
  render(<CatalogPage service={service} onOpenDashboard={vi.fn()} />)

  expect(await screen.findByText('Bảng giá chung')).toBeInTheDocument()
  expect(screen.getByText('25')).toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', { name: 'Tạo công thức cho bộ lọc này' }))
  await userEvent.type(screen.getByLabelText('Tên công thức'), 'Fomex')
  await userEvent.type(screen.getByLabelText('Mã hàng chứa'), 'MICA')
  await userEvent.type(screen.getByLabelText('Tên hàng chứa'), 'Mica')
  await userEvent.selectOptions(screen.getByLabelText('Cách bán áp dụng'), 'linear_m')
  await userEvent.selectOptions(screen.getByLabelText('Kiểu chi phí'), 'amount_plus_percent')
  await userEvent.type(screen.getByLabelText('Chi phí cộng thêm'), '5000')
  await userEvent.type(screen.getByLabelText('% theo giá nhập cuối'), '8')
  await userEvent.selectOptions(screen.getByLabelText('Kiểu lợi nhuận'), 'tiers')
  await userEvent.selectOptions(screen.getByLabelText('Điều kiện lợi nhuận'), '>')
  await userEvent.type(screen.getByLabelText('Mốc giá nhập'), '100000')
  await userEvent.type(screen.getByLabelText('Lợi nhuận tier'), '25000')
  await userEvent.selectOptions(screen.getByLabelText('Điều chỉnh Bảng giá chung'), 'amount')
  await userEvent.type(screen.getByLabelText('Giá trị điều chỉnh Bảng giá chung'), '20000')
  await userEvent.click(screen.getByRole('button', { name: 'Xem trước' }))

  expect(await screen.findAllByText('150.000')).toHaveLength(2)
  const grid = screen.getByRole('table', { name: 'Lưới bảng giá' })
  expect(within(grid).getByText('Hiện tại 120.000 → 150.000')).toBeInTheDocument()
  expect(within(grid).queryByText('Giá tay 120.000 → 150.000')).not.toBeInTheDocument()
  expect(within(grid).queryByText('Theo công thức 120.000 → 150.000')).not.toBeInTheDocument()
  expect(within(grid).getByText('Mới 150.000')).toBeInTheDocument()
  expect(service.previewPriceFormula).toHaveBeenCalledWith({
    name: 'Fomex',
    product_filter: { status: 'active', code_contains: 'MICA', name_contains: 'Mica', sell_method: 'linear_m' },
    cost_formula: { type: 'amount_plus_percent', amount: 5000, percent_of_latest_purchase_cost: 8 },
    profit_formula: { type: 'tiers', tiers: [{ operator: '>', value: 100000, amount: 25000 }] },
    price_list_adjustments: { 'pl-default': { type: 'amount', amount: 20000 } },
  })
})
