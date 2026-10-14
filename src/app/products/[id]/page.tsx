import type { Metadata } from 'next'
import { getProductByIdController } from '@/controllers/product-controller'
import { ProductDetailPage } from '@/presentation/pages/product-detail-page'

interface PageProps {
  params: Promise<{ id: string }>
}

/**
 * Dynamic Metadata Generation via Controller (Interface Adapter)
 *
 * App Router (Framework Layer) calls Controller to fetch domain data,
 * keeping the route thin and preserving Clean Architecture dependency rules.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const product = await getProductByIdController(id)

  if (!product) {
    return {
      title: 'Produk Tidak Ditemukan | Telkomsel Orbit',
      description: 'Halaman produk modem Telkomsel Orbit tidak ditemukan.',
    }
  }

  return {
    title: `${product.name} — Telkomsel Orbit`,
    description:
      product.description ||
      `Beli modem ${product.name} dengan harga resmi terbaik dan kuota internet rumah melimpah.`,
    openGraph: {
      title: `${product.name} — Telkomsel Orbit`,
      description:
        product.description ||
        `Spesifikasi dan harga resmi modem ${product.name} dari Telkomsel Orbit.`,
      images: product.image ? [{ url: product.image }] : [],
    },
  }
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  return <ProductDetailPage productId={id} />
}
