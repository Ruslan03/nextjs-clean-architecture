import { NextResponse } from 'next/server'

/**
 * BACKEND API ROUTE — /api/products
 *
 * Acts as an external backend REST API simulation (Outer Infrastructure).
 * Returns raw cellular/modem product data in backend DTO format.
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
