import { NextResponse } from 'next/server'

interface ServerOrderRecord {
  orderId: string
  productId: string
  productName: string
  productPrice: number
  customerName: string
  phoneNumber: string
  cityId: string
  cityName: string
  shippingAddress: string
  shippingFee: number
  totalAmount: number
  orderStatus: 'PENDING' | 'CONFIRMED'
  createdAt: string
}

declare global {
  // eslint-disable-next-line no-var
  var __mock_order_database: Map<string, ServerOrderRecord> | undefined
}

const orderDatabase =
  globalThis.__mock_order_database ??
  (globalThis.__mock_order_database = new Map<string, ServerOrderRecord>())

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params
  const order = orderDatabase.get(id)

  if (!order) {
    return NextResponse.json(
      {
        status: false,
        code: 404,
        message: `Pesanan dengan ID "${id}" tidak ditemukan.`,
      },
      { status: 404 }
    )
  }

  return NextResponse.json({
    status: true,
    code: 200,
    data: order,
  })
}
