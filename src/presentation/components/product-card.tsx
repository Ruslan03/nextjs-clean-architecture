import Image from 'next/image'
import Link from 'next/link'
import { Product, formatPrice } from '@/domain/product'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="product-card">
      <div className="product-card__image-container">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            width={320}
            height={240}
            className="product-card__image"
            unoptimized
          />
        ) : (
          <div className="product-card__image-placeholder">
            <span>📦</span>
          </div>
        )}
        <span className="badge badge-primary">Modem Orbit</span>
      </div>

      <div className="product-card__body">
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__desc">
          Nikmati koneksi internet rumah nirkabel berkecepatan tinggi dengan kuota melimpah.
        </p>
      </div>

      <div className="product-card__footer">
        <div className="product-card__price-wrapper">
          <span className="product-card__price-label">Harga</span>
          <span className="product-card__price">{formatPrice(product.price)}</span>
        </div>

        <Link href={`/products/${product.id}`} className="btn btn-primary btn-sm">
          Lihat Detail
        </Link>
      </div>
    </article>
  )
}
