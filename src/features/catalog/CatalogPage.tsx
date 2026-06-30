import { useEffect, useState } from 'react'
import { formatApiError } from '../../lib/api/error-message'
import type { CatalogService } from './catalog-service'
import type { Product, ProductStatus, SellMethod } from './types'

interface CatalogState {
  products: Product[]
  total: number
}

const sellMethodLabels: Record<SellMethod, string> = {
  quantity: 'Số lượng',
  area_m2: 'm²',
  linear_m: 'm tới',
  sheet: 'Tấm',
  combo: 'Combo',
}

export function CatalogPage({
  service,
  onOpenDashboard,
}: {
  service: CatalogService
  onOpenDashboard: () => void
}) {
  const [state, setState] = useState<CatalogState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ProductStatus | 'all'>('active')
  const [form, setForm] = useState<{
    code: string
    name: string
    unitName: string
    sellMethod: SellMethod
    status: ProductStatus
  }>({
    code: '',
    name: '',
    unitName: '',
    sellMethod: 'quantity',
    status: 'active',
  })

  async function load(filters = { search, status }) {
    setError(null)
    try {
      const result = await service.listProducts({ search: filters.search, status: filters.status })
      setState({ products: result.items, total: result.total })
    } catch (cause) {
      setError(formatApiError(cause, 'Không tải được hàng hóa.'))
    }
  }

  useEffect(() => {
    let active = true

    async function loadInitialProducts() {
      setError(null)
      try {
        const result = await service.listProducts({ status: 'active' })
        if (!active) return
        setState({ products: result.items, total: result.total })
      } catch (cause) {
        if (active) setError(formatApiError(cause, 'Không tải được hàng hóa.'))
      }
    }

    void loadInitialProducts()

    return () => {
      active = false
    }
  }, [service])

  async function filterProducts(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await load({ search, status })
  }

  async function createProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await service.createProduct({
        code: form.code,
        name: form.name,
        status: form.status,
        unit_name: form.unitName,
        sell_method: form.sellMethod,
      })
      setForm({ code: '', name: '', unitName: '', sellMethod: 'quantity', status: 'active' })
      await load()
    } catch (cause) {
      setError(formatApiError(cause, 'Không lưu được hàng hóa.'))
    } finally {
      setSaving(false)
    }
  }

  async function toggleProductStatus(product: Product) {
    setSaving(true)
    setError(null)
    try {
      await service.updateProduct(product.id, {
        status: product.status === 'active' ? 'inactive' : 'active',
      })
      await load()
    } catch (cause) {
      setError(formatApiError(cause, 'Không lưu được hàng hóa.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="catalog-shell">
      <header className="catalog-header">
        <div>
          <h1>Hàng hóa</h1>
          <p>Sản phẩm, đơn vị bán và trạng thái bán POS</p>
        </div>
        <button type="button" onClick={onOpenDashboard}>
          Trang chủ
        </button>
      </header>

      {error ? <p role="alert">{error}</p> : null}
      {state === null && error === null ? <p>Đang tải hàng hóa...</p> : null}

      <section className="catalog-panel" aria-label="Quản lý hàng hóa">
        <form aria-label="Lọc hàng hóa" className="admin-form" onSubmit={filterProducts}>
          <label>
            Tìm
            <input value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
          <label>
            Trạng thái
            <select value={status} onChange={(event) => setStatus(event.target.value as ProductStatus | 'all')}>
              <option value="active">Đang bán</option>
              <option value="inactive">Ngưng bán</option>
              <option value="all">Tất cả</option>
            </select>
          </label>
          <button type="submit">Lọc</button>
        </form>

        <form aria-label="Tạo hàng hóa" className="catalog-form" onSubmit={createProduct}>
          <label>
            Mã hàng
            <input value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))} />
          </label>
          <label>
            Tên hàng
            <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
          </label>
          <label>
            Đơn vị
            <input
              value={form.unitName}
              onChange={(event) => setForm((current) => ({ ...current, unitName: event.target.value }))}
            />
          </label>
          <label>
            Cách bán
            <select
              value={form.sellMethod}
              onChange={(event) => setForm((current) => ({ ...current, sellMethod: event.target.value as SellMethod }))}
            >
              {Object.entries(sellMethodLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Trạng thái
            <select
              value={form.status}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ProductStatus }))}
            >
              <option value="active">Đang bán</option>
              <option value="inactive">Ngưng bán</option>
            </select>
          </label>
          <button disabled={saving} type="submit">
            Thêm hàng hóa
          </button>
        </form>

        {state ? (
          <>
            <p>{state.total} hàng hóa</p>
            <table>
              <thead>
                <tr>
                  <th>Mã hàng</th>
                  <th>Tên hàng</th>
                  <th>Đơn vị</th>
                  <th>Cách bán</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {state.products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.code}</td>
                    <td>{product.name}</td>
                    <td>{product.unit_name}</td>
                    <td>{sellMethodLabels[product.sell_method]}</td>
                    <td>{product.status === 'active' ? 'Đang bán' : 'Ngưng bán'}</td>
                    <td>
                      <button disabled={saving} type="button" onClick={() => void toggleProductStatus(product)}>
                        {product.status === 'active' ? 'Ngưng bán' : 'Mở bán'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : null}
      </section>
    </main>
  )
}
