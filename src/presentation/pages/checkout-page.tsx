/**
 * PRESENTATION LAYER — Checkout Page (View)
 *
 * Server Component that coordinates fetching the product and shipping cities
 * via their respective Controllers, and passes clean Domain entities to the
 * CheckoutForm presentation component.
 */

import Image from 'next/image'
import Link from 'next/link'
import { getProductByIdController } from '@/controllers/product-controller'
import { getShippingCitiesController } from '@/controllers/shipping-controller'
import { formatPrice } from '@/domain/product'
import { CheckoutForm } from '@/presentation/components/checkout-form'

interface CheckoutPageProps {
  productId: string
}

export async function CheckoutPage({ productId }: CheckoutPageProps) {
  const [product, cities] = await Promise.all([
    getProductByIdController(productId),
    getShippingCitiesController(),
  ])

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
            Perangkat modem dengan ID <code>{productId}</code> tidak ditemukan untuk proses checkout.
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
      {/* Navigation Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <Link href="/">Beranda</Link>
        <span className="breadcrumb__separator">/</span>
        <Link href={`/products/${product.id}`}>{product.name}</Link>
        <span className="breadcrumb__separator">/</span>
        <span className="breadcrumb__current">Checkout</span>
      </nav>

      <div className="checkout-page-header">
        <h1 className="checkout-page-title">Checkout Pemesanan Modem</h1>
        <p className="checkout-page-subtitle">
          Lengkapi data penerima dan pilih kota tujuan untuk menghitung ongkos kirim resmi dari <strong>CekOngkir</strong>.
        </p>
      </div>

      <div className="checkout-layout">
        {/* Left Column: Form Input */}
        <div className="checkout-layout__main">
          <CheckoutForm product={product} cities={cities} />
        </div>

        {/* Right Column: Order Summary Sidebar */}
        <aside className="checkout-layout__sidebar" aria-label="Ringkasan Pesanan">
          <div className="checkout-summary-card">
            <h2 className="checkout-summary-card__title">Ringkasan Produk</h2>

            <div className="checkout-summary-card__product">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  width={100}
                  height={80}
                  className="checkout-summary-card__img"
                  unoptimized
                />
              ) : (
                <div className="checkout-summary-card__img-placeholder">📦</div>
              )}

              <div className="checkout-summary-card__details">
                <span className="badge badge-primary" style={{ fontSize: '11px', padding: '2px 8px' }}>
                  Modem Orbit
                </span>
                <h3 className="checkout-summary-card__name">{product.name}</h3>
                <div className="checkout-summary-card__price">{formatPrice(product.price)}</div>
              </div>
            </div>

            <div className="checkout-summary-card__benefits">
              <h4 className="checkout-summary-card__benefits-title">Termasuk dalam Paket:</h4>
              <ul className="checkout-summary-card__benefits-list">
                <li>
                  <span className="text-success mr-2">✓</span> Garansi Resmi Telkomsel 1 Tahun
                </li>
                <li>
                  <span className="text-success mr-2">✓</span> Kuota Bonus Aktivasi MyOrbit
                </li>
                <li>
                  <span className="text-success mr-2">✓</span> Asuransi Pengiriman Ekspedisi
                </li>
              </ul>
            </div>

            <div className="checkout-summary-card__info-box">
              <span className="checkout-summary-card__info-icon">ℹ️</span>
              <p className="checkout-summary-card__info-text">
                Integrasi logistik menggunakan adapter <strong>CekOngkir</strong> pihak ketiga yang ditransformasikan melalui DTO ke domain shipping entity.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
