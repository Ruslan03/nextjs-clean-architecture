import { NextResponse } from 'next/server'

/**
 * EXTERNAL 3RD-PARTY SERVICE SIMULATION — "CekOngkir" API
 * Endpoint: /api/cekongkir/cities
 *
 * Mensimulasikan REST API dari penyedia logistik eksternal ("CekOngkir").
 * Memiliki struktur payload tersendiri dengan penamaan snake_case khas API pihak ketiga.
 */

const CEK_ONGKIR_DATABASE = [
  {
    city_id: 'JKT-01',
    nama_kota: 'Jakarta Pusat',
    provinsi: 'DKI Jakarta',
    tarif_pengiriman: 15000,
    estimasi_hari: '1-2 hari',
    kurir: 'JNE Regular',
  },
  {
    city_id: 'BDG-02',
    nama_kota: 'Bandung',
    provinsi: 'Jawa Barat',
    tarif_pengiriman: 20000,
    estimasi_hari: '2-3 hari',
    kurir: 'JNE Regular',
  },
  {
    city_id: 'SMG-03',
    nama_kota: 'Semarang',
    provinsi: 'Jawa Tengah',
    tarif_pengiriman: 25000,
    estimasi_hari: '2-3 hari',
    kurir: 'JNE Regular',
  },
  {
    city_id: 'SBY-04',
    nama_kota: 'Surabaya',
    provinsi: 'Jawa Timur',
    tarif_pengiriman: 30000,
    estimasi_hari: '2-4 hari',
    kurir: 'JNE Regular',
  },
  {
    city_id: 'DPS-05',
    nama_kota: 'Denpasar',
    provinsi: 'Bali',
    tarif_pengiriman: 35000,
    estimasi_hari: '2-3 hari',
    kurir: 'JNE Regular',
  },
  {
    city_id: 'MDN-06',
    nama_kota: 'Medan',
    provinsi: 'Sumatera Utara',
    tarif_pengiriman: 45000,
    estimasi_hari: '3-5 hari',
    kurir: 'JNE Regular',
  },
  {
    city_id: 'MKS-07',
    nama_kota: 'Makassar',
    provinsi: 'Sulawesi Selatan',
    tarif_pengiriman: 50000,
    estimasi_hari: '3-5 hari',
    kurir: 'JNE Regular',
  },
]

export async function GET() {
  return NextResponse.json({
    rajaongkir_status: {
      code: 200,
      description: 'OK',
    },
    origin_details: {
      city_name: 'Jakarta Pusat',
      province: 'DKI Jakarta',
    },
    destination_results: CEK_ONGKIR_DATABASE,
  })
}
