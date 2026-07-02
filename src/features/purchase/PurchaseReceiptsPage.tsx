import { useEffect, useMemo, useState } from 'react'
import { formatApiError } from '../../lib/api/error-message'
import type {
  PurchaseReceipt,
  PurchaseReceiptFinanceAccount,
  PurchaseReceiptInput,
  PurchaseReceiptProduct,
  PurchaseReceiptStatus,
} from './purchase-receipt-types'
import type { PurchaseReceiptService } from './purchase-receipt-service'
import type { Supplier } from './types'

const moneyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

const nowLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)

const blankLine = {
  product_id: '',
  unit_name: '',
  quantity: 1,
  unit_cost: 0,
  discount_amount: 0,
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

function lineAmount(line: PurchaseReceiptInput['items'][number]) {
  return Math.max(Math.round(Number(line.quantity || 0) * Number(line.unit_cost || 0)) - Number(line.discount_amount || 0), 0)
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
    await loadReceipts({
      search: search.trim() || undefined,
      status,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    })
  }

  async function openReceipt(receipt: PurchaseReceipt) {
    setError(null)
    try {
      const detail = await service.getReceipt(receipt.id)
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
          unit_name: item.unit_name_snapshot,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
          discount_amount: item.discount_amount,
        })),
      })
      setPaymentMethod('cash')
      setFinanceAccountId('')
      setSupplierPaymentOpen(false)
      setSupplierPaymentAmount(0)
      setSupplierPaymentMethod('cash')
      setSupplierPaymentFinanceAccountId('')
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
    updateLine(index, {
      product_id: productId,
      unit_name: product?.unit_name ?? '',
      unit_cost: product?.latest_purchase_cost ?? 0,
    })
  }

  function addLine() {
    setForm((current) => ({ ...current, items: [...current.items, blankLine] }))
  }

  function removeLine(index: number) {
    setForm((current) => ({
      ...current,
      items: current.items.length === 1 ? current.items : current.items.filter((_, lineIndex) => lineIndex !== index),
    }))
  }

  function resetForm() {
    setEditingId(null)
    setEditingStatus(null)
    setSelectedReceipt(null)
    setForm(blankForm)
    setPaymentMethod('cash')
    setFinanceAccountId('')
    setSupplierPaymentOpen(false)
    setSupplierPaymentAmount(0)
    setSupplierPaymentMethod('cash')
    setSupplierPaymentFinanceAccountId('')
  }

  function openSupplierPaymentForReceipt() {
    if (selectedReceipt === null) return
    setSupplierPaymentOpen(true)
    setSupplierPaymentAmount(Math.max(selectedReceiptOutstanding, 0))
    setSupplierPaymentMethod('cash')
    setSupplierPaymentFinanceAccountId('')
  }

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
        <button type="button" onClick={onOpenDashboard}>
          Trang chủ
        </button>
      </header>

      {error ? <p role="alert">{error}</p> : null}
      {receipts === null && error === null ? <p>Đang tải phiếu nhập...</p> : null}

      <section className="suppliers-layout" aria-label="Quản lý phiếu nhập">
        <div className="suppliers-panel">
          <form aria-label="Lọc phiếu nhập" className="suppliers-filter" onSubmit={filterReceipts}>
            <label>
              Tìm phiếu/NCC
              <input value={search} onChange={(event) => setSearch(event.target.value)} />
            </label>
            <label>
              Trạng thái
              <select value={status} onChange={(event) => setStatus(event.target.value as PurchaseReceiptStatus | 'all')}>
                <option value="draft">Phiếu tạm</option>
                <option value="posted">Đã nhập</option>
                <option value="cancelled">Đã hủy</option>
                <option value="all">Tất cả</option>
              </select>
            </label>
            <label>
              Từ ngày
              <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
            </label>
            <label>
              Đến ngày
              <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
            </label>
            <button type="submit">Lọc</button>
          </form>

          {receipts ? (
            <>
              <p>{total} phiếu nhập</p>
              {receipts.length === 0 ? (
                <div className="empty-state">
                  <p>Không có phiếu nhập phù hợp. Thử mở rộng ngày hoặc trạng thái.</p>
                </div>
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
                        <td>{money(receipt.subtotal_amount)}</td>
                        <td>{money(receipt.payable_amount)}</td>
                        <td>{money(receipt.paid_amount)}</td>
                        <td>{money(receipt.remaining_amount)}</td>
                        <td>{statusText(receipt.status)}</td>
                        <td>
                          <button type="button" onClick={() => void openReceipt(receipt)}>
                            {receipt.status === 'draft' ? 'Sửa' : 'Xem'} {receipt.code}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          ) : null}
        </div>

        <aside className="suppliers-panel">
          <form aria-label="Thông tin phiếu nhập" className="purchase-receipt-form" onSubmit={saveReceipt}>
            <header>
              <h2>{isReadOnly ? 'Xem phiếu nhập' : editingId ? 'Sửa draft phiếu nhập' : 'Tạo draft phiếu nhập'}</h2>
              {editingId !== null && editingStatus === 'draft' ? (
                <button disabled={posting} type="button" onClick={() => void postReceipt()}>
                  Hoàn thành nhập hàng
                </button>
              ) : null}
              {editingId ? (
                <button type="button" onClick={resetForm}>
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
                          {product.code} - {product.name}
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
                      readOnly={isReadOnly}
                      value={line.quantity}
                      onChange={(event) => updateLine(index, { quantity: Number(event.target.value) })}
                    />
                  </label>
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
                    <button type="button" onClick={() => removeLine(index)}>
                      Xóa dòng
                    </button>
                  )}
                </fieldset>
              ))}
              {isReadOnly ? null : (
                <button type="button" onClick={addLine}>
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
                          <td>{money(payment.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {selectedReceiptOutstanding > 0 ? (
                  <button type="button" onClick={openSupplierPaymentForReceipt}>
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
                <button disabled={posting} type="button" onClick={() => void saveSupplierPayment()}>
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
              <button disabled={saving} type="submit">
                Lưu draft phiếu nhập
              </button>
            )}
          </form>
        </aside>
      </section>
    </main>
  )
}
