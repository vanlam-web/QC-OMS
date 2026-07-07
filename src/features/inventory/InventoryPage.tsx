import { useEffect, useState } from 'react'
import { ChevronRight, Search } from 'lucide-react'
import { formatApiError } from '../../lib/api/error-message'
import { EmptyState, MetricCard, MetricGrid, StatusChip } from '../../components/ui-shell/primitives'
import {
  ManagementCompactSearch,
  ManagementCompactToolbar,
  ManagementFilterGroup,
  ManagementFilterSidebar,
  ManagementListSurface,
  ManagementPage,
  ManagementRowActionButton,
  ManagementTableFooter,
  ManagementTableViewport,
} from '../../components/ui-shell/management-layout'
import type { InventoryProduct, InventoryProductStatus, InventoryShape, StockMovement, Stocktake } from './types'
import type { InventoryService } from './inventory-service'

const pageSizeDefault = 15

function shapeText(shape: InventoryShape | 'all') {
  if (shape === 'normal') return 'Hàng thường'
  if (shape === 'roll') return 'Hàng cuộn'
  if (shape === 'sheet') return 'Hàng tấm'
  return 'Tất cả'
}

function statusText(status: InventoryProductStatus | 'all') {
  if (status === 'active') return 'Đang kinh doanh'
  if (status === 'inactive') return 'Ngưng bán'
  return 'Tất cả'
}

function stocktakeStatusText(status: Stocktake['status']) {
  if (status === 'balanced') return 'Đã cân bằng'
  if (status === 'draft') return 'Nháp'
  return 'Đã hủy'
}

function numberText(value: number) {
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 3 }).format(value)
}

function dateText(value: string | null) {
  if (value === null) return 'Chưa có'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Chưa có'
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(parsed)
}

