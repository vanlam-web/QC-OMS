import { Fragment, useEffect, useState } from 'react'
import { Columns3, Download, RotateCcw, Search, WalletCards } from 'lucide-react'
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
  CashbookColumnKey,
  CashbookDirection,
  CashbookEntry,
  CashbookEntryDetail,
  CashbookSearchScope,
  CashbookStatus,
  CashbookVoucher,
  CreateCashbookVoucherInput,
  CustomerDebtDetail,
  CustomerDebtSummary,
  FinanceAccount,
  CashbookBalance,
  PartnerDebtMode,
} from './types'
import type { FinanceService } from './finance-service'
import { buildCashbookCsv } from './finance-service'

const pageSizeDefault = 15
const defaultCashbookColumns: CashbookColumnKey[] = [
  'code',
  'created_at',
  'finance_account',
  'source_type',
  'amount_delta',
  'status',
]
const cashbookColumnDefinitions: Array<{ key: CashbookColumnKey; label: string }> = [
  { key: 'code', label: 'Mã phiếu' },
  { key: 'created_at', label: 'Thời gian' },
  { key: 'source_type', label: 'Nguồn' },
  { key: 'counterparty', label: 'Người nộp/nhận' },
  { key: 'finance_account', label: 'Quỹ/tài khoản' },
  { key: 'amount_delta', label: 'Giá trị' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'note', label: 'Ghi chú' },
  { key: 'is_business_accounted', label: 'Hạch toán KQKD' },
]

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

function sourceTypeText(value: CashbookEntry['source_type']) {
  return value === 'payment_receipt_method' ? 'Phiếu thu' : 'Phiếu quỹ'
}

function voucherTypeOptions(direction: CashbookDirection): Array<{ value: CreateCashbookVoucherInput['voucher_type']; label: string }> {
  if (direction === 'in') {
    return [
      { value: 'other_income', label: 'Thu nhập khác' },
      { value: 'capital_contribution', label: 'Góp vốn' },
      { value: 'transfer', label: 'Chuyển/Rút' },
    ]
  }
  return [
    { value: 'material_purchase', label: 'Vật tư' },
    { value: 'supplier_payment', label: 'Tiền trả NCC' },
    { value: 'staff_salary', label: 'Lương NV' },
    { value: 'shipping_expense', label: 'Vận chuyển' },
    { value: 'customer_refund', label: 'Hoàn tiền khách' },
    { value: 'operating_expense', label: 'Chi phí vận hành' },
    { value: 'tax_or_vat', label: 'Thuế/VAT' },
    { value: 'commission', label: 'Hoa hồng' },
    { value: 'transfer', label: 'Chuyển/Rút' },
    { value: 'other_expense', label: 'Chi khác' },
  ]
}

