import { describe, expect, it } from 'vitest'
import { createInventoryService } from './inventory-service'
import type { InventoryApiRequester } from './inventory-service'

describe('inventory-service', () => {
  it('builds inventory product list filters', async () => {
    const calls: Array<[string, RequestInit | undefined]> = []
    const request: InventoryApiRequester['request'] = async <T>(path: string, init?: RequestInit) => {
      calls.push([path, init])
      return { items: [], page: 2, page_size: 15, total: 0 } as T
    }
    const service = createInventoryService({ request })

    await service.listInventoryProducts({
      search: 'mica',
      status: 'all',
      inventory_shape: 'normal',
      page: 2,
      page_size: 15,
    })

    expect(calls).toEqual([
      ['/api/v1/inventory/products?q=mica&status=all&inventory_shape=normal&page=2&page_size=15', undefined],
    ])
  })

  it('posts normal product stock adjustments', async () => {
    const calls: Array<[string, RequestInit | undefined]> = []
    const request: InventoryApiRequester['request'] = async <T>(path: string, init?: RequestInit) => {
      calls.push([path, init])
      return {
        id: 'stocktake-1',
        code: 'KK000001',
        status: 'balanced',
        source_type: 'manual',
        created_at: '2026-07-05T00:00:00Z',
        balanced_at: '2026-07-05T00:01:00Z',
        note: 'Đếm lại kho',
      } as T
    }
    const service = createInventoryService({ request })

    await service.adjustNormalProductStock('product-1', { actual_qty: 12, reason: 'Đếm lại kho' })

    expect(calls).toEqual([
      [
        '/api/v1/inventory/products/product-1/adjust-stock',
        {
          method: 'POST',
          body: JSON.stringify({ actual_qty: 12, reason: 'Đếm lại kho' }),
        },
      ],
    ])
  })
})
