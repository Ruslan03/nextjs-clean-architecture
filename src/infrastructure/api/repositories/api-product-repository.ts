/**
 * INFRASTRUCTURE LAYER — API Product Repository Adapter
 *
 * Implements the ProductRepository port interface.
 * Treats the API (/api/products) as an external backend service.
 *
 * Uses DTO and Mapper patterns (Anti-Corruption Layer) to prevent external
 * backend schemas from leaking into domain entities.
 */

import { Product } from '@/domain/product'
import { ProductRepository } from '@/use-cases/interfaces/product-repository'
import { apiClient } from '../api-client'

// ─── External DTO Schemas ────────────────────────────────────────────────────

export interface ApiProductDto {
  productName: string
  price: number
  image: string
}

export interface ApiProductListResponse {
  status: boolean
  code: number
  data: ApiProductDto[]
}

export interface ApiSingleProductResponse {
  status: boolean
  code: number
  data: ApiProductDto
}

// ─── Anti-Corruption Layer: Mapper ───────────────────────────────────────────

export class ProductMapper {
  static toDomain(dto: ApiProductDto, index: number): Product {
    const slug = dto.productName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    return {
      id: slug || `product-${index + 1}`,
      name: dto.productName,
      price: dto.price,
      image: dto.image,
      description: `Modem nirkabel ${dto.productName} dari Telkomsel Orbit memberikan koneksi internet rumah berkecepatan tinggi dan stabil tanpa perlu instalasi kabel rumit. Cocok untuk kebutuhan kerja, streaming, dan seluruh anggota keluarga.`,
      features: [
        'Koneksi 4G / 5G berkecepatan tinggi',
        'Mendukung hingga 32 perangkat terhubung sekaligus',
        'Aktivasi instan dan mudah via aplikasi MyOrbit',
        'Garansi resmi Telkomsel 1 tahun',
      ],
    }
  }
}

// ─── Helper: Resolve API Base URL ────────────────────────────────────────────

async function resolveBaseUrl(configuredUrl?: string): Promise<string> {
  if (configuredUrl) return configuredUrl
  if (process.env.API_BASE_URL) return process.env.API_BASE_URL

  if (typeof window !== 'undefined') {
    return ''
  }

  try {
    const { headers } = await import('next/headers')
    const headerList = await headers()
    const host = headerList.get('host')
    const proto = headerList.get('x-forwarded-proto') || 'http'
    if (host) {
      return `${proto}://${host}`
    }
  } catch {
    // Outside request context (e.g. build time)
  }

  return 'http://localhost:3000'
}

// ─── Concrete Repository Implementation ──────────────────────────────────────

export class ApiProductRepository implements ProductRepository {
  private customBaseUrl?: string

  constructor(customBaseUrl?: string) {
    this.customBaseUrl = customBaseUrl
  }

  async getProducts(): Promise<Product[]> {
    const baseUrl = await resolveBaseUrl(this.customBaseUrl)
    const url = `${baseUrl}/api/products`

    const response = await apiClient.get<ApiProductListResponse>(url, {
      cache: 'no-store',
    })

    if (!response || !Array.isArray(response.data)) {
      return []
    }

    return response.data.map((item, index) => ProductMapper.toDomain(item, index))
  }

  async getProductById(id: string): Promise<Product | null> {
    const baseUrl = await resolveBaseUrl(this.customBaseUrl)
    const url = `${baseUrl}/api/products/${encodeURIComponent(id)}`

    try {
      const response = await apiClient.get<ApiSingleProductResponse>(url, {
        cache: 'no-store',
      })

      if (!response || !response.data) {
        return null
      }

      return ProductMapper.toDomain(response.data, 0)
    } catch {
      // Fallback: search in product list if single endpoint fails
      const products = await this.getProducts()
      return products.find((p) => p.id === id || p.id === id.toLowerCase()) ?? null
    }
  }
}
