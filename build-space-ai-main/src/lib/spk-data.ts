// ============================================================
// SPK (Surat Perjanjian Kerja) domain data & helpers
// Disesuaikan dari kiro/src/services/spkData.ts untuk build-space-ai-main.
// ============================================================

export type SpkJenis =
  | 'Perancangan Arsitektur'
  | 'Perancangan Interior'
  | 'Perancangan Lanskap'
  | 'Design & Build'
  | 'Construction Supervision'
  | 'Project Management'

export type SpkKategori =
  | 'Membangun baru'
  | 'Renovasi'
  | 'Penambahan lantai'
  | 'Interior fit-out'

export type SpkMode = 'plan' | 'db'
export type SpkTier = 'Ekonomi' | 'Standar' | 'Premium' | 'Luxury'

export const SPK_JENIS_OPTIONS: SpkJenis[] = [
  'Perancangan Arsitektur',
  'Perancangan Interior',
  'Perancangan Lanskap',
  'Design & Build',
  'Construction Supervision',
  'Project Management',
]

export const SPK_KATEGORI_OPTIONS: SpkKategori[] = [
  'Membangun baru',
  'Renovasi',
  'Penambahan lantai',
  'Interior fit-out',
]

export const PRINCIPAL = {
  nama: 'M. Habib Arrohman I',
  studio: 'Sudut Ruang Arsitek / CV. Sudut Ruang Archineering',
  studioShort: 'Sudut Ruang Arsitek',
  jabatan: 'Principal Architect',
  alamat: 'Jl. Krukah Lama Buntu No. 09, Ngagel Rejo, Wonokromo, Surabaya 60245',
  hp: '082111115619',
  email: 'admin@sudutruang.com',
  web: 'www.sudutruang.com',
  ig: '@arsitek.surabaya',
  waDisplay: '+62 821-1111-5619',
  tagline: 'DESIGNING CORNERS · DEFINING SPACES',
  bank: {
    nama: 'Bank Central Asia (BCA)',
    rekening: '1300242622',
    an: 'M. Habib Arrohman I',
  },
  bankMandiri: {
    nama: 'Bank Mandiri',
    rekening: '1270011436225',
    an: 'M. Habib Arrohman I',
  },
}

export interface SpkTermin {
  kode: string
  label: string
  trigger: string
  pct: number
  nominal: number
}

export interface SpkTerminInput {
  label: string
  trigger: string
  pct: number
  auto?: boolean
}

// ── Lingkup pekerjaan per mode × kategori × tier ──────────────

