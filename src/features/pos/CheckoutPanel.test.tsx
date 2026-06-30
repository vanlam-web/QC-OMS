import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CheckoutPanel } from './CheckoutPanel'
import type { CheckoutCartLine, OrderService } from '../orders/order-service'
import type { Customer } from '../catalog/types'

const customer: Customer = {
  id: 'customer-1',
  code: 'KH000001',
  name: 'Cong ty ABC',
  phone: null,
  customer_group_id: null,
  customer_group: null,
}

const line: CheckoutCartLine = {
  id: 'line-1',
  product: {
    id: 'p-1',
    code: 'MICA-3MM',
    name: 'Mica 3mm',
    status: 'active',
    unit_name: 'm tới',
    sell_method: 'linear_m',
  },
  quantity: 2,
  unitPrice: 120000,
  priceSource: 'default_price_list',
  isManualPrice: false,
}

function makeOrderService(overrides: Partial<OrderService> = {}): OrderService {
  return {
    validateCart: vi.fn(),
    checkout: vi.fn(async () => ({
      order: {
        id: 'order-1',
        code: 'HD000001',
        order_type: 'invoice' as const,
        status: 'completed' as const,
        total_amount: 240000,
        paid_amount: 240000,
        debt_amount: 0,
        payment_status: 'paid' as const,
      },
      payment_receipt: { id: 'receipt-1', code: 'PT000001', total_received_amount: 240000 },
      inventory_warnings: [],
    })),
    listFinanceAccounts: vi.fn(async () => ({
      items: [
        {
          id: 'bank-1',
          code: 'MB01',
          name: 'MB Bank',
          account_type: 'bank' as const,
          is_default_cash: false,
          is_active: true,
        },
      ],
    })),
    getCustomerDebt: vi.fn(async () => ({ customer_id: 'customer-1', total_debt: 100000, invoices: [] })),
    listRecentCustomerProductPrices: vi.fn(async () => ({
      items: [{ unitPrice: 110000, soldAt: '2026-06-30T10:00:00Z', orderCode: 'HD000099' }],
    })),
    ...overrides,
  }
}

it('calculates cart total and submits cash checkout', async () => {
  const service = makeOrderService()
  render(<CheckoutPanel cartLines={[line]} selectedCustomer={customer} orderService={service} />)

  expect(screen.getByText('240.000')).toBeInTheDocument()
  await userEvent.clear(screen.getByLabelText('Tiền mặt'))
  await userEvent.type(screen.getByLabelText('Tiền mặt'), '240000')
  await userEvent.click(screen.getByRole('button', { name: 'Tạo hóa đơn' }))

  expect(service.checkout).toHaveBeenCalledWith(
    expect.objectContaining({
      customer_id: 'customer-1',
      payment: expect.objectContaining({ cash_amount: 240000, bank_amount: 0 }),
    }),
  )
  expect(await screen.findByText('HD000001')).toBeInTheDocument()
})

it('requires a bank account when bank amount is entered', async () => {
  const service = makeOrderService()
  render(<CheckoutPanel cartLines={[line]} selectedCustomer={customer} orderService={service} />)

  await userEvent.clear(screen.getByLabelText('Chuyển khoản'))
  await userEvent.type(screen.getByLabelText('Chuyển khoản'), '240000')
  await userEvent.click(screen.getByRole('button', { name: 'Tạo hóa đơn' }))

  expect(await screen.findByRole('alert')).toHaveTextContent('Chọn tài khoản nhận chuyển khoản')
  expect(service.checkout).not.toHaveBeenCalled()
})

it('offers recent prices for the selected customer and product', async () => {
  const service = makeOrderService()
  render(<CheckoutPanel cartLines={[line]} selectedCustomer={customer} orderService={service} />)

  await userEvent.click(screen.getByRole('button', { name: 'Giá gần đây Mica 3mm' }))

  expect(service.listRecentCustomerProductPrices).toHaveBeenCalledWith('customer-1', 'p-1')
  expect(await screen.findByText('HD000099')).toBeInTheDocument()
  expect(screen.getByText('110.000')).toBeInTheDocument()
})

it('shows checkout inventory warnings without blocking success', async () => {
  const service = makeOrderService({
    checkout: vi.fn(async () => ({
      order: {
        id: 'order-1',
        code: 'HD000002',
        order_type: 'invoice' as const,
        status: 'completed' as const,
        total_amount: 240000,
        paid_amount: 240000,
        debt_amount: 0,
        payment_status: 'paid' as const,
      },
      payment_receipt: { id: 'receipt-1', code: 'PT000001', total_received_amount: 240000 },
      inventory_warnings: [{ product_id: 'p-1', code: 'MICA-3MM', message: 'Tồn kho âm sau bán hàng' }],
    })),
  })
  render(<CheckoutPanel cartLines={[line]} selectedCustomer={customer} orderService={service} />)

  await userEvent.clear(screen.getByLabelText('Tiền mặt'))
  await userEvent.type(screen.getByLabelText('Tiền mặt'), '240000')
  await userEvent.click(screen.getByRole('button', { name: 'Tạo hóa đơn' }))

  const receipt = await screen.findByLabelText('Kết quả checkout')
  expect(within(receipt).getByText('HD000002')).toBeInTheDocument()
  expect(within(receipt).getByText('Tồn kho âm sau bán hàng')).toBeInTheDocument()
})

it('requires retail debt note when no customer is selected and invoice has debt', async () => {
  const service = makeOrderService()
  render(<CheckoutPanel cartLines={[line]} selectedCustomer={null} orderService={service} />)

  await userEvent.clear(screen.getByLabelText('Tiền mặt'))
  await userEvent.type(screen.getByLabelText('Tiền mặt'), '100000')
  await userEvent.click(screen.getByRole('button', { name: 'Tạo hóa đơn' }))

  expect(await screen.findByRole('alert')).toHaveTextContent('Nhập ghi chú nợ khách lẻ')
  expect(service.checkout).not.toHaveBeenCalled()
})

it('asks whether customer surplus is returned or applied to old debt', async () => {
  render(<CheckoutPanel cartLines={[line]} selectedCustomer={customer} orderService={makeOrderService()} />)

  await userEvent.clear(screen.getByLabelText('Tiền mặt'))
  await userEvent.type(screen.getByLabelText('Tiền mặt'), '300000')

  expect(await screen.findByText('Khách trả dư 60.000')).toBeInTheDocument()
  expect(screen.getByRole('radio', { name: 'Trả lại khách' })).toBeChecked()
  expect(screen.getByRole('radio', { name: 'Cấn vào nợ cũ' })).toBeInTheDocument()
})
