import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, tool, stepCountIs, type UIMessage } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { crmSupabase } from "@/integrations/crm/client";

const SYSTEM_BASE = `Anda adalah "SRA Assistant" — asisten AI internal Sudut Ruang Arsitek. Bahasa Indonesia formal. Terhubung live ke modul PMIS.`;

type ChatRequestBody = { messages?: unknown };

function tokenize(s: string): string[] { return s.toLowerCase().match(/[a-z0-9]{3,}/g) ?? []; }

async function buildKbContext(lastUserText: string): Promise<string> {
  const { data } = await crmSupabase.from("pmis_kb_documents").select("slug, title, category, content");
  if (!data || data.length === 0) return "";
  const tokens = new Set(tokenize(lastUserText));
  const scored = (data as any[]).map((d: any) => {
    const text = String(d.content ?? "").toLowerCase();
    let score = 0;
    tokens.forEach((t) => { score += text.split(t).length - 1; });
    return { ...d, score };
  });
  scored.sort((a: any, b: any) => b.score - a.score);
  const picked = scored.slice(0, 3).filter((d: any) => d.score > 0);
  const fallback = picked.length === 0 ? scored.slice(0, 2) : picked;
  const sections = fallback.map((d: any) => {
    const body = String(d.content ?? "");
    const cut = body.length > 12000 ? body.slice(0, 12000) + "\n…[dipotong]" : body;
    return `### ${d.title} (${d.category})\n${cut}`;
  });
  const toc = (data as any[]).map((d: any) => `- ${d.title} [${d.category}]`).join("\n");
  return `\n\n## KNOWLEDGE BASE\n${toc}\n\n## Konten relevan:\n\n${sections.join("\n\n---\n\n")}`;
}

function buildTools() {
  const sb = crmSupabase;
  return {
    list_projects: tool({
      description: "Daftar semua proyek.",
      inputSchema: z.object({}),
      execute: async () => {
        const { data } = await sb.from("pmis_projects").select("id, code, name, status, progress_percent, client_name").order("created_at", { ascending: false });
        return { projects: data ?? [] };
      },
    }),
    get_project_finance: tool({
      description: "Kontrak, invoice, VO untuk satu proyek.",
      inputSchema: z.object({ projectId: z.string().uuid() }),
      execute: async ({ projectId }) => {
        const [c, i, v] = await Promise.all([
          sb.from("pmis_contracts").select("contract_no, title, value, status").eq("project_id", projectId),
          sb.from("pmis_invoices").select("invoice_no, amount, status, issued_date, due_date").eq("project_id", projectId),
          sb.from("pmis_variation_orders").select("vo_no, title, amount, status, time_impact_days").eq("project_id", projectId),
        ]);
        return { contracts: c.data ?? [], invoices: i.data ?? [], variation_orders: v.data ?? [] };
      },
    }),
    get_project_progress: tool({
      description: "Fase + weekly progress.",
      inputSchema: z.object({ projectId: z.string().uuid() }),
      execute: async ({ projectId }) => {
        const [ph, wk] = await Promise.all([
          sb.from("pmis_project_phases").select("name, sequence, weight, progress, status").eq("project_id", projectId).order("sequence"),
          sb.from("pmis_weekly_reports").select("week_start, planned_progress, actual_progress, variance").eq("project_id", projectId).order("week_start"),
        ]);
        return { phases: ph.data ?? [], weekly: wk.data ?? [] };
      },
    }),
    get_recent_reports: tool({
      description: "Laporan terbaru.",
      inputSchema: z.object({ projectId: z.string().uuid().optional(), type: z.enum(["daily","weekly","monthly"]), limit: z.number().int().min(1).max(20).default(5) }),
      execute: async ({ projectId, type, limit }) => {
        const table = type === "daily" ? "pmis_daily_reports" : type === "weekly" ? "pmis_weekly_reports" : "pmis_monthly_reports";
        const dateCol = type === "daily" ? "report_date" : type === "weekly" ? "week_start" : "month";
        let q = sb.from(table).select("*").order(dateCol, { ascending: false }).limit(limit);
        if (projectId) q = q.eq("project_id", projectId);
        const { data } = await q;
        return { rows: data ?? [] };
      },
    }),
    get_open_risks: tool({
      description: "Risiko terbuka.",
      inputSchema: z.object({ projectId: z.string().uuid().optional() }),
      execute: async ({ projectId }) => {
        let q = sb.from("pmis_risks").select("title, category, probability, impact, status, mitigation").neq("status", "closed");
        if (projectId) q = q.eq("project_id", projectId);
        const { data } = await q;
        return { risks: data ?? [] };
      },
    }),
    get_hse_incidents: tool({
      description: "Insiden HSE.",
      inputSchema: z.object({ projectId: z.string().uuid().optional() }),
      execute: async ({ projectId }) => {
        let q = sb.from("pmis_hse_incidents").select("incident_date, severity, category, description, status").order("incident_date", { ascending: false }).limit(20);
        if (projectId) q = q.eq("project_id", projectId);
        const { data } = await q;
        return { incidents: data ?? [] };
      },
    }),
    get_qaqc_findings: tool({
      description: "QA/QC.",
      inputSchema: z.object({ projectId: z.string().uuid().optional() }),
      execute: async ({ projectId }) => {
        let q = sb.from("pmis_qaqc_inspections").select("inspected_date, inspection_type, area, result, notes").order("inspected_date", { ascending: false }).limit(20);
        if (projectId) q = q.eq("project_id", projectId);
        const { data } = await q;
        return { findings: data ?? [] };
      },
    }),
  };
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(messages)) return new Response("Messages are required", { status: 400 });
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        const uiMessages = messages as UIMessage[];
        const lastUser = [...uiMessages].reverse().find((m) => m.role === "user");
        const lastText = lastUser?.parts?.map((p: any) => (p.type === "text" ? p.text : "")).join(" ") ?? "";
        const kbContext = await buildKbContext(lastText);
        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-2.5-flash");
        const result = streamText({
          model,
          system: SYSTEM_BASE + kbContext,
          messages: await convertToModelMessages(uiMessages),
          tools: buildTools(),
          stopWhen: stepCountIs(50),
        });
        return result.toUIMessageStreamResponse({ originalMessages: uiMessages });
      },
    },
  },
});