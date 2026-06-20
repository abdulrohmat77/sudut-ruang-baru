export type LeadStage =
  | "Lead"
  | "Qualified"
  | "Estimation"
  | "Proposal"
  | "Negotiation"
  | "Approved"
  | "SPK"
  | "Design"
  | "Construction"
  | "Invoice"
  | "Completed";

export const PIPELINE_STAGES: LeadStage[] = [
  "Lead",
  "Qualified",
  "Estimation",
  "Proposal",
  "Negotiation",
  "Approved",
  "SPK",
  "Design",
  "Construction",
  "Invoice",
  "Completed",
];

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  projectType: string;
  buildingArea: number;
  landArea: number;
  budget: number;
  timeline: string;
  style: string;
  source: string;
  stage: LeadStage;
  createdAt: string;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  client: string;
  value: number;
  progress: number;
  stage: LeadStage;
  pm: string;
  dueDate: string;
}

export interface Proposal {
  id: string;
  number: string;
  client: string;
  project: string;
  value: number;
  status: "Draft" | "Sent" | "Approved" | "Revision" | "Rejected";
  createdAt: string;
}

export interface Invoice {
  id: string;
  number: string;
  client: string;
  project: string;
  type: "DP" | "Progress" | "Final";
  amount: number;
  status: "Draft" | "Sent" | "Pending" | "Paid" | "Overdue" | "Cancelled";
  dueDate: string;
}

export type SpkJenis =
  | "Perancangan Arsitektur"
  | "Perancangan Interior"
  | "Perancangan Lanskap"
  | "Design & Build"
  | "Construction Supervision"
  | "Project Management";

export type SpkKategori =
  | "Membangun baru"
  | "Renovasi"
  | "Penambahan lantai"
  | "Interior fit-out";

export type SpkMode = "plan" | "db";
export type SpkTier = "Ekonomi" | "Standar" | "Premium" | "Luxury";

export interface SPK {
  id: string;
  number: string;
  client: string;
  project: string;
  value: number;
  signedAt: string | null;
  status: "Draft" | "Sent" | "Signed";
  jenisPekerjaan: SpkJenis;
  kategori: SpkKategori;
  mode: SpkMode;
  tier: SpkTier;
  lokasi: string;
  luas: string;
  durasiBulan: number;
}

export const mockLeads: Lead[] = [
  { id: "L-001", name: "Pak Ahmad Wijaya", phone: "+62 812-3456-7890", email: "ahmad@email.com", location: "Bali", projectType: "Villa", buildingArea: 320, landArea: 600, budget: 4500000000, timeline: "10 months", style: "Modern Tropical", source: "Instagram", stage: "Qualified", createdAt: "2026-05-20" },
  { id: "L-002", name: "Ibu Sari Indah", phone: "+62 813-9988-7766", email: "sari@cafe.id", location: "Bandung", projectType: "Cafe", buildingArea: 180, landArea: 220, budget: 1200000000, timeline: "5 months", style: "Industrial Japandi", source: "WhatsApp", stage: "Proposal", createdAt: "2026-05-22" },
  { id: "L-003", name: "PT Sentra Mandiri", phone: "+62 21-555-1234", email: "office@sentra.co.id", location: "Jakarta", projectType: "Office", buildingArea: 1200, landArea: 800, budget: 18000000000, timeline: "14 months", style: "Corporate Minimalist", source: "Referral", stage: "Negotiation", createdAt: "2026-05-15" },
  { id: "L-004", name: "Pak Budi Santoso", phone: "+62 811-2222-3333", email: "budi@gmail.com", location: "Surabaya", projectType: "House", buildingArea: 220, landArea: 300, budget: 2200000000, timeline: "8 months", style: "Modern Minimalist", source: "Google Ads", stage: "Estimation", createdAt: "2026-05-28" },
  { id: "L-005", name: "Yayasan Al-Hidayah", phone: "+62 274-555-9999", email: "info@alhidayah.org", location: "Yogyakarta", projectType: "Mosque", buildingArea: 900, landArea: 1500, budget: 6500000000, timeline: "12 months", style: "Contemporary Islamic", source: "Referral", stage: "Approved", createdAt: "2026-04-30" },
  { id: "L-006", name: "Bu Lina Hartono", phone: "+62 812-7777-8888", email: "lina@boutique.id", location: "Medan", projectType: "Shop", buildingArea: 140, landArea: 160, budget: 850000000, timeline: "4 months", style: "Luxury Modern", source: "Instagram", stage: "Lead", createdAt: "2026-06-01" },
];

export const mockProjects: Project[] = [
  { id: "P-001", code: "SR-2026-001", name: "Villa Wijaya Ubud", client: "Pak Ahmad Wijaya", value: 4500000000, progress: 35, stage: "Design", pm: "Andi Pratama", dueDate: "2027-03-15" },
  { id: "P-002", code: "SR-2026-002", name: "Sentra HQ Tower", client: "PT Sentra Mandiri", value: 18000000000, progress: 12, stage: "SPK", pm: "Rina Kusuma", dueDate: "2027-07-30" },
  { id: "P-003", code: "SR-2026-003", name: "Cafe Sari Bandung", client: "Ibu Sari Indah", value: 1200000000, progress: 58, stage: "Construction", pm: "Dimas Aryo", dueDate: "2026-11-01" },
  { id: "P-004", code: "SR-2026-004", name: "Al-Hidayah Mosque", client: "Yayasan Al-Hidayah", value: 6500000000, progress: 8, stage: "Design", pm: "Andi Pratama", dueDate: "2027-04-20" },
  { id: "P-005", code: "SR-2025-018", name: "Rumah Santoso", client: "Pak Budi Santoso", value: 2200000000, progress: 92, stage: "Invoice", pm: "Rina Kusuma", dueDate: "2026-06-30" },
];

