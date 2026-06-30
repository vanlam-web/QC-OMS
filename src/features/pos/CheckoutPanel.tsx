import { useEffect, useMemo, useState } from 'react'
import type { Customer } from '../catalog/types'
import type { CheckoutCartLine, CheckoutResult, FinanceAccount, OrderService, RecentPriceList } from '../orders/order-service'
import { formatApiError } from '../../lib/api/error-message'

export function CheckoutPanel({
  cartLines,
  selectedCustomer,
  orderService,
}: {
  cartLines: CheckoutCartLine[]
  selectedCustomer: Customer | null
  orderService: OrderService
}) {
  const [cashAmountOverride, setCashAmountOverride] = useState<number | null>(null)
  const [bankAmount, setBankAmount] = useState(0)
  const [bankAccountId, setBankAccountId] = useState('')
  const [retailDebtNote, setRetailDebtNote] = useState('')
  const [surplusMode, setSurplusMode] = useState<'return' | 'old-debt'>('return')
  const [accounts, setAccounts] = useState<FinanceAccount[]>([])
  const [recentPrices, setRecentPrices] = useState<Record<string, RecentPriceList['items']>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CheckoutResult | null>(null)

  const total = useMemo(
    () => cartLines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0),
    [cartLines],
  )
  const cashAmount = cashAmountOverride ?? total
  const received = cashAmount + bankAmount
  const surplus = Math.max(received - total, 0)
  const debt = Math.max(total - received, 0)

  useEffect(() => {
    let active = true
    orderService
      .listFinanceAccounts()
      .then((response) => {
        if (active) setAccounts(response.items.filter((account) => account.account_type === 'bank'))
      })
      .catch(() => {
        if (active) setAccounts([])
      })
    return () => {
      active = false
    }
  }, [orderService])

  async function showRecentPrices(line: CheckoutCartLine) {
    if (selectedCustomer === null) return
    const response = await orderService.listRecentCustomerProductPrices(selectedCustomer.id, line.product.id)
    setRecentPrices((current) => ({ ...current, [line.id]: response.items.slice(0, 5) }))
  }

  async function submitCheckout() {
    setError(null)
    setResult(null)
    if (cartLines.length === 0) {
      setError('Chưa có dòng hàng để checkout.')
      return
    }
    if (bankAmount > 0 && bankAccountId === '') {
      setError('Chọn tài khoản nhận chuyển khoản.')
      return
    }
    if (selectedCustomer === null && debt > 0 && retailDebtNote.trim() === '') {
      setError('Nhập ghi chú nợ khách lẻ.')
      return
    }

    setSubmitting(true)
    try {
      const checkout = await orderService.checkout({
        customer_id: selectedCustomer?.id,
        retail_debt_note: selectedCustomer === null ? retailDebtNote.trim() || undefined : undefined,
        items: cartLines.map((line) => ({
          product_id: line.product.id,
          quantity: line.quantity,
          unit_price: line.unitPrice,
          price_source: line.priceSource,
          note: line.note,
        })),
        payment: {
          cash_amount: cashAmount,
          bank_amount: bankAmount,
          bank_account_id: bankAmount > 0 ? bankAccountId : null,
          old_debt_payment_amount: selectedCustomer !== null && surplusMode === 'old-debt' ? surplus : 0,
          change_returned_amount: surplusMode === 'return' ? surplus : 0,
        },
      })
      setResult(checkout)
    } catch (cause) {
      setError(formatApiError(cause, 'Không tạo được hóa đơn.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section aria-label="Thanh toán" className="checkout-panel">
      <h2>Thanh toán</h2>
      <dl className="checkout-summary">
        <div>
          <dt>Tổng tiền</dt>
          <dd>{formatMoney(total)}</dd>
        </div>
        <div>
          <dt>Còn nợ</dt>
          <dd>{formatMoney(debt)}</dd>
        </div>
      </dl>

      <label>
        Tiền mặt
        <input
          aria-label="Tiền mặt"
          inputMode="numeric"
          type="number"
          value={cashAmount}
          onChange={(event) => setCashAmountOverride(readMoney(event.target.value))}
        />
      </label>
      <label>
        Chuyển khoản
        <input
          aria-label="Chuyển khoản"
          inputMode="numeric"
          type="number"
          value={bankAmount}
          onChange={(event) => setBankAmount(readMoney(event.target.value))}
        />
      </label>
      <label>
        Tài khoản nhận chuyển khoản
        <select
          aria-label="Tài khoản nhận chuyển khoản"
          value={bankAccountId}
          onChange={(event) => setBankAccountId(event.target.value)}
        >
          <option value="">Chọn tài khoản</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.code} - {account.name}
            </option>
          ))}
        </select>
      </label>

      {selectedCustomer === null && debt > 0 ? (
        <label>
          Ghi chú nợ khách lẻ
          <input
            aria-label="Ghi chú nợ khách lẻ"
            value={retailDebtNote}
            onChange={(event) => setRetailDebtNote(event.target.value)}
          />
        </label>
      ) : null}

      {selectedCustomer !== null && surplus > 0 ? (
        <fieldset>
          <legend>Khách trả dư {formatMoney(surplus)}</legend>
          <label>
            <input
              checked={surplusMode === 'return'}
              name="surplus-mode"
              type="radio"
              onChange={() => setSurplusMode('return')}
            />
            Trả lại khách
          </label>
          <label>
            <input
              checked={surplusMode === 'old-debt'}
              name="surplus-mode"
              type="radio"
              onChange={() => setSurplusMode('old-debt')}
            />
            Cấn vào nợ cũ
          </label>
        </fieldset>
      ) : null}

      {cartLines.map((line) => (
        <div className="recent-price-row" key={line.id}>
          <button
            disabled={selectedCustomer === null}
            type="button"
            onClick={() => void showRecentPrices(line)}
          >
            Giá gần đây {line.product.name}
          </button>
          {recentPrices[line.id]?.map((price) => (
            <span key={`${price.orderCode}-${price.soldAt}`}>
              <span>{price.orderCode}</span>
              <span>{formatMoney(price.unitPrice)}</span>
            </span>
          ))}
        </div>
      ))}

      {error ? <p role="alert">{error}</p> : null}
      <button disabled={submitting} type="button" onClick={() => void submitCheckout()}>
        Tạo hóa đơn
      </button>

      {result ? (
        <section aria-label="Kết quả checkout" className="checkout-result">
          <strong>{result.order.code}</strong>
          <span>Đã trả {formatMoney(result.order.paid_amount)}</span>
          <span>Còn nợ {formatMoney(result.order.debt_amount)}</span>
          {result.inventory_warnings.map((warning) => (
            <p key={`${warning.product_id}-${warning.message}`}>{warning.message}</p>
          ))}
        </section>
      ) : null}
    </section>
  )
}

function readMoney(value: string): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

function formatMoney(value: number): string {
  return value.toLocaleString('vi-VN')
}
