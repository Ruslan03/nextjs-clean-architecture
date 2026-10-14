'use client'

/**
 * PRESENTATION LAYER — Navbar Component
 *
 * Displays site navigation and real-time visitor profile from the Redux store.
 * Allows visitors to click and update their name & address anytime.
 */

import Link from 'next/link'
import { useAppDispatch, useAppSelector } from '../store'
import { openVisitorModal } from '../store/visitor-slice'

export function Navbar() {
  const dispatch = useAppDispatch()
  const { profile, isHydrated } = useAppSelector((state) => state.visitor)

  return (
    <header className="site-header">
      <div className="container">
        <div className="site-header__inner">
          <Link href="/" className="site-header__logo">
            <span className="site-header__logo-brand">Telkomsel</span>
            <span className="site-header__logo-sub">Orbit</span>
          </Link>
          <nav className="site-header__nav">
            <Link href="/" className="site-header__nav-link site-header__nav-link--active">
              Katalog Produk
            </Link>

            {isHydrated && profile.isConfigured ? (
              <button
                type="button"
                onClick={() => dispatch(openVisitorModal())}
                className="visitor-badge-btn"
                title="Klik untuk mengubah nama & alamat"
                aria-label={`Profil pengunjung: ${profile.name}`}
              >
                <span className="visitor-badge-btn__avatar" aria-hidden="true">👤</span>
                <span className="visitor-badge-btn__text">
                  <span className="visitor-badge-btn__greeting">Halo,</span>{' '}
                  <strong className="visitor-badge-btn__name">{profile.name}</strong>
                </span>
                <span className="visitor-badge-btn__city">📍 {profile.cityName.split(',')[0]}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => dispatch(openVisitorModal())}
                className="btn btn-outline btn-sm"
              >
                👤 Profil Pengunjung
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