const PLAN_SCOPE: Record<string, Record<string, string[]>> = {
  Arsitektur: {
    Ekonomi: ['Diskusi kebutuhan & briefing', 'Layout denah (1 opsi)', 'Denah final (PDF + DWG)', 'Tampak utama 1 sisi', 'Perspektif 3D eksterior 2-3 view', 'Estimasi biaya kasar (1 halaman)'],
    Standar: ['Konsep desain 1-2 opsi (zoning + moodboard)', 'Denah seluruh lantai (PDF + DWG)', 'Tampak 4 sisi + material', 'Potongan min. 2 arah', 'Denah atap', 'Design Development (material & finishing)', '3D eksterior 3-4 view (resolusi tinggi)', 'RAB estimasi (XLSX + PDF)', 'Material board'],
    Premium: ['Konsep desain 1-2 opsi (zoning + moodboard)', 'Denah seluruh lantai (PDF + DWG)', 'Tampak 4 sisi + material', 'Potongan min. 2 arah', 'Denah atap', 'Design Development', '3D eksterior resolusi tinggi', 'RAB estimasi', 'Material board', 'Detail drawing elemen custom', 'Denah plafon per ruang', 'Denah pola lantai', 'Schedule pintu & jendela', 'RAB + BOQ detail', '3D realistis banyak view (eksterior + interior kunci)', 'Pendampingan lapangan (3x kunjungan)', 'Garansi konsultasi 30 hari'],
  },
  Interior: {
    Ekonomi: ['Moodboard', 'Layout furniture per ruang', '3D sederhana 1-2 view', 'Estimasi biaya kasar (1 halaman)'],
    Standar: ['Moodboard + concept board', 'Furniture layout semua ruang', 'Gambar interior (tampak ruang + denah furniture)', 'Material & furniture schedule', '3D realistis per ruang kunci', 'RAB estimasi'],
    Premium: ['Moodboard + concept board', 'Furniture layout semua ruang', 'Gambar interior', 'Material & furniture schedule', '3D realistis per ruang', 'RAB estimasi', 'Shop drawing furniture custom (kitchen set, wardrobe, built-in)', 'BOQ detail', 'Rekomendasi vendor', '3D realistis multi-ruang', 'Garansi konsultasi 30 hari'],
  },
  Landscape: {
    Ekonomi: ['Layout taman sederhana', 'Planting plan dasar', '3D sederhana', 'Estimasi biaya kasar'],
    Standar: ['Konsep + layout taman lengkap', 'Planting plan detail', 'Hardscape dasar (jalan setapak, area duduk, stepping stone)', '3D realistis', 'RAB estimasi'],
    Premium: ['Masterplan lanskap', 'Hardscape detail', 'Softscape detail (skema tanaman berlapis)', 'Lighting plan', 'RAB + BOQ detail', '3D realistis multi-view', 'Pendampingan pemilihan material', 'Garansi konsultasi 30 hari'],
  },
  Renovasi: {
    Ekonomi: ['Survey existing sederhana (foto + sketsa)', 'Layout usulan (denah perubahan)', 'Estimasi biaya kasar'],
    Standar: ['Existing drawing (gambar ukur)', 'Design Development (denah usulan + tampak)', '3D hasil renovasi', 'RAB'],
    Premium: ['Existing survey detail', 'Gambar arsitektur lengkap usulan (denah, tampak, potongan)', 'Detail drawing elemen yang diubah', 'RAB + BOQ', '3D realistis', 'Pendampingan lapangan', 'Garansi konsultasi 30 hari'],
  },
}

const PLAN_EXCLUDE: Record<string, Record<string, string[]>> = {
  Arsitektur: { Ekonomi: ['Detail drawing', 'RAB formal', 'Potongan', 'Denah atap/plafon', 'Pendampingan lapangan'], Standar: ['Detail drawing custom lengkap', 'Pendampingan lapangan rutin', 'Gambar struktur & MEP'], Premium: ['Full construction drawing setingkat proyek pemerintah', 'Gambar struktur & MEP', 'Perjalanan di luar 3x kunjungan'] },
  Interior: { Ekonomi: ['RAB formal', 'Shop drawing', 'Material schedule detail', 'Pelaksanaan / produksi'], Standar: ['Pelaksanaan / produksi furnitur', 'Pengadaan material & furnitur'], Premium: ['Pelaksanaan / produksi furnitur', 'Pengadaan material & furnitur'] },
  Landscape: { Ekonomi: ['RAB formal', 'Pelaksanaan & penanaman', 'Pengadaan tanaman & material'], Standar: ['Pelaksanaan & penanaman', 'Pengadaan tanaman & material', 'Maintenance'], Premium: ['Pelaksanaan & penanaman', 'Pengadaan material', 'Maintenance pasca serah terima (paket terpisah)'] },
  Renovasi: { Ekonomi: ['RAB formal', 'Detail drawing', 'Pelaksanaan konstruksi'], Standar: ['Pelaksanaan konstruksi', 'Pengurusan izin (PBG)'], Premium: ['Pelaksanaan konstruksi', 'Pengurusan izin (PBG) - add-on'] },
}

