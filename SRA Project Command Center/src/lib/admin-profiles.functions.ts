import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertSuperAdmin(context: any) {
  if (!context?.userId || typeof context.userId !== "string") {
    throw new Error("Akses ditolak — sesi tidak valid.");
  }
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "super_admin",
  });
  if (error) {
    console.error("[assertSuperAdmin] has_role RPC error", error);
    throw new Error("Akses ditolak — verifikasi role gagal.");
  }
  if (data !== true) {
    throw new Error("Akses ditolak — hanya super admin.");
  }
  return true;
}

export const listAllProfiles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name, job_title, phone, avatar_url, created_at, updated_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id, role");
    const roleMap = new Map<string, string[]>();
    for (const r of roles ?? []) {
      const arr = roleMap.get(r.user_id) ?? [];
      arr.push(r.role);
      roleMap.set(r.user_id, arr);
    }

    return {
      profiles: (profiles ?? []).map((p) => ({ ...p, roles: roleMap.get(p.id) ?? [] })),
    };
  });

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [projects, deliverables, contracts, invoices, risks, qaqc, hse, daily] = await Promise.all([
      supabaseAdmin.from("projects").select("id, code, name, client_name, location, status, progress_percent, contract_value, start_date, end_date").order("created_at", { ascending: false }),
      supabaseAdmin.from("phase_deliverables").select("id, project_id, phase_key, code, name, category, status, due_date, approved_at").order("phase_key").order("sequence"),
      supabaseAdmin.from("contracts").select("id, project_id, contract_no, title, counterparty, value, status, signed_date, end_date"),
      supabaseAdmin.from("invoices").select("id, project_id, invoice_no, amount, tax_amount, status, issued_date, due_date, paid_date"),
      supabaseAdmin.from("risks").select("id, project_id, title, category, probability, impact, status, mitigation"),
      supabaseAdmin.from("qaqc_inspections").select("id, project_id, inspection_no, area, inspection_type, result, inspected_date"),
      supabaseAdmin.from("hse_incidents").select("id, project_id, incident_no, incident_date, severity, category, description, status"),
      supabaseAdmin.from("daily_reports").select("id, project_id, report_date, weather, manpower_count, issues, progress_percent, status").order("report_date", { ascending: false }).limit(500),
    ]);

    const pMap = new Map((projects.data ?? []).map((p: any) => [p.id, p]));
    const decorate = (rows: any[] | null) =>
      (rows ?? []).map((r: any) => ({
        ...r,
        project_code: pMap.get(r.project_id)?.code ?? "—",
        project_name: pMap.get(r.project_id)?.name ?? "—",
      }));

    return {
      projects: projects.data ?? [],
      deliverables: decorate(deliverables.data),
      contracts: decorate(contracts.data),
      invoices: decorate(invoices.data),
      risks: decorate(risks.data),
      qaqc: decorate(qaqc.data),
      hse: decorate(hse.data),
      dailyReports: decorate(daily.data),
      generatedAt: new Date().toISOString(),
    };
  });