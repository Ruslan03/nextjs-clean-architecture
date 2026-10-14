# Clean Architecture Fundamentals (Studi Kasus: Product Listing & Checkout)

Proyek ini adalah implementasi **Pure Clean Architecture (Layer-First)** di Next.js tanpa FDD (*Feature-Driven Development*) dan tanpa kompleksitas Atomic Design, khusus untuk studi kasus **Product Listing, Detail, dan Checkout Pemesanan**.

Infrastruktur API disediakan menggunakan **Next.js Route Handlers (`src/app/api/...`)** yang diperlakukan sepenuhnya sebagai **simulasi REST backend dan 3rd-party logistics service eksternal ("CekOngkir")**.

---

## 🏛️ Struktur Lapisan Arsitektur (Pure Clean Architecture)

```
src/
├── domain/                                    # Enterprise Business Rules & Entities
│   ├── product.ts                             # Entity Product & helper formatting harga
│   ├── shipping.ts                            # Entity DestinationCity
│   └── order.ts                               # Entity Order, validasi no. telp & kalkulasi total
│
├── use-cases/                                 # Application Business Rules
│   ├── interfaces/                            # Kontrak / Abstraksi Interface (Ports)
│   │   ├── product-repository.ts              # Interface Kontrak: ProductRepository
│   │   ├── order-repository.ts                # Interface Kontrak: OrderRepository
│   │   └── shipping-service.ts                # Interface Kontrak: ShippingService
│   ├── get-products.ts                        # Interactor: Ambil daftar produk
│   ├── get-product-by-id.ts                   # Interactor: Ambil single produk via ID
│   ├── get-shipping-cities.ts                 # Interactor: Ambil daftar kota & tarif ekspedisi
│   └── checkout.ts                            # Interactor: Orkestrasi validasi & pembuatan pesanan
│
├── infrastructure/                            # Frameworks & Drivers (External Interfaces)
│   ├── api/                                   # Infrastruktur Backend Internal (Product & Order)
│   │   ├── api-client.ts                      # Centralized API fetch, error normalization & timeout
│   │   └── repositories/
│   │       ├── api-product-repository.ts      # Adapter API + Product DTO & Mapper (ACL)
│   │       └── api-order-repository.ts        # Adapter API + Order DTO & Mapper (ACL)
│   ├── shipping/                              # Third-Party External Logistics Service ("CekOngkir")
│   │   └── cekongkir-shipping-service.ts      # Adapter CekOngkir + DTO & Mapper (ACL)
│   └── registry.ts                            # Composition Root (Dependency Injection)
│
├── controllers/                               # Interface Adapters
│   ├── product-controller.ts                  # Controller query produk
│   ├── shipping-controller.ts                 # Controller query kota & tarif ekspedisi
│   └── checkout-controller.ts                 # Server Action & Controller untuk submit checkout
│
├── presentation/                              # Presentation Layer
│   ├── store/                                 # Redux Toolkit Client State Management
│   │   ├── visitor-slice.ts                   # Slice: Nama, Alamat, Kota, & Modal Status
│   │   ├── index.ts                           # Store Config & Typed Hooks (useAppDispatch, useAppSelector)
│   │   └── provider.tsx                       # Client StoreProvider + LocalStorage Persistence Sync
│   ├── pages/                                 # Page Views (Halaman)
│   │   ├── products-page.tsx                  # Halaman katalog produk
│   │   ├── product-detail-page.tsx            # Halaman detail spesifikasi produk
│   │   └── checkout-page.tsx                  # Halaman form checkout & ringkasan produk
│   └── components/                            # Reusable Components (Bukan Atomic)
│       ├── navbar.tsx                         # Header navigasi (Terhubung ke Redux Store)
│       ├── footer.tsx                         # Footer
│       ├── product-card.tsx                   # Kartu produk Orbit
│       ├── product-grid.tsx                   # Grid responsif daftar produk
│       ├── visitor-modal.tsx                  # Modal dialog input nama & alamat pengunjung pertama
│       └── checkout-form.tsx                  # Form interaktif checkout + auto-prefill dari Redux
│
└── app/                                       # Framework Delivery (Next.js App Router)
    ├── api/                                   # Backend & 3rd-Party Simulation
    │   ├── products/
    │   │   ├── route.ts                       # GET /api/products (Mock Backend)
    │   │   └── [id]/route.ts                  # GET /api/products/[id] (Mock Backend)
    │   └── cekongkir/
    │       └── cities/route.ts                # GET /api/cekongkir/cities (Mock External CekOngkir API)
    ├── products/
    │   └── [id]/
    │       ├── page.tsx                       # Route detail dengan generateMetadata
    │       └── checkout/
    │           └── page.tsx                   # Route checkout dengan dynamic metadata
    ├── globals.css                            # Styling sistem desain Telkomsel Orbit & Modal
    ├── layout.tsx                             # Shell layout induk (Dibalut StoreProvider & VisitorModal)
    └── page.tsx                               # Entry route katalog utama
```

---

## 📦 Treatment DTO & Anti-Corruption Layer (CekOngkir)

Layanan **CekOngkir** disimulasikan sebagai pihak ketiga (3rd party) yang memiliki format data sendiri (*snake_case*, RajaOngkir-style):

```json
{
  "rajaongkir_status": { "code": 200, "description": "OK" },
  "origin_details": { "city_name": "Jakarta Pusat", "province": "DKI Jakarta" },
  "destination_results": [
    {
      "city_id": "JKT-01",
      "nama_kota": "Jakarta Pusat",
      "provinsi": "DKI Jakarta",
      "tarif_pengiriman": 15000,
      "estimasi_hari": "1-2 hari",
      "kurir": "JNE Regular"
    }
  ]
}
```

