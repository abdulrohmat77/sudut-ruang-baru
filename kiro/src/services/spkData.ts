// ============================================================
// SPK (Surat Perjanjian Kerja) domain data & helpers
// Sesuai template standalone SPK Generator v2.0
// Mendukung mode plan (9 pasal) & db (14 pasal)
// Konten pasal berbeda per mode × kategori × tier
// ============================================================

export type SpkMode = 'plan' | 'db'

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

export interface SpkPrefill {
  clientName?: string
  clientPhone?: string
  projectName?: string
  jenisPekerjaan?: SpkJenis
  lokasi?: string
  luas?: string
  kategori?: SpkKategori
  programRuang?: string
  totalFee?: number
  durasiBulan?: number
  mode?: SpkMode
  layCategory?: string
  tier?: string
}

export interface InvoiceTerminPrefill {
  label: string
  sub: string
  percent: number
}

export interface InvoicePrefill {
  clientName?: string
  clientPhone?: string
  projectName?: string
  projectType?: string
  location?: string
  area?: string
  contractValue?: number
  termins?: InvoiceTerminPrefill[]
  spkNo?: string
}

export interface ProposalPrefill {
  clientName?: string
  clientPhone?: string
  projectTitle?: string
  feeAmount?: number
  category?: string
  tier?: string
  area?: number
  mode?: 'plan' | 'db' | 'rab'
}

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
  bank: { nama: 'Bank Central Asia (BCA)', rekening: '1300242622', an: 'M. Habib Arrohman I' },
  bankMandiri: { nama: 'Bank Mandiri', rekening: '1270011436225', an: 'M. Habib Arrohman I' },
}

// ── TAHAPAN per (mode, kategori, tier) ──────────────────────
export interface TahapItem { title: string; detail: string }

