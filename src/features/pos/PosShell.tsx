import { useEffect, useState } from 'react'
import { ConnectionStatus } from '../../components/ConnectionStatus'
import type { CurrentUserData } from '../../lib/api/types'
import type { CatalogService } from '../catalog/catalog-service'
import type { Product, ResolvedPrice } from '../catalog/types'
import { formatApiError } from '../../lib/api/error-message'
import { ProfileMenu } from './ProfileMenu'
import { ProductGrid } from './ProductGrid'

interface CartLine {
  id: string
  product: Product
  unitPrice: number
}

export function PosShell({
  catalogService,
  currentUser,
  connected = true,
  onSignOut,
  onOpenAdmin,
  onOpenDashboard,
}: {
  catalogService: CatalogService
  currentUser: CurrentUserData
  connected?: boolean
  onSignOut: () => void
  onOpenAdmin: () => void
  onOpenDashboard: () => void
}) {
  const [products, setProducts] = useState<Product[]>([])
  const [prices, setPrices] = useState<Record<string, ResolvedPrice>>({})
  const [cartLines, setCartLines] = useState<CartLine[]>([])
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
            ? await catalogService.resolvePrices(visibleProducts.map((product) => product.id))
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
  }, [catalogService])

  function selectProduct(product: Product) {
    const unitPrice = prices[product.id]?.unit_price ?? 0
    setCartLines((current) => [
      ...current,
      {
        id: `${product.id}-${current.length + 1}`,
        product,
        unitPrice,
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
        <h2>Giỏ hàng</h2>
        {cartLines.length === 0 ? <p>Chọn sản phẩm từ lưới nhanh để bắt đầu.</p> : null}
        {cartLines.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Đơn vị</th>
                <th>Giá</th>
              </tr>
            </thead>
            <tbody>
              {cartLines.map((line) => (
                <tr key={line.id}>
                  <td>{line.product.name}</td>
                  <td>{line.product.unit_name}</td>
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
      </section>
    </main>
  )
}
