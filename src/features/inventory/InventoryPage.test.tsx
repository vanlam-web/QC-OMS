import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { InventoryPage } from './InventoryPage'
import type { InventoryService } from './inventory-service'
import type { InventoryProduct, StockMovement, Stocktake } from './types'

const normalProduct: InventoryProduct = {
  product_id: 'product-1',
  code: 'MICA-3MM',
  name: 'Mica 3mm',
  status: 'active',
  inventory_shape: 'normal',
  stock_unit: 'tấm',
  available_qty: 8,
  is_negative: false,
}

const rollProduct: InventoryProduct = {
  product_id: 'product-2',
  code: 'DECAL-PP',
  name: 'Decal PP',
  status: 'active',
  inventory_shape: 'roll',
  stock_unit: 'm²',
  available_qty: -2,
  is_negative: true,
}

const movement: StockMovement = {
  id: 'movement-1',
  product_id: 'product-1',
  movement_type: 'checkout',
  quantity_delta: -2,
  created_at: '2026-07-05T02:00:00Z',
}

const stocktake: Stocktake = {
  id: 'stocktake-1',
  code: 'KK000001',
  status: 'balanced',
  source_type: 'manual',
  created_at: '2026-07-05T02:05:00Z',
  balanced_at: '2026-07-05T02:06:00Z',
  note: 'Đếm lại kho',
}

function makeService(overrides: Partial<InventoryService> = {}): InventoryService {
  return {
    listInventoryProducts: vi.fn(async () => ({ items: [normalProduct, rollProduct], page: 1, page_size: 15, total: 2 })),
    getInventoryProduct: vi.fn(async () => normalProduct),
    listStockMovements: vi.fn(async () => ({ items: [movement], page: 1, page_size: 10, total: 1 })),
    listStocktakes: vi.fn(async () => ({ items: [stocktake], page: 1, page_size: 10, total: 1 })),
    adjustNormalProductStock: vi.fn(async () => stocktake),
    previewPosShortage: vi.fn(),
    getMaterialOpeningOptions: vi.fn(),
    createMaterialOpening: vi.fn(),
    ...overrides,
  }
}

describe('InventoryPage', () => {
  it('lists inventory products with filters and negative stock signal', async () => {
    const service = makeService()
    render(<InventoryPage service={service} />)

    expect(screen.getByText('Đang tải hàng hóa...')).toBeInTheDocument()
    expect(await screen.findByText('MICA-3MM')).toBeInTheDocument()
    expect(screen.getByText('DECAL-PP')).toBeInTheDocument()
    expect(screen.getAllByText('Âm kho').length).toBeGreaterThan(0)
    const sidebar = screen.getByRole('complementary', { name: 'Bộ lọc hàng hóa' })
    expect(within(sidebar).queryByRole('button', { name: 'Đặt lại bộ lọc' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Lọc' })).not.toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Tìm hàng hóa'), 'mica')
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Loại hàng' }), 'normal')
    await userEvent.click(within(sidebar).getByRole('button', { name: 'Áp dụng bộ lọc' }))

    expect(service.listInventoryProducts).toHaveBeenLastCalledWith({
      search: 'mica',
      status: 'active',
      inventory_shape: 'normal',
      page: 1,
      page_size: 15,
    })
  })

  it('opens product detail, shows stock movement history, and adjusts normal stock', async () => {
    const service = makeService()
    render(<InventoryPage service={service} />)

    await userEvent.click(await screen.findByRole('button', { name: 'Xem hàng hóa MICA-3MM' }))

    const detail = await screen.findByRole('region', { name: 'Chi tiết hàng hóa MICA-3MM' })
    expect(within(detail).getByText('Mica 3mm')).toBeInTheDocument()
    expect(within(detail).getByText('checkout')).toBeInTheDocument()
    expect(within(detail).getByText('KK000001')).toBeInTheDocument()

    await userEvent.clear(within(detail).getByLabelText('Tồn thực tế'))
    await userEvent.type(within(detail).getByLabelText('Tồn thực tế'), '12')
    await userEvent.type(within(detail).getByLabelText('Lý do điều chỉnh'), 'Đếm lại kho')
    await userEvent.click(within(detail).getByRole('button', { name: 'Cân bằng kho' }))

    expect(service.adjustNormalProductStock).toHaveBeenCalledWith('product-1', {
      actual_qty: 12,
      reason: 'Đếm lại kho',
    })
    await waitFor(() => expect(service.listInventoryProducts).toHaveBeenCalledTimes(2))
  })
})
