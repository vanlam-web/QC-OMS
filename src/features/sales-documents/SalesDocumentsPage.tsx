import { useCallback, useEffect, useState } from 'react'
import { formatApiError } from '../../lib/api/error-message'
import type { SalesDocumentDetail, SalesDocumentListItem } from './types'
import type { SalesDocumentService } from './sales-document-service'
import type { OrderService, QuoteReopenPayload } from '../orders/order-service'

const moneyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

function money(value: number) {
  return moneyFormatter.format(value)
}

function dateTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(value))
}

export function SalesDocumentsPage({
  service,
  orderService,
  onOpenDashboard,
  onOpenQuoteInPos,
  onOpenQuotePrint,
}: {
  service: SalesDocumentService
  orderService?: Pick<OrderService, 'getQuoteReopenPayload'>
  onOpenDashboard: () => void
  onOpenQuoteInPos?: (payload: QuoteReopenPayload) => void
  onOpenQuotePrint?: (documentId: string) => void
}) {
  const [documents, setDocuments] = useState<SalesDocumentListItem[] | null>(null)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [lastSearch, setLastSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'invoice' | 'quote'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all')
  const [selected, setSelected] = useState<SalesDocumentDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null)
  const [openingQuoteId, setOpeningQuoteId] = useState<string | null>(null)

  const currentFilters = useCallback((input: { search?: string } = {}) => {
    return {
      ...input,
      type: typeFilter === 'all' ? undefined : typeFilter,
      status: statusFilter === 'all' ? undefined : statusFilter,
    }
  }, [typeFilter, statusFilter])

  async function loadDocuments(input: { search?: string } = {}) {
    setError(null)
    try {
      const result = await service.listSalesDocuments(currentFilters(input))
      setDocuments(result.items)
      setTotal(result.total)
      setLastSearch(input.search ?? '')
      if (result.items.length === 0) setSelected(null)
    } catch (cause) {
      setError(formatApiError(cause, 'Không tải được chứng từ bán hàng.'))
    }
  }

  useEffect(() => {
    let active = true

    async function loadInitialDocuments() {
      setError(null)
      try {
        const result = await service.listSalesDocuments(currentFilters({}))
        if (!active) return
        setDocuments(result.items)
        setTotal(result.total)
      } catch (cause) {
        if (active) setError(formatApiError(cause, 'Không tải được chứng từ bán hàng.'))
      }
    }

    void loadInitialDocuments()

    return () => {
      active = false
    }
  }, [service, currentFilters])

  async function searchDocuments(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = search.trim()
    await loadDocuments(trimmed ? { search: trimmed } : {})
  }

  async function openDocument(document: SalesDocumentListItem) {
    setDetailError(null)
    setLoadingDetailId(document.id)
    try {
      setSelected(await service.getSalesDocument(document.id))
    } catch (cause) {
      setDetailError(formatApiError(cause, 'Không tải được chi tiết chứng từ.'))
    } finally {
      setLoadingDetailId(null)
    }
  }

  async function openQuoteInPos(document: SalesDocumentListItem) {
    if (orderService === undefined || onOpenQuoteInPos === undefined) return
    setDetailError(null)
    setOpeningQuoteId(document.id)
    try {
      const payload = await orderService.getQuoteReopenPayload(document.id)
      onOpenQuoteInPos(payload)
    } catch (cause) {
      setDetailError(formatApiError(cause, 'Không mở được báo giá tại POS.'))
    } finally {
      setOpeningQuoteId(null)
    }
  }

  const hasFilter = lastSearch.length > 0

  return (
    <main className="sales-documents-shell">
      <header className="sales-documents-header">
        <div>
          <h1>Chứng từ bán hàng</h1>
          <p>Tra cứu hóa đơn đã lưu từ POS</p>
        </div>
        <button type="button" onClick={onOpenDashboard}>
          Trang chủ
        </button>
      </header>

      {error ? <p role="alert">{error}</p> : null}
      {documents === null && error === null ? <p>Đang tải chứng từ...</p> : null}

      <section className="sales-documents-layout" aria-label="Tra cứu chứng từ bán hàng">
        <div className="sales-documents-panel">
          <form aria-label="Lọc chứng từ" className="sales-documents-filter" onSubmit={searchDocuments}>
            <label>
              Tìm chứng từ
              <input value={search} onChange={(event) => setSearch(event.target.value)} />
            </label>
            <label>
              Loại chứng từ
              <select
                aria-label="Loại chứng từ"
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value as typeof typeFilter)}
              >
                <option value="all">Tất cả</option>
                <option value="invoice">Hóa đơn</option>
                <option value="quote">Báo giá</option>
              </select>
            </label>
            <label>
              Trạng thái
              <select
                aria-label="Trạng thái"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
              >
                <option value="all">Tất cả</option>
                <option value="active">Đang hiệu lực</option>
                <option value="completed">Hoàn tất</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </label>
            <button type="submit">Tìm</button>
          </form>

          {documents ? (
            <>
              <p>{total} chứng từ</p>
              {documents.length === 0 ? (
                <div className="empty-state">
                  <p>{hasFilter ? 'Không thấy chứng từ theo bộ lọc hiện tại.' : 'Chưa có chứng từ phù hợp bộ lọc.'}</p>
                  {hasFilter ? <p>Hãy thử mở rộng thời gian hoặc bỏ bớt bộ lọc.</p> : null}
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Mã</th>
                      <th>Thời gian</th>
                      <th>Khách</th>
                      <th>Người bán</th>
                      <th>Tổng</th>
                      <th>Trạng thái tiền</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((document) => (
                      <tr key={document.id}>
                        <td>{document.code}</td>
                        <td>{dateTime(document.created_at)}</td>
                        <td>{document.customer.name}</td>
                        <td>{document.seller.name}</td>
                        <td>{money(document.total_amount)}</td>
                        <td>{document.payment_status === 'not_applicable' ? 'Không áp dụng' : document.debt_amount > 0 ? `Còn nợ ${money(document.debt_amount)}` : 'Đã thanh toán'}</td>
                        <td>
                          <button
                            disabled={loadingDetailId === document.id}
                            type="button"
                            onClick={() => void openDocument(document)}
                          >
                            Mở {document.code}
                          </button>
                          {document.order_type === 'quote' && document.status === 'active' && orderService && onOpenQuoteInPos ? (
                            <button
                              disabled={openingQuoteId === document.id}
                              type="button"
                              onClick={() => void openQuoteInPos(document)}
                            >
                              Mở tại POS
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          ) : null}
        </div>

        <SalesDocumentDetailView document={selected} error={detailError} onOpenQuotePrint={onOpenQuotePrint} />
      </section>
    </main>
  )
}

function SalesDocumentDetailView({
  document,
  error,
  onOpenQuotePrint,
}: {
  document: SalesDocumentDetail | null
  error: string | null
  onOpenQuotePrint?: (documentId: string) => void
}) {
  if (error) return <p role="alert">{error}</p>
  if (!document) {
    return (
      <aside className="sales-documents-panel">
        <p>Chọn một chứng từ để xem chi tiết.</p>
      </aside>
    )
  }

  return (
    <aside
      aria-label={`Chi tiết chứng từ ${document.code}`}
      className="sales-documents-panel sales-document-detail"
      role="region"
    >
      <header>
        <h2>{document.code}</h2>
        <p>{document.customer.name}</p>
        {document.order_type === 'quote' && document.code.startsWith('BG') && onOpenQuotePrint ? (
          <button type="button" onClick={() => onOpenQuotePrint(document.id)}>
            Xem/In báo giá
          </button>
        ) : null}
      </header>
      <dl className="sales-document-summary">
        <div>
          <dt>Bảng giá</dt>
          <dd>{document.price_list?.name ?? 'Không ghi nhận'}</dd>
        </div>
        <div>
          <dt>Tiền hàng</dt>
          <dd>{money(document.subtotal_amount)}</dd>
        </div>
        <div>
          <dt>Giảm giá</dt>
          <dd>Giảm giá {money(document.discount_amount)}</dd>
        </div>
        <div>
          <dt>Khách cần trả</dt>
          <dd>{money(document.total_amount)}</dd>
        </div>
        <div>
          <dt>Khách đã trả</dt>
          <dd>Khách đã trả {money(document.paid_amount)}</dd>
        </div>
        <div>
          <dt>Công nợ</dt>
          <dd>Công nợ hóa đơn {money(document.debt_amount)}</dd>
        </div>
      </dl>

      <section aria-label="Dòng hàng">
        <h3>Dòng hàng</h3>
        {document.items.map((item) => (
          <article className="sales-document-line" key={item.id}>
            <strong>
              {item.product.code} - {item.product.name}
            </strong>
            <p>
              {item.quantity} {item.product.unit_name} x {money(item.unit_price)} = {money(item.line_total)}
            </p>
            {item.note ? <p>{item.note}</p> : null}
          </article>
        ))}
      </section>

      <section aria-label="Sổ kho">
        <h3>Sổ kho</h3>
        {document.stock_movements.length === 0 ? (
          <p>Không có bút toán kho.</p>
        ) : (
          <ul>
            {document.stock_movements.map((movement) => {
              const matchingItem = document.items.find((item) => item.product.id === movement.product_id)
              const unitName = movement.unit_name ?? matchingItem?.product.unit_name ?? ''
              return (
                <li key={movement.id}>
                  {movement.movement_type} {movement.quantity_delta} {unitName}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </aside>
  )
}
