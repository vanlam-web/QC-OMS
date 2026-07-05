import { describe, expect, it } from 'vitest'
import { createCatalogService } from './catalog-service'
import type { CatalogApiRequester } from './catalog-service'

describe('catalog-service', () => {
  it('gets and saves product BOM', async () => {
    const calls: Array<[string, RequestInit | undefined]> = []
    const request: CatalogApiRequester['request'] = async <T>(path: string, init?: RequestInit) => {
      calls.push([path, init])
      return null as T
    }
    const service = createCatalogService({ request })

    await service.getProductBom('product-1')
    await service.saveProductBom('product-1', {
      items: [{ component_product_id: 'component-1', quantity: 2, notes: 'Keo' }],
    })

    expect(calls).toEqual([
      ['/api/v1/products/product-1/bom', undefined],
      [
        '/api/v1/products/product-1/bom',
        {
          method: 'POST',
          body: JSON.stringify({ items: [{ component_product_id: 'component-1', quantity: 2, notes: 'Keo' }] }),
        },
      ],
    ])
  })
})
