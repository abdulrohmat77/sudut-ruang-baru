import { z } from "zod";
import { pmis } from "@/integrations/crm/client";

export async function listNotifications() {
  const { data, error } = await pmis("notifications")
    .select("*").order("created_at", { ascending: false }).limit(100);
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Array<{ read_at: string | null }>;
  const unread = rows.filter((r) => r.read_at == null).length;
  return { rows, unread };
}

export async function markNotificationRead({ data }: { data: { id: string } }) {
  const id = z.string().uuid().parse(data.id);
  const { error } = await pmis("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function markAllNotificationsRead() {
  const { error } = await pmis("notifications").update({ read_at: new Date().toISOString() }).is("read_at", null);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function listOverflowEvents() {
  // Overflow events are no longer tracked (overflow handler removed with auth).
  return { rows: [] as any[] };
}