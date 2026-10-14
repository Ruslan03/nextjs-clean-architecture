'use client'

/**
 * PRESENTATION LAYER — Checkout Form Component
 *
 * Interactive Client Component handling:
 * - Customer details input: Nama, Nomor Telfon, Kota Pengiriman, Alamat
 * - Dynamic city selection fetching shipping fees from "CekOngkir" service
 * - Real-time total calculation (Product Price + Shipping Fee)
 * - Submission via Server Action (`submitCheckoutController`)
 * - Rich order confirmation receipt display
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Product, formatPrice } from '@/domain/product'
import { DestinationCity } from '@/domain/shipping'
import { Order, calculateOrderTotal } from '@/domain/order'
import { submitCheckoutController } from '@/controllers/checkout-controller'
import { useAppSelector } from '../store'

interface CheckoutFormProps {
  product: Product
  cities: DestinationCity[]
}

export function CheckoutForm({ product, cities }: CheckoutFormProps) {
  const visitorProfile = useAppSelector((state) => state.visitor.profile)

  const [customerName, setCustomerName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [cityId, setCityId] = useState(cities[0]?.id || '')
  const [address, setAddress] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null)

  // Pre-fill automatically from Redux visitor profile (synced with localStorage)
  useEffect(() => {
    if (visitorProfile.isConfigured) {
      if (!customerName && visitorProfile.name) {
        setCustomerName(visitorProfile.name)
      }
      if (!address && visitorProfile.address) {
        setAddress(visitorProfile.address)
      }
      if (visitorProfile.cityId && cities.some((c) => c.id === visitorProfile.cityId)) {
        setCityId(visitorProfile.cityId)
      }
    }
  }, [visitorProfile, cities])

  const selectedCity = cities.find((c) => c.id === cityId) || cities[0]
  const currentShippingFee = selectedCity ? selectedCity.shippingFee : 0
  const grandTotal = calculateOrderTotal(product.price, currentShippingFee)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorMessage(null)
    setIsLoading(true)

    try {
      const result = await submitCheckoutController({
        productId: product.id,
        customerName,
        phoneNumber,
        cityId,
        address,
      })

      if (!result.success || !result.order) {
        setErrorMessage(result.error || 'Terjadi kesalahan saat memproses pesanan.')
      } else {
        setCompletedOrder(result.order)
      }
    } catch {
      setErrorMessage('Terjadi gangguan koneksi. Silakan coba beberapa saat lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  // ─── Order Success State: Rich Receipt ─────────────────────────────────────
  if (completedOrder) {
    return (
      <div className="order-success-card">
        <div className="order-success-card__header">
          <div className="order-success-card__icon" aria-hidden="true">🎉</div>
          <span className="badge badge-success">Pesanan Berhasil Dibuat</span>
          <h2 className="order-success-card__title">Terima Kasih, {completedOrder.customerName}!</h2>
          <p className="order-success-card__subtitle">
            Pesanan modem Telkomsel Orbit Anda telah tercatat dengan ID:{' '}
            <strong className="order-success-card__id">{completedOrder.id}</strong>
          </p>
        </div>

        <div className="order-receipt">
          <h3 className="order-receipt__heading">Rincian Pengiriman &amp; Pembayaran</h3>
          
          <div className="order-receipt__grid">
            <div className="order-receipt__item">
              <span className="order-receipt__label">Nama Pemesan</span>
              <span className="order-receipt__value">{completedOrder.customerName}</span>
            </div>
            <div className="order-receipt__item">
              <span className="order-receipt__label">Nomor Telepon</span>
              <span className="order-receipt__value">{completedOrder.phoneNumber}</span>
            </div>
            <div className="order-receipt__item">
              <span className="order-receipt__label">Kota Tujuan</span>
              <span className="order-receipt__value">{completedOrder.cityName}</span>
            </div>
            <div className="order-receipt__item">
              <span className="order-receipt__label">Alamat Lengkap</span>
              <span className="order-receipt__value">{completedOrder.address}</span>
            </div>
            <div className="order-receipt__item">
              <span className="order-receipt__label">Perangkat</span>
              <span className="order-receipt__value">{completedOrder.productName}</span>
            </div>
            <div className="order-receipt__item">
              <span className="order-receipt__label">Status Pesanan</span>
              <span className="order-receipt__value order-receipt__status">{completedOrder.status}</span>
            </div>
          </div>

          <div className="order-receipt__pricing">
            <div className="order-receipt__price-row">
              <span>Harga Perangkat</span>
              <span>{formatPrice(completedOrder.productPrice)}</span>
            </div>
            <div className="order-receipt__price-row">
              <span>Ongkos Kirim ({selectedCity?.courier || 'Ekspedisi'})</span>
              <span>{formatPrice(completedOrder.shippingFee)}</span>
            </div>
            <div className="order-receipt__price-row order-receipt__price-row--total">
              <span>Total Tagihan</span>
              <span>{formatPrice(completedOrder.totalAmount)}</span>
            </div>
          </div>
        </div>

        <div className="order-success-card__actions">
          <Link href="/" className="btn btn-primary btn-lg">
            Kembali ke Katalog Produk
          </Link>
          <Link href={`/products/${product.id}`} className="btn btn-outline btn-lg">
            Lihat Produk Lagi
          </Link>
        </div>
      </div>
    )
  }

  // ─── Checkout Form View ────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      {errorMessage && (
        <div className="alert-error" role="alert">
          <span className="alert-error__icon">⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Section 1: Customer Info */}
      <div className="checkout-form__section">
        <h3 className="checkout-form__section-title">
          <span className="checkout-form__step-number">1</span> Data Penerima
        </h3>

        {visitorProfile.isConfigured && (
          <div className="visitor-prefill-badge">
            <span className="visitor-prefill-badge__icon">👤</span>
            <span>Data nama &amp; alamat diisi otomatis dari profil pengunjung Anda.</span>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="customerName" className="form-label">
            Nama Lengkap <span className="text-danger">*</span>
          </label>
          <input
            id="customerName"
            name="customerName"
            type="text"
            required
            placeholder="Contoh: Ruslan Hidayat"
            className="form-control"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="phoneNumber" className="form-label">
            Nomor Telepon / WhatsApp <span className="text-danger">*</span>
          </label>
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            required
            placeholder="Contoh: 081234567890"
            className="form-control"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={isLoading}
          />
          <span className="form-help">
            Nomor aktif untuk konfirmasi pengiriman paket dari kurir ekspedisi.
          </span>
        </div>
      </div>

      {/* Section 2: Destination City via CekOngkir External Service */}
      <div className="checkout-form__section">
        <h3 className="checkout-form__section-title">
          <span className="checkout-form__step-number">2</span> Tujuan &amp; Ongkos Kirim (via CekOngkir)
        </h3>

        <div className="form-group">
          <label htmlFor="cityId" className="form-label">
            Kota / Kabupaten Tujuan <span className="text-danger">*</span>
          </label>
          <select
            id="cityId"
            name="cityId"
            required
            className="form-control form-select"
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
            disabled={isLoading}
          >
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}, {city.province} — {formatPrice(city.shippingFee)} ({city.courier})
              </option>
            ))}
          </select>
          <span className="form-help">
            Tarif ongkos kirim disinkronisasi secara real-time dari layanan eksternal <strong>CekOngkir</strong>.
          </span>
        </div>

        {selectedCity && (
          <div className="shipping-estimate-box">
            <div className="shipping-estimate-box__icon">🚚</div>
            <div className="shipping-estimate-box__content">
              <div className="shipping-estimate-box__title">
                {selectedCity.courier} &bull; Estimasi {selectedCity.estimatedDays}
              </div>
              <div className="shipping-estimate-box__subtitle">
                Tujuan: {selectedCity.name}, {selectedCity.province}
              </div>
            </div>
            <div className="shipping-estimate-box__price">
              {formatPrice(selectedCity.shippingFee)}
            </div>
          </div>
        )}

        <div className="form-group" style={{ marginTop: '16px' }}>
          <label htmlFor="address" className="form-label">
            Alamat Lengkap Pengiriman <span className="text-danger">*</span>
          </label>
          <textarea
            id="address"
            name="address"
            required
            rows={3}
            placeholder="Jalan, nomor rumah, RT/RW, kelurahan, kecamatan, dan patokan..."
            className="form-control"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Section 3: Payment Summary & Action */}
      <div className="checkout-form__summary">
        <div className="checkout-breakdown">
          <div className="checkout-breakdown__row">
            <span>Harga Perangkat ({product.name})</span>
            <span>{formatPrice(product.price)}</span>
          </div>
          <div className="checkout-breakdown__row">
            <span>Ongkos Kirim ({selectedCity?.name || 'Kota Tujuan'})</span>
            <span>{formatPrice(currentShippingFee)}</span>
          </div>
          <div className="checkout-breakdown__row checkout-breakdown__row--grand">
            <span>Total Pembayaran</span>
            <span className="checkout-breakdown__grand-price">{formatPrice(grandTotal)}</span>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block btn-lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="checkout-form__loading-indicator">
              <span className="spinner" aria-hidden="true"></span>
              Memproses Pesanan...
            </span>
          ) : (
            `Konfirmasi & Buat Pesanan (${formatPrice(grandTotal)})`
          )}
        </button>

        <p className="checkout-form__disclaimer">
          🔒 Dengan menekan tombol konfirmasi, data pesanan akan diproses sesuai standar Clean Architecture.
        </p>
      </div>
    </form>
  )
}
