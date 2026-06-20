import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, tool, stepCountIs, type UIMessage } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const SYSTEM_BASE = `Anda adalah "SRA Assistant" — asisten AI internal Sudut Ruang Arsitek (SRA), studio Design & Build premium di Surabaya.

Karakter brand: Sage (70%) + Ruler (20%) + Creator (10%). Bicara perlahan, berbobot, terkurasi, profesional, hangat secara terukur. Gunakan Bahasa Indonesia formal namun tidak kaku, kecuali user menggunakan bahasa lain.

Anda membantu tim SRA untuk:
- Menjawab pertanyaan tentang SOP, scope of services, pricing internal, regulasi bangunan, FAQ klien, material, design style, dan portofolio.
- Membantu menyusun proposal, SPK, invoice, BAST, MOM berdasarkan template SRA.
- Memberi rekomendasi strategi proyek (swasta vs pemerintah/tender, hunian, korporat, IKN).
- Menjelaskan tahapan proyek SRA: Brief → Konsep → DD → DED → Tender → Konstruksi → BAST.

Selalu basis jawaban pada KNOWLEDGE BASE di bawah. Jika tidak ada di KB, sampaikan jujur dan beri rekomendasi terbaik berdasarkan praktik umum studio arsitektur Indonesia.

Anda juga TERHUBUNG LANGSUNG ke modul PMIS (data live). Gunakan tools berikut bila user menanyakan kondisi proyek, keuangan, progres, risiko, HSE, QA/QC, laporan, atau meminta forecast/ringkasan:
- list_projects: daftar proyek aktif.
- get_project_finance: kontrak, invoice, VO untuk proyek tertentu.
- get_project_progress: fase + S-curve mingguan.
- get_recent_reports: ambil laporan harian/mingguan/bulanan terbaru.
- get_open_risks, get_hse_incidents, get_qaqc_findings: data kualitas & risiko.
- analyze_risks: minta analisis risiko AI untuk satu proyek.
- summarize_reports: ringkas laporan periode tertentu.
- forecast_project: hitung EVM (CPI/SPI/ETC/EAC) + prediksi cashflow.

Selalu identifikasi projectId dengan memanggil list_projects dulu jika user menyebut nama proyek. Jangan mengarang data — jika tool gagal, sampaikan terus terang.`;

type ChatRequestBody = { messages?: unknown };

function tokenize(s: string): string[] {
  return s.toLowerCase().match(/[a-z0-9]{3,}/g) ?? [];
}

async function buildKbContext(lastUserText: string): Promise<string> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("kb_documents")
    .select("slug, title, category, content");
  if (!data || data.length === 0) return "";

  const tokens = new Set(tokenize(lastUserText));
  const scored = data.map((d) => {
    const text = d.content.toLowerCase();
    let score = 0;
    tokens.forEach((t) => {
      const matches = text.split(t).length - 1;
      score += matches;
    });
    return { ...d, score };
  });
  scored.sort((a, b) => b.score - a.score);

  // Take top 3 most-relevant docs, cap content at 12k chars each (~3k tokens)
  const picked = scored.slice(0, 3).filter((d) => d.score > 0);
  const fallback = picked.length === 0 ? scored.slice(0, 2) : picked;

  const sections = fallback.map((d) => {
    const body = d.content.length > 12000 ? d.content.slice(0, 12000) + "\n…[dipotong]" : d.content;
    return `### ${d.title} (${d.category})\n${body}`;
  });

  // Always include short table of contents
  const toc = data
    .map((d) => `- ${d.title} [${d.category}] (slug: ${d.slug})`)
    .join("\n");

  return `\n\n## KNOWLEDGE BASE SRA\n\nDaftar dokumen tersedia:\n${toc}\n\n## Konten dokumen paling relevan untuk pertanyaan terakhir:\n\n${sections.join("\n\n---\n\n")}`;
}

