/**
 * Shared overflow logging + owner notification path.
 * Imported only from server fn handlers — owner-notify.server is dynamically
 * imported so it never enters the client bundle of *.functions.ts files.
 */
import { mapDbError } from "./money";
import { notifyOwner } from "./owner-notify";

interface Args {
  supabase: any;
  userId: string;
  userEmail?: string | null;
  table: string;
  field: string;
  attemptedValue?: unknown;
  payload?: Record<string, unknown>;
  rawError: unknown;
}

function isOverflowError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : typeof err === "object" && err && "message" in err
    ? String((err as { message: unknown }).message)
    : String(err);
  return /numeric field overflow/i.test(msg)
    || /_monetary_range_chk/i.test(msg)
    || /violates check constraint.*monetary/i.test(msg);
}

export async function logOverflowAndNotify(a: Args): Promise<void> {
  if (!isOverflowError(a.rawError)) return; // not an overflow, leave caller error handling alone

  const msg = a.rawError instanceof Error ? a.rawError.message : String(a.rawError);
  // eslint-disable-next-line no-console
  console.error("[overflow]", JSON.stringify({
    table: a.table, field: a.field, msg, at: new Date().toISOString(),
  }));

  const projectId = (a.payload as any)?.project_id ?? null;

  // 1) Persist to overflow_events for the Super Admin activity log.
  try {
    await a.supabase.from("overflow_events").insert({
      user_id: a.userId,
      user_email: a.userEmail ?? null,
      project_id: typeof projectId === "string" ? projectId : null,
      table_name: a.table,
      field_name: a.field,
      attempted_value: a.attemptedValue == null ? null : String(a.attemptedValue),
      payload: a.payload ?? {},
      raw_error: msg,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[overflow] failed to insert event", e);
  }

  // 2) Per-user notification in the bell center.
  try {
    const friendly = mapDbError(a.rawError, a.field).message;
    await a.supabase.from("notifications").insert({
      user_id: a.userId,
      type: "overflow",
      title: `Nilai ditolak: "${a.field}"`,
      body: friendly,
      link: "/settings",
      meta: { table: a.table, field: a.field, projectId },
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[overflow] failed to insert notification", e);
  }

  // 3) Real-time owner push (email + WA). Best-effort; never throws.
  if (typeof projectId === "string" && projectId) {
    try {
      const { data: project } = await a.supabase
        .from("projects")
        .select("name, code, owner_name, owner_email, owner_phone")
        .eq("id", projectId)
        .maybeSingle();
      if (project && (project.owner_email || project.owner_phone)) {
        await notifyOwner({
          ownerName: project.owner_name,
          ownerEmail: project.owner_email,
          ownerPhone: project.owner_phone,
          subject: `⚠️ Input ditolak — ${project.code ?? ""} ${project.name ?? ""}`.trim(),
          text: [
            `Sebuah input nilai pada proyek ${project.name} (${project.code ?? "-"}) ditolak sistem.`,
            `Kolom: ${a.field}`,
            `Nilai dicoba: ${String(a.attemptedValue ?? "-")}`,
            `Alasan: ${msg}`,
          ].join("\n"),
          templateName: "owner-overflow-alert",
          templateData: {
            projectName: project.name,
            projectCode: project.code,
            fieldName: a.field,
            attemptedValue: String(a.attemptedValue ?? "-"),
            reason: msg,
          },
          idempotencyKey: `overflow-${a.table}-${a.field}-${Date.now()}`,
        });
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("[overflow] owner notify failed", e);
    }
  }
}