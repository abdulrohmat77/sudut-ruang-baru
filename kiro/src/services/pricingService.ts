// Pricing Service v2 — model Perencanaan + Design & Build (sesuai bisnis client)
// Sumber: tabel Supabase planning_rates & build_rates (editable via menu Kelola Harga).
// Data di bawah = DEFAULT/fallback bila Supabase kosong/error.

import { supabase } from './supabaseClient'

// ============================================================
// Types
// ============================================================
export interface PlanningRate {
  id: string
  category: string // Arsitektur, Interior, Landscape, Renovasi
  tier: string // Ekonomi, Standar, Premium
  listPerM2: number
  floorPerM2: number
  scope: string
}

export interface BuildRate {
  id: string
  grup: string // Bangunan, Interior, Komponen, Landscape, Fitur Air, Maintenance
  category: string // D&B Arsitektur, Kitchen Set, Kolam Renang, dst
  tier: string // Standar, Premium, Luxury, Basic, Custom
  priceMin: number
  priceMax: number
  unit: string // m2 | m' | bulan
  notes: string
}

// ============================================================
// Konstanta
// ============================================================
export const PPN_RATE = 0.11
export const PLAN_MIN_ORDER = 3_500_000 // minimum order jasa perencanaan
export const BUILD_MIN_AREA = 60 // m² minimum agar mobilisasi D&B layak
export const BUILD_MAX_DISC = 10 // % maksimum diskon nego untuk D&B

// ============================================================
// DEFAULT DATA (fallback)
// ============================================================
export let planningRates: PlanningRate[] = [
  { id: 'plan-arsitektur-ekonomi', category: 'Arsitektur', tier: 'Ekonomi', listPerM2: 50000, floorPerM2: 40000, scope: 'Konsep + layout/denah utama + 3D sederhana + estimasi biaya kasar. 1x revisi mayor. Tanpa RAB formal.' },
  { id: 'plan-arsitektur-standar', category: 'Arsitektur', tier: 'Standar', listPerM2: 110000, floorPerM2: 90000, scope: 'Gambar/denah lengkap + tampak + potongan + 3D realistis + RAB estimasi (Excel+PDF). 2x revisi mayor.' },
  { id: 'plan-arsitektur-premium', category: 'Arsitektur', tier: 'Premium', listPerM2: 200000, floorPerM2: 160000, scope: 'Semua item Standar + detail drawing + RAB/BOQ detail + pendampingan lapangan + garansi konsultasi 30 hari.' },
  { id: 'plan-interior-ekonomi', category: 'Interior', tier: 'Ekonomi', listPerM2: 60000, floorPerM2: 48000, scope: 'Moodboard + layout furniture + 3D sederhana + estimasi kasar.' },
  { id: 'plan-interior-standar', category: 'Interior', tier: 'Standar', listPerM2: 120000, floorPerM2: 95000, scope: 'Moodboard + layout semua ruang + gambar interior + material schedule + 3D realistis + RAB.' },
  { id: 'plan-interior-premium', category: 'Interior', tier: 'Premium', listPerM2: 225000, floorPerM2: 180000, scope: 'Semua Standar + shop drawing custom + BOQ + rekomendasi vendor + 3D multi-ruang + garansi 30 hari.' },
  { id: 'plan-landscape-ekonomi', category: 'Landscape', tier: 'Ekonomi', listPerM2: 40000, floorPerM2: 32000, scope: 'Layout taman + planting plan dasar + 3D sederhana + estimasi kasar.' },
  { id: 'plan-landscape-standar', category: 'Landscape', tier: 'Standar', listPerM2: 80000, floorPerM2: 65000, scope: 'Layout lengkap + planting plan detail + hardscape dasar + 3D realistis + RAB.' },
  { id: 'plan-landscape-premium', category: 'Landscape', tier: 'Premium', listPerM2: 150000, floorPerM2: 120000, scope: 'Masterplan + hardscape & softscape detail + lighting plan + RAB&BOQ + 3D multi-view + garansi 30 hari.' },
  { id: 'plan-renovasi-ekonomi', category: 'Renovasi', tier: 'Ekonomi', listPerM2: 50000, floorPerM2: 40000, scope: 'Survey existing + layout usulan + estimasi kasar.' },
  { id: 'plan-renovasi-standar', category: 'Renovasi', tier: 'Standar', listPerM2: 100000, floorPerM2: 80000, scope: 'Existing drawing + DD + 3D + RAB.' },
  { id: 'plan-renovasi-premium', category: 'Renovasi', tier: 'Premium', listPerM2: 175000, floorPerM2: 140000, scope: 'Existing survey detail + gambar lengkap + detail drawing + RAB&BOQ + 3D + pendampingan + garansi 30 hari.' },
]

