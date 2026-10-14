import { NextResponse } from 'next/server'

/**
 * BACKEND API ROUTE — /api/products
 *
 * Bertindak sebagai simulasi REST API backend eksternal (Infrastruktur Luar).
 * Mengembalikan data mentah produk seluler/modem dengan format DTO backend.
 */

const PRODUCTS_DATABASE = [
  {
    productName: 'Orbit Star H3',
    price: 455000,
    image: 'https://s3.myorbit.id/ms/device/1740983528537471402-DeviceImage[0].ImageDesktop.jpg',
  },
  {
    productName: 'Orbit N3',
    price: 399000,
    image: 'https://s3.myorbit.id/ms/device/1781512346245632065-DeviceImage[0].ImageDesktop.jpg',
  },
]

export async function GET() {
  return NextResponse.json({
    status: true,
    code: 200,
    data: PRODUCTS_DATABASE,
  })
}
