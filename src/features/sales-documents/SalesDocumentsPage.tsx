import { Fragment, useEffect, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, ExternalLink, RotateCcw, Search } from 'lucide-react'
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
type TimeFilter = 'all' | 'today' | 'yesterday' | 'week' | 'last_week' | 'last_7_days' | 'month' | 'last_month' | 'last_30_days' | 'quarter' | 'last_quarter' | 'year' | 'last_year' | 'custom'

const quickTimeGroups: Array<{ title: string; presets: Array<Exclude<TimeFilter, 'custom'>> }> = [
  { title: 'Theo ngày', presets: ['today', 'yesterday'] },
  { title: 'Theo tuần', presets: ['week', 'last_week', 'last_7_days'] },
  { title: 'Theo tháng', presets: ['month', 'last_month', 'last_30_days'] },
  { title: 'Theo quý', presets: ['quarter', 'last_quarter'] },
  { title: 'Theo năm', presets: ['year', 'last_year', 'all'] },
]

const quickTimeLabels: Record<TimeFilter, string> = {
  all: 'Toàn thời gian',
  today: 'Hôm nay',
  yesterday: 'Hôm qua',
  week: 'Tuần này',
  last_week: 'Tuần trước',
  last_7_days: '7 ngày qua',
  month: 'Tháng này',
  last_month: 'Tháng trước',
  last_30_days: '30 ngày qua',
  quarter: 'Quý này',
  last_quarter: 'Quý trước',
  year: 'Năm nay',
  last_year: 'Năm trước',
  custom: 'Tùy chỉnh',
}

