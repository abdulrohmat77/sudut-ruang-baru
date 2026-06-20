import { createFileRoute } from "@tanstack/react-router";

/**
 * Daily owner digest endpoint. Called by pg_cron at the configured WIB hour.
 * Aggregates overflow events from the last 24h per project and notifies each
 * project's owner (fallback to org-wide owner). Safe to call manually.
 *
 * Auth: anon apikey header (Lovable Cloud pg_cron pattern). Public route under
 * /api/public bypasses session auth; we still gate writes via supabaseAdmin.
 */
export const Route = createFileRoute("/api/public/hooks/owner-digest")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apikey = request.headers.get("apikey") ?? "";
        const expected = process.env.SUPABASE_PUBLISHABLE_KEY ?? "";
        if (!apikey || apikey !== expected) {
          return new Response("Unauthorized", { status: 401 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { notifyOwner } = await import("@/lib/owner-notify");

        // Read settings
        const { data: settings } = await supabaseAdmin
          .from("org_settings").select("*").eq("id", true).maybeSingle();
        if (settings && settings.digest_enabled === false) {
          return Response.json({ ok: true, skipped: "digest_disabled" });
        }

        const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data: events } = await supabaseAdmin
          .from("overflow_events")
          .select("project_id, table_name, field_name, attempted_value, created_at")
          .gte("created_at", since);

        const byProject = new Map<string | null, typeof events>();
        for (const e of events ?? []) {
          const k = (e.project_id ?? null) as string | null;
          if (!byProject.has(k)) byProject.set(k, [] as any);
          (byProject.get(k) as any).push(e);
        }

        const summary: Array<{ project: string; sent: boolean }> = [];

        for (const [projectId, evs] of byProject) {
          let ownerEmail: string | null = settings?.fallback_owner_email ?? null;
          let ownerPhone: string | null = settings?.fallback_owner_phone ?? null;
          let ownerName: string | null = null;
          let label = "Tanpa Proyek";
          if (projectId) {
            const { data: p } = await supabaseAdmin
              .from("projects")
              .select("name, code, owner_name, owner_email, owner_phone")
              .eq("id", projectId).maybeSingle();
            if (p) {
              ownerEmail = p.owner_email ?? ownerEmail;
              ownerPhone = p.owner_phone ?? ownerPhone;
              ownerName = p.owner_name ?? null;
              label = `${p.code ?? ""} ${p.name ?? ""}`.trim();
            }
          }
          if (!ownerEmail && !ownerPhone) {
            summary.push({ project: label, sent: false });
            continue;
          }
          const lines = (evs ?? []).slice(0, 50).map((e: any) =>
            `• ${e.table_name}.${e.field_name} = ${e.attempted_value ?? "-"} (${new Date(e.created_at).toLocaleString("id-ID")})`
          );
          await notifyOwner({
            ownerEmail, ownerPhone, ownerName,
            subject: `Digest Harian PMIS — ${label} (${(evs ?? []).length} kejadian)`,
            text: [
              `Ringkasan 24 jam terakhir untuk ${label}:`,
              `${(evs ?? []).length} input numerik ditolak.`,
              "",
              ...lines,
            ].join("\n"),
            idempotencyKey: `digest-${projectId ?? "none"}-${new Date().toISOString().slice(0,10)}`,
          });
          summary.push({ project: label, sent: true });
        }

        return Response.json({ ok: true, summary });
      },
    },
  },
});