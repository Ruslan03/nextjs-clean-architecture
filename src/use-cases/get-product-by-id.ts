/**
 * USE CASES LAYER — Get Product By ID Interactor
 *
 * Orchestrates retrieving a single product by its identifier.
 */

import { Product } from '@/domain/product'
import { ProductRepository } from './interfaces/product-repository'

export async function getProductById(
  repo: ProductRepository,
  id: string
): Promise<Product | null> {
  return repo.getProductById(id)
}
