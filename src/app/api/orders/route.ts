import { NextResponse } from 'next/server'

/**
 * EXTERNAL BACKEND SIMULATION — Order Management Service
 * Endpoint: /api/orders
 *
 * Simulates an external backend Order Service REST API.
 * Handles order persistence and retrieval independently from the main application.
 */

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

// Global server-side storage for the mock external service
declare global {
  // eslint-disable-next-line no-var
  var __mock_order_database: Map<string, ServerOrderRecord> | undefined
}

const orderDatabase =
  globalThis.__mock_order_database ??
  (globalThis.__mock_order_database = new Map<string, ServerOrderRecord>())

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ServerOrderRecord

    if (!body || !body.orderId || !body.customerName) {
      return NextResponse.json(
        {
          status: false,
          code: 400,
          message: 'Data pesanan tidak lengkap atau tidak valid.',
        },
        { status: 400 }
      )
    }

    orderDatabase.set(body.orderId, { ...body })

    return NextResponse.json(
      {
        status: true,
        code: 201,
        message: 'Pesanan berhasil dibuat di sistem Order Service.',
        data: body,
      },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      {
        status: false,
        code: 500,
        message: 'Terjadi kesalahan internal pada Order Service.',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  const allOrders = Array.from(orderDatabase.values())
  return NextResponse.json({
    status: true,
    code: 200,
    data: allOrders,
  })
}
