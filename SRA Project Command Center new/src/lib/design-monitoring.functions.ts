import { z } from "zod";
import { pmis } from "@/integrations/crm/client";
import { getCurrentUserName } from "./current-user";

export const SRA_PHASES = [
  { key: "brief", name: "01 · Brief & Kick-Off" },
  { key: "concept", name: "02 · Konsep Desain" },
  { key: "dd", name: "03 · Design Development (DD)" },
  { key: "ded", name: "04 · Detail Engineering Design" },
  { key: "tender", name: "05 · Tender / Procurement" },
  { key: "construction", name: "06 · Konstruksi & Supervisi" },
  { key: "bast", name: "07 · Closing & BAST" },
] as const;

export const GOV_TEMPLATE: Record<string, Array<{ code: string; name: string; category: string; required?: boolean }>> = {
  brief: [
    { code: "BRF-01", name: "KAK / TOR (Kerangka Acuan Kerja)", category: "dokumen" },
    { code: "BRF-02", name: "Surat Penugasan / SPMK Perencanaan", category: "administrasi" },
    { code: "BRF-03", name: "Data Awal Tapak & Survey Lokasi", category: "dokumen" },
    { code: "BRF-04", name: "Daftar Regulasi & Standar Acuan", category: "dokumen" },
    { code: "BRF-05", name: "Berita Acara Kick-Off Meeting", category: "ba" },
    { code: "BRF-06", name: "Jadwal Perencanaan (Time Schedule)", category: "dokumen" },
  ],
  concept: [
    { code: "KON-01", name: "Konsep Desain (Narasi & Diagram)", category: "dokumen" },
    { code: "KON-02", name: "Sketsa / Skematik Awal", category: "gambar" },
    { code: "KON-03", name: "Mood Board & Referensi Material", category: "gambar" },
    { code: "KON-04", name: "Estimasi Biaya Awal (Order of Magnitude)", category: "dokumen" },
    { code: "KON-05", name: "Laporan Pendahuluan", category: "laporan" },
    { code: "KON-06", name: "Berita Acara Asistensi Konsep", category: "ba" },
  ],
  dd: [
    { code: "DD-01", name: "Gambar Pra-Rencana Arsitektur", category: "gambar" },
    { code: "DD-02", name: "Pra-Rencana Struktur", category: "gambar" },
    { code: "DD-03", name: "Pra-Rencana MEP", category: "gambar" },
    { code: "DD-04", name: "Spesifikasi Material Awal", category: "dokumen" },
    { code: "DD-05", name: "RAB Tahap DD", category: "dokumen" },
    { code: "DD-06", name: "Laporan Antara", category: "laporan" },
    { code: "DD-07", name: "Berita Acara Asistensi DD", category: "ba" },
  ],
  ded: [
    { code: "DED-01", name: "Gambar DED Arsitektur (lengkap & berskala)", category: "gambar" },
    { code: "DED-02", name: "Gambar DED Struktur + Perhitungan", category: "gambar" },
    { code: "DED-03", name: "Gambar DED MEP (ME, Plumbing, Fire)", category: "gambar" },
    { code: "DED-04", name: "RKS (Rencana Kerja & Syarat-Syarat)", category: "dokumen" },
    { code: "DED-05", name: "BOQ (Bill of Quantity)", category: "dokumen" },
    { code: "DED-06", name: "RAB Final + Analisa Harga Satuan", category: "dokumen" },
    { code: "DED-07", name: "Spesifikasi Teknis Material", category: "dokumen" },
    { code: "DED-08", name: "Laporan Akhir Perencanaan", category: "laporan" },
    { code: "DED-09", name: "Berita Acara Serah Terima Dokumen DED", category: "ba" },
  ],
  tender: [
    { code: "TDR-01", name: "Dokumen Tender / Lelang", category: "dokumen" },
    { code: "TDR-02", name: "HPS (Harga Perkiraan Sendiri)", category: "dokumen" },
    { code: "TDR-03", name: "BoQ Tender (kosong harga)", category: "dokumen" },
    { code: "TDR-04", name: "Berita Acara Aanwijzing", category: "ba" },
    { code: "TDR-05", name: "Berita Acara Evaluasi Penawaran", category: "ba" },
    { code: "TDR-06", name: "Berita Acara Penetapan Pemenang", category: "ba" },
    { code: "TDR-07", name: "Kontrak Pelaksanaan Konstruksi", category: "dokumen" },
  ],
  construction: [
    { code: "KON-01", name: "Laporan MK / Pengawasan Mingguan", category: "laporan" },
    { code: "KON-02", name: "Approval Material & Shop Drawing", category: "dokumen" },
    { code: "KON-03", name: "Berita Acara Progress 25 / 50 / 75 / 100 %", category: "ba" },
    { code: "KON-04", name: "As-Built Drawing", category: "gambar" },
    { code: "KON-05", name: "Laporan Uji Mutu (test report)", category: "laporan" },
    { code: "KON-06", name: "Punch List Defect", category: "dokumen" },
  ],
  bast: [
    { code: "BAST-01", name: "Berita Acara Serah Terima I (PHO)", category: "ba" },
    { code: "BAST-02", name: "Berita Acara Serah Terima II (FHO)", category: "ba" },
    { code: "BAST-03", name: "Garansi / Warranty Pekerjaan", category: "administrasi" },
    { code: "BAST-04", name: "Manual Operation & Maintenance (O&M)", category: "dokumen" },
    { code: "BAST-05", name: "Berkas Serah Terima Aset", category: "administrasi" },
    { code: "BAST-06", name: "Laporan Akhir Proyek", category: "laporan" },
  ],
};

