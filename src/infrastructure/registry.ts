/**
 * INFRASTRUCTURE LAYER — Composition Root (Dependency Injection Registry)
 *
 * Wires concrete infrastructure adapters with abstract port interfaces in the application layer.
 * Only the Presentation / Controller layer and Composition Root should import this file.
 */

import type { ProductRepository } from '@/use-cases/interfaces/product-repository'
import type { ShippingService } from '@/use-cases/interfaces/shipping-service'
import type { OrderRepository } from '@/use-cases/interfaces/order-repository'
import { ApiProductRepository } from './api/repositories/api-product-repository'
import { ApiOrderRepository } from './api/repositories/api-order-repository'
import { CekOngkirShippingService } from './shipping/cekongkir-shipping-service'

export function createProductRepository(): ProductRepository {
  return new ApiProductRepository()
}

export function createShippingService(): ShippingService {
  return new CekOngkirShippingService()
}

export function createOrderRepository(): OrderRepository {
  return new ApiOrderRepository()
}
