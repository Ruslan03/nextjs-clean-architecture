# Clean Architecture Fundamentals (Case Study: Product Listing & Checkout)

This project is an implementation of **Pure Clean Architecture (Layer-First)** in Next.js without FDD (*Feature-Driven Development*) and without unnecessary Atomic Design complexity, specifically designed for a **Product Listing, Detail, and Checkout Flow** case study.

The API infrastructure is simulated using **Next.js Route Handlers (`src/app/api/...`)**, which are treated strictly as an **external REST backend and an external 3rd-party logistics service ("CekOngkir")**.

---

## 🏛️ Architecture Layer Structure (Pure Clean Architecture)

```
src/
├── domain/                                    # Enterprise Business Rules & Entities
│   ├── product.ts                             # Product entity & currency formatting helper
│   ├── shipping.ts                            # DestinationCity entity
│   └── order.ts                               # Order entity, phone number validation & total calculation
│
├── use-cases/                                 # Application Business Rules
│   ├── interfaces/                            # Port Interfaces / Abstraction Contracts
│   │   ├── product-repository.ts              # Port Interface: ProductRepository
│   │   ├── order-repository.ts                # Port Interface: OrderRepository
│   │   └── shipping-service.ts                # Port Interface: ShippingService
│   ├── get-products.ts                        # Interactor: Retrieve product listing
│   ├── get-product-by-id.ts                   # Interactor: Retrieve single product by ID
│   ├── get-shipping-cities.ts                 # Interactor: Retrieve destination cities & shipping rates
│   └── checkout.ts                            # Interactor: Orchestrate validation & order creation
│
├── infrastructure/                            # Frameworks & Drivers (External Interfaces)
│   ├── api/                                   # Internal Backend Infrastructure (Product & Order)
│   │   ├── api-client.ts                      # Centralized API fetch, error normalization & timeout
│   │   └── repositories/
│   │       ├── api-product-repository.ts      # API Adapter + Product DTO & Mapper (ACL)
│   │       └── api-order-repository.ts        # API Adapter + Order DTO & Mapper (ACL)
│   ├── shipping/                              # Third-Party External Logistics Service ("CekOngkir")
│   │   └── cekongkir-shipping-service.ts      # CekOngkir Adapter + DTO & Mapper (ACL)
│   └── registry.ts                            # Composition Root (Dependency Injection)
│
├── controllers/                               # Interface Adapters
│   ├── product-controller.ts                  # Product query controller
│   ├── shipping-controller.ts                 # Shipping cities & rates query controller
│   └── checkout-controller.ts                 # Server Action & Controller for checkout submission
│
├── presentation/                              # Presentation Layer
│   ├── store/                                 # Redux Toolkit Client State Management
│   │   ├── visitor-slice.ts                   # Slice: Name, Address, City & Modal Status
│   │   ├── product-slice.ts                   # Slice: Product list pagination state
│   │   ├── index.ts                           # Store Config & Typed Hooks (useAppDispatch, useAppSelector)
│   │   └── provider.tsx                       # Client StoreProvider + LocalStorage Persistence Sync
│   ├── pages/                                 # Page Views
│   │   ├── products-page.tsx                  # Product catalog page
│   │   ├── product-detail-page.tsx            # Product specification detail page
│   │   └── checkout-page.tsx                  # Checkout form & order summary page
│   └── components/                            # Reusable Components (Non-atomic)
│       ├── navbar.tsx                         # Header navigation (Connected to Redux Store)
│       ├── footer.tsx                         # Footer
│       ├── product-card.tsx                   # Product card component
│       ├── product-grid.tsx                   # Responsive product grid
│       ├── visitor-modal.tsx                  # First-time visitor onboarding modal dialog
│       └── checkout-form.tsx                  # Interactive checkout form + auto-prefill from Redux
│
└── app/                                       # Framework Delivery (Next.js App Router)
    ├── api/                                   # External Backend & 3rd-Party Simulation
    │   ├── products/
    │   │   ├── route.ts                       # GET /api/products (Mock Backend)
    │   │   └── [id]/route.ts                  # GET /api/products/[id] (Mock Backend)
    │   ├── cekongkir/
    │   │   └── cities/route.ts                # GET /api/cekongkir/cities (Mock External CekOngkir API)
    │   └── orders/
    │       ├── route.ts                       # POST & GET /api/orders (Mock Backend Order Service)
    │       └── [id]/route.ts                  # GET /api/orders/[id] (Mock Backend)
    ├── products/
    │   └── [id]/
    │       ├── page.tsx                       # Product detail route with generateMetadata
    │       └── checkout/
    │           └── page.tsx                   # Checkout route with dynamic metadata
    ├── globals.css                            # Telkomsel Orbit design system & modal styling
    ├── layout.tsx                             # Root layout shell (Wrapped in StoreProvider & VisitorModal)
    └── page.tsx                               # Main catalog entry route
```

