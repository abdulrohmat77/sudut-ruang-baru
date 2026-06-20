import { z } from "zod";
import { pmis } from "@/integrations/crm/client";
import { getCurrentUserName } from "./current-user";

const pid = z.object({ projectId: z.string().uuid().optional().nullable() });
const idOnly = z.object({ id: z.string().uuid() });

export async function listDailyReports({ data }: { data?: unknown } = {}) {
  const { projectId } = pid.parse(data ?? {});
  let q = pmis("daily_reports").select("*").order("report_date", { ascending: false }).limit(200);
  if (projectId) q = q.eq("project_id", projectId);
  const { data: rows, error } = await q;
  if (error) throw new Error(error.message);
  return { rows: rows ?? [] };
}

export async function createDailyReport({ data }: { data: unknown }) {
  const parsed = z.object({
    project_id: z.string().uuid(),
    report_date: z.string(),
    weather: z.string().max(100).optional().nullable(),
    manpower_count: z.number().int().min(0).optional(),
    work_summary: z.string().max(4000).optional().nullable(),
    issues: z.string().max(4000).optional().nullable(),
    next_day_plan: z.string().max(4000).optional().nullable(),
    progress_percent: z.number().min(0).max(100).optional().nullable(),
  }).parse(data);
  const { error } = await pmis("daily_reports").insert({ ...parsed, submitted_by: getCurrentUserName() });
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function updateDailyReport({ data }: { data: unknown }) {
  const parsed = z.object({
    id: z.string().uuid(),
    report_date: z.string().optional(),
    weather: z.string().max(100).optional().nullable(),
    manpower_count: z.number().int().min(0).optional(),
    work_summary: z.string().max(4000).optional().nullable(),
    issues: z.string().max(4000).optional().nullable(),
    next_day_plan: z.string().max(4000).optional().nullable(),
    progress_percent: z.number().min(0).max(100).optional().nullable(),
  }).parse(data);
  const { id, ...patch } = parsed;
  const { error } = await pmis("daily_reports").update(patch).eq("id", id);
  if (error) throw new Error(error.message); return { ok: true };
}

export async function deleteDailyReport({ data }: { data: unknown }) {
  const { id } = idOnly.parse(data);
  const { error } = await pmis("daily_reports").delete().eq("id", id);
  if (error) throw new Error(error.message); return { ok: true };
}

export async function listWeeklyReports({ data }: { data?: unknown } = {}) {
  const { projectId } = pid.parse(data ?? {});
  let q = pmis("weekly_reports").select("*").order("week_start", { ascending: false }).limit(200);
  if (projectId) q = q.eq("project_id", projectId);
  const { data: rows, error } = await q;
  if (error) throw new Error(error.message);
  return { rows: rows ?? [] };
}

export async function createWeeklyReport({ data }: { data: unknown }) {
  const parsed = z.object({
    project_id: z.string().uuid(),
    week_start: z.string(),
    week_end: z.string(),
    planned_progress: z.number().min(0).max(100).optional().nullable(),
    actual_progress: z.number().min(0).max(100).optional().nullable(),
    summary: z.string().max(4000).optional().nullable(),
  }).parse(data);
  const variance = (parsed.actual_progress ?? 0) - (parsed.planned_progress ?? 0);
  const { error } = await pmis("weekly_reports").insert({ ...parsed, variance, submitted_by: getCurrentUserName() });
  if (error) throw new Error(error.message); return { ok: true };
}

export async function updateWeeklyReport({ data }: { data: unknown }) {
  const parsed = z.object({
    id: z.string().uuid(),
    week_start: z.string().optional(),
    week_end: z.string().optional(),
    planned_progress: z.number().min(0).max(100).optional().nullable(),
    actual_progress: z.number().min(0).max(100).optional().nullable(),
    summary: z.string().max(4000).optional().nullable(),
  }).parse(data);
  const { id, ...patch } = parsed as any;
  if (patch.actual_progress != null || patch.planned_progress != null) {
    patch.variance = (patch.actual_progress ?? 0) - (patch.planned_progress ?? 0);
  }
  const { error } = await pmis("weekly_reports").update(patch).eq("id", id);
  if (error) throw new Error(error.message); return { ok: true };
}

export async function deleteWeeklyReport({ data }: { data: unknown }) {
  const { id } = idOnly.parse(data);
  const { error } = await pmis("weekly_reports").delete().eq("id", id);
  if (error) throw new Error(error.message); return { ok: true };
}

export async function listMonthlyReports({ data }: { data?: unknown } = {}) {
  const { projectId } = pid.parse(data ?? {});
  let q = pmis("monthly_reports").select("*").order("month", { ascending: false }).limit(200);
  if (projectId) q = q.eq("project_id", projectId);
  const { data: rows, error } = await q;
  if (error) throw new Error(error.message);
  return { rows: rows ?? [] };
}

export async function createMonthlyReport({ data }: { data: unknown }) {
  const parsed = z.object({
    project_id: z.string().uuid(),
    month: z.string(),
    executive_summary: z.string().max(8000).optional().nullable(),
  }).parse(data);
  const { error } = await pmis("monthly_reports").insert(parsed);
  if (error) throw new Error(error.message); return { ok: true };
}

export async function updateMonthlyReport({ data }: { data: unknown }) {
  const parsed = z.object({
    id: z.string().uuid(),
    month: z.string().optional(),
    executive_summary: z.string().max(8000).optional().nullable(),
  }).parse(data);
  const { id, ...patch } = parsed;
  const { error } = await pmis("monthly_reports").update(patch).eq("id", id);
  if (error) throw new Error(error.message); return { ok: true };
}

export async function deleteMonthlyReport({ data }: { data: unknown }) {
  const { id } = idOnly.parse(data);
  const { error } = await pmis("monthly_reports").delete().eq("id", id);
  if (error) throw new Error(error.message); return { ok: true };
}