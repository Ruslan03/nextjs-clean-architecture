/**
 * INFRASTRUCTURE LAYER — Third-Party Logistics Adapter ("CekOngkir")
 *
 * Implements the ShippingService port interface.
 * Connects to the external "CekOngkir" logistics service API (/api/cekongkir/cities).
 *
 * This adapter represents an external 3rd-party integration (vendor), separate from
 * our internal backend API services.
 *
 * Uses DTO (Data Transfer Object) and Mapper (Anti-Corruption Layer) to convert
 * third-party snake_case payloads into clean DestinationCity domain entities.
 */

import { DestinationCity } from '@/domain/shipping'
import { ShippingService } from '@/use-cases/interfaces/shipping-service'
import { apiClient } from '../api/api-client'

// ─── External 3rd-Party DTO Schemas ("CekOngkir") ─────────────────────────────

export interface CekOngkirDestinationDto {
  city_id: string
  nama_kota: string
  provinsi: string
  tarif_pengiriman: number
  estimasi_hari: string
  kurir: string
}

export interface CekOngkirApiResponse {
  rajaongkir_status: {
    code: number
    description: string
  }
  origin_details: {
    city_name: string
    province: string
  }
  destination_results: CekOngkirDestinationDto[]
}

// ─── Anti-Corruption Layer: Shipping Mapper ───────────────────────────────────

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

// ─── Base URL Resolution Helper ───────────────────────────────────────────────

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
    // Outside request context (e.g. build time or background task)
  }

  return 'http://localhost:3000'
}

// ─── Concrete Infrastructure Implementation ───────────────────────────────────

export class CekOngkirShippingService implements ShippingService {
  private customBaseUrl?: string

  constructor(customBaseUrl?: string) {
    this.customBaseUrl = customBaseUrl
  }

  async getCities(): Promise<DestinationCity[]> {
    const baseUrl = await resolveBaseUrl(this.customBaseUrl)
    const url = `${baseUrl}/api/cekongkir/cities`

    const response = await apiClient.get<CekOngkirApiResponse>(url, {
      cache: 'no-store',
    })

    if (!response || !Array.isArray(response.destination_results)) {
      return []
    }

    return response.destination_results.map(ShippingMapper.toDomain)
  }

  async getCityById(id: string): Promise<DestinationCity | null> {
    const cities = await this.getCities()
    return cities.find((city) => city.id === id) ?? null
  }
}

// Backward-compatible alias
export { CekOngkirShippingService as ApiShippingService }
