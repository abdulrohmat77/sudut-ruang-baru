import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { crmSupabase } from "@/integrations/crm/client";

const MODEL_FAST = "google/gemini-2.5-flash";

function getModel() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Lovable AI tidak terkonfigurasi.");
  return createLovableAiGatewayProvider(key)(MODEL_FAST);
}

function cleanError(e: unknown): never {
  const msg = e instanceof Error ? e.message : String(e);
  if (msg.includes("429")) throw new Error("Rate limit AI tercapai. Coba lagi sebentar.");
  if (msg.includes("402")) throw new Error("Kredit AI workspace habis.");
  throw new Error(`AI gagal: ${msg}`);
}

export const analyzeProjectRisks = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ projectId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const sb = crmSupabase;
    const [proj, phases, risks, hse, qaqc, vos, invoices] = await Promise.all([
      sb.from("pmis_projects").select("*").eq("id", data.projectId).single(),
      sb.from("pmis_project_phases").select("name, status, weight, progress").eq("project_id", data.projectId),
      sb.from("pmis_risks").select("title, category, probability, impact, mitigation, status").eq("project_id", data.projectId),
      sb.from("pmis_hse_incidents").select("incident_date, severity, category, description, status").eq("project_id", data.projectId).order("incident_date", { ascending: false }).limit(20),
      sb.from("pmis_qaqc_inspections").select("inspected_date, inspection_type, area, result, notes").eq("project_id", data.projectId).order("inspected_date", { ascending: false }).limit(20),
      sb.from("pmis_variation_orders").select("vo_no, title, amount, time_impact_days, status").eq("project_id", data.projectId),
      sb.from("pmis_invoices").select("invoice_no, amount, status, issued_date, due_date").eq("project_id", data.projectId),
    ]);
    const ctx = {
      project: proj.data, phases: phases.data ?? [], existing_risks: risks.data ?? [],
      hse_incidents: hse.data ?? [], qaqc_findings: qaqc.data ?? [],
      variation_orders: vos.data ?? [], invoices: invoices.data ?? [],
    };
    try {
      const { text } = await generateText({
        model: getModel(),
        system: "Anda adalah Risk Analyst senior proyek arsitektur (SRA). Output Markdown:\n## Ringkasan Eksekutif\n## Risiko Teridentifikasi\n## Early Warning\n## Rekomendasi Mitigasi",
        prompt: `Analisis risiko proyek:\n${JSON.stringify(ctx).slice(0, 30000)}`,
      });
      return { markdown: text };
    } catch (e) { cleanError(e); }
  });

export const summarizeReports = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({
    type: z.enum(["daily", "weekly", "monthly"]),
    projectId: z.string().uuid().optional().nullable(),
    reportIds: z.array(z.string().uuid()).optional(),
    dateFrom: z.string().optional().nullable(),
    dateTo: z.string().optional().nullable(),
  }).parse(d))
  .handler(async ({ data }) => {
    const table = data.type === "daily" ? "pmis_daily_reports" : data.type === "weekly" ? "pmis_weekly_reports" : "pmis_monthly_reports";
    const dateCol = data.type === "daily" ? "report_date" : data.type === "weekly" ? "week_start" : "month";
    let q = crmSupabase.from(table).select("*").order(dateCol, { ascending: false }).limit(50);
    if (data.projectId) q = q.eq("project_id", data.projectId);
    if (data.reportIds?.length) q = q.in("id", data.reportIds);
    if (data.dateFrom) q = q.gte(dateCol, data.dateFrom);
    if (data.dateTo) q = q.lte(dateCol, data.dateTo);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    if (!rows || rows.length === 0) throw new Error("Tidak ada laporan.");
    try {
      const { text } = await generateText({
        model: getModel(),
        system: "Anda Project Director. Output Markdown ringkas.",
        prompt: `Ringkas ${rows.length} laporan ${data.type}:\n${JSON.stringify(rows).slice(0, 30000)}`,
      });
      return { markdown: text, count: rows.length };
    } catch (e) { cleanError(e); }
  });

export const forecastProject = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ projectId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const sb = crmSupabase;
    const [proj, phases, invoices, contracts, vos, weekly] = await Promise.all([
      sb.from("pmis_projects").select("*").eq("id", data.projectId).single(),
      sb.from("pmis_project_phases").select("name, weight, progress, status").eq("project_id", data.projectId),
      sb.from("pmis_invoices").select("amount, status, issued_date, due_date").eq("project_id", data.projectId),
      sb.from("pmis_contracts").select("value, status, signed_date").eq("project_id", data.projectId),
      sb.from("pmis_variation_orders").select("amount, status, time_impact_days").eq("project_id", data.projectId),
      sb.from("pmis_weekly_reports").select("week_start, planned_progress, actual_progress, variance").eq("project_id", data.projectId).order("week_start", { ascending: true }),
    ]);
    const p: any = proj.data;
    if (!p) throw new Error("Project tidak ditemukan.");
    const bac = Number(p.contract_value ?? 0);
    const actualProgress = Number(p.progress_percent ?? 0) / 100;
    const ev = bac * actualProgress;
    const invs: any[] = (invoices.data ?? []) as any[];
    const invoicePaid = invs.filter((i: any) => i.status === "paid").reduce((s: number, i: any) => s + Number(i.amount ?? 0), 0);
    const invoiceOutstanding = invs.filter((i: any) => i.status !== "paid").reduce((s: number, i: any) => s + Number(i.amount ?? 0), 0);
    const vosArr: any[] = (vos.data ?? []) as any[];
    const voApproved = vosArr.filter((v: any) => v.status === "approved").reduce((s: number, v: any) => s + Number(v.amount ?? 0), 0);
    const voPending = vosArr.filter((v: any) => v.status !== "approved" && v.status !== "rejected").reduce((s: number, v: any) => s + Number(v.amount ?? 0), 0);
    const ac = invoicePaid;
    const cpi = ac > 0 ? ev / ac : 1;
    const wkArr: any[] = (weekly.data ?? []) as any[];
    const lastWeekly = wkArr.slice(-1)[0];
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
      forecastDate = new Date(start.getTime() + (totalDays / spi) * 86400000).toISOString().slice(0, 10);
    }
    const metrics = {
      bac, ev, ac, pv, cpi, spi, etc, eac,
      progress_percent: Number(p.progress_percent ?? 0),
      invoicePaid, invoiceOutstanding, voApproved, voPending,
      forecastCompletionDate: forecastDate, plannedEnd: p.end_date,
    };
    try {
      const { text } = await generateText({
        model: getModel(),
        system: "Anda Cost Engineer / PMO. Output Markdown ringkas.",
        prompt: `Proyek: ${p.name}. Metrik:\n${JSON.stringify({ metrics, phases: phases.data, contracts: contracts.data, weekly_history: weekly.data }).slice(0, 25000)}`,
      });
      return { metrics, markdown: text };
    } catch (e) { cleanError(e); }
  });