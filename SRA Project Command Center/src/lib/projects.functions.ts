import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { MAX_MONETARY, mapDbError } from "./money";
import { logOverflowAndNotify } from "./overflow-handler";

export const listProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { projects: data ?? [] };
  });

const createSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  client_name: z.string().max(200).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  contract_value: z.number().nonnegative().max(MAX_MONETARY, {
    message: `contract_value melebihi batas maksimum (${MAX_MONETARY.toLocaleString("id-ID")})`,
  }).optional().nullable(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  owner_name: z.string().max(200).optional().nullable(),
  owner_email: z.string().email().max(200).optional().nullable().or(z.literal("")),
  owner_phone: z.string().max(50).optional().nullable(),
});

export const createProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => createSchema.parse(data))
  .handler(async ({ data, context }) => {
    const payload = {
      ...data,
      owner_email: data.owner_email === "" ? null : data.owner_email,
    };
    const { data: row, error } = await context.supabase
      .from("projects")
      .insert({ ...payload, created_by: context.userId })
      .select()
      .single();
    if (error) {
      await logOverflowAndNotify({
        supabase: context.supabase,
        userId: context.userId,
        userEmail: context.claims?.email ?? null,
        table: "projects",
        field: "contract_value",
        attemptedValue: data.contract_value,
        payload,
        rawError: error,
      });
      throw mapDbError(error, "contract_value");
    }
    return { project: row };
  });

export const getProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: project, error } = await context.supabase
      .from("projects").select("*").eq("id", data.id).single();
    if (error) throw new Error(error.message);
    const { data: phases } = await context.supabase
      .from("project_phases").select("*").eq("project_id", data.id).order("sequence");
    return { project, phases: phases ?? [] };
  });

const updatePhaseSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["not_started", "in_progress", "completed", "blocked"]).optional(),
  planned_start: z.string().nullable().optional(),
  planned_end: z.string().nullable().optional(),
  actual_start: z.string().nullable().optional(),
  actual_end: z.string().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export const updatePhase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => updatePhaseSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { id, ...rest } = data;
    const { error } = await context.supabase
      .from("project_phases").update(rest).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const updateProjectSchema = createSchema.partial().extend({
  id: z.string().uuid(),
  status: z.string().max(30).optional(),
  progress_percent: z.number().min(0).max(100).optional().nullable(),
});

export const updateProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => updateProjectSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data as any;
    if (patch.owner_email === "") patch.owner_email = null;
    const { error } = await context.supabase.from("projects").update(patch).eq("id", id);
    if (error) throw mapDbError(error, "contract_value");
    return { ok: true };
  });

export const deleteProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("projects").delete().eq("id", data.id);
    if (error) throw new Error(error.message.includes("foreign") ? "Tidak bisa menghapus: project masih memiliki data terkait (task, invoice, dll)." : error.message);
    return { ok: true };
  });

export const dashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [{ data: projects }, { count: docsCount }, { count: kbCount }] = await Promise.all([
      context.supabase.from("projects").select("status, contract_value, progress_percent"),
      context.supabase.from("documents").select("*", { count: "exact", head: true }),
      context.supabase.from("kb_documents").select("*", { count: "exact", head: true }),
    ]);
    const all = projects ?? [];
    const totalValue = all.reduce((s, p: any) => s + Number(p.contract_value ?? 0), 0);
    const avgProgress = all.length
      ? all.reduce((s, p: any) => s + Number(p.progress_percent ?? 0), 0) / all.length
      : 0;
    const byStatus: Record<string, number> = {};
    all.forEach((p: any) => { byStatus[p.status] = (byStatus[p.status] ?? 0) + 1; });
    return {
      totalProjects: all.length,
      totalValue,
      avgProgress,
      byStatus,
      docsCount: docsCount ?? 0,
      kbCount: kbCount ?? 0,
    };
  });