export const TAHAPAN_BASE: Record<string, Record<string, Record<string, TahapItem[]>>> = {
  plan: {
    Arsitektur: {
      Ekonomi: [
        { title: 'Diskusi Awal & Briefing', detail: 'Diskusi bersama pemilik untuk menentukan arah desain dan program ruang.\nOutput: sketsa layout, gambar ide & usulan (preseden).' },
        { title: 'Layout Denah & Tampak Utama', detail: 'Layout denah (1 opsi) dikembangkan menjadi denah final + tampak utama 1 sisi — Skala 1:100/150.\nCatatan: tidak termasuk potongan, denah atap, design development, atau detail drawing.' },
        { title: 'Perspektif 3D & Estimasi', detail: 'Perspektif 3D eksterior 2–3 view + estimasi biaya kasar (1 halaman) → serah terima file.' },
      ],
      Standar: [
        { title: 'Diskusi Awal & Analisa Site', detail: 'Diskusi program ruang + analisa kondisi site.\nOutput: sketsa layout, sketsa massing sederhana (3D mood images), gambar ide & usulan.' },
        { title: 'Konsep Desain (Schematic)', detail: 'Konsep desain 1–2 opsi (zoning + moodboard).\nDenah skematik, tampak, massing — Skala 1:100/150.' },
        { title: 'Design Development', detail: 'Denah seluruh lantai, tampak 4 sisi, potongan min. 2 arah, denah atap (synced) — Skala 1:100/150.\n3D eksterior resolusi tinggi, RAB estimasi (XLSX + PDF), material board.' },
        { title: 'Penyerahan Dokumen', detail: 'Finalisasi & serah terima dokumen (DWG + PDF + XLSX).\nCatatan: tidak termasuk detail drawing untuk kontraktor & pendampingan lapangan.' },
      ],
      Premium: [
        { title: 'Diskusi Awal', detail: 'Diskusi bersama pemilik untuk menentukan arah desain dan program ruang.\nOutput: Sketsa denah / layout, sketsa massing sederhana (3D mood images), gambar ide & usulan (preseden).' },
        { title: 'Perencanaan Schematic (ARS)', detail: 'Denah teknik — Skala 1:100/150\nTampak — Skala 1:100/150\nPotongan sumbu X & Y — Skala 1:100/150\nRencana atap — Skala 1:100/150\nPerspektif 3D — Skala bebas' },
        { title: 'Design Development (ARS)', detail: 'Denah, Tampak, Potongan X & Y (synced) — Skala 1:100/150\nRencana atap (synced) — Skala 1:100/150\nDetail tangga (synced) — Skala 1:25 / 1:50\nCatatan: Tidak ada perubahan desain mayor pada tahap ini. Gambar dapat digunakan untuk pengurusan IMB/PBG.' },
        { title: 'Detail Drawing (ARS) & RAB', detail: 'Rencana pola lantai — Skala 1:100\nRencana plafon & titik lampu — Skala 1:100\nRencana stop kontak & elektrikal — Skala 1:100\nDetail railing & tangga — Skala 1:25, 1:20\nDetail kamar mandi & WC — Skala 1:25\nDetail fasad tampak — Skala 1:50\nRencana kusen, daun pintu & jendela — Skala 1:50, 1:20\nRencana Anggaran Biaya (RAB)' },
        { title: 'Pendampingan Lapangan (Field/ARS)', detail: 'PIHAK KEDUA menerbitkan Minutes of Meeting (MOM) setiap pertemuan.\nApabila dalam 14 hari kerja tidak ada tanggapan koreksi atas MOM, isi MOM dianggap disetujui.\nPIHAK KEDUA memegang hak kekayaan intelektual atas seluruh produk perencanaan.' },
      ],
    },
    Interior: {
      Ekonomi: [
        { title: 'Briefing & Survey Ruang', detail: 'Diskusi kebutuhan, gaya hidup, dan referensi visual. Pengukuran ruang existing.' },
        { title: 'Moodboard & Furniture Layout', detail: 'Moodboard arah gaya + layout furniture per ruang.' },
        { title: '3D Sederhana & Estimasi', detail: '3D sederhana 1–2 view + estimasi biaya kasar → serah terima file.' },
      ],
      Standar: [
        { title: 'Briefing & Survey Ruang', detail: 'Diskusi kebutuhan, gaya hidup, dan referensi visual. Pengukuran ruang existing.' },
        { title: 'Konsep & Moodboard', detail: 'Konsep ruang, palet material, arah gaya, dan moodboard + concept board.' },
        { title: 'Furniture Layout & Material Schedule', detail: 'Furniture layout semua ruang, material & furniture schedule, gambar interior (tampak ruang + denah furniture).' },
        { title: '3D Realistis & RAB', detail: '3D realistis per ruang kunci + RAB estimasi → serah terima.\nCatatan: tidak termasuk shop drawing furnitur custom & pendampingan.' },
      ],
      Premium: [
        { title: 'Briefing & Survey Ruang', detail: 'Diskusi kebutuhan, gaya hidup, dan referensi visual. Pengukuran ruang existing.' },
        { title: 'Konsep & Moodboard', detail: 'Konsep ruang, palet material, arah gaya, dan moodboard + concept board.' },
        { title: 'Furniture Layout & Material Schedule', detail: 'Layout furniture menyeluruh, material & furniture schedule, gambar interior (tampak + denah).' },
        { title: 'Shop Drawing & 3D Realistis', detail: 'Shop drawing furniture custom (kitchen set, wardrobe, built-in), 3D realistis multi-ruang, BOQ detail.' },
        { title: 'Pendampingan & Garansi', detail: 'Pendampingan pelaksanaan, rekomendasi vendor, garansi konsultasi 30 hari.' },
      ],
    },
    Landscape: {
      Ekonomi: [
        { title: 'Survey Tapak', detail: 'Survey existing & pengukuran sederhana.' },
        { title: 'Layout Taman & Planting Plan Dasar', detail: 'Layout taman sederhana + planting plan dasar.' },
        { title: '3D Sederhana & Estimasi', detail: '3D sederhana + estimasi biaya kasar → serah terima file.' },
      ],
      Standar: [
        { title: 'Survey Tapak & Analisa', detail: 'Survey existing, pengukuran, analisa orientasi & drainase.' },
        { title: 'Konsep & Layout Taman', detail: 'Konsep + layout taman lengkap (zoning + sirkulasi).' },
        { title: 'Planting Plan & Hardscape Dasar', detail: 'Planting plan detail + hardscape dasar (jalan setapak, stepping stone, area duduk).' },
        { title: '3D Realistis & RAB', detail: '3D realistis + RAB estimasi → serah terima.\nCatatan: tidak termasuk lighting plan detail & pendampingan.' },
      ],
      Premium: [
        { title: 'Survey Tapak & Analisa Iklim Mikro', detail: 'Survey existing, pengukuran, analisa orientasi, drainase, dan iklim mikro.' },
        { title: 'Masterplan Lanskap & Konsep', detail: 'Zoning, sirkulasi, masterplan + konsep + moodboard.' },
        { title: 'Hardscape & Softscape Detail', detail: 'Hardscape detail, softscape detail (planting plan berlapis), lighting plan.' },
        { title: 'RAB/BOQ & 3D Realistis', detail: 'RAB + BOQ detail, 3D realistis multi-view.' },
        { title: 'Pendampingan Material & Garansi', detail: 'Pendampingan pemilihan material/tanaman, garansi konsultasi 30 hari.' },
      ],
    },
    Renovasi: {
      Ekonomi: [
        { title: 'Survey Existing & Diagnosa', detail: 'Survey existing sederhana (foto + sketsa).' },
        { title: 'Layout Usulan', detail: 'Layout usulan (denah perubahan).' },
        { title: 'Estimasi & Penyerahan', detail: 'Estimasi biaya kasar → serah terima file.' },
      ],
      Standar: [
        { title: 'Survey Existing (Gambar Ukur)', detail: 'Existing drawing (gambar ukur) eksisting.' },
        { title: 'Design Development', detail: 'Design Development: denah usulan + tampak.' },
        { title: '3D & RAB', detail: '3D hasil renovasi + RAB.' },
        { title: 'Penyerahan Dokumen', detail: 'Serah terima dokumen final.\nCatatan: tidak termasuk detail drawing menyeluruh & pendampingan lapangan.' },
      ],
      Premium: [
        { title: 'Survey Existing Detail & Diagnosa', detail: 'Survey eksisting detail (foto + ukur), diagnosa kondisi struktur & kelembapan.' },
        { title: 'Usulan Desain Arsitektur Lengkap', detail: 'Gambar arsitektur lengkap usulan (denah, tampak, potongan baru).' },
        { title: 'Detail Drawing Elemen yang Diubah & 3D', detail: 'Detail teknis bagian renovasi + 3D realistis.' },
        { title: 'RAB / BOQ Renovasi', detail: 'RAB + BOQ renovasi (XLSX + PDF).' },
        { title: 'Pendampingan Lapangan & Garansi', detail: 'Pendampingan pelaksanaan renovasi + garansi konsultasi 30 hari.' },
      ],
    },
  },
  db: {
    Arsitektur: {
      Standar: [
        { title: 'Fase Desain (Konsep → DD → Gambar Kerja → RAB/BOQ)', detail: 'Tanda tangan SPK → mulai fase desain. Desain final & RAB/BOQ disetujui sebelum mobilisasi.' },
        { title: 'Mobilisasi & Pekerjaan Persiapan', detail: 'Mobilisasi material & tim, pekerjaan persiapan, pondasi.' },
        { title: 'Progres 30% — Struktur', detail: 'Sloof, kolom, balok, sebagian dinding (beton bertulang + footplat).' },
        { title: 'Progres 60% — Atap & MEP Roughing-in', detail: 'Dinding selesai, atap genteng, MEP roughing-in (listrik 3500–5500 VA), kusen.' },
        { title: 'Progres 90% — Finishing', detail: 'Finishing lantai granit tile, plafon gypsum/GRC, cat weathershield, sanitair, MEP.' },
        { title: 'BAST — Serah Terima', detail: 'Serah terima akhir, as-built drawing, sertifikat garansi, manual material. Retensi cair setelah masa garansi (min. 30 hari).' },
      ],
      Premium: [
        { title: 'Fase Desain (Konsep → DD → Detail Drawing → RAB/BOQ)', detail: 'Tanda tangan SPK → mulai fase desain + detail drawing elemen custom. Desain final disetujui sebelum mobilisasi.' },
        { title: 'Mobilisasi & Pekerjaan Persiapan', detail: 'Mobilisasi material & tim, pekerjaan persiapan, pondasi.' },
        { title: 'Progres 30% — Struktur', detail: 'Struktur beton bertulang penuh: sloof, kolom, balok, sebagian dinding.' },
        { title: 'Progres 60% — Atap & MEP', detail: 'Dinding selesai, atap, MEP AC ducting (listrik 7700 VA+), kusen aluminium powder coating.' },
        { title: 'Progres 90% — Finishing Premium', detail: 'Finishing marmer lokal / kayu solid / batu alam, plafon GRC + drop ceiling, fasad custom.' },
        { title: 'BAST — Serah Terima', detail: 'Serah terima + as-built + sertifikat garansi diperpanjang + manual material. Retensi cair setelah masa garansi.' },
      ],
      Luxury: [
        { title: 'Fase Desain Menyeluruh & Sourcing Material', detail: 'Tanda tangan SPK → fase desain lengkap + detail drawing menyeluruh + sourcing material impor.' },
        { title: 'Mobilisasi & Pekerjaan Persiapan', detail: 'Mobilisasi material impor & tim, pekerjaan persiapan, pondasi.' },
        { title: 'Progres 30% — Struktur (QC Berlapis)', detail: 'Struktur beton bertulang dengan QC zero-defect berlapis.' },
        { title: 'Progres 60% — Atap & MEP Lengkap', detail: 'Atap + MEP lengkap (VRV AC, STP, genset), fasad custom (ACP, structural glazing).' },
        { title: 'Progres 90% — Finishing Impor & Smart Home', detail: 'Finishing material impor (marmer Italia, kayu teak grade A) + smart home terintegrasi.' },
        { title: 'BAST + Handover', detail: 'Serah terima + dokumentasi material + garansi extended + sesi handover.' },
      ],
    },
    Interior: {
      Standar: [
        { title: 'Fase Desain (Konsep → DD → Gambar Kerja → RAB/BOQ)', detail: 'Tanda tangan SPK → mulai fase desain interior. Desain final + RAB/BOQ disetujui sebelum produksi.' },
        { title: 'Mobilisasi & Persiapan', detail: 'Mobilisasi tim, pengukuran ulang area, persiapan.' },
        { title: 'Progres 30% — Produksi', detail: 'Produksi furnitur loose + built-in sederhana + pekerjaan plafon & dinding.' },
        { title: 'Progres 60% — Instalasi', detail: 'Instalasi furnitur + lighting standar + finishing dinding.' },
        { title: 'Progres 90% — Finishing', detail: 'Finishing detail + pengecatan.' },
        { title: 'BAST — Serah Terima', detail: 'Serah terima akhir, as-built, sertifikat garansi, manual material. Retensi cair setelah masa garansi (min. 30 hari).' },
      ],
      Premium: [
        { title: 'Fase Desain (Konsep → DD → Detail Drawing → RAB/BOQ)', detail: 'Tanda tangan SPK → mulai fase desain interior + detail drawing custom. Desain final disetujui sebelum produksi.' },
        { title: 'Mobilisasi & Persiapan', detail: 'Mobilisasi tim, pengukuran ulang area, persiapan.' },
        { title: 'Progres 30% — Produksi', detail: 'Produksi furnitur custom (kitchen set, wardrobe) + plafon & dinding.' },
        { title: 'Progres 60% — Instalasi', detail: 'Instalasi furnitur + wall panel dekoratif + decorative lighting.' },
        { title: 'Progres 90% — Finishing Premium & Styling', detail: 'Finishing premium (veneer / HPL premium) + styling.' },
        { title: 'BAST — Serah Terima', detail: 'Serah terima + as-built + garansi diperpanjang + manual material.' },
      ],
      Luxury: [
        { title: 'Fase Desain Menyeluruh & Sourcing Material', detail: 'Tanda tangan SPK → fase desain menyeluruh + detail drawing + sourcing material premium.' },
        { title: 'Mobilisasi & Persiapan', detail: 'Mobilisasi tim, pengukuran ulang area, persiapan.' },
        { title: 'Progres 30% — Produksi', detail: 'Produksi furnitur custom grade tinggi + plafon & dinding.' },
        { title: 'Progres 60% — Instalasi & Smart Home', detail: 'Instalasi furnitur + smart home interior terintegrasi.' },
        { title: 'Progres 90% — Finishing Premium & Styling', detail: 'Finishing material premium (veneer, marble, solid wood) + QC presisi + styling akhir.' },
        { title: 'BAST + Handover', detail: 'Serah terima + dokumentasi material + garansi extended + sesi handover.' },
      ],
    },
    Landscape: {
      Standar: [
        { title: 'Fase Desain (Konsep → DD → RAB/BOQ)', detail: 'Tanda tangan SPK → desain lanskap + RAB/BOQ final sebagai dasar kontrak.' },
        { title: 'Mobilisasi & Pekerjaan Tanah', detail: 'Mobilisasi, pekerjaan tanah, persiapan lahan.' },
        { title: 'Progres 30% — Hardscape Dasar', detail: 'Pekerjaan tanah, stepping stone / paving sederhana.' },
        { title: 'Progres 60% — Softscape & Sistem', detail: 'Penanaman rumput & tanaman, lampu taman sederhana.' },
        { title: 'Progres 90% — Finishing', detail: 'Finishing, penyempurnaan, pembersihan akhir.' },
        { title: 'BAST — Serah Terima', detail: 'Serah terima, as-built, sertifikat garansi. Retensi cair setelah masa garansi (min. 30 hari).' },
      ],
      Premium: [
        { title: 'Fase Desain (Konsep → DD → RAB/BOQ)', detail: 'Tanda tangan SPK → desain + detail hardscape & softscape + RAB/BOQ final.' },
        { title: 'Mobilisasi & Pekerjaan Tanah', detail: 'Mobilisasi, pekerjaan tanah, persiapan lahan.' },
        { title: 'Progres 30% — Hardscape Struktural', detail: 'Hardscape struktural (batu alam, decking, paving).' },
        { title: 'Progres 60% — Softscape & Sistem', detail: 'Softscape berlapis, instalasi irigasi & lighting.' },
        { title: 'Progres 90% — Finishing', detail: 'Finishing, penyempurnaan, pembersihan akhir.' },
        { title: 'BAST — Serah Terima', detail: 'Serah terima, as-built, sertifikat garansi. Retensi cair setelah masa garansi.' },
      ],
      Luxury: [
        { title: 'Fase Desain Detail & Sourcing Material', detail: 'Tanda tangan SPK → masterplan lanskap detail + sourcing material premium + RAB/BOQ.' },
        { title: 'Mobilisasi & Pekerjaan Tanah', detail: 'Mobilisasi, pekerjaan tanah, persiapan lahan.' },
        { title: 'Progres 30% — Hardscape Premium & Water Feature', detail: 'Struktur water feature, batu alam premium, kolam, decking.' },
        { title: 'Progres 60% — Softscape & Smart System', detail: 'Softscape + smart irrigation system + lighting system terintegrasi.' },
        { title: 'Progres 90% — Finishing', detail: 'Finishing & penyempurnaan.' },
        { title: 'BAST + Handover', detail: 'Serah terima + dokumentasi + garansi extended + sesi handover.' },
      ],
    },
  },
}

