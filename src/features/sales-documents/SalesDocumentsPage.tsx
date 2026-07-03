import { Fragment, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, ExternalLink, Eye, RotateCcw, Search } from 'lucide-react'
import {
  ManagementCompactSearch,
  ManagementCompactToolbar,
  ManagementDetailRow,
  ManagementFilterGroup,
  ManagementFilterSidebar,
  ManagementListSurface,
  ManagementPage,
  ManagementRowActionButton,
  ManagementTableFooter,
  ManagementTableViewport,
} from '../../components/ui-shell/management-layout'
import { EmptyState, MoneyText, StatusChip } from '../../components/ui-shell/primitives'
import { formatApiError } from '../../lib/api/error-message'
import type { SalesDocumentDetail, SalesDocumentListItem } from './types'
import type { SalesDocumentService } from './sales-document-service'
import type { OrderService, QuoteReopenPayload } from '../orders/order-service'

function dateTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(value))
}

const salesDocumentsPageSize = 15

interface SalesDocumentsState {
  items: SalesDocumentListItem[]
  total: number
  page: number
  pageSize: number
}

export function SalesDocumentsPage({
  service,
  orderService,
  onOpenDashboard,
  onOpenQuoteInPos,
  onOpenQuotePrint,
}: {
  service: SalesDocumentService
  orderService?: Pick<OrderService, 'getQuoteReopenPayload'>
  onOpenDashboard: () => void
  onOpenQuoteInPos?: (payload: QuoteReopenPayload) => void
  onOpenQuotePrint?: (documentId: string) => void
}) {
  const [state, setState] = useState<SalesDocumentsState | null>(null)
  const [search, setSearch] = useState('')
  const [lastSearch, setLastSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'invoice' | 'quote'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all')
  const [showFilters, setShowFilters] = useState(true)
  const [selected, setSelected] = useState<SalesDocumentDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [detailErrorDocumentId, setDetailErrorDocumentId] = useState<string | null>(null)
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null)
  const [openingQuoteId, setOpeningQuoteId] = useState<string | null>(null)

  async function loadDocuments(input: {
    search?: string
    type?: typeof typeFilter
    status?: typeof statusFilter
    page?: number
  } = {}) {
    const nextSearch = input.search ?? lastSearch
    const nextType = input.type ?? typeFilter
    const nextStatus = input.status ?? statusFilter
    const nextPage = input.page ?? state?.page ?? 1
    setError(null)
    try {
      const result = await service.listSalesDocuments({
        ...(nextSearch ? { search: nextSearch } : {}),
        ...(nextType === 'all' ? {} : { type: nextType }),
        ...(nextStatus === 'all' ? {} : { status: nextStatus }),
        page: nextPage,
        page_size: salesDocumentsPageSize,
      })
      setState({ items: result.items, total: result.total, page: result.page, pageSize: result.page_size })
      if (result.items.length === 0) setSelected(null)
    } catch (cause) {
      setError(formatApiError(cause, 'Không tải được chứng từ bán hàng.'))
    }
  }

  useEffect(() => {
    let active = true

    async function loadInitialDocuments() {
      setError(null)
      try {
        const result = await service.listSalesDocuments({ page: 1, page_size: salesDocumentsPageSize })
        if (!active) return
        setState({ items: result.items, total: result.total, page: result.page, pageSize: result.page_size })
      } catch (cause) {
        if (active) setError(formatApiError(cause, 'Không tải được chứng từ bán hàng.'))
      }
    }

    void loadInitialDocuments()

    return () => {
      active = false
    }
  }, [service])

  async function searchDocuments(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = search.trim()
    setSelected(null)
    setDetailError(null)
    setDetailErrorDocumentId(null)
    setLastSearch(trimmed)
    await loadDocuments({ search: trimmed, page: 1 })
  }

  async function resetFilters() {
    setSearch('')
    setLastSearch('')
    setTypeFilter('all')
    setStatusFilter('all')
    setSelected(null)
    setDetailError(null)
    setDetailErrorDocumentId(null)
    await loadDocuments({ search: '', type: 'all', status: 'all', page: 1 })
  }

  async function applyTypeFilter(nextType: typeof typeFilter) {
    setTypeFilter(nextType)
    setSelected(null)
    setDetailError(null)
    setDetailErrorDocumentId(null)
    await loadDocuments({ type: nextType, page: 1 })
  }

  async function applyStatusFilter(nextStatus: typeof statusFilter) {
    setStatusFilter(nextStatus)
    setSelected(null)
    setDetailError(null)
    setDetailErrorDocumentId(null)
    await loadDocuments({ status: nextStatus, page: 1 })
  }

  async function goToPage(nextPage: number) {
    setSelected(null)
    setDetailError(null)
    setDetailErrorDocumentId(null)
    await loadDocuments({ page: nextPage })
  }

  async function openDocument(document: SalesDocumentListItem) {
    if (selected?.id === document.id) {
      setSelected(null)
      setDetailError(null)
      setDetailErrorDocumentId(null)
      return
    }

    setDetailError(null)
    setDetailErrorDocumentId(null)
    setLoadingDetailId(document.id)
    try {
      setSelected(await service.getSalesDocument(document.id))
    } catch (cause) {
      setDetailError(formatApiError(cause, 'Không tải được chi tiết chứng từ.'))
      setDetailErrorDocumentId(document.id)
    } finally {
      setLoadingDetailId(null)
    }
  }

  async function openQuoteInPos(document: SalesDocumentListItem) {
    if (orderService === undefined || onOpenQuoteInPos === undefined) return
    setDetailError(null)
    setOpeningQuoteId(document.id)
    try {
      const payload = await orderService.getQuoteReopenPayload(document.id)
      onOpenQuoteInPos(payload)
    } catch (cause) {
      setDetailError(formatApiError(cause, 'Không mở được báo giá tại POS.'))
    } finally {
      setOpeningQuoteId(null)
    }
  }

  const documents = state?.items ?? []
  const total = state?.total ?? 0
  const page = state?.page ?? 1
  const pageSize = state?.pageSize ?? salesDocumentsPageSize
  const hasFilter = lastSearch.length > 0 || typeFilter !== 'all' || statusFilter !== 'all'
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const canGoPrevious = page > 1
  const canGoNext = page < totalPages
  const activeFilterSummary = [
    ...(lastSearch ? [`Tìm: ${lastSearch}`] : []),
    ...(typeFilter !== 'all' ? [`Loại: ${documentTypeFilterLabel(typeFilter)}`] : []),
    ...(statusFilter !== 'all' ? [`Trạng thái: ${lifecycleFilterLabel(statusFilter)}`] : []),
  ].join(' • ')

  return (
    <ManagementPage
      title="Chứng từ bán hàng"
      actions={
        <ManagementCompactToolbar ariaLabel="Lọc chứng từ bán hàng" onSubmit={searchDocuments}>
          <ManagementCompactSearch
            label="Tìm chứng từ"
            leadingIcon={<Search aria-hidden="true" size={16} />}
            placeholder="Mã chứng từ, khách hàng, ghi chú"
            value={search}
            onChange={setSearch}
          />
          <button aria-label="Lọc" className="management-action-icon button button-secondary" title="Lọc" type="submit">
            <Search aria-hidden="true" size={16} />
          </button>
          <button className="button button-secondary" type="button" onClick={onOpenDashboard}>
            Trang chủ
          </button>
        </ManagementCompactToolbar>
      }
      filter={
        <ManagementFilterSidebar
          activeSummary={activeFilterSummary || undefined}
          ariaLabel="Bộ lọc chứng từ bán hàng"
          title="Bộ lọc"
          actions={
            <button className="button button-secondary" type="button" onClick={() => void resetFilters()}>
              <RotateCcw aria-hidden="true" size={15} />
              Đặt lại bộ lọc
            </button>
          }
        >
          <button
            aria-label="Ẩn bộ lọc chứng từ bán hàng"
            className="management-filter-collapse-button"
            title="Ẩn bộ lọc"
            type="button"
            onClick={() => setShowFilters(false)}
          >
            <ChevronLeft aria-hidden="true" size={16} />
          </button>
          <ManagementFilterGroup title="Loại chứng từ">
            <label>
              <input checked={typeFilter === 'all'} name="sales-document-type" type="radio" onChange={() => void applyTypeFilter('all')} />
              Tất cả
            </label>
            <label>
              <input checked={typeFilter === 'invoice'} name="sales-document-type" type="radio" onChange={() => void applyTypeFilter('invoice')} />
              Hóa đơn
            </label>
            <label>
              <input checked={typeFilter === 'quote'} name="sales-document-type" type="radio" onChange={() => void applyTypeFilter('quote')} />
              Báo giá
            </label>
          </ManagementFilterGroup>
          <ManagementFilterGroup title="Trạng thái">
            <label>
              <input checked={statusFilter === 'all'} name="sales-document-status" type="radio" onChange={() => void applyStatusFilter('all')} />
              Tất cả
            </label>
            <label>
              <input checked={statusFilter === 'active'} name="sales-document-status" type="radio" onChange={() => void applyStatusFilter('active')} />
              Đang hiệu lực
            </label>
            <label>
              <input checked={statusFilter === 'completed'} name="sales-document-status" type="radio" onChange={() => void applyStatusFilter('completed')} />
              Hoàn tất
            </label>
            <label>
              <input checked={statusFilter === 'cancelled'} name="sales-document-status" type="radio" onChange={() => void applyStatusFilter('cancelled')} />
              Đã hủy
            </label>
          </ManagementFilterGroup>
        </ManagementFilterSidebar>
      }
      filterVisible={showFilters}
      filterCollapsedControl={
        <button
          aria-label="Mở bộ lọc chứng từ bán hàng"
          className="management-filter-expand-button"
          title="Mở bộ lọc"
          type="button"
          onClick={() => setShowFilters(true)}
        >
          <ChevronRight aria-hidden="true" size={16} />
        </button>
      }
    >
      <ManagementListSurface ariaLabel="Danh sách chứng từ bán hàng">
        {error ? <p role="alert">{error}</p> : null}

        {state === null && error === null ? <p>Đang tải chứng từ...</p> : null}

        {state ? (
          <>
            {documents.length === 0 ? (
              <EmptyState>
                <p>{hasFilter ? 'Không thấy chứng từ theo bộ lọc hiện tại.' : 'Chưa có chứng từ phù hợp bộ lọc.'}</p>
                {hasFilter ? <p>Hãy thử mở rộng thời gian hoặc bỏ bớt bộ lọc.</p> : null}
              </EmptyState>
            ) : (
              <ManagementTableViewport>
                <table aria-label="Danh sách chứng từ bán hàng" className="sales-documents-management-table">
                  <thead>
                    <tr>
                      <th>Loại/Mã</th>
                      <th>Thời gian</th>
                      <th>Mã KH</th>
                      <th>Khách hàng</th>
                      <th>Người bán</th>
                      <th>Tổng</th>
                      <th>Khách đã trả</th>
                      <th>Còn nợ</th>
                      <th>Thanh toán</th>
                      <th>Trạng thái</th>
                      <th>Mở</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((document) => (
                      <Fragment key={document.id}>
                        <tr className={selected?.id === document.id ? 'management-data-row-selected' : undefined}>
                          <td>
                            <strong>{document.code}</strong>
                            <br />
                            <StatusChip tone={document.order_type === 'invoice' ? 'info' : 'neutral'}>
                              {document.order_type === 'invoice' ? 'Hóa đơn' : 'Báo giá'}
                            </StatusChip>
                          </td>
                          <td>{dateTime(document.created_at)}</td>
                          <td>{document.customer.code ?? '-'}</td>
                          <td>{document.customer.name}</td>
                          <td>{document.seller.name}</td>
                          <td><MoneyText value={document.total_amount} /></td>
                          <td><MoneyText value={document.paid_amount} /></td>
                          <td>{document.debt_amount > 0 ? <MoneyText value={document.debt_amount} /> : '-'}</td>
                          <td>{paymentStatusLabel(document)}</td>
                          <td>
                            <StatusChip tone={lifecycleStatusTone(document)}>
                              {lifecycleStatusLabel(document)}
                            </StatusChip>
                          </td>
                          <td>
                            <div className="row-actions">
                              <ManagementRowActionButton
                                ariaLabel={selected?.id === document.id ? `Đóng chi tiết ${document.code}` : `Mở chi tiết ${document.code}`}
                                disabled={loadingDetailId === document.id}
                                onClick={() => void openDocument(document)}
                              >
                                <Eye aria-hidden="true" size={15} />
                              </ManagementRowActionButton>
                              {document.order_type === 'quote' && document.status === 'active' && orderService && onOpenQuoteInPos ? (
                                <ManagementRowActionButton
                                  ariaLabel={`Mở tại POS ${document.code}`}
                                  disabled={openingQuoteId === document.id}
                                  onClick={() => void openQuoteInPos(document)}
                                >
                                  <ExternalLink aria-hidden="true" size={15} />
                                </ManagementRowActionButton>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                        {selected?.id === document.id || detailErrorDocumentId === document.id ? (
                          <ManagementDetailRow colSpan={11} label={`Chi tiết chứng từ ${document.code}`}>
                            <SalesDocumentDetailView document={selected} error={detailError} onOpenQuotePrint={onOpenQuotePrint} />
                          </ManagementDetailRow>
                        ) : null}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </ManagementTableViewport>
            )}
            <ManagementTableFooter
              ariaLabel="Phân trang chứng từ"
              canGoNext={canGoNext}
              canGoPrevious={canGoPrevious}
              entityLabel="chứng từ"
              page={page}
              pageSize={pageSize}
              total={total}
              onNext={() => void goToPage(page + 1)}
              onPrevious={() => void goToPage(page - 1)}
            />
          </>
        ) : null}
      </ManagementListSurface>
    </ManagementPage>
  )
}

function SalesDocumentDetailView({
  document,
  error,
  onOpenQuotePrint,
}: {
  document: SalesDocumentDetail | null
  error: string | null
  onOpenQuotePrint?: (documentId: string) => void
}) {
  if (error) return <p role="alert">{error}</p>
  if (!document) return null

  return (
    <div className="sales-document-detail">
      <header>
        <h2>{document.code}</h2>
        <p>{document.customer.name}</p>
        {document.order_type === 'quote' && document.code.startsWith('BG') && onOpenQuotePrint ? (
          <button type="button" onClick={() => onOpenQuotePrint(document.id)}>
            Xem/In báo giá
          </button>
        ) : null}
      </header>
      <dl className="sales-document-summary">
        <div>
          <dt>Bảng giá</dt>
          <dd>{document.price_list?.name ?? 'Không ghi nhận'}</dd>
        </div>
        <div>
          <dt>Tiền hàng</dt>
          <dd><MoneyText value={document.subtotal_amount} /></dd>
        </div>
        <div>
          <dt>Giảm giá</dt>
          <dd>Giảm giá <MoneyText value={document.discount_amount} /></dd>
        </div>
        <div>
          <dt>Khách cần trả</dt>
          <dd><MoneyText value={document.total_amount} /></dd>
        </div>
        <div>
          <dt>Khách đã trả</dt>
          <dd>Khách đã trả <MoneyText value={document.paid_amount} /></dd>
        </div>
        <div>
          <dt>Công nợ</dt>
          <dd>Công nợ hóa đơn <MoneyText value={document.debt_amount} /></dd>
        </div>
      </dl>

      <section aria-label="Dòng hàng">
        <h3>Dòng hàng</h3>
        {document.items.map((item) => (
          <article className="sales-document-line" key={item.id}>
            <strong>
              {item.product.code} - {item.product.name}
            </strong>
            <p>
              {item.quantity} {item.product.unit_name} x <MoneyText value={item.unit_price} /> = <MoneyText value={item.line_total} />
            </p>
            {item.note ? <p>{item.note}</p> : null}
          </article>
        ))}
      </section>

      <section aria-label="Sổ kho">
        <h3>Sổ kho</h3>
        {document.stock_movements.length === 0 ? (
          <p>Không có bút toán kho.</p>
        ) : (
          <ul>
            {document.stock_movements.map((movement) => {
              const matchingItem = document.items.find((item) => item.product.id === movement.product_id)
              const unitName = movement.unit_name ?? matchingItem?.product.unit_name ?? ''
              return (
                <li key={movement.id}>
                  {movement.movement_type} {movement.quantity_delta} {unitName}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

function documentTypeFilterLabel(value: 'invoice' | 'quote') {
  return value === 'invoice' ? 'Hóa đơn' : 'Báo giá'
}

function lifecycleFilterLabel(value: 'active' | 'completed' | 'cancelled') {
  if (value === 'active') return 'Đang hiệu lực'
  if (value === 'completed') return 'Hoàn tất'
  return 'Đã hủy'
}

function lifecycleStatusLabel(document: SalesDocumentListItem) {
  if (document.status === 'cancelled') return 'Đã hủy'
  if (document.order_type === 'quote') return document.status === 'converted' ? 'Đã chuyển' : 'Đang hiệu lực'
  return 'Hoàn tất'
}

function lifecycleStatusTone(document: SalesDocumentListItem) {
  if (document.status === 'cancelled') return 'danger'
  if (document.order_type === 'quote') return document.status === 'active' ? 'info' : 'neutral'
  return 'success'
}

function paymentStatusLabel(document: SalesDocumentListItem) {
  if (document.payment_status === 'not_applicable') return 'Không áp dụng'
  if (document.payment_status === 'paid' || document.debt_amount === 0) return 'Đã thanh toán'
  if (document.payment_status === 'partial') return 'Nợ 1 phần'
  return 'Nợ'
}
