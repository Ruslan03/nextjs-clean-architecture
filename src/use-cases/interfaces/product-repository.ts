/**
 * USE CASES LAYER — Product Repository Port (Contract)
 *
 * Defines the contract required by application business rules to access products.
 * Does NOT know how data is retrieved (HTTP, Database, Memory, etc.).
 */

import { Product } from '@/domain/product'

export interface ProductRepository {
  getProducts(): Promise<Product[]>
  getProductById(id: string): Promise<Product | null>
}