// ── SCOPE INCLUDE per (mode, kategori, tier) ────────────────
export const SCOPE_INC: Record<string, Record<string, Record<string, string[]>>> = {
  plan: {
    Arsitektur: {
      Ekonomi: ['Diskusi kebutuhan & briefing', 'Layout denah (1 opsi) + denah final', 'Tampak utama 1 sisi', 'Perspektif 3D eksterior 2–3 view', 'Estimasi biaya kasar (1 halaman)'],
      Standar: ['Analisa kondisi site', 'Konsep desain 1–2 opsi (zoning + moodboard)', 'Denah seluruh lantai (PDF + DWG)', 'Tampak 4 sisi + material', 'Potongan min. 2 arah', 'Denah atap', 'Design Development', '3D eksterior resolusi tinggi', 'RAB estimasi (XLSX + PDF)', 'Material board'],
      Premium: ['Analisa kondisi site', 'Perencanaan arsitektur: Skematik → Design Development → Detail Drawing', 'Denah, tampak 4 sisi, potongan, atap, plafon, pola lantai', 'Detail drawing elemen custom', 'Schedule pintu & jendela', '3D realistis multi-view (eksterior + interior kunci)', 'RAB + BOQ detail', 'Pendampingan lapangan (3× kunjungan)', 'Garansi konsultasi 30 hari'],
    },
    Interior: {
      Ekonomi: ['Moodboard', 'Layout furniture per ruang', '3D sederhana 1–2 view', 'Estimasi biaya kasar'],
      Standar: ['Moodboard + concept board', 'Furniture layout semua ruang', 'Gambar interior (tampak ruang + denah furniture)', 'Material & furniture schedule', '3D realistis per ruang kunci', 'RAB estimasi'],
      Premium: ['Moodboard + concept board', 'Furniture layout menyeluruh', 'Material & furniture schedule', 'Shop drawing furniture custom (kitchen set, wardrobe, built-in)', '3D realistis multi-ruang', 'BOQ detail', 'Rekomendasi vendor', 'Garansi konsultasi 30 hari'],
    },
    Landscape: {
      Ekonomi: ['Layout taman sederhana', 'Planting plan dasar', '3D sederhana', 'Estimasi biaya kasar'],
      Standar: ['Konsep + layout taman lengkap', 'Planting plan detail', 'Hardscape dasar (jalan setapak, stepping stone, area duduk)', '3D realistis', 'RAB estimasi'],
      Premium: ['Masterplan lanskap', 'Hardscape detail', 'Softscape detail (skema tanaman berlapis)', 'Lighting plan', 'RAB + BOQ detail', '3D realistis multi-view', 'Pendampingan pemilihan material', 'Garansi konsultasi 30 hari'],
    },
    Renovasi: {
      Ekonomi: ['Survey existing sederhana (foto + sketsa)', 'Layout usulan (denah perubahan)', 'Estimasi biaya kasar'],
      Standar: ['Existing drawing (gambar ukur)', 'Design Development (denah usulan + tampak)', '3D hasil renovasi', 'RAB'],
      Premium: ['Existing survey detail', 'Gambar arsitektur lengkap usulan (denah, tampak, potongan)', 'Detail drawing elemen yang diubah', 'RAB + BOQ', '3D realistis', 'Pendampingan lapangan', 'Garansi konsultasi 30 hari'],
    },
  },
  db: {
    Arsitektur: {
      Standar: ['Desain: konsep + DD + gambar kerja + RAB/BOQ', 'Struktur beton bertulang + footplat', 'Dinding bata ringan/merah + plester aci', 'Lantai granit tile 60×60 / 80×80', 'Atap genteng keramik / beton flat', 'Kusen aluminium / kayu solid', 'Sanitair Toto / American Standard', 'Plafon gypsum / GRC', 'MEP standar (listrik 3500–5500 VA)', 'Cat weathershield eksterior + interior'],
      Premium: ['Desain + detail drawing elemen custom', 'Struktur beton bertulang penuh', 'Finishing marmer lokal / kayu solid / batu alam', 'Kusen aluminium powder coating', 'Sanitair setara Kohler', 'Plafon GRC + drop ceiling dekoratif', 'MEP AC ducting (listrik 7700 VA+)', 'Fasad custom'],
      Luxury: ['Desain lengkap + detail drawing menyeluruh', 'Material impor (marmer Italia, kayu teak grade A)', 'Smart home terintegrasi', 'Fasad custom penuh (ACP, structural glazing)', 'MEP lengkap (VRV AC, STP, genset)', 'QC zero-defect berlapis'],
    },
    Interior: {
      Standar: ['Desain interior + RAB/BOQ (dasar nilai kontrak)', 'Plafon gypsum/GRC + pengecatan', 'Furniture loose + built-in sederhana', 'Lighting standar', 'Finishing dinding', 'Koordinasi & pelaksanaan tukang'],
      Premium: ['Desain + detail drawing custom', 'Custom furniture: kitchen set, wardrobe', 'Wall panel dekoratif + decorative lighting', 'Produksi furnitur custom + instalasi', 'Finishing premium (veneer / HPL premium)', 'Koordinasi & QC pelaksanaan'],
      Luxury: ['Desain menyeluruh + detail drawing', 'Material premium (veneer, marble, solid wood)', 'Smart home interior terintegrasi', 'Custom furniture grade tinggi', 'QC presisi + styling akhir', 'Dokumentasi material'],
    },
    Landscape: {
      Standar: ['Desain lanskap + RAB/BOQ (dasar nilai kontrak)', 'Rumput + tanaman + pengadaan material', 'Stepping stone / paving sederhana', 'Lampu taman sederhana', 'Pengerjaan hardscape & softscape', 'Pembersihan akhir'],
      Premium: ['Desain + detail hardscape & softscape', 'Hardscape (batu alam, decking)', 'Softscape berlapis', 'Instalasi lighting & irigasi', 'Pengadaan material & tanaman', 'Pembersihan akhir'],
      Luxury: ['Masterplan lanskap detail', 'Batu alam premium + kolam + decking', 'Smart irrigation system', 'Lighting system terintegrasi', 'Pekerjaan struktur water feature', 'Finishing & penyempurnaan'],
    },
  },
}

