/**
 * CONTROLLERS LAYER (Interface Adapters)
 *
 * Serves as the entry adapter between presentation/delivery requests and use cases.
 * Instantiates dependencies via the Composition Root and invokes the appropriate use case.
 */

import { createProductRepository } from '@/infrastructure/registry'
import { getProducts } from '@/use-cases/get-products'
import { getProductById } from '@/use-cases/get-product-by-id'
import { Product } from '@/domain/product'

export async function getProductsController(): Promise<Product[]> {
  const repo = createProductRepository()
  return getProducts(repo)
}

export async function getProductByIdController(id: string): Promise<Product | null> {
  const repo = createProductRepository()
  return getProductById(repo, id)
}
