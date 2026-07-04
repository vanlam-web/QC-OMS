import { useMemo, useState } from 'react'
import type { Product, ResolvedPrice } from '../catalog/types'

const productsPerPage = 12

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
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(products.length / productsPerPage))
  const safePage = Math.min(page, totalPages)
  const visibleProducts = useMemo(
    () => products.slice((safePage - 1) * productsPerPage, safePage * productsPerPage),
    [safePage, products],
  )

  if (loading) return <p>Đang tải sản phẩm...</p>
  if (products.length === 0) return <p>Chưa có sản phẩm đang bán.</p>

  return (
    <section aria-label="Sản phẩm nhanh" className="product-grid-panel">
      <h2>Sản phẩm nhanh</h2>
      <div className="product-grid">
        {visibleProducts.map((product) => {
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
      <footer className="product-grid-footer">
        <span>{safePage} / {totalPages}</span>
        <div>
          <button
            aria-label="Trang trước sản phẩm nhanh"
            disabled={safePage === 1}
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            ‹
          </button>
          <button
            aria-label="Trang sau sản phẩm nhanh"
            disabled={safePage === totalPages}
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          >
            ›
          </button>
        </div>
      </footer>
    </section>
  )
}