// ── SCOPE EXCLUDE per (mode, kategori, tier) ────────────────
export const SCOPE_EXC: Record<string, Record<string, Record<string, string[]>>> = {
  plan: {
    Arsitektur: {
      Ekonomi: ['Detail drawing', 'RAB formal', 'Potongan', 'Denah atap/plafon', 'Pendampingan lapangan', 'Pengurusan izin (PBG)'],
      Standar: ['Pengurusan perizinan (IMB/PBG)', 'Pengukuran & survei lahan', 'Tes tanah (soil investigation)', 'Shop drawing untuk kontraktor', 'As-built drawing', 'Penjadwalan pelaksanaan lapangan (time table)'],
      Premium: ['Pengurusan perizinan (IMB/PBG)', 'Pengukuran & survei lahan', 'Tes tanah (soil investigation)', 'Shop drawing untuk kontraktor', 'As-built drawing', 'Graphic design (logo, signage, dll.)', 'Penjadwalan pelaksanaan lapangan (time table)'],
    },
    Interior: {
      Ekonomi: ['RAB formal', 'Shop drawing', 'Material schedule detail', 'Pelaksanaan / produksi', 'Pengadaan material & furnitur'],
      Standar: ['Pelaksanaan / produksi furnitur', 'Pengadaan material & furnitur', 'Pekerjaan struktural'],
      Premium: ['Pelaksanaan / produksi furnitur', 'Pengadaan material & furnitur', 'Pekerjaan struktural'],
    },
    Landscape: {
      Ekonomi: ['RAB formal', 'Pelaksanaan & penanaman', 'Pengadaan tanaman & material'],
      Standar: ['Pelaksanaan & penanaman', 'Pengadaan tanaman & material', 'Maintenance'],
      Premium: ['Pelaksanaan & penanaman', 'Pengadaan material', 'Maintenance pasca serah terima (paket terpisah)'],
    },
    Renovasi: {
      Ekonomi: ['RAB formal', 'Detail drawing', 'Pelaksanaan konstruksi'],
      Standar: ['Pelaksanaan konstruksi', 'Pengurusan izin (PBG)'],
      Premium: ['Pelaksanaan konstruksi', 'Pengurusan izin (PBG) — add-on'],
    },
  },
  db: {
    Arsitektur: {
      Standar: ['Tanah', 'PBG / perizinan', 'Sambungan PLN / PDAM baru', 'Furnitur lepas', 'AC', 'Landscape', 'Pagar'],
      Premium: ['Tanah', 'PBG / perizinan', 'Sambungan PLN / PDAM baru', 'Furnitur lepas', 'Landscape (paket terpisah)', 'Pagar custom'],
      Luxury: ['Tanah', 'PBG / perizinan', 'Sambungan PLN / PDAM baru', 'Furnitur lepas', 'Landscape premium (paket terpisah)'],
    },
    Interior: {
      Standar: ['Furnitur loose beli jadi (kecuali disepakati)', 'Peralatan elektronik', 'Pekerjaan struktur bangunan', 'PBG / perizinan'],
      Premium: ['Furnitur loose beli jadi (kecuali disepakati)', 'Peralatan elektronik', 'Peralatan dapur komersial', 'Pekerjaan struktur bangunan'],
      Luxury: ['Furnitur loose beli jadi (kecuali disepakati)', 'Peralatan elektronik khusus', 'Pekerjaan struktur bangunan'],
    },
    Landscape: {
      Standar: ['Maintenance pasca serah terima (paket terpisah)', 'Perbaikan struktur eksisting', 'PBG / perizinan'],
      Premium: ['Maintenance pasca serah terima (paket terpisah)', 'Perbaikan struktur eksisting', 'Sambungan utilitas baru'],
      Luxury: ['Maintenance pasca serah terima (paket terpisah)', 'Perbaikan struktur eksisting', 'Sambungan utilitas baru'],
    },
  },
}

// ── TERMIN per (mode, kategori, tier) ───────────────────────
export interface TerminItem { label: string; pct: number; trigger: string }

