import type { Product, ResolvedPrice } from '../catalog/types'

export function ProductGrid({
  products,
  prices,
  loading,
  onSelectProduct,
}: {
  products: Product[]
  prices: Record<string, ResolvedPrice>
  loading: boolean
  onSelectProduct: (product: Product) => void
}) {
  if (loading) return <p>Đang tải sản phẩm...</p>
  if (products.length === 0) return <p>Chưa có sản phẩm đang bán.</p>

  return (
    <section aria-label="Sản phẩm nhanh" className="product-grid-panel">
      <h2>Sản phẩm nhanh</h2>
      <div className="product-grid">
        {products.slice(0, 12).map((product) => {
          const price = prices[product.id]?.unit_price ?? 0
          return (
            <button
              key={product.id}
              type="button"
              aria-label={`${product.name} ${price.toLocaleString('vi-VN')}/${product.unit_name}`}
              onClick={() => onSelectProduct(product)}
            >
              <strong>{product.name}</strong>
              <span>{price.toLocaleString('vi-VN')}/{product.unit_name}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