export let buildRates: BuildRate[] = [
  { id: 'db-arsitektur-standar', grup: 'Bangunan', category: 'Arsitektur', tier: 'Standar', priceMin: 4500000, priceMax: 5500000, unit: 'm2', notes: 'Rumah keluarga, kost, ruko/kantor' },
  { id: 'db-arsitektur-premium', grup: 'Bangunan', category: 'Arsitektur', tier: 'Premium', priceMin: 6000000, priceMax: 8000000, unit: 'm2', notes: 'Rumah premium, villa, cafe, klinik' },
  { id: 'db-arsitektur-luxury', grup: 'Bangunan', category: 'Arsitektur', tier: 'Luxury', priceMin: 9000000, priceMax: 15000000, unit: 'm2', notes: 'Rumah mewah, resort' },
  { id: 'db-interior-residensial-standar', grup: 'Interior', category: 'Interior (Residensial)', tier: 'Standar', priceMin: 2500000, priceMax: 4500000, unit: 'm2', notes: 'Ceiling, cat, furniture loose, built-in sederhana' },
  { id: 'db-interior-residensial-premium', grup: 'Interior', category: 'Interior (Residensial)', tier: 'Premium', priceMin: 4500000, priceMax: 7500000, unit: 'm2', notes: 'Custom furniture, kitchen set, wardrobe, wall panel' },
  { id: 'db-interior-residensial-luxury', grup: 'Interior', category: 'Interior (Residensial)', tier: 'Luxury', priceMin: 7500000, priceMax: 12000000, unit: 'm2', notes: 'Veneer, marble, solid wood, smart home' },
  { id: 'db-interior-komersial-standar', grup: 'Interior', category: 'Interior (Cafe/Komersial)', tier: 'Standar', priceMin: 3000000, priceMax: 5000000, unit: 'm2', notes: 'Fit-out cafe dasar' },
  { id: 'db-interior-komersial-premium', grup: 'Interior', category: 'Interior (Cafe/Komersial)', tier: 'Premium', priceMin: 5000000, priceMax: 10000000, unit: 'm2', notes: 'Full custom interior cafe' },
  { id: 'db-interior-komersial-luxury', grup: 'Interior', category: 'Interior (Cafe/Komersial)', tier: 'Luxury', priceMin: 10000000, priceMax: 20000000, unit: 'm2', notes: 'Flagship store' },
  { id: 'db-landscape-taman-rumah-standar', grup: 'Landscape', category: 'Landscape (Taman Rumah)', tier: 'Standar', priceMin: 350000, priceMax: 750000, unit: 'm2', notes: 'Rumput, tanaman, stepping stone, lampu sederhana' },
  { id: 'db-landscape-taman-rumah-premium', grup: 'Landscape', category: 'Landscape (Taman Rumah)', tier: 'Premium', priceMin: 750000, priceMax: 2000000, unit: 'm2', notes: 'Hardscape, softscape, lighting, irigasi' },
  { id: 'db-landscape-taman-rumah-luxury', grup: 'Landscape', category: 'Landscape (Taman Rumah)', tier: 'Luxury', priceMin: 2000000, priceMax: 5000000, unit: 'm2', notes: 'Batu alam premium, kolam, decking, smart irrigation' },
  { id: 'db-landscape-taman-villa-standar', grup: 'Landscape', category: 'Landscape (Taman Villa)', tier: 'Standar', priceMin: 750000, priceMax: 1500000, unit: 'm2', notes: 'Tropis, kayu lokal, kolam kecil' },
  { id: 'db-landscape-taman-villa-premium', grup: 'Landscape', category: 'Landscape (Taman Villa)', tier: 'Premium', priceMin: 1500000, priceMax: 3000000, unit: 'm2', notes: 'Hardscape + softscape lengkap' },
  { id: 'db-landscape-taman-villa-luxury', grup: 'Landscape', category: 'Landscape (Taman Villa)', tier: 'Luxury', priceMin: 3000000, priceMax: 6000000, unit: 'm2', notes: 'Infinity, stone wall, smart system' },
  { id: 'db-landscape-kolam-renang-standar', grup: 'Landscape', category: 'Landscape (Kolam Renang)', tier: 'Standar', priceMin: 5000000, priceMax: 8000000, unit: 'm2', notes: 'Kolam standar + filtrasi dasar' },
  { id: 'db-landscape-kolam-renang-premium', grup: 'Landscape', category: 'Landscape (Kolam Renang)', tier: 'Premium', priceMin: 8000000, priceMax: 15000000, unit: 'm2', notes: 'Finishing premium + sistem lengkap' },
  { id: 'db-landscape-kolam-renang-luxury', grup: 'Landscape', category: 'Landscape (Kolam Renang)', tier: 'Luxury', priceMin: 15000000, priceMax: 25000000, unit: 'm2', notes: 'Infinity pool, sistem lengkap' },
]


