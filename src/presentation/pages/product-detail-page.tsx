import Image from 'next/image'
import Link from 'next/link'
import { getProductByIdController } from '@/controllers/product-controller'
import { formatPrice } from '@/domain/product'

interface ProductDetailPageProps {
  productId: string
}

export async function ProductDetailPage({ productId }: ProductDetailPageProps) {
  const product = await getProductByIdController(productId)

  if (!product) {
    return (
      <div className="container section">
        <Link href="/" className="back-link">
          &larr; Kembali ke Katalog Produk
        </Link>
        <div className="empty-state">
          <div className="empty-state__icon" aria-hidden="true">🔍</div>
          <h2 className="empty-state__title">Produk Tidak Ditemukan</h2>
          <p className="empty-state__description">
            Perangkat modem dengan ID <code>{productId}</code> tidak ditemukan di katalog kami.
          </p>
          <Link href="/" className="btn btn-primary btn-sm" style={{ marginTop: '16px' }}>
            Lihat Semua Produk
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container section">
      <Link href="/" className="back-link">
        &larr; Kembali ke Katalog Produk
      </Link>

      <div className="product-detail">
        {/* Left: Product Image */}
        <div className="product-detail__image-box">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              width={500}
              height={400}
              className="product-detail__image"
              unoptimized
              priority
            />
          ) : (
            <div className="product-detail__image-placeholder">📦</div>
          )}
          <span className="badge badge-primary product-detail__badge">Modem Resmi Orbit</span>
        </div>

        {/* Right: Product Info & Specs */}
        <div className="product-detail__info">
          <div className="product-detail__header">
            <span className="product-detail__tag">Garansi Resmi 1 Tahun</span>
            <h1 className="product-detail__title">{product.name}</h1>
            <div className="product-detail__price-tag">
              <span className="product-detail__price-label">Harga Spesial</span>
              <span className="product-detail__price">{formatPrice(product.price)}</span>
            </div>
          </div>

          <div className="product-detail__desc-section">
            <h2 className="product-detail__section-title">Deskripsi Produk</h2>
            <p className="product-detail__description">
              {product.description ||
                'Modem internet rumah nirkabel praktis dengan kecepatan tinggi dan jangkauan luas tanpa instalasi kabel rumit.'}
            </p>
          </div>

          {product.features && product.features.length > 0 && (
            <div className="product-detail__features-section">
              <h2 className="product-detail__section-title">Keunggulan Perangkat</h2>
              <ul className="product-detail__feature-list">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="product-detail__feature-item">
                    <span className="product-detail__check-icon" aria-hidden="true">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="product-detail__actions">
            <Link
              href={`/products/${product.id}/checkout`}
              className="btn btn-primary btn-lg"
              style={{ textDecoration: 'none', textAlign: 'center' }}
            >
              Beli Modem Sekarang &rarr;
            </Link>
            <span className="product-detail__guarantee">
              🔒 Transaksi aman &amp; pengiriman cepat ke seluruh Indonesia
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
