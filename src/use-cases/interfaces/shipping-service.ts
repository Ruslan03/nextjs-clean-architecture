/**
 * USE CASES LAYER — Shipping Service Port (Contract)
 *
 * Defines the abstraction for retrieving shipping and destination city data.
 * The application layer is unaware of the specific third-party provider ("CekOngkir").
 */

import { DestinationCity } from '@/domain/shipping'

export interface ShippingService {
  getCities(): Promise<DestinationCity[]>
  getCityById(id: string): Promise<DestinationCity | null>
}