function partnerDebtModeText(value: PartnerDebtMode) {
  if (value === 'affects_partner_debt') return 'Có ảnh hưởng công nợ'
  if (value === 'not_affect_partner_debt') return 'Không ảnh hưởng công nợ'
  return 'Không áp dụng công nợ'
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
  const [cashbookSearchScope, setCashbookSearchScope] = useState<CashbookSearchScope>('all')
  const [lastCashbookSearchScope, setLastCashbookSearchScope] = useState<CashbookSearchScope>('all')
  const [cashbookFrom, setCashbookFrom] = useState('')
  const [lastCashbookFrom, setLastCashbookFrom] = useState('')
  const [cashbookTo, setCashbookTo] = useState('')
  const [lastCashbookTo, setLastCashbookTo] = useState('')
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
  const [showCashbookColumns, setShowCashbookColumns] = useState(false)
  const [visibleCashbookColumns, setVisibleCashbookColumns] = useState<CashbookColumnKey[]>(defaultCashbookColumns)
  const [vouchers, setVouchers] = useState<CashbookVoucher[]>([])
  const [voucherMode, setVoucherMode] = useState<CashbookDirection | null>(null)
  const [editingVoucher, setEditingVoucher] = useState<CashbookVoucher | null>(null)
  const [voucherAccountId, setVoucherAccountId] = useState('')
  const [voucherType, setVoucherType] = useState<CreateCashbookVoucherInput['voucher_type']>('other_income')
  const [voucherAmount, setVoucherAmount] = useState('')
  const [voucherPartnerDebtMode, setVoucherPartnerDebtMode] = useState<PartnerDebtMode>('no_partner_debt')
  const [voucherBusinessAccounted, setVoucherBusinessAccounted] = useState(true)
  const [voucherCounterpartyType, setVoucherCounterpartyType] = useState<CreateCashbookVoucherInput['counterparty_type']>('none')
  const [voucherCounterpartyName, setVoucherCounterpartyName] = useState('')
  const [voucherCounterpartyPhone, setVoucherCounterpartyPhone] = useState('')
  const [voucherReason, setVoucherReason] = useState('')
  const [savingVoucher, setSavingVoucher] = useState(false)
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
  const activeAccounts = accounts.filter((account) => account.is_active)
  const totalDebtAmount = debts?.reduce((sum, debt) => sum + debt.total_debt, 0) ?? 0
  const totalBalanceAmount = balances.reduce((sum, balance) => sum + balance.balance, 0)

  function openVoucherForm(direction: CashbookDirection) {
    const options = voucherTypeOptions(direction)
    setEditingVoucher(null)
    setVoucherMode(direction)
    setVoucherAccountId(accounts.find((account) => account.is_active)?.id ?? '')
    setVoucherType(options[0].value)
    setVoucherAmount('')
    setVoucherPartnerDebtMode('no_partner_debt')
    setVoucherBusinessAccounted(direction === 'out')
    setVoucherCounterpartyType('none')
    setVoucherCounterpartyName('')
    setVoucherCounterpartyPhone('')
    setVoucherReason('')
    setError(null)
    setMessage(null)
  }

  function openVoucherRevision(voucher: CashbookVoucher) {
    const direction: CashbookDirection = voucher.code.startsWith('PT') ? 'in' : 'out'
    setEditingVoucher(voucher)
    setVoucherMode(direction)
    setVoucherAccountId(accounts.find((account) => account.is_active)?.id ?? '')
    setVoucherType(direction === 'in' ? 'other_income' : 'operating_expense')
    setVoucherAmount(String(voucher.amount))
    setVoucherPartnerDebtMode('no_partner_debt')
    setVoucherBusinessAccounted(true)
    setVoucherCounterpartyType('none')
    setVoucherCounterpartyName('')
    setVoucherCounterpartyPhone('')
    setVoucherReason('')
    setError(null)
    setMessage(null)
  }

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
    search_scope?: CashbookSearchScope
    from?: string
    to?: string
    finance_account_id?: string
    direction?: CashbookDirection | 'all'
    status?: CashbookStatus | 'all'
    business_accounted_filter?: CashbookBusinessAccountedFilter
    page?: number
    page_size?: number
  } = {}) {
    const nextSearch = input.search ?? lastCashbookSearch
    const nextSearchScope = input.search_scope ?? lastCashbookSearchScope
    const nextFrom = input.from ?? lastCashbookFrom
    const nextTo = input.to ?? lastCashbookTo
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
        search_scope: nextSearchScope,
        from: nextFrom.trim() || undefined,
        to: nextTo.trim() || undefined,
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
      setLastCashbookSearchScope(nextSearchScope)
      setLastCashbookFrom(nextFrom.trim())
      setLastCashbookTo(nextTo.trim())
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
      search_scope: cashbookSearchScope,
      from: cashbookFrom,
      to: cashbookTo,
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

  function toggleCashbookColumn(column: CashbookColumnKey) {
    setVisibleCashbookColumns((current) =>
      current.includes(column)
        ? current.filter((item) => item !== column)
        : [...current, column],
    )
  }

  function exportCashbook() {
    const csv = buildCashbookCsv(cashbookEntries ?? [])
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'so-quy.csv'
    anchor.click()
    URL.revokeObjectURL(url)
    setMessage('Đã tạo file sổ quỹ.')
  }

  function cashbookCell(entry: CashbookEntry, column: CashbookColumnKey) {
    if (column === 'code') {
      return (
        <button
          aria-label={`Mở chi tiết ${entry.code}`}
          className="management-link-button"
          type="button"
          onClick={() => void openCashbookEntry(entry)}
        >
          <strong>{entry.code}</strong>
        </button>
      )
    }
    if (column === 'created_at') return dateText(entry.created_at)
    if (column === 'finance_account') return `${entry.finance_account.code} · ${entry.finance_account.name}`
    if (column === 'source_type') return sourceTypeText(entry.source_type)
    if (column === 'counterparty') return '-'
    if (column === 'amount_delta') return <MoneyText value={entry.amount_delta} />
    if (column === 'status') return <StatusChip tone={entry.status === 'posted' ? 'success' : 'neutral'}>{statusText(entry.status)}</StatusChip>
    if (column === 'note') return entry.note ?? '-'
    return entry.is_business_accounted ? 'Có' : 'Không'
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

  async function createManualVoucher(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (voucherMode === null) return
    const amount = Number(voucherAmount || 0)
    if (voucherAccountId === '') {
      setError('Chọn quỹ/tài khoản cho phiếu thu chi.')
      return
    }
    if (amount <= 0) {
      setError('Số tiền phiếu phải lớn hơn 0.')
      return
    }
    if (voucherReason.trim() === '') {
      setError('Nhập lý do cho phiếu thu chi.')
      return
    }
    setSavingVoucher(true)
    setError(null)
    setMessage(null)
    try {
      const payload = {
        voucher_direction: voucherMode,
        voucher_type: voucherType,
        finance_account_id: voucherAccountId,
        amount,
        partner_debt_mode: voucherPartnerDebtMode,
        is_business_accounted: voucherBusinessAccounted,
        counterparty_type: voucherCounterpartyType,
        ...(voucherCounterpartyName.trim() ? { counterparty_name: voucherCounterpartyName.trim() } : {}),
        ...(voucherCounterpartyPhone.trim() ? { counterparty_phone: voucherCounterpartyPhone.trim() } : {}),
        reason: voucherReason.trim(),
      }
      const result = editingVoucher === null
        ? await service.createCashbookVoucher(payload)
        : await service.reviseCashbookVoucher(editingVoucher.id, payload)
      setMessage(editingVoucher === null ? `Đã tạo phiếu ${result.code}.` : `Đã sửa phiếu ${result.code}.`)
      setVoucherMode(null)
      setEditingVoucher(null)
      await Promise.all([loadCashbook({ page: 1 }), loadReferenceData()])
    } catch (cause) {
      setError(formatApiError(cause, 'Không tạo được phiếu thu chi.'))
    } finally {
      setSavingVoucher(false)
    }
  }

  async function cancelManualVoucher(voucher: CashbookVoucher) {
    setError(null)
    setMessage(null)
    try {
      const result = await service.cancelCashbookVoucher(voucher.id)
      setMessage(`Đã hủy phiếu ${result.code}.`)
      await Promise.all([loadCashbook({ page: 1 }), loadReferenceData()])
    } catch (cause) {
      setError(formatApiError(cause, 'Không hủy được phiếu thu chi.'))
    }
  }

  return (
    <ManagementPage
      title="Sổ quỹ"
      actions={
        <div className="finance-page-actions">
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
          <div className="finance-voucher-actions" aria-label="Tạo phiếu thu chi">
            <button className="button button-secondary" type="button" onClick={() => openVoucherForm('in')}>Phiếu thu</button>
            <button className="button button-secondary" type="button" onClick={() => openVoucherForm('out')}>Phiếu chi</button>
          </div>
        </div>
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
            Tìm theo
            <select value={cashbookSearchScope} onChange={(event) => setCashbookSearchScope(event.target.value as CashbookSearchScope)}>
              <option value="all">Tất cả</option>
              <option value="code">Mã phiếu</option>
              <option value="note">Ghi chú</option>
              <option value="transfer_content">Nội dung chuyển khoản</option>
            </select>
          </label>
          <label>
            Từ ngày
            <input type="date" value={cashbookFrom} onChange={(event) => setCashbookFrom(event.target.value)} />
          </label>
          <label>
            Đến ngày
            <input type="date" value={cashbookTo} onChange={(event) => setCashbookTo(event.target.value)} />
          </label>
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

      {voucherMode !== null ? (
        <section
          aria-label={editingVoucher === null ? `Tạo phiếu ${voucherMode === 'in' ? 'thu' : 'chi'}` : `Sửa phiếu ${editingVoucher.code}`}
          className="management-inline-detail finance-voucher-panel"
        >
          <header>
            <div>
              <h2>{editingVoucher === null ? `Tạo phiếu ${voucherMode === 'in' ? 'thu' : 'chi'}` : `Sửa phiếu ${editingVoucher.code}`}</h2>
              <p>{editingVoucher === null ? (voucherMode === 'in' ? 'Ghi tăng quỹ' : 'Ghi giảm quỹ') : 'Tạo bản mới, phiếu cũ chuyển đã hủy'} ngay khi lưu.</p>
            </div>
            <button className="button button-secondary" type="button" onClick={() => { setVoucherMode(null); setEditingVoucher(null) }}>Đóng</button>
          </header>
          <form
            aria-label={editingVoucher === null ? `Tạo phiếu ${voucherMode === 'in' ? 'thu' : 'chi'}` : `Sửa phiếu ${editingVoucher.code}`}
            className="management-detail-form"
            onSubmit={createManualVoucher}
          >
            <label>
              Quỹ/tài khoản
              <select value={voucherAccountId} onChange={(event) => setVoucherAccountId(event.target.value)}>
                <option value="">Chọn quỹ</option>
                {activeAccounts.map((account) => (
                  <option key={account.id} value={account.id}>{account.code} · {account.name}</option>
                ))}
              </select>
            </label>
            <label>
              Loại phiếu
              <select
                value={voucherType}
                onChange={(event) => setVoucherType(event.target.value as CreateCashbookVoucherInput['voucher_type'])}
              >
                {voucherTypeOptions(voucherMode).map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label>
              Số tiền
              <input min="1" type="number" value={voucherAmount} onChange={(event) => setVoucherAmount(event.target.value)} />
            </label>
            <label>
              Công nợ đối tác
              <select
                value={voucherPartnerDebtMode}
                onChange={(event) => setVoucherPartnerDebtMode(event.target.value as PartnerDebtMode)}
              >
                <option value="no_partner_debt">{partnerDebtModeText('no_partner_debt')}</option>
                <option value="not_affect_partner_debt">{partnerDebtModeText('not_affect_partner_debt')}</option>
                <option value="affects_partner_debt">{partnerDebtModeText('affects_partner_debt')}</option>
              </select>
            </label>
            <label>
              Đối tượng
              <select
                value={voucherCounterpartyType}
                onChange={(event) => setVoucherCounterpartyType(event.target.value as CreateCashbookVoucherInput['counterparty_type'])}
              >
                <option value="none">Không có</option>
                <option value="customer">Khách hàng</option>
                <option value="supplier">Nhà cung cấp</option>
                <option value="employee">Nhân viên</option>
                <option value="other">Khác</option>
              </select>
            </label>
            <label>
              Người nộp/nhận
              <input value={voucherCounterpartyName} onChange={(event) => setVoucherCounterpartyName(event.target.value)} />
            </label>
            <label>
              Số điện thoại
              <input value={voucherCounterpartyPhone} onChange={(event) => setVoucherCounterpartyPhone(event.target.value)} />
            </label>
            <label>
              <input
                checked={!voucherBusinessAccounted}
                type="checkbox"
                onChange={(event) => setVoucherBusinessAccounted(!event.target.checked)}
              />
              Không hạch toán KQKD
            </label>
            <label>
              Lý do
              <input value={voucherReason} onChange={(event) => setVoucherReason(event.target.value)} />
            </label>
            <button className="button button-primary" disabled={savingVoucher} type="submit">
              {editingVoucher === null ? `Lưu phiếu ${voucherMode === 'in' ? 'thu' : 'chi'}` : 'Lưu bản sửa'}
            </button>
          </form>
        </section>
      ) : null}

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
                setCashbookSearchScope('all')
                setCashbookFrom('')
                setCashbookTo('')
                setCashbookAccountId('all')
                setCashbookDirection('all')
                setCashbookStatus('all')
                setCashbookBusinessAccounted('all')
                void loadCashbook({
                  search: '',
                  search_scope: 'all',
                  from: '',
                  to: '',
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
            <button className="button button-secondary" type="button" onClick={() => setShowCashbookColumns((value) => !value)}>
              <Columns3 aria-hidden="true" size={16} />
              Cột
            </button>
            <button className="button button-secondary" type="button" onClick={exportCashbook}>
              <Download aria-hidden="true" size={16} />
              Xuất file
            </button>
          </ManagementCompactToolbar>
        </header>
        {showCashbookColumns ? (
          <section aria-label="Chọn cột sổ quỹ" className="finance-cashbook-columns">
            {cashbookColumnDefinitions.map((column) => (
              <label key={column.key}>
                <input
                  checked={visibleCashbookColumns.includes(column.key)}
                  disabled={column.key === 'code'}
                  type="checkbox"
                  onChange={() => toggleCashbookColumn(column.key)}
                />
                {column.label}
              </label>
            ))}
          </section>
        ) : null}
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
                    {visibleCashbookColumns.map((column) => (
                      <th key={column}>{cashbookColumnDefinitions.find((definition) => definition.key === column)?.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cashbookEntries.map((entry) => (
                    <Fragment key={entry.id}>
                      <tr>
                        {visibleCashbookColumns.map((column) => (
                          <td key={column}>{cashbookCell(entry, column)}</td>
                        ))}
                      </tr>
                      {selectedCashbookEntry?.id === entry.id ? (
                        <ManagementDetailRow colSpan={visibleCashbookColumns.length} label={`Chi tiết sổ quỹ ${entry.code}`}>
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
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map((voucher) => (
                  <tr key={voucher.id}>
                    <td><strong>{voucher.code}</strong></td>
                    <td>{voucher.source_type === 'payment_receipt' ? 'Phiếu thu' : 'Phiếu thủ công'}</td>
                    <td><StatusChip tone={voucher.status === 'posted' ? 'success' : 'neutral'}>{statusText(voucher.status)}</StatusChip></td>
                    <td><MoneyText value={voucher.amount} /></td>
                    <td>
                      {voucher.source_type === 'manual_voucher' && voucher.status === 'posted' ? (
                        <>
                          <ManagementRowActionButton
                            ariaLabel={`Sửa phiếu ${voucher.code}`}
                            onClick={() => openVoucherRevision(voucher)}
                          >
                            Sửa
                          </ManagementRowActionButton>
                          <ManagementRowActionButton
                            ariaLabel={`Hủy phiếu ${voucher.code}`}
                            onClick={() => void cancelManualVoucher(voucher)}
                          >
                            Hủy
                          </ManagementRowActionButton>
                        </>
                      ) : '-'}
                    </td>
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
