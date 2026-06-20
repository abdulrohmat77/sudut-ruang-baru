import { z } from "zod";
import { pmis } from "@/integrations/crm/client";

const periodSchema = z.object({
  period: z.enum(["7d", "30d", "90d", "ytd"]).default("30d"),
}).default({ period: "30d" });

function periodStart(period: string): Date {
  const now = new Date();
  if (period === "7d") return new Date(now.getTime() - 7 * 864e5);
  if (period === "90d") return new Date(now.getTime() - 90 * 864e5);
  if (period === "ytd") return new Date(now.getFullYear(), 0, 1);
  return new Date(now.getTime() - 30 * 864e5);
}

export async function getDashboardKPIs({ data }: { data?: unknown } = {}) {
  const parsed = periodSchema.parse(data ?? { period: "30d" });
  const since = periodStart(parsed.period).toISOString().slice(0, 10);
  const [{ data: invoices }, { data: projects }] = await Promise.all([
    pmis("invoices").select("amount, status, due_date, paid_date, issued_date"),
    pmis("projects").select("*"),
  ]);
  const inv = (invoices ?? []) as any[];
  const prj = (projects ?? []) as any[];
  const today = new Date();
  const paidInPeriod = inv
    .filter((i: any) => i.status === "paid" && i.paid_date && i.paid_date >= since)
    .reduce((s, i: any) => s + Number(i.amount ?? 0), 0);
  const outstanding = inv.filter((i: any) => i.status !== "paid" && i.status !== "cancelled");
  const outstandingTotal = outstanding.reduce((s, i: any) => s + Number(i.amount ?? 0), 0);
  const buckets = { d0_30: 0, d31_60: 0, d61_90: 0, d90p: 0 };
  outstanding.forEach((i: any) => {
    if (!i.due_date) return;
    const days = Math.floor((today.getTime() - new Date(i.due_date).getTime()) / 864e5);
    const amt = Number(i.amount ?? 0);
    if (days <= 30) buckets.d0_30 += amt;
    else if (days <= 60) buckets.d31_60 += amt;
    else if (days <= 90) buckets.d61_90 += amt;
    else buckets.d90p += amt;
  });
  const contractTotal = prj.reduce((s, p: any) => s + Number(p.contract_value ?? 0), 0);
  const paidAll = inv.filter((i: any) => i.status === "paid").reduce((s, i: any) => s + Number(i.amount ?? 0), 0);
  const burnPct = contractTotal > 0 ? (paidAll / contractTotal) * 100 : 0;
  const marginPct = contractTotal > 0 ? ((contractTotal - paidAll) / contractTotal) * 100 : 0;

  return {
    paidInPeriod,
    outstandingTotal,
    outstandingCount: outstanding.length,
    buckets,
    contractTotal,
    burnPct,
    marginPct,
    overflowCount: 0,
  };
}

export async function getDashboardTrends() {
  const [{ data: invoices }, { data: projects }] = await Promise.all([
    pmis("invoices").select("amount, status, paid_date, issued_date"),
    pmis("projects").select("*"),
  ]);
  const months: { key: string; label: string; inflow: number; outflow: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" }),
      inflow: 0,
      outflow: 0,
    });
  }
  (invoices ?? []).forEach((i: any) => {
    const amt = Number(i.amount ?? 0);
    if (i.status === "paid" && i.paid_date) {
      const k = i.paid_date.slice(0, 7);
      const m = months.find((x) => x.key === k);
      if (m) m.inflow += amt;
    } else if (i.issued_date && i.status !== "cancelled") {
      const k = i.issued_date.slice(0, 7);
      const m = months.find((x) => x.key === k);
      if (m) m.outflow += amt;
    }
  });
  const prj = (projects ?? []) as any[];
  const totalContract = prj.reduce((s, p: any) => s + Number(p.contract_value ?? 0), 0) || 1;
  const avgPlanned = prj.length ? prj.reduce((s, p: any) => s + Number(p.planned_progress_percent ?? 0), 0) / prj.length : 0;
  const avgActual = prj.length ? prj.reduce((s, p: any) => s + Number(p.progress_percent ?? 0), 0) / prj.length : 0;
  const contractBars = prj
    .map((p: any) => ({ id: p.id, name: p.name, code: p.code, value: Number(p.contract_value ?? 0) }))
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 10);
  return { cashflow: months, sCurve: { planned: avgPlanned, actual: avgActual }, contractBars, totalContract };
}

export async function getDashboardAlerts() {
  const today = new Date().toISOString().slice(0, 10);
  const in7 = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);

  const [projQ, hseQ, invDueQ, notifQ] = await Promise.all([
    pmis("projects").select("*"),
    pmis("hse_incidents").select("id, incident_no, severity, status").neq("status", "closed"),
    pmis("invoices").select("id, invoice_no, amount, due_date, status").gte("due_date", today).lte("due_date", in7).neq("status", "paid"),
    pmis("notifications").select("id", { count: "exact", head: true }).is("read_at", null),
  ]);
  const projs = (projQ.data ?? []) as any[];
  const overdue = projs.filter((p: any) => p.end_date && p.end_date < today && p.status !== "completed");
  const lag = projs.filter((p: any) => Number(p.planned_progress_percent ?? 0) - Number(p.progress_percent ?? 0) > 15);
  return {
    overdue,
    lag,
    hse: hseQ.data ?? [],
    invoicesDue: invDueQ.data ?? [],
    overflow: [],
    unreadNotifications: notifQ.count ?? 0,
  };
}

export async function getRiskMatrix() {
  const { data } = await pmis("risks").select("probability, impact, status").neq("status", "closed");
  const levels = ["very_low", "low", "medium", "high", "very_high"] as const;
  const matrix: Record<string, Record<string, number>> = {};
  levels.forEach((l) => { matrix[l] = {}; levels.forEach((i) => { matrix[l][i] = 0; }); });
  (data ?? []).forEach((r: any) => {
    const p = r.probability as string;
    const i = r.impact as string;
    if (matrix[p] && matrix[p][i] !== undefined) matrix[p][i]++;
  });
  return { matrix, levels: levels as unknown as string[] };
}

// Dashboard prefs now live in localStorage (no per-user backend without auth).
const PREFS_KEY = "pmis_dashboard_widgets";
export async function getDashboardPrefs() {
  if (typeof window === "undefined") return { widgets: {} as Record<string, boolean> };
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return { widgets: raw ? (JSON.parse(raw) as Record<string, boolean>) : {} };
  } catch { return { widgets: {} }; }
}
export async function saveDashboardPrefs({ data }: { data: { widgets: Record<string, boolean> } }) {
  if (typeof window !== "undefined") {
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(data.widgets)); } catch { /* ignore */ }
  }
  return { ok: true };
}