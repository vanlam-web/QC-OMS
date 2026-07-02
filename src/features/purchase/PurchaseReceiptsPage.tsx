import { useEffect, useMemo, useState } from 'react'
import { Banknote, FilePlus2, Home, PackageCheck, Pencil, Plus, Save, Trash2, WalletCards } from 'lucide-react'
import { formatApiError } from '../../lib/api/error-message'
import type {
  PurchaseReceipt,
  PurchaseReceiptFinanceAccount,
  PurchaseReceiptInput,
  PurchaseReceiptInputItem,
  PurchaseReceiptProduct,
  PurchaseReceiptStatus,
  PurchasePhysicalPayload,
  RollPhysicalPayload,
  SheetPhysicalPayload,
} from './purchase-receipt-types'
import type { PurchaseReceiptService } from './purchase-receipt-service'
import type { Supplier } from './types'
import { EmptyState, MetricCard, MetricGrid, MoneyText, StatusChip } from '../../components/ui-shell/primitives'
import { DataToolbar, type ActiveFilterChip, type FilterPreset } from '../../components/ui-shell/filters'

const moneyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

const nowLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)

const blankLine = {
  product_id: '',
  inventory_shape: 'normal' as const,
  unit_name: '',
  quantity: 1,
  unit_cost: 0,
  discount_amount: 0,
  physical_payload: null,
}

const blankForm: PurchaseReceiptInput = {
  code: '',
  supplier_id: '',
  received_at: nowLocal,
  supplier_document_no: '',
  notes: '',
  discount_amount: 0,
  paid_amount: 0,
  items: [blankLine],
}

function money(value: number) {
  return moneyFormatter.format(value)
}

