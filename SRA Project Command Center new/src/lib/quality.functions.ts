import { z } from "zod";
import { pmis } from "@/integrations/crm/client";
import { getCurrentUserName } from "./current-user";

const pid = z.object({ projectId: z.string().uuid().optional().nullable() });
const severity = z.enum(["low", "medium", "high", "critical"]);
const idOnly = z.object({ id: z.string().uuid() });

export async function listQAQC({ data }: { data?: unknown } = {}) {
  const { projectId } = pid.parse(data ?? {});
  let q = pmis("qaqc_inspections").select("*").order("inspected_date", { ascending: false });
  if (projectId) q = q.eq("project_id", projectId);
  const { data: rows, error } = await q;
  if (error) throw new Error(error.message);
  return { rows: rows ?? [] };
}

export async function createQAQC({ data }: { data: unknown }) {
  const parsed = z.object({
    project_id: z.string().uuid(),
    inspection_no: z.string().max(100).optional().nullable(),
    inspection_type: z.string().max(100).optional().nullable(),
    area: z.string().max(200).optional().nullable(),
    inspected_date: z.string().optional().nullable(),
    result: z.string().max(30).optional().nullable(),
    notes: z.string().max(4000).optional().nullable(),
  }).parse(data);
  const { error } = await pmis("qaqc_inspections").insert({ ...parsed, inspector_id: getCurrentUserName() });
  if (error) throw new Error(error.message); return { ok: true };
}

export async function updateQAQC({ data }: { data: unknown }) {
  const parsed = z.object({
    id: z.string().uuid(),
    inspection_no: z.string().max(100).optional().nullable(),
    inspection_type: z.string().max(100).optional().nullable(),
    area: z.string().max(200).optional().nullable(),
    inspected_date: z.string().optional().nullable(),
    result: z.string().max(30).optional().nullable(),
    notes: z.string().max(4000).optional().nullable(),
  }).parse(data);
  const { id, ...patch } = parsed;
  const { error } = await pmis("qaqc_inspections").update(patch).eq("id", id);
  if (error) throw new Error(error.message); return { ok: true };
}

export async function deleteQAQC({ data }: { data: unknown }) {
  const { id } = idOnly.parse(data);
  const { error } = await pmis("qaqc_inspections").delete().eq("id", id);
  if (error) throw new Error(error.message); return { ok: true };
}

export async function listHSE({ data }: { data?: unknown } = {}) {
  const { projectId } = pid.parse(data ?? {});
  let q = pmis("hse_incidents").select("*").order("incident_date", { ascending: false });
  if (projectId) q = q.eq("project_id", projectId);
  const { data: rows, error } = await q;
  if (error) throw new Error(error.message);
  return { rows: rows ?? [] };
}

export async function createHSE({ data }: { data: unknown }) {
  const parsed = z.object({
    project_id: z.string().uuid(),
    incident_no: z.string().max(100).optional().nullable(),
    incident_date: z.string().optional().nullable(),
    severity,
    category: z.string().max(100).optional().nullable(),
    description: z.string().max(4000).optional().nullable(),
    corrective_action: z.string().max(4000).optional().nullable(),
    status: z.string().max(30).optional(),
  }).parse(data);
  const { error } = await pmis("hse_incidents").insert(parsed);
  if (error) throw new Error(error.message); return { ok: true };
}

export async function updateHSE({ data }: { data: unknown }) {
  const parsed = z.object({
    id: z.string().uuid(),
    incident_no: z.string().max(100).optional().nullable(),
    incident_date: z.string().optional().nullable(),
    severity: severity.optional(),
    category: z.string().max(100).optional().nullable(),
    description: z.string().max(4000).optional().nullable(),
    corrective_action: z.string().max(4000).optional().nullable(),
    status: z.string().max(30).optional(),
  }).parse(data);
  const { id, ...patch } = parsed;
  const { error } = await pmis("hse_incidents").update(patch).eq("id", id);
  if (error) throw new Error(error.message); return { ok: true };
}

export async function deleteHSE({ data }: { data: unknown }) {
  const { id } = idOnly.parse(data);
  const { error } = await pmis("hse_incidents").delete().eq("id", id);
  if (error) throw new Error(error.message); return { ok: true };
}

export async function listRisks({ data }: { data?: unknown } = {}) {
  const { projectId } = pid.parse(data ?? {});
  let q = pmis("risks").select("*").order("created_at", { ascending: false });
  if (projectId) q = q.eq("project_id", projectId);
  const { data: rows, error } = await q;
  if (error) throw new Error(error.message);
  return { rows: rows ?? [] };
}

export async function createRisk({ data }: { data: unknown }) {
  const parsed = z.object({
    project_id: z.string().uuid(),
    title: z.string().min(1).max(200),
    category: z.string().max(100).optional().nullable(),
    probability: severity,
    impact: severity,
    mitigation: z.string().max(4000).optional().nullable(),
    status: z.string().max(30).optional(),
  }).parse(data);
  const { error } = await pmis("risks").insert({ ...parsed, owner_id: getCurrentUserName() });
  if (error) throw new Error(error.message); return { ok: true };
}

export async function updateRisk({ data }: { data: unknown }) {
  const parsed = z.object({
    id: z.string().uuid(),
    title: z.string().min(1).max(200).optional(),
    category: z.string().max(100).optional().nullable(),
    probability: severity.optional(),
    impact: severity.optional(),
    mitigation: z.string().max(4000).optional().nullable(),
    status: z.string().max(30).optional(),
  }).parse(data);
  const { id, ...patch } = parsed;
  const { error } = await pmis("risks").update(patch).eq("id", id);
  if (error) throw new Error(error.message); return { ok: true };
}

export async function deleteRisk({ data }: { data: unknown }) {
  const { id } = idOnly.parse(data);
  const { error } = await pmis("risks").delete().eq("id", id);
  if (error) throw new Error(error.message); return { ok: true };
}