const DB_SCOPE: Record<string, Record<string, string[]>> = {
  Arsitektur: {
    Standar: ['Desain: konsep + DD + gambar kerja + RAB/BOQ (tanpa fee terpisah)', 'Struktur beton bertulang + footplat', 'Dinding bata ringan/merah + plester aci', 'Lantai granit tile 60x60 / 80x80', 'Atap genteng keramik / beton flat', 'Kusen aluminium / kayu solid', 'Sanitair Toto / American Standard', 'Plafon gypsum / GRC', 'MEP standar (listrik 3500-5500 VA)', 'Cat weathershield eksterior + interior standar'],
    Premium: ['Desain + detail drawing elemen custom', 'Struktur beton bertulang penuh (pondasi dalam jika perlu)', 'Finishing marmer lokal / kayu solid / batu alam', 'Kusen aluminium powder coating / kayu jati custom', 'Sanitair setara Kohler', 'Plafon GRC / wood panel + drop ceiling dekoratif', 'MEP AC ducting (listrik 7700 VA+)', 'Smart home dasar (opsional)', 'Fasad custom (batu alam / secondary skin)'],
    Luxury: ['Desain lengkap + detail drawing menyeluruh', 'Material impor (marmer Italia, kayu teak grade A)', 'Smart home terintegrasi penuh', 'Fasad custom penuh (ACP, structural glazing)', 'MEP lengkap (VRV AC, STP, genset)', 'QC zero-defect berlapis', 'Kontraktor / sub spesialis per bidang'],
  },
  Interior: {
    Standar: ['Desain interior (konsep -> gambar kerja)', 'Ceiling, cat, lighting standar', 'Furniture loose + built-in sederhana', 'Pemasangan & finishing', 'Koordinasi tukang'],
    Premium: ['Desain interior + detail', 'Custom furniture, kitchen set, wardrobe', 'Wall panel + decorative lighting', 'Produksi & pemasangan furnitur custom', 'Finishing menyeluruh'],
    Luxury: ['Desain interior premium menyeluruh', 'Veneer, HPL premium, marble, solid wood', 'Smart home interior', 'Produksi presisi + instalasi', 'Finishing & styling lengkap'],
  },
  Landscape: {
    Standar: ['Desain lanskap + RAB', 'Rumput, tanaman, stepping stone', 'Lampu taman sederhana', 'Pengadaan tanaman & material', 'Pengerjaan + pembersihan akhir'],
    Premium: ['Desain lanskap lengkap', 'Hardscape + softscape', 'Lighting + irigasi', 'Pengadaan material & tanaman', 'Instalasi + pembersihan akhir'],
    Luxury: ['Masterplan lanskap menyeluruh', 'Batu alam premium, kolam, decking', 'Lighting system + smart irrigation', 'Sourcing material premium', 'Instalasi presisi + finishing'],
  },
}

const DB_EXCLUDE: Record<string, string[]> = {
  Arsitektur: ['Tanah', 'PBG / perizinan', 'Sambungan PLN / PDAM baru', 'Furnitur lepas', 'AC', 'Landscape', 'Pagar'],
  Interior: ['Furnitur loose beli jadi (kecuali disepakati)', 'Peralatan elektronik', 'Peralatan dapur komersial'],
  Landscape: ['Maintenance pasca serah terima (paket terpisah)', 'Perbaikan struktur eksisting'],
}

// ── Kategori & tier options per mode ──────────────

export const PLAN_CATEGORIES = ['Arsitektur', 'Interior', 'Landscape', 'Renovasi']
export const DB_CATEGORIES = ['Arsitektur', 'Interior', 'Landscape']
export const PLAN_TIERS: SpkTier[] = ['Ekonomi', 'Standar', 'Premium']
export const DB_TIERS: SpkTier[] = ['Standar', 'Premium', 'Luxury']

export function getCategories(mode: SpkMode): string[] {
  return mode === 'plan' ? PLAN_CATEGORIES : DB_CATEGORIES
}

