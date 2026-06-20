import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const pid = z.object({ projectId: z.string().uuid().optional().nullable() });

/* ============ Audit log ============ */
async function audit(
  sb: any,
  userId: string,
  action: string,
  entity: string,
  entity_id?: string | null,
  meta: Record<string, unknown> = {},
) {
  try {
    await sb.from("audit_logs").insert({ actor_id: userId, action, entity, entity_id: entity_id ?? null, meta });
  } catch {/* swallow */}
}

export const listAuditLogs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    entity: z.string().optional().nullable(),
    limit: z.number().int().min(1).max(500).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    let q = context.supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(data.limit ?? 100);
    if (data.entity) q = q.eq("entity", data.entity);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    const ids = Array.from(new Set((rows ?? []).map((r: any) => r.actor_id).filter(Boolean)));
    let profMap: Record<string, any> = {};
    if (ids.length) {
      const { data: profs } = await context.supabase.from("profiles").select("id, full_name, email").in("id", ids as any);
      (profs ?? []).forEach((p: any) => { profMap[p.id] = p; });
    }
    return { rows: (rows ?? []).map((r: any) => ({ ...r, actor: profMap[r.actor_id] ?? null })) };
  });

/* ============ Correspondence ============ */
export const listCorrespondence = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => pid.parse(d))
  .handler(async ({ data, context }) => {
    let q = context.supabase.from("correspondence").select("*, projects(name, code), correspondence_templates(name)").order("updated_at", { ascending: false }).limit(200);
    if (data.projectId) q = q.eq("project_id", data.projectId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

const correspondenceSchema = z.object({
  project_id: z.string().uuid(),
  ref_no: z.string().max(100).optional().nullable(),
  direction: z.enum(["in", "out"]),
  status: z.enum(["draft", "sent", "received"]).optional(),
  subject: z.string().min(1).max(300),
  from_party: z.string().max(200).optional().nullable(),
  to_party: z.string().max(200).optional().nullable(),
  sent_date: z.string().optional().nullable(),
  body: z.string().max(8000).optional().nullable(),
  attachment_url: z.string().url().max(2000).optional().nullable(),
  template_id: z.string().uuid().optional().nullable(),
});

export const createCorrespondence = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => correspondenceSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase.from("correspondence").insert(data).select("id").single();
    if (error) throw new Error(error.message);
    await audit(context.supabase, context.userId, "create", "correspondence", row?.id, { subject: data.subject });
    return { ok: true, id: row?.id };
  });

export const updateCorrespondence = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => correspondenceSchema.partial().extend({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const { error } = await context.supabase.from("correspondence").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    await audit(context.supabase, context.userId, "update", "correspondence", id, patch);
    return { ok: true };
  });

export const deleteCorrespondence = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("correspondence").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await audit(context.supabase, context.userId, "delete", "correspondence", data.id);
    return { ok: true };
  });

/* ============ Correspondence Templates ============ */
export const listCorrespondenceTemplates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("correspondence_templates").select("*").order("name");
    if (error) throw new Error(error.message);
    return { rows: data ?? [] };
  });

export const upsertCorrespondenceTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1).max(150),
    direction: z.enum(["in", "out"]),
    subject_template: z.string().min(1).max(300),
    body_template: z.string().max(8000).optional().nullable(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const payload: any = { ...data };
    if (!payload.id) payload.created_by = context.userId;
    const { error } = await context.supabase.from("correspondence_templates").upsert(payload);
    if (error) throw new Error(error.message);
    await audit(context.supabase, context.userId, payload.id ? "update" : "create", "correspondence_template", payload.id, { name: data.name });
    return { ok: true };
  });

export const deleteCorrespondenceTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("correspondence_templates").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await audit(context.supabase, context.userId, "delete", "correspondence_template", data.id);
    return { ok: true };
  });

/* ============ Storage: signed upload ============ */
export const createAttachmentUploadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    folder: z.enum(["correspondence", "meetings"]),
    project_id: z.string().uuid(),
    filename: z.string().min(1).max(200),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const safe = data.filename.replace(/[^A-Za-z0-9._-]/g, "_");
    const path = `${data.folder}/${data.project_id}/${Date.now()}-${safe}`;
    const { data: signed, error } = await context.supabase.storage.from("attachments").createSignedUploadUrl(path);
    if (error) throw new Error(error.message);
    const { data: pub } = context.supabase.storage.from("attachments").getPublicUrl(path);
    return { path, token: signed.token, signedUrl: signed.signedUrl, publicUrl: pub.publicUrl };
  });

export const getAttachmentSignedUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ path: z.string().min(1).max(500) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: s, error } = await context.supabase.storage.from("attachments").createSignedUrl(data.path, 60 * 60);
    if (error) throw new Error(error.message);
    return { signedUrl: s.signedUrl };
  });

