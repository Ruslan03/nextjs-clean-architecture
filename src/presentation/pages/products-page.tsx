import { getProductsController } from '@/controllers/product-controller'
import { Product } from '@/domain/product'
import { ProductGrid } from '../components/product-grid'

export async function ProductsPage() {
  let products: Product[] = []
  let error: string | null = null

  try {
    products = await getProductsController()
  } catch (err) {
    console.error('[ProductsPage] Gagal mengambil data produk:', err)
    error = 'Tidak dapat terhubung ke backend API di localhost:8084. Pastikan server backend sedang aktif.'
  }

  return (
    <div className="container section">
      <div className="page-header">
        <div className="page-header__badge">
          <span className="badge badge-primary">Katalog Resmi</span>
        </div>
        <h1 className="page-header__title">Pilihan Modem Telkomsel Orbit</h1>
        <p className="page-header__subtitle">
          Solusi internet rumah praktis tanpa kabel dengan koneksi 4G/5G andal di seluruh Indonesia.
        </p>
      </div>

      <div className="filter-info">
        <div className="filter-info__bar">
          <span className="filter-info__count">
            {products.length} perangkat tersedia
          </span>
        </div>
      </div>

      {error ? (
        <div className="alert alert-error" role="alert">
          <strong>Koneksi Gagal</strong>
          <p>{error}</p>
          <button>Refresh</button>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  )
}