export function getTiers(mode: SpkMode): SpkTier[] {
  return mode === 'plan' ? PLAN_TIERS : DB_TIERS
}

// ── Resolve scope & exclude ──────────────

export function getScopeItems(mode: SpkMode, category: string, tier: string): string[] {
  if (mode === 'plan') {
    const catData = PLAN_SCOPE[category] || PLAN_SCOPE.Arsitektur
    return catData[tier] || catData.Standar || []
  }
  const catData = DB_SCOPE[category] || DB_SCOPE.Arsitektur
  return catData[tier] || catData.Standar || []
}

export function getExcludeItems(mode: SpkMode, category: string, tier: string): string[] {
  if (mode === 'plan') {
    const catData = PLAN_EXCLUDE[category] || PLAN_EXCLUDE.Arsitektur
    return catData[tier] || catData.Standar || []
  }
  return DB_EXCLUDE[category] || DB_EXCLUDE.Arsitektur || []
}

// ── Termin pembayaran per mode × kategori × tier ──────────────

export function getDefaultTermins(mode: SpkMode, category: string, tier: string): SpkTerminInput[] {
  if (mode === 'db') {
    const cat = category.toLowerCase()
    const t3 = cat.includes('interior')
      ? 'Verifikasi progres 30% - produksi furnitur custom + pekerjaan plafon/dinding'
      : cat.includes('landscape')
        ? 'Verifikasi progres 30% - pekerjaan tanah + hardscape struktural'
        : 'Verifikasi progres 30% - struktur: sloof, kolom, balok, sebagian dinding'
    const t4 = cat.includes('interior')
      ? 'Verifikasi progres 60% - instalasi furnitur + lighting + finishing dasar'
      : cat.includes('landscape')
        ? 'Verifikasi progres 60% - softscape (penanaman) + irigasi + lighting'
        : 'Verifikasi progres 60% - dinding selesai, atap, MEP roughing-in, kusen'
    const t5 = cat.includes('interior')
      ? 'Verifikasi progres 90% - finishing detail + styling'
      : cat.includes('landscape')
        ? 'Verifikasi progres 90% - finishing + penyempurnaan + pembersihan'
        : 'Verifikasi progres 90% - finishing: lantai, plafon, cat, sanitair, MEP'
    return [
      { label: 'Down Payment / Uang Muka', pct: 20, trigger: 'Tanda tangan SPK -> mulai fase desain' },
      { label: 'Termin Mobilisasi', pct: 20, trigger: 'Desain final disetujui -> mobilisasi material & tim' },
      { label: 'Termin Progres 30%', pct: 25, trigger: t3 },
      { label: 'Termin Progres 60%', pct: 20, trigger: t4 },
      { label: 'Termin Progres 90%', pct: 10, trigger: t5 },
      { label: 'Termin BAST', pct: 5, trigger: 'Serah terima akhir + sertifikat garansi' },
    ]
  }
  // Plan mode
  if (tier === 'Ekonomi') {
    if (category === 'Interior') {
      return [
        { label: 'Down Payment / Uang Muka', pct: 30, trigger: 'Tanda tangan SPK -> moodboard' },
        { label: 'Termin 1', pct: 40, trigger: 'Layout furniture disetujui' },
        { label: 'Termin 2', pct: 30, trigger: '3D sederhana + estimasi kasar -> serah terima' },
      ]
    }
    const isLR = category === 'Landscape' || category === 'Renovasi'
    return [
      { label: 'Down Payment / Uang Muka', pct: 40, trigger: 'Tanda tangan SPK -> mulai briefing & gambar awal' },
      { label: 'Termin 1', pct: isLR ? 40 : 30, trigger: 'Gambar utama disetujui' },
      { label: 'Termin 2', pct: isLR ? 20 : 30, trigger: '3D + estimasi kasar -> serah terima file' },
    ]
  }
  if (tier === 'Standar') {
    return [
      { label: 'Down Payment / Uang Muka', pct: 30, trigger: 'Tanda tangan SPK -> mulai pengembangan konsep' },
      { label: 'Termin 1 — Schematic & Design Development', pct: 30, trigger: 'Konsep disetujui (opsi + moodboard)' },
      { label: 'Termin 2 — Detail Drawing & RAB', pct: 30, trigger: 'Design Development disetujui (gambar lengkap + RAB)' },
      { label: 'Termin 3 — Serah Terima', pct: 10, trigger: 'Serah terima dokumen final' },
    ]
  }
  // Premium
  return [
    { label: 'Down Payment / Uang Muka', pct: 30, trigger: 'Tanda tangan SPK -> survey + mulai konsep' },
    { label: 'Termin 1 — Konsep', pct: 25, trigger: 'Konsep disetujui' },
    { label: 'Termin 2 — Design Development', pct: 25, trigger: 'Design Development disetujui' },
    { label: 'Termin 3 — Detail Drawing + RAB/BOQ + 3D', pct: 15, trigger: 'Detail drawing + RAB & BOQ + 3D final' },
    { label: 'Termin 4 — Pendampingan', pct: 5, trigger: 'Serah terima + mulai garansi konsultasi 30 hari' },
  ]
}