function statusText(status: PurchaseReceiptStatus) {
  if (status === 'draft') return 'Phiếu tạm'
  if (status === 'posted') return 'Đã nhập'
  return 'Đã hủy'
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

function isExactPurchaseReceiptCode(value: string) {
  return /^PN\d+/i.test(value.trim())
}

function lineAmount(line: PurchaseReceiptInput['items'][number]) {
  return Math.max(Math.round(Number(line.quantity || 0) * Number(line.unit_cost || 0)) - Number(line.discount_amount || 0), 0)
}

function defaultPhysicalPayload(shape: PurchaseReceiptInputItem['inventory_shape']): PurchasePhysicalPayload | null {
  if (shape === 'roll') return { rolls: { width_m: 1, lengths_m: [1] } }
  if (shape === 'sheet') return { sheet_groups: [{ width_m: 1, length_m: 1, quantity: 1 }] }
  return null
}

function purchaseUnitForProduct(product?: PurchaseReceiptProduct) {
  if (product?.inventory_shape === 'roll') return 'cuộn'
  if (product?.inventory_shape === 'sheet') return 'tấm'
  return product?.unit_name ?? ''
}

function rollPayload(payload: PurchasePhysicalPayload | null): RollPhysicalPayload {
  return payload !== null && 'rolls' in payload ? payload : { rolls: { width_m: 1, lengths_m: [1] } }
}

function sheetPayload(payload: PurchasePhysicalPayload | null): SheetPhysicalPayload {
  return payload !== null && 'sheet_groups' in payload ? payload : { sheet_groups: [{ width_m: 1, length_m: 1, quantity: 1 }] }
}

function rollTotalArea(payload: RollPhysicalPayload) {
  return payload.rolls.lengths_m.reduce((sum, length) => sum + Number(payload.rolls.width_m || 0) * Number(length || 0), 0)
}

function sheetTotalArea(payload: SheetPhysicalPayload) {
  return payload.sheet_groups.reduce(
    (sum, group) => sum + Number(group.width_m || 0) * Number(group.length_m || 0) * Number(group.quantity || 0),
    0,
  )
}

function physicalSummary(line: Pick<PurchaseReceiptInputItem, 'inventory_shape' | 'physical_payload'>) {
  if (line.inventory_shape === 'roll') {
    const payload = rollPayload(line.physical_payload)
    if (payload.rolls.lengths_m.length === 0) return `0 cuộn, khổ ${payload.rolls.width_m}m, tổng 0.000 m²`
    return `${payload.rolls.lengths_m.length} cuộn, khổ ${payload.rolls.width_m}m, tổng ${rollTotalArea(payload).toFixed(3)} m²`
  }
  if (line.inventory_shape === 'sheet') {
    const payload = sheetPayload(line.physical_payload)
    const sheetCount = payload.sheet_groups.reduce((sum, group) => sum + Number(group.quantity || 0), 0)
    return `${sheetCount} tấm, ${payload.sheet_groups.length} nhóm kích thước, tổng ${sheetTotalArea(payload).toFixed(3)} m²`
  }
  return null
}

export function PurchaseReceiptsPage({
  service,
  onOpenDashboard,
}: {
  service: PurchaseReceiptService
  onOpenDashboard: () => void
}) {
  const [receipts, setReceipts] = useState<PurchaseReceipt[] | null>(null)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<PurchaseReceiptProduct[]>([])
  const [financeAccounts, setFinanceAccounts] = useState<PurchaseReceiptFinanceAccount[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<PurchaseReceiptStatus | 'all'>('draft')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingStatus, setEditingStatus] = useState<PurchaseReceiptStatus | null>(null)
  const [selectedReceipt, setSelectedReceipt] = useState<PurchaseReceipt | null>(null)
  const [form, setForm] = useState<PurchaseReceiptInput>(blankForm)
  const [saving, setSaving] = useState(false)
  const [posting, setPosting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer'>('cash')
  const [financeAccountId, setFinanceAccountId] = useState('')
  const [supplierPaymentOpen, setSupplierPaymentOpen] = useState(false)
  const [supplierPaymentAmount, setSupplierPaymentAmount] = useState(0)
  const [supplierPaymentMethod, setSupplierPaymentMethod] = useState<'cash' | 'bank_transfer'>('cash')
  const [supplierPaymentFinanceAccountId, setSupplierPaymentFinanceAccountId] = useState('')
  const [rollLengthTexts, setRollLengthTexts] = useState<Record<number, string>>({})
  const [error, setError] = useState<string | null>(null)

  const totals = useMemo(() => {
    const subtotal = form.items.reduce((sum, line) => sum + lineAmount(line), 0)
    const payable = Math.max(subtotal - Number(form.discount_amount || 0), 0)
    const remaining = payable - Number(form.paid_amount || 0)
    return { subtotal, payable, remaining }
  }, [form.discount_amount, form.items, form.paid_amount])

  const lowCostWarnings = useMemo(() => {
    return form.items.flatMap((line, index) => {
      const product = products.find((candidate) => candidate.id === line.product_id)
      if (product?.latest_purchase_cost === null || product?.latest_purchase_cost === undefined) return []
      if (Number(line.unit_cost || 0) >= product.latest_purchase_cost) return []
      return [
        `Dòng ${index + 1}: giá nhập ${money(Number(line.unit_cost || 0))} thấp hơn giá nhập cuối ${money(
          product.latest_purchase_cost,
        )} của ${product.code}.`,
      ]
    })
  }, [form.items, products])

  const bankAccounts = useMemo(
    () => financeAccounts.filter((account) => account.is_active && account.account_type === 'bank'),
    [financeAccounts],
  )
  const isReadOnly = editingStatus !== null && editingStatus !== 'draft'
  const selectedReceiptPaidAfterPost = selectedReceipt?.supplier_payments.reduce((sum, payment) => sum + payment.amount, 0) ?? 0
  const selectedReceiptOutstanding = selectedReceipt ? selectedReceipt.remaining_amount - selectedReceiptPaidAfterPost : 0
  const receiptSummary = useMemo(() => {
    const items = receipts ?? []
    return {
      payable: items.reduce((sum, receipt) => sum + receipt.payable_amount, 0),
      remaining: items.reduce((sum, receipt) => sum + receipt.remaining_amount, 0),
      draftCount: items.filter((receipt) => receipt.status === 'draft').length,
    }
  }, [receipts])

  async function loadReceipts(
    input: {
      search?: string
      status?: PurchaseReceiptStatus | 'all'
      date_from?: string
      date_to?: string
    } = {
      search: search.trim() || undefined,
      status,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    },
  ) {
    setError(null)
    try {
      const result = await service.listReceipts(input)
      setReceipts(result.items)
      setTotal(result.total)
    } catch (cause) {
      setError(formatApiError(cause, 'Không tải được phiếu nhập.'))
    }
  }

  useEffect(() => {
    let active = true

    async function loadInitialData() {
      setError(null)
      try {
        const [receiptResult, supplierResult, productResult, financeAccountResult] = await Promise.all([
          service.listReceipts({ status: 'draft' }),
          service.listSuppliers(),
          service.listProducts(),
          service.listFinanceAccounts(),
        ])
        if (!active) return
        setReceipts(receiptResult.items)
        setTotal(receiptResult.total)
        setSuppliers(supplierResult.items)
        setProducts(productResult.items.filter((product) => product.status === 'active'))
        setFinanceAccounts(financeAccountResult.items)
      } catch (cause) {
        if (active) setError(formatApiError(cause, 'Không tải được phiếu nhập.'))
      }
    }

    void loadInitialData()

    return () => {
      active = false
    }
  }, [service])

  async function filterReceipts(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isExactPurchaseReceiptCode(search)) {
      setStatus('all')
      setDateFrom('')
      setDateTo('')
      setActivePreset(null)
      await loadReceipts({ search: search.trim(), status: 'all' })
      return
    }
    await loadReceipts({
      search: search.trim() || undefined,
      status,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    })
  }

  async function applyReceiptFilters(next: {
    search?: string
    status?: PurchaseReceiptStatus | 'all'
    dateFrom?: string
    dateTo?: string
    preset?: string | null
  }) {
    const nextSearch = next.search ?? search
    const nextStatus = next.status ?? status
    const nextDateFrom = next.dateFrom ?? dateFrom
    const nextDateTo = next.dateTo ?? dateTo
    setSearch(nextSearch)
    setStatus(nextStatus)
    setDateFrom(nextDateFrom)
    setDateTo(nextDateTo)
    setActivePreset(next.preset ?? null)
    await loadReceipts({
      search: nextSearch.trim() || undefined,
      status: nextStatus,
      date_from: nextDateFrom || undefined,
      date_to: nextDateTo || undefined,
    })
  }

  async function resetReceiptFilters() {
    setSearch('')
    setStatus('draft')
    setDateFrom('')
    setDateTo('')
    setActivePreset(null)
    await loadReceipts({ status: 'draft' })
  }

  async function openReceipt(receipt: PurchaseReceipt) {
    setError(null)
    try {
      const detail = await service.getReceipt(receipt.id)
      setDetailOpen(true)
      setEditingId(detail.id)
      setEditingStatus(detail.status)
      setSelectedReceipt(detail)
      setForm({
        code: detail.code,
        supplier_id: detail.supplier_id,
        received_at: detail.received_at.slice(0, 16),
        supplier_document_no: detail.supplier_document_no ?? '',
        notes: detail.notes ?? '',
        discount_amount: detail.discount_amount,
        paid_amount: detail.paid_amount,
        items: detail.items.map((item) => ({
          product_id: item.product_id,
          inventory_shape: item.inventory_shape,
          unit_name: item.unit_name_snapshot,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
          discount_amount: item.discount_amount,
          physical_payload: item.physical_payload,
        })),
      })
      setPaymentMethod('cash')
      setFinanceAccountId('')
      setSupplierPaymentOpen(false)
      setSupplierPaymentAmount(0)
      setSupplierPaymentMethod('cash')
      setSupplierPaymentFinanceAccountId('')
      setRollLengthTexts({})
    } catch (cause) {
      setError(formatApiError(cause, 'Không tải được chi tiết phiếu nhập.'))
    }
  }

  async function saveReceipt(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isReadOnly) return
    setSaving(true)
    setError(null)
    try {
      if (editingId === null) {
        await service.createReceipt(form)
      } else {
        await service.updateReceipt(editingId, form)
      }
      setEditingId(null)
      setEditingStatus(null)
      setSelectedReceipt(null)
      setDetailOpen(false)
      setForm(blankForm)
      await loadReceipts()
    } catch (cause) {
      setError(formatApiError(cause, 'Không lưu được phiếu nhập.'))
    } finally {
      setSaving(false)
    }
  }

  async function postReceipt() {
    if (editingId === null || editingStatus !== 'draft') return
    if (Number(form.paid_amount || 0) > 0 && paymentMethod === 'bank_transfer' && financeAccountId === '') {
      setError('Chọn tài khoản chuyển khoản trước khi hoàn thành phiếu nhập.')
      return
    }

    setPosting(true)
    setError(null)
    try {
      await service.postReceipt(editingId, {
        ...(Number(form.paid_amount || 0) > 0 ? { payment_method: paymentMethod } : {}),
        ...(Number(form.paid_amount || 0) > 0 && paymentMethod === 'bank_transfer'
          ? { finance_account_id: financeAccountId }
          : {}),
      })
      setEditingId(null)
      setEditingStatus(null)
      setSelectedReceipt(null)
      setDetailOpen(false)
      setForm(blankForm)
      await loadReceipts()
    } catch (cause) {
      setError(formatApiError(cause, 'Không hoàn thành được phiếu nhập.'))
    } finally {
      setPosting(false)
    }
  }

  function updateLine(index: number, patch: Partial<PurchaseReceiptInput['items'][number]>) {
    setForm((current) => {
      const items = current.items.map((line, lineIndex) => (lineIndex === index ? { ...line, ...patch } : line))
      return { ...current, items }
    })
  }

  function chooseProduct(index: number, productId: string) {
    const product = products.find((candidate) => candidate.id === productId)
    const inventoryShape = product?.inventory_shape ?? 'normal'
    updateLine(index, {
      product_id: productId,
      inventory_shape: inventoryShape,
      unit_name: purchaseUnitForProduct(product),
      quantity: 1,
      unit_cost: product?.latest_purchase_cost ?? 0,
      physical_payload: defaultPhysicalPayload(inventoryShape),
    })
    setRollLengthTexts((current) => {
      const next = { ...current }
      if (inventoryShape === 'roll') next[index] = '1'
      else delete next[index]
      return next
    })
  }

  function addLine() {
    setForm((current) => ({ ...current, items: [...current.items, { ...blankLine }] }))
  }

  function removeLine(index: number) {
    setForm((current) => ({
      ...current,
      items: current.items.length === 1 ? current.items : current.items.filter((_, lineIndex) => lineIndex !== index),
    }))
  }

  function updateRollPayload(index: number, patch: { width_m?: number; lengths_m?: number[] }) {
    const currentPayload = rollPayload(form.items[index]?.physical_payload ?? null)
    const nextPayload: RollPhysicalPayload = {
      rolls: {
        width_m: patch.width_m ?? currentPayload.rolls.width_m,
        lengths_m: patch.lengths_m ?? currentPayload.rolls.lengths_m,
      },
    }
    updateLine(index, {
      quantity: nextPayload.rolls.lengths_m.length,
      physical_payload: nextPayload,
    })
  }

  function updateSheetPayload(index: number, groupIndex: number, patch: Partial<SheetPhysicalPayload['sheet_groups'][number]>) {
    const currentPayload = sheetPayload(form.items[index]?.physical_payload ?? null)
    const sheetGroups = currentPayload.sheet_groups.map((group, currentGroupIndex) =>
      currentGroupIndex === groupIndex ? { ...group, ...patch } : group,
    )
    const nextPayload: SheetPhysicalPayload = { sheet_groups: sheetGroups }
    updateLine(index, {
      quantity: sheetGroups.reduce((sum, group) => sum + Number(group.quantity || 0), 0),
      physical_payload: nextPayload,
    })
  }

  function addSheetGroup(index: number) {
    const currentPayload = sheetPayload(form.items[index]?.physical_payload ?? null)
    const nextPayload: SheetPhysicalPayload = {
      sheet_groups: [...currentPayload.sheet_groups, { width_m: 1, length_m: 1, quantity: 1 }],
    }
    updateLine(index, {
      quantity: nextPayload.sheet_groups.reduce((sum, group) => sum + Number(group.quantity || 0), 0),
      physical_payload: nextPayload,
    })
  }

  function removeSheetGroup(index: number, groupIndex: number) {
    const currentPayload = sheetPayload(form.items[index]?.physical_payload ?? null)
    const sheetGroups = currentPayload.sheet_groups.filter((_, currentGroupIndex) => currentGroupIndex !== groupIndex)
    const nextGroups = sheetGroups.length === 0 ? [{ width_m: 1, length_m: 1, quantity: 1 }] : sheetGroups
    updateLine(index, {
      quantity: nextGroups.reduce((sum, group) => sum + Number(group.quantity || 0), 0),
      physical_payload: { sheet_groups: nextGroups },
    })
  }

  function resetForm() {
    setEditingId(null)
    setEditingStatus(null)
    setSelectedReceipt(null)
    setDetailOpen(true)
    setForm(blankForm)
    setPaymentMethod('cash')
    setFinanceAccountId('')
    setSupplierPaymentOpen(false)
    setSupplierPaymentAmount(0)
    setSupplierPaymentMethod('cash')
    setSupplierPaymentFinanceAccountId('')
    setRollLengthTexts({})
  }

  function openCreateReceipt() {
    resetForm()
  }

  function openSupplierPaymentForReceipt() {
    if (selectedReceipt === null) return
    setSupplierPaymentOpen(true)
    setSupplierPaymentAmount(Math.max(selectedReceiptOutstanding, 0))
    setSupplierPaymentMethod('cash')
    setSupplierPaymentFinanceAccountId('')
  }

  const today = localDateString(new Date())
  const monthRange = currentMonthRange()
  const receiptFilterPresets: FilterPreset[] = [
    {
      id: 'draft',
      label: 'Draft cần xử lý',
      active: activePreset === 'Draft cần xử lý' || (search.trim() === '' && status === 'draft' && dateFrom === '' && dateTo === ''),
      onSelect: () => void applyReceiptFilters({ search: '', status: 'draft', dateFrom: '', dateTo: '', preset: 'Draft cần xử lý' }),
    },
    {
      id: 'posted-today',
      label: 'Đã nhập hôm nay',
      active: activePreset === 'Đã nhập hôm nay',
      onSelect: () =>
        void applyReceiptFilters({
          search: '',
          status: 'posted',
          dateFrom: today,
          dateTo: today,
          preset: 'Đã nhập hôm nay',
        }),
    },
    {
      id: 'this-month',
      label: 'Tháng này',
      active: activePreset === 'Tháng này',
      onSelect: () =>
        void applyReceiptFilters({
          search: '',
          status: 'all',
          dateFrom: monthRange.from,
          dateTo: monthRange.to,
          preset: 'Tháng này',
        }),
    },
    {
      id: 'all',
      label: 'Tất cả',
      active: activePreset === 'Tất cả',
      onSelect: () => void applyReceiptFilters({ search: '', status: 'all', dateFrom: '', dateTo: '', preset: 'Tất cả' }),
    },
    {
      id: 'outstanding',
      label: 'Còn nợ NCC',
      disabled: true,
      title: 'API hiện chưa có filter còn nợ NCC riêng cho danh sách phiếu nhập.',
      onSelect: () => undefined,
    },
    {
      id: 'physical',
      label: 'Cuộn/tấm',
      disabled: true,
      title: 'API hiện chưa có filter inventory_shape cho danh sách phiếu nhập.',
      onSelect: () => undefined,
    },
  ]

  const receiptFilterChips: ActiveFilterChip[] = [
    ...(search.trim()
      ? [
          {
            id: 'search',
            label: `Tìm: ${search.trim()}`,
            onClear: () => void applyReceiptFilters({ search: '', preset: null }),
          },
        ]
      : []),
    ...(activePreset
      ? [
          {
            id: 'preset',
            label: `Preset: ${activePreset}`,
            onClear: () => void applyReceiptFilters({ status: 'draft', dateFrom: '', dateTo: '', preset: null }),
          },
        ]
      : []),
    ...(!activePreset && status !== 'draft'
      ? [
          {
            id: 'status',
            label: `Trạng thái: ${status === 'all' ? 'Tất cả' : statusText(status)}`,
            onClear: () => void applyReceiptFilters({ status: 'draft' }),
          },
        ]
      : []),
    ...(!activePreset && dateFrom
      ? [
          {
            id: 'date-from',
            label: `Từ ngày: ${dateFrom}`,
            onClear: () => void applyReceiptFilters({ dateFrom: '' }),
          },
        ]
      : []),
    ...(!activePreset && dateTo
      ? [
          {
            id: 'date-to',
            label: `Đến ngày: ${dateTo}`,
            onClear: () => void applyReceiptFilters({ dateTo: '' }),
          },
        ]
      : []),
  ]

  async function saveSupplierPayment() {
    if (selectedReceipt === null || selectedReceiptOutstanding <= 0) return
    if (supplierPaymentAmount <= 0) {
      setError('Nhập số tiền thanh toán NCC.')
      return
    }
    if (supplierPaymentAmount > selectedReceiptOutstanding) {
      setError('Không được trả vượt số còn nợ của phiếu nhập.')
      return
    }
    if (supplierPaymentMethod === 'bank_transfer' && supplierPaymentFinanceAccountId === '') {
      setError('Chọn tài khoản chuyển khoản trước khi lưu thanh toán NCC.')
      return
    }

    setPosting(true)
    setError(null)
    try {
      await service.paySupplier(selectedReceipt.supplier_id, {
        payment_method: supplierPaymentMethod,
        ...(supplierPaymentMethod === 'bank_transfer' ? { finance_account_id: supplierPaymentFinanceAccountId } : {}),
        allocations: [{ purchase_receipt_id: selectedReceipt.id, amount: supplierPaymentAmount }],
      })
      const detail = await service.getReceipt(selectedReceipt.id)
      setSelectedReceipt(detail)
      setSupplierPaymentOpen(false)
      await loadReceipts()
    } catch (cause) {
      setError(formatApiError(cause, 'Không lưu được thanh toán NCC.'))
    } finally {
      setPosting(false)
    }
  }

  return (
    <main className="purchase-receipts-shell">
      <header className="suppliers-header">
        <div>
          <h1>Phiếu nhập</h1>
          <p>Draft server-side cho hàng thường; chưa tăng kho, chưa ghi công nợ hoặc sổ quỹ</p>
        </div>
        <button className="button button-secondary" type="button" onClick={onOpenDashboard}>
          <Home aria-hidden="true" size={16} />
          Trang chủ
        </button>
      </header>

      {error ? <p role="alert">{error}</p> : null}
      {receipts === null && error === null ? <p>Đang tải phiếu nhập...</p> : null}

      <MetricGrid ariaLabel="Tổng quan phiếu nhập">
        <MetricCard hint={`${receiptSummary.draftCount} draft đang mở`} label="Tổng phiếu" value={total || receipts?.length || 0} />
        <MetricCard hint="Từ danh sách đang xem" label="Cần trả" tone="warning" value={<MoneyText value={receiptSummary.payable} />} />
        <MetricCard
          hint="Sau trả ngay và thanh toán NCC"
          label="Còn phải trả"
          tone={receiptSummary.remaining > 0 ? 'warning' : 'neutral'}
          value={<MoneyText value={receiptSummary.remaining} />}
        />
      </MetricGrid>

      <section className="suppliers-layout" aria-label="Quản lý phiếu nhập">
        <section aria-label="Danh sách phiếu nhập" className="suppliers-panel">
          <div className="panel-heading">
            <div>
              <h2>Danh sách phiếu nhập</h2>
              <p>Theo dõi draft, phiếu đã nhập và khoản cần trả NCC.</p>
            </div>
            <button className="button button-primary" type="button" onClick={openCreateReceipt}>
              <FilePlus2 aria-hidden="true" size={16} />
              Tạo phiếu nhập
            </button>
          </div>
          <DataToolbar
            ariaLabel="Lọc phiếu nhập"
            chips={receiptFilterChips}
            presets={receiptFilterPresets}
            searchLabel="Tìm phiếu/NCC"
            searchValue={search}
            onReset={() => void resetReceiptFilters()}
            onSearchChange={setSearch}
            onSubmit={filterReceipts}
          >
            <label>
              Trạng thái
              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value as PurchaseReceiptStatus | 'all')
                  setActivePreset(null)
                }}
              >
                <option value="draft">Phiếu tạm</option>
                <option value="posted">Đã nhập</option>
                <option value="cancelled">Đã hủy</option>
                <option value="all">Tất cả</option>
              </select>
            </label>
            <label>
              Từ ngày
              <input
                type="date"
                value={dateFrom}
                onChange={(event) => {
                  setDateFrom(event.target.value)
                  setActivePreset(null)
                }}
              />
            </label>
            <label>
              Đến ngày
              <input
                type="date"
                value={dateTo}
                onChange={(event) => {
                  setDateTo(event.target.value)
                  setActivePreset(null)
                }}
              />
            </label>
          </DataToolbar>

          {receipts ? (
            <>
              <p className="result-count">{total} phiếu nhập</p>
              {receipts.length === 0 ? (
                <EmptyState>
                  <p>Không có phiếu nhập phù hợp. Thử mở rộng ngày hoặc trạng thái.</p>
                </EmptyState>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Mã PN</th>
                      <th>Thời gian</th>
                      <th>Nhà cung cấp</th>
                      <th>Số dòng</th>
                      <th>Tổng tiền hàng</th>
                      <th>Cần trả</th>
                      <th>Đã trả</th>
                      <th>Còn phải trả</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receipts.map((receipt) => (
                      <tr key={receipt.id}>
                        <td>{receipt.code}</td>
                        <td>{new Date(receipt.received_at).toLocaleString('vi-VN')}</td>
                        <td>{`${receipt.supplier.code} - ${receipt.supplier.name}`}</td>
                        <td>{receipt.items.length}</td>
                        <td><MoneyText value={receipt.subtotal_amount} /></td>
                        <td><MoneyText value={receipt.payable_amount} /></td>
                        <td><MoneyText value={receipt.paid_amount} /></td>
                        <td><MoneyText value={receipt.remaining_amount} /></td>
                        <td>
                          <StatusChip
                            tone={receipt.status === 'draft' ? 'info' : receipt.status === 'posted' ? 'success' : 'danger'}
                          >
                            {statusText(receipt.status)}
                          </StatusChip>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button className="button button-secondary" type="button" onClick={() => void openReceipt(receipt)}>
                              <Pencil aria-hidden="true" size={15} />
                              {receipt.status === 'draft' ? 'Sửa' : 'Xem'} {receipt.code}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          ) : null}
        </section>

        <aside aria-label="Chi tiết và thao tác phiếu nhập" className="suppliers-panel">
          <div className="panel-heading">
            <div>
              <h2>Chi tiết phiếu</h2>
              <p>Nhập hàng thường, cuộn/tấm vật lý và thanh toán NCC.</p>
            </div>
          </div>
          {!detailOpen ? (
            <EmptyState>
              <p>Chọn một phiếu nhập để xem/sửa, hoặc bấm Tạo phiếu nhập để bắt đầu draft mới.</p>
            </EmptyState>
          ) : null}
          {detailOpen ? (
          <form aria-label="Thông tin phiếu nhập" className="purchase-receipt-form" onSubmit={saveReceipt}>
            <header>
              <h2>{isReadOnly ? 'Xem phiếu nhập' : editingId ? 'Sửa draft phiếu nhập' : 'Tạo draft phiếu nhập'}</h2>
              {editingId !== null && editingStatus === 'draft' ? (
                <button className="button button-primary" disabled={posting} type="button" onClick={() => void postReceipt()}>
                  <PackageCheck aria-hidden="true" size={16} />
                  Hoàn thành nhập hàng
                </button>
              ) : null}
              {editingId ? (
                <button className="button button-secondary" type="button" onClick={resetForm}>
                  <FilePlus2 aria-hidden="true" size={15} />
                  Tạo mới
                </button>
              ) : null}
            </header>
            <label>
              Nhà cung cấp
              <select
                required
                disabled={isReadOnly}
                value={form.supplier_id}
                onChange={(event) => setForm((current) => ({ ...current, supplier_id: event.target.value }))}
              >
                <option value="">Chọn NCC</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.code} - {supplier.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Thời gian nhập
              <input
                required
                disabled={isReadOnly}
                type="datetime-local"
                value={form.received_at}
                onChange={(event) => setForm((current) => ({ ...current, received_at: event.target.value }))}
              />
            </label>
            <label>
              Số chứng từ NCC
              <input
                readOnly={isReadOnly}
                value={form.supplier_document_no}
                onChange={(event) => setForm((current) => ({ ...current, supplier_document_no: event.target.value }))}
              />
            </label>

            <div className="receipt-lines">
              {form.items.map((line, index) => (
                <fieldset key={index}>
                  <legend>Dòng {index + 1}</legend>
                  <label>
                    Sản phẩm dòng {index + 1}
                    <select
                      required
                      disabled={isReadOnly}
                      value={line.product_id}
                      onChange={(event) => chooseProduct(index, event.target.value)}
                    >
                      <option value="">Chọn hàng</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.code} - {product.name} ({product.inventory_shape === 'roll' ? 'cuộn' : product.inventory_shape === 'sheet' ? 'tấm' : 'thường'})
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Đơn vị dòng {index + 1}
                    <input readOnly disabled={isReadOnly} value={line.unit_name} />
                  </label>
                  <label>
                    Số lượng dòng {index + 1}
                    <input
                      min="0.000001"
                      step="0.000001"
                      type="number"
                      readOnly={isReadOnly || line.inventory_shape !== 'normal'}
                      value={line.quantity}
                      onChange={(event) => updateLine(index, { quantity: Number(event.target.value) })}
                    />
                  </label>
                  {line.inventory_shape === 'roll' ? (
                    <div className="receipt-physical-box" aria-label={`Thông tin cuộn dòng ${index + 1}`}>
                      {(() => {
                        const payload = rollPayload(line.physical_payload)
                        const firstLength = payload.rolls.lengths_m[0] ?? 1
                        return (
                          <>
                            <label>
                              Khổ rộng cuộn dòng {index + 1}
                              <input
                                min="0.001"
                                step="0.001"
                                type="number"
                                readOnly={isReadOnly}
                                value={payload.rolls.width_m}
                                onChange={(event) => updateRollPayload(index, { width_m: Number(event.target.value) })}
                              />
                            </label>
                            <label>
                              Số cuộn cùng quy cách dòng {index + 1}
                              <input
                                min="1"
                                step="1"
                                type="number"
                                readOnly={isReadOnly}
                                value={payload.rolls.lengths_m.length}
                                onChange={(event) => {
                                  const count = Math.max(Math.floor(Number(event.target.value) || 0), 0)
                                  const lengths = Array.from({ length: count }, () => firstLength || 1)
                                  setRollLengthTexts((current) => ({ ...current, [index]: lengths.join(', ') }))
                                  updateRollPayload(index, { lengths_m: lengths })
                                }}
                              />
                            </label>
                            <label>
                              Chiều dài mỗi cuộn dòng {index + 1}
                              <input
                                min="0.001"
                                step="0.001"
                                type="number"
                                readOnly={isReadOnly}
                                value={firstLength}
                                onChange={(event) => {
                                  const length = Number(event.target.value)
                                  const lengths = payload.rolls.lengths_m.map(() => length)
                                  setRollLengthTexts((current) => ({ ...current, [index]: lengths.join(', ') }))
                                  updateRollPayload(index, { lengths_m: lengths })
                                }}
                              />
                            </label>
                            <label>
                              Chiều dài từng cuộn dòng {index + 1}
                              <textarea
                                readOnly={isReadOnly}
                                value={rollLengthTexts[index] ?? payload.rolls.lengths_m.join(', ')}
                                onChange={(event) => {
                                  const text = event.target.value
                                  setRollLengthTexts((current) => ({ ...current, [index]: text }))
                                  const lengths = text
                                    .split(',')
                                    .map((value) => Number(value.trim()))
                                    .filter((value) => Number.isFinite(value) && value > 0)
                                  updateRollPayload(index, { lengths_m: lengths })
                                }}
                              />
                            </label>
                            <p className="physical-summary">{physicalSummary(line)}</p>
                          </>
                        )
                      })()}
                    </div>
                  ) : null}
                  {line.inventory_shape === 'sheet' ? (
                    <div className="receipt-physical-box" aria-label={`Thông tin tấm dòng ${index + 1}`}>
                      {sheetPayload(line.physical_payload).sheet_groups.map((group, groupIndex) => (
                        <fieldset key={groupIndex}>
                          <legend>Nhóm tấm {groupIndex + 1}</legend>
                          <label>
                            Rộng nhóm {groupIndex + 1} dòng {index + 1}
                            <input
                              min="0.001"
                              step="0.001"
                              type="number"
                              readOnly={isReadOnly}
                              value={group.width_m}
                              onChange={(event) => updateSheetPayload(index, groupIndex, { width_m: Number(event.target.value) })}
                            />
                          </label>
                          <label>
                            Dài nhóm {groupIndex + 1} dòng {index + 1}
                            <input
                              min="0.001"
                              step="0.001"
                              type="number"
                              readOnly={isReadOnly}
                              value={group.length_m}
                              onChange={(event) => updateSheetPayload(index, groupIndex, { length_m: Number(event.target.value) })}
                            />
                          </label>
                          <label>
                            Số tấm nhóm {groupIndex + 1} dòng {index + 1}
                            <input
                              min="1"
                              step="1"
                              type="number"
                              readOnly={isReadOnly}
                              value={group.quantity}
                              onChange={(event) => updateSheetPayload(index, groupIndex, { quantity: Math.max(Math.floor(Number(event.target.value) || 0), 0) })}
                            />
                          </label>
                          {isReadOnly ? null : (
                            <button className="button button-danger" type="button" onClick={() => removeSheetGroup(index, groupIndex)}>
                              <Trash2 aria-hidden="true" size={15} />
                              Xóa nhóm tấm {groupIndex + 1}
                            </button>
                          )}
                        </fieldset>
                      ))}
                      <p className="physical-summary">{physicalSummary(line)}</p>
                      {isReadOnly ? null : (
                        <button className="button button-secondary" type="button" onClick={() => addSheetGroup(index)}>
                          <Plus aria-hidden="true" size={15} />
                          Thêm nhóm kích thước
                        </button>
                      )}
                    </div>
                  ) : null}
                  <label>
                    Đơn giá dòng {index + 1}
                    <input
                      min="0"
                      step="1000"
                      type="number"
                      readOnly={isReadOnly}
                      value={line.unit_cost}
                      onChange={(event) => updateLine(index, { unit_cost: Number(event.target.value) })}
                    />
                  </label>
                  <label>
                    Giảm giá dòng {index + 1}
                    <input
                      min="0"
                      step="1000"
                      type="number"
                      readOnly={isReadOnly}
                      value={line.discount_amount}
                      onChange={(event) => updateLine(index, { discount_amount: Number(event.target.value) })}
                    />
                  </label>
                  <p>Thành tiền: {money(lineAmount(line))}</p>
                  {isReadOnly ? null : (
                    <button className="button button-danger" type="button" onClick={() => removeLine(index)}>
                      <Trash2 aria-hidden="true" size={15} />
                      Xóa dòng
                    </button>
                  )}
                </fieldset>
              ))}
              {isReadOnly ? null : (
                <button className="button button-secondary" type="button" onClick={addLine}>
                  <Plus aria-hidden="true" size={15} />
                  Thêm dòng
                </button>
              )}
            </div>

            <label>
              Giảm giá phiếu
              <input
                min="0"
                step="1000"
                type="number"
                readOnly={isReadOnly}
                value={form.discount_amount}
                onChange={(event) => setForm((current) => ({ ...current, discount_amount: Number(event.target.value) }))}
              />
            </label>
            <label>
              Đã trả tạm
              <input
                min="0"
                step="1000"
                type="number"
                readOnly={isReadOnly}
                value={form.paid_amount}
                onChange={(event) => setForm((current) => ({ ...current, paid_amount: Number(event.target.value) }))}
              />
            </label>
            <label>
              Ghi chú
              <textarea
                readOnly={isReadOnly}
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              />
            </label>

            <div className="receipt-total-box">
              <p>Tổng tiền hàng: {money(totals.subtotal)}</p>
              <p>Cần trả NCC: {money(totals.payable)}</p>
              <p>Còn phải trả: {money(totals.remaining)}</p>
            </div>
            {lowCostWarnings.length > 0 ? (
              <div role="alert" className="receipt-warning-box">
                {lowCostWarnings.map((warning) => (
                  <p key={warning}>{warning}</p>
                ))}
              </div>
            ) : null}
            {isReadOnly && selectedReceipt ? (
              <section className="receipt-payment-history" aria-label="Lịch sử thanh toán NCC">
                <h3>Lịch sử thanh toán NCC</h3>
                {selectedReceipt.supplier_payments.length === 0 ? (
                  <p>Chưa có thanh toán NCC sau nhập.</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Mã phiếu</th>
                        <th>Thời gian</th>
                        <th>Phương thức</th>
                        <th>Trạng thái</th>
                        <th>Tiền chi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReceipt.supplier_payments.map((payment) => (
                        <tr key={payment.id}>
                          <td>{payment.code}</td>
                          <td>{new Date(payment.paid_at).toLocaleString('vi-VN')}</td>
                          <td>{payment.payment_method === 'bank_transfer' ? 'Chuyển khoản' : 'Tiền mặt'}</td>
                          <td>{payment.status === 'posted' ? 'Đã ghi' : 'Đã hủy'}</td>
                          <td><MoneyText value={payment.amount} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {selectedReceiptOutstanding > 0 ? (
                  <button className="button button-primary" type="button" onClick={openSupplierPaymentForReceipt}>
                    <WalletCards aria-hidden="true" size={16} />
                    Thanh toán NCC
                  </button>
                ) : null}
              </section>
            ) : null}
            {supplierPaymentOpen && selectedReceipt ? (
              <section role="form" aria-label="Thanh toán nhà cung cấp" className="receipt-payment-box">
                <h3>Thanh toán NCC</h3>
                <p>{selectedReceipt.code}</p>
                <p>Còn nợ: {money(selectedReceiptOutstanding)}</p>
                <label>
                  Số tiền trả cho {selectedReceipt.code}
                  <input
                    min="0"
                    max={selectedReceiptOutstanding}
                    step="1000"
                    type="number"
                    value={supplierPaymentAmount}
                    onChange={(event) => setSupplierPaymentAmount(Number(event.target.value))}
                  />
                </label>
                <label>
                  Phương thức trả NCC
                  <select
                    value={supplierPaymentMethod}
                    onChange={(event) => setSupplierPaymentMethod(event.target.value as 'cash' | 'bank_transfer')}
                  >
                    <option value="cash">Tiền mặt</option>
                    <option value="bank_transfer">Chuyển khoản</option>
                  </select>
                </label>
                {supplierPaymentMethod === 'bank_transfer' ? (
                  <label>
                    Tài khoản chuyển khoản NCC
                    <select
                      value={supplierPaymentFinanceAccountId}
                      onChange={(event) => setSupplierPaymentFinanceAccountId(event.target.value)}
                    >
                      <option value="">Chọn tài khoản</option>
                      {bankAccounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.code} - {account.name}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
                <button className="button button-primary" disabled={posting} type="button" onClick={() => void saveSupplierPayment()}>
                  <Banknote aria-hidden="true" size={16} />
                  Lưu thanh toán NCC
                </button>
              </section>
            ) : null}
            {editingId !== null && editingStatus === 'draft' && Number(form.paid_amount || 0) > 0 ? (
              <div className="receipt-payment-box">
                <label>
                  Phương thức trả ngay
                  <select
                    value={paymentMethod}
                    onChange={(event) => setPaymentMethod(event.target.value as 'cash' | 'bank_transfer')}
                  >
                    <option value="cash">Tiền mặt</option>
                    <option value="bank_transfer">Chuyển khoản</option>
                  </select>
                </label>
                {paymentMethod === 'bank_transfer' ? (
                  <label>
                    Tài khoản chuyển khoản
                    <select value={financeAccountId} onChange={(event) => setFinanceAccountId(event.target.value)}>
                      <option value="">Chọn tài khoản</option>
                      {bankAccounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.code} - {account.name}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
              </div>
            ) : null}
            {isReadOnly ? null : (
              <button className="button button-secondary" disabled={saving} type="submit">
                <Save aria-hidden="true" size={16} />
              Lưu draft phiếu nhập
            </button>
            )}
          </form>
          ) : null}
        </aside>
      </section>
    </main>
  )
}
