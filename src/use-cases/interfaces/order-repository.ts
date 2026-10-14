/**
 * USE CASES LAYER — Order Repository Port (Contract)
 *
 * Defines the contract for persisting and retrieving orders.
 */

import { Order } from '@/domain/order'

export interface OrderRepository {
  createOrder(order: Order): Promise<Order>
  getOrderById(id: string): Promise<Order | null>
}