async function getAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function buildTools(gateway: ReturnType<typeof createLovableAiGatewayProvider>) {
  const model = gateway("google/gemini-3-flash-preview");
  return {
    list_projects: tool({
      description: "Daftar semua proyek (id, code, name, status, progress).",
      inputSchema: z.object({}),
      execute: async () => {
        const sb = await getAdmin();
        const { data } = await sb.from("projects").select("id, code, name, status, progress_percent, client_name").order("created_at", { ascending: false });
        return { projects: data ?? [] };
      },
    }),
    get_project_finance: tool({
      description: "Kontrak, invoice, dan VO untuk satu proyek.",
      inputSchema: z.object({ projectId: z.string().uuid() }),
      execute: async ({ projectId }) => {
        const sb = await getAdmin();
        const [c, i, v] = await Promise.all([
          sb.from("contracts").select("contract_no, title, value, status").eq("project_id", projectId),
          sb.from("invoices").select("invoice_no, amount, status, issued_date, due_date").eq("project_id", projectId),
          sb.from("variation_orders").select("vo_no, title, amount, status, time_impact_days").eq("project_id", projectId),
        ]);
        return { contracts: c.data ?? [], invoices: i.data ?? [], variation_orders: v.data ?? [] };
      },
    }),
    get_project_progress: tool({
      description: "Fase proyek + histori weekly progress (planned vs actual).",
      inputSchema: z.object({ projectId: z.string().uuid() }),
      execute: async ({ projectId }) => {
        const sb = await getAdmin();
        const [ph, wk] = await Promise.all([
          sb.from("project_phases").select("name, sequence, weight, progress, status").eq("project_id", projectId).order("sequence"),
          sb.from("weekly_reports").select("week_start, planned_progress, actual_progress, variance").eq("project_id", projectId).order("week_start"),
        ]);
        return { phases: ph.data ?? [], weekly: wk.data ?? [] };
      },
    }),
    get_recent_reports: tool({
      description: "Ambil laporan terbaru. type = daily | weekly | monthly.",
      inputSchema: z.object({
        projectId: z.string().uuid().optional(),
        type: z.enum(["daily", "weekly", "monthly"]),
        limit: z.number().int().min(1).max(20).default(5),
      }),
      execute: async ({ projectId, type, limit }) => {
        const sb = await getAdmin();
        const table = type === "daily" ? "daily_reports" : type === "weekly" ? "weekly_reports" : "monthly_reports";
        const dateCol = type === "daily" ? "report_date" : type === "weekly" ? "week_start" : "month";
        let q = sb.from(table).select("*").order(dateCol, { ascending: false }).limit(limit);
        if (projectId) q = q.eq("project_id", projectId);
        const { data } = await q;
        return { rows: data ?? [] };
      },
    }),
    get_open_risks: tool({
      description: "Daftar risiko terbuka. Opsional filter project.",
      inputSchema: z.object({ projectId: z.string().uuid().optional() }),
      execute: async ({ projectId }) => {
        const sb = await getAdmin();
        let q = sb.from("risks").select("title, category, probability, impact, status, mitigation").neq("status", "closed");
        if (projectId) q = q.eq("project_id", projectId);
        const { data } = await q;
        return { risks: data ?? [] };
      },
    }),
    get_hse_incidents: tool({
      description: "Insiden HSE terbaru.",
      inputSchema: z.object({ projectId: z.string().uuid().optional() }),
      execute: async ({ projectId }) => {
        const sb = await getAdmin();
        let q = sb.from("hse_incidents").select("incident_date, severity, category, description, status").order("incident_date", { ascending: false }).limit(20);
        if (projectId) q = q.eq("project_id", projectId);
        const { data } = await q;
        return { incidents: data ?? [] };
      },
    }),
    get_qaqc_findings: tool({
      description: "Temuan QA/QC terbaru.",
      inputSchema: z.object({ projectId: z.string().uuid().optional() }),
      execute: async ({ projectId }) => {
        const sb = await getAdmin();
        let q = sb.from("qaqc_inspections").select("inspected_date, inspection_type, area, result, notes").order("inspected_date", { ascending: false }).limit(20);
        if (projectId) q = q.eq("project_id", projectId);
        const { data } = await q;
        return { findings: data ?? [] };
      },
    }),
    forecast_project: tool({
      description: "Hitung EVM (CPI/SPI/ETC/EAC) + estimasi tanggal selesai untuk proyek.",
      inputSchema: z.object({ projectId: z.string().uuid() }),
      execute: async ({ projectId }) => {
        const sb = await getAdmin();
        const { data: p } = await sb.from("projects").select("*").eq("id", projectId).single();
        if (!p) return { error: "Project tidak ditemukan" };
        const { data: inv } = await sb.from("invoices").select("amount, status").eq("project_id", projectId);
        const { data: wk } = await sb.from("weekly_reports").select("planned_progress, actual_progress").eq("project_id", projectId).order("week_start", { ascending: false }).limit(1);
        const bac = Number(p.contract_value ?? 0);
        const prog = Number(p.progress_percent ?? 0) / 100;
        const ev = bac * prog;
        const ac = (inv ?? []).filter((i: any) => i.status === "paid").reduce((s: number, i: any) => s + Number(i.amount ?? 0), 0);
        const cpi = ac > 0 ? ev / ac : 1;
        const planned = wk?.[0]?.planned_progress ? Number(wk[0].planned_progress) / 100 : prog;
        const pv = bac * planned;
        const spi = pv > 0 ? ev / pv : 1;
        const etc = (bac - ev) / (cpi || 1);
        return { bac, ev, ac, pv, cpi, spi, etc, eac: ac + etc, progress_percent: p.progress_percent };
      },
    }),
  };
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }

        const uiMessages = messages as UIMessage[];
        const lastUser = [...uiMessages].reverse().find((m) => m.role === "user");
        const lastText =
          lastUser?.parts
            ?.map((p: any) => (p.type === "text" ? p.text : ""))
            .join(" ") ?? "";

        const kbContext = await buildKbContext(lastText);

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-2.5-flash");
        const result = streamText({
          model,
          system: SYSTEM_BASE + kbContext,
          messages: await convertToModelMessages(uiMessages),
          tools: buildTools(gateway),
          stopWhen: stepCountIs(50),
        });

        return result.toUIMessageStreamResponse({ originalMessages: uiMessages });
      },
    },
  },
});