// ── Build termins (menghitung nominal) ──────────────

export function buildTermins(rows: SpkTerminInput[], total: number): SpkTermin[] {
  const t = Number.isFinite(total) ? total : 0
  const manualSum = rows.reduce((s, r) => s + (r.auto ? 0 : (Number.isFinite(r.pct) ? r.pct : 0)), 0)
  const autoCount = rows.filter((r) => r.auto).length
  const leftover = 100 - manualSum
  const perAuto = autoCount > 0 && leftover > 0 ? leftover / autoCount : 0
  let autoSeen = 0

  return rows.map((r, i) => {
    let pct: number
    if (r.auto) {
      autoSeen++
      pct = autoSeen === autoCount ? Math.max(0, leftover - perAuto * (autoCount - 1)) : Math.max(0, perAuto)
    } else {
      pct = Number.isFinite(r.pct) ? r.pct : 0
    }
    pct = Math.round(pct * 100) / 100
    return {
      kode: `TR-${i + 1}`,
      label: r.label,
      trigger: r.trigger,
      pct,
      nominal: Math.round((t * pct) / 100),
    }
  })
}

// ── SPK Number ──────────────

export function spkJenisCode(jenis: string): string {
  const map: Record<string, string> = {
    'Perancangan Arsitektur': 'PA',
    'Perancangan Interior': 'PI',
    'Perancangan Lanskap': 'PL',
    'Design & Build': 'DB',
    'Construction Supervision': 'CS',
    'Project Management': 'PM',
  }
  return map[jenis] || 'PA'
}

export function buildSpkNumber(seq: number | string, jenis: string, date: Date = new Date()): string {
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
  const d = isNaN(date.getTime()) ? new Date() : date
  const digits = String(seq).replace(/\D/g, '')
  const seqStr = (digits || '1').padStart(3, '0')
  return `${seqStr}/EXT-Dir/SPK.${spkJenisCode(jenis)}/${roman[d.getMonth()]}/${d.getFullYear()}`
}

// ── Tanggal Indo ──────────────

const HARI_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const BULAN_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

export function formatTanggalIndo(date: Date = new Date()) {
  return {
    hari: HARI_ID[date.getDay()],
    tanggal: String(date.getDate()),
    bulan: BULAN_ID[date.getMonth()],
    tahun: String(date.getFullYear()),
  }
}

// ── Terbilang ──────────────

const SATUAN = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas']

