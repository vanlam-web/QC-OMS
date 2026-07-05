import { Fragment, useEffect, useState } from 'react'
import { RotateCcw, Search, WalletCards } from 'lucide-react'
import { formatApiError } from '../../lib/api/error-message'
import { EmptyState, MetricCard, MetricGrid, MoneyText, StatusChip } from '../../components/ui-shell/primitives'
import {
  ManagementCompactSearch,
  ManagementCompactToolbar,
  ManagementDetailRow,
  ManagementListSurface,
  ManagementPage,
  ManagementRowActionButton,
  ManagementTableFooter,
  ManagementTableViewport,
} from '../../components/ui-shell/management-layout'
import type {
  CashbookBusinessAccountedFilter,
  CashbookDirection,
  CashbookEntry,
  CashbookEntryDetail,
  CashbookStatus,
  CashbookVoucher,
  CustomerDebtDetail,
  CustomerDebtSummary,
  FinanceAccount,
  CashbookBalance,
} from './types'
import type { FinanceService } from './finance-service'

const pageSizeDefault = 15

function accountTypeText(type: FinanceAccount['account_type']) {
  return type === 'cash' ? 'Tiền mặt' : 'Ngân hàng'
}

function directionText(direction: CashbookDirection | 'all') {
  if (direction === 'in') return 'Thu'
  if (direction === 'out') return 'Chi'
  return 'Tất cả'
}

function statusText(status: 'posted' | 'cancelled') {
  return status === 'posted' ? 'Đã ghi' : 'Đã hủy'
}

function businessAccountedText(value: CashbookBusinessAccountedFilter) {
  if (value === 'true') return 'Có hạch toán'
  if (value === 'false') return 'Không hạch toán'
  return 'Tất cả'
}

function paymentMethodText(value: CashbookEntryDetail['payment_method']) {
  if (value === 'cash') return 'Tiền mặt'
  if (value === 'bank_transfer') return 'Ngân hàng'
  return 'Thủ công'
}

function dateText(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Chưa có'
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(parsed)
}