export async function listDeliverables({ data }: { data: { projectId: string } }) {
  const projectId = z.string().uuid().parse(data.projectId);
  const { data: rows, error } = await pmis("phase_deliverables").select("*").eq("project_id", projectId).order("phase_key").order("sequence").order("code");
  if (error) throw new Error(error.message);
  return { deliverables: rows ?? [] };
}

export async function seedGovTemplate({ data }: { data: { projectId: string; overwrite?: boolean } }) {
  const parsed = z.object({ projectId: z.string().uuid(), overwrite: z.boolean().optional() }).parse(data);
  if (parsed.overwrite) {
    await pmis("phase_deliverables").delete().eq("project_id", parsed.projectId);
  }
  const rows: any[] = [];
  const me = getCurrentUserName();
  for (const [phaseKey, items] of Object.entries(GOV_TEMPLATE)) {
    items.forEach((it, i) => {
      rows.push({
        project_id: parsed.projectId,
        phase_key: phaseKey,
        code: it.code, name: it.name, category: it.category,
        required: it.required ?? true, sequence: i + 1,
        created_by: me,
      });
    });
  }
  const { error } = await pmis("phase_deliverables").insert(rows);
  if (error) throw new Error(error.message);
  return { ok: true, inserted: rows.length };
}

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  project_id: z.string().uuid(),
  phase_key: z.string().min(1),
  code: z.string().max(40).nullable().optional(),
  name: z.string().min(1).max(300),
  category: z.string().max(40).default("dokumen"),
  required: z.boolean().default(true),
  due_date: z.string().nullable().optional(),
  file_url: z.string().max(1000).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  sequence: z.number().int().default(0),
});

export async function upsertDeliverable({ data }: { data: unknown }) {
  const parsed = upsertSchema.parse(data);
  if (parsed.id) {
    const { id, ...rest } = parsed;
    const { error } = await pmis("phase_deliverables").update(rest).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await pmis("phase_deliverables").insert({ ...parsed, created_by: getCurrentUserName() });
    if (error) throw new Error(error.message);
  }
  return { ok: true };
}

export async function updateDeliverableStatus({ data }: { data: unknown }) {
  const parsed = z.object({
    id: z.string().uuid(),
    status: z.enum(["todo", "in_progress", "in_review", "approved", "revisi"]),
  }).parse(data);
  const patch: any = { status: parsed.status };
  patch.approved_at = parsed.status === "approved" ? new Date().toISOString() : null;
  const { error } = await pmis("phase_deliverables").update(patch).eq("id", parsed.id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function deleteDeliverable({ data }: { data: { id: string } }) {
  const id = z.string().uuid().parse(data.id);
  const { error } = await pmis("phase_deliverables").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}