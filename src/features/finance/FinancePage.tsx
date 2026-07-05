import { Fragment, useEffect, useState } from 'react'
import { CalendarDays, ChevronRight, Download, Plus, Search, WalletCards } from 'lucide-react'
import { formatApiError } from '../../lib/api/error-message'
import { EmptyState, MetricCard, MetricGrid, MoneyText, StatusChip } from '../../components/ui-shell/primitives'
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
type CashbookTimeFilter = 'all' | 'today' | 'yesterday' | 'week' | 'last_week' | 'last_7_days' | 'month' | 'last_month' | 'last_30_days' | 'quarter' | 'last_quarter' | 'year' | 'last_year' | 'custom'
const showAuxiliaryFinanceSections = false
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

const cashbookQuickTimeGroups: Array<{ title: string; presets: Array<Exclude<CashbookTimeFilter, 'custom'>> }> = [
  { title: 'Theo ngày', presets: ['today', 'yesterday'] },
  { title: 'Theo tuần', presets: ['week', 'last_week', 'last_7_days'] },
  { title: 'Theo tháng', presets: ['month', 'last_month', 'last_30_days'] },
  { title: 'Theo quý', presets: ['quarter', 'last_quarter'] },
  { title: 'Theo năm', presets: ['year', 'last_year', 'all'] },
]

