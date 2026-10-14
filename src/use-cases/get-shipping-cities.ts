/**
 * USE CASES LAYER — Get Shipping Cities Interactor
 *
 * Retrieves the available destination cities along with their shipping fees.
 */

import { DestinationCity } from '@/domain/shipping'
import { ShippingService } from './interfaces/shipping-service'

export async function getShippingCities(
  shippingService: ShippingService
): Promise<DestinationCity[]> {
  return shippingService.getCities()
}
