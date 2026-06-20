import { z } from "zod";
import { pmis } from "@/integrations/crm/client";

export async function getOrgSettings() {
  const { data, error } = await pmis("org_settings").select("*").maybeSingle();
  if (error) throw new Error(error.message);
  return { settings: data };
}

const UpdateSchema = z.object({
  fallback_owner_email: z.string().email().nullable().optional(),
  fallback_owner_phone: z.string().nullable().optional(),
  digest_hour_wib: z.number().int().min(0).max(23).optional(),
  digest_enabled: z.boolean().optional(),
  realtime_overflow_enabled: z.boolean().optional(),
  wa_from_number: z.string().nullable().optional(),
});

export async function updateOrgSettings({ data }: { data: unknown }) {
  const parsed = UpdateSchema.parse(data);
  // Upsert single row; org_settings expected to have at most one row.
  const { data: existing } = await pmis("org_settings").select("id").limit(1).maybeSingle();
  if (existing && (existing as any).id != null) {
    const { error } = await pmis("org_settings").update(parsed).eq("id", (existing as any).id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await pmis("org_settings").insert(parsed);
    if (error) throw new Error(error.message);
  }
  return { ok: true };
}

const PREFS_KEY = "pmis_notification_prefs";
export async function updateNotificationPrefs({ data }: { data: { prefs: Record<string, unknown> } }) {
  if (typeof window !== "undefined") {
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(data.prefs)); } catch { /* ignore */ }
  }
  return { ok: true };
}

export async function sendTestOwnerNotification(_: { data?: unknown } = {}) {
  return { ok: false, message: "Notifikasi owner non-aktif (mode CRM langsung)." };
}

export async function listWaSendLog() {
  const { data, error } = await pmis("wa_send_log").select("*").order("created_at", { ascending: false }).limit(50);
  if (error) throw new Error(error.message);
  return { rows: data ?? [] };
}

export async function listProjectsForOwners() {
  const { data, error } = await pmis("projects").select("id, code, name, owner_name, owner_email, owner_phone").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return { rows: data ?? [] };
}

export async function updateProjectOwner({ data }: { data: unknown }) {
  const parsed = z.object({
    id: z.string().uuid(),
    owner_name: z.string().nullable().optional(),
    owner_email: z.string().email().nullable().optional().or(z.literal("")),
    owner_phone: z.string().nullable().optional(),
  }).parse(data);
  const { id, ...rest } = parsed;
  const patch: any = {};
  if (rest.owner_name !== undefined) patch.owner_name = rest.owner_name || null;
  if (rest.owner_email !== undefined) patch.owner_email = rest.owner_email || null;
  if (rest.owner_phone !== undefined) patch.owner_phone = rest.owner_phone || null;
  const { error } = await pmis("projects").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}