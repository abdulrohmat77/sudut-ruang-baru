import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

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

export const getDashboardKPIs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => periodSchema.parse(d))
  .handler(async ({ data, context }) => {
    const since = periodStart(data.period).toISOString().slice(0, 10);
    const [{ data: invoices }, { data: projects }] = await Promise.all([
      context.supabase.from("invoices").select("amount, status, due_date, paid_date, issued_date"),
      context.supabase.from("projects").select("contract_value, status"),
    ]);
    const inv = invoices ?? [];
    const prj = projects ?? [];
    const today = new Date();
    const paidInPeriod = inv
      .filter((i: any) => i.status === "paid" && i.paid_date && i.paid_date >= since)
      .reduce((s: number, i: any) => s + Number(i.amount ?? 0), 0);
    const outstanding = inv.filter((i: any) => i.status !== "paid" && i.status !== "cancelled");
    const outstandingTotal = outstanding.reduce((s: number, i: any) => s + Number(i.amount ?? 0), 0);
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
    const contractTotal = prj.reduce((s: number, p: any) => s + Number(p.contract_value ?? 0), 0);
    const paidAll = inv.filter((i: any) => i.status === "paid").reduce((s: number, i: any) => s + Number(i.amount ?? 0), 0);
    const burnPct = contractTotal > 0 ? (paidAll / contractTotal) * 100 : 0;
    const marginPct = contractTotal > 0 ? ((contractTotal - paidAll) / contractTotal) * 100 : 0;

    const { count: overflowCount } = await context.supabase
      .from("overflow_events")
      .select("*", { count: "exact", head: true })
      .gte("created_at", new Date(today.getTime() - 86400000).toISOString());

    return {
      paidInPeriod,
      outstandingTotal,
      outstandingCount: outstanding.length,
      buckets,
      contractTotal,
      burnPct,
      marginPct,
      overflowCount: overflowCount ?? 0,
    };
  });

export const getDashboardTrends = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [{ data: invoices }, { data: projects }] = await Promise.all([
      context.supabase.from("invoices").select("amount, status, paid_date, issued_date"),
      context.supabase.from("projects").select("id, name, code, contract_value, progress_percent, planned_progress_percent"),
    ]);
    // Cashflow 6 bulan
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
    const prj = projects ?? [];
    const totalContract = prj.reduce((s: number, p: any) => s + Number(p.contract_value ?? 0), 0) || 1;
    const avgPlanned = prj.length ? prj.reduce((s: number, p: any) => s + Number(p.planned_progress_percent ?? 0), 0) / prj.length : 0;
    const avgActual = prj.length ? prj.reduce((s: number, p: any) => s + Number(p.progress_percent ?? 0), 0) / prj.length : 0;
    const contractBars = prj
      .map((p: any) => ({ id: p.id, name: p.name, code: p.code, value: Number(p.contract_value ?? 0) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
    return { cashflow: months, sCurve: { planned: avgPlanned, actual: avgActual }, contractBars, totalContract };
  });

export const getDashboardAlerts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const today = new Date().toISOString().slice(0, 10);
    const in7 = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
    const since24h = new Date(Date.now() - 86400000).toISOString();

    const [overdueQ, lagQ, hseQ, invDueQ, ovfQ, notifQ] = await Promise.all([
      context.supabase.from("projects").select("id, name, code, end_date").lt("end_date", today).neq("status", "completed"),
      context.supabase.from("projects").select("id, name, code, progress_percent, planned_progress_percent"),
      context.supabase.from("hse_incidents").select("id, incident_no, severity, status").neq("status", "closed"),
      context.supabase.from("invoices").select("id, invoice_no, amount, due_date, status").gte("due_date", today).lte("due_date", in7).neq("status", "paid"),
      context.supabase.from("overflow_events").select("id, field_name, table_name, created_at").gte("created_at", since24h).order("created_at", { ascending: false }).limit(10),
      context.supabase.from("notifications").select("id", { count: "exact", head: true }).is("read_at", null),
    ]);
    const lag = (lagQ.data ?? []).filter((p: any) =>
      Number(p.planned_progress_percent ?? 0) - Number(p.progress_percent ?? 0) > 15,
    );
    return {
      overdue: overdueQ.data ?? [],
      lag,
      hse: hseQ.data ?? [],
      invoicesDue: invDueQ.data ?? [],
      overflow: ovfQ.data ?? [],
      unreadNotifications: notifQ.count ?? 0,
    };
  });

export const getRiskMatrix = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("risks").select("probability, impact, status").neq("status", "closed");
    const levels = ["very_low", "low", "medium", "high", "very_high"] as const;
    const matrix: Record<string, Record<string, number>> = {};
    levels.forEach((l) => { matrix[l] = {}; levels.forEach((i) => { matrix[l][i] = 0; }); });
    (data ?? []).forEach((r: any) => {
      const p = r.probability as string;
      const i = r.impact as string;
      if (matrix[p] && matrix[p][i] !== undefined) matrix[p][i]++;
    });
    return { matrix, levels: levels as unknown as string[] };
  });

const prefsSchema = z.object({ widgets: z.record(z.string(), z.boolean()) });

export const saveDashboardPrefs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => prefsSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { data: prof } = await context.supabase.from("profiles").select("notification_prefs").eq("id", context.userId).single();
    const prefs = (prof?.notification_prefs as any) ?? {};
    prefs.dashboard_widgets = data.widgets;
    const { error } = await context.supabase.from("profiles").update({ notification_prefs: prefs }).eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getDashboardPrefs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("profiles").select("notification_prefs").eq("id", context.userId).single();
    const widgets = ((data?.notification_prefs as any)?.dashboard_widgets ?? {}) as Record<string, boolean>;
    return { widgets };
  });