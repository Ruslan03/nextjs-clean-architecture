import { NextRequest, NextResponse } from 'next/server'

/**
 * BACKEND API ROUTE — /api/products/[id]
 *
 * Acts as an external backend REST API simulation (Outer Infrastructure).
 * Returns a single product by identifier or 404 if not found.
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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const normalizedId = id.toLowerCase()

  const product = PRODUCTS_DATABASE.find((item) => {
    const slug = item.productName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    return slug === normalizedId
  })

  if (!product) {
    return NextResponse.json(
      {
        status: false,
        code: 404,
        message: 'Product not found',
      },
      { status: 404 }
    )
  }

  return NextResponse.json({
    status: true,
    code: 200,
    data: product,
  })
}
