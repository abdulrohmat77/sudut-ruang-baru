import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MODEL_FAST = "google/gemini-3-flash-preview";

function getModel() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Lovable AI tidak terkonfigurasi (LOVABLE_API_KEY hilang).");
  const gateway = createLovableAiGatewayProvider(key);
  return gateway(MODEL_FAST);
}

function cleanError(e: unknown): never {
  const msg = e instanceof Error ? e.message : String(e);
  if (msg.includes("429")) throw new Error("Rate limit AI tercapai. Coba lagi sebentar.");
  if (msg.includes("402")) throw new Error("Kredit AI workspace habis. Tambah kredit di Settings.");
  throw new Error(`AI gagal: ${msg}`);
}

/* ============================================================
   1. ANALISIS RISIKO PROYEK
============================================================ */
export const analyzeProjectRisks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ projectId: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const [proj, phases, risks, hse, qaqc, vos, invoices] = await Promise.all([
      supabase.from("projects").select("*").eq("id", data.projectId).single(),
      supabase.from("project_phases").select("name, status, weight, progress").eq("project_id", data.projectId),
      supabase.from("risks").select("title, category, probability, impact, mitigation, status").eq("project_id", data.projectId),
      supabase.from("hse_incidents").select("incident_date, severity, category, description, status").eq("project_id", data.projectId).order("incident_date", { ascending: false }).limit(20),
      supabase.from("qaqc_inspections").select("inspected_date, inspection_type, area, result, notes").eq("project_id", data.projectId).order("inspected_date", { ascending: false }).limit(20),
      supabase.from("variation_orders").select("vo_no, title, amount, time_impact_days, status").eq("project_id", data.projectId),
      supabase.from("invoices").select("invoice_no, amount, status, issued_date, due_date").eq("project_id", data.projectId),
    ]);

    const ctx = {
      project: proj.data,
      phases: phases.data ?? [],
      existing_risks: risks.data ?? [],
      hse_incidents: hse.data ?? [],
      qaqc_findings: qaqc.data ?? [],
      variation_orders: vos.data ?? [],
      invoices: invoices.data ?? [],
    };

    try {
      const { text } = await generateText({
        model: getModel(),
        system:
          "Anda adalah Risk Analyst senior proyek arsitektur & konstruksi (Sudut Ruang Arsitek). Identifikasi risiko proyek berdasarkan data yang diberikan. Output dalam Bahasa Indonesia, format Markdown ringkas dengan section: \n## Ringkasan Eksekutif\n## Risiko Teridentifikasi (tabel: Risiko | Kategori | Likelihood | Impact | Skor)\n## Early Warning\n## Rekomendasi Mitigasi (prioritaskan top 5)",
        prompt: `Analisis risiko untuk proyek berikut. Data live PMIS (JSON):\n\n${JSON.stringify(ctx).slice(0, 30000)}`,
      });
      return { markdown: text };
    } catch (e) { cleanError(e); }
  });

/* ============================================================
   2. RINGKAS LAPORAN (DAILY / WEEKLY / MONTHLY)
============================================================ */
export const summarizeReports = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      type: z.enum(["daily", "weekly", "monthly"]),
      projectId: z.string().uuid().optional().nullable(),
      reportIds: z.array(z.string().uuid()).optional(),
      dateFrom: z.string().optional().nullable(),
      dateTo: z.string().optional().nullable(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const table = data.type === "daily" ? "daily_reports" : data.type === "weekly" ? "weekly_reports" : "monthly_reports";
    const dateCol = data.type === "daily" ? "report_date" : data.type === "weekly" ? "week_start" : "month";

    let q = context.supabase.from(table).select("*, projects(name, code)").order(dateCol, { ascending: false }).limit(50);
    if (data.projectId) q = q.eq("project_id", data.projectId);
    if (data.reportIds?.length) q = q.in("id", data.reportIds);
    if (data.dateFrom) q = q.gte(dateCol, data.dateFrom);
    if (data.dateTo) q = q.lte(dateCol, data.dateTo);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    if (!rows || rows.length === 0) throw new Error("Tidak ada laporan untuk diringkas.");

    try {
      const { text } = await generateText({
        model: getModel(),
        system:
          "Anda adalah Project Director Sudut Ruang Arsitek. Ringkas laporan proyek untuk owner/management. Output Bahasa Indonesia, format Markdown:\n## Executive Digest\n## Progres Utama\n## Kendala & Risiko\n## K3 / HSE\n## Keputusan yang Dibutuhkan\n## Action Items (bullet, sertakan PIC bila ada)\n## Sentimen Proyek (Hijau / Kuning / Merah dengan alasan singkat)",
        prompt: `Ringkas ${rows.length} laporan ${data.type} berikut:\n\n${JSON.stringify(rows).slice(0, 30000)}`,
      });
      return { markdown: text, count: rows.length };
    } catch (e) { cleanError(e); }
  });