function terbilangRec(n: number): string {
  n = Math.floor(Math.abs(n))
  if (n < 12) return SATUAN[n]
  if (n < 20) return terbilangRec(n - 10) + ' belas'
  if (n < 100) return terbilangRec(Math.floor(n / 10)) + ' puluh ' + terbilangRec(n % 10)
  if (n < 200) return 'seratus ' + terbilangRec(n - 100)
  if (n < 1000) return terbilangRec(Math.floor(n / 100)) + ' ratus ' + terbilangRec(n % 100)
  if (n < 2000) return 'seribu ' + terbilangRec(n - 1000)
  if (n < 1_000_000) return terbilangRec(Math.floor(n / 1000)) + ' ribu ' + terbilangRec(n % 1000)
  if (n < 1_000_000_000) return terbilangRec(Math.floor(n / 1_000_000)) + ' juta ' + terbilangRec(n % 1_000_000)
  if (n < 1_000_000_000_000) return terbilangRec(Math.floor(n / 1_000_000_000)) + ' miliar ' + terbilangRec(n % 1_000_000_000)
  return terbilangRec(Math.floor(n / 1_000_000_000_000)) + ' triliun ' + terbilangRec(n % 1_000_000_000_000)
}

export function terbilang(n: number): string {
  if (!Number.isFinite(n) || n === 0) return 'Nol rupiah'
  const words = terbilangRec(n).replace(/\s+/g, ' ').trim()
  const capitalized = words.charAt(0).toUpperCase() + words.slice(1)
  return `${capitalized} rupiah`
}

export function formatIDR(n: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0,
  )
}

// ── Jenis dari paket layanan ──────────────

export function jenisFromPackage(mode: SpkMode, category: string): SpkJenis {
  if (mode === 'db') return 'Design & Build'
  if (category === 'Interior') return 'Perancangan Interior'
  if (category === 'Landscape') return 'Perancangan Lanskap'
  return 'Perancangan Arsitektur'
}


// ── Tahapan Pekerjaan (Pasal 1.5) per mode × kategori ──────────────

export interface TahapItem {
  title: string
  desc: string
  bullets: string[]
}

const TAHAP_PLAN_ARSITEKTUR: TahapItem[] = [
  { title: 'Tahap 1 – Diskusi Awal', desc: 'Diskusi bersama pemilik untuk menentukan arah desain dan program ruang.', bullets: ['Sketsa denah / layout', 'Sketsa massing sederhana (3D mood images)', 'Gambar ide & usulan (preseden)'] },
  { title: 'Tahap 2 – Perencanaan Schematic (ARS)', desc: '', bullets: ['Denah teknik — Skala 1:100/150', 'Tampak — Skala 1:100/150', 'Potongan sumbu X & Y — Skala 1:100/150', 'Rencana atap — Skala 1:100/150', 'Perspektif 3D — Skala bebas'] },
  { title: 'Tahap 3A – Design Development (ARS)', desc: 'Tidak ada perubahan desain major. Gambar dapat digunakan untuk pengurusan IMB/PBG.', bullets: ['Denah, Tampak, Potongan X & Y (synced) — Skala 1:100/150', 'Rencana atap (synced) — Skala 1:100/150', 'Detail tangga (synced) — Skala 1:25 / 1:50'] },
  { title: 'Tahap 3B – Detail Drawing (ARS)', desc: '', bullets: ['Rencana pola lantai — Skala 1:100', 'Rencana plafon & titik lampu — Skala 1:100', 'Rencana stop kontak & elektrikal — Skala 1:100', 'Detail railing & tangga — Skala 1:25, 1:20', 'Detail kamar mandi & WC — Skala 1:25', 'Detail fasad tampak — Skala 1:50', 'Rencana kusen, daun pintu & jendela — Skala 1:50, 1:20', 'Detail arsitektur lainnya — Skala 1:5, 1:10, 1:20', 'Rencana Anggaran Biaya (RAB)'] },
  { title: 'Tahap 4 – Pendampingan Lapangan (Field/ARS)', desc: '', bullets: ['Menerbitkan Minutes of Meeting (MOM) setiap pertemuan.', 'Dalam 14 hari kerja tanpa tanggapan koreksi, MOM dianggap disetujui.', 'Hak kekayaan intelektual atas seluruh produk perencanaan.', 'Perubahan desain setelah pembangunan = pekerjaan tambahan kontrak baru.'] },
]