// ============================================================
// LOAD dari Supabase (fallback ke default bila kosong/error)
// ============================================================
let pricingLoaded = false
export async function loadPricing(force = false): Promise<boolean> {
  if (pricingLoaded && !force) return false
  try {
    const [pr, br, cr] = await Promise.all([
      supabase.from('planning_rates').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
      supabase.from('build_rates').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
      supabase.from('construction_rates').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
    ])
    let changed = false
    if (!pr.error && pr.data && pr.data.length) {
      planningRates = pr.data.map((r: any) => ({
        id: r.id, category: r.category, tier: r.tier,
        listPerM2: Number(r.list_per_m2) || 0, floorPerM2: Number(r.floor_per_m2) || 0, scope: r.scope || '',
      }))
      changed = true
    }
    if (!br.error && br.data && br.data.length) {
      buildRates = br.data.map((r: any) => ({
        id: r.id, grup: r.grup, category: r.category, tier: r.tier,
        priceMin: Number(r.price_min) || 0, priceMax: Number(r.price_max) || 0, unit: r.unit || 'm2', notes: r.notes || '',
      }))
      changed = true
    }
    if (!cr.error && cr.data && cr.data.length) {
      constructionRates = cr.data.map((r: any) => ({
        id: r.id, type: r.type, tier: r.tier,
        priceMin: Number(r.price_per_sqm_min) || 0, priceMax: Number(r.price_per_sqm_max) || 0,
        specification: r.specification || '', notes: r.notes || '',
      }))
      changed = true
    }
    pricingLoaded = true
    return changed
  } catch (e) {
    console.warn('[pricing] gagal load, pakai default:', e)
    return false
  }
}

// ============================================================
// Kalkulator
// ============================================================
/** Diskon maksimum perencanaan = sampai floor (tidak boleh nembus). */
export function maxDiscPlanning(rate: PlanningRate): number {
  if (!rate.listPerM2) return 0
  return Math.max(0, Math.round(((rate.listPerM2 - rate.floorPerM2) / rate.listPerM2) * 100))
}

