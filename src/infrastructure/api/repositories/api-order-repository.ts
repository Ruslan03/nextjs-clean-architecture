/**
 * INFRASTRUCTURE LAYER — API Order Repository Adapter
 *
 * Implements the OrderRepository port interface.
 * Connects to the external Order Management REST Service (/api/orders).
 *
 * Uses DTO and Mapper patterns (Anti-Corruption Layer) to isolate internal domain
 * models from external network contracts.
 */

import { Order } from '@/domain/order'
import { OrderRepository } from '@/use-cases/interfaces/order-repository'
import { apiClient } from '../api-client'

// ─── External Order DTO Schemas ──────────────────────────────────────────────

export interface ApiOrderDto {
  orderId: string
  productId: string
  productName: string
  productPrice: number
  customerName: string
  phoneNumber: string
  cityId: string
  cityName: string
  shippingAddress: string
  shippingFee: number
  totalAmount: number
  orderStatus: 'PENDING' | 'CONFIRMED'
  createdAt: string
}

export interface ApiCreateOrderResponse {
  status: boolean
  code: number
  message: string
  data: ApiOrderDto
}

export interface ApiGetOrderResponse {
  status: boolean
  code: number
  data: ApiOrderDto
}

// ─── Anti-Corruption Layer: Order Mapper ─────────────────────────────────────

export class OrderMapper {
  static toDomain(dto: ApiOrderDto): Order {
    return {
      id: dto.orderId,
      productId: dto.productId,
      productName: dto.productName,
      productPrice: dto.productPrice,
      customerName: dto.customerName,
      phoneNumber: dto.phoneNumber,
      cityId: dto.cityId,
      cityName: dto.cityName,
      address: dto.shippingAddress,
      shippingFee: dto.shippingFee,
      totalAmount: dto.totalAmount,
      status: dto.orderStatus,
      createdAt: dto.createdAt,
    }
  }

  static toDto(order: Order): ApiOrderDto {
    return {
      orderId: order.id,
      productId: order.productId,
      productName: order.productName,
      productPrice: order.productPrice,
      customerName: order.customerName,
      phoneNumber: order.phoneNumber,
      cityId: order.cityId,
      cityName: order.cityName,
      shippingAddress: order.address,
      shippingFee: order.shippingFee,
      totalAmount: order.totalAmount,
      orderStatus: order.status,
      createdAt: order.createdAt,
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
    // Outside request context (e.g. build time)
  }

  return 'http://localhost:3000'
}

// ─── Concrete Infrastructure Implementation ───────────────────────────────────

export class ApiOrderRepository implements OrderRepository {
  private customBaseUrl?: string

  constructor(customBaseUrl?: string) {
    this.customBaseUrl = customBaseUrl
  }

  async createOrder(order: Order): Promise<Order> {
    const baseUrl = await resolveBaseUrl(this.customBaseUrl)
    const url = `${baseUrl}/api/orders`
    const payload = OrderMapper.toDto(order)

    const response = await apiClient.post<ApiCreateOrderResponse>(url, payload)

    if (!response || !response.data) {
      throw new Error('Gagal menyimpan pesanan ke Order Service eksternal.')
    }

    return OrderMapper.toDomain(response.data)
  }

  async getOrderById(id: string): Promise<Order | null> {
    const baseUrl = await resolveBaseUrl(this.customBaseUrl)
    const url = `${baseUrl}/api/orders/${encodeURIComponent(id)}`

    try {
      const response = await apiClient.get<ApiGetOrderResponse>(url, {
        cache: 'no-store',
      })

      if (!response || !response.data) {
        return null
      }

      return OrderMapper.toDomain(response.data)
    } catch {
      return null
    }
  }
}