const TAHAP_PLAN_INTERIOR: TahapItem[] = [
  { title: 'Tahap 1 – Briefing & Moodboard', desc: 'Diskusi kebutuhan, gaya hidup, dan preferensi klien.', bullets: ['Moodboard referensi', 'Concept board', 'Sketsa awal layout'] },
  { title: 'Tahap 2 – Layout Furnitur & Gambar Interior', desc: '', bullets: ['Furniture layout semua ruang', 'Gambar interior (tampak ruang + denah furniture)', 'Material & furniture schedule'] },
  { title: 'Tahap 3 – Visualisasi 3D', desc: '', bullets: ['3D realistis per ruang kunci', '3D multi-ruang (Premium)', 'Revisi visual'] },
  { title: 'Tahap 4 – Shop Drawing & BOQ', desc: 'Gambar kerja furnitur custom.', bullets: ['Shop drawing kitchen set, wardrobe, built-in', 'BOQ detail', 'Rekomendasi vendor'] },
  { title: 'Tahap 5 – Serah Terima & Pendampingan', desc: '', bullets: ['Serah terima dokumen final', 'Pendampingan pemilihan material', 'Garansi konsultasi 30 hari'] },
]

const TAHAP_PLAN_LANDSCAPE: TahapItem[] = [
  { title: 'Tahap 1 – Survey & Analisis Tapak', desc: 'Analisis tapak, kontur, dan iklim mikro.', bullets: ['Survey kondisi existing', 'Analisis orientasi matahari & angin', 'Brief final'] },
  { title: 'Tahap 2 – Konsep & Layout Taman', desc: '', bullets: ['Konsep + layout taman lengkap', 'Planting plan detail', 'Hardscape dasar (jalan setapak, area duduk)'] },
  { title: 'Tahap 3 – Detail Hardscape & Softscape', desc: '', bullets: ['Hardscape detail', 'Softscape detail (skema tanaman berlapis)', 'Lighting plan', 'Sistem irigasi'] },
  { title: 'Tahap 4 – Visualisasi & RAB', desc: '', bullets: ['3D realistis multi-view', 'RAB + BOQ detail'] },
  { title: 'Tahap 5 – Serah Terima & Pendampingan', desc: '', bullets: ['Pendampingan pemilihan material', 'Serah terima dokumen final', 'Garansi konsultasi 30 hari'] },
]

const TAHAP_PLAN_RENOVASI: TahapItem[] = [
  { title: 'Tahap 1 – Survey Existing', desc: 'Dokumentasi dan pengukuran kondisi bangunan existing.', bullets: ['Survey detail + foto dokumentasi', 'Gambar ukur kondisi existing', 'Identifikasi potensi & kendala'] },
  { title: 'Tahap 2 – Design Development', desc: '', bullets: ['Denah usulan perubahan', 'Tampak perubahan', 'Konsep renovasi'] },
  { title: 'Tahap 3 – Detail Drawing', desc: '', bullets: ['Detail elemen yang diubah', 'Gambar arsitektur lengkap usulan', 'Potongan & tampak'] },
  { title: 'Tahap 4 – RAB & BOQ', desc: '', bullets: ['RAB detail', 'BOQ (Bill of Quantity)', 'Estimasi biaya'] },
  { title: 'Tahap 5 – Serah Terima & Pendampingan', desc: '', bullets: ['Pendampingan lapangan', '3D realistis', 'Garansi konsultasi 30 hari'] },
]