/* ============ Meetings ============ */
export const listMeetings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => pid.parse(d))
  .handler(async ({ data, context }) => {
    let q = context.supabase.from("meetings").select("*, projects(name, code)").order("meeting_date", { ascending: false, nullsFirst: false }).limit(200);
    if (data.projectId) q = q.eq("project_id", data.projectId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

const meetingSchema = z.object({
  project_id: z.string().uuid(),
  title: z.string().min(1).max(300),
  meeting_date: z.string().optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  attendees: z.array(z.object({
    name: z.string().max(200),
    role: z.string().max(100).optional().nullable(),
    org: z.string().max(200).optional().nullable(),
    present: z.boolean().optional(),
  })).max(100).optional(),
  agenda: z.string().max(8000).optional().nullable(),
  minutes: z.string().max(16000).optional().nullable(),
  action_items: z.array(z.object({
    id: z.string().optional(),
    task: z.string().max(500),
    owner: z.string().max(200).optional().nullable(),
    due: z.string().optional().nullable(),
    done: z.boolean().optional(),
  })).max(100).optional(),
});

export const createMeeting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => meetingSchema.parse(d))
  .handler(async ({ data, context }) => {
    const ai = (data.action_items ?? []).map(a => ({ ...a, id: a.id ?? crypto.randomUUID(), done: a.done ?? false }));
    const { data: row, error } = await context.supabase.from("meetings").insert({ ...data, action_items: ai } as any).select("id").single();
    if (error) throw new Error(error.message);
    await audit(context.supabase, context.userId, "create", "meeting", row?.id, { title: data.title });
    return { ok: true, id: row?.id };
  });

export const updateMeeting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => meetingSchema.partial().extend({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data as any;
    if (Array.isArray(patch.action_items)) {
      patch.action_items = patch.action_items.map((a: any) => ({ ...a, id: a.id ?? crypto.randomUUID(), done: a.done ?? false }));
    }
    const { error } = await context.supabase.from("meetings").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    await audit(context.supabase, context.userId, "update", "meeting", id);
    return { ok: true };
  });

export const deleteMeeting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("meetings").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await audit(context.supabase, context.userId, "delete", "meeting", data.id);
    return { ok: true };
  });

export const toggleMeetingAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ meeting_id: z.string().uuid(), action_id: z.string(), done: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: row, error: e1 } = await context.supabase.from("meetings").select("action_items").eq("id", data.meeting_id).single();
    if (e1) throw new Error(e1.message);
    const items = Array.isArray(row?.action_items) ? row!.action_items : [];
    const next = (items as any[]).map(a => a.id === data.action_id ? { ...a, done: data.done } : a);
    const { error } = await context.supabase.from("meetings").update({ action_items: next }).eq("id", data.meeting_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ============ Site Photos ============ */
export const listPhotos = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => pid.parse(d))
  .handler(async ({ data, context }) => {
    let q = context.supabase.from("site_photos").select("*, projects(name, code)").order("taken_at", { ascending: false, nullsFirst: false }).limit(200);
    if (data.projectId) q = q.eq("project_id", data.projectId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

export const createPhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    project_id: z.string().uuid(),
    photo_url: z.string().url().max(2000),
    caption: z.string().max(500).optional().nullable(),
    taken_at: z.string().optional().nullable(),
    source: z.enum(["site", "drone"]).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("site_photos").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deletePhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("site_photos").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updatePhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    id: z.string().uuid(),
    caption: z.string().max(500).optional().nullable(),
    taken_at: z.string().optional().nullable(),
    source: z.enum(["site", "drone"]).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const { error } = await context.supabase.from("site_photos").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ============ Final Project Report (aggregated) ============ */
export const finalReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ projectId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const pid = data.projectId;
    const [proj, tasks, dailies, weeklies, monthlies, contracts, invoices, vos, qa, hse, risks, meetings, corr] = await Promise.all([
      sb.from("projects").select("*").eq("id", pid).single(),
      sb.from("project_tasks").select("weight, progress_percent, status").eq("project_id", pid),
      sb.from("daily_reports").select("id", { count: "exact", head: true }).eq("project_id", pid),
      sb.from("weekly_reports").select("planned_progress, actual_progress, variance").eq("project_id", pid),
      sb.from("monthly_reports").select("id", { count: "exact", head: true }).eq("project_id", pid),
      sb.from("contracts").select("contract_value, status").eq("project_id", pid),
      sb.from("invoices").select("amount, status").eq("project_id", pid),
      sb.from("variation_orders").select("impact_value, status").eq("project_id", pid),
      sb.from("qaqc_inspections").select("result").eq("project_id", pid),
      sb.from("hse_incidents").select("severity").eq("project_id", pid),
      sb.from("risks").select("probability, impact, status").eq("project_id", pid),
      sb.from("meetings").select("id, action_items").eq("project_id", pid),
      sb.from("correspondence").select("direction, status").eq("project_id", pid),
    ]);
    const ts = tasks.data ?? [];
    const totalWeight = ts.reduce((s, t: any) => s + Number(t.weight ?? 0), 0);
    const earned = ts.reduce((s, t: any) => s + (Number(t.weight ?? 0) * Number(t.progress_percent ?? 0) / 100), 0);
    const physicalProgress = totalWeight > 0 ? (earned / totalWeight) * 100 : 0;
    const wk = weeklies.data ?? [];
    const avgVariance = wk.length ? wk.reduce((s, w: any) => s + Number(w.variance ?? 0), 0) / wk.length : 0;
    const contractValue = (contracts.data ?? []).reduce((s, c: any) => s + Number(c.contract_value ?? 0), 0);
    const invPaid = (invoices.data ?? []).filter((i: any) => i.status === "paid").reduce((s, i: any) => s + Number(i.amount ?? 0), 0);
    const invOpen = (invoices.data ?? []).filter((i: any) => i.status !== "paid").reduce((s, i: any) => s + Number(i.amount ?? 0), 0);
    const voImpact = (vos.data ?? []).reduce((s, v: any) => s + Number(v.impact_value ?? 0), 0);
    const qaRows = qa.data ?? [];
    const qaPass = qaRows.filter((r: any) => r.result === "pass").length;
    const qaFail = qaRows.filter((r: any) => r.result === "fail").length;
    const hseBySeverity: Record<string, number> = {};
    (hse.data ?? []).forEach((h: any) => { hseBySeverity[h.severity ?? "low"] = (hseBySeverity[h.severity ?? "low"] ?? 0) + 1; });
    const openRisks = (risks.data ?? []).filter((r: any) => r.status !== "closed").length;
    let openActions = 0, doneActions = 0;
    (meetings.data ?? []).forEach((m: any) => {
      (m.action_items ?? []).forEach((a: any) => { a.done ? doneActions++ : openActions++; });
    });
    const corrRows = corr.data ?? [];
    const corrIn = corrRows.filter((c: any) => c.direction === "in").length;
    const corrOut = corrRows.filter((c: any) => c.direction === "out").length;
    return {
      project: proj.data,
      kpis: {
        physicalProgress,
        avgVariance,
        contractValue,
        invoicedPaid: invPaid,
        invoicedOpen: invOpen,
        voImpact,
        dailiesCount: dailies.count ?? 0,
        monthliesCount: monthlies.count ?? 0,
        qaPass, qaFail,
        hseBySeverity,
        openRisks,
        taskCount: ts.length,
        meetingsCount: (meetings.data ?? []).length,
        openActions, doneActions,
        correspondenceIn: corrIn,
        correspondenceOut: corrOut,
      },
      weeklyTrend: (weeklies.data ?? []).map((w: any, i: number) => ({
        idx: i + 1,
        planned: Number(w.planned_progress ?? 0),
        actual: Number(w.actual_progress ?? 0),
      })),
    };
  });

/* ============ Settings: roles & profile ============ */
export const listUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: profiles, error } = await context.supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const { data: roles } = await context.supabase.from("user_roles").select("user_id, role");
    const map: Record<string, string[]> = {};
    (roles ?? []).forEach((r: any) => { (map[r.user_id] ??= []).push(r.role); });
    return { users: (profiles ?? []).map((p: any) => ({ ...p, roles: map[p.id] ?? [] })) };
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    full_name: z.string().max(200).optional().nullable(),
    job_title: z.string().max(200).optional().nullable(),
    phone: z.string().max(50).optional().nullable(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("profiles").update(data).eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("profiles").select("*").eq("id", context.userId).single();
    if (error) throw new Error(error.message);
    const { data: roles } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
    return { profile: data, roles: (roles ?? []).map((r: any) => r.role) };
  });

