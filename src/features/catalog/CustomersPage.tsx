import { Fragment, useEffect, useState } from 'react'
import { DataToolbar, type ActiveFilterChip, type FilterPreset } from '../../components/ui-shell/filters'
import { EmptyState, MetricCard, MetricGrid, MoneyText, StatusChip } from '../../components/ui-shell/primitives'
import { formatApiError } from '../../lib/api/error-message'
import type { CatalogService } from './catalog-service'
import type { Customer } from './types'
import type { OrderService } from '../orders/order-service'
import type { CustomerDebtDetail } from '../orders/types'

interface CustomersState {
  customers: Customer[]
  total: number
}

interface DetailState {
  customer: Customer
  debt: CustomerDebtDetail | null
  loading: boolean
  error: string | null
}

const moneyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

export function CustomersPage({
  service,
  orderService,
  onOpenDashboard,
}: {
  service: CatalogService
  orderService: Pick<OrderService, 'getCustomerDebt'>
  onOpenDashboard: () => void
}) {
  const [state, setState] = useState<CustomersState | null>(null)
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [detail, setDetail] = useState<DetailState | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', taxCode: '' })

  async function load(filters = { search }) {
    setError(null)
    try {
      const result = await service.listCustomers({ search: filters.search })
      setState({ customers: result.items, total: result.total })
    } catch (cause) {
      setError(formatApiError(cause, 'Không tải được danh sách khách hàng.'))
    }
  }

  useEffect(() => {
    let active = true

    async function loadInitial() {
      setError(null)
      try {
        const result = await service.listCustomers()
        if (active) setState({ customers: result.items, total: result.total })
      } catch (cause) {
        if (active) setError(formatApiError(cause, 'Không tải được danh sách khách hàng.'))
      }
    }

    void loadInitial()

    return () => {
      active = false
    }
  }, [service])

  async function submitFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setDetail(null)
    await load({ search })
  }

  function resetFilters() {
    setSearch('')
    setDetail(null)
    void load({ search: '' })
  }

  function openCreate() {
    setCreateOpen(true)
    setDetail(null)
    setForm({ name: '', phone: '', taxCode: '' })
  }

  async function createCustomer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await service.createCustomer({
        name: form.name,
        ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
        ...(form.taxCode.trim() ? { tax_code: form.taxCode.trim() } : {}),
      })
      setCreateOpen(false)
      setForm({ name: '', phone: '', taxCode: '' })
      await load()
    } catch (cause) {
      setError(formatApiError(cause, 'Không lưu được khách hàng.'))
    } finally {
      setSaving(false)
    }
  }

  async function toggleDetail(customer: Customer) {
    if (detail?.customer.id === customer.id) {
      setDetail(null)
      return
    }

    setCreateOpen(false)
    setDetail({ customer, debt: null, loading: true, error: null })
    try {
      const debt = await orderService.getCustomerDebt(customer.id)
      setDetail({ customer, debt, loading: false, error: null })
    } catch (cause) {
      setDetail({
        customer,
        debt: null,
        loading: false,
        error: formatApiError(cause, 'Không tải được công nợ khách hàng.'),
      })
    }
  }

  const presets: FilterPreset[] = [
    {
      id: 'all',
      label: 'Tất cả',
      active: search.trim() === '',
      onSelect: resetFilters,
    },
    {
      id: 'debt',
      label: 'Đang nợ',
      disabled: true,
      title: 'Chưa có backend filter công nợ khách hàng trong slice này.',
      onSelect: () => undefined,
    },
    {
      id: 'new',
      label: 'Khách mới',
      disabled: true,
      title: 'Chưa có filter ngày tạo trong API khách hàng.',
      onSelect: () => undefined,
    },
  ]
  const chips: ActiveFilterChip[] = search.trim()
    ? [{ id: 'search', label: `Tìm: ${search.trim()}`, onClear: resetFilters }]
    : []

  const customers = state?.customers ?? []
  const groupedCount = customers.filter((customer) => customer.customer_group !== null).length
  const debtTotal = detail?.debt?.total_debt ?? 0

  return (
    <main className="management-page">
      <header className="suppliers-header">
        <div>
          <p>Khách hàng</p>
          <h1>Hồ sơ khách hàng</h1>
          <span>Quản lý MST, nhóm giá áp dụng và công nợ chỉ đọc.</span>
        </div>
        <button className="button button-secondary" type="button" onClick={onOpenDashboard}>
          Trang chủ
        </button>
      </header>

      <MetricGrid ariaLabel="Tổng quan khách hàng">
        <MetricCard label="Khách trong danh sách" value={state === null ? '...' : state.total} hint="Theo bộ lọc hiện tại" />
        <MetricCard label="Có nhóm giá" value={groupedCount} hint="Từ danh sách đang xem" tone="info" />
        <MetricCard label="Công nợ đang xem" value={<MoneyText value={debtTotal} />} hint="Từ chi tiết đang mở" tone="warning" />
      </MetricGrid>

      {error ? <p role="alert">{error}</p> : null}

      {createOpen ? (
        <section aria-label="Tạo khách hàng" className="suppliers-panel">
          <div className="panel-heading">
            <div>
              <h2>Tạo khách hàng</h2>
              <p>MST là thông tin tùy chọn trong MVP.</p>
            </div>
          </div>
          <form aria-label="Tạo khách hàng" className="form-grid" onSubmit={createCustomer}>
            <label>
              Tên khách hàng
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            </label>
            <label>
              Điện thoại
              <input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
            </label>
            <label>
              MST
              <input value={form.taxCode} onChange={(event) => setForm((current) => ({ ...current, taxCode: event.target.value }))} />
            </label>
            <div className="form-actions">
              <button className="button button-primary" disabled={saving} type="submit">
                Lưu khách hàng
              </button>
              <button className="button button-secondary" type="button" onClick={() => setCreateOpen(false)}>
                Hủy
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section aria-label="Danh sách khách hàng" className="suppliers-panel">
        <div className="panel-heading">
          <div>
            <h2>Danh sách khách hàng</h2>
            <p>Chọn một dòng để xem MST, nhóm giá và công nợ.</p>
          </div>
          <button className="button button-primary panel-heading-action" type="button" onClick={openCreate}>
            <span aria-hidden="true">+</span>
            Tạo khách hàng
          </button>
        </div>

        <DataToolbar
          ariaLabel="Lọc khách hàng"
          searchLabel="Tìm khách hàng"
          searchValue={search}
          presets={presets}
          chips={chips}
          onSearchChange={setSearch}
          onSubmit={submitFilters}
          onReset={resetFilters}
        >
          <p>Nhập mã, tên hoặc số điện thoại để tìm khách hàng.</p>
        </DataToolbar>

        {state === null ? (
          <p>Đang tải khách hàng...</p>
        ) : customers.length === 0 ? (
          <EmptyState>Chưa có khách hàng phù hợp bộ lọc.</EmptyState>
        ) : (
          <table aria-label="Danh sách khách hàng">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tên khách hàng</th>
                <th>Điện thoại</th>
                <th>MST</th>
                <th>Quy tắc giá</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => {
                const isOpen = detail?.customer.id === customer.id
                return (
                  <Fragment key={customer.id}>
                    <tr>
                      <td>{customer.code}</td>
                      <td>{customer.name}</td>
                      <td>{customer.phone ?? 'Chưa có'}</td>
                      <td>{customer.tax_code ?? 'Chưa có MST'}</td>
                      <td>
                        <StatusChip tone={customer.customer_group ? 'info' : 'neutral'}>
                          {priceRuleLabel(customer)}
                        </StatusChip>
                      </td>
                      <td>
                        <button className="button button-secondary" type="button" onClick={() => void toggleDetail(customer)}>
                          {isOpen ? `Đóng ${customer.code}` : `Chi tiết ${customer.code}`}
                        </button>
                      </td>
                    </tr>
                    {isOpen ? (
                      <tr>
                        <td colSpan={6}>
                          <CustomerDetail detail={detail} />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        )}
      </section>
    </main>
  )
}

function CustomerDetail({ detail }: { detail: DetailState }) {
  const debt = detail.debt

  return (
    <section aria-label={`Chi tiết khách hàng ${detail.customer.code}`} className="inline-detail-panel">
      <dl className="detail-grid">
        <div>
          <dt>MST</dt>
          <dd>{detail.customer.tax_code ?? 'Chưa có MST'}</dd>
        </div>
        <div>
          <dt>Quy tắc giá</dt>
          <dd>{priceRuleLabel(detail.customer)}</dd>
        </div>
        <div>
          <dt>Tổng công nợ</dt>
          <dd>{debt ? <MoneyText value={debt.total_debt} /> : detail.loading ? 'Đang tải...' : 'Chưa có dữ liệu'}</dd>
        </div>
        <div>
          <dt>Hóa đơn mở</dt>
          <dd>{debt ? `${debt.invoices.length} hóa đơn mở` : detail.loading ? 'Đang tải...' : 'Chưa có dữ liệu'}</dd>
        </div>
      </dl>

      {detail.error ? <p role="alert">{detail.error}</p> : null}

      {debt && debt.invoices.length > 0 ? (
        <table aria-label={`Công nợ khách hàng ${detail.customer.code}`}>
          <thead>
            <tr>
              <th>Mã hóa đơn</th>
              <th>Tổng tiền</th>
              <th>Đã thu</th>
              <th>Còn nợ</th>
            </tr>
          </thead>
          <tbody>
            {debt.invoices.map((invoice) => (
              <tr key={invoice.order_id}>
                <td>{invoice.order_code}</td>
                <td>{moneyFormatter.format(invoice.total_amount)}</td>
                <td>{moneyFormatter.format(invoice.paid_amount)}</td>
                <td>{moneyFormatter.format(invoice.remaining_debt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </section>
  )
}

function priceRuleLabel(customer: Customer) {
  return customer.customer_group ? `Theo nhóm: ${customer.customer_group.name}` : 'Bảng giá chung'
}
