import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const getOrgSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("org_settings")
      .select("*")
      .eq("id", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { settings: data };
  });

const UpdateSchema = z.object({
  fallback_owner_email: z.string().email().nullable().optional(),
  fallback_owner_phone: z.string().nullable().optional(),
  digest_hour_wib: z.number().int().min(0).max(23).optional(),
  digest_enabled: z.boolean().optional(),
  realtime_overflow_enabled: z.boolean().optional(),
  wa_from_number: z.string().nullable().optional(),
});

export const updateOrgSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => UpdateSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("org_settings")
      .update(data)
      .eq("id", true);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateNotificationPrefs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ prefs: z.record(z.string(), z.any()) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({ notification_prefs: data.prefs })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const sendTestOwnerNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ projectId: z.string().uuid().nullable().optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const isAdmin = await context.supabase
      .rpc("has_role", { _user_id: context.userId, _role: "super_admin" });
    if (!isAdmin.data) throw new Error("Forbidden");

    let ownerEmail: string | null = null;
    let ownerPhone: string | null = null;
    let ownerName: string | null = null;
    let label = "Sistem (fallback owner)";

    if (data.projectId) {
      const { data: p } = await context.supabase
        .from("projects")
        .select("name, code, owner_name, owner_email, owner_phone")
        .eq("id", data.projectId)
        .maybeSingle();
      if (p) {
        ownerEmail = p.owner_email;
        ownerPhone = p.owner_phone;
        ownerName = p.owner_name;
        label = `${p.code ?? ""} ${p.name ?? ""}`.trim();
      }
    }
    if (!ownerEmail && !ownerPhone) {
      const { data: s } = await context.supabase
        .from("org_settings")
        .select("fallback_owner_email, fallback_owner_phone")
        .eq("id", true)
        .maybeSingle();
      ownerEmail = s?.fallback_owner_email ?? null;
      ownerPhone = s?.fallback_owner_phone ?? null;
    }
    if (!ownerEmail && !ownerPhone) {
      return { ok: false, message: "Tidak ada kontak owner / fallback yang terkonfigurasi." };
    }
    const { notifyOwner } = await import("./owner-notify");
    const result = await notifyOwner({
      ownerEmail, ownerPhone, ownerName,
      subject: `Tes Notifikasi — ${label}`,
      text: `Ini adalah pesan tes dari PMIS untuk memverifikasi kanal notifikasi owner aktif.\nWaktu: ${new Date().toLocaleString("id-ID")}`,
      idempotencyKey: `test-${Date.now()}`,
    });
    return { ok: true, result };
  });

export const listWaSendLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("wa_send_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return { rows: data ?? [] };
  });

export const listProjectsForOwners = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("projects")
      .select("id, code, name, owner_name, owner_email, owner_phone")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { rows: data ?? [] };
  });

export const updateProjectOwner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid(),
      owner_name: z.string().nullable().optional(),
      owner_email: z.string().email().nullable().optional().or(z.literal("")),
      owner_phone: z.string().nullable().optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { id, ...rest } = data;
    const patch: { owner_name?: string | null; owner_email?: string | null; owner_phone?: string | null } = {};
    if (rest.owner_name !== undefined) patch.owner_name = rest.owner_name || null;
    if (rest.owner_email !== undefined) patch.owner_email = rest.owner_email || null;
    if (rest.owner_phone !== undefined) patch.owner_phone = rest.owner_phone || null;
    const { error } = await context.supabase.from("projects").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });