import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
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

const posDraftStorageKey = 'qc-oms.pos.invoice-tabs.v1'
const maxInvoiceTabs = 10

interface PosInvoiceTab {
  id: string
  number: number
  cartLines: CheckoutCartLine[]
  selectedCustomer: Customer | null
  sourceQuote?: { id: string; code: string }
}

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
  const [initialTabs] = useState(() => initialQuotePayloadToTabs(initialQuotePayload))
  const [tabs, setTabs] = useState<PosInvoiceTab[]>(initialTabs)
  const [activeTabId, setActiveTabId] = useState(initialTabs[0]?.id ?? makeInvoiceTab(1).id)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [productSearch, setProductSearch] = useState('')
  const productSearchRef = useRef<HTMLInputElement>(null)
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0] ?? makeInvoiceTab(1)
  const cartLines = activeTab.cartLines
  const selectedCustomer = activeTab.selectedCustomer
  const sourceQuote = activeTab.sourceQuote
  const canApplyDiscount = currentUser.permissions.includes('perm.apply_discount')
  const updateActiveTab = useCallback((updater: (tab: PosInvoiceTab) => PosInvoiceTab) => {
    setTabs((current) =>
      current.map((tab) => (tab.id === activeTabId ? updater(tab) : tab)),
    )
  }, [activeTabId])
  const productSearchResults = useMemo(() => {
    const query = normalizeSearch(productSearch)
    if (query.length === 0) return []
    return products
      .filter((product) =>
        `${product.code} ${product.name}`.split(/\s+/).some((part) =>
          normalizeSearch(part).includes(query),
        ) || normalizeSearch(`${product.code} ${product.name}`).includes(query),
      )
      .slice(0, 7)
  }, [productSearch, products])

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
        updateActiveTab((tab) => ({
          ...tab,
          cartLines: tab.cartLines.map((line) => {
            if (line.isManualPrice) return line
            const resolved = priceResult.items.find((price) => price.product_id === line.product.id)
            if (resolved === undefined) return line
            return clampLineDiscount({
              ...line,
              unitPrice: resolved.unit_price,
              priceSource: resolved.price_source,
            })
          }),
        }))
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
  }, [catalogService, selectedCustomer, updateActiveTab])

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if (event.key !== 'F3') return
      event.preventDefault()
      productSearchRef.current?.focus()
      productSearchRef.current?.select()
    }

    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  useEffect(() => {
    persistInvoiceTabs(tabs)
  }, [tabs])

  function createInvoiceTab() {
    if (tabs.length >= maxInvoiceTabs) return
    const tab = makeInvoiceTab(nextInvoiceNumber(tabs))
    setTabs((current) => [...current, tab])
    setActiveTabId(tab.id)
  }

  function closeInvoiceTab(tabId: string) {
    const target = tabs.find((tab) => tab.id === tabId)
    if (target === undefined) return
    if (
      isInvoiceTabDirty(target) &&
      !window.confirm('Đơn hàng này chưa được lưu, bạn có chắc chắn muốn xóa không?')
    ) {
      return
    }

    setTabs((current) => {
      const targetIndex = current.findIndex((tab) => tab.id === tabId)
      if (targetIndex < 0) return current
      const remaining = current.filter((tab) => tab.id !== tabId)
      if (remaining.length === 0) {
        const freshTab = makeInvoiceTab(1)
        setActiveTabId(freshTab.id)
        return [freshTab]
      }
      if (tabId === activeTabId) {
        const nextTab = remaining[Math.min(targetIndex, remaining.length - 1)]
        setActiveTabId(nextTab.id)
      }
      return remaining
    })
  }

  function selectProduct(product: Product) {
    const unitPrice = prices[product.id]?.unit_price ?? 0
    const priceSource = prices[product.id]?.price_source ?? 'default_price_list'
    updateActiveTab((tab) => ({
      ...tab,
      cartLines: [
        ...tab.cartLines,
        {
          id: `${product.id}-${tab.cartLines.length + 1}`,
          product,
          quantity: 1,
          unitPrice,
          priceSource,
          isManualPrice: false,
          discountAmount: 0,
        },
      ],
    }))
  }

  function selectProductFromSearch(product: Product) {
    selectProduct(product)
    setProductSearch('')
  }

  function handleProductSearchKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setProductSearch('')
      return
    }
    if (event.key !== 'Enter') return
    const firstResult = productSearchResults[0]
    if (firstResult === undefined) return
    event.preventDefault()
    selectProductFromSearch(firstResult)
  }

  function updateLineQuantity(lineId: string, quantity: number) {
    updateActiveTab((tab) => ({
      ...tab,
      cartLines: tab.cartLines.map((line) =>
        line.id === lineId
          ? clampLineDiscount({ ...line, quantity: Math.max(quantity, 0) })
          : line,
      ),
    }))
  }

  function updateLineUnitPrice(lineId: string, unitPrice: number) {
    updateActiveTab((tab) => ({
      ...tab,
      cartLines: tab.cartLines
        .map((line) =>
          line.id === lineId
            ? {
                ...line,
                unitPrice: Math.max(unitPrice, 0),
                priceSource: 'manual' as const,
                isManualPrice: true,
              }
            : line,
        )
        .map((line) => (line.id === lineId ? clampLineDiscount(line) : line)),
    }))
  }

  function updateLineDiscount(lineId: string, discountAmount: number) {
    updateActiveTab((tab) => ({
      ...tab,
      cartLines: tab.cartLines.map((line) =>
        line.id === lineId
          ? clampLineDiscount({ ...line, discountAmount: Math.max(discountAmount, 0) })
          : line,
      ),
    }))
  }

  function removeLine(lineId: string) {
    updateActiveTab((tab) => ({
      ...tab,
      cartLines: tab.cartLines.filter((line) => line.id !== lineId),
    }))
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
    updateActiveTab((tab) => ({
      ...tab,
      selectedCustomer: queueCustomer ?? tab.selectedCustomer,
      cartLines: [
        ...tab.cartLines,
        {
          id: `${payload.queue_item_id}-${tab.cartLines.length + 1}`,
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
      ],
    }))
  }

  return (
    <main className="pos-shell">
      <section aria-label="K01 topbar" className="pos-topbar">
        <section aria-label="K01 tìm kiếm" className="pos-topbar-search">
          <button
            aria-label="QC"
            className="pos-brand-button"
            type="button"
            onClick={onOpenDashboard}
          >
            QC
          </button>
          <label>
            <span>Tìm hàng (F3)</span>
            <input
              ref={productSearchRef}
              value={productSearch}
              placeholder="Tìm hàng, combo, vật tư"
              onChange={(event) => setProductSearch(event.target.value)}
              onKeyDown={handleProductSearchKeyDown}
            />
          </label>
          {productSearch.trim().length > 0 ? (
            <ul aria-label="Kết quả tìm hàng" className="pos-search-results" role="listbox">
              {productSearchResults.length > 0 ? (
                productSearchResults.map((product) => {
                  const price = prices[product.id]?.unit_price ?? 0
                  return (
                    <li key={product.id}>
                      <button
                        role="option"
                        aria-selected="false"
                        type="button"
                        onClick={() => selectProductFromSearch(product)}
                      >
                        <strong>{product.code} {product.name}</strong>
                        <span>{product.unit_name}</span>
                        <span>{price.toLocaleString('vi-VN')}</span>
                      </button>
                    </li>
                  )
                })
              ) : (
                <li role="option" aria-selected="false">Không tìm thấy hàng hóa phù hợp</li>
              )}
            </ul>
          ) : null}
        </section>
        <section aria-label="K01 tab hóa đơn" className="pos-topbar-tabs">
          {tabs.map((tab) => {
            const isActiveTab = tab.id === activeTabId
            return (
              <span
                key={tab.id}
                className="pos-invoice-tab"
                data-current={isActiveTab ? 'true' : undefined}
              >
                <button
                  aria-current={isActiveTab ? 'true' : undefined}
                  type="button"
                  onClick={() => setActiveTabId(tab.id)}
                >
                  {invoiceTabLabel(tab, isActiveTab)}
                </button>
                {isActiveTab ? (
                  <button
                    aria-label={`Đóng Hóa đơn ${tab.number}`}
                    className="pos-invoice-tab-close"
                    type="button"
                    onClick={() => closeInvoiceTab(tab.id)}
                  >
                    ×
                  </button>
                ) : null}
              </span>
            )
          })}
          <button
            aria-label="Tạo hóa đơn mới"
            disabled={tabs.length >= maxInvoiceTabs}
            title={tabs.length >= maxInvoiceTabs ? 'Đã đạt tối đa 10 hóa đơn đang mở' : undefined}
            type="button"
            onClick={createInvoiceTab}
          >
            +
          </button>
        </section>
        <section aria-label="K01 khui vật tư" className="pos-topbar-material">
          <button disabled type="button">Khui VT</button>
        </section>
        <section aria-label="K01 tiện ích" className="pos-topbar-actions">
          <button aria-label="Lịch sử 10 đơn gần nhất" className="pos-icon-button" type="button">
            🕒
          </button>
          <ConnectionStatus connected={connected} />
          <button
            aria-label="Tải lại giao diện"
            className="pos-icon-button"
            type="button"
            onClick={() => window.location.reload()}
          >
            ↻
          </button>
          <ProfileMenu
            displayName={currentUser.user.display_name}
            permissions={currentUser.permissions}
            onSignOut={onSignOut}
            onOpenAdmin={onOpenAdmin}
            onOpenDashboard={onOpenDashboard}
          />
        </section>
      </section>
      <section aria-label="K02 giỏ hàng" className="pos-cart">
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
        <CustomerPanel
          service={catalogService}
          selectedCustomer={selectedCustomer}
          onSelectCustomer={(customer) =>
            updateActiveTab((tab) => ({ ...tab, selectedCustomer: customer }))
          }
        />
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
            updateActiveTab((tab) => ({
              ...tab,
              sourceQuote: undefined,
              cartLines: [],
            }))
          }}
        />
      </section>
    </main>
  )
}

