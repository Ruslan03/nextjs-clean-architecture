/**
 * DOMAIN LAYER — Order & Checkout Domain
 * Pure TypeScript — Business rules for ordering and total calculation.
 */

export interface Order {
  id: string
  productId: string
  productName: string
  productPrice: number
  customerName: string
  phoneNumber: string
  cityId: string
  cityName: string
  address: string
  shippingFee: number
  totalAmount: number
  status: 'PENDING' | 'CONFIRMED'
  createdAt: string
}

export interface CreateOrderParams {
  productId: string
  productName: string
  productPrice: number
  customerName: string
  phoneNumber: string
  cityId: string
  cityName: string
  address: string
  shippingFee: number
}

/**
 * Business Rule: Calculate Total Order Amount (Product Price + Shipping Fee)
 */
export function calculateOrderTotal(productPrice: number, shippingFee: number): number {
  return productPrice + shippingFee
}

/**
 * Domain Validation: Indonesian phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/[\s-]/g, '')
  return /^(08|\+628)[0-9]{8,11}$/.test(cleaned)
}
