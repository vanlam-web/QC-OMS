import { Fragment, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { formatApiError } from '../../lib/api/error-message'
import { formatMoney } from '../../lib/number-format'
import {
  ManagementCompactCreateAction,
  ManagementCompactSearch,
  ManagementCompactToolbar,
  ManagementDetailRow,
  ManagementFilterGroup,
  ManagementFilterSidebar,
  ManagementListSurface,
  ManagementPage,
  ManagementTableFooter,
  ManagementTableViewport,
} from '../../components/ui-shell/management-layout'
import type { CatalogService } from './catalog-service'
import type { Product, ProductBom, ProductStatus, SellMethod } from './types'

interface CatalogState {
  products: Product[]
  page: number
  pageSize: number
  total: number
}

const productPageSize = 15

const sellMethodLabels: Record<SellMethod, string> = {
  quantity: 'Số lượng',
  area_m2: 'm²',
  linear_m: 'm tới',
  sheet: 'Tấm',
  combo: 'Combo',
}

export function CatalogPage({
  service,
}: {
  service: CatalogService
  onOpenDashboard: () => void
}) {
  const [state, setState] = useState<CatalogState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(true)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [componentProducts, setComponentProducts] = useState<Product[]>([])
  const [bomByProductId, setBomByProductId] = useState<Record<string, ProductBom | null>>({})
  const [bomForms, setBomForms] = useState<Record<string, Array<{ component_product_id: string; quantity: string; notes: string }>>>({})
  const [search, setSearch] = useState('')
  const [lastSearch, setLastSearch] = useState('')
  const [status, setStatus] = useState<ProductStatus | 'all'>('active')
  const [lastStatus, setLastStatus] = useState<ProductStatus | 'all'>('active')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(productPageSize)
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

  async function load(filters: { search?: string; status?: ProductStatus | 'all'; page?: number; page_size?: number } = {}) {
    const nextSearch = filters.search ?? lastSearch
    const nextStatus = filters.status ?? lastStatus
    const nextPage = filters.page ?? page
    const nextPageSize = filters.page_size ?? pageSize
    setError(null)
    try {
      const result = await service.listProducts({
        page: nextPage,
        page_size: nextPageSize,
        search: nextSearch || undefined,
        status: nextStatus,
      })
      setState({ products: result.items, page: result.page, pageSize: result.page_size, total: result.total })
      setLastSearch(nextSearch)
      setLastStatus(nextStatus)
      setPage(result.page)
      setPageSize(result.page_size)
      setSelectedProductId(null)
    } catch (cause) {
      setError(formatApiError(cause, 'Không tải được hàng hóa.'))
    }
  }

  useEffect(() => {
    let active = true

    async function loadInitialProducts() {
      setError(null)
      try {
        const result = await service.listProducts({ page: 1, page_size: productPageSize, status: 'active' })
        if (!active) return
        setState({ products: result.items, page: result.page, pageSize: result.page_size, total: result.total })
        setPage(result.page)
        setPageSize(result.page_size)
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
    setPage(1)
    await load({ search: search.trim(), status, page: 1 })
  }

  async function goToPage(nextPage: number) {
    await load({ page: nextPage })
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
      setCreateOpen(false)
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

  async function toggleProductDetail(product: Product) {
    if (selectedProductId === product.id) {
      setSelectedProductId(null)
      return
    }
    setSelectedProductId(product.id)
    setError(null)
    try {
      const [bom, components] = await Promise.all([
        service.getProductBom(product.id),
        componentProducts.length === 0
          ? service.listProducts({ status: 'active', page: 1, page_size: 100 })
          : Promise.resolve({ items: componentProducts, page: 1, page_size: componentProducts.length, total: componentProducts.length }),
      ])
      const normalComponents = components.items.filter((item) => item.id !== product.id && item.inventory_shape !== 'roll' && item.inventory_shape !== 'sheet')
      setComponentProducts(normalComponents)
      setBomByProductId((current) => ({ ...current, [product.id]: bom }))
      setBomForms((current) => ({
        ...current,
        [product.id]: bom?.items.map((item) => ({
          component_product_id: item.component_product_id,
          quantity: String(item.quantity),
          notes: item.notes ?? '',
        })) ?? [{ component_product_id: '', quantity: '1', notes: '' }],
      }))
    } catch (cause) {
      setError(formatApiError(cause, 'Không tải được BOM hàng hóa.'))
    }
  }

  async function saveBom(product: Product) {
    const items = (bomForms[product.id] ?? [])
      .filter((line) => line.component_product_id !== '')
      .map((line) => ({
        component_product_id: line.component_product_id,
        quantity: Number(line.quantity),
        ...(line.notes.trim() ? { notes: line.notes.trim() } : {}),
      }))
    if (items.length === 0 || items.some((item) => item.quantity <= 0 || !Number.isFinite(item.quantity))) {
      setError('BOM cần ít nhất một vật tư và định mức lớn hơn 0.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const bom = await service.saveProductBom(product.id, { items })
      setBomByProductId((current) => ({ ...current, [product.id]: bom }))
      setBomForms((current) => ({
        ...current,
        [product.id]: bom.items.map((item) => ({
          component_product_id: item.component_product_id,
          quantity: String(item.quantity),
          notes: item.notes ?? '',
        })),
      }))
    } catch (cause) {
      setError(formatApiError(cause, 'Không lưu được BOM hàng hóa.'))
    } finally {
      setSaving(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil((state?.total ?? 0) / pageSize))
  const canGoPrevious = page > 1
  const canGoNext = page < totalPages
  const activeFilterSummary = lastSearch
    ? `Tìm: ${lastSearch}`
    : lastStatus === 'active'
      ? 'Đang bán'
      : lastStatus === 'inactive'
        ? 'Trạng thái: Ngưng bán'
        : 'Trạng thái: Tất cả'

  return (
    <ManagementPage
      title="Hàng hóa"
      actions={
        <ManagementCompactToolbar ariaLabel="Lọc hàng hóa" onSubmit={filterProducts}>
          <ManagementCompactSearch
            label="Tìm hàng hóa"
            leadingIcon={<Search aria-hidden="true" size={16} />}
            placeholder="Tìm mã, tên hàng"
            trailingAction={
              <ManagementCompactCreateAction ariaLabel="Tạo hàng hóa" onClick={() => setCreateOpen(true)} />
            }
            value={search}
            onChange={setSearch}
          />
        </ManagementCompactToolbar>
      }
      filter={
        <ManagementFilterSidebar
          activeSummary={activeFilterSummary}
          ariaLabel="Bộ lọc hàng hóa"
          title="Bộ lọc"
        >
          <button
            aria-label="Ẩn bộ lọc hàng hóa"
            className="management-filter-collapse-button"
            title="Ẩn bộ lọc"
            type="button"
            onClick={() => setShowFilters(false)}
          >
            <ChevronLeft aria-hidden="true" size={16} />
          </button>
          <ManagementFilterGroup title="Trạng thái">
            <label>
              <input checked={status === 'active'} name="product-status" type="radio" onChange={() => setStatus('active')} />
              Đang bán
            </label>
            <label>
              <input checked={status === 'inactive'} name="product-status" type="radio" onChange={() => setStatus('inactive')} />
              Ngưng bán
            </label>
            <label>
              <input checked={status === 'all'} name="product-status" type="radio" onChange={() => setStatus('all')} />
              Tất cả
            </label>
          </ManagementFilterGroup>
        </ManagementFilterSidebar>
      }
      filterVisible={showFilters}
      filterCollapsedControl={
        <button
          aria-label="Mở bộ lọc hàng hóa"
          className="management-filter-expand-button"
          title="Mở bộ lọc"
          type="button"
          onClick={() => setShowFilters(true)}
        >
          <ChevronRight aria-hidden="true" size={16} />
        </button>
      }
    >
      <ManagementListSurface ariaLabel="Danh sách hàng hóa">
        {error ? <p role="alert">{error}</p> : null}
        {state === null && error === null ? <p>Đang tải hàng hóa...</p> : null}

        {createOpen ? (
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
            <button className="button button-primary" disabled={saving} type="submit">
              Thêm hàng hóa
            </button>
          </form>
        ) : null}

        {state ? (
          <>
            <ManagementTableViewport>
              <table aria-label="Danh sách hàng hóa">
                <thead>
                  <tr>
                    <th>Mã hàng</th>
                    <th>Tên hàng</th>
                    <th>Giá nhập cuối</th>
                    <th>Đơn vị</th>
                    <th>Cách bán</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {state.products.map((product) => (
                    <Fragment key={product.id}>
                      <tr
                        aria-expanded={selectedProductId === product.id}
                        className={`management-data-row${selectedProductId === product.id ? ' management-data-row-selected' : ''}`}
                        tabIndex={0}
                        onClick={() => void toggleProductDetail(product)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            void toggleProductDetail(product)
                          }
                        }}
                      >
                        <td>
                          <button
                            className="management-link-button"
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              void toggleProductDetail(product)
                            }}
                          >
                            <strong>{product.code}</strong>
                          </button>
                        </td>
                        <td>{product.name}</td>
                        <td>{formatMoney(product.latest_purchase_cost ?? 0)}</td>
                        <td>{product.unit_name}</td>
                        <td>{sellMethodLabels[product.sell_method]}</td>
                        <td>{product.status === 'active' ? 'Đang bán' : 'Ngưng bán'}</td>
                        <td>
                          <button
                            disabled={saving}
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              void toggleProductStatus(product)
                            }}
                          >
                            {product.status === 'active' ? 'Ngưng bán' : 'Mở bán'}
                          </button>
                        </td>
                      </tr>
                      {selectedProductId === product.id ? (
                        <ManagementDetailRow colSpan={7} label={`Chi tiết hàng hóa ${product.code}`}>
                          <dl>
                            <div>
                              <dt>Mã hàng</dt>
                              <dd>{product.code}</dd>
                            </div>
                            <div>
                              <dt>Tên hàng</dt>
                              <dd>{product.name}</dd>
                            </div>
                            <div>
                              <dt>Đơn vị</dt>
                              <dd>{product.unit_name}</dd>
                            </div>
                            <div>
                              <dt>Cách bán</dt>
                              <dd>{sellMethodLabels[product.sell_method]}</dd>
                            </div>
                            <div>
                              <dt>Giá nhập cuối</dt>
                              <dd>{formatMoney(product.latest_purchase_cost ?? 0)}</dd>
                            </div>
                            <div>
                              <dt>Trạng thái</dt>
                              <dd>{product.status === 'active' ? 'Đang bán' : 'Ngưng bán'}</dd>
                            </div>
                          </dl>
                          <section aria-label={`BOM ${product.code}`} className="catalog-bom-panel">
                            <header>
                              <h3>BOM vật tư</h3>
                              {bomByProductId[product.id] ? <span>Version {bomByProductId[product.id]?.version}</span> : <span>Chưa có BOM</span>}
                            </header>
                            {(bomForms[product.id] ?? [{ component_product_id: '', quantity: '1', notes: '' }]).map((line, index) => (
                              <div className="catalog-bom-line" key={`${product.id}-${index}`}>
                                <label>
                                  Vật tư
                                  <select
                                    value={line.component_product_id}
                                    onChange={(event) => {
                                      const next = [...(bomForms[product.id] ?? [])]
                                      next[index] = { ...line, component_product_id: event.target.value }
                                      setBomForms((current) => ({ ...current, [product.id]: next }))
                                    }}
                                  >
                                    <option value="">Chọn vật tư</option>
                                    {componentProducts.map((component) => (
                                      <option key={component.id} value={component.id}>
                                        {component.code} · {component.name}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                                <label>
                                  Định mức
                                  <input
                                    min="0.001"
                                    step="0.001"
                                    type="number"
                                    value={line.quantity}
                                    onChange={(event) => {
                                      const next = [...(bomForms[product.id] ?? [])]
                                      next[index] = { ...line, quantity: event.target.value }
                                      setBomForms((current) => ({ ...current, [product.id]: next }))
                                    }}
                                  />
                                </label>
                                <label>
                                  Ghi chú
                                  <input
                                    value={line.notes}
                                    onChange={(event) => {
                                      const next = [...(bomForms[product.id] ?? [])]
                                      next[index] = { ...line, notes: event.target.value }
                                      setBomForms((current) => ({ ...current, [product.id]: next }))
                                    }}
                                  />
                                </label>
                              </div>
                            ))}
                            <div className="catalog-bom-actions">
                              <button
                                className="button button-secondary"
                                type="button"
                                onClick={() => {
                                  setBomForms((current) => ({
                                    ...current,
                                    [product.id]: [
                                      ...(current[product.id] ?? []),
                                      { component_product_id: '', quantity: '1', notes: '' },
                                    ],
                                  }))
                                }}
                              >
                                Thêm vật tư
                              </button>
                              <button className="button button-primary" disabled={saving} type="button" onClick={() => void saveBom(product)}>
                                Lưu BOM
                              </button>
                            </div>
                          </section>
                        </ManagementDetailRow>
                      ) : null}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </ManagementTableViewport>
            <ManagementTableFooter
              ariaLabel="Phân trang hàng hóa"
              canGoNext={canGoNext}
              canGoPrevious={canGoPrevious}
              entityLabel="hàng hóa"
              page={page}
              pageSize={pageSize}
              total={state.total}
              onFirst={() => void goToPage(1)}
              onLast={() => void goToPage(totalPages)}
              onNext={() => void goToPage(page + 1)}
              onPageSizeChange={(nextPageSize) => void load({ page: 1, page_size: nextPageSize })}
              onPrevious={() => void goToPage(page - 1)}
            />
          </>
        ) : null}
      </ManagementListSurface>
    </ManagementPage>
  )
}