function normalizeSearch(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function initialQuotePayloadToTabs(payload: QuoteReopenPayload | null): PosInvoiceTab[] {
  if (payload !== null) {
    return [
      {
        ...makeInvoiceTab(1),
        cartLines: quotePayloadToCartLines(payload),
        selectedCustomer: quotePayloadToCustomer(payload),
        sourceQuote: { id: payload.quote.id, code: payload.quote.code },
      },
    ]
  }

  const restored = restoreInvoiceTabs()
  return restored.length > 0 ? restored : [makeInvoiceTab(1)]
}

function makeInvoiceTab(number: number): PosInvoiceTab {
  return {
    id: `invoice-${number}`,
    number,
    cartLines: [],
    selectedCustomer: null,
  }
}

function invoiceTabLabel(tab: PosInvoiceTab, active = true) {
  const dirty = isInvoiceTabDirty(tab)
  const prefix = active ? 'Hóa đơn' : 'HĐ'
  return `${prefix} ${tab.number}${dirty ? ' •' : ''}`
}

function isInvoiceTabDirty(tab: PosInvoiceTab) {
  return tab.cartLines.length > 0 || tab.selectedCustomer !== null || tab.sourceQuote !== undefined
}

function nextInvoiceNumber(tabs: PosInvoiceTab[]) {
  const used = new Set(tabs.map((tab) => tab.number))
  for (let number = 1; number <= maxInvoiceTabs; number += 1) {
    if (!used.has(number)) return number
  }
  return Math.min(tabs.length + 1, maxInvoiceTabs)
}

function persistInvoiceTabs(tabs: PosInvoiceTab[]) {
  window.localStorage.setItem(posDraftStorageKey, JSON.stringify(tabs.slice(0, maxInvoiceTabs)))
}

function restoreInvoiceTabs(): PosInvoiceTab[] {
  try {
    const raw = window.localStorage.getItem(posDraftStorageKey)
    if (raw === null) return []
    const parsed = JSON.parse(raw) as PosInvoiceTab[]
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((tab) => Number.isInteger(tab.number) && Array.isArray(tab.cartLines))
      .slice(0, maxInvoiceTabs)
      .map((tab) => ({
        ...makeInvoiceTab(tab.number),
        id: typeof tab.id === 'string' ? tab.id : `invoice-${tab.number}`,
        cartLines: tab.cartLines,
        selectedCustomer: tab.selectedCustomer ?? null,
        sourceQuote: tab.sourceQuote,
      }))
  } catch {
    return []
  }
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
