import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProductCard } from '@/presentation/components/product-card'
import { ProductGrid } from '@/presentation/components/product-grid'
import { ProductsPage } from '@/presentation/pages/products-page'
import { Product } from '@/domain/product'
import * as productController from '@/controllers/product-controller'

// Mock next/image & next/link for React testing environment
vi.mock('next/image', () => ({
  default: ({
    unoptimized: _unoptimized,
    priority: _priority,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { unoptimized?: boolean; priority?: boolean }) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    )
  },
}))

describe('Presentation Layer: Product Listing Flow UI Tests', () => {
  const dummyProducts: Product[] = [
    {
      id: 'orbit-star-h3',
      name: 'Orbit Star H3',
      price: 455000,
      image: 'https://example.com/orbit-star-h3.jpg',
      description: 'Modem 4G stabil',
      features: ['4G LTE', 'Hingga 32 perangkat'],
    },
    {
      id: 'orbit-max-h2',
      name: 'Orbit Max H2',
      price: 1250000,
      image: 'https://example.com/orbit-max-h2.jpg',
      description: 'Modem kecepatan tinggi',
      features: ['Cat 6', 'Hingga 64 perangkat'],
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ─── 1. Unit Test Component: ProductCard ───────────────────────────────────
  describe('Component: <ProductCard />', () => {
    it('harus merender nama produk, harga terformat rupiah, dan tombol detail', () => {
      render(<ProductCard product={dummyProducts[0]} />)

      // Nama produk
      expect(screen.getByText('Orbit Star H3')).toBeInTheDocument()

      // Harga terformat IDR
      expect(screen.getByText(/455\.000/)).toBeInTheDocument()

      // Link tombol navigasi ke halaman detail
      const link = screen.getByRole('link', { name: /Lihat Detail/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/products/orbit-star-h3')
    })
  })

  // ─── 2. Unit Test Component: ProductGrid ───────────────────────────────────
  describe('Component: <ProductGrid />', () => {
    it('harus merender seluruh kartu produk saat data tersedia', () => {
      render(<ProductGrid products={dummyProducts} />)

      expect(screen.getByText('Orbit Star H3')).toBeInTheDocument()
      expect(screen.getByText('Orbit Max H2')).toBeInTheDocument()
      expect(screen.getAllByRole('link', { name: /Lihat Detail/i })).toHaveLength(2)
    })

    it('harus merender tampilan kosong (empty state) saat daftar produk kosong', () => {
      render(<ProductGrid products={[]} />)

      expect(screen.getByText('Belum Ada Produk Tersedia')).toBeInTheDocument()
      expect(
        screen.getByText(/Silakan periksa koneksi backend API di/i)
      ).toBeInTheDocument()
    })
  })

  // ─── 3. Integration View Test: ProductsPage ────────────────────────────────
  describe('Page View: <ProductsPage />', () => {
    it('harus merender katalog lengkap beserta jumlah perangkat tersedia saat controller sukses', async () => {
      // Mock controller layer
      vi.spyOn(productController, 'getProductsController').mockResolvedValue(dummyProducts)

      // Render server component page
      const pageUi = await ProductsPage()
      render(pageUi)

      // Header halaman
      expect(screen.getByText('Pilihan Modem Telkomsel Orbit')).toBeInTheDocument()
      expect(screen.getByText('Katalog Resmi')).toBeInTheDocument()

      // Counter produk
      expect(screen.getByText('2 perangkat tersedia')).toBeInTheDocument()

      // Produk dalam grid
      expect(screen.getByText('Orbit Star H3')).toBeInTheDocument()
      expect(screen.getByText('Orbit Max H2')).toBeInTheDocument()
    })

    it('harus menampilkan pesan error saat controller gagal mengambil data', async () => {
      // Mock controller failure & suppress expected console error output
      vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.spyOn(productController, 'getProductsController').mockRejectedValue(
        new Error('Network connection failed')
      )

      const pageUi = await ProductsPage()
      render(pageUi)

      // Alert error
      expect(screen.getByText('Koneksi Gagal')).toBeInTheDocument()
      expect(
        screen.getByText(/Tidak dapat terhubung ke backend API di localhost:8084/i)
      ).toBeInTheDocument()
    })
  })
})
