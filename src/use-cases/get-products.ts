/**
 * USE CASES LAYER — Get Products Interactor
 *
 * Orchestrates the application logic for retrieving products.
 * Depends solely on the ProductRepository interface port and Product domain model.
 */

import { Product } from '@/domain/product'
import { ProductRepository } from './interfaces/product-repository'

export async function getProducts(
  repo: ProductRepository
): Promise<Product[]> {
  return repo.getProducts()
}