function localDateString(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

function currentMonthRange() {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return { from: localDateString(firstDay), to: localDateString(lastDay) }
}

function addDays(date: Date, amount: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

function quickTimeRange(preset: Exclude<TimeFilter, 'custom'>) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const day = today.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const currentQuarter = Math.floor(today.getMonth() / 3)

  if (preset === 'all') return { from: '', to: '' }
  if (preset === 'today') return { from: localDateString(today), to: localDateString(today) }
  if (preset === 'yesterday') {
    const yesterday = addDays(today, -1)
    return { from: localDateString(yesterday), to: localDateString(yesterday) }
  }
  if (preset === 'week') {
    const firstDay = addDays(today, mondayOffset)
    return { from: localDateString(firstDay), to: localDateString(addDays(firstDay, 6)) }
  }
  if (preset === 'last_week') {
    const firstDay = addDays(today, mondayOffset - 7)
    return { from: localDateString(firstDay), to: localDateString(addDays(firstDay, 6)) }
  }
  if (preset === 'last_7_days') return { from: localDateString(addDays(today, -6)), to: localDateString(today) }
  if (preset === 'month') return currentMonthRange()
  if (preset === 'last_month') {
    const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const lastDay = new Date(today.getFullYear(), today.getMonth(), 0)
    return { from: localDateString(firstDay), to: localDateString(lastDay) }
  }
  if (preset === 'last_30_days') return { from: localDateString(addDays(today, -29)), to: localDateString(today) }
  if (preset === 'quarter') {
    const firstDay = new Date(today.getFullYear(), currentQuarter * 3, 1)
    const lastDay = new Date(today.getFullYear(), currentQuarter * 3 + 3, 0)
    return { from: localDateString(firstDay), to: localDateString(lastDay) }
  }
  if (preset === 'last_quarter') {
    const firstDay = new Date(today.getFullYear(), currentQuarter * 3 - 3, 1)
    const lastDay = new Date(today.getFullYear(), currentQuarter * 3, 0)
    return { from: localDateString(firstDay), to: localDateString(lastDay) }
  }
  if (preset === 'year') {
    return { from: localDateString(new Date(today.getFullYear(), 0, 1)), to: localDateString(new Date(today.getFullYear(), 11, 31)) }
  }
  return { from: localDateString(new Date(today.getFullYear() - 1, 0, 1)), to: localDateString(new Date(today.getFullYear() - 1, 11, 31)) }
}

function displayDate(value: string) {
  if (!value) return '--/--/----'
  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}

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
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month')
  const [dateFrom, setDateFrom] = useState(() => currentMonthRange().from)
  const [dateTo, setDateTo] = useState(() => currentMonthRange().to)
  const [quickTimeOpen, setQuickTimeOpen] = useState(false)
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
    time?: typeof timeFilter
    from?: string
    to?: string
    page?: number
    page_size?: number
  } = {}) {
    const nextSearch = input.search ?? lastSearch
    const nextType = input.type ?? typeFilter
    const nextStatus = input.status ?? statusFilter
    const nextTime = input.time ?? timeFilter
    const nextFrom = input.from ?? dateFrom
    const nextTo = input.to ?? dateTo
    const nextPage = input.page ?? state?.page ?? 1
    const nextPageSize = input.page_size ?? state?.pageSize ?? salesDocumentsPageSize
    setError(null)
    try {
      const result = await service.listSalesDocuments({
        ...(nextSearch ? { search: nextSearch } : {}),
        ...(nextType === 'all' ? {} : { type: nextType }),
        ...(nextStatus === 'all' ? {} : { status: nextStatus }),
        ...(nextTime !== 'all' && nextFrom ? { from: nextFrom } : {}),
        ...(nextTime !== 'all' && nextTo ? { to: nextTo } : {}),
        page: nextPage,
        page_size: nextPageSize,
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
        const monthRange = currentMonthRange()
        const result = await service.listSalesDocuments({
          from: monthRange.from,
          to: monthRange.to,
          page: 1,
          page_size: salesDocumentsPageSize,
        })
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
    setQuickTimeOpen(false)
    await loadDocuments({ search: trimmed, page: 1 })
  }

  async function resetFilters() {
    const monthRange = currentMonthRange()
    setSearch('')
    setLastSearch('')
    setTypeFilter('all')
    setStatusFilter('all')
    setTimeFilter('month')
    setDateFrom(monthRange.from)
    setDateTo(monthRange.to)
    setQuickTimeOpen(false)
    setSelected(null)
    setLoadingDocumentId(null)
    setDetailError(null)
    setDetailErrorDocumentId(null)
    await loadDocuments({ search: '', type: 'all', status: 'all', time: 'month', from: monthRange.from, to: monthRange.to, page: 1 })
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

  async function applyQuickTimeFilter(nextTime: Exclude<TimeFilter, 'custom'>) {
    const range = quickTimeRange(nextTime)
    setTimeFilter(nextTime)
    setDateFrom(range.from)
    setDateTo(range.to)
    setQuickTimeOpen(false)
    setSelected(null)
    setLoadingDocumentId(null)
    setDetailError(null)
    setDetailErrorDocumentId(null)
    await loadDocuments({ time: nextTime, from: range.from, to: range.to, page: 1 })
  }

  async function applyCustomDateFilter(next: { from?: string; to?: string }) {
    const nextFrom = next.from ?? dateFrom
    const nextTo = next.to ?? dateTo
    setTimeFilter('custom')
    setDateFrom(nextFrom)
    setDateTo(nextTo)
    setQuickTimeOpen(false)
    setSelected(null)
    setLoadingDocumentId(null)
    setDetailError(null)
    setDetailErrorDocumentId(null)
    await loadDocuments({ time: 'custom', from: nextFrom, to: nextTo, page: 1 })
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
  const hasFilter = lastSearch.length > 0 || typeFilter !== 'all' || statusFilter !== 'all' || timeFilter !== 'month'
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const canGoPrevious = page > 1
  const canGoNext = page < totalPages
  const activeFilterSummary = [
    ...(lastSearch ? [`Tìm: ${lastSearch}`] : []),
    ...(timeFilter === 'custom' ? [`Thời gian: ${dateFrom || '...'} - ${dateTo || '...'}`] : []),
    ...(timeFilter !== 'month' && timeFilter !== 'custom' ? [`Thời gian: ${quickTimeLabels[timeFilter]}`] : []),
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
          popoverOpen={quickTimeOpen}
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
          <ManagementFilterGroup title="Thời gian">
            <div className="management-filter-time-options">
              <div
                className={`management-filter-choice${timeFilter !== 'custom' ? ' management-filter-choice-active' : ''}`}
                aria-expanded={quickTimeOpen}
                onClick={() => {
                  if (timeFilter === 'custom') void applyQuickTimeFilter('month')
                  else setQuickTimeOpen((current) => !current)
                }}
              >
                <input
                  aria-label={timeFilter === 'custom' ? quickTimeLabels.month : quickTimeLabels[timeFilter]}
                  checked={timeFilter !== 'custom'}
                  name="sales-document-time"
                  readOnly
                  type="radio"
                  onChange={() => undefined}
                />
                <span>{timeFilter === 'custom' ? quickTimeLabels.month : quickTimeLabels[timeFilter]}</span>
                <span className="management-filter-choice-trailing">
                  <ChevronRight aria-hidden="true" size={17} />
                </span>
              </div>
              <label className={`management-filter-choice${timeFilter === 'custom' ? ' management-filter-choice-active' : ''}`}>
                <input
                  aria-label="Tùy chỉnh"
                  checked={timeFilter === 'custom'}
                  name="sales-document-time"
                  type="radio"
                  onChange={() => void applyCustomDateFilter({})}
                />
                <span>{timeFilter === 'custom' ? `${displayDate(dateFrom)} - ${displayDate(dateTo)}` : 'Tùy chỉnh'}</span>
                <CalendarDays aria-hidden="true" size={17} />
              </label>
            </div>
            {quickTimeOpen ? (
              <div aria-label="Chọn nhanh thời gian" className="management-filter-quick-time-menu" role="region">
                {quickTimeGroups.map((group) => (
                  <section key={group.title}>
                    <h3>{group.title}</h3>
                    <div>
                      {group.presets.map((preset) => (
                        <button
                          className={timeFilter === preset ? 'management-filter-quick-time-active' : undefined}
                          key={preset}
                          type="button"
                          onClick={() => void applyQuickTimeFilter(preset)}
                        >
                          {quickTimeLabels[preset]}
                        </button>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : null}
            {timeFilter === 'custom' ? (
              <div className="management-filter-date-range">
                <label>
                  <span>Từ ngày</span>
                  <input
                    aria-label="Từ ngày"
                    type="date"
                    value={dateFrom}
                    onChange={(event) => void applyCustomDateFilter({ from: event.target.value })}
                  />
                </label>
                <label>
                  <span>Đến ngày</span>
                  <input
                    aria-label="Đến ngày"
                    type="date"
                    value={dateTo}
                    onChange={(event) => void applyCustomDateFilter({ to: event.target.value })}
                  />
                </label>
              </div>
            ) : null}
          </ManagementFilterGroup>
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
              onFirst={() => void goToPage(1)}
              onLast={() => void goToPage(totalPages)}
              onNext={() => void goToPage(page + 1)}
              onPageSizeChange={(nextPageSize) => void loadDocuments({ page: 1, page_size: nextPageSize })}
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