export interface PlanningCalc {
  listPerM2: number; floorPerM2: number; unitAfterDisc: number
  raw: number; subtotal: number; minOrderApplied: boolean
  discPct: number; maxDisc: number; ppn: number; total: number; scope: string
}

export function calcPlanning(rate: PlanningRate, area: number, discPct: number, ppnOn: boolean): PlanningCalc {
  const maxDisc = maxDiscPlanning(rate)
  const d = Math.min(Math.max(discPct, 0), maxDisc)
  const unitAfterDisc = rate.listPerM2 * (1 - d / 100)
  const raw = unitAfterDisc * (area || 0)
  const subtotal = Math.max(raw, PLAN_MIN_ORDER)
  const ppn = ppnOn ? subtotal * PPN_RATE : 0
  return {
    listPerM2: rate.listPerM2, floorPerM2: rate.floorPerM2, unitAfterDisc,
    raw, subtotal, minOrderApplied: raw < PLAN_MIN_ORDER,
    discPct: d, maxDisc, ppn, total: subtotal + ppn, scope: rate.scope,
  }
}

export interface BuildCalc {
  unit: string; perMin: number; perMax: number
  min: number; max: number; avg: number
  discPct: number; ppn: number; totalMin: number; totalMax: number; totalAvg: number; notes: string
}

export function calcBuild(rate: BuildRate, qty: number, discPct: number, ppnOn: boolean): BuildCalc {
  const d = Math.min(Math.max(discPct, 0), BUILD_MAX_DISC)
  const f = 1 - d / 100
  const min = rate.priceMin * (qty || 0) * f
  const max = rate.priceMax * (qty || 0) * f
  const avg = (min + max) / 2
  const ppn = ppnOn ? avg * PPN_RATE : 0
  return {
    unit: rate.unit, perMin: rate.priceMin, perMax: rate.priceMax,
    min, max, avg, discPct: d, ppn,
    totalMin: min + (ppnOn ? min * PPN_RATE : 0),
    totalMax: max + (ppnOn ? max * PPN_RATE : 0),
    totalAvg: avg + ppn, notes: rate.notes,
  }
}

// ============================================================
// Formatters
// ============================================================
export function formatIDR(num: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0)
}
export function formatIDRShort(num: number): string {
  if (num >= 1_000_000_000) return `Rp ${(num / 1_000_000_000).toFixed(1)}M`
  if (num >= 1_000_000) return `Rp ${Math.round(num / 1_000_000)}jt`
  if (num >= 1_000) return `Rp ${Math.round(num / 1_000)}rb`
  return formatIDR(num)
}

// ============================================================
// ADMIN CRUD — menu Kelola Harga
// ============================================================
const slugId = (s: string) => (s || '').toString().toLowerCase().trim().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '')