export const TERMIN_BASE: Record<string, Record<string, Record<string, TerminItem[]>>> = {
  plan: {
    Arsitektur: {
      Ekonomi: [
        { label: 'Down Payment / Uang Muka', pct: 40, trigger: 'Tanda tangan SPK → mulai briefing & layout denah (1 opsi)' },
        { label: 'Termin 1 — Denah Final', pct: 30, trigger: 'Denah final + tampak utama disetujui' },
        { label: 'Termin 2 — Penyerahan', pct: 30, trigger: '2–3 perspektif 3D + estimasi kasar → serah terima file' },
      ],
      Standar: [
        { label: 'Down Payment / Uang Muka', pct: 30, trigger: 'Tanda tangan SPK → mulai pengembangan konsep' },
        { label: 'Termin 1 — Konsep', pct: 30, trigger: 'Konsep (1–2 opsi) + zoning + moodboard disetujui' },
        { label: 'Termin 2 — Design Development', pct: 30, trigger: 'Design Development disetujui: denah lengkap, tampak 4 sisi, potongan, denah atap, 3D, RAB, material board' },
        { label: 'Termin 3 — Penyerahan', pct: 10, trigger: 'Serah terima dokumen final (DWG + PDF + XLSX)' },
      ],
      Premium: [
        { label: 'Down Payment / Uang Muka', pct: 30, trigger: 'Tanda tangan SPK → survey + mulai konsep' },
        { label: 'Termin 1 — Schematic & Design Development (ARS)', pct: 30, trigger: 'Penyelesaian Tahap 2 & 3A: konsep disetujui + DD (denah, tampak, potongan, atap, plafon, pola lantai, 3D)' },
        { label: 'Termin 2 — Detail Drawing (ARS) & RAB', pct: 30, trigger: 'Penyelesaian Tahap 3B: detail drawing + RAB & BOQ + schedule pintu/jendela + 3D realistis final' },
        { label: 'Termin 3 — Pendampingan', pct: 10, trigger: 'Pendampingan lapangan / penyerahan akhir + mulai garansi konsultasi 30 hari' },
      ],
    },
    Interior: {
      Ekonomi: [
        { label: 'Down Payment', pct: 30, trigger: 'Tanda tangan SPK → moodboard' },
        { label: 'Termin 1 — Layout', pct: 40, trigger: 'Layout furniture disetujui' },
        { label: 'Termin 2 — Penyerahan', pct: 30, trigger: '3D sederhana + estimasi kasar → serah terima' },
      ],
      Standar: [
        { label: 'Down Payment', pct: 30, trigger: 'Tanda tangan SPK → moodboard + concept board' },
        { label: 'Termin 1 — Layout & Schedule', pct: 30, trigger: 'Furniture layout + gambar interior + material schedule disetujui' },
        { label: 'Termin 2 — 3D & RAB', pct: 30, trigger: '3D realistis per ruang + RAB estimasi' },
        { label: 'Termin 3 — Penyerahan', pct: 10, trigger: 'Serah terima dokumen final' },
      ],
      Premium: [
        { label: 'Down Payment', pct: 30, trigger: 'Tanda tangan SPK → concept + moodboard' },
        { label: 'Termin 1 — Layout & Schedule', pct: 25, trigger: 'Furniture layout + material schedule + gambar interior' },
        { label: 'Termin 2 — 3D Multi-ruang', pct: 25, trigger: '3D realistis multi-ruang disetujui' },
        { label: 'Termin 3 — Shop Drawing & BOQ', pct: 15, trigger: 'Shop drawing custom + BOQ detail + rekomendasi vendor' },
        { label: 'Termin 4 — Penyerahan', pct: 5, trigger: 'Serah terima + mulai garansi konsultasi 30 hari' },
      ],
    },
    Landscape: {
      Ekonomi: [
        { label: 'Down Payment', pct: 40, trigger: 'Tanda tangan SPK → layout taman + planting plan dasar' },
        { label: 'Termin 1 — 3D', pct: 40, trigger: '3D sederhana disetujui' },
        { label: 'Termin 2 — Penyerahan', pct: 20, trigger: 'Estimasi kasar → serah terima' },
      ],
      Standar: [
        { label: 'Down Payment', pct: 30, trigger: 'Tanda tangan SPK → konsep + layout taman' },
        { label: 'Termin 1 — Planting & Hardscape', pct: 30, trigger: 'Planting plan detail + hardscape dasar' },
        { label: 'Termin 2 — 3D & RAB', pct: 30, trigger: '3D realistis + RAB estimasi' },
        { label: 'Termin 3 — Penyerahan', pct: 10, trigger: 'Serah terima dokumen final' },
      ],
      Premium: [
        { label: 'Down Payment', pct: 30, trigger: 'Tanda tangan SPK → masterplan + konsep' },
        { label: 'Termin 1 — Hardscape & Softscape', pct: 25, trigger: 'Hardscape & softscape detail disetujui' },
        { label: 'Termin 2 — Lighting & 3D', pct: 25, trigger: 'Lighting plan + 3D multi-view' },
        { label: 'Termin 3 — RAB & BOQ', pct: 15, trigger: 'RAB & BOQ detail' },
        { label: 'Termin 4 — Pendampingan', pct: 5, trigger: 'Serah terima + pendampingan material + garansi 30 hari' },
      ],
    },
    Renovasi: {
      Ekonomi: [
        { label: 'Down Payment', pct: 40, trigger: 'Tanda tangan SPK → survey existing + layout usulan' },
        { label: 'Termin 1 — Usulan Disetujui', pct: 40, trigger: 'Gambar usulan disetujui' },
        { label: 'Termin 2 — Penyerahan', pct: 20, trigger: 'Estimasi kasar → serah terima' },
      ],
      Standar: [
        { label: 'Down Payment', pct: 30, trigger: 'Tanda tangan SPK → existing drawing (gambar ukur)' },
        { label: 'Termin 1 — Design Development', pct: 30, trigger: 'Design Development (denah usulan + tampak)' },
        { label: 'Termin 2 — 3D & RAB', pct: 30, trigger: '3D + RAB' },
        { label: 'Termin 3 — Penyerahan', pct: 10, trigger: 'Serah terima dokumen final' },
      ],
      Premium: [
        { label: 'Down Payment', pct: 30, trigger: 'Tanda tangan SPK → existing survey detail' },
        { label: 'Termin 1 — Usulan Arsitektur', pct: 25, trigger: 'Gambar arsitektur lengkap usulan' },
        { label: 'Termin 2 — Detail & 3D', pct: 25, trigger: 'Detail drawing elemen yang diubah + 3D' },
        { label: 'Termin 3 — RAB & BOQ', pct: 15, trigger: 'RAB & BOQ' },
        { label: 'Termin 4 — Pendampingan', pct: 5, trigger: 'Serah terima + pendampingan + garansi 30 hari' },
      ],
    },
  },
  db: {
    Arsitektur: {
      Standar: [
        { label: 'DP', pct: 20, trigger: 'Tanda tangan SPK → mulai fase desain (konsep → DD → gambar kerja → RAB/BOQ final)' },
        { label: 'Mobilisasi', pct: 20, trigger: 'Desain final disetujui → mobilisasi material & tim, pekerjaan persiapan, pondasi' },
        { label: 'Progres 30%', pct: 25, trigger: 'Verifikasi progres 30% — struktur: sloof, kolom, balok, sebagian dinding' },
        { label: 'Progres 60%', pct: 20, trigger: 'Verifikasi progres 60% — dinding selesai, atap, MEP roughing-in, kusen' },
        { label: 'Progres 90%', pct: 10, trigger: 'Verifikasi progres 90% — finishing: lantai, plafon, cat, sanitair, MEP' },
        { label: 'BAST', pct: 5, trigger: 'Serah terima akhir — as-built + sertifikat garansi + manual. Retensi cair setelah masa garansi (min. 30 hari)' },
      ],
      Premium: [
        { label: 'DP', pct: 20, trigger: 'Tanda tangan SPK → mulai fase desain' },
        { label: 'Mobilisasi', pct: 20, trigger: 'Desain final disetujui → mobilisasi' },
        { label: 'Progres 30%', pct: 25, trigger: 'Verifikasi progres 30% — struktur' },
        { label: 'Progres 60%', pct: 20, trigger: 'Verifikasi progres 60% — atap & MEP' },
        { label: 'Progres 90%', pct: 10, trigger: 'Verifikasi progres 90% — finishing premium' },
        { label: 'BAST', pct: 5, trigger: 'Serah terima + as-built + garansi diperpanjang + manual material' },
      ],
      Luxury: [
        { label: 'DP', pct: 20, trigger: 'Tanda tangan SPK → mulai fase desain menyeluruh' },
        { label: 'Mobilisasi', pct: 20, trigger: 'Desain final + sourcing material impor → mobilisasi' },
        { label: 'Progres 30%', pct: 25, trigger: 'Verifikasi progres 30% — struktur dengan QC berlapis' },
        { label: 'Progres 60%', pct: 20, trigger: 'Verifikasi progres 60% — atap + MEP lengkap (VRV/STP/genset)' },
        { label: 'Progres 90%', pct: 10, trigger: 'Verifikasi progres 90% — finishing material impor + smart home' },
        { label: 'BAST + Handover', pct: 5, trigger: 'Serah terima + dokumentasi material + garansi extended + sesi handover' },
      ],
    },
    Interior: {
      Standar: [
        { label: 'DP', pct: 20, trigger: 'Tanda tangan SPK → mulai fase desain interior (konsep → DD → gambar kerja → RAB/BOQ)' },
        { label: 'Mobilisasi', pct: 20, trigger: 'Desain final disetujui → mobilisasi tim & persiapan area' },
        { label: 'Progres 30%', pct: 25, trigger: 'Verifikasi progres 30% — produksi furnitur custom + plafon/dinding' },
        { label: 'Progres 60%', pct: 20, trigger: 'Verifikasi progres 60% — instalasi furnitur + lighting + finishing dasar' },
        { label: 'Progres 90%', pct: 10, trigger: 'Verifikasi progres 90% — finishing detail + styling' },
        { label: 'BAST', pct: 5, trigger: 'Serah terima + as-built + sertifikat garansi. Retensi cair setelah masa garansi (min. 30 hari)' },
      ],
      Premium: [
        { label: 'DP', pct: 20, trigger: 'Tanda tangan SPK → mulai fase desain interior' },
        { label: 'Mobilisasi', pct: 20, trigger: 'Desain final disetujui → mobilisasi & persiapan' },
        { label: 'Progres 30%', pct: 25, trigger: 'Verifikasi progres 30% — produksi furnitur custom + plafon/dinding' },
        { label: 'Progres 60%', pct: 20, trigger: 'Verifikasi progres 60% — instalasi furnitur + decorative lighting' },
        { label: 'Progres 90%', pct: 10, trigger: 'Verifikasi progres 90% — finishing premium + styling' },
        { label: 'BAST', pct: 5, trigger: 'Serah terima + as-built + garansi diperpanjang + manual material' },
      ],
      Luxury: [
        { label: 'DP', pct: 20, trigger: 'Tanda tangan SPK → fase desain menyeluruh + sourcing material' },
        { label: 'Mobilisasi', pct: 20, trigger: 'Desain final disetujui → mobilisasi' },
        { label: 'Progres 30%', pct: 25, trigger: 'Verifikasi progres 30% — produksi furnitur grade tinggi' },
        { label: 'Progres 60%', pct: 20, trigger: 'Verifikasi progres 60% — instalasi + smart home interior' },
        { label: 'Progres 90%', pct: 10, trigger: 'Verifikasi progres 90% — finishing material premium + styling' },
        { label: 'BAST + Handover', pct: 5, trigger: 'Serah terima + dokumentasi material + garansi extended + sesi handover' },
      ],
    },
    Landscape: {
      Standar: [
        { label: 'DP', pct: 20, trigger: 'Tanda tangan SPK → desain lanskap + RAB/BOQ final' },
        { label: 'Mobilisasi', pct: 20, trigger: 'Desain final disetujui → mobilisasi & pekerjaan tanah' },
        { label: 'Progres 30%', pct: 25, trigger: 'Verifikasi progres 30% — hardscape struktural (kolam, decking, paving)' },
        { label: 'Progres 60%', pct: 20, trigger: 'Verifikasi progres 60% — softscape (penanaman) + irigasi & lighting' },
        { label: 'Progres 90%', pct: 10, trigger: 'Verifikasi progres 90% — finishing & pembersihan' },
        { label: 'BAST', pct: 5, trigger: 'Serah terima + as-built + garansi. Retensi cair setelah masa garansi (min. 30 hari)' },
      ],
      Premium: [
        { label: 'DP', pct: 20, trigger: 'Tanda tangan SPK → masterplan + desain + RAB/BOQ' },
        { label: 'Mobilisasi', pct: 20, trigger: 'Desain final disetujui → mobilisasi & pekerjaan tanah' },
        { label: 'Progres 30%', pct: 25, trigger: 'Verifikasi progres 30% — hardscape struktural' },
        { label: 'Progres 60%', pct: 20, trigger: 'Verifikasi progres 60% — softscape + irigasi & lighting' },
        { label: 'Progres 90%', pct: 10, trigger: 'Verifikasi progres 90% — finishing & penyempurnaan' },
        { label: 'BAST', pct: 5, trigger: 'Serah terima + as-built + garansi. Retensi cair setelah masa garansi' },
      ],
      Luxury: [
        { label: 'DP', pct: 20, trigger: 'Tanda tangan SPK → masterplan detail + sourcing material premium' },
        { label: 'Mobilisasi', pct: 20, trigger: 'Desain final disetujui → mobilisasi & pekerjaan tanah' },
        { label: 'Progres 30%', pct: 25, trigger: 'Verifikasi progres 30% — struktur water feature + hardscape premium' },
        { label: 'Progres 60%', pct: 20, trigger: 'Verifikasi progres 60% — softscape + smart irrigation + lighting system' },
        { label: 'Progres 90%', pct: 10, trigger: 'Verifikasi progres 90% — finishing & penyempurnaan' },
        { label: 'BAST + Handover', pct: 5, trigger: 'Serah terima + dokumentasi + garansi extended + sesi handover' },
      ],
    },
  },
}

