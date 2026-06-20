import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { MAX_MONETARY, mapDbError } from "./money";
import { logOverflowAndNotify } from "./overflow-handler";

const money = z.number().max(MAX_MONETARY, {
  message: `Nilai melebihi batas maksimum (${MAX_MONETARY.toLocaleString("id-ID")})`,
});

const pid = z.object({ projectId: z.string().uuid().optional().nullable() });

/* ---------- CONTRACTS ---------- */
export const listContracts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => pid.parse(d))
  .handler(async ({ data, context }) => {
    let q = context.supabase.from("contracts").select("*, projects(name, code)").order("created_at", { ascending: false });
    if (data.projectId) q = q.eq("project_id", data.projectId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

export const createContract = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    project_id: z.string().uuid(),
    contract_no: z.string().min(1).max(100),
    title: z.string().min(1).max(200),
    counterparty: z.string().max(200).optional().nullable(),
    value: money.nonnegative().optional(),
    start_date: z.string().optional().nullable(),
    end_date: z.string().optional().nullable(),
    signed_date: z.string().optional().nullable(),
    status: z.string().max(30).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("contracts").insert(data);
    if (error) {
      await logOverflowAndNotify({
        supabase: context.supabase, userId: context.userId, userEmail: context.claims?.email ?? null,
        table: "contracts", field: "value", attemptedValue: data.value, payload: data, rawError: error,
      });
      throw mapDbError(error, "value");
    }
    return { ok: true };
  });

/* ---------- INVOICES ---------- */
export const listInvoices = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => pid.parse(d))
  .handler(async ({ data, context }) => {
    let q = context.supabase.from("invoices").select("*, projects(name, code)").order("issued_date", { ascending: false });
    if (data.projectId) q = q.eq("project_id", data.projectId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

export const createInvoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    project_id: z.string().uuid(),
    invoice_no: z.string().min(1).max(100),
    amount: money.nonnegative(),
    tax_amount: money.nonnegative().optional(),
    issued_date: z.string().optional().nullable(),
    due_date: z.string().optional().nullable(),
    status: z.string().max(30).optional(),
    notes: z.string().max(2000).optional().nullable(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("invoices").insert(data);
    if (error) {
      await logOverflowAndNotify({
        supabase: context.supabase, userId: context.userId, userEmail: context.claims?.email ?? null,
        table: "invoices", field: "amount", attemptedValue: data.amount, payload: data, rawError: error,
      });
      throw mapDbError(error, "amount/tax_amount");
    }
    return { ok: true };
  });

/* ---------- VARIATION ORDERS ---------- */
export const listVOs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => pid.parse(d))
  .handler(async ({ data, context }) => {
    let q = context.supabase.from("variation_orders").select("*, projects(name, code)").order("created_at", { ascending: false });
    if (data.projectId) q = q.eq("project_id", data.projectId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

export const createVO = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    project_id: z.string().uuid(),
    vo_no: z.string().min(1).max(100),
    title: z.string().min(1).max(200),
    description: z.string().max(4000).optional().nullable(),
    amount: money.optional(),
    time_impact_days: z.number().int().optional(),
    submitted_date: z.string().optional().nullable(),
    status: z.string().max(30).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("variation_orders").insert(data);
    if (error) {
      await logOverflowAndNotify({
        supabase: context.supabase, userId: context.userId, userEmail: context.claims?.email ?? null,
        table: "variation_orders", field: "amount", attemptedValue: data.amount, payload: data, rawError: error,
      });
      throw mapDbError(error, "amount");
    }
    return { ok: true };
  });

/* ---------- UPDATE / DELETE ---------- */
const idOnly = z.object({ id: z.string().uuid() });

export const updateContract = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    id: z.string().uuid(),
    contract_no: z.string().min(1).max(100).optional(),
    title: z.string().min(1).max(200).optional(),
    counterparty: z.string().max(200).optional().nullable(),
    value: money.nonnegative().optional().nullable(),
    start_date: z.string().optional().nullable(),
    end_date: z.string().optional().nullable(),
    signed_date: z.string().optional().nullable(),
    status: z.string().max(30).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const { error } = await context.supabase.from("contracts").update(patch).eq("id", id);
    if (error) throw mapDbError(error, "value");
    return { ok: true };
  });

export const deleteContract = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => idOnly.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("contracts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateInvoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    id: z.string().uuid(),
    invoice_no: z.string().min(1).max(100).optional(),
    amount: money.nonnegative().optional(),
    tax_amount: money.nonnegative().optional().nullable(),
    issued_date: z.string().optional().nullable(),
    due_date: z.string().optional().nullable(),
    status: z.string().max(30).optional(),
    notes: z.string().max(2000).optional().nullable(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const { error } = await context.supabase.from("invoices").update(patch).eq("id", id);
    if (error) throw mapDbError(error, "amount/tax_amount");
    return { ok: true };
  });

export const deleteInvoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => idOnly.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("invoices").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateVO = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    id: z.string().uuid(),
    vo_no: z.string().min(1).max(100).optional(),
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(4000).optional().nullable(),
    amount: money.optional().nullable(),
    time_impact_days: z.number().int().optional(),
    submitted_date: z.string().optional().nullable(),
    status: z.string().max(30).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const { error } = await context.supabase.from("variation_orders").update(patch).eq("id", id);
    if (error) throw mapDbError(error, "amount");
    return { ok: true };
  });

export const deleteVO = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => idOnly.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("variation_orders").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------- CASHFLOW SUMMARY ---------- */
export const cashflowSummary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => pid.parse(d))
  .handler(async ({ data, context }) => {
    let invQ = context.supabase.from("invoices").select("amount, tax_amount, status, issued_date, paid_date");
    let voQ = context.supabase.from("variation_orders").select("amount, status");
    let cQ = context.supabase.from("contracts").select("value, status");
    if (data.projectId) {
      invQ = invQ.eq("project_id", data.projectId);
      voQ = voQ.eq("project_id", data.projectId);
      cQ = cQ.eq("project_id", data.projectId);
    }
    const [{ data: inv }, { data: vos }, { data: contracts }] = await Promise.all([invQ, voQ, cQ]);
    const totalContract = (contracts ?? []).reduce((s, c: any) => s + Number(c.value ?? 0), 0);
    const totalVO = (vos ?? []).filter((v: any) => v.status === "approved").reduce((s, v: any) => s + Number(v.amount ?? 0), 0);
    const totalInvoiced = (inv ?? []).reduce((s, r: any) => s + Number(r.amount ?? 0) + Number(r.tax_amount ?? 0), 0);
    const totalPaid = (inv ?? []).filter((r: any) => r.status === "paid").reduce((s, r: any) => s + Number(r.amount ?? 0) + Number(r.tax_amount ?? 0), 0);
    const outstanding = totalInvoiced - totalPaid;
    return { totalContract, totalVO, totalInvoiced, totalPaid, outstanding };
  });