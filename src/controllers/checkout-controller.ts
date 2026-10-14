'use server'

/**
 * CONTROLLERS LAYER — Checkout Controller (Server Action Adapter)
 *
 * Receives checkout requests from the Presentation Layer, delegates execution
 * to the `checkoutUseCase` interactor, and maps domain results or errors back to the caller.
 */

import { createProductRepository, createShippingService, createOrderRepository } from '@/infrastructure/registry'
import { checkoutUseCase, CheckoutInput } from '@/use-cases/checkout'
import { Order } from '@/domain/order'

export interface CheckoutResult {
  success: boolean
  order?: Order
  error?: string
}

export async function submitCheckoutController(input: CheckoutInput): Promise<CheckoutResult> {
  try {
    const productRepo = createProductRepository()
    const shippingService = createShippingService()
    const orderRepo = createOrderRepository()

    const order = await checkoutUseCase(productRepo, shippingService, orderRepo, input)
    return { success: true, order }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat memproses pesanan.'
    return { success: false, error: message }
  }
}

export async function getOrderByIdController(orderId: string): Promise<Order | null> {
  const orderRepo = createOrderRepository()
  return orderRepo.getOrderById(orderId)
}
