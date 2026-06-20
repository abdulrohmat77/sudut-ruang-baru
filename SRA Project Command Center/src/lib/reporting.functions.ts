import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const pid = z.object({ projectId: z.string().uuid().optional().nullable() });

export const listDailyReports = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => pid.parse(d))
  .handler(async ({ data, context }) => {
    let q = context.supabase.from("daily_reports").select("*, projects(name, code)").order("report_date", { ascending: false }).limit(200);
    if (data.projectId) q = q.eq("project_id", data.projectId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

export const createDailyReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    project_id: z.string().uuid(),
    report_date: z.string(),
    weather: z.string().max(100).optional().nullable(),
    manpower_count: z.number().int().min(0).optional(),
    work_summary: z.string().max(4000).optional().nullable(),
    issues: z.string().max(4000).optional().nullable(),
    next_day_plan: z.string().max(4000).optional().nullable(),
    progress_percent: z.number().min(0).max(100).optional().nullable(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("daily_reports").insert({ ...data, submitted_by: context.userId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listWeeklyReports = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => pid.parse(d))
  .handler(async ({ data, context }) => {
    let q = context.supabase.from("weekly_reports").select("*, projects(name, code)").order("week_start", { ascending: false }).limit(200);
    if (data.projectId) q = q.eq("project_id", data.projectId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

export const createWeeklyReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    project_id: z.string().uuid(),
    week_start: z.string(),
    week_end: z.string(),
    planned_progress: z.number().min(0).max(100).optional().nullable(),
    actual_progress: z.number().min(0).max(100).optional().nullable(),
    summary: z.string().max(4000).optional().nullable(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const variance = (data.actual_progress ?? 0) - (data.planned_progress ?? 0);
    const { error } = await context.supabase.from("weekly_reports").insert({ ...data, variance, submitted_by: context.userId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listMonthlyReports = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => pid.parse(d))
  .handler(async ({ data, context }) => {
    let q = context.supabase.from("monthly_reports").select("*, projects(name, code)").order("month", { ascending: false }).limit(200);
    if (data.projectId) q = q.eq("project_id", data.projectId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

export const createMonthlyReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    project_id: z.string().uuid(),
    month: z.string(),
    executive_summary: z.string().max(8000).optional().nullable(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("monthly_reports").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------- UPDATE / DELETE ---------- */
const idOnly = z.object({ id: z.string().uuid() });

export const updateDailyReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    id: z.string().uuid(),
    report_date: z.string().optional(),
    weather: z.string().max(100).optional().nullable(),
    manpower_count: z.number().int().min(0).optional(),
    work_summary: z.string().max(4000).optional().nullable(),
    issues: z.string().max(4000).optional().nullable(),
    next_day_plan: z.string().max(4000).optional().nullable(),
    progress_percent: z.number().min(0).max(100).optional().nullable(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const { error } = await context.supabase.from("daily_reports").update(patch).eq("id", id);
    if (error) throw new Error(error.message); return { ok: true };
  });
export const deleteDailyReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => idOnly.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("daily_reports").delete().eq("id", data.id);
    if (error) throw new Error(error.message); return { ok: true };
  });

export const updateWeeklyReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    id: z.string().uuid(),
    week_start: z.string().optional(),
    week_end: z.string().optional(),
    planned_progress: z.number().min(0).max(100).optional().nullable(),
    actual_progress: z.number().min(0).max(100).optional().nullable(),
    summary: z.string().max(4000).optional().nullable(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data as any;
    if (patch.actual_progress != null || patch.planned_progress != null) {
      patch.variance = (patch.actual_progress ?? 0) - (patch.planned_progress ?? 0);
    }
    const { error } = await context.supabase.from("weekly_reports").update(patch).eq("id", id);
    if (error) throw new Error(error.message); return { ok: true };
  });
export const deleteWeeklyReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => idOnly.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("weekly_reports").delete().eq("id", data.id);
    if (error) throw new Error(error.message); return { ok: true };
  });

export const updateMonthlyReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    id: z.string().uuid(),
    month: z.string().optional(),
    executive_summary: z.string().max(8000).optional().nullable(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const { error } = await context.supabase.from("monthly_reports").update(patch).eq("id", id);
    if (error) throw new Error(error.message); return { ok: true };
  });
export const deleteMonthlyReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => idOnly.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("monthly_reports").delete().eq("id", data.id);
    if (error) throw new Error(error.message); return { ok: true };
  });