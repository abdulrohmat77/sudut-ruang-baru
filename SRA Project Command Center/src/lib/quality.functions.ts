import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const pid = z.object({ projectId: z.string().uuid().optional().nullable() });
const severity = z.enum(["low", "medium", "high", "critical"]);

/* ---------- QA/QC ---------- */
export const listQAQC = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => pid.parse(d))
  .handler(async ({ data, context }) => {
    let q = context.supabase.from("qaqc_inspections").select("*, projects(name, code)").order("inspected_date", { ascending: false });
    if (data.projectId) q = q.eq("project_id", data.projectId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

export const createQAQC = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    project_id: z.string().uuid(),
    inspection_no: z.string().max(100).optional().nullable(),
    inspection_type: z.string().max(100).optional().nullable(),
    area: z.string().max(200).optional().nullable(),
    inspected_date: z.string().optional().nullable(),
    result: z.string().max(30).optional().nullable(),
    notes: z.string().max(4000).optional().nullable(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("qaqc_inspections").insert({ ...data, inspector_id: context.userId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------- HSE ---------- */
export const listHSE = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => pid.parse(d))
  .handler(async ({ data, context }) => {
    let q = context.supabase.from("hse_incidents").select("*, projects(name, code)").order("incident_date", { ascending: false });
    if (data.projectId) q = q.eq("project_id", data.projectId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

export const createHSE = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    project_id: z.string().uuid(),
    incident_no: z.string().max(100).optional().nullable(),
    incident_date: z.string().optional().nullable(),
    severity,
    category: z.string().max(100).optional().nullable(),
    description: z.string().max(4000).optional().nullable(),
    corrective_action: z.string().max(4000).optional().nullable(),
    status: z.string().max(30).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("hse_incidents").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------- RISKS ---------- */
export const listRisks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => pid.parse(d))
  .handler(async ({ data, context }) => {
    let q = context.supabase.from("risks").select("*, projects(name, code)").order("created_at", { ascending: false });
    if (data.projectId) q = q.eq("project_id", data.projectId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

export const createRisk = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    project_id: z.string().uuid(),
    title: z.string().min(1).max(200),
    category: z.string().max(100).optional().nullable(),
    probability: severity,
    impact: severity,
    mitigation: z.string().max(4000).optional().nullable(),
    status: z.string().max(30).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("risks").insert({ ...data, owner_id: context.userId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------- UPDATE / DELETE ---------- */
const idOnly = z.object({ id: z.string().uuid() });

export const updateQAQC = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    id: z.string().uuid(),
    inspection_no: z.string().max(100).optional().nullable(),
    inspection_type: z.string().max(100).optional().nullable(),
    area: z.string().max(200).optional().nullable(),
    inspected_date: z.string().optional().nullable(),
    result: z.string().max(30).optional().nullable(),
    notes: z.string().max(4000).optional().nullable(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const { error } = await context.supabase.from("qaqc_inspections").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
export const deleteQAQC = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => idOnly.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("qaqc_inspections").delete().eq("id", data.id);
    if (error) throw new Error(error.message); return { ok: true };
  });

export const updateHSE = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    id: z.string().uuid(),
    incident_no: z.string().max(100).optional().nullable(),
    incident_date: z.string().optional().nullable(),
    severity: severity.optional(),
    category: z.string().max(100).optional().nullable(),
    description: z.string().max(4000).optional().nullable(),
    corrective_action: z.string().max(4000).optional().nullable(),
    status: z.string().max(30).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const { error } = await context.supabase.from("hse_incidents").update(patch).eq("id", id);
    if (error) throw new Error(error.message); return { ok: true };
  });
export const deleteHSE = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => idOnly.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("hse_incidents").delete().eq("id", data.id);
    if (error) throw new Error(error.message); return { ok: true };
  });

export const updateRisk = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    id: z.string().uuid(),
    title: z.string().min(1).max(200).optional(),
    category: z.string().max(100).optional().nullable(),
    probability: severity.optional(),
    impact: severity.optional(),
    mitigation: z.string().max(4000).optional().nullable(),
    status: z.string().max(30).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const { error } = await context.supabase.from("risks").update(patch).eq("id", id);
    if (error) throw new Error(error.message); return { ok: true };
  });
export const deleteRisk = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => idOnly.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("risks").delete().eq("id", data.id);
    if (error) throw new Error(error.message); return { ok: true };
  });