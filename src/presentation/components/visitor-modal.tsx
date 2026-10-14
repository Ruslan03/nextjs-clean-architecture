'use client'

/**
 * PRESENTATION LAYER — Visitor Onboarding & Profile Modal
 *
 * Prompts first-time visitors to provide their Name, City, and Delivery Address.
 * Dispatches updates to the Redux store, which persists the data to localStorage.
 */

import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store'
import { setVisitorProfile, closeVisitorModal } from '../store/visitor-slice'

const AVAILABLE_CITIES = [
  { id: 'JKT-01', name: 'Jakarta Pusat, DKI Jakarta' },
  { id: 'BDG-02', name: 'Bandung, Jawa Barat' },
  { id: 'SMG-03', name: 'Semarang, Jawa Tengah' },
  { id: 'SBY-04', name: 'Surabaya, Jawa Timur' },
  { id: 'DPS-05', name: 'Denpasar, Bali' },
  { id: 'MDN-06', name: 'Medan, Sumatera Utara' },
  { id: 'MKS-07', name: 'Makassar, Sulawesi Selatan' },
]

export function VisitorModal() {
  const dispatch = useAppDispatch()
  const { profile, isModalOpen, isHydrated } = useAppSelector((state) => state.visitor)

  const [name, setName] = useState('')
  const [cityId, setCityId] = useState('JKT-01')
  const [address, setAddress] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Populate form with existing profile state when modal opens
  useEffect(() => {
    if (profile.isConfigured) {
      setName(profile.name)
      setCityId(profile.cityId)
      setAddress(profile.address)
    }
  }, [profile, isModalOpen])

  if (!isHydrated || !isModalOpen) {
    return null
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!name.trim() || name.trim().length < 2) {
      setError('Silakan masukkan nama lengkap minimal 2 karakter.')
      return
    }

    if (!address.trim() || address.trim().length < 5) {
      setError('Silakan lengkapi alamat domisili pengiriman minimal 5 karakter.')
      return
    }

    const selectedCity = AVAILABLE_CITIES.find((c) => c.id === cityId) || AVAILABLE_CITIES[0]

    dispatch(
      setVisitorProfile({
        name: name.trim(),
        cityId: selectedCity.id,
        cityName: selectedCity.name,
        address: address.trim(),
      })
    )
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="visitor-modal-title">
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-header__icon">👋</div>
          <div>
            <h2 id="visitor-modal-title" className="modal-header__title">
              {profile.isConfigured ? 'Ubah Profil Pengunjung' : 'Selamat Datang di Orbit!'}
            </h2>
            <p className="modal-header__subtitle">
              {profile.isConfigured
                ? 'Perbarui nama dan alamat domisili untuk kemudahan pemesanan.'
                : 'Lengkapi nama dan alamat Anda untuk personalisasi dan kemudahan checkout.'}
            </p>
          </div>
          {profile.isConfigured && (
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => dispatch(closeVisitorModal())}
              aria-label="Tutup modal"
            >
              &times;
            </button>
          )}
        </div>

        {error && (
          <div className="alert-error" style={{ margin: '16px 24px 0' }} role="alert">
            <span>⚠️ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="visitorNameInput" className="form-label">
              Nama Lengkap Anda <span className="text-danger">*</span>
            </label>
            <input
              id="visitorNameInput"
              type="text"
              required
              className="form-control"
              placeholder="Contoh: Budi Santoso"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="visitorCitySelect" className="form-label">
              Kota / Domisili Pengiriman <span className="text-danger">*</span>
            </label>
            <select
              id="visitorCitySelect"
              required
              className="form-control form-select"
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
            >
              {AVAILABLE_CITIES.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
            <span className="form-help">
              Kota ini akan digunakan secara otomatis saat menghitung ongkos kirim di checkout.
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="visitorAddressInput" className="form-label">
              Alamat Lengkap Domisili <span className="text-danger">*</span>
            </label>
            <textarea
              id="visitorAddressInput"
              required
              rows={3}
              className="form-control"
              placeholder="Contoh: Jl. Sudirman No. 45, RT 02/05, Menteng"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="modal-footer">
            <button type="submit" className="btn btn-primary btn-block btn-lg">
              {profile.isConfigured ? 'Simpan Perubahan' : 'Mulai Menjelajah Katalog'}
            </button>
            <p className="modal-footer__note">
              🔒 Data tersimpan aman di browser Anda via Redux &amp; LocalStorage.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