// ── buildClauses: pasal berbeda per mode × kategori × tier ──
export interface ClauseBlock {
  type: 'p' | 'ul' | 'sub'
  text?: string
  items?: string[]
}
export interface Clause { title: string; blocks: ClauseBlock[] }

export function buildClauses(mode: SpkMode, category: string, tier: string, durasibulan: number): Clause[] {
  const dw = String(durasibulan)
  if (mode === 'db') {
    const pem: Record<string, string> = { Standar: '60 (enam puluh) hari kalender', Premium: '90 (sembilan puluh) hari kalender', Luxury: '180 (seratus delapan puluh) hari kalender' }
    const pemVal = pem[tier] || '60 (enam puluh) hari kalender'
    const qcLine: Record<string, string> = {
      Standar: 'PIHAK KEDUA menerapkan kontrol mutu (QC) bertahap pada setiap milestone progres (30%, 60%, 90%).',
      Premium: 'PIHAK KEDUA menerapkan kontrol mutu (QC) ketat pada setiap milestone progres disertai dokumentasi pelaksanaan.',
      Luxury: 'PIHAK KEDUA menerapkan kontrol mutu (QC) zero-defect berlapis disertai dokumentasi material dan inspeksi pada tiap milestone.',
    }
    const qcVal = qcLine[tier] || qcLine.Standar
    const garDur: Record<string, string> = { Standar: '1 (satu) tahun', Premium: '2 (dua) tahun', Luxury: '5 (lima) tahun' }
    const garDurVal = garDur[tier] || '1 (satu) tahun'

    let garItems: string[]
    if (category === 'Interior') {
      garItems = [
        'Garansi furnitur custom & built-in (kitchen set, wardrobe, dsb.) selama ' + garDurVal + ' terhadap cacat produksi.',
        'Garansi finishing (cat, veneer, HPL) selama 6 (enam) bulan terhadap cacat pengerjaan.',
        'Garansi instalasi lighting & elektrikal interior selama 1 (satu) tahun.',
      ]
    } else if (category === 'Landscape') {
      garItems = [
        'Penggantian tanaman yang mati bukan akibat kelalaian PIHAK PERTAMA, selama masa pemeliharaan.',
        'Garansi sistem irigasi & lighting taman selama 1 (satu) tahun.',
        'Garansi struktur hardscape (kolam, decking, paving, water feature) selama ' + garDurVal + '.',
      ]
    } else {
      garItems = [
        'Garansi struktur bangunan (pondasi, kolom, balok, pelat) selama ' + garDurVal + ' terhadap kegagalan struktural akibat mutu pelaksanaan.',
        'Garansi kebocoran atap & area basah selama 1 (satu) tahun.',
        'Garansi instalasi MEP (listrik & plumbing) selama 1 (satu) tahun.',
      ]
    }

    return [
      { title: 'PELAKSANAAN PEKERJAAN', blocks: [
        { type: 'ul', items: [
          'PIHAK KEDUA melaksanakan seluruh pekerjaan secara design & build — bertindak sebagai perencana sekaligus pelaksana (kontraktor) — sesuai gambar kerja, RAB/BOQ, dan spesifikasi teknis yang disepakati.',
          'PIHAK KEDUA menyediakan tenaga kerja, material, peralatan, dan manajemen pelaksanaan di lapangan.',
          'PIHAK KEDUA menunjuk pelaksana/site manager sebagai penanggung jawab lapangan dan titik koordinasi dengan PIHAK PERTAMA.',
          'PIHAK KEDUA menyusun jadwal pelaksanaan (time schedule / kurva-S) dan menyampaikan laporan progres secara berkala.',
          'PIHAK PERTAMA berhak meninjau lokasi sewaktu-waktu dengan pemberitahuan yang wajar tanpa mengganggu pelaksanaan.',
        ] },
      ] },
      { title: 'MUTU BAHAN & SPESIFIKASI', blocks: [
        { type: 'ul', items: [
          'Seluruh material dan mutu pekerjaan mengacu pada spesifikasi dalam RAB/BOQ serta standar konstruksi yang berlaku (SNI).',
          'Apabila material sesuai spesifikasi tidak tersedia di pasaran, dapat diganti dengan kualitas setara atas persetujuan tertulis PIHAK PERTAMA tanpa mengubah nilai kontrak.',
          'Sampel/brosur material utama (finishing, sanitair, atap) diajukan untuk persetujuan sebelum pengadaan.',
          qcVal,
        ] },
      ] },
      { title: 'PEKERJAAN TAMBAH / KURANG (VARIATION ORDER)', blocks: [
        { type: 'ul', items: [
          'Setiap perubahan lingkup atas permintaan PIHAK PERTAMA dituangkan dalam Berita Acara Pekerjaan Tambah/Kurang sebelum dilaksanakan.',
          'Nilai pekerjaan tambah/kurang dihitung berdasarkan harga satuan pada RAB; untuk item baru, harga disepakati bersama.',
          'Nilai kontrak dan jangka waktu pelaksanaan disesuaikan secara proporsional terhadap pekerjaan tambah/kurang yang disetujui.',
          'Pekerjaan tambah hanya dikerjakan setelah persetujuan tertulis kedua belah pihak.',
        ] },
      ] },
      { title: 'JANGKA WAKTU & DENDA KETERLAMBATAN', blocks: [
        { type: 'ul', items: [
          'Jangka waktu pelaksanaan konstruksi maksimum ' + dw + ' bulan, terhitung sejak penandatanganan SPK, lokasi siap dikerjakan, dan Down Payment diterima.',
          'Pelaksanaan dimulai setelah mobilisasi dan pekerjaan persiapan selesai.',
          'Perpanjangan waktu dapat diberikan akibat force majeure, pekerjaan tambah, keterlambatan pembayaran, atau keterlambatan keputusan/persetujuan dari PIHAK PERTAMA.',
          'Keterlambatan penyelesaian yang murni akibat kelalaian PIHAK KEDUA dikenakan denda 1‰ (satu permil) dari nilai kontrak per hari keterlambatan, maksimum 5% (lima persen) dari nilai kontrak.',
          'Apabila terjadi keterlambatan pembayaran termin oleh PIHAK PERTAMA, jadwal pelaksanaan mundur secara proporsional tanpa menjadi tanggung jawab PIHAK KEDUA.',
        ] },
      ] },
      { title: 'RETENSI & MASA PEMELIHARAAN', blocks: [
        { type: 'ul', items: [
          'Pada serah terima pertama (BAST I), PIHAK PERTAMA menahan retensi sebesar 5% (lima persen) dari nilai kontrak sebagai jaminan pemeliharaan.',
          'Masa pemeliharaan berlangsung ' + pemVal + ', terhitung sejak tanggal BAST I.',
          'Selama masa pemeliharaan, PIHAK KEDUA wajib memperbaiki cacat atau kerusakan yang timbul akibat mutu pelaksanaan, tanpa biaya tambahan.',
          'Retensi dibayarkan oleh PIHAK PERTAMA setelah serah terima kedua (BAST II) pada akhir masa pemeliharaan.',
        ] },
      ] },
      { title: 'JAMINAN & GARANSI MUTU', blocks: [
        { type: 'ul', items: garItems },
        { type: 'p', text: 'Garansi tidak berlaku atas kerusakan akibat penggunaan yang tidak wajar, modifikasi oleh pihak lain, bencana alam, atau force majeure.' },
      ] },
      { title: 'KESELAMATAN KERJA (K3) & TANGGUNG JAWAB', blocks: [
        { type: 'ul', items: [
          'PIHAK KEDUA bertanggung jawab atas keselamatan dan kesehatan kerja (K3) di lokasi proyek serta menyediakan alat pelindung diri (APD) bagi pekerjanya.',
          'PIHAK KEDUA menanggung risiko kecelakaan kerja atas tenaga kerjanya sendiri.',
          'PIHAK KEDUA menjaga kebersihan, keamanan, dan ketertiban lokasi selama pelaksanaan hingga serah terima.',
          'PIHAK KEDUA bertanggung jawab atas kerusakan bangunan eksisting atau properti pihak ketiga yang diakibatkan langsung oleh pelaksanaan pekerjaan.',
        ] },
      ] },
      { title: 'FORCE MAJEURE', blocks: [
        { type: 'p', text: 'Keadaan kahar (force majeure) meliputi bencana alam, kebakaran, perang, huru-hara, wabah, dan kebijakan pemerintah yang berada di luar kendali Para Pihak. Pihak yang terdampak wajib memberitahukan secara tertulis selambat-lambatnya 7 (tujuh) hari sejak kejadian. Penyesuaian jangka waktu dan/atau biaya akibat force majeure diselesaikan melalui musyawarah.' },
      ] },
      { title: 'PENYELESAIAN PERSELISIHAN', blocks: [
        { type: 'p', text: 'Perselisihan diselesaikan terlebih dahulu melalui musyawarah untuk mufakat. Apabila tidak tercapai kesepakatan, Para Pihak sepakat menyelesaikan melalui Pengadilan Negeri di wilayah hukum yang berlaku.' },
      ] },
      { title: 'PENGHENTIAN & PEMUTUSAN KONTRAK', blocks: [
        { type: 'sub', text: 'Pemutusan oleh PIHAK PERTAMA' },
        { type: 'p', text: 'PIHAK PERTAMA dapat memutus kontrak apabila PIHAK KEDUA menghentikan pekerjaan tanpa alasan sah lebih dari 14 (empat belas) hari kerja atau melanggar klausul perjanjian.' },
        { type: 'sub', text: 'Pemutusan oleh PIHAK KEDUA' },
        { type: 'p', text: 'PIHAK KEDUA dapat menghentikan pekerjaan apabila PIHAK PERTAMA terlambat membayar termin lebih dari 14 (empat belas) hari kerja dari jatuh tempo, atau melanggar klausul perjanjian.' },
        { type: 'p', text: 'Dalam hal pemutusan, dilakukan opname bersama atas progres pekerjaan; pembayaran diselesaikan sesuai nilai pekerjaan yang telah terpasang di lapangan, dan material yang telah berada di lokasi menjadi tanggungan PIHAK PERTAMA.' },
      ] },
      { title: 'PEKERJAAN DI LUAR KONTRAK', blocks: [
        { type: 'p', text: 'Pekerjaan yang tidak tercakup dalam SPK ini (lihat Pasal 1.4) dapat disepakati melalui kontrak baru yang terpisah berdasarkan musyawarah kedua belah pihak.' },
      ] },
    ]
  }

  // Jasa Perencanaan (plan)
  return [
    { title: 'REVISI', blocks: [
      { type: 'ul', items: [
        'Biaya revisi dikenakan apabila terdapat pengulangan tahap desain yang telah disetujui sebelumnya.',
        'Perubahan selama pelaksanaan lapangan yang mengakibatkan re-desain atau penggambaran ulang dikategorikan revisi berbayar.',
        'Usulan Value Engineering (VE) setelah desain selesai akan dikenakan biaya revisi.',
        'Besaran biaya revisi ditentukan melalui musyawarah kedua belah pihak.',
      ] },
    ] },
    { title: 'JANGKA WAKTU PELAKSANAAN', blocks: [
      { type: 'ul', items: [
        'Waktu perencanaan maksimum ' + dw + ' bulan hari kerja, terhitung dari tanggal penandatanganan kontrak.',
        'Jam kerja normal: 08.00–17.00 WIB, Senin–Jumat.',
        'Pekerjaan dimulai selambat-lambatnya 2 (dua) hari setelah penandatanganan SPK.',
        'Pekerjaan dapat tertunda atau dibatalkan akibat force majeure.',
        'Perpanjangan waktu dapat dilakukan atas persetujuan tertulis PIHAK PERTAMA.',
        'Waktu di atas tidak termasuk durasi yang diperlukan dalam proses perizinan.',
        'Apabila keterlambatan terjadi karena faktor eksternal di luar kendali PIHAK KEDUA, PIHAK KEDUA dapat memperbarui nilai kontrak.',
      ] },
    ] },
    { title: 'INSPEKSI LAPANGAN', blocks: [
      { type: 'ul', items: [
        'Kunjungan lapangan maksimal 1 (satu) kali per bulan.',
        'Memastikan pelaksanaan konstruksi sesuai gambar perencanaan dan dokumen desain yang telah disetujui.',
        'Hadir sewaktu-waktu bila dibutuhkan, dengan pemberitahuan minimal 1 (satu) minggu sebelumnya.',
        'Memberikan gambar tambahan (sketsa klarifikasi) bila diperlukan.',
        'Memberikan saran/arahan kepada Konsultan Pengawas atau Kontraktor bila dibutuhkan.',
        'PIHAK KEDUA tidak berwenang melakukan tindakan manajerial lapangan (peran konsultan perencana, bukan pelaksana).',
      ] },
    ] },
    { title: 'PENYELESAIAN PERSELISIHAN', blocks: [
      { type: 'p', text: 'Perselisihan diselesaikan terlebih dahulu melalui musyawarah untuk mufakat. Apabila tidak tercapai kesepakatan, Para Pihak sepakat menyelesaikan melalui Pengadilan Negeri di wilayah hukum yang berlaku.' },
    ] },
    { title: 'PENGHENTIAN PEKERJAAN', blocks: [
      { type: 'sub', text: 'Penghentian oleh PIHAK PERTAMA' },
      { type: 'p', text: 'PIHAK PERTAMA berhak menghentikan pekerjaan dengan atau tanpa alasan melalui Berita Acara Penghentian, dan wajib menyelesaikan pembayaran sebesar 50% dari tahapan pembayaran berikutnya yang belum terbayarkan.' },
      { type: 'sub', text: 'Penghentian oleh PIHAK KEDUA' },
      { type: 'p', text: 'PIHAK KEDUA dapat menghentikan pekerjaan apabila terjadi salah satu kondisi berikut:' },
      { type: 'ul', items: [
        'Perbedaan konsep mendasar selama lebih dari 5 (lima) kali sesi asistensi desain.',
        'Tidak ada tanggapan PIHAK PERTAMA lebih dari 14 (empat belas) hari kerja.',
        'PIHAK PERTAMA melanggar salah satu klausul dalam perjanjian ini.',
        'Force majeure.',
        'Jangka waktu pelaksanaan sebagaimana Pasal 5 telah terpenuhi.',
      ] },
      { type: 'p', text: 'Dalam hal ini, PIHAK KEDUA wajib menyerahkan seluruh produk yang telah diselesaikan dan mengembalikan pembayaran sebesar 50% dari tahapan terakhir yang telah dibayarkan.' },
    ] },
    { title: 'PEKERJAAN BARU', blocks: [
      { type: 'p', text: 'Pekerjaan yang tidak tercakup dalam SPK ini dapat disepakati melalui kontrak baru yang terpisah berdasarkan musyawarah kedua belah pihak. PIHAK KEDUA tetap bertanggung jawab penuh terhadap kontrak ini selama menjalankan kontrak baru, kecuali ada kesepakatan khusus secara tertulis.' },
    ] },
  ]
}

