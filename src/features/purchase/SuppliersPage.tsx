import { useEffect, useState } from 'react'
import { formatApiError } from '../../lib/api/error-message'
import type { Supplier, SupplierCustomerOption, SupplierStatus } from './types'
import type { SupplierInput, SupplierService } from './supplier-service'

const moneyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

function money(value: number) {
  return moneyFormatter.format(value)
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

export function SuppliersPage({
  service,
  onOpenDashboard,
}: {
  service: SupplierService
  onOpenDashboard: () => void
}) {
  const [suppliers, setSuppliers] = useState<Supplier[] | null>(null)
  const [customers, setCustomers] = useState<SupplierCustomerOption[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<SupplierStatus | 'all'>('active')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<SupplierInput>(blankForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadSuppliers(input: { search?: string; status?: SupplierStatus | 'all' } = { search, status }) {
    setError(null)
    try {
      const result = await service.listSuppliers(input)
      setSuppliers(result.items)
      setTotal(result.total)
    } catch (cause) {
      setError(formatApiError(cause, 'Không tải được nhà cung cấp.'))
    }
  }

  useEffect(() => {
    let active = true

    async function loadInitialData() {
      setError(null)
      try {
        const [supplierResult, customerResult] = await Promise.all([
          service.listSuppliers({ status: 'active' }),
          service.listCustomers(),
        ])
        if (!active) return
        setSuppliers(supplierResult.items)
        setTotal(supplierResult.total)
        setCustomers(customerResult.items)
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
    await loadSuppliers({ search: search.trim() || undefined, status })
  }

  async function openSupplier(supplier: Supplier) {
    setError(null)
    try {
      const detail = await service.getSupplier(supplier.id)
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
      setForm(blankForm)
      await loadSuppliers({ search: search.trim() || undefined, status })
    } catch (cause) {
      setError(formatApiError(cause, 'Không lưu được nhà cung cấp.'))
    } finally {
      setSaving(false)
    }
  }

  function resetForm() {
    setEditingId(null)
    setForm(blankForm)
  }

  return (
    <main className="suppliers-shell">
      <header className="suppliers-header">
        <div>
          <h1>Nhà cung cấp</h1>
          <p>Quản lý hồ sơ NCC, liên kết khách hàng và trạng thái nhập hàng</p>
        </div>
        <button type="button" onClick={onOpenDashboard}>
          Trang chủ
        </button>
      </header>

      {error ? <p role="alert">{error}</p> : null}
      {suppliers === null && error === null ? <p>Đang tải nhà cung cấp...</p> : null}

      <section className="suppliers-layout" aria-label="Quản lý nhà cung cấp">
        <div className="suppliers-panel">
          <form aria-label="Lọc nhà cung cấp" className="suppliers-filter" onSubmit={filterSuppliers}>
            <label>
              Tìm NCC
              <input value={search} onChange={(event) => setSearch(event.target.value)} />
            </label>
            <label>
              Trạng thái
              <select value={status} onChange={(event) => setStatus(event.target.value as SupplierStatus | 'all')}>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Ngừng hoạt động</option>
                <option value="all">Tất cả</option>
              </select>
            </label>
            <button type="submit">Lọc</button>
          </form>

          {suppliers ? (
            <>
              <p>{total} nhà cung cấp</p>
              {suppliers.length === 0 ? (
                <div className="empty-state">
                  <p>Chưa có nhà cung cấp phù hợp bộ lọc.</p>
                </div>
              ) : (
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
                    {suppliers.map((supplier) => (
                      <tr key={supplier.id}>
                        <td>{supplier.code}</td>
                        <td>{supplier.name}</td>
                        <td>{supplier.phone ?? '-'}</td>
                        <td>{supplier.email ?? '-'}</td>
                        <td>{money(supplier.current_payable_amount)}</td>
                        <td>{money(supplier.total_purchase_amount)}</td>
                        <td>
                          {supplier.linked_customer
                            ? `${supplier.linked_customer.code} - ${supplier.linked_customer.name}`
                            : '-'}
                        </td>
                        <td>{supplier.status === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động'}</td>
                        <td>
                          <button type="button" onClick={() => void openSupplier(supplier)}>
                            Sửa {supplier.code}
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
          <form aria-label="Thông tin nhà cung cấp" className="supplier-form" onSubmit={saveSupplier}>
            <header>
              <h2>{editingId ? 'Sửa nhà cung cấp' : 'Thêm nhà cung cấp'}</h2>
              {editingId ? (
                <button type="button" onClick={resetForm}>
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
            <button disabled={saving} type="submit">
              Lưu nhà cung cấp
            </button>
          </form>
        </aside>
      </section>
    </main>
  )
}