/* ============================================================
   3. PREDIKSI CASHFLOW & ETC (Estimate-to-Complete)
============================================================ */
export const forecastProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ projectId: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const [proj, phases, invoices, contracts, vos, weekly] = await Promise.all([
      supabase.from("projects").select("*").eq("id", data.projectId).single(),
      supabase.from("project_phases").select("name, weight, progress, status").eq("project_id", data.projectId),
      supabase.from("invoices").select("amount, status, issued_date, due_date").eq("project_id", data.projectId),
      supabase.from("contracts").select("value, status, signed_date").eq("project_id", data.projectId),
      supabase.from("variation_orders").select("amount, status, time_impact_days").eq("project_id", data.projectId),
      supabase.from("weekly_reports").select("week_start, planned_progress, actual_progress, variance").eq("project_id", data.projectId).order("week_start", { ascending: true }),
    ]);

    const p = proj.data;
    if (!p) throw new Error("Project tidak ditemukan.");

    const bac = Number(p.contract_value ?? 0);
    const actualProgress = Number(p.progress_percent ?? 0) / 100;
    const ev = bac * actualProgress;

    const invoicePaid = (invoices.data ?? []).filter((i) => i.status === "paid").reduce((s, i) => s + Number(i.amount ?? 0), 0);
    const invoiceOutstanding = (invoices.data ?? []).filter((i) => i.status !== "paid").reduce((s, i) => s + Number(i.amount ?? 0), 0);
    const voApproved = (vos.data ?? []).filter((v) => v.status === "approved").reduce((s, v) => s + Number(v.amount ?? 0), 0);
    const voPending = (vos.data ?? []).filter((v) => v.status !== "approved" && v.status !== "rejected").reduce((s, v) => s + Number(v.amount ?? 0), 0);
    const ac = invoicePaid;
    const cpi = ac > 0 ? ev / ac : 1;

    const lastWeekly = (weekly.data ?? []).slice(-1)[0];
    const planned = lastWeekly?.planned_progress ? Number(lastWeekly.planned_progress) / 100 : actualProgress;
    const pv = bac * planned;
    const spi = pv > 0 ? ev / pv : 1;

    const etc = (bac - ev) / (cpi || 1);
    const eac = ac + etc;

    let forecastDate: string | null = null;
    if (p.end_date && spi > 0) {
      const start = p.start_date ? new Date(p.start_date) : new Date();
      const plannedEnd = new Date(p.end_date);
      const totalDays = Math.max(1, (plannedEnd.getTime() - start.getTime()) / 86400000);
      const forecastDays = totalDays / spi;
      forecastDate = new Date(start.getTime() + forecastDays * 86400000).toISOString().slice(0, 10);
    }

    const metrics = {
      bac, ev, ac, pv, cpi, spi, etc, eac,
      progress_percent: Number(p.progress_percent ?? 0),
      invoicePaid, invoiceOutstanding, voApproved, voPending,
      forecastCompletionDate: forecastDate,
      plannedEnd: p.end_date,
    };

    try {
      const { text } = await generateText({
        model: getModel(),
        system:
          "Anda adalah Cost Engineer / PMO senior. Narasikan kondisi proyek dari metrik EVM yang diberikan. Bahasa Indonesia, Markdown ringkas:\n## Status Proyek (1 kalimat)\n## Tren Schedule & Cost\n## Prediksi Penyelesaian (optimis / realistis / pesimis)\n## Proyeksi Cashflow 3-6 Bulan\n## Risiko Likuiditas\n## Rekomendasi Tindakan (max 5 bullet)",
        prompt: `Proyek: ${p.name} (${p.code}). Metrik & data:\n${JSON.stringify({ metrics, phases: phases.data, contracts: contracts.data, weekly_history: weekly.data }).slice(0, 25000)}`,
      });
      return { metrics, markdown: text };
    } catch (e) { cleanError(e); }
  });