// ── Lookup helpers ──────────────────────────────────────────
export function getTahapan(mode: SpkMode, category: string, tier: string): TahapItem[] {
  return TAHAPAN_BASE[mode]?.[category]?.[tier] || TAHAPAN_BASE.plan.Arsitektur.Premium
}
export function getScopeInc(mode: SpkMode, category: string, tier: string): string[] {
  return SCOPE_INC[mode]?.[category]?.[tier] || SCOPE_INC.plan.Arsitektur.Premium
}
export function getScopeExc(mode: SpkMode, category: string, tier: string): string[] {
  return SCOPE_EXC[mode]?.[category]?.[tier] || SCOPE_EXC.plan.Arsitektur.Premium
}
export function getTermins(mode: SpkMode, category: string, tier: string): TerminItem[] {
  return TERMIN_BASE[mode]?.[category]?.[tier] || TERMIN_BASE.plan.Arsitektur.Premium
}

// Kategori yang tersedia per mode
export function spkCats(mode: SpkMode): string[] {
  if (mode === 'db') return ['Arsitektur', 'Interior', 'Landscape']
  return ['Arsitektur', 'Interior', 'Landscape', 'Renovasi']
}
// Tier yang tersedia per mode×kategori
export function spkTiers(mode: SpkMode, category?: string): string[] {
  const cat = category || 'Arsitektur'
  const data = TAHAPAN_BASE[mode]?.[cat]
  if (!data) return mode === 'db' ? ['Standar', 'Premium', 'Luxury'] : ['Ekonomi', 'Standar', 'Premium']
  return Object.keys(data)
}

