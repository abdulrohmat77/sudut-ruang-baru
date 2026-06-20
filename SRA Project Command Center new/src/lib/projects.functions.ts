import { z } from "zod";
import { pmis } from "@/integrations/crm/client";
import { MAX_MONETARY, mapDbError } from "./money";
import { getCurrentUserName } from "./current-user";

export async function listProjects() {
  const { data, error } = await pmis("projects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return { projects: data ?? [] };
}

const createSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  client_name: z.string().max(200).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  contract_value: z.number().nonnegative().max(MAX_MONETARY).optional().nullable(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  owner_name: z.string().max(200).optional().nullable(),
  owner_email: z.string().email().max(200).optional().nullable().or(z.literal("")),
  owner_phone: z.string().max(50).optional().nullable(),
});

export async function createProject({ data }: { data: unknown }) {
  const parsed = createSchema.parse(data);
  const payload = { ...parsed, owner_email: parsed.owner_email === "" ? null : parsed.owner_email };
  const { data: row, error } = await pmis("projects")
    .insert({ ...payload, created_by: getCurrentUserName() })
    .select()
    .single();
  if (error) throw mapDbError(error, "contract_value");
  return { project: row };
}

export async function getProject({ data }: { data: { id: string } }) {
  const id = z.string().uuid().parse(data.id);
  const [{ data: project, error }, { data: phases }] = await Promise.all([
    pmis("projects").select("*").eq("id", id).single(),
    pmis("project_phases").select("*").eq("project_id", id).order("sequence"),
  ]);
  if (error) throw new Error(error.message);
  return { project, phases: phases ?? [] };
}

const updatePhaseSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["not_started", "in_progress", "completed", "blocked"]).optional(),
  planned_start: z.string().nullable().optional(),
  planned_end: z.string().nullable().optional(),
  actual_start: z.string().nullable().optional(),
  actual_end: z.string().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export async function updatePhase({ data }: { data: unknown }) {
  const { id, ...rest } = updatePhaseSchema.parse(data);
  const { error } = await pmis("project_phases").update(rest).eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

const updateProjectSchema = createSchema.partial().extend({
  id: z.string().uuid(),
  status: z.string().max(30).optional(),
  progress_percent: z.number().min(0).max(100).optional().nullable(),
});

export async function updateProject({ data }: { data: unknown }) {
  const parsed = updateProjectSchema.parse(data) as any;
  const { id, ...patch } = parsed;
  if (patch.owner_email === "") patch.owner_email = null;
  const { error } = await pmis("projects").update(patch).eq("id", id);
  if (error) throw mapDbError(error, "contract_value");
  return { ok: true };
}

export async function deleteProject({ data }: { data: { id: string } }) {
  const id = z.string().uuid().parse(data.id);
  const { error } = await pmis("projects").delete().eq("id", id);
  if (error) throw new Error(error.message.includes("foreign") ? "Tidak bisa menghapus: project masih memiliki data terkait." : error.message);
  return { ok: true };
}

export async function dashboardStats() {
  const [{ data: projects }, { count: docsCount }, { count: kbCount }] = await Promise.all([
    pmis("projects").select("status, contract_value, progress_percent"),
    pmis("documents").select("*", { count: "exact", head: true }),
    pmis("kb_documents").select("*", { count: "exact", head: true }),
  ]);
  const all = (projects ?? []) as any[];
  const totalValue = all.reduce((s, p: any) => s + Number(p.contract_value ?? 0), 0);
  const avgProgress = all.length ? all.reduce((s, p: any) => s + Number(p.progress_percent ?? 0), 0) / all.length : 0;
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
}