export const mockProposals: Proposal[] = [
  { id: "PR-001", number: "PROP/2026/06/001", client: "Pak Ahmad Wijaya", project: "Villa Wijaya Ubud", value: 4500000000, status: "Approved", createdAt: "2026-05-20" },
  { id: "PR-002", number: "PROP/2026/06/002", client: "Ibu Sari Indah", project: "Cafe Sari Bandung", value: 1200000000, status: "Sent", createdAt: "2026-05-28" },
  { id: "PR-003", number: "PROP/2026/06/003", client: "PT Sentra Mandiri", project: "Sentra HQ Tower", value: 18000000000, status: "Revision", createdAt: "2026-05-22" },
  { id: "PR-004", number: "PROP/2026/06/004", client: "Pak Budi Santoso", project: "Rumah Santoso", value: 2200000000, status: "Draft", createdAt: "2026-06-01" },
];

export const mockSPK: SPK[] = [
  { id: "S-001", number: "005/EXT-Dir/SPK.PA/V/2026", client: "Pak Ahmad Wijaya", project: "Villa Wijaya Ubud", value: 4500000000, signedAt: "2026-05-25", status: "Signed", jenisPekerjaan: "Perancangan Arsitektur", kategori: "Membangun baru", mode: "plan", tier: "Premium", lokasi: "Ubud, Bali", luas: "10 x 32 m / 320 m²", durasiBulan: 5 },
  { id: "S-002", number: "006/EXT-Dir/SPK.PA/V/2026", client: "Yayasan Al-Hidayah", project: "Al-Hidayah Mosque", value: 6500000000, signedAt: "2026-05-15", status: "Signed", jenisPekerjaan: "Perancangan Arsitektur", kategori: "Membangun baru", mode: "plan", tier: "Premium", lokasi: "Yogyakarta", luas: "30 x 50 m / 1500 m²", durasiBulan: 6 },
  { id: "S-003", number: "007/EXT-Dir/SPK.DB/VI/2026", client: "PT Sentra Mandiri", project: "Sentra HQ Tower", value: 18000000000, signedAt: null, status: "Sent", jenisPekerjaan: "Design & Build", kategori: "Membangun baru", mode: "db", tier: "Luxury", lokasi: "Jakarta Selatan", luas: "20 x 40 m / 800 m²", durasiBulan: 14 },
  { id: "S-004", number: "008/EXT-Dir/SPK.PI/VI/2026", client: "Ibu Sari Indah", project: "Cafe Sari Bandung", value: 1200000000, signedAt: null, status: "Draft", jenisPekerjaan: "Perancangan Interior", kategori: "Interior fit-out", mode: "plan", tier: "Standar", lokasi: "Bandung", luas: "9 x 20 m / 180 m²", durasiBulan: 3 },
  { id: "S-005", number: "009/EXT-Dir/SPK.PA/VI/2026", client: "Pak Budi Santoso", project: "Rumah Santoso", value: 2200000000, signedAt: null, status: "Draft", jenisPekerjaan: "Perancangan Arsitektur", kategori: "Renovasi", mode: "plan", tier: "Standar", lokasi: "Surabaya", luas: "10 x 22 m / 220 m²", durasiBulan: 4 },
];

export const mockInvoices: Invoice[] = [
  { id: "I-001", number: "INV/2026/06/001", client: "Pak Ahmad Wijaya", project: "Villa Wijaya Ubud", type: "DP", amount: 1350000000, status: "Paid", dueDate: "2026-06-01" },
  { id: "I-002", number: "INV/2026/06/002", client: "Yayasan Al-Hidayah", project: "Al-Hidayah Mosque", type: "DP", amount: 1950000000, status: "Paid", dueDate: "2026-05-30" },
  { id: "I-003", number: "INV/2026/06/003", client: "Ibu Sari Indah", project: "Cafe Sari Bandung", type: "Progress", amount: 480000000, status: "Pending", dueDate: "2026-06-15" },
  { id: "I-004", number: "INV/2026/06/004", client: "Pak Budi Santoso", project: "Rumah Santoso", type: "Final", amount: 660000000, status: "Overdue", dueDate: "2026-05-28" },
  { id: "I-005", number: "INV/2026/06/005", client: "PT Sentra Mandiri", project: "Sentra HQ Tower", type: "DP", amount: 5400000000, status: "Sent", dueDate: "2026-06-20" },
];

export const revenueSeries = [
  { m: "Jan", v: 850 }, { m: "Feb", v: 1100 }, { m: "Mar", v: 980 },
  { m: "Apr", v: 1450 }, { m: "May", v: 1820 }, { m: "Jun", v: 2150 },
];

export const leadSourceData = [
  { name: "Instagram", value: 38 },
  { name: "Referral", value: 27 },
  { name: "Google Ads", value: 18 },
  { name: "WhatsApp", value: 12 },
  { name: "Other", value: 5 },
];
