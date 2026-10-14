/**
 * DOMAIN LAYER — Enterprise Business Rules & Models
 * Pure TypeScript — Zero dependencies on React, Next.js, or external frameworks.
 */

export interface Product {
  id: string
  name: string
  price: number
  image: string
  description?: string
  features?: string[]
}

/**
 * Formats numeric price into Indonesian Rupiah (IDR) currency format.
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}