---

## 📦 DTO & Anti-Corruption Layer Pattern (CekOngkir)

The **CekOngkir** service is simulated as an external third party with its own custom schema (*snake_case*, RajaOngkir-style):

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

Inside the infrastructure layer ([`src/infrastructure/shipping/cekongkir-shipping-service.ts`](file:///home/ruslan/workspace/experiments/clean-architecture/clean-architecture-fundamentals/src/infrastructure/shipping/cekongkir-shipping-service.ts)), we implement the **DTO (Data Transfer Object)** and **Mapper (Anti-Corruption Layer)** patterns:

```typescript
// External DTO Schema:
export interface CekOngkirDestinationDto {
  city_id: string
  nama_kota: string
  provinsi: string
  tarif_pengiriman: number
  estimasi_hari: string
  kurir: string
}

// Mapper to Domain Entity:
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

Benefits of this approach:
- **Domain Layer & Use Cases** remain 100% clean and independent of third-party vendor schemas.
- If the shipping provider changes in the future (e.g. SiCepat, J&T, or DHL), only a new infrastructure adapter is created without modifying the core *Checkout* business logic.

---

## 🔄 The Dependency Rule

Dependencies strictly point inwards toward the Domain:

```
Next.js App Router (UI / Server Action / generateMetadata)
        │
        ▼
   Controllers (checkout-controller.ts / shipping-controller.ts)
        │
        ▼
     Use Cases (checkout.ts / get-shipping-cities.ts)
        │
        ├──▶ ShippingService Port ──[implements]──▶ CekOngkirShippingService ──▶ /api/cekongkir/cities (3rd-Party Vendor)
        ├──▶ ProductRepository Port ─[implements]──▶ ApiProductRepository ──▶ /api/products (Backend)
        └──▶ OrderRepository Port ────[implements]──▶ ApiOrderRepository ──▶ /api/orders (Backend)
```

---

## 🚀 Getting Started

The project is **100% self-contained**:

```bash
cd clean-architecture-fundamentals
pnpm install
pnpm dev
```

Open in your browser:
- Catalog Page: [http://localhost:3000](http://localhost:3000)
- Product Detail Page: [http://localhost:3000/products/orbit-star-h3](http://localhost:3000/products/orbit-star-h3)
- Checkout Page: [http://localhost:3000/products/orbit-star-h3/checkout](http://localhost:3000/products/orbit-star-h3/checkout)
- External CekOngkir Mock API: [http://localhost:3000/api/cekongkir/cities](http://localhost:3000/api/cekongkir/cities)

---

## 🧪 Business Rules Testing (The Testability Claim)

Clean Architecture ensures:
> *"The business rules can be tested without the UI, Database, Web Server, or any other external element."*

Run the pure test suite via **Vitest**:

```bash
pnpm test
```

- [`tests/use-cases/get-products.test.ts`](file:///home/ruslan/workspace/experiments/clean-architecture/clean-architecture-fundamentals/tests/use-cases/get-products.test.ts): Tests `getProducts` and `getProductById` use case interactors using a pure in-memory `FakeProductRepository` test double without HTTP requests, Next.js server, or DOM/React rendering.
- [`tests/domain/product.test.ts`](file:///home/ruslan/workspace/experiments/clean-architecture/clean-architecture-fundamentals/tests/domain/product.test.ts): Tests pure domain business rules for the `Product` entity and the `formatPrice` currency formatting helper.
- [`tests/presentation/product-listing-ui.test.tsx`](file:///home/ruslan/workspace/experiments/clean-architecture/clean-architecture-fundamentals/tests/presentation/product-listing-ui.test.tsx): Tests presentation components (`ProductCard`, `ProductGrid`, and `ProductsPage` Server Component) simulating controller success and failure states via `@testing-library/react`.
- [`tests/presentation/visitor-redux-flow.test.tsx`](file:///home/ruslan/workspace/experiments/clean-architecture/clean-architecture-fundamentals/tests/presentation/visitor-redux-flow.test.tsx): Tests the `visitorSlice` reducer, visitor profile synchronization, `Navbar` badge integration, `VisitorModal` form, and auto-prefill for name and address in `CheckoutForm`.

---

## 🏬 Redux Store in the Presentation Layer

In accordance with Clean Architecture principles:
1. **Domain & Use Cases must never depend on UI State**:
   - `domain/` and `use-cases/` remain pure TypeScript, with no imports from `@reduxjs/toolkit` or `react-redux`.
2. **Redux is located exclusively in the Presentation Layer (`src/presentation/store/`)**:
   - Manages client-side visitor session state (name, city, delivery address, onboarding modal).
   - Uses `localStorage` (`orbit_visitor_profile`) for client-side persistence across page refreshes.
   - Provides seamless auto-prefill to interactive form components (`CheckoutForm`) and displays the active visitor profile in the `Navbar`.