const cashbookQuickTimeLabels: Record<CashbookTimeFilter, string> = {
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

function accountTypeText(type: FinanceAccount['account_type']) {
  return type === 'cash' ? 'Tiền mặt' : 'Ngân hàng'
}

function statusText(status: 'posted' | 'cancelled') {
  return status === 'posted' ? 'Đã ghi' : 'Đã hủy'
}

function businessAccountedText(value: CashbookBusinessAccountedFilter) {
  if (value === 'true') return 'Có hạch toán'
  if (value === 'false') return 'Không hạch toán'
  return 'Tất cả'
}

function nextDirectionSelection(current: CashbookDirection[], value: CashbookDirection) {
  return current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
}

function directionFilterFromSelection(selection: CashbookDirection[]): CashbookDirection | 'all' {
  return selection.length === 1 ? selection[0] : 'all'
}

function nextStatusSelection(current: CashbookStatus[], value: CashbookStatus) {
  return current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
}

function statusFilterFromSelection(selection: CashbookStatus[]): CashbookStatus | 'all' {
  return selection.length === 1 ? selection[0] : 'all'
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

function cashbookQuickTimeRange(preset: Exclude<CashbookTimeFilter, 'custom'>) {
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
  const [cashbookSearch] = useState('')
  const [lastCashbookSearch, setLastCashbookSearch] = useState('')
  const [cashbookSearchScope] = useState<CashbookSearchScope>('all')
  const [lastCashbookSearchScope, setLastCashbookSearchScope] = useState<CashbookSearchScope>('all')
  const [cashbookTimeFilter, setCashbookTimeFilter] = useState<CashbookTimeFilter>('month')
  const [cashbookFrom, setCashbookFrom] = useState(() => currentMonthRange().from)
  const [lastCashbookFrom, setLastCashbookFrom] = useState(() => currentMonthRange().from)
  const [cashbookTo, setCashbookTo] = useState(() => currentMonthRange().to)
  const [lastCashbookTo, setLastCashbookTo] = useState(() => currentMonthRange().to)
  const [cashbookQuickTimeOpen, setCashbookQuickTimeOpen] = useState(false)
  const [cashbookAccountId, setCashbookAccountId] = useState('')
  const [lastCashbookAccountId, setLastCashbookAccountId] = useState('')
  const [cashbookDirectionSelection, setCashbookDirectionSelection] = useState<CashbookDirection[]>([])
  const cashbookDirection = directionFilterFromSelection(cashbookDirectionSelection)
  const [lastCashbookDirection, setLastCashbookDirection] = useState<CashbookDirection | 'all'>('all')
  const [cashbookStatusSelection, setCashbookStatusSelection] = useState<CashbookStatus[]>(['posted'])
  const cashbookStatus = statusFilterFromSelection(cashbookStatusSelection)
  const [lastCashbookStatus, setLastCashbookStatus] = useState<CashbookStatus | 'all'>('posted')
  const [cashbookBusinessAccounted, setCashbookBusinessAccounted] = useState<CashbookBusinessAccountedFilter>('all')
  const [lastCashbookBusinessAccounted, setLastCashbookBusinessAccounted] = useState<CashbookBusinessAccountedFilter>('all')
  const [cashbookSummary, setCashbookSummary] = useState({ opening_balance: 0, total_in: 0, total_out: 0, ending_balance: 0 })
  const [selectedCashbookEntry, setSelectedCashbookEntry] = useState<CashbookEntry | null>(null)
  const [cashbookDetail, setCashbookDetail] = useState<CashbookEntryDetail | null>(null)
  const visibleCashbookColumns = defaultCashbookColumns
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

  async function applyCashbookQuickTimeFilter(preset: Exclude<CashbookTimeFilter, 'custom'>) {
    const range = cashbookQuickTimeRange(preset)
    setCashbookTimeFilter(preset)
    setCashbookQuickTimeOpen(false)
    setCashbookFrom(range.from)
    setCashbookTo(range.to)
    await applyCashbookFilters({ from: range.from, to: range.to })
  }

  async function applyCashbookCustomDateFilter(input: { from?: string; to?: string } = {}) {
    const nextFrom = input.from ?? cashbookFrom
    const nextTo = input.to ?? cashbookTo
    setCashbookTimeFilter('custom')
    setCashbookQuickTimeOpen(false)
    setCashbookFrom(nextFrom)
    setCashbookTo(nextTo)
    await applyCashbookFilters({ from: nextFrom, to: nextTo })
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
        const accountResult = await service.listAccounts({ is_active: true })
        const defaultCashAccountId = accountResult.items.find((account) => account.account_type === 'cash' && account.is_default_cash)?.id
          ?? accountResult.items.find((account) => account.account_type === 'cash')?.id
          ?? 'all'
        const [balanceResult, voucherResult, debtResult, cashbookResult] = await Promise.all([
          service.listCashbookBalances(),
          service.listCashbookVouchers(),
          service.listCustomerDebts({ page: 1, page_size: pageSizeDefault }),
          service.listCashbookEntries({
            from: currentMonthRange().from,
            to: currentMonthRange().to,
            finance_account_id: defaultCashAccountId === 'all' ? undefined : defaultCashAccountId,
            direction: 'all',
            status: 'posted',
            page: 1,
            page_size: pageSizeDefault,
          }),
        ])
        if (!active) return
        setAccounts(accountResult.items)
        setCashbookAccountId(defaultCashAccountId)
        setLastCashbookAccountId(defaultCashAccountId)
        setLastCashbookStatus('posted')
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
    await applyCashbookFilters()
  }

  async function applyCashbookFilters(input: {
    from?: string
    to?: string
    finance_account_id?: string
    direction?: CashbookDirection | 'all'
    status?: CashbookStatus | 'all'
    business_accounted_filter?: CashbookBusinessAccountedFilter
  } = {}) {
    setCashbookPage(1)
    await loadCashbook({
      search: cashbookSearch,
      search_scope: cashbookSearchScope,
      from: input.from ?? cashbookFrom,
      to: input.to ?? cashbookTo,
      finance_account_id: input.finance_account_id ?? cashbookAccountId,
      direction: input.direction ?? cashbookDirection,
      status: input.status ?? cashbookStatus,
      business_accounted_filter: input.business_accounted_filter ?? cashbookBusinessAccounted,
      page: 1,
    })
  }

  async function chooseCashbookAccount(nextValue: string) {
    setCashbookAccountId(nextValue)
    await applyCashbookFilters({ finance_account_id: nextValue })
  }

  async function toggleCashbookDirection(nextValue: CashbookDirection) {
    const nextSelection = nextDirectionSelection(cashbookDirectionSelection, nextValue)
    const nextFilter = directionFilterFromSelection(nextSelection)
    setCashbookDirectionSelection(nextSelection)
    await applyCashbookFilters({ direction: nextFilter })
  }

  async function toggleCashbookStatus(nextValue: CashbookStatus) {
    const nextSelection = nextStatusSelection(cashbookStatusSelection, nextValue)
    const nextFilter = statusFilterFromSelection(nextSelection)
    setCashbookStatusSelection(nextSelection)
    await applyCashbookFilters({ status: nextFilter })
  }

  async function chooseCashbookBusinessAccounted(nextValue: CashbookBusinessAccountedFilter) {
    setCashbookBusinessAccounted(nextValue)
    await applyCashbookFilters({ business_accounted_filter: nextValue })
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
              trailingAction={
                <button
                  aria-label="Lọc công nợ"
                  className="management-compact-create-action"
                  title="Lọc công nợ"
                  type="submit"
                >
                  <Plus aria-hidden="true" size={18} strokeWidth={2} />
                </button>
              }
              onChange={setDebtSearch}
            />
          </ManagementCompactToolbar>
          <div className="finance-voucher-actions" aria-label="Tạo phiếu thu chi">
            <button className="button button-secondary" type="button" onClick={() => openVoucherForm('in')}>Phiếu thu</button>
            <button className="button button-secondary" type="button" onClick={() => openVoucherForm('out')}>Phiếu chi</button>
            <button className="button button-secondary" type="button" onClick={exportCashbook}>
              <Download aria-hidden="true" size={16} />
              Xuất file
            </button>
          </div>
        </div>
      }
      kpis={
        <MetricGrid ariaLabel="Tổng quan sổ quỹ">
          <MetricCard label="Quỹ đầu kỳ" value={<MoneyText value={cashbookSummary.opening_balance} />} hint="Theo bộ lọc" tone="neutral" />
          <MetricCard label="Tổng thu" value={<MoneyText value={cashbookSummary.total_in} />} hint="Theo bộ lọc sổ quỹ" tone="info" />
          <MetricCard label="Tổng chi" value={<MoneyText value={cashbookSummary.total_out} />} hint="Theo bộ lọc" tone="warning" />
          <MetricCard label="Tồn quỹ" value={<MoneyText value={cashbookSummary.ending_balance} />} hint="Theo bộ lọc" tone="success" />
        </MetricGrid>
      }
      filter={
        <ManagementFilterSidebar
          ariaLabel="Bộ lọc tài chính"
          popoverOpen={cashbookQuickTimeOpen}
        >
          <form id="cashbook-filter-form" aria-label="Bộ lọc sổ quỹ" className="management-filter-sidebar-form" onSubmit={filterCashbook}>
            <ManagementFilterGroup title="Thời gian">
              <div className="management-filter-time-options">
                <div
                  aria-expanded={cashbookQuickTimeOpen}
                  className={`management-filter-choice${cashbookTimeFilter !== 'custom' ? ' management-filter-choice-active' : ''}`}
                  onClick={() => {
                    if (cashbookTimeFilter === 'custom') void applyCashbookQuickTimeFilter('month')
                    else setCashbookQuickTimeOpen((current) => !current)
                  }}
                >
                  <input
                    aria-label={cashbookTimeFilter === 'custom' ? cashbookQuickTimeLabels.month : cashbookQuickTimeLabels[cashbookTimeFilter]}
                    checked={cashbookTimeFilter !== 'custom'}
                    name="cashbook-time"
                    readOnly
                    type="radio"
                    onChange={() => undefined}
                  />
                  <span>{cashbookTimeFilter === 'custom' ? cashbookQuickTimeLabels.month : cashbookQuickTimeLabels[cashbookTimeFilter]}</span>
                  <span className="management-filter-choice-trailing">
                    <ChevronRight aria-hidden="true" size={17} />
                  </span>
                </div>
                <label className={`management-filter-choice${cashbookTimeFilter === 'custom' ? ' management-filter-choice-active' : ''}`}>
                  <input
                    aria-label="Tùy chỉnh"
                    checked={cashbookTimeFilter === 'custom'}
                    name="cashbook-time"
                    type="radio"
                    onChange={() => void applyCashbookCustomDateFilter()}
                  />
                  <span>{cashbookTimeFilter === 'custom' ? `${displayDate(cashbookFrom)} - ${displayDate(cashbookTo)}` : 'Tùy chỉnh'}</span>
                  <CalendarDays aria-hidden="true" size={17} />
                </label>
              </div>
              {cashbookQuickTimeOpen ? (
                <div aria-label="Chọn nhanh thời gian" className="management-filter-quick-time-menu" role="region">
                  {cashbookQuickTimeGroups.map((group) => (
                    <section key={group.title}>
                      <h3>{group.title}</h3>
                      <div>
                        {group.presets.map((preset) => (
                          <button
                            className={cashbookTimeFilter === preset ? 'management-filter-quick-time-active' : undefined}
                            key={preset}
                            type="button"
                            onClick={() => void applyCashbookQuickTimeFilter(preset)}
                          >
                            {cashbookQuickTimeLabels[preset]}
                          </button>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              ) : null}
              {cashbookTimeFilter === 'custom' ? (
                <div className="management-filter-date-range">
                  <label>
                    <span>Từ ngày</span>
                    <input
                      aria-label="Từ ngày"
                      type="date"
                      value={cashbookFrom}
                      onChange={(event) => void applyCashbookCustomDateFilter({ from: event.target.value })}
                    />
                  </label>
                  <label>
                    <span>Đến ngày</span>
                    <input
                      aria-label="Đến ngày"
                      type="date"
                      value={cashbookTo}
                      onChange={(event) => void applyCashbookCustomDateFilter({ to: event.target.value })}
                    />
                  </label>
                </div>
              ) : null}
            </ManagementFilterGroup>
            <ManagementFilterGroup title="Quỹ tiền">
              {accounts.map((account) => (
                <label
                  className={`management-filter-choice${cashbookAccountId === account.id ? ' management-filter-choice-active' : ''}`}
                  key={account.id}
                >
                  <input
                    checked={cashbookAccountId === account.id}
                    name="cashbook-account"
                    type="radio"
                    onChange={() => void chooseCashbookAccount(account.id)}
                  />
                  <span>{account.code} · {account.name}</span>
                </label>
              ))}
              <label className={`management-filter-choice${cashbookAccountId === 'all' ? ' management-filter-choice-active' : ''}`}>
                <input
                  checked={cashbookAccountId === 'all'}
                  name="cashbook-account"
                  type="radio"
                  onChange={() => void chooseCashbookAccount('all')}
                />
                <span>Tổng quỹ</span>
              </label>
            </ManagementFilterGroup>
            <ManagementFilterGroup title="Loại chứng từ">
              <label className={`management-filter-choice${cashbookDirectionSelection.includes('in') ? ' management-filter-choice-active' : ''}`}>
                <input
                  checked={cashbookDirectionSelection.includes('in')}
                  type="checkbox"
                  onChange={() => void toggleCashbookDirection('in')}
                />
                <span>Phiếu thu</span>
              </label>
              <label className={`management-filter-choice${cashbookDirectionSelection.includes('out') ? ' management-filter-choice-active' : ''}`}>
                <input
                  checked={cashbookDirectionSelection.includes('out')}
                  type="checkbox"
                  onChange={() => void toggleCashbookDirection('out')}
                />
                <span>Phiếu chi</span>
              </label>
            </ManagementFilterGroup>
            <ManagementFilterGroup title="Trạng thái sổ quỹ">
              <label className={`management-filter-choice${cashbookStatusSelection.includes('posted') ? ' management-filter-choice-active' : ''}`}>
                <input
                  checked={cashbookStatusSelection.includes('posted')}
                  type="checkbox"
                  onChange={() => void toggleCashbookStatus('posted')}
                />
                <span>Đã thanh toán</span>
              </label>
              <label className={`management-filter-choice${cashbookStatusSelection.includes('cancelled') ? ' management-filter-choice-active' : ''}`}>
                <input
                  checked={cashbookStatusSelection.includes('cancelled')}
                  type="checkbox"
                  onChange={() => void toggleCashbookStatus('cancelled')}
                />
                <span>Đã hủy</span>
              </label>
            </ManagementFilterGroup>
            <ManagementFilterGroup title="Hạch toán KQKD">
              <div className="management-filter-segmented" role="radiogroup" aria-label="Hạch toán KQKD">
                {(['all', 'true', 'false'] as CashbookBusinessAccountedFilter[]).map((option) => (
                  <label
                    className={cashbookBusinessAccounted === option ? 'management-filter-segmented-active' : undefined}
                    key={option}
                  >
                    <input
                      checked={cashbookBusinessAccounted === option}
                      name="cashbook-business-accounted"
                      type="radio"
                      onChange={() => void chooseCashbookBusinessAccounted(option)}
                    />
                    <span>{option === 'false' ? 'Không' : option === 'true' ? 'Có' : businessAccountedText(option)}</span>
                  </label>
                ))}
              </div>
            </ManagementFilterGroup>
          </form>
        </ManagementFilterSidebar>
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

      {showAuxiliaryFinanceSections ? (
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
      ) : null}

      {showAuxiliaryFinanceSections ? (
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
      ) : null}

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

      {showAuxiliaryFinanceSections ? (
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
      ) : null}
    </ManagementPage>
  )
}