export function FinancePage({ service }: { service: FinanceService }) {
  const [accounts, setAccounts] = useState<FinanceAccount[]>([])
  const [balances, setBalances] = useState<CashbookBalance[]>([])
  const [debts, setDebts] = useState<CustomerDebtSummary[] | null>(null)
  const [debtTotal, setDebtTotal] = useState(0)
  const [debtPage, setDebtPage] = useState(1)
  const [debtPageSize, setDebtPageSize] = useState(pageSizeDefault)
  const [debtSearch, setDebtSearch] = useState('')
  const [lastDebtSearch, setLastDebtSearch] = useState('')
  const [selectedDebt, setSelectedDebt] = useState<CustomerDebtSummary | null>(null)
  const [debtDetail, setDebtDetail] = useState<CustomerDebtDetail | null>(null)
  const [cashbookEntries, setCashbookEntries] = useState<CashbookEntry[] | null>(null)
  const [cashbookTotal, setCashbookTotal] = useState(0)
  const [cashbookPage, setCashbookPage] = useState(1)
  const [cashbookPageSize, setCashbookPageSize] = useState(pageSizeDefault)
  const [cashbookSearch, setCashbookSearch] = useState('')
  const [lastCashbookSearch, setLastCashbookSearch] = useState('')
  const [cashbookAccountId, setCashbookAccountId] = useState('all')
  const [lastCashbookAccountId, setLastCashbookAccountId] = useState('all')
  const [cashbookDirection, setCashbookDirection] = useState<CashbookDirection | 'all'>('all')
  const [lastCashbookDirection, setLastCashbookDirection] = useState<CashbookDirection | 'all'>('all')
  const [cashbookStatus, setCashbookStatus] = useState<CashbookStatus | 'all'>('all')
  const [lastCashbookStatus, setLastCashbookStatus] = useState<CashbookStatus | 'all'>('all')
  const [cashbookBusinessAccounted, setCashbookBusinessAccounted] = useState<CashbookBusinessAccountedFilter>('all')
  const [lastCashbookBusinessAccounted, setLastCashbookBusinessAccounted] = useState<CashbookBusinessAccountedFilter>('all')
  const [cashbookSummary, setCashbookSummary] = useState({ opening_balance: 0, total_in: 0, total_out: 0, ending_balance: 0 })
  const [selectedCashbookEntry, setSelectedCashbookEntry] = useState<CashbookEntry | null>(null)
  const [cashbookDetail, setCashbookDetail] = useState<CashbookEntryDetail | null>(null)
  const [vouchers, setVouchers] = useState<CashbookVoucher[]>([])
  const [collectAmount, setCollectAmount] = useState('')
  const [cashAmount, setCashAmount] = useState('')
  const [bankAmount, setBankAmount] = useState('')
  const [bankAccountId, setBankAccountId] = useState('')
  const [bankRef, setBankRef] = useState('')
  const [note, setNote] = useState('')
  const [collecting, setCollecting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const activeBankAccounts = accounts.filter((account) => account.is_active && account.account_type === 'bank')
  const totalDebtAmount = debts?.reduce((sum, debt) => sum + debt.total_debt, 0) ?? 0
  const totalBalanceAmount = balances.reduce((sum, balance) => sum + balance.balance, 0)

  async function loadDebts(input: { search?: string; page?: number; page_size?: number } = {}) {
    const nextSearch = input.search ?? lastDebtSearch
    const nextPage = input.page ?? debtPage
    const nextPageSize = input.page_size ?? debtPageSize
    setError(null)
    try {
      const result = await service.listCustomerDebts({
        search: nextSearch.trim() || undefined,
        page: nextPage,
        page_size: nextPageSize,
      })
      setDebts(result.items)
      setDebtTotal(result.total)
      setDebtPage(result.page)
      setDebtPageSize(result.page_size)
      setLastDebtSearch(nextSearch.trim())
    } catch (cause) {
      setError(formatApiError(cause, 'Không tải được công nợ khách hàng.'))
    }
  }

  async function loadCashbook(input: {
    search?: string
    finance_account_id?: string
    direction?: CashbookDirection | 'all'
    status?: CashbookStatus | 'all'
    business_accounted_filter?: CashbookBusinessAccountedFilter
    page?: number
    page_size?: number
  } = {}) {
    const nextSearch = input.search ?? lastCashbookSearch
    const nextAccountId = input.finance_account_id ?? lastCashbookAccountId
    const nextDirection = input.direction ?? lastCashbookDirection
    const nextStatus = input.status ?? lastCashbookStatus
    const nextBusinessAccounted = input.business_accounted_filter ?? lastCashbookBusinessAccounted
    const nextPage = input.page ?? cashbookPage
    const nextPageSize = input.page_size ?? cashbookPageSize
    setError(null)
    try {
      const result = await service.listCashbookEntries({
        search: nextSearch.trim() || undefined,
        finance_account_id: nextAccountId === 'all' ? undefined : nextAccountId,
        direction: nextDirection,
        status: nextStatus,
        is_business_accounted: nextBusinessAccounted === 'all' ? undefined : nextBusinessAccounted === 'true',
        page: nextPage,
        page_size: nextPageSize,
      })
      setCashbookEntries(result.items)
      setCashbookSummary(result.summary)
      setCashbookTotal(result.total)
      setCashbookPage(result.page)
      setCashbookPageSize(result.page_size)
      setLastCashbookSearch(nextSearch.trim())
      setLastCashbookAccountId(nextAccountId)
      setLastCashbookDirection(nextDirection)
      setLastCashbookStatus(nextStatus)
      setLastCashbookBusinessAccounted(nextBusinessAccounted)
    } catch (cause) {
      setError(formatApiError(cause, 'Không tải được sổ quỹ.'))
    }
  }

  async function loadReferenceData() {
    setError(null)
    try {
      const [accountResult, balanceResult, voucherResult] = await Promise.all([
        service.listAccounts({ is_active: true }),
        service.listCashbookBalances(),
        service.listCashbookVouchers(),
      ])
      setAccounts(accountResult.items)
      setBalances(balanceResult.items)
      setVouchers(voucherResult.items)
    } catch (cause) {
      setError(formatApiError(cause, 'Không tải được dữ liệu tài chính.'))
    }
  }

  useEffect(() => {
    let active = true
    async function loadInitial() {
      setError(null)
      try {
        const [accountResult, balanceResult, voucherResult, debtResult, cashbookResult] = await Promise.all([
          service.listAccounts({ is_active: true }),
          service.listCashbookBalances(),
          service.listCashbookVouchers(),
          service.listCustomerDebts({ page: 1, page_size: pageSizeDefault }),
          service.listCashbookEntries({ page: 1, page_size: pageSizeDefault }),
        ])
        if (!active) return
        setAccounts(accountResult.items)
        setBalances(balanceResult.items)
        setVouchers(voucherResult.items)
        setDebts(debtResult.items)
        setDebtTotal(debtResult.total)
        setDebtPage(debtResult.page)
        setDebtPageSize(debtResult.page_size)
        setCashbookEntries(cashbookResult.items)
        setCashbookSummary(cashbookResult.summary)
        setCashbookTotal(cashbookResult.total)
        setCashbookPage(cashbookResult.page)
        setCashbookPageSize(cashbookResult.page_size)
      } catch (cause) {
        if (active) setError(formatApiError(cause, 'Không tải được dữ liệu tài chính.'))
      }
    }
    void loadInitial()
    return () => {
      active = false
    }
  }, [service])

  async function filterDebts(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setDebtPage(1)
    await loadDebts({ search: debtSearch, page: 1 })
  }

  async function filterCashbook(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCashbookPage(1)
    await loadCashbook({
      search: cashbookSearch,
      finance_account_id: cashbookAccountId,
      direction: cashbookDirection,
      status: cashbookStatus,
      business_accounted_filter: cashbookBusinessAccounted,
      page: 1,
    })
  }

  async function openCashbookEntry(entry: CashbookEntry) {
    setSelectedCashbookEntry(entry)
    setCashbookDetail(null)
    setError(null)
    try {
      setCashbookDetail(await service.getCashbookEntry(entry.id))
    } catch (cause) {
      setError(formatApiError(cause, 'Không tải được chi tiết sổ quỹ.'))
    }
  }

  async function openDebt(debt: CustomerDebtSummary) {
    if (debt.customer_id === null) return
    setError(null)
    setSelectedDebt(debt)
    setCollectAmount(String(debt.total_debt))
    setCashAmount(String(debt.total_debt))
    setBankAmount('0')
    setBankAccountId('')
    setBankRef('')
    setNote('')
    try {
      setDebtDetail(await service.getCustomerDebt(debt.customer_id))
    } catch (cause) {
      setError(formatApiError(cause, 'Không tải được chi tiết công nợ.'))
    }
  }

  async function collectDebt(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (selectedDebt?.customer_id === null || selectedDebt === null) return
    const amount = Number(collectAmount || 0)
    const cash = Number(cashAmount || 0)
    const bank = Number(bankAmount || 0)
    if (amount <= 0 || amount !== cash + bank) {
      setError('Số tiền thu phải lớn hơn 0 và bằng tiền mặt cộng chuyển khoản.')
      return
    }
    if (bank > 0 && bankAccountId === '') {
      setError('Chọn tài khoản ngân hàng khi có tiền chuyển khoản.')
      return
    }
    setCollecting(true)
    setError(null)
    setMessage(null)
    try {
      const result = await service.collectCustomerDebt({
        customer_id: selectedDebt.customer_id,
        amount,
        payment_method: {
          cash_amount: cash,
          bank_amount: bank,
          ...(bank > 0 ? { bank_account_id: bankAccountId } : {}),
          ...(bankRef.trim() ? { bank_transaction_ref: bankRef.trim() } : {}),
        },
        ...(note.trim() ? { note: note.trim() } : {}),
      })
      setMessage(`Đã thu nợ ${result.allocated_amount.toLocaleString('vi-VN')} qua phiếu ${result.payment_receipt_id}.`)
      await Promise.all([loadDebts(), loadCashbook(), loadReferenceData(), openDebt(selectedDebt)])
    } catch (cause) {
      setError(formatApiError(cause, 'Không thu được nợ khách hàng.'))
    } finally {
      setCollecting(false)
    }
  }

  return (
    <ManagementPage
      title="Sổ quỹ"
      actions={
        <ManagementCompactToolbar ariaLabel="Lọc công nợ khách hàng" onSubmit={filterDebts}>
          <ManagementCompactSearch
            label="Tìm công nợ"
            placeholder="Tên, mã khách, mã hóa đơn"
            value={debtSearch}
            leadingIcon={<Search aria-hidden="true" size={16} />}
            onChange={setDebtSearch}
          />
          <button className="button button-primary" type="submit">Lọc công nợ</button>
        </ManagementCompactToolbar>
      }
      kpis={
        <MetricGrid ariaLabel="Tổng quan sổ quỹ">
          <MetricCard label="Tồn quỹ" value={<MoneyText value={totalBalanceAmount} />} hint="Tiền mặt + ngân hàng" tone="success" />
          <MetricCard label="Công nợ khách" value={<MoneyText value={totalDebtAmount} />} hint="Từ danh sách đang xem" tone={totalDebtAmount > 0 ? 'warning' : 'neutral'} />
          <MetricCard label="Tổng thu" value={<MoneyText value={cashbookSummary.total_in} />} hint="Theo bộ lọc sổ quỹ" tone="info" />
        </MetricGrid>
      }
      filter={
        <form aria-label="Bộ lọc sổ quỹ" className="finance-cashbook-filter" onSubmit={filterCashbook}>
          <label>
            Quỹ tiền
            <select value={cashbookAccountId} onChange={(event) => setCashbookAccountId(event.target.value)}>
              <option value="all">Tổng quỹ</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>{account.code} · {account.name}</option>
              ))}
            </select>
          </label>
          <label>
            Loại chứng từ
            <select value={cashbookDirection} onChange={(event) => setCashbookDirection(event.target.value as CashbookDirection | 'all')}>
              <option value="all">{directionText('all')}</option>
              <option value="in">{directionText('in')}</option>
              <option value="out">{directionText('out')}</option>
            </select>
          </label>
          <label>
            Trạng thái sổ quỹ
            <select value={cashbookStatus} onChange={(event) => setCashbookStatus(event.target.value as CashbookStatus | 'all')}>
              <option value="all">Tất cả</option>
              <option value="posted">{statusText('posted')}</option>
              <option value="cancelled">{statusText('cancelled')}</option>
            </select>
          </label>
          <label>
            Hạch toán KQKD
            <select
              value={cashbookBusinessAccounted}
              onChange={(event) => setCashbookBusinessAccounted(event.target.value as CashbookBusinessAccountedFilter)}
            >
              <option value="all">{businessAccountedText('all')}</option>
              <option value="true">{businessAccountedText('true')}</option>
              <option value="false">{businessAccountedText('false')}</option>
            </select>
          </label>
          <button className="button button-primary" type="submit">Lọc sổ</button>
        </form>
      }
    >
      {error ? <p role="alert">{error}</p> : null}
      {message ? <p role="status">{message}</p> : null}

      <ManagementListSurface ariaLabel="Tài khoản quỹ">
        <h2>Tài khoản quỹ</h2>
        {balances.length === 0 ? <EmptyState>Chưa có số dư quỹ.</EmptyState> : (
          <ManagementTableViewport>
            <table aria-label="Tài khoản quỹ" className="management-table">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Tên</th>
                  <th>Loại</th>
                  <th>Số dư</th>
                </tr>
              </thead>
              <tbody>
                {balances.map((balance) => (
                  <tr key={balance.finance_account_id}>
                    <td><strong>{balance.code}</strong></td>
                    <td>{balance.name}</td>
                    <td>{accountTypeText(balance.account_type)}</td>
                    <td><MoneyText value={balance.balance} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ManagementTableViewport>
        )}
      </ManagementListSurface>

      <ManagementListSurface ariaLabel="Công nợ khách hàng">
        <h2>Công nợ khách hàng</h2>
        {debts === null ? <p>Đang tải công nợ...</p> : null}
        {debts !== null && debts.length === 0 ? <EmptyState>Chưa có công nợ khách hàng.</EmptyState> : null}
        {debts !== null && debts.length > 0 ? (
          <>
            <ManagementTableViewport>
              <table aria-label="Công nợ khách hàng" className="management-table">
                <thead>
                  <tr>
                    <th>Mã khách</th>
                    <th>Tên khách</th>
                    <th>Hóa đơn nợ</th>
                    <th>Hóa đơn cũ nhất</th>
                    <th>Tổng nợ</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {debts.map((debt) => (
                    <tr key={debt.customer_id ?? debt.customer_name}>
                      <td>{debt.customer_code ?? 'Khách lẻ'}</td>
                      <td>{debt.customer_name}</td>
                      <td>{debt.open_invoice_count}</td>
                      <td>{debt.oldest_order_code ?? '-'}</td>
                      <td><MoneyText value={debt.total_debt} /></td>
                      <td>
                        <ManagementRowActionButton
                          ariaLabel={`Thu nợ ${debt.customer_name}`}
                          disabled={debt.customer_id === null}
                          onClick={() => void openDebt(debt)}
                        >
                          Thu nợ
                        </ManagementRowActionButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ManagementTableViewport>
            <ManagementTableFooter
              ariaLabel="Phân trang công nợ"
              entityLabel="khách nợ"
              page={debtPage}
              pageSize={debtPageSize}
              total={debtTotal}
              canGoPrevious={debtPage > 1}
              canGoNext={debtPage * debtPageSize < debtTotal}
              onPageSizeChange={(nextPageSize) => void loadDebts({ page: 1, page_size: nextPageSize })}
              onFirst={() => void loadDebts({ page: 1 })}
              onPrevious={() => void loadDebts({ page: Math.max(1, debtPage - 1) })}
              onNext={() => void loadDebts({ page: debtPage + 1 })}
              onLast={() => void loadDebts({ page: Math.max(1, Math.ceil(debtTotal / debtPageSize)) })}
            />
          </>
        ) : null}
      </ManagementListSurface>

      {selectedDebt && debtDetail ? (
        <section aria-label={`Thu nợ ${selectedDebt.customer_name}`} className="management-inline-detail finance-collection-panel">
          <header>
            <div>
              <h2>{selectedDebt.customer_name}</h2>
              <p>{selectedDebt.customer_code ?? 'Khách hàng'} · còn nợ <MoneyText value={debtDetail.total_debt} /></p>
            </div>
            <button className="button button-secondary" type="button" onClick={() => setSelectedDebt(null)}>
              Đóng
            </button>
          </header>
          <form aria-label="Thu nợ khách hàng" className="management-detail-form" onSubmit={collectDebt}>
            <label>
              Tổng tiền thu
              <input min="1" type="number" value={collectAmount} onChange={(event) => setCollectAmount(event.target.value)} />
            </label>
            <label>
              Tiền mặt
              <input min="0" type="number" value={cashAmount} onChange={(event) => setCashAmount(event.target.value)} />
            </label>
            <label>
              Chuyển khoản
              <input min="0" type="number" value={bankAmount} onChange={(event) => setBankAmount(event.target.value)} />
            </label>
            <label>
              Tài khoản ngân hàng
              <select value={bankAccountId} onChange={(event) => setBankAccountId(event.target.value)}>
                <option value="">Không dùng</option>
                {activeBankAccounts.map((account) => (
                  <option key={account.id} value={account.id}>{account.code} · {account.name}</option>
                ))}
              </select>
            </label>
            <label>
              Mã giao dịch
              <input value={bankRef} onChange={(event) => setBankRef(event.target.value)} />
            </label>
            <label>
              Ghi chú
              <input value={note} onChange={(event) => setNote(event.target.value)} />
            </label>
            <button className="button button-primary" disabled={collecting} type="submit">
              <WalletCards aria-hidden="true" size={16} />
              Lưu thu nợ
            </button>
          </form>
          <section aria-label="Hóa đơn còn nợ">
            <h3>Hóa đơn còn nợ</h3>
            <ManagementTableViewport>
              <table aria-label="Hóa đơn còn nợ" className="management-table">
                <thead>
                  <tr>
                    <th>Mã hóa đơn</th>
                    <th>Ngày tạo</th>
                    <th>Tổng tiền</th>
                    <th>Đã thu</th>
                    <th>Còn nợ</th>
                  </tr>
                </thead>
                <tbody>
                  {debtDetail.invoices.map((invoice) => (
                    <tr key={invoice.order_id}>
                      <td>{invoice.order_code}</td>
                      <td>{dateText(invoice.created_at)}</td>
                      <td><MoneyText value={invoice.total_amount} /></td>
                      <td><MoneyText value={invoice.paid_amount} /></td>
                      <td><MoneyText value={invoice.remaining_debt} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ManagementTableViewport>
          </section>
        </section>
      ) : null}

      <ManagementListSurface ariaLabel="Sổ quỹ">
        <header className="finance-section-header">
          <h2>Sổ quỹ</h2>
          <ManagementCompactToolbar ariaLabel="Lọc sổ quỹ" onSubmit={filterCashbook}>
            <ManagementCompactSearch
              label="Tìm sổ quỹ"
              placeholder="Mã phiếu, ghi chú"
              value={cashbookSearch}
              leadingIcon={<Search aria-hidden="true" size={16} />}
              onChange={setCashbookSearch}
            />
            <select
              aria-label="Hướng thu chi"
              className="management-filter-select"
              value={cashbookDirection}
              onChange={(event) => setCashbookDirection(event.target.value as CashbookDirection | 'all')}
            >
              <option value="all">{directionText('all')}</option>
              <option value="in">{directionText('in')}</option>
              <option value="out">{directionText('out')}</option>
            </select>
            <button className="button button-primary" type="submit">Tìm sổ</button>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => {
                setCashbookSearch('')
                setCashbookAccountId('all')
                setCashbookDirection('all')
                setCashbookStatus('all')
                setCashbookBusinessAccounted('all')
                void loadCashbook({
                  search: '',
                  finance_account_id: 'all',
                  direction: 'all',
                  status: 'all',
                  business_accounted_filter: 'all',
                  page: 1,
                })
              }}
            >
              <RotateCcw aria-hidden="true" size={16} />
              Đặt lại
            </button>
          </ManagementCompactToolbar>
        </header>
        <MetricGrid ariaLabel="Tổng sổ quỹ">
          <MetricCard label="Quỹ đầu kỳ" value={<MoneyText value={cashbookSummary.opening_balance} />} hint="Theo bộ lọc" tone="neutral" />
          <MetricCard label="Tổng thu" value={<MoneyText value={cashbookSummary.total_in} />} hint="Theo bộ lọc" tone="success" />
          <MetricCard label="Tổng chi" value={<MoneyText value={cashbookSummary.total_out} />} hint="Theo bộ lọc" tone="warning" />
          <MetricCard label="Tồn quỹ" value={<MoneyText value={cashbookSummary.ending_balance} />} hint="Theo bộ lọc" tone="info" />
        </MetricGrid>
        {cashbookEntries === null ? <p>Đang tải sổ quỹ...</p> : null}
        {cashbookEntries !== null && cashbookEntries.length === 0 ? <EmptyState>Chưa có dòng sổ quỹ.</EmptyState> : null}
        {cashbookEntries !== null && cashbookEntries.length > 0 ? (
          <>
            <ManagementTableViewport>
              <table aria-label="Sổ quỹ" className="management-table">
                <thead>
                  <tr>
                    <th>Mã phiếu</th>
                    <th>Thời gian</th>
                    <th>Quỹ/tài khoản</th>
                    <th>Loại thu chi</th>
                    <th>Giá trị</th>
                    <th>Nguồn</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {cashbookEntries.map((entry) => (
                    <Fragment key={entry.id}>
                      <tr>
                        <td>
                          <button
                            aria-label={`Mở chi tiết ${entry.code}`}
                            className="management-link-button"
                            type="button"
                            onClick={() => void openCashbookEntry(entry)}
                          >
                            <strong>{entry.code}</strong>
                          </button>
                        </td>
                        <td>{dateText(entry.created_at)}</td>
                        <td>{entry.finance_account.code} · {entry.finance_account.name}</td>
                        <td>{directionText(entry.direction)}</td>
                        <td><MoneyText value={entry.amount_delta} /></td>
                        <td>{entry.source_type === 'payment_receipt_method' ? 'Phiếu thu' : 'Phiếu quỹ'}</td>
                        <td><StatusChip tone={entry.status === 'posted' ? 'success' : 'neutral'}>{statusText(entry.status)}</StatusChip></td>
                      </tr>
                      {selectedCashbookEntry?.id === entry.id ? (
                        <ManagementDetailRow colSpan={7} label={`Chi tiết sổ quỹ ${entry.code}`}>
                          {cashbookDetail === null ? <p>Đang tải chi tiết...</p> : (
                            <div className="finance-cashbook-detail">
                              <header>
                                <div>
                                  <h3>{cashbookDetail.code}</h3>
                                  <p>{statusText(cashbookDetail.status)} · {cashbookDetail.is_business_accounted ? 'Có hạch toán' : 'Không hạch toán'}</p>
                                </div>
                                <button className="button button-secondary" type="button" onClick={() => setSelectedCashbookEntry(null)}>Đóng</button>
                              </header>
                              <dl>
                                <div><dt>Người tạo</dt><dd>{cashbookDetail.created_by.name}</dd></div>
                                <div><dt>Thời gian</dt><dd>{dateText(cashbookDetail.created_at)}</dd></div>
                                <div><dt>Phương thức thanh toán</dt><dd>{paymentMethodText(cashbookDetail.payment_method)}</dd></div>
                                <div><dt>Người nộp/nhận</dt><dd>{cashbookDetail.counterparty.name ?? '-'}</dd></div>
                                <div><dt>Số điện thoại</dt><dd>{cashbookDetail.counterparty.phone ?? '-'}</dd></div>
                                <div><dt>Chứng từ gốc</dt><dd>{cashbookDetail.source.order_code ?? cashbookDetail.source.code}</dd></div>
                                <div><dt>Ghi chú</dt><dd>{cashbookDetail.note ?? '-'}</dd></div>
                              </dl>
                              {cashbookDetail.allocations.length > 0 ? (
                                <section aria-label="Phân bổ hóa đơn">
                                  <h4>Phân bổ hóa đơn</h4>
                                  <ManagementTableViewport>
                                    <table aria-label="Phân bổ hóa đơn" className="management-table">
                                      <thead>
                                        <tr>
                                          <th>Mã hóa đơn</th>
                                          <th>Giá trị phiếu</th>
                                          <th>Đã thu trước</th>
                                          <th>Giá trị thu</th>
                                          <th>Còn lại</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {cashbookDetail.allocations.map((allocation) => (
                                          <tr key={allocation.order_id}>
                                            <td>{allocation.order_code}</td>
                                            <td><MoneyText value={allocation.order_total_amount} /></td>
                                            <td><MoneyText value={allocation.collected_before} /></td>
                                            <td><MoneyText value={allocation.allocated_amount} /></td>
                                            <td><MoneyText value={allocation.remaining_after} /></td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </ManagementTableViewport>
                                </section>
                              ) : null}
                            </div>
                          )}
                        </ManagementDetailRow>
                      ) : null}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </ManagementTableViewport>
            <ManagementTableFooter
              ariaLabel="Phân trang sổ quỹ"
              entityLabel="dòng sổ"
              page={cashbookPage}
              pageSize={cashbookPageSize}
              total={cashbookTotal}
              canGoPrevious={cashbookPage > 1}
              canGoNext={cashbookPage * cashbookPageSize < cashbookTotal}
              onPageSizeChange={(nextPageSize) => void loadCashbook({ page: 1, page_size: nextPageSize })}
              onFirst={() => void loadCashbook({ page: 1 })}
              onPrevious={() => void loadCashbook({ page: Math.max(1, cashbookPage - 1) })}
              onNext={() => void loadCashbook({ page: cashbookPage + 1 })}
              onLast={() => void loadCashbook({ page: Math.max(1, Math.ceil(cashbookTotal / cashbookPageSize)) })}
            />
          </>
        ) : null}
      </ManagementListSurface>

      <ManagementListSurface ariaLabel="Phiếu thu/chi">
        <h2>Phiếu thu/chi</h2>
        {vouchers.length === 0 ? <EmptyState>Chưa có phiếu thu/chi.</EmptyState> : (
          <ManagementTableViewport>
            <table aria-label="Phiếu thu/chi" className="management-table">
              <thead>
                <tr>
                  <th>Mã phiếu</th>
                  <th>Nguồn</th>
                  <th>Trạng thái</th>
                  <th>Số tiền</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map((voucher) => (
                  <tr key={voucher.id}>
                    <td><strong>{voucher.code}</strong></td>
                    <td>{voucher.source_type === 'payment_receipt' ? 'Phiếu thu' : 'Phiếu thủ công'}</td>
                    <td><StatusChip tone={voucher.status === 'posted' ? 'success' : 'neutral'}>{statusText(voucher.status)}</StatusChip></td>
                    <td><MoneyText value={voucher.amount} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ManagementTableViewport>
        )}
      </ManagementListSurface>
    </ManagementPage>
  )
}
