import type { Metadata } from 'next'
import { getProductByIdController } from '@/controllers/product-controller'
import { CheckoutPage } from '@/presentation/pages/checkout-page'

interface PageProps {
  params: Promise<{ id: string }>
}

/**
 * Dynamic Metadata Generation for Checkout Page
 * Calls Controller (Interface Adapter) directly to preserve Clean Architecture.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const product = await getProductByIdController(id)

  if (!product) {
    return {
      title: 'Checkout — Produk Tidak Ditemukan | Telkomsel Orbit',
      description: 'Halaman checkout produk tidak ditemukan.',
    }
  }

  return {
    title: `Checkout ${product.name} — Telkomsel Orbit`,
    description: `Selesaikan pembelian modem ${product.name} dengan estimasi ongkos kirim real-time via CekOngkir.`,
  }
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  return <CheckoutPage productId={id} />
}