const TAHAP_DB_ARSITEKTUR: TahapItem[] = [
  { title: 'Tahap 1 – Desain & RAB Final', desc: 'Konsep → DD → gambar kerja → RAB/BOQ final disetujui.', bullets: ['Konsep desain', 'Design Development', 'Gambar kerja lengkap', 'RAB / BOQ final'] },
  { title: 'Tahap 2 – Mobilisasi & Pondasi', desc: '', bullets: ['Persiapan lahan', 'Mobilisasi tim & material', 'Pekerjaan pondasi'] },
  { title: 'Tahap 3 – Struktur & Pasangan', desc: '', bullets: ['Sloof, kolom, balok', 'Dinding bata ringan/merah', 'Rangka & penutup atap'] },
  { title: 'Tahap 4 – MEP & Finishing', desc: '', bullets: ['MEP (listrik, plumbing, AC)', 'Lantai, plafon, kusen', 'Cat eksterior & interior', 'Sanitair'] },
  { title: 'Tahap 5 – QC & Serah Terima', desc: '', bullets: ['Punch list & perbaikan', 'As-built drawing', 'BAST + sertifikat garansi'] },
]

const TAHAP_DB_INTERIOR: TahapItem[] = [
  { title: 'Tahap 1 – Desain & Shop Drawing', desc: 'Konsep → gambar kerja → shop drawing custom.', bullets: ['Konsep interior', 'Gambar kerja detail', 'Shop drawing furnitur custom'] },
  { title: 'Tahap 2 – Produksi Furnitur', desc: '', bullets: ['Produksi furnitur custom di workshop', 'Kitchen set, wardrobe, built-in', 'QC produksi'] },
  { title: 'Tahap 3 – Instalasi & Finishing', desc: '', bullets: ['Pekerjaan ceiling, cat, lighting', 'Pemasangan furnitur', 'Wall panel + dekoratif'] },
  { title: 'Tahap 4 – Finishing Detail', desc: '', bullets: ['Finishing menyeluruh', 'Styling & dekorasi', 'Touch up'] },
  { title: 'Tahap 5 – QC & Serah Terima', desc: '', bullets: ['Punch list', 'BAST + sertifikat garansi'] },
]

const TAHAP_DB_LANDSCAPE: TahapItem[] = [
  { title: 'Tahap 1 – Desain & RAB', desc: 'Desain lanskap lengkap + RAB final.', bullets: ['Desain lanskap', 'RAB / BOQ disetujui'] },
  { title: 'Tahap 2 – Persiapan & Hardscape', desc: '', bullets: ['Pekerjaan tanah', 'Hardscape struktural', 'Stepping stone, area duduk'] },
  { title: 'Tahap 3 – Softscape & Irigasi', desc: '', bullets: ['Penanaman rumput & tanaman', 'Sistem irigasi', 'Lighting taman'] },
  { title: 'Tahap 4 – Finishing', desc: '', bullets: ['Penyempurnaan detail', 'Pembersihan akhir'] },
  { title: 'Tahap 5 – Serah Terima', desc: '', bullets: ['BAST', 'Panduan perawatan', 'Garansi'] },
]

export function getTahapItems(mode: SpkMode, category: string, tier: string = 'Standar'): TahapItem[] {
  if (mode === 'db') {
    const cat = category.toLowerCase()
    if (cat.includes('interior')) return TAHAP_DB_INTERIOR
    if (cat.includes('landscape')) return TAHAP_DB_LANDSCAPE
    return TAHAP_DB_ARSITEKTUR
  }
  // plan — Ekonomi hanya 3 tahap, Standar 4, Premium 5
  let items: TahapItem[]
  if (category === 'Interior') items = TAHAP_PLAN_INTERIOR
  else if (category === 'Landscape') items = TAHAP_PLAN_LANDSCAPE
  else if (category === 'Renovasi') items = TAHAP_PLAN_RENOVASI
  else items = TAHAP_PLAN_ARSITEKTUR

  if (tier === 'Ekonomi') return items.slice(0, 3)
  if (tier === 'Standar') return items.slice(0, 4)
  return items // Premium = semua
}