/* ============ RBAC: Role management (super_admin only via RLS) ============ */
const APP_ROLES = [
  "super_admin","director","project_manager","site_engineer","quantity_surveyor",
  "scheduler","qaqc","hse","finance","client","read_only",
] as const;
export const APP_ROLE_LIST = APP_ROLES;

export const assignRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    user_id: z.string().uuid(),
    role: z.enum(APP_ROLES),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("user_roles").insert({ ...data, assigned_by: context.userId });
    if (error) throw new Error(error.message);
    await audit(context.supabase, context.userId, "assign_role", "user_role", data.user_id, { role: data.role });
    return { ok: true };
  });

export const revokeRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    user_id: z.string().uuid(),
    role: z.enum(APP_ROLES),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("user_roles").delete().eq("user_id", data.user_id).eq("role", data.role);
    if (error) throw new Error(error.message);
    await audit(context.supabase, context.userId, "revoke_role", "user_role", data.user_id, { role: data.role });
    return { ok: true };
  });

/* ============ Meeting summary for Daily / Final reports ============ */
export const meetingSummary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    projectId: z.string().uuid(),
    onDate: z.string().optional().nullable(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    let q = context.supabase.from("meetings").select("id, title, meeting_date, attendees, action_items").eq("project_id", data.projectId).order("meeting_date", { ascending: false });
    if (data.onDate) {
      const start = new Date(data.onDate); start.setHours(0,0,0,0);
      const end = new Date(data.onDate); end.setHours(23,59,59,999);
      q = q.gte("meeting_date", start.toISOString()).lte("meeting_date", end.toISOString());
    } else {
      q = q.limit(20);
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    let openActions = 0, doneActions = 0;
    (rows ?? []).forEach((m: any) => {
      (m.action_items ?? []).forEach((a: any) => { a.done ? doneActions++ : openActions++; });
    });
    return { rows: rows ?? [], openActions, doneActions, total: (rows ?? []).length };
  });