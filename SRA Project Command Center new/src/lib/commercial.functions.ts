import { z } from "zod";
import { pmis } from "@/integrations/crm/client";
import { MAX_MONETARY, mapDbError } from "./money";

const money = z.number().max(MAX_MONETARY);
const pid = z.object({ projectId: z.string().uuid().optional().nullable() });
const idOnly = z.object({ id: z.string().uuid() });

/* CONTRACTS */
export async function listContracts({ data }: { data?: unknown } = {}) {
  const { projectId } = pid.parse(data ?? {});
  let q = pmis("contracts").select("*").order("created_at", { ascending: false });
  if (projectId) q = q.eq("project_id", projectId);
  const { data: rows, error } = await q;
  if (error) throw new Error(error.message);
  return { rows: rows ?? [] };
}

export async function createContract({ data }: { data: unknown }) {
  const parsed = z.object({
    project_id: z.string().uuid(),
    contract_no: z.string().min(1).max(100),
    title: z.string().min(1).max(200),
    counterparty: z.string().max(200).optional().nullable(),
    value: money.nonnegative().optional(),
    start_date: z.string().optional().nullable(),
    end_date: z.string().optional().nullable(),
    signed_date: z.string().optional().nullable(),
    status: z.string().max(30).optional(),
  }).parse(data);
  const { error } = await pmis("contracts").insert(parsed);
  if (error) throw mapDbError(error, "value");
  return { ok: true };
}

export async function updateContract({ data }: { data: unknown }) {
  const parsed = z.object({
    id: z.string().uuid(),
    contract_no: z.string().min(1).max(100).optional(),
    title: z.string().min(1).max(200).optional(),
    counterparty: z.string().max(200).optional().nullable(),
    value: money.nonnegative().optional().nullable(),
    start_date: z.string().optional().nullable(),
    end_date: z.string().optional().nullable(),
    signed_date: z.string().optional().nullable(),
    status: z.string().max(30).optional(),
  }).parse(data);
  const { id, ...patch } = parsed;
  const { error } = await pmis("contracts").update(patch).eq("id", id);
  if (error) throw mapDbError(error, "value");
  return { ok: true };
}

export async function deleteContract({ data }: { data: unknown }) {
  const { id } = idOnly.parse(data);
  const { error } = await pmis("contracts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

/* INVOICES */
export async function listInvoices({ data }: { data?: unknown } = {}) {
  const { projectId } = pid.parse(data ?? {});
  let q = pmis("invoices").select("*").order("issued_date", { ascending: false });
  if (projectId) q = q.eq("project_id", projectId);
  const { data: rows, error } = await q;
  if (error) throw new Error(error.message);
  return { rows: rows ?? [] };
}

export async function createInvoice({ data }: { data: unknown }) {
  const parsed = z.object({
    project_id: z.string().uuid(),
    invoice_no: z.string().min(1).max(100),
    amount: money.nonnegative(),
    tax_amount: money.nonnegative().optional(),
    issued_date: z.string().optional().nullable(),
    due_date: z.string().optional().nullable(),
    status: z.string().max(30).optional(),
    notes: z.string().max(2000).optional().nullable(),
  }).parse(data);
  const { error } = await pmis("invoices").insert(parsed);
  if (error) throw mapDbError(error, "amount/tax_amount");
  return { ok: true };
}

export async function updateInvoice({ data }: { data: unknown }) {
  const parsed = z.object({
    id: z.string().uuid(),
    invoice_no: z.string().min(1).max(100).optional(),
    amount: money.nonnegative().optional(),
    tax_amount: money.nonnegative().optional().nullable(),
    issued_date: z.string().optional().nullable(),
    due_date: z.string().optional().nullable(),
    status: z.string().max(30).optional(),
    notes: z.string().max(2000).optional().nullable(),
  }).parse(data);
  const { id, ...patch } = parsed;
  const { error } = await pmis("invoices").update(patch).eq("id", id);
  if (error) throw mapDbError(error, "amount/tax_amount");
  return { ok: true };
}

export async function deleteInvoice({ data }: { data: unknown }) {
  const { id } = idOnly.parse(data);
  const { error } = await pmis("invoices").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

/* VARIATION ORDERS */
export async function listVOs({ data }: { data?: unknown } = {}) {
  const { projectId } = pid.parse(data ?? {});
  let q = pmis("variation_orders").select("*").order("created_at", { ascending: false });
  if (projectId) q = q.eq("project_id", projectId);
  const { data: rows, error } = await q;
  if (error) throw new Error(error.message);
  return { rows: rows ?? [] };
}

export async function createVO({ data }: { data: unknown }) {
  const parsed = z.object({
    project_id: z.string().uuid(),
    vo_no: z.string().min(1).max(100),
    title: z.string().min(1).max(200),
    description: z.string().max(4000).optional().nullable(),
    amount: money.optional(),
    time_impact_days: z.number().int().optional(),
    submitted_date: z.string().optional().nullable(),
    status: z.string().max(30).optional(),
  }).parse(data);
  const { error } = await pmis("variation_orders").insert(parsed);
  if (error) throw mapDbError(error, "amount");
  return { ok: true };
}

export async function updateVO({ data }: { data: unknown }) {
  const parsed = z.object({
    id: z.string().uuid(),
    vo_no: z.string().min(1).max(100).optional(),
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(4000).optional().nullable(),
    amount: money.optional().nullable(),
    time_impact_days: z.number().int().optional(),
    submitted_date: z.string().optional().nullable(),
    status: z.string().max(30).optional(),
  }).parse(data);
  const { id, ...patch } = parsed;
  const { error } = await pmis("variation_orders").update(patch).eq("id", id);
  if (error) throw mapDbError(error, "amount");
  return { ok: true };
}

export async function deleteVO({ data }: { data: unknown }) {
  const { id } = idOnly.parse(data);
  const { error } = await pmis("variation_orders").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function cashflowSummary({ data }: { data?: unknown } = {}) {
  const { projectId } = pid.parse(data ?? {});
  let invQ = pmis("invoices").select("amount, tax_amount, status, issued_date, paid_date");
  let voQ = pmis("variation_orders").select("amount, status");
  let cQ = pmis("contracts").select("value, status");
  if (projectId) {
    invQ = invQ.eq("project_id", projectId);
    voQ = voQ.eq("project_id", projectId);
    cQ = cQ.eq("project_id", projectId);
  }
  const [{ data: inv }, { data: vos }, { data: contracts }] = await Promise.all([invQ, voQ, cQ]);
  const totalContract = ((contracts ?? []) as any[]).reduce((s, c: any) => s + Number(c.value ?? 0), 0);
  const totalVO = ((vos ?? []) as any[]).filter((v: any) => v.status === "approved").reduce((s, v: any) => s + Number(v.amount ?? 0), 0);
  const totalInvoiced = ((inv ?? []) as any[]).reduce((s, r: any) => s + Number(r.amount ?? 0) + Number(r.tax_amount ?? 0), 0);
  const totalPaid = ((inv ?? []) as any[]).filter((r: any) => r.status === "paid").reduce((s, r: any) => s + Number(r.amount ?? 0) + Number(r.tax_amount ?? 0), 0);
  return { totalContract, totalVO, totalInvoiced, totalPaid, outstanding: totalInvoiced - totalPaid };
}