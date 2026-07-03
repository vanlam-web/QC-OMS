import { useEffect, useState } from 'react'
import { ConnectionStatus } from '../../components/ConnectionStatus'
import type { CurrentUserData } from '../../lib/api/types'
import type { CatalogService } from '../catalog/catalog-service'
import type { Customer, Product, ResolvedPrice } from '../catalog/types'
import type { CheckoutCartLine, OrderService, QuoteReopenPayload } from '../orders/order-service'
import type { ProductionQueueService } from '../production-queue/production-queue-service'
import type { ProductionQueueDraftPayload } from '../production-queue/types'
import { CheckoutPanel } from './CheckoutPanel'
import { CustomerPanel } from './CustomerPanel'
import { formatApiError } from '../../lib/api/error-message'
import { ProfileMenu } from './ProfileMenu'
import { ProductGrid } from './ProductGrid'
import { ProductionQueuePanel } from './ProductionQueuePanel'
import { consumeQuoteReopenPayload } from './quote-draft-handoff'

export function PosShell({
  catalogService,
  orderService,
  productionQueueService,
  currentUser,
  connected = true,
  onSignOut,
  onOpenAdmin,
  onOpenDashboard,
}: {
  catalogService: CatalogService
  orderService: OrderService
  productionQueueService: ProductionQueueService
  currentUser: CurrentUserData
  connected?: boolean
  onSignOut: () => void
  onOpenAdmin: () => void
  onOpenDashboard: () => void
}) {
  const [products, setProducts] = useState<Product[]>([])
  const [prices, setPrices] = useState<Record<string, ResolvedPrice>>({})
  const [initialQuotePayload] = useState(() => consumeQuoteReopenPayload())
  const [cartLines, setCartLines] = useState<CheckoutCartLine[]>(() =>
    initialQuotePayload === null ? [] : quotePayloadToCartLines(initialQuotePayload),
  )
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(() =>
    initialQuotePayload === null ? null : quotePayloadToCustomer(initialQuotePayload),
  )
  const [sourceQuote, setSourceQuote] = useState<{ id: string; code: string } | undefined>(() =>
    initialQuotePayload === null
      ? undefined
      : { id: initialQuotePayload.quote.id, code: initialQuotePayload.quote.code },
  )
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const canApplyDiscount = currentUser.permissions.includes('perm.apply_discount')

  useEffect(() => {
    let active = true

    async function loadProducts() {
      setLoadingProducts(true)
      setError(null)
      try {
        const productResult = await catalogService.listProducts({ status: 'active' })
        const visibleProducts = productResult.items.slice(0, 12)
        const priceResult =
          visibleProducts.length > 0
            ? await catalogService.resolvePrices(
                visibleProducts.map((product) => product.id),
                selectedCustomer?.id,
              )
            : { items: [] }
        if (!active) return
        setProducts(visibleProducts)
        setPrices(
          Object.fromEntries(priceResult.items.map((price) => [price.product_id, price])),
        )
        setCartLines((current) =>
          current.map((line) => {
            if (line.isManualPrice) return line
            const resolved = priceResult.items.find((price) => price.product_id === line.product.id)
            if (resolved === undefined) return line
            return clampLineDiscount({
              ...line,
              unitPrice: resolved.unit_price,
              priceSource: resolved.price_source,
            })
          }),
        )
      } catch (cause) {
        if (active) setError(formatApiError(cause, 'Không tải được sản phẩm POS.'))
      } finally {
        if (active) setLoadingProducts(false)
      }
    }

    void loadProducts()

    return () => {
      active = false
    }
  }, [catalogService, selectedCustomer])

  function selectProduct(product: Product) {
    const unitPrice = prices[product.id]?.unit_price ?? 0
    const priceSource = prices[product.id]?.price_source ?? 'default_price_list'
    setCartLines((current) => [
      ...current,
      {
        id: `${product.id}-${current.length + 1}`,
        product,
        quantity: 1,
        unitPrice,
        priceSource,
        isManualPrice: false,
        discountAmount: 0,
      },
    ])
  }

  function updateLineQuantity(lineId: string, quantity: number) {
    setCartLines((current) =>
      current.map((line) =>
        line.id === lineId
          ? clampLineDiscount({ ...line, quantity: Math.max(quantity, 0) })
          : line,
      ),
    )
  }

  function updateLineUnitPrice(lineId: string, unitPrice: number) {
    setCartLines((current) =>
      current.map((line) =>
        line.id === lineId
          ? {
              ...line,
              unitPrice: Math.max(unitPrice, 0),
              priceSource: 'manual',
              isManualPrice: true,
            }
          : line,
      ).map((line) => (line.id === lineId ? clampLineDiscount(line) : line)),
    )
  }

  function updateLineDiscount(lineId: string, discountAmount: number) {
    setCartLines((current) =>
      current.map((line) =>
        line.id === lineId
          ? clampLineDiscount({ ...line, discountAmount: Math.max(discountAmount, 0) })
          : line,
      ),
    )
  }

  function removeLine(lineId: string) {
    setCartLines((current) => current.filter((line) => line.id !== lineId))
  }

  async function handleProductionQueueDraft(payload: ProductionQueueDraftPayload) {
    const queueCustomer =
      payload.customer === null
        ? null
        : {
            id: payload.customer.id,
            code: payload.customer.code,
            name: payload.customer.name,
            phone: null,
            tax_code: null,
            address: null,
            customer_group_id: null,
            customer_group: null,
          }
    const customerForPricing = queueCustomer ?? selectedCustomer
    const priceResult = await catalogService.resolvePrices(
      [payload.draft_line.product_id],
      customerForPricing?.id,
    )
    const resolvedPrice = priceResult.items[0]
    if (queueCustomer !== null) setSelectedCustomer(queueCustomer)
    setCartLines((current) => [
      ...current,
      {
        id: `${payload.queue_item_id}-${current.length + 1}`,
        product: {
          id: payload.draft_line.product_id,
          code: payload.draft_line.product_code,
          name: payload.draft_line.product_name,
          status: 'active',
          unit_name: payload.draft_line.unit_name,
          sell_method: payload.draft_line.sell_method,
        },
        quantity: payload.draft_line.quantity,
        width_m: payload.draft_line.width_m ?? undefined,
        height_m: payload.draft_line.height_m ?? undefined,
        linear_m: payload.draft_line.linear_m ?? undefined,
        unitPrice: resolvedPrice?.unit_price ?? 0,
        priceSource: resolvedPrice?.price_source ?? 'default_price_list',
        isManualPrice: false,
        discountAmount: 0,
        note: 'Từ hàng đợi máy sản xuất',
      },
    ])
  }

  return (
    <main className="pos-shell">
      <section aria-label="K01 topbar" className="pos-topbar">
        <strong>QC-OMS POS</strong>
        <ConnectionStatus connected={connected} />
        <button disabled>Tìm kiếm</button>
        <ProfileMenu
          displayName={currentUser.user.display_name}
          permissions={currentUser.permissions}
          onSignOut={onSignOut}
          onOpenAdmin={onOpenAdmin}
          onOpenDashboard={onOpenDashboard}
        />
      </section>
      <section aria-label="K02 giỏ hàng" className="pos-cart">
        <CustomerPanel
          service={catalogService}
          selectedCustomer={selectedCustomer}
          onSelectCustomer={setSelectedCustomer}
        />
        <ProductionQueuePanel
          service={productionQueueService}
          onAddToDraft={handleProductionQueueDraft}
        />
        <h2>Giỏ hàng</h2>
        {sourceQuote ? <p>Từ báo giá {sourceQuote.code}</p> : null}
        {cartLines.length === 0 ? <p>Chọn sản phẩm từ lưới nhanh để bắt đầu.</p> : null}
        {cartLines.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Đơn vị</th>
                <th>SL</th>
                <th>Giá</th>
                {canApplyDiscount ? <th>Giảm</th> : null}
                <th>Thành tiền</th>
                <th>Nguồn giá</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cartLines.map((line) => (
                <tr key={line.id}>
                  <td>
                    <strong>{line.product.name}</strong>
                    <span>{line.product.code}</span>
                    {line.quoteWarnings?.map((warning) => (
                      <span key={warning.code}>{warning.message}</span>
                    ))}
                  </td>
                  <td>{line.product.unit_name}</td>
                  <td>
                    <input
                      aria-label={`Số lượng ${line.product.name}`}
                      inputMode="decimal"
                      min="0"
                      type="number"
                      value={line.quantity}
                      onChange={(event) =>
                        updateLineQuantity(line.id, readPositiveNumber(event.target.value))
                      }
                    />
                  </td>
                  <td>
                    <input
                      aria-label={`Đơn giá ${line.product.name}`}
                      inputMode="numeric"
                      min="0"
                      type="number"
                      value={line.unitPrice}
                      onChange={(event) =>
                        updateLineUnitPrice(line.id, readPositiveNumber(event.target.value))
                      }
                    />
                  </td>
                  {canApplyDiscount ? (
                    <td>
                      <input
                        aria-label={`Giảm ${line.product.name}`}
                        inputMode="numeric"
                        min="0"
                        type="number"
                        value={line.discountAmount ?? 0}
                        onChange={(event) =>
                          updateLineDiscount(line.id, readPositiveNumber(event.target.value))
                        }
                      />
                    </td>
                  ) : null}
                  <td>{lineTotal(line).toLocaleString('vi-VN')}</td>
                  <td>{line.isManualPrice ? 'Giá sửa tay' : 'Giá tự động'}</td>
                  <td>
                    <button type="button" onClick={() => removeLine(line.id)}>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </section>
      <section aria-label="K03 sản phẩm" className="pos-payment">
        {error ? <p role="alert">{error}</p> : null}
        <ProductGrid
          products={products}
          prices={prices}
          loading={loadingProducts}
          onSelectProduct={selectProduct}
        />
        <CheckoutPanel
          cartLines={cartLines}
          selectedCustomer={selectedCustomer}
          orderService={orderService}
          sourceQuote={sourceQuote}
          quoteBlockedReason={quoteBlockedReason(cartLines)}
          onCheckoutSuccess={() => {
            setSourceQuote(undefined)
            setCartLines([])
          }}
        />
      </section>
    </main>
  )
}

function quoteBlockedReason(cartLines: CheckoutCartLine[]): string | null {
  const blockedLine = cartLines.find((line) =>
    line.product.status !== 'active' || line.product.id.startsWith('missing-')
  )
  return blockedLine === undefined
    ? null
    : 'Sản phẩm trong báo giá không còn khả dụng. Hãy thay thế dòng trước khi thanh toán.'
}

function quotePayloadToCustomer(payload: QuoteReopenPayload): Customer | null {
  if (payload.customer.customer_id === null) return null
  return {
    id: payload.customer.customer_id,
    code: payload.customer.snapshot.code ?? '',
    name: payload.customer.snapshot.name,
    phone: payload.customer.snapshot.phone,
    tax_code: null,
    address: null,
    customer_group_id: null,
    customer_group: null,
  }
}

function quotePayloadToCartLines(payload: QuoteReopenPayload): CheckoutCartLine[] {
  return payload.items.map((item, index) => {
    const blocked = item.warnings.some(
      (warning) => warning.code === 'PRODUCT_INACTIVE' || warning.code === 'PRODUCT_MISSING',
    )
    return {
      id: `${payload.quote.id}-${index + 1}`,
      product: {
        id: item.product_id ?? `missing-${item.order_item_id}`,
        code: item.product_snapshot.code,
        name: item.product_snapshot.name,
        status: blocked ? 'inactive' : 'active',
        unit_name: item.product_snapshot.unit_name,
        sell_method: item.product_snapshot.sell_method,
      },
      quantity: item.quantity,
      width_m: item.width_m ?? undefined,
      height_m: item.height_m ?? undefined,
      linear_m: item.linear_m ?? undefined,
      unitPrice: item.unit_price,
      discountAmount: item.discount_amount,
      priceSource: item.price_source,
      isManualPrice: true,
      note: item.note ?? undefined,
      quoteWarnings: item.warnings,
    }
  })
}

function readPositiveNumber(value: string): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

function lineSubtotal(line: CheckoutCartLine): number {
  return Math.round(line.quantity * line.unitPrice)
}

function lineTotal(line: CheckoutCartLine): number {
  return lineSubtotal(line) - Math.min(line.discountAmount ?? 0, lineSubtotal(line))
}

function clampLineDiscount(line: CheckoutCartLine): CheckoutCartLine {
  return {
    ...line,
    discountAmount: Math.min(line.discountAmount ?? 0, lineSubtotal(line)),
  }
}