export const PricingAdmin = {
  async getPlanning(): Promise<(PlanningRate & { sort_order?: number; is_active?: boolean })[]> {
    const { data, error } = await supabase.from('planning_rates').select('*').order('sort_order', { ascending: true })
    if (error) { console.error('getPlanning:', error); return [] }
    return (data || []).map((r: any) => ({ id: r.id, category: r.category, tier: r.tier, listPerM2: Number(r.list_per_m2) || 0, floorPerM2: Number(r.floor_per_m2) || 0, scope: r.scope || '', sort_order: r.sort_order, is_active: r.is_active }))
  },
  async savePlanning(row: Partial<PlanningRate> & { sort_order?: number; is_active?: boolean }) {
    const id = row.id || `plan-${slugId(row.category || '')}-${slugId(row.tier || '')}` || `plan-${Date.now()}`
    const { error } = await supabase.from('planning_rates').upsert({
      id, category: row.category, tier: row.tier, list_per_m2: row.listPerM2 ?? 0, floor_per_m2: row.floorPerM2 ?? 0,
      scope: row.scope ?? '', sort_order: row.sort_order ?? 0, is_active: row.is_active ?? true, updated_at: new Date().toISOString(),
    })
    if (error) console.error('savePlanning:', error)
    return { error }
  },
  async deletePlanning(id: string) {
    const { error } = await supabase.from('planning_rates').delete().eq('id', id)
    return { error }
  },

  async getBuild(): Promise<(BuildRate & { sort_order?: number; is_active?: boolean })[]> {
    const { data, error } = await supabase.from('build_rates').select('*').order('sort_order', { ascending: true })
    if (error) { console.error('getBuild:', error); return [] }
    return (data || []).map((r: any) => ({ id: r.id, grup: r.grup, category: r.category, tier: r.tier, priceMin: Number(r.price_min) || 0, priceMax: Number(r.price_max) || 0, unit: r.unit || 'm2', notes: r.notes || '', sort_order: r.sort_order, is_active: r.is_active }))
  },
  async saveBuild(row: Partial<BuildRate> & { sort_order?: number; is_active?: boolean }) {
    const id = row.id || `db-${slugId(row.category || '')}-${slugId(row.tier || '')}` || `db-${Date.now()}`
    const { error } = await supabase.from('build_rates').upsert({
      id, grup: row.grup, category: row.category, tier: row.tier, price_min: row.priceMin ?? 0, price_max: row.priceMax ?? 0,
      unit: row.unit ?? 'm2', notes: row.notes ?? '', sort_order: row.sort_order ?? 0, is_active: row.is_active ?? true, updated_at: new Date().toISOString(),
    })
    if (error) console.error('saveBuild:', error)
    return { error }
  },
  async deleteBuild(id: string) {
    const { error } = await supabase.from('build_rates').delete().eq('id', id)
    return { error }
  },
}


// ============================================================
// RAB KONSTRUKSI (biaya borongan all-in pasar — referensi, bukan harga jual)
// ============================================================
export interface ConstructionRate {
  id: string
  type: string // Rumah Tinggal, Ruko / Kios, dst
  tier: string // Ekonomi, Standar, Menengah, Mewah, Luxury, ...
  priceMin: number
  priceMax: number
  specification: string
  notes: string
}

