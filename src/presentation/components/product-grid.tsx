'use client'

import { Product } from '@/domain/product'
import { ProductCard } from './product-card'
import { useAppDispatch, useAppSelector } from '../store'
import { addPage } from '../store/product-slice'

interface ProductGridProps {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  const dispatch = useAppDispatch()
  const page = useAppSelector(state => state.product?.productList?.page)
  console.log(page)

  const handleShowMoreProductList = () => {
    dispatch(addPage())
  }

  if (products.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon" aria-hidden="true">📡</div>
        <h3 className="empty-state__title">Belum Ada Produk Tersedia</h3>
        <p className="empty-state__description">
          Silakan periksa koneksi backend API di <code>localhost:8084</code> atau coba refresh halaman.
        </p>
      </div>
    )
  }

  return (
    <div className="product-grid" role="region" aria-label="Daftar Produk Orbit">
      Page: {page}
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}

      <button onClick={handleShowMoreProductList}>Show More</button>
    </div>
  )
}
