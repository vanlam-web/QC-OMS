import { Fragment, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Pencil, Plus, RotateCcw, Save, Search, WalletCards, X } from 'lucide-react'
import { formatApiError } from '../../lib/api/error-message'
import { formatMoney } from '../../lib/number-format'
import type { Supplier, SupplierCustomerOption, SupplierFinanceAccount, SupplierPayableReceipt, SupplierStatus } from './types'
import type { SupplierInput, SupplierService } from './supplier-service'
import { EmptyState, MetricCard, MetricGrid, MoneyText, StatusChip } from '../../components/ui-shell/primitives'
import {
  ManagementActionIconButton,
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

function money(value: number) {
  return formatMoney(value)
}

const blankForm: SupplierInput = {
  code: '',
  name: '',
  phone: '',
  email: '',
  address: '',
  tax_code: '',
  linked_customer_id: null,
  notes: '',
  status: 'active',
}

const supplierPageSize = 15

function supplierStatusText(status: SupplierStatus | 'all') {
  if (status === 'active') return 'Đang hoạt động'
  if (status === 'inactive') return 'Ngừng hoạt động'
  return 'Tất cả'
}

export function SuppliersPage({
  service,
}: {
  service: SupplierService
  onOpenDashboard: () => void
}) {
  const [suppliers, setSuppliers] = useState<Supplier[] | null>(null)
  const [customers, setCustomers] = useState<SupplierCustomerOption[]>([])
  const [financeAccounts, setFinanceAccounts] = useState<SupplierFinanceAccount[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [lastSearch, setLastSearch] = useState('')
  const [status, setStatus] = useState<SupplierStatus | 'all'>('active')
  const [lastStatus, setLastStatus] = useState<SupplierStatus | 'all'>('active')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(supplierPageSize)
  const [showFilters, setShowFilters] = useState(true)
  const [detailOpen, setDetailOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<SupplierInput>(blankForm)
  const [saving, setSaving] = useState(false)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentSupplier, setPaymentSupplier] = useState<Supplier | null>(null)
  const [payableReceipts, setPayableReceipts] = useState<SupplierPayableReceipt[]>([])
  const [paymentAmounts, setPaymentAmounts] = useState<Record<string, number>>({})
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer'>('cash')
  const [paymentFinanceAccountId, setPaymentFinanceAccountId] = useState('')
  const [paymentNote, setPaymentNote] = useState('')

  const bankAccounts = financeAccounts.filter((account) => account.is_active && account.account_type === 'bank')
  const visibleSupplierTotal = suppliers?.length ?? 0
  const payableTotal = suppliers?.reduce((sum, supplier) => sum + supplier.current_payable_amount, 0) ?? 0
  const purchaseTotal = suppliers?.reduce((sum, supplier) => sum + supplier.total_purchase_amount, 0) ?? 0
  const isCreatingSupplier = detailOpen && editingId === null && paymentSupplier === null

  async function loadSuppliers(
    input: { search?: string; status?: SupplierStatus | 'all'; page?: number } = {
      search: lastSearch,
      status: lastStatus,
      page,
    },
  ) {
    const nextSearch = input.search ?? lastSearch
    const nextStatus = input.status ?? lastStatus
    const nextPage = input.page ?? page
    setError(null)
    try {
      const result = await service.listSuppliers({
        page: nextPage,
        page_size: pageSize,
        search: nextSearch?.trim() || undefined,
        status: nextStatus,
      })
      setSuppliers(result.items)
      setTotal(result.total)
      setLastSearch(nextSearch?.trim() ?? '')
      setLastStatus(nextStatus)
      setPage(result.page)
      setPageSize(result.page_size)
    } catch (cause) {
      setError(formatApiError(cause, 'Không tải được nhà cung cấp.'))
    }
  }

  useEffect(() => {
    let active = true

    async function loadInitialData() {
      setError(null)
      try {
        const [supplierResult, customerResult, financeAccountResult] = await Promise.all([
          service.listSuppliers({ status: 'active', page: 1, page_size: supplierPageSize }),
          service.listCustomers(),
          service.listFinanceAccounts(),
        ])
        if (!active) return
        setSuppliers(supplierResult.items)
        setTotal(supplierResult.total)
        setPage(supplierResult.page)
        setPageSize(supplierResult.page_size)
        setCustomers(customerResult.items)
        setFinanceAccounts(financeAccountResult.items)
      } catch (cause) {
        if (active) setError(formatApiError(cause, 'Không tải được nhà cung cấp.'))
      }
    }

    void loadInitialData()

    return () => {
      active = false
    }
  }, [service])

  async function filterSuppliers(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPage(1)
    await loadSuppliers({ search: search.trim(), status, page: 1 })
  }

  async function resetSupplierFilters() {
    setSearch('')
    setStatus('active')
    setPage(1)
    await loadSuppliers({ search: '', status: 'active', page: 1 })
  }

  async function goToPage(nextPage: number) {
    await loadSuppliers({ page: nextPage })
  }

  async function openSupplier(supplier: Supplier) {
    setError(null)
    setDetailOpen(false)
    setPaymentSupplier(null)
    setEditingId(null)
    setForm(blankForm)
    try {
      const detail = await service.getSupplier(supplier.id)
      setDetailOpen(true)
      setEditingId(detail.id)
      setForm({
        code: detail.code,
        name: detail.name,
        phone: detail.phone ?? '',
        email: detail.email ?? '',
        address: detail.address ?? '',
        tax_code: detail.tax_code ?? '',
        linked_customer_id: detail.linked_customer_id,
        notes: detail.notes ?? '',
        status: detail.status,
      })
    } catch (cause) {
      setError(formatApiError(cause, 'Không tải được chi tiết nhà cung cấp.'))
    }
  }

  async function saveSupplier(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (editingId === null) {
        await service.createSupplier(form)
      } else {
        await service.updateSupplier(editingId, form)
      }
      setEditingId(null)
      setDetailOpen(false)
      setForm(blankForm)
      await loadSuppliers()
    } catch (cause) {
      setError(formatApiError(cause, 'Không lưu được nhà cung cấp.'))
    } finally {
      setSaving(false)
    }
  }

  async function openSupplierPayment(supplier: Supplier) {
    setError(null)
    setPaymentSupplier(null)
    setDetailOpen(false)
    setEditingId(null)
    setForm(blankForm)
    setPayableReceipts([])
    setPaymentAmounts({})
    try {
      const result = await service.listPayableReceipts(supplier.id)
      setPaymentSupplier(supplier)
      setPayableReceipts(result.items)
      setPaymentAmounts(Object.fromEntries(result.items.map((receipt) => [receipt.id, receipt.outstanding_amount])))
      setPaymentMethod('cash')
      setPaymentFinanceAccountId('')
      setPaymentNote('')
    } catch (cause) {
      setError(formatApiError(cause, 'Không tải được phiếu nhập còn nợ.'))
    }
  }

  async function saveSupplierPayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (paymentSupplier === null) return

    const allocations = payableReceipts
      .map((receipt) => ({ receipt, amount: Number(paymentAmounts[receipt.id] || 0) }))
      .filter((item) => item.amount > 0)

    if (allocations.length === 0) {
      setError('Chọn ít nhất một phiếu nhập để thanh toán.')
      return
    }
    if (allocations.some((item) => item.amount > item.receipt.outstanding_amount)) {
      setError('Không được trả vượt số còn nợ của phiếu nhập.')
      return
    }
    if (paymentMethod === 'bank_transfer' && paymentFinanceAccountId === '') {
      setError('Chọn tài khoản chuyển khoản trước khi lưu thanh toán NCC.')
      return
    }

    setPaying(true)
    setError(null)
    try {
      await service.paySupplier(paymentSupplier.id, {
        payment_method: paymentMethod,
        ...(paymentMethod === 'bank_transfer' ? { finance_account_id: paymentFinanceAccountId } : {}),
        ...(paymentNote.trim() ? { note: paymentNote.trim() } : {}),
        allocations: allocations.map((item) => ({
          purchase_receipt_id: item.receipt.id,
          amount: item.amount,
        })),
      })
      setPaymentSupplier(null)
      setPayableReceipts([])
      setPaymentAmounts({})
      await loadSuppliers()
    } catch (cause) {
      setError(formatApiError(cause, 'Không lưu được thanh toán NCC.'))
    } finally {
      setPaying(false)
    }
  }

  function resetForm() {
    setEditingId(null)
    setDetailOpen(true)
    setPaymentSupplier(null)
    setForm(blankForm)
  }

  function openCreateSupplier() {
    setEditingId(null)
    setPaymentSupplier(null)
    setDetailOpen(true)
    setForm(blankForm)
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const canGoPrevious = page > 1
  const canGoNext = page < totalPages
  const activeFilterSummary = lastSearch
    ? `Tìm: ${lastSearch}`
    : lastStatus === 'active'
      ? 'Đang hoạt động'
      : `Trạng thái: ${supplierStatusText(lastStatus)}`

  const supplierKpis = (
    <MetricGrid ariaLabel="Tổng quan nhà cung cấp">
        <MetricCard hint={status === 'active' ? 'Đang hoạt động' : supplierStatusText(status)} label="Tổng NCC" value={total || visibleSupplierTotal} />
        <MetricCard hint="Từ danh sách đang xem" label="Nợ cần trả" tone={payableTotal > 0 ? 'warning' : 'neutral'} value={<MoneyText value={payableTotal} />} />
        <MetricCard hint="Phiếu nhập posted" label="Tổng mua" tone="success" value={<MoneyText value={purchaseTotal} />} />
      </MetricGrid>
  )

  function supplierForm() {
    return (
      <form aria-label="Thông tin nhà cung cấp" className="supplier-form" onSubmit={saveSupplier}>
        <header>
          <h2>{editingId ? 'Sửa nhà cung cấp' : 'Thêm nhà cung cấp'}</h2>
          {editingId ? (
            <button className="button button-secondary" type="button" onClick={resetForm}>
              <Plus aria-hidden="true" size={15} />
              Tạo mới
            </button>
          ) : null}
        </header>
        <label>
          Mã NCC
          <input value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))} />
        </label>
        <label>
          Tên NCC
          <input
            required
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
        </label>
        <label>
          Điện thoại
          <input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
        </label>
        <label>
          Email
          <input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
        </label>
        <label>
          Địa chỉ
          <input
            value={form.address}
            onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
          />
        </label>
        <label>
          Mã số thuế
          <input
            value={form.tax_code}
            onChange={(event) => setForm((current) => ({ ...current, tax_code: event.target.value }))}
          />
        </label>
        <label>
          Khách hàng liên kết
          <select
            value={form.linked_customer_id ?? ''}
            onChange={(event) =>
              setForm((current) => ({ ...current, linked_customer_id: event.target.value || null }))
            }
          >
            <option value="">Không liên kết</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.code} - {customer.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Ghi chú
          <textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
        </label>
        <label>
          Trạng thái NCC
          <select
            value={form.status}
            onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as SupplierStatus }))}
          >
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>
        </label>
        <button className="button button-primary" disabled={saving} type="submit">
          <Save aria-hidden="true" size={16} />
          Lưu nhà cung cấp
        </button>
      </form>
    )
  }

  function supplierPaymentForm() {
    if (!paymentSupplier) return null
    return (
      <form noValidate aria-label="Thanh toán nhà cung cấp" className="supplier-form" onSubmit={saveSupplierPayment}>
        <header>
          <h2>Thanh toán {paymentSupplier.code}</h2>
          <button className="button button-ghost" type="button" onClick={() => setPaymentSupplier(null)}>
            <X aria-hidden="true" size={15} />
            Đóng
          </button>
        </header>
        {payableReceipts.length === 0 ? (
          <p>Không còn phiếu nhập posted cần trả cho NCC này.</p>
        ) : (
          <div className="receipt-lines">
            {payableReceipts.map((receipt) => (
              <fieldset key={receipt.id}>
                <legend>{receipt.code}</legend>
                <p>Còn nợ: {money(receipt.outstanding_amount)}</p>
                <label>
                  Số tiền trả cho {receipt.code}
                  <input
                    min="0"
                    max={receipt.outstanding_amount}
                    step="1000"
                    type="number"
                    value={paymentAmounts[receipt.id] ?? 0}
                    onChange={(event) =>
                      setPaymentAmounts((current) => ({ ...current, [receipt.id]: Number(event.target.value) }))
                    }
                  />
                </label>
              </fieldset>
            ))}
          </div>
        )}
        <label>
          Phương thức trả NCC
          <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as 'cash' | 'bank_transfer')}>
            <option value="cash">Tiền mặt</option>
            <option value="bank_transfer">Chuyển khoản</option>
          </select>
        </label>
        {paymentMethod === 'bank_transfer' ? (
          <label>
            Tài khoản chuyển khoản NCC
            <select value={paymentFinanceAccountId} onChange={(event) => setPaymentFinanceAccountId(event.target.value)}>
              <option value="">Chọn tài khoản</option>
              {bankAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.code} - {account.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label>
          Ghi chú thanh toán
          <textarea value={paymentNote} onChange={(event) => setPaymentNote(event.target.value)} />
        </label>
        <button className="button button-primary" disabled={paying || payableReceipts.length === 0} type="submit">
          <WalletCards aria-hidden="true" size={16} />
          Lưu thanh toán NCC
        </button>
      </form>
    )
  }

  return (
    <ManagementPage
      title="Nhà cung cấp"
      actions={
        <ManagementCompactToolbar ariaLabel="Lọc nhà cung cấp" onSubmit={filterSuppliers}>
          <ManagementCompactSearch
            label="Tìm NCC"
            leadingIcon={<Search aria-hidden="true" size={16} />}
            placeholder="Tìm mã, tên, điện thoại"
            trailingAction={
              <ManagementActionIconButton ariaLabel="Tạo nhà cung cấp" variant="primary" onClick={openCreateSupplier}>
                <Plus aria-hidden="true" size={16} />
              </ManagementActionIconButton>
            }
            value={search}
            onChange={setSearch}
          />
        </ManagementCompactToolbar>
      }
      kpis={supplierKpis}
      filter={
        <ManagementFilterSidebar
          activeSummary={activeFilterSummary}
          ariaLabel="Bộ lọc nhà cung cấp"
          title="Bộ lọc"
          actions={
            <button className="button button-secondary" type="button" onClick={() => void resetSupplierFilters()}>
              <RotateCcw aria-hidden="true" size={15} />
              Đặt lại bộ lọc
            </button>
          }
        >
          <button
            aria-label="Ẩn bộ lọc nhà cung cấp"
            className="management-filter-collapse-button"
            title="Ẩn bộ lọc"
            type="button"
            onClick={() => setShowFilters(false)}
          >
            <ChevronLeft aria-hidden="true" size={16} />
          </button>
          <ManagementFilterGroup title="Trạng thái">
            <label>
              <input checked={status === 'active'} name="supplier-status" type="radio" onChange={() => setStatus('active')} />
              Đang hoạt động
            </label>
            <label>
              <input checked={status === 'inactive'} name="supplier-status" type="radio" onChange={() => setStatus('inactive')} />
              Ngừng hoạt động
            </label>
            <label>
              <input checked={status === 'all'} name="supplier-status" type="radio" onChange={() => setStatus('all')} />
              Tất cả
            </label>
          </ManagementFilterGroup>
        </ManagementFilterSidebar>
      }
      filterVisible={showFilters}
      filterCollapsedControl={
        <button
          aria-label="Mở bộ lọc nhà cung cấp"
          className="management-filter-expand-button"
          title="Mở bộ lọc"
          type="button"
          onClick={() => setShowFilters(true)}
        >
          <ChevronRight aria-hidden="true" size={16} />
        </button>
      }
    >
      <ManagementListSurface ariaLabel="Danh sách nhà cung cấp">
        {error ? <p role="alert">{error}</p> : null}
        {suppliers === null && error === null ? <p>Đang tải nhà cung cấp...</p> : null}
        {isCreatingSupplier ? supplierForm() : null}
        {suppliers ? (
          suppliers.length === 0 ? (
            <EmptyState>
              <p>Chưa có nhà cung cấp phù hợp bộ lọc.</p>
            </EmptyState>
          ) : (
            <>
              <ManagementTableViewport>
                <table>
                  <thead>
                    <tr>
                      <th>Mã NCC</th>
                      <th>Tên NCC</th>
                      <th>Điện thoại</th>
                      <th>Email</th>
                      <th>Nợ hiện tại</th>
                      <th>Tổng mua</th>
                      <th>Khách hàng liên kết</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.map((supplier) => {
                      const detailForRow = editingId === supplier.id || paymentSupplier?.id === supplier.id
                      return (
                        <Fragment key={supplier.id}>
                          <tr>
                            <td>{supplier.code}</td>
                            <td>{supplier.name}</td>
                            <td>{supplier.phone ?? '-'}</td>
                            <td>{supplier.email ?? '-'}</td>
                            <td><MoneyText value={supplier.current_payable_amount} /></td>
                            <td><MoneyText value={supplier.total_purchase_amount} /></td>
                            <td>
                              {supplier.linked_customer
                                ? `${supplier.linked_customer.code} - ${supplier.linked_customer.name}`
                                : '-'}
                            </td>
                            <td>
                              <StatusChip tone={supplier.status === 'active' ? 'success' : 'neutral'}>
                                {supplier.status === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                              </StatusChip>
                            </td>
                            <td>
                              <div className="row-actions">
                                <ManagementRowActionButton ariaLabel={`Sửa ${supplier.code}`} onClick={() => void openSupplier(supplier)}>
                                  <Pencil aria-hidden="true" size={15} />
                                </ManagementRowActionButton>
                                {supplier.current_payable_amount > 0 ? (
                                  <ManagementRowActionButton ariaLabel={`Thanh toán ${supplier.code}`} onClick={() => void openSupplierPayment(supplier)}>
                                    <WalletCards aria-hidden="true" size={15} />
                                  </ManagementRowActionButton>
                                ) : null}
                              </div>
                            </td>
                          </tr>
                          {detailForRow ? (
                            <ManagementDetailRow colSpan={9} label="Hồ sơ và thanh toán nhà cung cấp">
                              {paymentSupplier?.id === supplier.id ? supplierPaymentForm() : supplierForm()}
                            </ManagementDetailRow>
                          ) : null}
                        </Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </ManagementTableViewport>
              <ManagementTableFooter
                ariaLabel="Phân trang nhà cung cấp"
                canGoNext={canGoNext}
                canGoPrevious={canGoPrevious}
                entityLabel="nhà cung cấp"
                page={page}
                pageSize={pageSize}
                total={total}
                onNext={() => void goToPage(page + 1)}
                onPrevious={() => void goToPage(page - 1)}
              />
            </>
          )
        ) : null}
      </ManagementListSurface>
    </ManagementPage>
  )
}