export let constructionRates: ConstructionRate[] = [
  { id: 'rab-rumah-tinggal-ekonomi', type: 'Rumah Tinggal', tier: 'Ekonomi', priceMin: 3000000, priceMax: 4000000, specification: 'Bata merah, keramik standar, cat lokal', notes: 'Type 21-36' },
  { id: 'rab-rumah-tinggal-standar', type: 'Rumah Tinggal', tier: 'Standar', priceMin: 3500000, priceMax: 4500000, specification: 'Bata ringan, granit, cat premium', notes: 'Type 36-70' },
  { id: 'rab-rumah-tinggal-menengah', type: 'Rumah Tinggal', tier: 'Menengah', priceMin: 4500000, priceMax: 5500000, specification: 'Material campuran, plafon gypsum detail', notes: 'Type 70-150' },
  { id: 'rab-rumah-tinggal-mewah', type: 'Rumah Tinggal', tier: 'Mewah', priceMin: 5500000, priceMax: 7500000, specification: 'Material premium sebagian', notes: 'Custom' },
  { id: 'rab-rumah-tinggal-luxury', type: 'Rumah Tinggal', tier: 'Luxury', priceMin: 7500000, priceMax: 12000000, specification: 'Full premium, smart home, material impor', notes: 'Custom' },
  { id: 'rab-ruko-kios-standar', type: 'Ruko / Kios', tier: 'Standar', priceMin: 3500000, priceMax: 5000000, specification: 'Struktur beton, fasad sederhana', notes: '2-3 lantai' },
  { id: 'rab-ruko-kios-premium', type: 'Ruko / Kios', tier: 'Premium', priceMin: 5000000, priceMax: 7000000, specification: 'ACP, kaca tempered, lift opsional', notes: '3-5 lantai' },
  { id: 'rab-cafe-restoran-standar', type: 'Cafe / Restoran', tier: 'Standar', priceMin: 4000000, priceMax: 6000000, specification: 'Partisi, plafon ekspos, lighting dasar', notes: 'Fit-out dasar' },
  { id: 'rab-cafe-restoran-premium', type: 'Cafe / Restoran', tier: 'Premium', priceMin: 7000000, priceMax: 10000000, specification: 'Full custom interior, HVAC, audio system', notes: 'Flagship' },
  { id: 'rab-kantor-standar', type: 'Kantor', tier: 'Standar', priceMin: 3500000, priceMax: 5000000, specification: 'Open plan, raised floor opsional', notes: 'Per m2 lantai' },
  { id: 'rab-kantor-premium', type: 'Kantor', tier: 'Premium', priceMin: 5000000, priceMax: 8000000, specification: 'Full partisi, false ceiling, M&E lengkap', notes: 'Grade A' },
  { id: 'rab-villa-guest-house-standar', type: 'Villa / Guest House', tier: 'Standar', priceMin: 5000000, priceMax: 7000000, specification: 'Tropis, kayu lokal, kolam kecil', notes: '' },
  { id: 'rab-villa-guest-house-premium', type: 'Villa / Guest House', tier: 'Premium', priceMin: 8000000, priceMax: 12000000, specification: 'Infinity pool, stone wall, smart system', notes: '' },
  { id: 'rab-renovasi-parsial-ringan', type: 'Renovasi (Parsial)', tier: 'Ringan', priceMin: 1500000, priceMax: 3000000, specification: 'Cat ulang, keramik, partisi ringan', notes: 'Max 30% area' },
  { id: 'rab-renovasi-parsial-sedang', type: 'Renovasi (Parsial)', tier: 'Sedang', priceMin: 3000000, priceMax: 5000000, specification: 'Bongkar pasang, MEP sebagian', notes: '30-60% area' },
  { id: 'rab-renovasi-total-full-gut', type: 'Renovasi (Total)', tier: 'Full Gut', priceMin: 5000000, priceMax: 8000000, specification: 'Bongkar total hingga struktur', notes: '60-100% area' },
]

export interface ConstructionCalc { perMin: number; perMax: number; min: number; max: number; avg: number }
export function calcConstruction(rate: ConstructionRate, area: number): ConstructionCalc {
  const min = rate.priceMin * (area || 0)
  const max = rate.priceMax * (area || 0)
  return { perMin: rate.priceMin, perMax: rate.priceMax, min, max, avg: (min + max) / 2 }
}

export const ConstructionAdmin = {
  async getAll(): Promise<(ConstructionRate & { sort_order?: number; is_active?: boolean })[]> {
    const { data, error } = await supabase.from('construction_rates').select('*').order('sort_order', { ascending: true })
    if (error) { console.error('construction getAll:', error); return [] }
    return (data || []).map((r: any) => ({ id: r.id, type: r.type, tier: r.tier, priceMin: Number(r.price_per_sqm_min) || 0, priceMax: Number(r.price_per_sqm_max) || 0, specification: r.specification || '', notes: r.notes || '', sort_order: r.sort_order, is_active: r.is_active }))
  },
  async save(row: Partial<ConstructionRate> & { sort_order?: number; is_active?: boolean }) {
    const id = row.id || `rab-${slugId(row.type || '')}-${slugId(row.tier || '')}` || `rab-${Date.now()}`
    const { error } = await supabase.from('construction_rates').upsert({
      id, type: row.type, tier: row.tier, price_per_sqm_min: row.priceMin ?? 0, price_per_sqm_max: row.priceMax ?? 0,
      specification: row.specification ?? '', notes: row.notes ?? '', sort_order: row.sort_order ?? 0, is_active: row.is_active ?? true, updated_at: new Date().toISOString(),
    })
    if (error) console.error('construction save:', error)
    return { error }
  },
  async remove(id: string) {
    const { error } = await supabase.from('construction_rates').delete().eq('id', id)
    return { error }
  },
}
