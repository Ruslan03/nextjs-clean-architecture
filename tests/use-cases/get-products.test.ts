import { describe, it, expect, vi } from 'vitest'
import { getProducts } from '@/use-cases/get-products'
import { getProductById } from '@/use-cases/get-product-by-id'
import { Product } from '@/domain/product'
import { ProductRepository } from '@/use-cases/interfaces/product-repository'

/**
 * CLEAN ARCHITECTURE TEST SUITE — Product Listing Flow
 *
 * Tests the Clean Architecture claim:
 * "The business rules can be tested without the UI, Database, Web Server,
 *  or any other external element."
 *
 * This Use Case test runs 100% purely in memory without:
 * 1. Next.js Web Server / HTTP Network.
 * 2. Real Database.
 * 3. Browser / UI rendering.
 */

describe('Use Case: Get Products (Product Listing Flow)', () => {
  // Test Data Fixture
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

  // Test Double: In-Memory Fake Repository implementing ProductRepository Port Interface
  class FakeProductRepository implements ProductRepository {
    constructor(private items: Product[] = []) {}

    async getProducts(): Promise<Product[]> {
      return this.items
    }

    async getProductById(id: string): Promise<Product | null> {
      return this.items.find((item) => item.id === id) ?? null
    }
  }

  it('harus mengembalikan daftar produk dengan benar dari repository port', async () => {
    // 1. Arrange: Prepare fake repository without web server or DB
    const fakeRepo = new FakeProductRepository(dummyProducts)

    // 2. Act: Execute use case
    const result = await getProducts(fakeRepo)

    // 3. Assert: Verify business rules
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('orbit-star-h3')
    expect(result[0].name).toBe('Orbit Star H3')
    expect(result[0].price).toBe(455000)
    expect(result[1].id).toBe('orbit-max-h2')
  })

  it('harus mengembalikan array kosong jika katalog produk belum memiliki item', async () => {
    // 1. Arrange: Empty fake repository
    const emptyRepo = new FakeProductRepository([])

    // 2. Act: Execute use case
    const result = await getProducts(emptyRepo)

    // 3. Assert
    expect(result).toEqual([])
    expect(result).toHaveLength(0)
  })

  it('harus meneruskan error jika repository port mengalami kegagalan teknis', async () => {
    // 1. Arrange: Mock repository simulating failure
    const mockFailingRepo: ProductRepository = {
      getProducts: vi.fn().mockRejectedValue(new Error('Koneksi infrastruktur terputus')),
      getProductById: vi.fn(),
    }

    // 2. Act & Assert: Ensure the use case propagates unexpected errors
    await expect(getProducts(mockFailingRepo)).rejects.toThrow('Koneksi infrastruktur terputus')
    expect(mockFailingRepo.getProducts).toHaveBeenCalledTimes(1)
  })

  it('harus dapat mengambil detail produk berdasarkan ID tertentu via getProductById', async () => {
    // 1. Arrange
    const fakeRepo = new FakeProductRepository(dummyProducts)

    // 2. Act
    const product = await getProductById(fakeRepo, 'orbit-star-h3')

    // 3. Assert
    expect(product).not.toBeNull()
    expect(product?.name).toBe('Orbit Star H3')
    expect(product?.price).toBe(455000)
  })

  it('harus mengembalikan null jika ID produk tidak ditemukan di repository', async () => {
    // 1. Arrange
    const fakeRepo = new FakeProductRepository(dummyProducts)

    // 2. Act
    const product = await getProductById(fakeRepo, 'produk-tidak-ada')

    // 3. Assert
    expect(product).toBeNull()
  })
})
