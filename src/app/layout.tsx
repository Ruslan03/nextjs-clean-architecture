import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/presentation/components/navbar'
import { Footer } from '@/presentation/components/footer'
import { StoreProvider } from '@/presentation/store/provider'
import { VisitorModal } from '@/presentation/components/visitor-modal'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Telkomsel Orbit — Clean Architecture Fundamentals',
  description: 'Studi kasus Pure Clean Architecture di Next.js untuk integrasi Product Listing dengan backend HTTP localhost:8084.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="site-body">
        <StoreProvider>
          <Navbar />
          <main className="site-main">{children}</main>
          <Footer />
          <VisitorModal />
        </StoreProvider>
      </body>
    </html>
  )
}
