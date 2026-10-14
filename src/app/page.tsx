import { ProductsPage } from '@/presentation/pages/products-page'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Katalog Produk Orbit | Clean Architecture Fundamentals',
  description: 'Studi kasus implementasi Clean Architecture murni di Next.js untuk product listing.',
}

export default function Home() {
  return <ProductsPage />
}
