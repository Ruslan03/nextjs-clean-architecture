/**
 * DOMAIN LAYER — Shipping & Logistics Domain
 * Pure TypeScript — No framework dependencies.
 */

export interface DestinationCity {
  id: string
  name: string
  province: string
  shippingFee: number
  estimatedDays: string
  courier: string
}
