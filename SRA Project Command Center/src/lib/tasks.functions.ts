import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const dateOpt = z.string().nullable().optional();

export const listTasks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ projectId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: tasks, error } = await context.supabase
      .from("project_tasks")
      .select("*")
      .eq("project_id", data.projectId)
      .order("wbs_code", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return { tasks: tasks ?? [] };
  });

const createSchema = z.object({
  project_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  parent_id: z.string().uuid().nullable().optional(),
  wbs_code: z.string().max(50).nullable().optional(),
  weight: z.number().min(0).max(100).optional(),
  planned_start: dateOpt,
  planned_end: dateOpt,
  description: z.string().max(2000).nullable().optional(),
});

export const createTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => createSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("project_tasks").insert(data).select().single();
    if (error) throw new Error(error.message);
    return { task: row };
  });

const updateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200).optional(),
  weight: z.number().min(0).max(100).optional(),
  progress_percent: z.number().min(0).max(100).optional(),
  status: z.enum(["not_started","in_progress","completed","blocked"]).optional(),
  planned_start: dateOpt,
  planned_end: dateOpt,
  actual_start: dateOpt,
  actual_end: dateOpt,
});

export const updateTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => updateSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { id, ...rest } = data;
    const { error } = await context.supabase.from("project_tasks").update(rest).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("project_tasks").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// S-Curve: cumulative planned vs actual progress per week.
export const sCurve = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ projectId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: tasks } = await context.supabase
      .from("project_tasks")
      .select("weight,progress_percent,planned_start,planned_end,actual_start,actual_end,status")
      .eq("project_id", data.projectId);
    const rows = (tasks ?? []).filter((t: any) => t.planned_start && t.planned_end);
    if (rows.length === 0) return { points: [] as { date: string; planned: number; actual: number | null }[] };
    const totalWeight = rows.reduce((s: number, t: any) => s + Number(t.weight ?? 0), 0) || 1;
    const minD = new Date(Math.min(...rows.map((t: any) => new Date(t.planned_start).getTime())));
    const maxD = new Date(Math.max(...rows.map((t: any) => new Date(t.planned_end).getTime())));
    const points: { date: string; planned: number; actual: number | null }[] = [];
    const today = new Date();
    const step = 7 * 86400000;
    for (let t = minD.getTime(); t <= maxD.getTime() + step; t += step) {
      const cursor = new Date(t);
      let planned = 0, actual = 0;
      for (const r of rows as any[]) {
        const ps = new Date(r.planned_start).getTime();
        const pe = new Date(r.planned_end).getTime();
        const w = Number(r.weight ?? 0);
        const dur = Math.max(1, pe - ps);
        const plannedFrac = Math.max(0, Math.min(1, (t - ps) / dur));
        planned += plannedFrac * w;
        if (cursor <= today) {
          const prog = Number(r.progress_percent ?? 0) / 100;
          actual += prog * w;
        }
      }
      points.push({
        date: cursor.toISOString().slice(0, 10),
        planned: Number(((planned / totalWeight) * 100).toFixed(2)),
        actual: cursor <= today ? Number(((actual / totalWeight) * 100).toFixed(2)) : null,
      });
    }
    return { points };
  });