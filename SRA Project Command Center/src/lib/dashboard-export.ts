import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const fmtIDR = (v: number) => new Intl.NumberFormat("id-ID").format(Math.round(v));

export function exportDashboardPDF(opts: {
  kpis: any;
  projects: any[];
  alerts: any;
  period: string;
}) {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  doc.setFontSize(16);
  doc.text("Executive Dashboard Summary", 40, 50);
  doc.setFontSize(9);
  doc.text(`Period: ${opts.period} · Generated: ${new Date().toLocaleString("id-ID")}`, 40, 66);

  autoTable(doc, {
    startY: 84,
    head: [["KPI", "Value"]],
    body: [
      ["Contract Total", `Rp ${fmtIDR(opts.kpis.contractTotal)}`],
      ["Paid (period)", `Rp ${fmtIDR(opts.kpis.paidInPeriod)}`],
      ["Outstanding Invoice", `Rp ${fmtIDR(opts.kpis.outstandingTotal)} (${opts.kpis.outstandingCount})`],
      ["AR 0-30", `Rp ${fmtIDR(opts.kpis.buckets.d0_30)}`],
      ["AR 31-60", `Rp ${fmtIDR(opts.kpis.buckets.d31_60)}`],
      ["AR 61-90", `Rp ${fmtIDR(opts.kpis.buckets.d61_90)}`],
      ["AR 90+", `Rp ${fmtIDR(opts.kpis.buckets.d90p)}`],
      ["Burn Rate", `${opts.kpis.burnPct.toFixed(1)}%`],
      ["Est. Margin", `${opts.kpis.marginPct.toFixed(1)}%`],
      ["Overflow Events (24h)", String(opts.kpis.overflowCount)],
      ["Overdue Projects", String(opts.alerts.overdue.length)],
      ["Progress Lag (>15%)", String(opts.alerts.lag.length)],
      ["Open HSE Incidents", String(opts.alerts.hse.length)],
      ["Invoices Due ≤7d", String(opts.alerts.invoicesDue.length)],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 41, 59] },
  });

  autoTable(doc, {
    head: [["Code", "Project", "Status", "Contract", "Progress"]],
    body: opts.projects.slice(0, 30).map((p: any) => [
      p.code, p.name, p.status, `Rp ${fmtIDR(Number(p.contract_value ?? 0))}`, `${Number(p.progress_percent ?? 0).toFixed(0)}%`,
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [30, 41, 59] },
  });

  doc.save(`dashboard-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportDashboardXLSX(opts: { kpis: any; projects: any[]; alerts: any }) {
  const wb = XLSX.utils.book_new();
  const kpiRows = [
    { Metric: "Contract Total", Value: opts.kpis.contractTotal },
    { Metric: "Paid (period)", Value: opts.kpis.paidInPeriod },
    { Metric: "Outstanding", Value: opts.kpis.outstandingTotal },
    { Metric: "AR 0-30", Value: opts.kpis.buckets.d0_30 },
    { Metric: "AR 31-60", Value: opts.kpis.buckets.d31_60 },
    { Metric: "AR 61-90", Value: opts.kpis.buckets.d61_90 },
    { Metric: "AR 90+", Value: opts.kpis.buckets.d90p },
    { Metric: "Burn %", Value: opts.kpis.burnPct },
    { Metric: "Margin %", Value: opts.kpis.marginPct },
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(kpiRows), "KPI");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(opts.projects), "Projects");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([
    ...opts.alerts.overdue.map((r: any) => ({ kind: "overdue", ...r })),
    ...opts.alerts.lag.map((r: any) => ({ kind: "lag", ...r })),
    ...opts.alerts.hse.map((r: any) => ({ kind: "hse", ...r })),
    ...opts.alerts.invoicesDue.map((r: any) => ({ kind: "invoice_due", ...r })),
  ]), "Alerts");
  XLSX.writeFile(wb, `dashboard-${new Date().toISOString().slice(0, 10)}.xlsx`);
}