// ── Legacy compat ───────────────────────────────────────────
export interface SpkTahap { no: number; nama: string; deskripsi: string }
export const SPK_TAHAPAN: SpkTahap[] = [
  { no: 1, nama: 'Diskusi Awal', deskripsi: 'Diskusi bersama pemilik untuk menentukan arah desain dan program ruang.' },
  { no: 2, nama: 'Perencanaan Schematic', deskripsi: 'Denah teknik, tampak, potongan, rencana atap, perspektif 3D.' },
  { no: 3, nama: 'Design Development', deskripsi: 'Denah, tampak, potongan, rencana atap & detail tangga tersinkronisasi.' },
  { no: 4, nama: 'Detail Drawing & RAB', deskripsi: 'Gambar kerja lengkap beserta Rencana Anggaran Biaya.' },
  { no: 5, nama: 'Pendampingan Lapangan', deskripsi: 'Penerbitan MOM, pendampingan pelaksanaan, dokumentasi proyek.' },
]
export const SPK_EXCLUSIONS: string[] = [
  'Pengurusan perizinan (IMB/PBG)', 'Pengukuran & survei lahan', 'Tes tanah (soil investigation)',
  'Shop drawing untuk kebutuhan kontraktor', 'As-built drawing', 'Graphic design (logo, signage, dll.)',
  'Penjadwalan pelaksanaan lapangan (time table)',
]

export interface SpkGuardrail { code: string; label: string; tone: 'ok' | 'bad' }
export const SPK_GUARDRAILS: SpkGuardrail[] = [
  { code: 'DO-01', label: 'Pastikan nomor SPK unik & berurutan tiap bulan.', tone: 'ok' },
  { code: 'DO-02', label: 'Total termin wajib 100% sebelum generate PDF.', tone: 'ok' },
  { code: 'DO-03', label: 'Cantumkan lingkup pekerjaan & batasan dengan jelas.', tone: 'ok' },
  { code: 'DO-04', label: 'Verifikasi nama & alamat klien sesuai identitas resmi.', tone: 'ok' },
  { code: 'DON-01', label: 'Jangan kirim SPK tanpa nilai fee atau klien kosong.', tone: 'bad' },
  { code: 'DON-02', label: 'Jangan ubah persentase termin tanpa persetujuan.', tone: 'bad' },
  { code: 'DON-03', label: 'Jangan janjikan lingkup di luar yang disepakati.', tone: 'bad' },
  { code: 'DON-04', label: 'Jangan lewati checklist QA pra-kirim.', tone: 'bad' },
]
export const SPK_QA_CHECKLIST: string[] = [
  'Nomor SPK sudah benar dan unik.',
  'Identitas Pihak Pertama (klien) sudah diverifikasi.',
  'Nama proyek, lokasi, dan luas lahan sudah sesuai.',
  'Total fee dan pembagian termin sudah tepat (total 100%).',
  'Durasi pengerjaan sudah disepakati kedua pihak.',
  'Lingkup pekerjaan & pengecualian sudah dikomunikasikan.',
]

// ── Termin helpers ──────────────────────────────────────────
export interface SpkTermin { kode: string; label: string; trigger: string; pct: number; nominal: number }
export interface SpkTerminInput { label: string; trigger: string; pct: number; auto?: boolean }

export const DEFAULT_TERMINS: SpkTerminInput[] = [
  { label: 'Down Payment / Uang Muka', trigger: 'Saat penandatanganan SPK', pct: 30, auto: false },
  { label: 'Termin 1 — Schematic & Design Development (ARS)', trigger: 'Penyelesaian Tahap 2 & 3A', pct: 30, auto: false },
  { label: 'Termin 2 — Detail Drawing (ARS) & RAB', trigger: 'Penyelesaian Tahap 3B', pct: 30, auto: false },
  { label: 'Termin 3', trigger: 'Pendampingan lapangan / penyerahan akhir', pct: 10, auto: true },
]

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
    return { kode: `TR-${i + 1}`, label: r.label, trigger: r.trigger, pct, nominal: Math.round((t * pct) / 100) }
  })
}

export function computeSpkTermins(total: number): SpkTermin[] {
  return buildTermins(DEFAULT_TERMINS, total)
}

// ── Nomor SPK ───────────────────────────────────────────────
export function spkJenisCode(jenis: string): string {
  const map: Record<string, string> = {
    'Perancangan Arsitektur': 'PA', 'Perancangan Interior': 'PI', 'Perancangan Lanskap': 'PL',
    'Design & Build': 'DB', 'Construction Supervision': 'CS', 'Project Management': 'PM',
  }
  return map[jenis] || 'PA'
}

export function generateSpkNumber(seq: number): string {
  const now = new Date()
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
  return `${String(seq).padStart(3, '0')}/EXT-Dir/SPK.PA/${roman[now.getMonth()]}/${now.getFullYear()}`
}

export function buildSpkNumber(seq: number | string, jenis: string, date: Date = new Date()): string {
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
  const d = isNaN(date.getTime()) ? new Date() : date
  const digits = String(seq).replace(/\D/g, '')
  const seqStr = (digits || '1').padStart(3, '0')
  return `${seqStr}/EXT-Dir/SPK.${spkJenisCode(jenis)}/${roman[d.getMonth()]}/${d.getFullYear()}`
}

// ── Tanggal & format ────────────────────────────────────────
const HARI_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const BULAN_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

export function formatTanggalIndo(date: Date = new Date()) {
  return { hari: HARI_ID[date.getDay()], tanggal: String(date.getDate()), bulan: BULAN_ID[date.getMonth()], tahun: String(date.getFullYear()) }
}

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
  return words.charAt(0).toUpperCase() + words.slice(1) + ' rupiah'
}

export function formatIDR(n: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number.isFinite(n) ? n : 0)
}
