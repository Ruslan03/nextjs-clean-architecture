import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import {
  visitorReducer,
  setVisitorProfile,
  openVisitorModal,
  closeVisitorModal,
  hydrateVisitor,
  VisitorProfile,
} from '@/presentation/store/visitor-slice'
import { Navbar } from '@/presentation/components/navbar'
import { VisitorModal } from '@/presentation/components/visitor-modal'
import { CheckoutForm } from '@/presentation/components/checkout-form'
import { Product } from '@/domain/product'

// Mock next/link & next/image
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}))

// Helper to create test store
function createTestStore(preloadedState?: Parameters<typeof configureStore>[0]['preloadedState']) {
  return configureStore({
    reducer: {
      visitor: visitorReducer,
    },
    preloadedState,
  })
}

describe('Presentation Layer: Redux Visitor Store & UI Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  // ─── 1. Reducer Unit Tests ──────────────────────────────────────────────────
  describe('Redux Slice: visitorSlice Reducer', () => {
    it('harus memiliki initial state yang belum terkonfigurasi dan modal tertutup', () => {
      const state = visitorReducer(undefined, { type: '@@INIT' })
      expect(state.profile.isConfigured).toBe(false)
      expect(state.profile.name).toBe('')
      expect(state.isHydrated).toBe(false)
      expect(state.isModalOpen).toBe(false)
    })

    it('harus otomatis membuka modal jika pengunjung pertama kali (hydrateVisitor dengan null)', () => {
      const state = visitorReducer(undefined, hydrateVisitor({ profile: null }))
      expect(state.isHydrated).toBe(true)
      expect(state.isModalOpen).toBe(true)
      expect(state.profile.isConfigured).toBe(false)
    })

    it('harus memuat data profil yang tersimpan tanpa membuka modal jika sudah pernah isi (hydrateVisitor dengan profil)', () => {
      const savedProfile: VisitorProfile = {
        name: 'Ahmad Dahlan',
        cityId: 'BDG-02',
        cityName: 'Bandung, Jawa Barat',
        address: 'Jl. Dago No. 12',
        isConfigured: true,
      }
      const state = visitorReducer(undefined, hydrateVisitor({ profile: savedProfile }))
      expect(state.isHydrated).toBe(true)
      expect(state.isModalOpen).toBe(false)
      expect(state.profile.name).toBe('Ahmad Dahlan')
      expect(state.profile.cityId).toBe('BDG-02')
      expect(state.profile.isConfigured).toBe(true)
    })

    it('harus mengupdate profil, set isConfigured true, dan menutup modal saat setVisitorProfile', () => {
      const initial = visitorReducer(undefined, hydrateVisitor({ profile: null }))
      expect(initial.isModalOpen).toBe(true)

      const updated = visitorReducer(
        initial,
        setVisitorProfile({
          name: 'Siti Rahma',
          cityId: 'SBY-04',
          cityName: 'Surabaya, Jawa Timur',
          address: 'Jl. Pemuda No. 88',
        })
      )

      expect(updated.profile.name).toBe('Siti Rahma')
      expect(updated.profile.cityId).toBe('SBY-04')
      expect(updated.profile.address).toBe('Jl. Pemuda No. 88')
      expect(updated.profile.isConfigured).toBe(true)
      expect(updated.isModalOpen).toBe(false)
    })

    it('harus dapat membuka dan menutup modal secara manual via openVisitorModal & closeVisitorModal', () => {
      let state = visitorReducer(undefined, { type: '@@INIT' })
      state = visitorReducer(state, openVisitorModal())
      expect(state.isModalOpen).toBe(true)

      state = visitorReducer(state, closeVisitorModal())
      expect(state.isModalOpen).toBe(false)
    })
  })

  // ─── 2. Navbar Component Integration Test ──────────────────────────────────
  describe('Component Integration: <Navbar /> with Redux', () => {
    it('harus menampilkan nama visitor dan kota jika profile sudah terkonfigurasi', () => {
      const store = createTestStore({
        visitor: {
          profile: {
            name: 'Budi Santoso',
            cityId: 'JKT-01',
            cityName: 'Jakarta Pusat, DKI Jakarta',
            address: 'Jl. Thamrin No. 10',
            isConfigured: true,
          },
          isModalOpen: false,
          isHydrated: true,
        },
      })

      render(
        <Provider store={store}>
          <Navbar />
        </Provider>
      )

      expect(screen.getByText('Budi Santoso')).toBeInTheDocument()
      expect(screen.getByText('📍 Jakarta Pusat')).toBeInTheDocument()
    })

    it('harus membuka modal ketika badge profil pengunjung di navbar diklik', () => {
      const store = createTestStore({
        visitor: {
          profile: {
            name: 'Budi Santoso',
            cityId: 'JKT-01',
            cityName: 'Jakarta Pusat, DKI Jakarta',
            address: 'Jl. Thamrin No. 10',
            isConfigured: true,
          },
          isModalOpen: false,
          isHydrated: true,
        },
      })

      render(
        <Provider store={store}>
          <Navbar />
        </Provider>
      )

      const badgeBtn = screen.getByRole('button', { name: /Profil pengunjung: Budi Santoso/i })
      fireEvent.click(badgeBtn)

      expect(store.getState().visitor.isModalOpen).toBe(true)
    })
  })

  // ─── 3. VisitorModal Component Integration Test ─────────────────────────────
  describe('Component Integration: <VisitorModal /> with Redux', () => {
    it('harus merender form modal saat isModalOpen true dan menyimpan input ke Redux store', () => {
      const store = createTestStore({
        visitor: {
          profile: {
            name: '',
            cityId: 'JKT-01',
            cityName: 'Jakarta Pusat, DKI Jakarta',
            address: '',
            isConfigured: false,
          },
          isModalOpen: true,
          isHydrated: true,
        },
      })

      render(
        <Provider store={store}>
          <VisitorModal />
        </Provider>
      )

      expect(screen.getByText('Selamat Datang di Orbit!')).toBeInTheDocument()

      const nameInput = screen.getByLabelText(/Nama Lengkap Anda/i)
      const addressInput = screen.getByLabelText(/Alamat Lengkap Domisili/i)
      const submitBtn = screen.getByRole('button', { name: /Mulai Menjelajah Katalog/i })

      fireEvent.change(nameInput, { target: { value: 'Dewi Sartika' } })
      fireEvent.change(addressInput, { target: { value: 'Jl. Asia Afrika No. 20' } })
      fireEvent.click(submitBtn)

      // State harus terupdate
      const updatedProfile = store.getState().visitor.profile
      expect(updatedProfile.name).toBe('Dewi Sartika')
      expect(updatedProfile.address).toBe('Jl. Asia Afrika No. 20')
      expect(updatedProfile.isConfigured).toBe(true)
      expect(store.getState().visitor.isModalOpen).toBe(false)
    })
  })

  // ─── 4. CheckoutForm Auto-Prefill with Redux ────────────────────────────────
  describe('Component Integration: <CheckoutForm /> Auto-Prefill from Redux', () => {
    const dummyProduct: Product = {
      id: 'orbit-star-h3',
      name: 'Orbit Star H3',
      price: 455000,
      image: '/images/orbit-star-h3.png',
      description: 'Modem 4G',
      features: ['4G LTE'],
    }

    const availableCities = [
      { id: 'JKT-01', name: 'Jakarta Pusat', province: 'DKI Jakarta', courier: 'JNE Express', shippingFee: 15000, estimatedDays: '1-2 hari' },
      { id: 'BDG-02', name: 'Bandung', province: 'Jawa Barat', courier: 'J&T Express', shippingFee: 20000, estimatedDays: '2-3 hari' },
    ]

    it('harus otomatis mengisi nama penerima, kota tujuan, dan alamat dari Redux store', () => {
      const store = createTestStore({
        visitor: {
          profile: {
            name: 'Rian Pratama',
            cityId: 'BDG-02',
            cityName: 'Bandung, Jawa Barat',
            address: 'Jl. Merdeka No. 123, Bandung',
            isConfigured: true,
          },
          isModalOpen: false,
          isHydrated: true,
        },
      })

      render(
        <Provider store={store}>
          <CheckoutForm product={dummyProduct} cities={availableCities} />
        </Provider>
      )

      // Memverifikasi badge otomatisasi terisi
      expect(
        screen.getByText(/Data nama & alamat diisi otomatis dari profil pengunjung Anda\./i)
      ).toBeInTheDocument()

      // Memverifikasi value input terisi otomatis
      const nameInput = screen.getByLabelText(/Nama Lengkap/i) as HTMLInputElement
      const addressInput = screen.getByLabelText(/Alamat Lengkap Pengiriman/i) as HTMLTextAreaElement
      const citySelect = screen.getByLabelText(/Kota \/ Kabupaten Tujuan/i) as HTMLSelectElement

      expect(nameInput.value).toBe('Rian Pratama')
      expect(addressInput.value).toBe('Jl. Merdeka No. 123, Bandung')
      expect(citySelect.value).toBe('BDG-02')
    })
  })
})

