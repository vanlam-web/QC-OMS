import { useEffect, useState } from 'react'
import { formatApiError } from '../../lib/api/error-message'
import type { CatalogService } from './catalog-service'
import type { PriceFormulaInput, PriceFormulaPreview, PriceList, Product, ProductStatus, SellMethod } from './types'

interface CatalogState {
  products: Product[]
  priceLists: PriceList[]
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
  const [formulaOpen, setFormulaOpen] = useState(false)
  const [previewingFormula, setPreviewingFormula] = useState(false)
  const [applyingFormula, setApplyingFormula] = useState(false)
  const [formulaPreview, setFormulaPreview] = useState<PriceFormulaPreview | null>(null)
  const [formulaForm, setFormulaForm] = useState({ name: '', fixedCost: '', fixedProfit: '' })
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
      setState((current) => ({
        products: result.items,
        priceLists: current?.priceLists ?? [],
        total: result.total,
      }))
    } catch (cause) {
      setError(formatApiError(cause, 'Không tải được hàng hóa.'))
    }
  }

  useEffect(() => {
    let active = true

    async function loadInitialProducts() {
      setError(null)
      try {
        const [result, priceListResult] = await Promise.all([
          service.listProducts({ status: 'active' }),
          service.listPriceLists(),
        ])
        if (!active) return
        setState({ products: result.items, priceLists: priceListResult.items, total: result.total })
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

  function buildFormulaInput(): PriceFormulaInput {
    return {
      name: formulaForm.name,
      product_filter: {
        status: 'active',
        ...(search.trim() ? { name_contains: search.trim() } : {}),
        ...(status !== 'all' ? {} : {}),
      },
      cost_formula: { type: 'fixed', amount: Number(formulaForm.fixedCost || 0) },
      profit_formula: { type: 'fixed', amount: Number(formulaForm.fixedProfit || 0) },
      price_list_adjustments: {},
    }
  }

  async function previewFormula(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPreviewingFormula(true)
    setError(null)
    try {
      setFormulaPreview(await service.previewPriceFormula(buildFormulaInput()))
    } catch (cause) {
      setError(formatApiError(cause, 'Không xem trước được công thức.'))
    } finally {
      setPreviewingFormula(false)
    }
  }

  async function applyFormula() {
    if (formulaPreview === null) return
    setApplyingFormula(true)
    setError(null)
    try {
      await service.applyPriceFormula({
        formula: buildFormulaInput(),
        selected_items: formulaPreview.items.flatMap((item) =>
          item.computed_prices.map((price) => ({
            product_id: item.product_id,
            price_list_id: price.price_list_id,
          })),
        ),
      })
      setFormulaPreview(null)
      await load()
    } catch (cause) {
      setError(formatApiError(cause, 'Không áp dụng được công thức.'))
    } finally {
      setApplyingFormula(false)
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

        <div className="catalog-toolbar">
          <button type="button" onClick={() => setFormulaOpen((current) => !current)}>
            Tạo công thức cho bộ lọc này
          </button>
        </div>

        {formulaOpen ? (
          <form aria-label="Công thức bảng giá" className="catalog-formula-panel" onSubmit={previewFormula}>
            <label>
              Tên công thức
              <input
                value={formulaForm.name}
                onChange={(event) => setFormulaForm((current) => ({ ...current, name: event.target.value }))}
              />
            </label>
            <label>
              Chi phí cố định
              <input
                inputMode="numeric"
                value={formulaForm.fixedCost}
                onChange={(event) => setFormulaForm((current) => ({ ...current, fixedCost: event.target.value }))}
              />
            </label>
            <label>
              Lợi nhuận cố định
              <input
                inputMode="numeric"
                value={formulaForm.fixedProfit}
                onChange={(event) => setFormulaForm((current) => ({ ...current, fixedProfit: event.target.value }))}
              />
            </label>
            <button disabled={previewingFormula} type="submit">
              Xem trước
            </button>
            <button disabled={formulaPreview === null || applyingFormula} type="button" onClick={() => void applyFormula()}>
              Áp dụng công thức
            </button>
          </form>
        ) : null}

        {formulaPreview ? (
          <section className="catalog-preview" aria-label="Xem trước công thức">
            <p>{formulaPreview.affected_count} hàng hóa khớp bộ lọc</p>
            <table>
              <thead>
                <tr>
                  <th>Mã hàng</th>
                  <th>Tên hàng</th>
                  <th>Bảng giá</th>
                  <th>Giá đề xuất</th>
                  <th>Chênh lệch</th>
                </tr>
              </thead>
              <tbody>
                {formulaPreview.items.flatMap((item) =>
                  item.computed_prices.map((price) => (
                    <tr key={`${item.product_id}-${price.price_list_id}`}>
                      <td>{item.product_code}</td>
                      <td>{item.product_name}</td>
                      <td>{price.price_list_name}</td>
                      <td>{formatMoney(price.computed_unit_price)}</td>
                      <td>{price.delta === null ? 'Mới' : formatMoney(price.delta)}</td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </section>
        ) : null}

        {state ? (
          <>
            <p>{state.total} hàng hóa</p>
            <table>
              <thead>
                <tr>
                  <th>Mã hàng</th>
                  <th>Tên hàng</th>
                  <th>Giá nhập cuối</th>
                  {state.priceLists.map((priceList) => (
                    <th key={priceList.id}>{priceList.name}</th>
                  ))}
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
                    <td>{formatMoney(product.latest_purchase_cost ?? 0)}</td>
                    {state.priceLists.map((priceList) => (
                      <td key={priceList.id}>-</td>
                    ))}
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

function formatMoney(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(value)
}
