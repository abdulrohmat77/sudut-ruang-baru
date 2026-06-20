import { pmis } from "@/integrations/crm/client";

export async function listAllProfiles() {
  const { data: profiles, error } = await pmis("profiles")
    .select("id, email, full_name, job_title, phone, avatar_url, created_at, updated_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const { data: roles } = await pmis("user_roles").select("user_id, role");
  const roleMap = new Map<string, string[]>();
  for (const r of ((roles ?? []) as any[])) {
    const arr = roleMap.get(r.user_id) ?? [];
    arr.push(r.role);
    roleMap.set(r.user_id, arr);
  }
  return { profiles: ((profiles ?? []) as any[]).map((p: any) => ({ ...p, roles: roleMap.get(p.id) ?? [] })) };
}

export async function getAdminOverview() {
  const [projects, deliverables, contracts, invoices, risks, qaqc, hse, daily] = await Promise.all([
    pmis("projects").select("id, code, name, client_name, location, status, progress_percent, contract_value, start_date, end_date").order("created_at", { ascending: false }),
    pmis("phase_deliverables").select("id, project_id, phase_key, code, name, category, status, due_date, approved_at").order("phase_key").order("sequence"),
    pmis("contracts").select("id, project_id, contract_no, title, counterparty, value, status, signed_date, end_date"),
    pmis("invoices").select("id, project_id, invoice_no, amount, tax_amount, status, issued_date, due_date, paid_date"),
    pmis("risks").select("id, project_id, title, category, probability, impact, status, mitigation"),
    pmis("qaqc_inspections").select("id, project_id, inspection_no, area, inspection_type, result, inspected_date"),
    pmis("hse_incidents").select("id, project_id, incident_no, incident_date, severity, category, description, status"),
    pmis("daily_reports").select("id, project_id, report_date, weather, manpower_count, issues, progress_percent, status").order("report_date", { ascending: false }).limit(500),
  ]);
  const pMap = new Map(((projects.data ?? []) as any[]).map((p: any) => [p.id, p]));
  const decorate = (rows: any[] | null) => ((rows ?? []) as any[]).map((r: any) => ({
    ...r,
    project_code: (pMap.get(r.project_id) as any)?.code ?? "—",
    project_name: (pMap.get(r.project_id) as any)?.name ?? "—",
  }));
  return {
    projects: projects.data ?? [],
    deliverables: decorate(deliverables.data as any),
    contracts: decorate(contracts.data as any),
    invoices: decorate(invoices.data as any),
    risks: decorate(risks.data as any),
    qaqc: decorate(qaqc.data as any),
    hse: decorate(hse.data as any),
    dailyReports: decorate(daily.data as any),
    generatedAt: new Date().toISOString(),
  };
}