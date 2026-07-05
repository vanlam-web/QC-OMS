import { Fragment, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, ExternalLink, RotateCcw, Search } from 'lucide-react'
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
import { EmptyState, MetricCard, MetricGrid, MoneyText, StatusChip } from '../../components/ui-shell/primitives'
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
  onCreateSalesDocument,
  onOpenQuoteInPos,
  onOpenQuotePrint,
}: {
  service: SalesDocumentService
  orderService?: Pick<OrderService, 'getQuoteReopenPayload'>
  onCreateSalesDocument?: () => void
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
  const [loadingDocumentId, setLoadingDocumentId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [detailErrorDocumentId, setDetailErrorDocumentId] = useState<string | null>(null)
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

  async function openQuoteInPos(document: SalesDocumentListItem) {
    if (orderService === undefined || onOpenQuoteInPos === undefined) return
    setDetailError(null)
    setDetailErrorDocumentId(null)
    setOpeningQuoteId(document.id)
    try {
      const payload = await orderService.getQuoteReopenPayload(document.id)
      onOpenQuoteInPos(payload)
    } catch (cause) {
      setSelected(null)
      setDetailError(formatApiError(cause, 'Không mở được báo giá tại POS.'))
      setDetailErrorDocumentId(document.id)
    } finally {
      setOpeningQuoteId(null)
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
    setLoadingDocumentId(null)
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
    setLoadingDocumentId(null)
    setDetailError(null)
    setDetailErrorDocumentId(null)
    await loadDocuments({ search: '', type: 'all', status: 'all', page: 1 })
  }

  async function applyTypeFilter(nextType: typeof typeFilter) {
    setTypeFilter(nextType)
    setSelected(null)
    setLoadingDocumentId(null)
    setDetailError(null)
    setDetailErrorDocumentId(null)
    await loadDocuments({ type: nextType, page: 1 })
  }

  async function applyStatusFilter(nextStatus: typeof statusFilter) {
    setStatusFilter(nextStatus)
    setSelected(null)
    setLoadingDocumentId(null)
    setDetailError(null)
    setDetailErrorDocumentId(null)
    await loadDocuments({ status: nextStatus, page: 1 })
  }

  async function goToPage(nextPage: number) {
    setSelected(null)
    setLoadingDocumentId(null)
    setDetailError(null)
    setDetailErrorDocumentId(null)
    await loadDocuments({ page: nextPage })
  }

  async function openDocument(document: SalesDocumentListItem) {
    if (selected?.id === document.id) {
      setSelected(null)
      setLoadingDocumentId(null)
      setDetailError(null)
      setDetailErrorDocumentId(null)
      return
    }

    setDetailError(null)
    setDetailErrorDocumentId(null)
    setSelected(null)
    setLoadingDocumentId(document.id)
    try {
      setSelected(await service.getSalesDocument(document.id))
    } catch (cause) {
      setDetailError(formatApiError(cause, 'Không tải được chi tiết chứng từ.'))
      setDetailErrorDocumentId(document.id)
    } finally {
      setLoadingDocumentId(null)
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
  const documentTotalAmount = documents.reduce((sum, document) => sum + document.total_amount, 0)
  const documentDebtAmount = documents.reduce((sum, document) => sum + document.debt_amount, 0)
  const documentKpis = (
    <MetricGrid ariaLabel="Tổng quan chứng từ bán hàng">
      <MetricCard hint="Từ danh sách đang xem" label="Tổng tiền" tone="success" value={<MoneyText value={documentTotalAmount} />} />
      <MetricCard hint="Từ danh sách đang xem" label="Còn nợ" tone={documentDebtAmount > 0 ? 'warning' : 'neutral'} value={<MoneyText value={documentDebtAmount} />} />
    </MetricGrid>
  )

  return (
    <ManagementPage
      title="Chứng từ bán hàng"
      actions={
        <ManagementCompactToolbar ariaLabel="Lọc chứng từ bán hàng" onSubmit={searchDocuments}>
          <ManagementCompactSearch
            label="Tìm chứng từ"
            leadingIcon={<Search aria-hidden="true" size={16} />}
            placeholder="Mã chứng từ, khách hàng, ghi chú"
            trailingAction={
              onCreateSalesDocument ? (
                <ManagementCompactCreateAction ariaLabel="Tạo chứng từ bán hàng" onClick={onCreateSalesDocument} />
              ) : undefined
            }
            value={search}
            onChange={setSearch}
          />
        </ManagementCompactToolbar>
      }
      kpis={documentKpis}
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
                      <th>Mã hóa đơn</th>
                      <th>Thời gian</th>
                      <th>Khách hàng</th>
                      <th>Tổng tiền hàng</th>
                      <th>Giảm giá</th>
                      <th>Tổng sau giảm</th>
                      <th>Khách đã trả</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((document) => (
                      <Fragment key={document.id}>
                        <tr
                          aria-expanded={selected?.id === document.id}
                          className={`management-data-row${selected?.id === document.id ? ' management-data-row-selected' : ''}`}
                          tabIndex={0}
                          onClick={() => void openDocument(document)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              void openDocument(document)
                            }
                          }}
                        >
                          <td>
                            <strong>{document.code}</strong>
                          </td>
                          <td>{dateTime(document.created_at)}</td>
                          <td>{document.customer.name}</td>
                          <td><MoneyText value={document.subtotal_amount} /></td>
                          <td><MoneyText value={document.discount_amount} /></td>
                          <td><MoneyText value={document.total_amount} /></td>
                          <td><MoneyText value={document.paid_amount} /></td>
                        </tr>
                        {selected?.id === document.id || detailErrorDocumentId === document.id || loadingDocumentId === document.id ? (
                          <ManagementDetailRow colSpan={7} label={`Chi tiết chứng từ ${document.code}`}>
                            {document.order_type === 'quote' && document.status === 'active' && orderService && onOpenQuoteInPos ? (
                              <div className="row-actions">
                                <button
                                  className="button button-secondary"
                                  disabled={openingQuoteId === document.id}
                                  type="button"
                                  onClick={() => void openQuoteInPos(document)}
                                >
                                  <ExternalLink aria-hidden="true" size={15} />
                                  Mở tại POS
                                </button>
                              </div>
                            ) : null}
                            <SalesDocumentDetailView document={selected} error={detailError} loading={loadingDocumentId === document.id} onOpenQuotePrint={onOpenQuotePrint} />
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
  loading,
  onOpenQuotePrint,
}: {
  document: SalesDocumentDetail | null
  error: string | null
  loading: boolean
  onOpenQuotePrint?: (documentId: string) => void
}) {
  const [activeTab, setActiveTab] = useState<'info' | 'payment-history'>('info')

  if (error) return <p role="alert">{error}</p>
  if (loading || !document) return <p>Đang tải chi tiết...</p>

  return (
    <div className="sales-document-detail">
      <div className="inline-detail-tabbar">
        <div aria-label="Chi tiết chứng từ" className="inline-detail-tabs" role="tablist">
          <button
            aria-selected={activeTab === 'info'}
            role="tab"
            type="button"
            onClick={() => setActiveTab('info')}
          >
            Thông tin
          </button>
          <button
            aria-selected={activeTab === 'payment-history'}
            role="tab"
            type="button"
            onClick={() => setActiveTab('payment-history')}
          >
            Lịch sử thanh toán
          </button>
        </div>
      </div>
      {activeTab === 'info' ? (
        <section aria-label="Thông tin chứng từ" role="tabpanel">
          <header className="sales-document-detail-header">
            <h2>{document.customer.name}</h2>
            <span>{document.code}</span>
            <StatusChip tone={document.status === 'cancelled' ? 'danger' : document.status === 'completed' ? 'success' : 'info'}>
              {salesDocumentStatusLabel(document)}
            </StatusChip>
            {document.order_type === 'quote' && document.code.startsWith('BG') && onOpenQuotePrint ? (
              <button type="button" onClick={() => onOpenQuotePrint(document.id)}>
                Xem/In báo giá
              </button>
            ) : null}
          </header>

          <dl className="sales-document-meta-grid">
            <div>
              <dt>Người bán:</dt>
              <dd>{document.seller.name}</dd>
            </div>
            <div>
              <dt>Ngày bán:</dt>
              <dd>{dateTime(document.created_at)}</dd>
            </div>
            {document.price_list ? (
              <div>
                <dt>Bảng giá:</dt>
                <dd>{document.price_list.name}</dd>
              </div>
            ) : null}
          </dl>

          <table aria-label="Dòng hàng" className="sales-document-lines-table">
            <thead>
              <tr>
                <th>Mã hàng</th>
                <th>Tên hàng</th>
                <th>Số lượng</th>
                <th>Đơn giá</th>
                <th>Giảm giá</th>
                <th>Giá bán</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {document.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.product.code}</td>
                  <td>
                    <span>{item.product.name}</span>
                    {item.note ? <small>{item.note}</small> : null}
                  </td>
                  <td>{`${item.quantity} ${item.product.unit_name}`}</td>
                  <td><MoneyText value={item.unit_price} /></td>
                  <td><MoneyText value={item.discount_amount} /></td>
                  <td><MoneyText value={lineSellPrice(item)} /></td>
                  <td><MoneyText value={item.line_total} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="sales-document-detail-lower sales-document-detail-lower-right">
            {document.note ? <p className="sales-document-note">{document.note}</p> : null}
            <dl className="sales-document-summary-box sales-document-summary-box-right">
              <div>
                <dt>{`Tổng tiền hàng (${document.items.length})`}</dt>
                <dd><MoneyText value={document.subtotal_amount} /></dd>
              </div>
              <div>
                <dt>Giảm giá hóa đơn</dt>
                <dd><MoneyText value={document.discount_amount} /></dd>
              </div>
              <div>
                <dt>Khách cần trả</dt>
                <dd><MoneyText value={document.total_amount} /></dd>
              </div>
              <div>
                <dt>Khách đã trả</dt>
                <dd><MoneyText value={document.paid_amount} /></dd>
              </div>
              {document.debt_amount > 0 ? (
                <div>
                  <dt>Công nợ</dt>
                  <dd><MoneyText value={document.debt_amount} /></dd>
                </div>
              ) : null}
            </dl>
          </div>
        </section>
      ) : (
        <section aria-label="Lịch sử thanh toán" role="tabpanel">
          <table aria-label="Lịch sử thanh toán" className="sales-document-payment-history-table">
            <thead>
              <tr>
                <th>Mã phiếu</th>
                <th>Thời gian</th>
                <th>Người tạo</th>
                <th>Giá trị phiếu</th>
                <th>Phương thức</th>
                <th>Trạng thái</th>
                <th>Tiền thu/chi</th>
              </tr>
            </thead>
            <tbody />
          </table>
        </section>
      )}
    </div>
  )
}

function lineSellPrice(item: SalesDocumentDetail['items'][number]) {
  if (item.quantity <= 0) return item.line_total
  return Math.round(item.line_total / item.quantity)
}

function salesDocumentStatusLabel(document: SalesDocumentDetail) {
  if (document.status === 'cancelled') return 'Đã hủy'
  if (document.order_type === 'quote') return document.status === 'converted' ? 'Đã chuyển' : 'Đang hiệu lực'
  return 'Hoàn tất'
}

function documentTypeFilterLabel(value: 'invoice' | 'quote') {
  return value === 'invoice' ? 'Hóa đơn' : 'Báo giá'
}

function lifecycleFilterLabel(value: 'active' | 'completed' | 'cancelled') {
  if (value === 'active') return 'Đang hiệu lực'
  if (value === 'completed') return 'Hoàn tất'
  return 'Đã hủy'
}
