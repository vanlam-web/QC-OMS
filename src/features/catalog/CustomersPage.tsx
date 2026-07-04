import { Fragment, useEffect, useRef, useState } from 'react'
import { BarChart3, ChevronLeft, ChevronRight, Plus, RotateCcw, Search } from 'lucide-react'
import { MoneyText } from '../../components/ui-shell/primitives'
import { formatApiError } from '../../lib/api/error-message'
import {
  ManagementActionIconButton,
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
import type { Customer } from './types'
import type { CustomerDebtDetail, OrderService } from '../orders/order-service'
import type { SalesDocumentListItem, SalesDocumentService } from '../sales-documents/sales-document-service'

interface CustomerState {
  customers: Customer[]
  total: number
  page: number
  pageSize: number
}

type CustomerDebtState = CustomerDebtDetail | 'loading' | 'error'
type CustomerHistoryState = { items: SalesDocumentListItem[]; total: number } | 'loading' | 'error'
type CustomerDetailTab = 'info' | 'debt' | 'history'
type CustomerHistoryType = 'invoice' | 'quote'
const customerPageSize = 15
const customerHistoryPageSize = 10

function customerHistoryKey(customerId: string, historyType: CustomerHistoryType) {
  return `${customerId}:${historyType}`
}

export function CustomersPage({
  service,
  orderService,
  salesDocumentService,
}: {
  service: CatalogService
  orderService: Pick<OrderService, 'getCustomerDebt'>
  salesDocumentService?: Pick<SalesDocumentService, 'listSalesDocuments'>
}) {
  const [state, setState] = useState<CustomerState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [activeDetailTab, setActiveDetailTab] = useState<CustomerDetailTab>('info')
  const [customerHistoryType, setCustomerHistoryType] = useState<CustomerHistoryType>('invoice')
  const [customerDebts, setCustomerDebts] = useState<Record<string, CustomerDebtState>>({})
  const [customerHistories, setCustomerHistories] = useState<Record<string, CustomerHistoryState>>({})
  const [analysisCustomer, setAnalysisCustomer] = useState<Customer | null>(null)
  const customerDebtRequestsRef = useRef(new Set<string>())
  const customerHistoryRequestsRef = useRef(new Set<string>())
  const [showFilters, setShowFilters] = useState(true)
  const [search, setSearch] = useState('')
  const [lastSearch, setLastSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(customerPageSize)
  const [form, setForm] = useState({
    code: '',
    name: '',
    phone: '',
    taxCode: '',
    address: '',
  })

  async function load(filters: { search?: string; page?: number } = {}) {
    const nextSearch = filters.search ?? lastSearch
    const nextPage = filters.page ?? page
    setError(null)
    try {
      const result = await service.listCustomers({ search: nextSearch || undefined, page: nextPage, page_size: pageSize })
      setState({ customers: result.items, total: result.total, page: result.page, pageSize: result.page_size })
      setLastSearch(nextSearch)
      setPage(result.page)
      setPageSize(result.page_size)
      setSelectedCustomerId(null)
    } catch (cause) {
      setError(formatApiError(cause, 'Không tải được khách hàng.'))
    }
  }

  useEffect(() => {
    let active = true

    async function loadInitialCustomers() {
      setError(null)
      try {
        const result = await service.listCustomers({ page: 1, page_size: customerPageSize })
        if (!active) return
        setState({ customers: result.items, total: result.total, page: result.page, pageSize: result.page_size })
        setPage(result.page)
        setPageSize(result.page_size)
      } catch (cause) {
        if (active) setError(formatApiError(cause, 'Không tải được khách hàng.'))
      }
    }

    void loadInitialCustomers()

    return () => {
      active = false
    }
  }, [service])

  useEffect(() => {
    if (state === null) return

    const customerIdsToLoad = state.customers.filter((customer) => customerDebts[customer.id] === undefined).map((customer) => customer.id)
    if (customerIdsToLoad.length === 0) return

    for (const customerId of customerIdsToLoad) {
      if (customerDebtRequestsRef.current.has(customerId)) continue
      customerDebtRequestsRef.current.add(customerId)
      orderService
        .getCustomerDebt(customerId)
        .then((debt) => setCustomerDebts((debts) => ({ ...debts, [customerId]: debt })))
        .catch(() => setCustomerDebts((debts) => ({ ...debts, [customerId]: 'error' })))
        .finally(() => customerDebtRequestsRef.current.delete(customerId))
    }
  }, [customerDebts, orderService, state])

  async function filterCustomers(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = search.trim()
    setPage(1)
    await load({ search: trimmed, page: 1 })
  }

  async function resetCustomerFilters() {
    setSearch('')
    setPage(1)
    await load({ search: '', page: 1 })
  }

  async function goToPage(nextPage: number) {
    await load({ page: nextPage })
  }

  function toggleCustomerDetail(customer: Customer) {
    setSelectedCustomerId((current) => {
      const next = current === customer.id ? null : customer.id
      if (next !== null) {
        setActiveDetailTab('info')
        setCustomerHistoryType('invoice')
      }
      return next
    })
  }

  function loadCustomerHistory(customerId: string, historyType: CustomerHistoryType) {
    const key = customerHistoryKey(customerId, historyType)
    if (salesDocumentService === undefined || customerHistories[key] !== undefined || customerHistoryRequestsRef.current.has(key)) return

    customerHistoryRequestsRef.current.add(key)
    setCustomerHistories((histories) => ({ ...histories, [key]: 'loading' }))
    salesDocumentService
      .listSalesDocuments({ customer_id: customerId, type: historyType, page: 1, page_size: customerHistoryPageSize })
      .then((history) => setCustomerHistories((histories) => ({ ...histories, [key]: { items: history.items, total: history.total } })))
      .catch(() => setCustomerHistories((histories) => ({ ...histories, [key]: 'error' })))
      .finally(() => customerHistoryRequestsRef.current.delete(key))
  }

  function openCustomerHistory(customerId: string) {
    setActiveDetailTab('history')
    loadCustomerHistory(customerId, customerHistoryType)
  }

  function selectCustomerHistoryType(customerId: string, historyType: CustomerHistoryType) {
    setCustomerHistoryType(historyType)
    loadCustomerHistory(customerId, historyType)
  }

  async function createCustomer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await service.createCustomer({
        code: form.code.trim() || undefined,
        name: form.name,
        phone: form.phone.trim() || undefined,
        tax_code: form.taxCode.trim() || undefined,
        address: form.address.trim() || undefined,
        customer_group_id: null,
      })
      setForm({ code: '', name: '', phone: '', taxCode: '', address: '' })
      setCreateOpen(false)
      await load({ page })
    } catch (cause) {
      setError(formatApiError(cause, 'Không lưu được khách hàng.'))
    } finally {
      setSaving(false)
    }
  }

  function openCreateCustomer() {
    setForm({ code: '', name: '', phone: '', taxCode: '', address: '' })
    setCreateOpen(true)
  }

  const totalPages = Math.max(1, Math.ceil((state?.total ?? 0) / pageSize))
  const canGoPrevious = page > 1
  const canGoNext = page < totalPages

  return (
    <ManagementPage
      title="Khách hàng"
      actions={
        <ManagementCompactToolbar ariaLabel="Lọc khách hàng" onSubmit={filterCustomers}>
          <ManagementCompactSearch
            label="Tìm khách hàng"
            leadingIcon={<Search aria-hidden="true" size={16} />}
            placeholder="Tìm mã, tên, số điện thoại"
            trailingAction={
              <ManagementActionIconButton ariaLabel="Tạo khách hàng" variant="primary" onClick={openCreateCustomer}>
                <Plus aria-hidden="true" size={16} />
              </ManagementActionIconButton>
            }
            value={search}
            onChange={setSearch}
          />
        </ManagementCompactToolbar>
      }
      filter={
        <ManagementFilterSidebar
          ariaLabel="Bộ lọc khách hàng"
          actions={
            <button className="button button-secondary" type="button" onClick={() => void resetCustomerFilters()}>
              <RotateCcw aria-hidden="true" size={15} />
              Đặt lại bộ lọc
            </button>
          }
        >
          <button
            aria-label="Ẩn bộ lọc khách hàng"
            className="management-filter-collapse-button"
            title="Ẩn bộ lọc"
            type="button"
            onClick={() => setShowFilters(false)}
          >
            <ChevronLeft aria-hidden="true" size={16} />
          </button>
          <ManagementFilterGroup title="Trạng thái">
            <label>
              <input checked readOnly name="customer-status" type="radio" />
              Đang hoạt động
            </label>
          </ManagementFilterGroup>
        </ManagementFilterSidebar>
      }
      filterVisible={showFilters}
      filterCollapsedControl={
        <button
          aria-label="Mở bộ lọc khách hàng"
          className="management-filter-expand-button"
          title="Mở bộ lọc"
          type="button"
          onClick={() => setShowFilters(true)}
        >
          <ChevronRight aria-hidden="true" size={16} />
        </button>
      }
    >
      {createOpen ? (
        <div aria-label="Tạo khách hàng" aria-modal="true" className="customer-create-backdrop" role="dialog">
          <section className="customer-create-modal">
            <header className="customer-create-modal-header">
              <div>
                <h2>Tạo khách hàng</h2>
                <p>Mã khách hàng sẽ tự sinh nếu để trống.</p>
              </div>
              <button className="button button-ghost" type="button" aria-label="Đóng tạo khách hàng" onClick={() => setCreateOpen(false)}>
                ×
              </button>
            </header>

            <form id="customer-create-form" aria-label="Tạo khách hàng" className="customer-create-form" onSubmit={createCustomer}>
              <fieldset>
                <legend>Thông tin chính</legend>
                <div className="form-grid form-grid-two">
                  <label>
                    Tên khách hàng
                    <input
                      autoFocus
                      required
                      placeholder="Bắt buộc"
                      value={form.name}
                      onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    />
                  </label>
                  <label>
                    Mã khách hàng
                    <input
                      placeholder="Bỏ trống để tự sinh"
                      value={form.code}
                      onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
                    />
                  </label>
                  <label>
                    Điện thoại
                    <input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
                  </label>
                  <label>
                    MST
                    <input value={form.taxCode} onChange={(event) => setForm((current) => ({ ...current, taxCode: event.target.value }))} />
                  </label>
                </div>
              </fieldset>

              <fieldset>
                <legend>Địa chỉ</legend>
                <label>
                  Địa chỉ
                  <input
                    placeholder="Nhập một dòng địa chỉ"
                    value={form.address}
                    onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
                  />
                </label>
              </fieldset>

              {error ? <p role="alert">{error}</p> : null}
            </form>

            <footer className="customer-create-modal-footer">
              <button className="button button-secondary" type="button" onClick={() => setCreateOpen(false)}>
                Bỏ qua
              </button>
              <button className="button button-primary" disabled={saving} type="submit" form="customer-create-form">
                Lưu
              </button>
            </footer>
          </section>
        </div>
      ) : null}

      <ManagementListSurface ariaLabel="Danh sách khách hàng">
        {error ? <p role="alert">{error}</p> : null}
        {state === null && error === null ? <p>Đang tải khách hàng...</p> : null}

        {state ? (
          <>
            <ManagementTableViewport>
              <table aria-label="Danh sách khách hàng" className="customer-management-table">
                <thead>
                  <tr>
                    <th>Mã KH</th>
                    <th>Tên khách hàng</th>
                    <th>Điện thoại</th>
                    <th>Nhóm khách hàng</th>
                    <th>Nợ hiện tại</th>
                    <th>Tổng bán</th>
                </tr>
              </thead>
              <tbody>
                {state.customers.map((customer) => {
                  const debt = customerDebts[customer.id]
                  const history = customerHistories[customerHistoryKey(customer.id, customerHistoryType)]
                  const debtAmount = typeof debt === 'object' ? debt.total_debt : null
                  return (
                    <Fragment key={customer.id}>
                    <tr
                      aria-expanded={selectedCustomerId === customer.id}
                      className={`management-data-row${selectedCustomerId === customer.id ? ' management-data-row-selected' : ''}`}
                      tabIndex={0}
                      onClick={() => toggleCustomerDetail(customer)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          toggleCustomerDetail(customer)
                        }
                      }}
                    >
                      <td>{customer.code}</td>
                      <td>{customer.name}</td>
                      <td>{customer.phone ?? '-'}</td>
                      <td>{customer.customer_group?.name ?? '-'}</td>
                      <td>{debtAmount === null ? '-' : <MoneyText value={debtAmount} />}</td>
                      <td>{customer.total_sales_amount === undefined ? '-' : <MoneyText value={customer.total_sales_amount} />}</td>
                    </tr>
                    {selectedCustomerId === customer.id ? (
                      <ManagementDetailRow
                        colSpan={6}
                        detailClassName="customer-inline-detail"
                        label={`Chi tiết khách hàng ${customer.code}`}
                        rowClassName="management-detail-row-selected"
                      >
                            <div className="customer-detail-tabbar">
                              <div aria-label="Chi tiết khách hàng" className="customer-detail-tabs" role="tablist">
                                <button
                                  aria-selected={activeDetailTab === 'info'}
                                  role="tab"
                                  type="button"
                                  onClick={() => setActiveDetailTab('info')}
                                >
                                  Thông tin
                                </button>
                                <button
                                  aria-selected={activeDetailTab === 'debt'}
                                  role="tab"
                                  type="button"
                                  onClick={() => setActiveDetailTab('debt')}
                                >
                                  Nợ cần thu
                                </button>
                                <button
                                  aria-selected={activeDetailTab === 'history'}
                                  role="tab"
                                  type="button"
                                  onClick={() => openCustomerHistory(customer.id)}
                                >
                                  Lịch sử
                                </button>
                              </div>
                              <button
                                aria-label="Xem phân tích"
                                className="customer-analysis-icon-button"
                                title="Xem phân tích"
                                type="button"
                                onClick={() => setAnalysisCustomer(customer)}
                              >
                                <BarChart3 aria-hidden="true" size={17} />
                              </button>
                            </div>
                            {activeDetailTab === 'info' ? (
                              <section aria-label="Thông tin khách hàng" className="customer-detail-tab-panel" role="tabpanel">
                                <dl>
                                  <div>
                                    <dt>MST</dt>
                                    <dd>{customer.tax_code ?? 'Chưa có MST'}</dd>
                                  </div>
                                  <div>
                                    <dt>Địa chỉ</dt>
                                    <dd>{customer.address ?? 'Chưa có địa chỉ'}</dd>
                                  </div>
                                  <div>
                                    <dt>Nhóm khách</dt>
                                    <dd>{customer.customer_group?.name ?? 'Chưa có nhóm'}</dd>
                                  </div>
                                  <div>
                                    <dt>Bảng giá áp dụng</dt>
                                    <dd>{priceRuleLabel(customer)}</dd>
                                  </div>
                                  <div>
                                    <dt>Người tạo</dt>
                                    <dd>{customer.created_by?.name || 'Chưa có dữ liệu'}</dd>
                                  </div>
                                  <div>
                                    <dt>Ngày tạo</dt>
                                    <dd>{dateTime(customer.created_at)}</dd>
                                  </div>
                                </dl>
                              </section>
                            ) : activeDetailTab === 'debt' ? (
                              <section aria-label="Nợ cần thu khách hàng" className="customer-detail-tab-panel" role="tabpanel">
                                <CustomerDebtPanel debt={debt} />
                              </section>
                            ) : (
                              <section aria-label="Lịch sử khách hàng" className="customer-detail-tab-panel" role="tabpanel">
                                <CustomerHistoryPanel
                                  history={history}
                                  historyType={customerHistoryType}
                                  onSelectHistoryType={(historyType) => selectCustomerHistoryType(customer.id, historyType)}
                                />
                              </section>
                            )}
                      </ManagementDetailRow>
                    ) : null}
                    </Fragment>
                  )
                })}
              </tbody>
              </table>
            </ManagementTableViewport>
            <ManagementTableFooter
              ariaLabel="Phân trang khách hàng"
              canGoNext={canGoNext}
              canGoPrevious={canGoPrevious}
              entityLabel="khách hàng"
              page={page}
              pageSize={pageSize}
              total={state.total}
              onNext={() => void goToPage(page + 1)}
              onPrevious={() => void goToPage(page - 1)}
            />
          </>
        ) : null}
      </ManagementListSurface>
      {analysisCustomer ? (
        <CustomerAnalysisDialog customer={analysisCustomer} onClose={() => setAnalysisCustomer(null)} />
      ) : null}
    </ManagementPage>
  )
}