Di dalam lapisan infrastruktur ([`src/infrastructure/shipping/cekongkir-shipping-service.ts`](file:///home/ruslan/workspace/experiments/clean-architecture/clean-architecture-fundamentals/src/infrastructure/shipping/cekongkir-shipping-service.ts)), kita menerapkan pola **DTO (Data Transfer Object)** dan **Mapper (Anti-Corruption Layer)**:

```typescript
// DTO Eksternal:
export interface CekOngkirDestinationDto {
  city_id: string
  nama_kota: string
  provinsi: string
  tarif_pengiriman: number
  estimasi_hari: string
  kurir: string
}

// Mapper ke Domain Entity:
export class ShippingMapper {
  static toDomain(dto: CekOngkirDestinationDto): DestinationCity {
    return {
      id: dto.city_id,
      name: dto.nama_kota,
      province: dto.provinsi,
      shippingFee: dto.tarif_pengiriman,
      estimatedDays: dto.estimasi_hari,
      courier: dto.kurir,
    }
  }
}
```

Dengan pola ini:
- **Domain Layer & Use Cases** tetap 100% bersih dan independen dari skema vendor pihak ketiga mana pun.
- Apabila vendor logistik di masa mendatang berganti (misal ke SiCepat, J&T, atau DHL), kita hanya perlu membuat adapter infrastruktur baru tanpa mengubah logika bisnis *Checkout*.

---

## 🔄 Arah Ketergantungan (The Dependency Rule)

```
Next.js App Router (UI / Server Action / generateMetadata)
        │
        ▼
   Controllers (checkout-controller.ts / shipping-controller.ts)
        │
        ▼
    Use Cases (checkout.ts / get-shipping-cities.ts)
        │
        ├──▶ ShippingService Port ──[implements]──▶ CekOngkirShippingService ──▶ /api/cekongkir/cities (Vendor 3rd-Party)
        ├──▶ ProductRepository Port ─[implements]──▶ ApiProductRepository ──▶ /api/products (Backend)
        └──▶ OrderRepository Port ────[implements]──▶ ApiOrderRepository ──▶ /api/orders (Backend)
```

---

## 🚀 Cara Menjalankan

Project sudah **100% self-contained**:

```bash
cd /home/ruslan/workspace/experiments/clean-architecture/clean-architecture-fundamentals
pnpm dev
```

Buka di browser:
- Halaman Katalog: [http://localhost:3000](http://localhost:3000)
- Halaman Detail: [http://localhost:3000/products/orbit-star-h3](http://localhost:3000/products/orbit-star-h3)
- Halaman Checkout: [http://localhost:3000/products/orbit-star-h3/checkout](http://localhost:3000/products/orbit-star-h3/checkout)
- API External CekOngkir: [http://localhost:3000/api/cekongkir/cities](http://localhost:3000/api/cekongkir/cities)

---

## 🧪 Pengujian Bisnis (The Testability Claim)

Clean Architecture menjamin:
> *"The business rules can be tested without the UI, Database, Web Server, or any other external element."*

Jalankan test suite murni via **Vitest**:

```bash
pnpm test
```

- [`tests/use-cases/get-products.test.ts`](file:///home/ruslan/workspace/experiments/clean-architecture/clean-architecture-fundamentals/tests/use-cases/get-products.test.ts): Menguji interactor use case `getProducts` dan `getProductById` menggunakan test double `FakeProductRepository` secara murni di memori tanpa HTTP fetch, tanpa server Next.js, dan tanpa DOM/React.
- [`tests/domain/product.test.ts`](file:///home/ruslan/workspace/experiments/clean-architecture/clean-architecture-fundamentals/tests/domain/product.test.ts): Menguji aturan bisnis entity `Product` dan fungsi formatting harga `formatPrice`.
- [`tests/presentation/product-listing-ui.test.tsx`](file:///home/ruslan/workspace/experiments/clean-architecture/clean-architecture-fundamentals/tests/presentation/product-listing-ui.test.tsx): Menguji komponen layer presentasi (`ProductCard`, `ProductGrid`, dan `ProductsPage` Server Component) dengan simulasi state sukses dan kegagalan controller via `@testing-library/react`.
- [`tests/presentation/visitor-redux-flow.test.tsx`](file:///home/ruslan/workspace/experiments/clean-architecture/clean-architecture-fundamentals/tests/presentation/visitor-redux-flow.test.tsx): Menguji reducer `visitorSlice`, sinkronisasi profil visitor, integrasi badge `Navbar`, form `VisitorModal`, dan auto-prefill nama & alamat pada `CheckoutForm`.

---

## 🏬 Redux Store di Layer Presentation

Sesuai kaidah Clean Architecture:
1. **Domain & Use Cases tidak boleh bergantung pada UI State**:
   - `domain/` dan `use-cases/` tetap murni TypeScript, tidak mengimpor `@reduxjs/toolkit` maupun `react-redux`.
2. **Redux diletakkan eksklusif di Presentation Layer (`src/presentation/store/`)**:
   - Berfungsi untuk mengelola state sesi visitor (nama, kota domisili, alamat pengiriman, modal onboarding).
   - Menggunakan `localStorage` (`orbit_visitor_profile`) untuk persistensi client-side agar data tidak hilang ketika halaman di-refresh.
   - Menyediakan auto-prefill ke komponen form interaktif (`CheckoutForm`) dan menampilkan profil aktif pada `Navbar`.


