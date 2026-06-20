// ============================================================
// Proposal Packages — lingkup/scope, deliverable, revisi, konsep & timeline
// per kategori + tier. Disalin dari AI Proposal Generator (standalone)
// agar dokumen otomatis menyesuaikan paket (Ekonomi/Standar/Premium/Luxury).
// ============================================================

import { planningRates, buildRates } from './pricingService'

export interface PkgTimelineItem { w: string; label: string; detail: string }
export interface PkgPillar { title: string; desc: string }
export interface PkgConcept { tagline: string; pillars: PkgPillar[] }
export interface ProposalPackage {
  included: string[]
  excluded: string[]
  deliverable: string
  revisi: string
  conceptTagline: string
  pillars: PkgPillar[]
  timeline: PkgTimelineItem[]
}

// ===== LINGKUP (included) per kategori + tier — Jasa Perencanaan =====
const PLAN_INC: Record<string, Record<string, string[]>> = {
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

const PLAN_EXC: Record<string, Record<string, string[]>> = {
  Arsitektur: { Ekonomi: ['Detail drawing', 'RAB formal', 'Potongan', 'Denah atap/plafon', 'Pendampingan lapangan'], Standar: ['Detail drawing custom lengkap', 'Pendampingan lapangan rutin', 'Gambar struktur & MEP'], Premium: ['Full construction drawing setingkat proyek pemerintah', 'Gambar struktur & MEP', 'Perjalanan di luar 3x kunjungan'] },
  Interior: { Ekonomi: ['RAB formal', 'Shop drawing', 'Material schedule detail', 'Pelaksanaan / produksi'], Standar: ['Pelaksanaan / produksi furnitur', 'Pengadaan material & furnitur'], Premium: ['Pelaksanaan / produksi furnitur', 'Pengadaan material & furnitur'] },
  Landscape: { Ekonomi: ['RAB formal', 'Pelaksanaan & penanaman', 'Pengadaan tanaman & material'], Standar: ['Pelaksanaan & penanaman', 'Pengadaan tanaman & material', 'Maintenance'], Premium: ['Pelaksanaan & penanaman', 'Pengadaan material', 'Maintenance pasca serah terima (paket terpisah)'] },
  Renovasi: { Ekonomi: ['RAB formal', 'Detail drawing', 'Pelaksanaan konstruksi'], Standar: ['Pelaksanaan konstruksi', 'Pengurusan izin (PBG)'], Premium: ['Pelaksanaan konstruksi', 'Pengurusan izin (PBG) - add-on'] },
}

// ===== LINGKUP per grup + tier — Design & Build =====
const DB_INC: Record<string, Record<string, string[]>> = {
  Arsitektur: {
    Standar: ['Desain: konsep + DD + gambar kerja + RAB/BOQ (tanpa fee terpisah)', 'Struktur beton bertulang + footplat', 'Dinding bata ringan/merah + plester aci', 'Lantai granit tile 60x60 / 80x80', 'Atap genteng keramik / beton flat', 'Kusen aluminium / kayu solid', 'Sanitair Toto / American Standard', 'Plafon gypsum / GRC', 'MEP standar (listrik 3500-5500 VA)', 'Cat weathershield eksterior + interior standar'],
    Premium: ['Desain + detail drawing elemen custom', 'Struktur beton bertulang penuh (pondasi dalam jika perlu)', 'Finishing marmer lokal / kayu solid / batu alam', 'Kusen aluminium powder coating / kayu jati custom', 'Sanitair setara Kohler', 'Plafon GRC / wood panel + drop ceiling dekoratif', 'MEP AC ducting (listrik 7700 VA+)', 'Smart home dasar (opsional)', 'Fasad custom (batu alam / secondary skin)'],
    Luxury: ['Desain lengkap + detail drawing menyeluruh', 'Material impor (marmer Italia, kayu teak grade A)', 'Smart home terintegrasi penuh', 'Fasad custom penuh (ACP, structural glazing)', 'MEP lengkap (VRV AC, STP, genset)', 'QC zero-defect berlapis', 'Kontraktor / sub spesialis per bidang'],
  },
  _interior: {
    Standar: ['Desain interior (konsep -> gambar kerja)', 'Ceiling, cat, lighting standar', 'Furniture loose + built-in sederhana', 'Pemasangan & finishing', 'Koordinasi tukang'],
    Premium: ['Desain interior + detail', 'Custom furniture, kitchen set, wardrobe', 'Wall panel + decorative lighting', 'Produksi & pemasangan furnitur custom', 'Finishing menyeluruh'],
    Luxury: ['Desain interior premium menyeluruh', 'Veneer, HPL premium, marble, solid wood', 'Smart home interior', 'Produksi presisi + instalasi', 'Finishing & styling lengkap'],
  },
  _landscape: {
    Standar: ['Desain lanskap + RAB', 'Rumput, tanaman, stepping stone', 'Lampu taman sederhana', 'Pengadaan tanaman & material', 'Pengerjaan + pembersihan akhir'],
    Premium: ['Desain lanskap lengkap', 'Hardscape + softscape', 'Lighting + irigasi', 'Pengadaan material & tanaman', 'Instalasi + pembersihan akhir'],
    Luxury: ['Masterplan lanskap menyeluruh', 'Batu alam premium, kolam, decking', 'Lighting system + smart irrigation', 'Sourcing material premium', 'Instalasi presisi + finishing'],
  },
}

const DB_DELIV: Record<string, Record<string, string>> = {
  Arsitektur: {
    Standar: 'Bangunan jadi siap huni + as-built (PDF + DWG) + sertifikat garansi + BAST.',
    Premium: 'Bangunan premium siap huni + as-built lengkap + garansi diperpanjang + manual material + BAST.',
    Luxury: 'Bangunan luxury + as-built lengkap + dokumentasi material impor + garansi extended + manual sistem + BAST + sesi handover.',
  },
  _other: {
    Standar: 'Pekerjaan terpasang & berfungsi + dokumentasi + sertifikat garansi + BAST.',
    Premium: 'Pekerjaan premium terpasang + dokumentasi lengkap + garansi + BAST.',
    Luxury: 'Pekerjaan luxury terpasang presisi + dokumentasi material + garansi extended + BAST + handover.',
  },
}

const DB_EXC: Record<string, string[]> = {
  Arsitektur: ['Tanah', 'PBG / perizinan', 'Sambungan PLN / PDAM baru', 'Furnitur lepas', 'AC', 'Landscape', 'Pagar'],
  _interior: ['Furnitur loose beli jadi (kecuali disepakati)', 'Peralatan elektronik', 'Peralatan dapur komersial'],
  _landscape: ['Maintenance pasca serah terima (paket terpisah)', 'Perbaikan struktur eksisting'],
}

// ===== KONSEP (tagline + 3 pilar) per grup =====
const CONCEPT: Record<string, PkgConcept> = {
  arsitektur: {
    tagline: 'Ruang yang bernapas.',
    pillars: [
      { title: 'Konteks Tapak', desc: 'Desain lahir dari tapak, iklim tropis, dan budaya lokasi - orientasi, ventilasi silang, dan naungan dirancang sejak awal.' },
      { title: 'Pengalaman Ruang', desc: 'Setiap keputusan diukur dari bagaimana ruang dirasakan: alur sirkulasi, cahaya alami, dan proporsi yang manusiawi.' },
      { title: 'Keterbangunan', desc: 'Estetika kuat namun realistis dieksekusi dengan anggaran dan kontraktor nyata, dengan detail yang dapat dipertanggungjawabkan.' },
    ],
  },
  interior: {
    tagline: 'Interior yang mencerminkan Anda.',
    pillars: [
      { title: 'Karakter & Gaya Hidup', desc: 'Konsep digali dari kebiasaan, selera, dan ritme keseharian penghuni - bukan sekadar mengikuti tren visual.' },
      { title: 'Fungsi & Ergonomi', desc: 'Tata letak furnitur, alur aktivitas, dan penyimpanan dirancang agar setiap ruang bekerja senyaman tampilannya.' },
      { title: 'Material & Atmosfer', desc: 'Palet material, tekstur, dan pencahayaan dipilih untuk membangun suasana yang konsisten di seluruh ruang.' },
    ],
  },
  landscape: {
    tagline: 'Lanskap yang hidup dan tumbuh.',
    pillars: [
      { title: 'Ekologi & Iklim Mikro', desc: 'Vegetasi, naungan, dan tata air dirancang untuk iklim tropis - menyejukkan sekaligus hemat perawatan.' },
      { title: 'Pengalaman Sensorik', desc: 'Jalur, titik henti, aroma, dan suara air disusun agar taman dinikmati bertahap, bukan sekadar dilihat.' },
      { title: 'Keberlanjutan', desc: 'Hardscape dan softscape direncanakan untuk tumbuh matang dari waktu ke waktu dengan perawatan yang masuk akal.' },
    ],
  },
  renovasi: {
    tagline: 'Menghidupkan kembali ruang Anda.',
    pillars: [
      { title: 'Diagnosa Eksisting', desc: 'Kondisi bangunan lama dipetakan dulu - struktur, kelembapan, dan potensi - sebelum satu garis desain ditarik.' },
      { title: 'Optimalisasi Ruang', desc: 'Perubahan difokuskan pada dampak terbesar: alur, cahaya, dan fungsi, dengan intervensi seefisien mungkin.' },
      { title: 'Nilai Tambah', desc: 'Renovasi diarahkan menaikkan kenyamanan sekaligus nilai aset - bukan sekadar mempercantik permukaan.' },
    ],
  },
}

// ===== TIMELINE per kategori + tier — Jasa Perencanaan =====
const PLAN_TL: Record<string, Record<string, PkgTimelineItem[]>> = {
  Arsitektur: {
    Ekonomi: [
      { w: 'W1', label: 'Briefing & Survey', detail: 'Diskusi kebutuhan + survey ringkas -> brief final' },
      { w: 'W2', label: 'Layout Denah', detail: '1 opsi layout denah disetujui' },
      { w: 'W3', label: 'Denah Final & Tampak', detail: 'Denah final (PDF + DWG) + tampak utama 1 sisi' },
      { w: 'W4', label: '3D & Serah Terima', detail: 'Perspektif 3D eksterior 2-3 view + estimasi biaya kasar' },
    ],
    Standar: [
      { w: 'W1-W2', label: 'Kick-off & Survey', detail: 'Briefing + survey tapak -> laporan survey & brief final' },
      { w: 'W3-W4', label: 'Konsep Desain', detail: 'Zoning + 1-2 opsi konsep + moodboard' },
      { w: 'W5-W6', label: 'Design Development', detail: 'Denah semua lantai, tampak 4 sisi, potongan, denah atap' },
      { w: 'W7-W8', label: 'Visualisasi & Material', detail: '3D eksterior 3-4 view resolusi tinggi + material board' },
      { w: 'W9-W10', label: 'RAB & Serah Terima', detail: 'RAB estimasi (XLSX + PDF) + serah terima dokumen' },
    ],
    Premium: [
      { w: 'W1-W2', label: 'Kick-off & Survey', detail: 'Briefing mendalam + survey tapak -> brief final' },
      { w: 'W3-W4', label: 'Konsep Desain', detail: '1-2 opsi konsep + moodboard + zoning' },
      { w: 'W5-W7', label: 'Design Development', detail: 'Gambar lengkap + denah plafon & pola lantai per ruang' },
      { w: 'W8-W10', label: 'Detail Drawing', detail: 'Detail elemen custom + schedule pintu & jendela' },
      { w: 'W11-W13', label: '3D Realistis & RAB+BOQ', detail: '3D banyak view (eksterior + interior) + RAB & BOQ detail' },
      { w: 'W14-W16', label: 'Serah Terima & Pendampingan', detail: 'Dokumen final + pendampingan lapangan 3x + garansi konsultasi 30 hari' },
    ],
  },
  Interior: {
    Ekonomi: [
      { w: 'W1', label: 'Briefing & Moodboard', detail: 'Diskusi kebutuhan + moodboard' },
      { w: 'W2', label: 'Layout Furnitur', detail: 'Layout furnitur per ruang' },
      { w: 'W3', label: '3D & Serah Terima', detail: '3D sederhana 1-2 view + estimasi biaya kasar' },
    ],
    Standar: [
      { w: 'W1', label: 'Briefing & Concept Board', detail: 'Moodboard + concept board disetujui' },
      { w: 'W2-W3', label: 'Layout Furnitur', detail: 'Furniture layout semua ruang' },
      { w: 'W4-W5', label: 'Gambar & Material', detail: 'Tampak ruang + material & furniture schedule' },
      { w: 'W6-W7', label: 'Visualisasi 3D', detail: '3D realistis per ruang kunci' },
      { w: 'W8', label: 'RAB & Serah Terima', detail: 'RAB estimasi + paket dokumen final' },
    ],
    Premium: [
      { w: 'W1', label: 'Briefing & Concept Board', detail: 'Moodboard + concept board disetujui' },
      { w: 'W2-W3', label: 'Layout Furnitur', detail: 'Furniture layout semua ruang' },
      { w: 'W4-W5', label: 'Gambar & Material', detail: 'Gambar interior + material & furniture schedule' },
      { w: 'W6-W8', label: 'Shop Drawing Custom', detail: 'Kitchen set, wardrobe, built-in + BOQ detail' },
      { w: 'W9-W10', label: '3D Realistis Multi-ruang', detail: '3D realistis seluruh ruang kunci' },
      { w: 'W11', label: 'Serah Terima & Vendor', detail: 'Rekomendasi vendor + garansi konsultasi 30 hari' },
    ],
  },
  Landscape: {
    Ekonomi: [
      { w: 'W1', label: 'Survey & Layout', detail: 'Layout taman sederhana' },
      { w: 'W2', label: 'Planting Plan', detail: 'Planting plan dasar' },
      { w: 'W3', label: '3D & Serah Terima', detail: '3D sederhana + estimasi biaya kasar' },
    ],
    Standar: [
      { w: 'W1', label: 'Survey Tapak', detail: 'Analisis tapak & iklim mikro -> brief final' },
      { w: 'W2-W3', label: 'Konsep & Layout Taman', detail: 'Konsep + layout taman lengkap + planting plan detail' },
      { w: 'W4', label: 'Hardscape Dasar', detail: 'Jalan setapak, area duduk, stepping stone' },
      { w: 'W5', label: 'Visualisasi 3D', detail: '3D realistis taman' },
      { w: 'W6', label: 'RAB & Serah Terima', detail: 'RAB estimasi + paket dokumen final' },
    ],
    Premium: [
      { w: 'W1', label: 'Survey Tapak', detail: 'Analisis tapak, kontur & iklim mikro -> brief final' },
      { w: 'W2-W3', label: 'Masterplan Lanskap', detail: 'Masterplan + konsep menyeluruh' },
      { w: 'W4-W5', label: 'Hardscape & Softscape', detail: 'Hardscape detail + softscape berlapis + lighting plan' },
      { w: 'W6-W7', label: '3D Realistis & RAB+BOQ', detail: '3D multi-view + RAB & BOQ detail' },
      { w: 'W8', label: 'Serah Terima & Pendampingan', detail: 'Pendampingan pemilihan material + garansi konsultasi 30 hari' },
    ],
  },
  Renovasi: {
    Ekonomi: [
      { w: 'W1', label: 'Survey Existing', detail: 'Survey ringkas (foto + sketsa)' },
      { w: 'W2', label: 'Layout Usulan', detail: 'Denah perubahan yang diusulkan' },
      { w: 'W3', label: 'Estimasi & Serah Terima', detail: 'Estimasi biaya kasar + serah terima' },
    ],
    Standar: [
      { w: 'W1', label: 'Survey & Existing Drawing', detail: 'Gambar ukur kondisi existing' },
      { w: 'W2-W3', label: 'Design Development', detail: 'Denah usulan + tampak perubahan' },
      { w: 'W4', label: 'Visualisasi 3D', detail: '3D hasil renovasi' },
      { w: 'W5', label: 'RAB & Serah Terima', detail: 'RAB + paket dokumen final' },
    ],
    Premium: [
      { w: 'W1-W2', label: 'Existing Survey Detail', detail: 'Survey detail + dokumentasi kondisi menyeluruh' },
      { w: 'W3-W4', label: 'Gambar Usulan Lengkap', detail: 'Denah, tampak, potongan usulan' },
      { w: 'W5-W6', label: 'Detail & RAB+BOQ', detail: 'Detail elemen yang diubah + RAB & BOQ' },
      { w: 'W7', label: 'Visualisasi 3D', detail: '3D realistis hasil renovasi' },
      { w: 'W8', label: 'Serah Terima & Pendampingan', detail: 'Pendampingan lapangan + garansi konsultasi 30 hari' },
    ],
  },
}

// ===== TIMELINE per grup + tier — Design & Build =====
const DB_TL: Record<string, Record<string, PkgTimelineItem[]>> = {
  Arsitektur: {
    Standar: [
      { w: 'W1-W3', label: 'Desain & RAB Final', detail: 'Konsep -> DD -> gambar kerja -> RAB/BOQ final disetujui' },
      { w: 'W4-W5', label: 'Mobilisasi & Pondasi', detail: 'Persiapan lahan, mobilisasi tim & material, pekerjaan pondasi' },
      { w: 'W6-W11', label: 'Struktur & Pasangan', detail: 'Sloof, kolom, balok, dinding bata ringan, rangka & atap' },
      { w: 'W12-W18', label: 'MEP & Finishing', detail: 'MEP standar, lantai granit, plafon gypsum, kusen, cat, sanitair' },
      { w: 'W19-W20', label: 'QC & Serah Terima', detail: 'Punch list, as-built, BAST + sertifikat garansi' },
    ],
    Premium: [
      { w: 'W1-W4', label: 'Desain & Detail Drawing', detail: 'Konsep -> DD -> detail elemen custom -> RAB/BOQ final' },
      { w: 'W5-W6', label: 'Mobilisasi & Pondasi', detail: 'Mobilisasi + pondasi (pondasi dalam jika diperlukan)' },
      { w: 'W7-W14', label: 'Struktur & Pasangan', detail: 'Struktur beton penuh + dinding + atap' },
      { w: 'W15-W22', label: 'MEP Ducting & Finishing Premium', detail: 'AC ducting, marmer/kayu solid, sanitair premium, plafon dekoratif' },
      { w: 'W23-W25', label: 'Fasad Custom & QC', detail: 'Fasad batu alam/secondary skin + smart home dasar + QC' },
      { w: 'W26', label: 'Serah Terima', detail: 'BAST + as-built + garansi diperpanjang + manual material' },
    ],
    Luxury: [
      { w: 'W1-W5', label: 'Desain Menyeluruh', detail: 'Konsep -> DD -> detail drawing menyeluruh -> RAB/BOQ final' },
      { w: 'W6-W8', label: 'Mobilisasi & Pondasi Dalam', detail: 'Mobilisasi + pondasi dalam + pekerjaan persiapan' },
      { w: 'W9-W18', label: 'Struktur & Pasangan', detail: 'Struktur penuh + dinding + atap' },
      { w: 'W19-W30', label: 'MEP Lengkap & Material Impor', detail: 'VRV AC, STP, genset + finishing marmer Italia/teak grade A' },
      { w: 'W31-W35', label: 'Smart Home & Fasad Custom', detail: 'Smart home terintegrasi + fasad ACP/structural glazing + lanskap' },
      { w: 'W36-W38', label: 'QC Zero-Defect Berlapis', detail: 'Inspeksi mutu berlapis per bidang spesialis' },
      { w: 'W39-W40', label: 'Serah Terima & Handover', detail: 'BAST + handover session + dokumentasi material + garansi extended' },
    ],
  },
  _interior: {
    Standar: [
      { w: 'W1-W2', label: 'Desain & Gambar Kerja', detail: 'Konsep -> gambar kerja interior' },
      { w: 'W3-W6', label: 'Produksi Furnitur', detail: 'Furniture loose + built-in sederhana di workshop' },
      { w: 'W7-W9', label: 'Instalasi & Finishing', detail: 'Ceiling, cat, lighting + pemasangan furnitur' },
      { w: 'W10', label: 'QC & Serah Terima', detail: 'Punch list + BAST + sertifikat garansi' },
    ],
    Premium: [
      { w: 'W1-W2', label: 'Desain & Shop Drawing', detail: 'Konsep -> gambar kerja -> shop drawing custom' },
      { w: 'W3-W7', label: 'Produksi Furnitur Custom', detail: 'Kitchen set, wardrobe & built-in custom di workshop' },
      { w: 'W8-W10', label: 'Instalasi & Wall Panel', detail: 'Wall panel, decorative lighting + pemasangan furnitur' },
      { w: 'W11-W12', label: 'Finishing Menyeluruh', detail: 'Finishing detail seluruh ruang' },
      { w: 'W13', label: 'QC & Serah Terima', detail: 'Punch list + BAST + sertifikat garansi' },
    ],
    Luxury: [
      { w: 'W1-W3', label: 'Desain Premium & Shop Drawing', detail: 'Desain menyeluruh + shop drawing presisi' },
      { w: 'W4-W9', label: 'Produksi Material Premium', detail: 'Veneer & HPL premium, marble, solid wood di workshop' },
      { w: 'W10-W13', label: 'Instalasi Presisi & Smart Home', detail: 'Instalasi presisi + smart home interior' },
      { w: 'W14-W16', label: 'Finishing & Styling', detail: 'Finishing & styling lengkap' },
      { w: 'W17', label: 'QC Berlapis & Serah Terima', detail: 'QC berlapis + BAST + garansi extended' },
    ],
  },
  _landscape: {
    Standar: [
      { w: 'W1-W2', label: 'Desain & RAB', detail: 'Desain lanskap + RAB final' },
      { w: 'W3-W4', label: 'Persiapan & Hardscape', detail: 'Pekerjaan tanah + stepping stone + area dasar' },
      { w: 'W5-W6', label: 'Softscape & Lampu', detail: 'Penanaman rumput & tanaman + lampu taman sederhana' },
      { w: 'W7', label: 'Pembersihan & Serah Terima', detail: 'Pembersihan akhir + BAST' },
    ],
    Premium: [
      { w: 'W1-W2', label: 'Desain Lengkap & RAB/BOQ', detail: 'Desain lanskap lengkap + RAB/BOQ disetujui' },
      { w: 'W3-W5', label: 'Hardscape & Irigasi', detail: 'Hardscape + sistem irigasi' },
      { w: 'W6-W8', label: 'Softscape & Lighting', detail: 'Softscape berlapis + lighting taman' },
      { w: 'W9', label: 'Finishing & Serah Terima', detail: 'Penyempurnaan + pembersihan + BAST' },
    ],
    Luxury: [
      { w: 'W1-W3', label: 'Masterplan & RAB/BOQ', detail: 'Masterplan lanskap menyeluruh + RAB/BOQ' },
      { w: 'W4-W7', label: 'Hardscape Premium', detail: 'Batu alam premium, kolam, decking' },
      { w: 'W8-W11', label: 'Softscape & Smart Irrigation', detail: 'Penanaman premium + smart irrigation + lighting system' },
      { w: 'W12-W13', label: 'Finishing Presisi', detail: 'Penyempurnaan presisi + pembersihan' },
      { w: 'W14', label: 'Serah Terima & Handover', detail: 'BAST + handover + panduan perawatan' },
    ],
  },
}

// ===== Tabel harga (persis standalone / Price List 2026) =====
export const PLAN_PRICE: Record<string, Record<string, [number, number]>> = {
  Arsitektur: { Ekonomi: [50000, 40000], Standar: [110000, 90000], Premium: [200000, 160000] },
  Interior: { Ekonomi: [60000, 48000], Standar: [120000, 95000], Premium: [225000, 180000] },
  Landscape: { Ekonomi: [40000, 32000], Standar: [80000, 65000], Premium: [150000, 120000] },
  Renovasi: { Ekonomi: [50000, 40000], Standar: [100000, 80000], Premium: [175000, 140000] },
}
export const DB_PRICE: Record<string, Record<string, [number, number]>> = {
  Arsitektur: { Standar: [4500000, 5500000], Premium: [6000000, 8000000], Luxury: [9000000, 15000000] },
  'Interior (Residensial)': { Standar: [2500000, 4500000], Premium: [4500000, 7500000], Luxury: [7500000, 12000000] },
  'Interior (Cafe/Komersial)': { Standar: [3000000, 5000000], Premium: [5000000, 10000000], Luxury: [10000000, 20000000] },
  'Landscape (Taman Rumah)': { Standar: [350000, 750000], Premium: [750000, 2000000], Luxury: [2000000, 5000000] },
  'Landscape (Taman Villa)': { Standar: [750000, 1500000], Premium: [1500000, 3000000], Luxury: [3000000, 6000000] },
  'Landscape (Kolam Renang)': { Standar: [5000000, 8000000], Premium: [8000000, 15000000], Luxury: [15000000, 25000000] },
}
export const PLAN_TIERS = ['Ekonomi', 'Standar', 'Premium']
export const DB_TIERS = ['Standar', 'Premium', 'Luxury']
export const PLAN_MIN_ORDER = 3500000

export type ProposalMode = 'plan' | 'db'

export function proposalCats(mode: ProposalMode): string[] {
  const arr = mode === 'plan' ? planningRates : buildRates
  const cats = Array.from(new Set(arr.map((r) => r.category)))
  return cats.length ? cats : Object.keys(mode === 'plan' ? PLAN_PRICE : DB_PRICE)
}
export function proposalTiers(mode: ProposalMode): string[] {
  const arr = mode === 'plan' ? planningRates : buildRates
  const tiers = Array.from(new Set(arr.map((r) => r.tier)))
  return tiers.length ? tiers : (mode === 'plan' ? [...PLAN_TIERS] : [...DB_TIERS])
}
export function proposalJenisLabel(mode: ProposalMode, cat: string): string {
  return mode === 'plan' ? (cat === 'Renovasi' ? 'Perancangan Renovasi' : `Perancangan ${cat}`) : `Design & Build ${cat}`
}
/** Harga satuan acuan dari tabel Kelola Harga: plan = harga list, db = rata-rata min-max. */
export function proposalUnitPrice(mode: ProposalMode, cat: string, tier: string): number {
  if (mode === 'plan') {
    const r = planningRates.find((x) => x.category === cat && x.tier === tier) || planningRates.find((x) => x.category === cat)
    return r?.listPerM2 || 0
  }
  const r = buildRates.find((x) => x.category === cat && x.tier === tier) || buildRates.find((x) => x.category === cat)
  return r ? Math.round((r.priceMin + r.priceMax) / 2) : 0
}

// ===== Resolver =====
function dbGroupFromCat(cat: string): 'Arsitektur' | '_interior' | '_landscape' {
  const c = cat.toLowerCase()
  if (/interior|kitchen|wardrobe|kabinet/.test(c)) return '_interior'
  if (/landscape|lanskap|taman|garden|kolam|vertical|rooftop|villa/.test(c)) return '_landscape'
  return 'Arsitektur'
}

function planConceptKey(planCat: string): string {
  if (planCat.startsWith('Interior')) return 'interior'
  if (planCat.startsWith('Landscape')) return 'landscape'
  if (planCat === 'Renovasi') return 'renovasi'
  return 'arsitektur'
}

const PLAN_DELIVERABLE = 'Seluruh deliverable diserahkan digital (PDF/DWG/JPG/XLSX). Cetak hardcopy opsional (dikuotasi terpisah).'
const DB_REVISI = 'Revisi desain dalam fase desain (sebelum mobilisasi). Perubahan setelah pekerjaan berjalan dihitung pekerjaan tambah/kurang.'

/**
 * Ambil paket lengkap (lingkup, deliverable, revisi, konsep, timeline) sesuai
 * mode (plan/db) + kategori + tier — mengikuti AI Proposal Generator standalone.
 */
export function getProposalPackage(mode: ProposalMode, cat: string, tier: string): ProposalPackage {
  if (mode === 'plan') {
    const c = PLAN_INC[cat] ? cat : 'Arsitektur'
    const inc = PLAN_INC[c][tier] || PLAN_INC[c].Standar
    const exc = PLAN_EXC[c][tier] || PLAN_EXC[c].Standar
    const tlGrp = PLAN_TL[c] || PLAN_TL.Arsitektur
    const timeline = tlGrp[tier] || tlGrp.Standar
    const concept = CONCEPT[planConceptKey(c)]
    return {
      included: [...inc],
      excluded: [...exc],
      deliverable: PLAN_DELIVERABLE,
      revisi: tier === 'Ekonomi'
        ? '1x revisi mayor + revisi minor bebas selama proses.'
        : '2x revisi mayor per tahap + revisi minor tanpa batas + konsultasi virtual tanpa batas.',
      conceptTagline: concept.tagline,
      pillars: concept.pillars.map((p) => ({ ...p })),
      timeline: timeline.map((t) => ({ ...t })),
    }
  }
  // Design & Build
  const grp = dbGroupFromCat(cat)
  const incGrp = DB_INC[grp] || DB_INC.Arsitektur
  const inc = incGrp[tier] || incGrp.Standar
  const delivTable = grp === 'Arsitektur' ? DB_DELIV.Arsitektur : DB_DELIV._other
  const deliverable = delivTable[tier] || delivTable.Standar
  const exc = DB_EXC[grp] || DB_EXC.Arsitektur
  const tlGrp = DB_TL[grp] || DB_TL.Arsitektur
  const timeline = tlGrp[tier] || tlGrp.Standar
  const concept = CONCEPT[grp === '_interior' ? 'interior' : grp === '_landscape' ? 'landscape' : 'arsitektur']
  return {
    included: [...inc],
    excluded: [...exc],
    deliverable,
    revisi: DB_REVISI,
    conceptTagline: concept.tagline,
    pillars: concept.pillars.map((p) => ({ ...p })),
    timeline: timeline.map((t) => ({ ...t })),
  }
}


// ===== TERMIN PEMBAYARAN per paket (persis standalone) =====
export interface PkgTermin { label: string; pct: number; trigger: string }

export function getProposalTermins(mode: ProposalMode, cat: string, tier: string): PkgTermin[] {
  if (mode === 'db') {
    const g = dbGroupFromCat(cat)
    const t3 = g === '_interior'
      ? 'Verifikasi progres 30% - produksi furnitur custom + pekerjaan plafon/dinding'
      : g === '_landscape'
        ? 'Verifikasi progres 30% - pekerjaan tanah + hardscape struktural'
        : 'Verifikasi progres 30% - struktur: sloof, kolom, balok, sebagian dinding'
    const t4 = g === '_interior'
      ? 'Verifikasi progres 60% - instalasi furnitur + lighting + finishing dasar'
      : g === '_landscape'
        ? 'Verifikasi progres 60% - softscape (penanaman) + irigasi + lighting'
        : 'Verifikasi progres 60% - dinding selesai, atap, MEP roughing-in, kusen'
    const t5 = g === '_interior'
      ? 'Verifikasi progres 90% - finishing detail + styling'
      : g === '_landscape'
        ? 'Verifikasi progres 90% - finishing + penyempurnaan + pembersihan'
        : 'Verifikasi progres 90% - finishing: lantai, plafon, cat, sanitair, MEP'
    return [
      { label: 'Down Payment / Uang Muka', pct: 20, trigger: 'Tanda tangan SPK -> mulai fase desain (konsep -> DD -> gambar kerja -> RAB/BOQ final)' },
      { label: 'Termin Mobilisasi', pct: 20, trigger: 'Desain final disetujui -> mobilisasi material & tim, pekerjaan persiapan, pondasi' },
      { label: 'Termin Progres 30%', pct: 25, trigger: t3 },
      { label: 'Termin Progres 60%', pct: 20, trigger: t4 },
      { label: 'Termin Progres 90%', pct: 10, trigger: t5 },
      { label: 'Termin BAST', pct: 5, trigger: 'Serah terima akhir - as-built + sertifikat garansi + manual. Retensi cair setelah masa garansi (min. 30 hari)' },
    ]
  }
  if (tier === 'Ekonomi') {
    if (cat === 'Interior') {
      return [
        { label: 'Down Payment / Uang Muka', pct: 30, trigger: 'Tanda tangan SPK -> moodboard' },
        { label: 'Termin 1', pct: 40, trigger: 'Layout furniture disetujui' },
        { label: 'Termin 2', pct: 30, trigger: '3D sederhana + estimasi kasar -> serah terima' },
      ]
    }
    const isLR = cat === 'Landscape' || cat === 'Renovasi'
    return [
      { label: 'Down Payment / Uang Muka', pct: 40, trigger: 'Tanda tangan SPK -> mulai briefing & gambar awal' },
      { label: 'Termin 1', pct: isLR ? 40 : 30, trigger: 'Gambar utama disetujui' },
      { label: 'Termin 2', pct: isLR ? 20 : 30, trigger: '3D + estimasi kasar -> serah terima file' },
    ]
  }
  if (tier === 'Standar') {
    return [
      { label: 'Down Payment / Uang Muka', pct: 30, trigger: 'Tanda tangan SPK -> mulai pengembangan konsep' },
      { label: 'Termin 1', pct: 30, trigger: 'Konsep disetujui (opsi + moodboard)' },
      { label: 'Termin 2', pct: 30, trigger: 'Design Development disetujui (gambar lengkap + RAB)' },
      { label: 'Termin 3', pct: 10, trigger: 'Serah terima dokumen final' },
    ]
  }
  // Premium
  return [
    { label: 'Down Payment / Uang Muka', pct: 30, trigger: 'Tanda tangan SPK -> survey + mulai konsep' },
    { label: 'Termin 1', pct: 25, trigger: 'Konsep disetujui' },
    { label: 'Termin 2', pct: 25, trigger: 'Design Development disetujui' },
    { label: 'Termin 3', pct: 15, trigger: 'Detail drawing + RAB & BOQ + 3D final' },
    { label: 'Termin 4', pct: 5, trigger: 'Serah terima + mulai garansi konsultasi 30 hari' },
  ]
}
