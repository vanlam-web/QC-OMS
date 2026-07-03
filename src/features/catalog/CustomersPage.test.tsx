import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CustomersPage } from './CustomersPage'
import type { CatalogService } from './catalog-service'
import type { OrderService } from '../orders/order-service'

function makeCatalogService(overrides: Partial<CatalogService> = {}): CatalogService {
  return {
    listProducts: vi.fn(async () => ({ items: [], page: 1, page_size: 20, total: 0 })),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    listCustomers: vi.fn(async () => ({
      items: [
        {
          id: 'customer-1',
          code: 'KH000123',
          name: 'Công ty ABC',
          phone: '0901234567',
          tax_code: '0312345678',
          customer_group_id: 'group-1',
          customer_group: { id: 'group-1', code: 'VIP', name: 'Khách VIP' },
        },
        {
          id: 'customer-2',
          code: 'KH000124',
          name: 'Khách lẻ',
          phone: null,
          tax_code: null,
          customer_group_id: null,
          customer_group: null,
        },
      ],
      page: 1,
      page_size: 20,
      total: 2,
    })),
    createCustomer: vi.fn(async () => ({
      id: 'customer-3',
      code: 'KH000125',
      name: 'Công ty MST',
      phone: '0912345678',
      tax_code: '0311111111',
      customer_group_id: null,
      customer_group: null,
    })),
    resolvePrices: vi.fn(async () => ({ items: [] })),
    listPriceLists: vi.fn(async () => ({ items: [] })),
    previewPriceFormula: vi.fn(),
    applyPriceFormula: vi.fn(),
    ...overrides,
  }
}

function makeOrderService(overrides: Partial<Pick<OrderService, 'getCustomerDebt'>> = {}) {
  return {
    getCustomerDebt: vi.fn(async () => ({
      customer_id: 'customer-1',
      total_debt: 250000,
      invoices: [
        {
          order_id: 'order-1',
          order_code: 'HD000045',
          total_amount: 500000,
          paid_amount: 300000,
          debt_amount: 200000,
          remaining_debt: 200000,
        },
        {
          order_id: 'order-2',
          order_code: 'HD000046',
          total_amount: 100000,
          paid_amount: 50000,
          debt_amount: 50000,
          remaining_debt: 50000,
        },
      ],
    })),
    ...overrides,
  } satisfies Pick<OrderService, 'getCustomerDebt'>
}

it('starts list-first without a blank customer detail panel', async () => {
  render(<CustomersPage service={makeCatalogService()} orderService={makeOrderService()} onOpenDashboard={vi.fn()} />)

  expect(await screen.findByText('KH000123')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Tạo khách hàng' })).toBeInTheDocument()
  expect(screen.queryByRole('region', { name: /Chi tiết khách hàng/ })).not.toBeInTheDocument()
})

it('creates a customer with optional MST from the explicit create form', async () => {
  const service = makeCatalogService()
  render(<CustomersPage service={service} orderService={makeOrderService()} onOpenDashboard={vi.fn()} />)

  await screen.findByText('KH000123')
  await userEvent.click(screen.getByRole('button', { name: 'Tạo khách hàng' }))

  const form = screen.getByRole('form', { name: 'Tạo khách hàng' })
  await userEvent.type(within(form).getByLabelText('Tên khách hàng'), 'Công ty MST')
  await userEvent.type(within(form).getByLabelText('Điện thoại'), '0912345678')
  await userEvent.type(within(form).getByLabelText('MST'), '0311111111')
  await userEvent.click(within(form).getByRole('button', { name: 'Lưu khách hàng' }))

  expect(service.createCustomer).toHaveBeenCalledWith({
    name: 'Công ty MST',
    phone: '0912345678',
    tax_code: '0311111111',
  })
})

it('expands customer detail directly under the selected row and closes on second click', async () => {
  const orderService = makeOrderService()
  render(<CustomersPage service={makeCatalogService()} orderService={orderService} onOpenDashboard={vi.fn()} />)

  const row = await screen.findByRole('row', { name: /KH000123/ })
  await userEvent.click(within(row).getByRole('button', { name: 'Chi tiết KH000123' }))

  const detail = await screen.findByRole('region', { name: 'Chi tiết khách hàng KH000123' })
  expect(detail).toBeInTheDocument()
  expect(row.nextElementSibling).toContainElement(detail)
  expect(within(detail).getByText('0312345678')).toBeInTheDocument()
  expect(within(detail).getByText('Theo nhóm: Khách VIP')).toBeInTheDocument()
  expect(within(detail).getByText('250.000 ₫')).toBeInTheDocument()
  expect(within(detail).getByText('2 hóa đơn mở')).toBeInTheDocument()
  expect(within(detail).getByText('HD000045')).toBeInTheDocument()
  expect(orderService.getCustomerDebt).toHaveBeenCalledWith('customer-1')

  await userEvent.click(within(row).getByRole('button', { name: 'Đóng KH000123' }))
  expect(screen.queryByRole('region', { name: 'Chi tiết khách hàng KH000123' })).not.toBeInTheDocument()
})

it('shows common price list when the customer has no group', async () => {
  render(<CustomersPage service={makeCatalogService()} orderService={makeOrderService()} onOpenDashboard={vi.fn()} />)

  const row = await screen.findByRole('row', { name: /KH000124/ })
  await userEvent.click(within(row).getByRole('button', { name: 'Chi tiết KH000124' }))

  const detail = await screen.findByRole('region', { name: 'Chi tiết khách hàng KH000124' })
  expect(within(detail).getByText('Bảng giá chung')).toBeInTheDocument()
  expect(within(detail).getByText('Chưa có MST')).toBeInTheDocument()
})
