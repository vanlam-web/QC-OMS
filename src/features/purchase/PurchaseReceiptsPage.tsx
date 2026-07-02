import { useEffect, useMemo, useState } from 'react'
import { formatApiError } from '../../lib/api/error-message'
import type {
  PurchaseReceipt,
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
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<PurchaseReceiptStatus | 'all'>('draft')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<PurchaseReceiptInput>(blankForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totals = useMemo(() => {
    const subtotal = form.items.reduce((sum, line) => sum + lineAmount(line), 0)
    const payable = Math.max(subtotal - Number(form.discount_amount || 0), 0)
    const remaining = payable - Number(form.paid_amount || 0)
    return { subtotal, payable, remaining }
  }, [form.discount_amount, form.items, form.paid_amount])

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
        const [receiptResult, supplierResult, productResult] = await Promise.all([
          service.listReceipts({ status: 'draft' }),
          service.listSuppliers(),
          service.listProducts(),
        ])
        if (!active) return
        setReceipts(receiptResult.items)
        setTotal(receiptResult.total)
        setSuppliers(supplierResult.items)
        setProducts(productResult.items.filter((product) => product.status === 'active'))
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
    } catch (cause) {
      setError(formatApiError(cause, 'Không tải được chi tiết phiếu nhập.'))
    }
  }

  async function saveReceipt(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (editingId === null) {
        await service.createReceipt(form)
      } else {
        await service.updateReceipt(editingId, form)
      }
      setEditingId(null)
      setForm(blankForm)
      await loadReceipts()
    } catch (cause) {
      setError(formatApiError(cause, 'Không lưu được phiếu nhập.'))
    } finally {
      setSaving(false)
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
    setForm(blankForm)
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
                            Sửa {receipt.code}
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
              <h2>{editingId ? 'Sửa draft phiếu nhập' : 'Tạo draft phiếu nhập'}</h2>
              <button disabled type="button">
                Hoàn thành P3
              </button>
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
                type="datetime-local"
                value={form.received_at}
                onChange={(event) => setForm((current) => ({ ...current, received_at: event.target.value }))}
              />
            </label>
            <label>
              Số chứng từ NCC
              <input
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
                    <select required value={line.product_id} onChange={(event) => chooseProduct(index, event.target.value)}>
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
                    <input value={line.unit_name} onChange={(event) => updateLine(index, { unit_name: event.target.value })} />
                  </label>
                  <label>
                    Số lượng dòng {index + 1}
                    <input
                      min="0.000001"
                      step="0.000001"
                      type="number"
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
                      value={line.discount_amount}
                      onChange={(event) => updateLine(index, { discount_amount: Number(event.target.value) })}
                    />
                  </label>
                  <p>Thành tiền: {money(lineAmount(line))}</p>
                  <button type="button" onClick={() => removeLine(index)}>
                    Xóa dòng
                  </button>
                </fieldset>
              ))}
              <button type="button" onClick={addLine}>
                Thêm dòng
              </button>
            </div>

            <label>
              Giảm giá phiếu
              <input
                min="0"
                step="1000"
                type="number"
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
                value={form.paid_amount}
                onChange={(event) => setForm((current) => ({ ...current, paid_amount: Number(event.target.value) }))}
              />
            </label>
            <label>
              Ghi chú
              <textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
            </label>

            <div className="receipt-total-box">
              <p>Tổng tiền hàng: {money(totals.subtotal)}</p>
              <p>Cần trả NCC: {money(totals.payable)}</p>
              <p>Còn phải trả: {money(totals.remaining)}</p>
            </div>
            <button disabled={saving} type="submit">
              Lưu draft phiếu nhập
            </button>
          </form>
        </aside>
      </section>
    </main>
  )
}
