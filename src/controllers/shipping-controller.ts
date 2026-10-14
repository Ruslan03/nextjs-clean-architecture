/**
 * CONTROLLERS LAYER — Shipping Controller (Interface Adapter)
 *
 * Coordinates shipping queries between the presentation layer and the shipping use cases.
 */

import { createShippingService } from '@/infrastructure/registry'
import { getShippingCities } from '@/use-cases/get-shipping-cities'
import { DestinationCity } from '@/domain/shipping'

export async function getShippingCitiesController(): Promise<DestinationCity[]> {
  const shippingService = createShippingService()
  return getShippingCities(shippingService)
}
