import { useEffect, useState } from 'react'
import { ConnectionStatus } from '../../components/ConnectionStatus'
import type { CurrentUserData } from '../../lib/api/types'
import type { CatalogService } from '../catalog/catalog-service'
import type { Customer, Product, ResolvedPrice } from '../catalog/types'
import type { CheckoutCartLine, OrderService } from '../orders/order-service'
import { CheckoutPanel } from './CheckoutPanel'
import { CustomerPanel } from './CustomerPanel'
import { formatApiError } from '../../lib/api/error-message'
import { ProfileMenu } from './ProfileMenu'
import { ProductGrid } from './ProductGrid'

export function PosShell({
  catalogService,
  orderService,
  currentUser,
  connected = true,
  onSignOut,
  onOpenAdmin,
  onOpenDashboard,
}: {
  catalogService: CatalogService
  orderService: OrderService
  currentUser: CurrentUserData
  connected?: boolean
  onSignOut: () => void
  onOpenAdmin: () => void
  onOpenDashboard: () => void
}) {
  const [products, setProducts] = useState<Product[]>([])
  const [prices, setPrices] = useState<Record<string, ResolvedPrice>>({})
  const [cartLines, setCartLines] = useState<CheckoutCartLine[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        <h2>Giỏ hàng</h2>
        {cartLines.length === 0 ? <p>Chọn sản phẩm từ lưới nhanh để bắt đầu.</p> : null}
        {cartLines.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Đơn vị</th>
                <th>SL</th>
                <th>Giá</th>
              </tr>
            </thead>
            <tbody>
              {cartLines.map((line) => (
                <tr key={line.id}>
                  <td>{line.product.name}</td>
                  <td>{line.product.unit_name}</td>
                  <td>{line.quantity.toLocaleString('vi-VN')}</td>
                  <td>{line.unitPrice.toLocaleString('vi-VN')}</td>
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
        />
      </section>
    </main>
  )
}