function priceRuleLabel(customer: Customer) {
  return customer.customer_group === null ? 'Bảng giá chung' : `Theo nhóm: ${customer.customer_group.name}`
}

function CustomerDebtPanel({ debt }: { debt: CustomerDebtState | undefined }) {
  if (debt === undefined || debt === 'loading') return <p>Đang tải nợ cần thu...</p>
  if (debt === 'error') return <p role="alert">Không tải được nợ cần thu.</p>

  return (
    <section aria-label="Nợ cần thu" className="customer-debt-panel">
      <dl>
        <div>
          <dt>Tổng nợ</dt>
          <dd><MoneyText value={debt.total_debt} /></dd>
        </div>
        <div>
          <dt>Hóa đơn mở</dt>
          <dd>{debt.invoices.length} hóa đơn mở</dd>
        </div>
      </dl>
      {debt.invoices.length > 0 ? (
        <table aria-label="Hóa đơn còn nợ">
          <thead>
            <tr>
              <th>Mã</th>
              <th>Thời gian</th>
              <th>Tổng tiền</th>
              <th>Đã trả</th>
              <th>Còn nợ</th>
            </tr>
          </thead>
          <tbody>
            {debt.invoices.map((invoice) => (
              <tr key={invoice.order_id}>
                <td>{invoice.order_code}</td>
                <td>{dateTime(invoice.created_at)}</td>
                <td><MoneyText value={invoice.total_amount} /></td>
                <td><MoneyText value={invoice.paid_amount} /></td>
                <td><MoneyText value={invoice.remaining_debt} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </section>
  )
}

function CustomerHistoryPanel({
  history,
  historyType,
  onSelectHistoryType,
}: {
  history: CustomerHistoryState | undefined
  historyType: CustomerHistoryType
  onSelectHistoryType: (historyType: CustomerHistoryType) => void
}) {
  const codeHeader = historyType === 'invoice' ? 'Mã hóa đơn' : 'Mã báo giá'

  return (
    <section aria-label="Lịch sử bán hàng" className="customer-history-panel">
      <div aria-label="Loại lịch sử" className="customer-history-type-toggle">
        <button aria-pressed={historyType === 'invoice'} type="button" onClick={() => onSelectHistoryType('invoice')}>
          Hóa đơn
        </button>
        <button aria-pressed={historyType === 'quote'} type="button" onClick={() => onSelectHistoryType('quote')}>
          Báo giá
        </button>
      </div>
      {history === undefined || history === 'loading' ? <p>Đang tải lịch sử...</p> : null}
      {history === 'error' ? <p role="alert">Không tải được lịch sử khách hàng.</p> : null}
      {typeof history === 'object' && history.items.length === 0 ? <p>Chưa có giao dịch bán hàng.</p> : null}
      {typeof history === 'object' && history.items.length > 0 ? (
      <table aria-label="Lịch sử chứng từ khách hàng" className="customer-history-table">
        <thead>
          <tr>
            <th>{codeHeader}</th>
            <th>Thời gian</th>
            <th>Người bán</th>
            <th>Tổng cộng</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {history.items.map((document) => (
            <tr key={document.id}>
              <td>{document.code}</td>
              <td>{dateTime(document.created_at)}</td>
              <td>{document.seller.name || '-'}</td>
              <td><MoneyText value={document.total_amount} /></td>
              <td>{salesDocumentStatusText(document)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      ) : null}
    </section>
  )
}

function CustomerAnalysisDialog({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  return (
    <div aria-label={`Phân tích khách hàng ${customer.code}`} aria-modal="true" className="customer-analysis-backdrop" role="dialog">
      <section className="customer-analysis-dialog">
        <header>
          <div>
            <h2>Phân tích khách hàng</h2>
            <p>{customer.code} - {customer.name}</p>
          </div>
          <button aria-label="Đóng phân tích khách hàng" className="button button-ghost" type="button" onClick={onClose}>
            ×
          </button>
        </header>
        <label>
          Khoảng thời gian
          <select defaultValue="all">
            <option value="all">Toàn thời gian</option>
            <option value="month">Tháng này</option>
            <option value="quarter">Quý này</option>
            <option value="year">Năm nay</option>
          </select>
        </label>
        <div className="customer-analysis-grid">
          <article>
            <span>Doanh thu</span>
            <strong>-</strong>
          </article>
          <article>
            <span>Số chứng từ</span>
            <strong>-</strong>
          </article>
          <article>
            <span>Tần suất</span>
            <strong>-</strong>
          </article>
        </div>
      </section>
    </div>
  )
}

function salesDocumentStatusText(document: SalesDocumentListItem) {
  if (document.order_type === 'invoice') {
    if (document.status === 'cancelled') return 'Đã hủy'
    if (document.payment_status === 'partial') return 'Nợ 1 phần'
    if (document.payment_status === 'unpaid' || document.debt_amount > 0) return 'Nợ'
    return 'Hoàn tất'
  }

  if (document.status === 'active') return 'Đang hiệu lực'
  if (document.status === 'converted') return 'Đã chuyển'
  return 'Đã hủy'
}

function dateTime(value: string | null | undefined) {
  if (!value) return 'Chưa có dữ liệu'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Chưa có dữ liệu'

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(parsed)
}