export function InventoryPage({ service }: { service: InventoryService }) {
  const [products, setProducts] = useState<InventoryProduct[] | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(pageSizeDefault)
  const [search, setSearch] = useState('')
  const [lastSearch, setLastSearch] = useState('')
  const [status, setStatus] = useState<InventoryProductStatus | 'all'>('active')
  const [shape, setShape] = useState<InventoryShape | 'all'>('all')
  const [detail, setDetail] = useState<InventoryProduct | null>(null)
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [stocktakes, setStocktakes] = useState<Stocktake[]>([])
  const [actualQty, setActualQty] = useState('')
  const [reason, setReason] = useState('')
  const [adjusting, setAdjusting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const negativeCount = products?.filter((product) => product.is_negative).length ?? 0
  const totalQty = products?.reduce((sum, product) => sum + product.available_qty, 0) ?? 0

  async function loadProducts(input: {
    search?: string
    status?: InventoryProductStatus | 'all'
    shape?: InventoryShape | 'all'
    page?: number
    page_size?: number
  } = {}) {
    const nextSearch = input.search ?? lastSearch
    const nextStatus = input.status ?? status
    const nextShape = input.shape ?? shape
    const nextPage = input.page ?? page
    const nextPageSize = input.page_size ?? pageSize
    setError(null)
    try {
      const result = await service.listInventoryProducts({
        search: nextSearch.trim() || undefined,
        status: nextStatus,
        inventory_shape: nextShape === 'all' ? undefined : nextShape,
        page: nextPage,
        page_size: nextPageSize,
      })
      setProducts(result.items)
      setTotal(result.total)
      setPage(result.page)
      setPageSize(result.page_size)
      setLastSearch(nextSearch.trim())
    } catch (cause) {
      setError(formatApiError(cause, 'Không tải được tồn kho.'))
    }
  }

  useEffect(() => {
    let active = true
    async function loadInitial() {
      try {
        const result = await service.listInventoryProducts({ status: 'active', page: 1, page_size: pageSizeDefault })
        if (!active) return
        setProducts(result.items)
        setTotal(result.total)
        setPage(result.page)
        setPageSize(result.page_size)
      } catch (cause) {
        if (active) setError(formatApiError(cause, 'Không tải được tồn kho.'))
      }
    }
    void loadInitial()
    return () => {
      active = false
    }
  }, [service])

  async function filterProducts(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await applyFilters()
  }

  async function applyFilters() {
    setPage(1)
    await loadProducts({ search, status, shape, page: 1 })
  }

  async function openProduct(product: InventoryProduct) {
    setError(null)
    try {
      const [productDetail, movementResult, stocktakeResult] = await Promise.all([
        service.getInventoryProduct(product.product_id),
        service.listStockMovements({ product_id: product.product_id, page: 1, page_size: 10 }),
        service.listStocktakes({ page: 1, page_size: 10 }),
      ])
      setDetail(productDetail)
      setMovements(movementResult.items)
      setStocktakes(stocktakeResult.items)
      setActualQty(String(productDetail.available_qty))
      setReason('')
    } catch (cause) {
      setError(formatApiError(cause, 'Không tải được chi tiết tồn kho.'))
    }
  }

  async function adjustStock(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (detail === null) return
    setAdjusting(true)
    setError(null)
    try {
      await service.adjustNormalProductStock(detail.product_id, {
        actual_qty: Number(actualQty),
        reason: reason.trim(),
      })
      await loadProducts()
      await openProduct(detail)
    } catch (cause) {
      setError(formatApiError(cause, 'Không cân bằng được tồn kho.'))
    } finally {
      setAdjusting(false)
    }
  }

  return (
    <ManagementPage
      title="Hàng hóa"
      actions={
        <ManagementCompactToolbar ariaLabel="Lọc hàng hóa" onSubmit={filterProducts}>
          <ManagementCompactSearch
            label="Tìm hàng hóa"
            placeholder="Mã hàng, tên hàng"
            value={search}
            leadingIcon={<Search aria-hidden="true" size={16} />}
            onChange={setSearch}
          />
        </ManagementCompactToolbar>
      }
      kpis={
        <MetricGrid ariaLabel="Tổng quan hàng hóa">
          <MetricCard label="Mặt hàng" value={total} hint="Theo bộ lọc hiện tại" tone="info" />
          <MetricCard label="Tồn kho" value={numberText(totalQty)} hint="Cộng các dòng đang xem" tone="neutral" />
          <MetricCard label="Âm kho" value={negativeCount} hint="Cần kiểm tra" tone={negativeCount > 0 ? 'danger' : 'success'} />
        </MetricGrid>
      }
      filter={
        <ManagementFilterSidebar
          ariaLabel="Bộ lọc hàng hóa"
          actions={
            <button className="button button-primary" type="button" onClick={() => void applyFilters()}>Áp dụng bộ lọc</button>
          }
        >
          <ManagementFilterGroup title="Trạng thái hàng hóa">
            <select
              aria-label="Trạng thái hàng hóa"
              className="management-filter-select"
              value={status}
              onChange={(event) => setStatus(event.target.value as InventoryProductStatus | 'all')}
            >
              <option value="active">{statusText('active')}</option>
              <option value="inactive">{statusText('inactive')}</option>
              <option value="all">{statusText('all')}</option>
            </select>
          </ManagementFilterGroup>
          <ManagementFilterGroup title="Loại hàng">
            <select
              aria-label="Loại hàng"
              className="management-filter-select"
              value={shape}
              onChange={(event) => setShape(event.target.value as InventoryShape | 'all')}
            >
              <option value="all">{shapeText('all')}</option>
              <option value="normal">{shapeText('normal')}</option>
              <option value="roll">{shapeText('roll')}</option>
              <option value="sheet">{shapeText('sheet')}</option>
            </select>
          </ManagementFilterGroup>
        </ManagementFilterSidebar>
      }
    >
      <ManagementListSurface ariaLabel="Danh sách hàng hóa">
        {error ? <p role="alert">{error}</p> : null}
        {products === null ? <p>Đang tải hàng hóa...</p> : null}
        {products !== null && products.length === 0 ? <EmptyState>Chưa có hàng hóa theo bộ lọc.</EmptyState> : null}
        {products !== null && products.length > 0 ? (
          <>
            <ManagementTableViewport>
              <table aria-label="Danh sách hàng hóa" className="management-table">
                <thead>
                  <tr>
                    <th>Mã hàng</th>
                    <th>Tên hàng</th>
                    <th>Loại hàng</th>
                    <th>Tồn kho</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.product_id}>
                      <td><strong>{product.code}</strong></td>
                      <td>{product.name}</td>
                      <td>{shapeText(product.inventory_shape)}</td>
                      <td>{numberText(product.available_qty)} {product.stock_unit}</td>
                      <td>
                        {product.is_negative ? <StatusChip tone="danger">Âm kho</StatusChip> : <StatusChip tone="success">Ổn</StatusChip>}
                      </td>
                      <td>
                        <ManagementRowActionButton
                          ariaLabel={`Xem hàng hóa ${product.code}`}
                          onClick={() => void openProduct(product)}
                        >
                          Xem {product.code}
                        </ManagementRowActionButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ManagementTableViewport>
            <ManagementTableFooter
              ariaLabel="Phân trang hàng hóa"
              entityLabel="mặt hàng"
              page={page}
              pageSize={pageSize}
              total={total}
              canGoPrevious={page > 1}
              canGoNext={page * pageSize < total}
              onPageSizeChange={(nextPageSize) => void loadProducts({ page: 1, page_size: nextPageSize })}
              onFirst={() => void loadProducts({ page: 1 })}
              onPrevious={() => void loadProducts({ page: Math.max(1, page - 1) })}
              onNext={() => void loadProducts({ page: page + 1 })}
              onLast={() => void loadProducts({ page: Math.max(1, Math.ceil(total / pageSize)) })}
            />
          </>
        ) : null}
      </ManagementListSurface>

      {detail ? (
        <section aria-label={`Chi tiết hàng hóa ${detail.code}`} className="management-inline-detail">
          <header>
            <div>
              <h2>{detail.name}</h2>
              <p>{detail.code} · {shapeText(detail.inventory_shape)}</p>
            </div>
            <button aria-label="Đóng chi tiết hàng hóa" className="button button-secondary" type="button" onClick={() => setDetail(null)}>
              <ChevronRight aria-hidden="true" size={16} />
              Đóng
            </button>
          </header>
          <dl className="management-detail-list">
            <div>
              <dt>Tồn kho</dt>
              <dd>{numberText(detail.available_qty)} {detail.stock_unit}</dd>
            </div>
            <div>
              <dt>Trạng thái hàng</dt>
              <dd>{statusText(detail.status)}</dd>
            </div>
          </dl>

          {detail.inventory_shape === 'normal' ? (
            <form aria-label="Cân bằng kho" className="management-detail-form" onSubmit={adjustStock}>
              <label>
                Tồn thực tế
                <input
                  aria-label="Tồn thực tế"
                  min="0"
                  step="0.001"
                  type="number"
                  value={actualQty}
                  onChange={(event) => setActualQty(event.target.value)}
                />
              </label>
              <label>
                Lý do điều chỉnh
                <input
                  aria-label="Lý do điều chỉnh"
                  required
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                />
              </label>
              <button className="button button-primary" disabled={adjusting} type="submit">
                Cân bằng kho
              </button>
            </form>
          ) : (
            <p>Điều chỉnh nhanh chỉ áp dụng cho hàng thường.</p>
          )}

          <section aria-label="Lịch sử xuất nhập tồn">
            <h3>Lịch sử xuất nhập tồn</h3>
            {movements.length === 0 ? <p>Chưa có biến động kho.</p> : (
              <ul>
                {movements.map((movement) => (
                  <li key={movement.id}>
                    <span>{movement.movement_type}</span>
                    <strong>{numberText(movement.quantity_delta)}</strong>
                    <small>{dateText(movement.created_at)}</small>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-label="Phiếu kiểm kho gần đây">
            <h3>Phiếu kiểm kho gần đây</h3>
            {stocktakes.length === 0 ? <p>Chưa có phiếu kiểm kho.</p> : (
              <ul>
                {stocktakes.map((item) => (
                  <li key={item.id}>
                    <span>{item.code}</span>
                    <StatusChip tone={item.status === 'balanced' ? 'success' : 'neutral'}>{stocktakeStatusText(item.status)}</StatusChip>
                    <small>{dateText(item.created_at)}</small>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </section>
      ) : null}
    </ManagementPage>
  )
}
