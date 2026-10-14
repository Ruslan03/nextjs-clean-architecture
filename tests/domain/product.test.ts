import { describe, it, expect } from 'vitest'
import { formatPrice } from '@/domain/product'

/**
 * DOMAIN LAYER UNIT TEST — Pure Business Rules
 *
 * Tests pure business rules with zero external dependencies.
 */

describe('Domain: Product Business Rules', () => {
  it('harus memformat angka harga menjadi format mata uang Rupiah Indonesia (IDR)', () => {
    const formatted = formatPrice(455000)
    // IDR formatting produces 'Rp 455.000' (with non-breaking space)
    expect(formatted.replace(/\s+/g, ' ')).toMatch(/Rp\s?455\.000/)
  })

  it('harus memformat harga 0 dengan benar', () => {
    const formatted = formatPrice(0)
    expect(formatted.replace(/\s+/g, ' ')).toMatch(/Rp\s?0/)
  })

  it('harus memformat angka jutaan dengan pemisah ribuan yang tepat', () => {
    const formatted = formatPrice(1250000)
    expect(formatted.replace(/\s+/g, ' ')).toMatch(/Rp\s?1\.250\.000/)
  })
})
