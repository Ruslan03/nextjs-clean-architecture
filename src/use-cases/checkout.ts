/**
 * USE CASES LAYER — Checkout Interactor
 *
 * Orchestrates the product checkout business flow:
 * 1. Validates customer information and phone number.
 * 2. Verifies the product exists via ProductRepository port.
 * 3. Verifies the destination city and gets shipping fee via ShippingService port.
 * 4. Applies domain pricing rules (calculateOrderTotal).
 * 5. Persists the order via OrderRepository port.
 */

import { Order, calculateOrderTotal, isValidPhoneNumber } from '@/domain/order'
import { ProductRepository } from './interfaces/product-repository'
import { ShippingService } from './interfaces/shipping-service'
import { OrderRepository } from './interfaces/order-repository'

export interface CheckoutInput {
  productId: string
  customerName: string
  phoneNumber: string
  cityId: string
  address: string
}

export async function checkoutUseCase(
  productRepo: ProductRepository,
  shippingService: ShippingService,
  orderRepo: OrderRepository,
  input: CheckoutInput
): Promise<Order> {
  const { productId, customerName, phoneNumber, cityId, address } = input

  // 1. Validation
  if (!customerName || customerName.trim().length < 3) {
    throw new Error('Nama lengkap minimal 3 karakter.')
  }

  if (!phoneNumber || !isValidPhoneNumber(phoneNumber)) {
    throw new Error('Nomor telepon tidak valid. Gunakan format nomor seluler Indonesia (contoh: 08123456789).')
  }

  if (!cityId) {
    throw new Error('Silakan pilih kota pengiriman.')
  }

  if (!address || address.trim().length < 10) {
    throw new Error('Alamat pengiriman minimal 10 karakter.')
  }

  // 2. Fetch Product
  const product = await productRepo.getProductById(productId)
  if (!product) {
    throw new Error(`Produk dengan ID "${productId}" tidak ditemukan.`)
  }

  // 3. Fetch Shipping City
  const city = await shippingService.getCityById(cityId)
  if (!city) {
    throw new Error(`Kota tujuan pengiriman dengan ID "${cityId}" tidak valid.`)
  }

  // 4. Calculate Total using Domain Business Rule
  const totalAmount = calculateOrderTotal(product.price, city.shippingFee)

  // 5. Construct Order Entity
  const newOrder: Order = {
    id: `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    productId: product.id,
    productName: product.name,
    productPrice: product.price,
    customerName: customerName.trim(),
    phoneNumber: phoneNumber.trim(),
    cityId: city.id,
    cityName: `${city.name}, ${city.province}`,
    address: address.trim(),
    shippingFee: city.shippingFee,
    totalAmount,
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
  }

  // 6. Save via Order Repository
  return orderRepo.createOrder(newOrder)
}
