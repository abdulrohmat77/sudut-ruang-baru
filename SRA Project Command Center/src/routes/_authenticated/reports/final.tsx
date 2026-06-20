import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { finalReport } from "@/lib/knowledge.functions";
import { ModuleHeader, EmptyState, useProjectsList } from "@/components/app/module-page";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2, TrendingUp, Wallet, FileText, ShieldCheck, AlertTriangle, HardHat,
  Mail, Users, Download,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip as RTip, ResponsiveContainer, CartesianGrid } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/reports/final")({ component: Page });

const fmtIDR = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

function Page() {
  const [pid, setPid] = useState<string | null>(null);
  const projects = useProjectsList();
  const activeId = pid ?? projects.data?.projects[0]?.id ?? null;
  const get = useServerFn(finalReport);
  const { data, isLoading } = useQuery({
    queryKey: ["final-report", activeId],
    queryFn: () => get({ data: { projectId: activeId! } }),
    enabled: !!activeId,
  });

  const exportPdf = () => {
    if (!data) return;
    try { generatePdf(data); toast.success("PDF diunduh"); }
    catch (e: any) { toast.error(e.message ?? "Gagal membuat PDF"); }
  };

  return (
    <div className="space-y-6">
      <ModuleHeader title="Final Project Report" subtitle="Rekapitulasi end-to-end: progress, finansial, kualitas, dan risiko."
        projectId={pid} onProjectChange={setPid}
        actions={<Button onClick={exportPdf} disabled={!data}><Download className="size-4 mr-1.5" />Export PDF</Button>} />

      {!activeId ? <EmptyState label="Pilih project untuk melihat final report." />
        : isLoading ? <div className="text-sm text-muted-foreground">Memuat...</div>
        : !data ? <EmptyState label="Tidak ada data." />
        : (
        <>
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-lg gradient-navy text-sidebar-foreground flex items-center justify-center">
                <Building2 className="size-6" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">{data.project?.code}</div>
                <h2 className="text-2xl font-bold">{data.project?.name}</h2>
                <div className="text-sm text-muted-foreground mt-1">{data.project?.client_name ?? "—"} · {data.project?.location ?? "—"}</div>
                <div className="mt-3 flex items-center gap-3">
                  <Badge variant="outline">{data.project?.status}</Badge>
                  <span className="text-xs text-muted-foreground">{data.project?.start_date ?? "—"} → {data.project?.end_date ?? "—"}</span>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
            <Kpi icon={<TrendingUp className="size-4" />} label="Physical Progress" value={`${data.kpis.physicalProgress.toFixed(1)}%`}
              extra={<Progress value={data.kpis.physicalProgress} className="h-1.5 mt-2" />} />
            <Kpi icon={<TrendingUp className="size-4" />} label="Avg Variance" value={`${data.kpis.avgVariance >= 0 ? "+" : ""}${data.kpis.avgVariance.toFixed(1)}%`}
              tone={data.kpis.avgVariance < 0 ? "destructive" : "success"} />
            <Kpi icon={<Wallet className="size-4" />} label="Contract Value" value={fmtIDR(data.kpis.contractValue)} />
            <Kpi icon={<Wallet className="size-4" />} label="VO Impact" value={fmtIDR(data.kpis.voImpact)}
              tone={data.kpis.voImpact > 0 ? "destructive" : undefined} />
            <Kpi icon={<Wallet className="size-4" />} label="Invoice Paid" value={fmtIDR(data.kpis.invoicedPaid)} tone="success" />
            <Kpi icon={<Wallet className="size-4" />} label="Invoice Open" value={fmtIDR(data.kpis.invoicedOpen)} />
            <Kpi icon={<FileText className="size-4" />} label="Daily / Monthly" value={`${data.kpis.dailiesCount} / ${data.kpis.monthliesCount}`} />
            <Kpi icon={<FileText className="size-4" />} label="Total Tasks" value={String(data.kpis.taskCount)} />
            <Kpi icon={<Users className="size-4" />} label="Meetings" value={String((data.kpis as any).meetingsCount ?? 0)} />
            <Kpi icon={<FileText className="size-4" />} label="Action Open / Done" value={`${(data.kpis as any).openActions ?? 0} / ${(data.kpis as any).doneActions ?? 0}`} />
            <Kpi icon={<Mail className="size-4" />} label="Surat In / Out" value={`${(data.kpis as any).correspondenceIn ?? 0} / ${(data.kpis as any).correspondenceOut ?? 0}`} />
          </div>

          {(data as any).weeklyTrend && (data as any).weeklyTrend.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center gap-2 text-sm font-semibold mb-3"><TrendingUp className="size-4" /> Progress Trend (Planned vs Actual)</div>
              <div className="h-[240px]">
                <ResponsiveContainer>
                  <LineChart data={(data as any).weeklyTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="idx" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} unit="%" />
                    <RTip />
                    <Line type="monotone" dataKey="planned" stroke="var(--muted-foreground)" strokeDasharray="4 4" dot={false} />
                    <Line type="monotone" dataKey="actual" stroke="var(--primary)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          <Card className="p-5">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">Executive Summary</div>
            <p className="text-sm leading-relaxed">{execSummary(data)}</p>
          </Card>

          <div className="grid gap-3 md:grid-cols-3">
            <Card className="p-4">
              <div className="flex items-center gap-2 text-sm font-semibold mb-3"><ShieldCheck className="size-4" /> Quality (QA/QC)</div>
              <div className="flex gap-4">
                <div className="flex-1 rounded-md bg-success/10 p-3">
                  <div className="text-[10px] uppercase text-muted-foreground">Pass</div>
                  <div className="text-2xl font-bold text-success">{data.kpis.qaPass}</div>
                </div>
                <div className="flex-1 rounded-md bg-destructive/10 p-3">
                  <div className="text-[10px] uppercase text-muted-foreground">Fail</div>
                  <div className="text-2xl font-bold text-destructive">{data.kpis.qaFail}</div>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-sm font-semibold mb-3"><HardHat className="size-4" /> HSE Incidents</div>
              <div className="space-y-1.5 text-xs">
                {Object.keys(data.kpis.hseBySeverity).length === 0 && <div className="text-muted-foreground">Tidak ada insiden.</div>}
                {Object.entries(data.kpis.hseBySeverity).map(([k, v]) => (
                  <div key={k} className="flex justify-between"><span className="capitalize">{k}</span><Badge variant="secondary">{v as number}</Badge></div>
                ))}
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-sm font-semibold mb-3"><AlertTriangle className="size-4" /> Open Risks</div>
              <div className="text-4xl font-bold">{data.kpis.openRisks}</div>
              <div className="text-xs text-muted-foreground mt-1">Risiko aktif yang masih perlu mitigasi.</div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function Kpi({ icon, label, value, tone, extra }: { icon: React.ReactNode; label: string; value: string; tone?: "success"|"destructive"; extra?: React.ReactNode }) {
  const c = tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : "";
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{icon}{label}</div>
      <div className={`text-xl font-bold mt-1.5 ${c}`}>{value}</div>
      {extra}
    </Card>
  );
}

function execSummary(d: any): string {
  const k = d.kpis;
  const v = k.avgVariance;
  const verdict = v < -5 ? "tertinggal dari rencana" : v > 5 ? "lebih cepat dari rencana" : "berjalan sesuai rencana";
  const fin = k.invoicedPaid + k.invoicedOpen > 0
    ? `Total invoice mencapai ${fmtIDR(k.invoicedPaid + k.invoicedOpen)} (paid ${fmtIDR(k.invoicedPaid)}, open ${fmtIDR(k.invoicedOpen)}).`
    : `Belum ada invoice tercatat.`;
  const qa = (k.qaPass + k.qaFail) > 0
    ? `Pass-rate QA/QC ${((k.qaPass / (k.qaPass + k.qaFail)) * 100).toFixed(0)}%.`
    : `Belum ada inspeksi QA/QC.`;
  const hseTotal = Object.values(k.hseBySeverity ?? {}).reduce((s: number, n: any) => s + Number(n), 0);
  return [
    `Proyek ${d.project?.code ?? ""} ${d.project?.name ?? ""} saat ini berada pada physical progress ${k.physicalProgress.toFixed(1)}% dan ${verdict} (variance ${v >= 0 ? "+" : ""}${v.toFixed(1)}%).`,
    `Nilai kontrak ${fmtIDR(k.contractValue)} dengan impact VO ${fmtIDR(k.voImpact)}. ${fin}`,
    `${qa} Terdapat ${hseTotal} insiden HSE dan ${k.openRisks} risiko aktif.`,
    `Aktivitas dokumentasi: ${k.meetingsCount ?? 0} meeting (${k.openActions ?? 0} action open / ${k.doneActions ?? 0} selesai), ${k.correspondenceIn ?? 0} surat masuk dan ${k.correspondenceOut ?? 0} surat keluar.`,
  ].join(" ");
}

function generatePdf(data: any) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  let y = 48;
  doc.setFontSize(18); doc.setFont("helvetica", "bold");
  doc.text("Final Project Report", 40, y); y += 22;
  doc.setFontSize(11); doc.setFont("helvetica", "normal");
  doc.text(`${data.project?.code ?? ""} · ${data.project?.name ?? ""}`, 40, y); y += 14;
  doc.setTextColor(120);
  doc.text(`${data.project?.client_name ?? "-"} · ${data.project?.location ?? "-"}`, 40, y); y += 12;
  doc.text(`Periode: ${data.project?.start_date ?? "-"}  →  ${data.project?.end_date ?? "-"}    Status: ${data.project?.status ?? "-"}`, 40, y); y += 18;
  doc.setTextColor(0);

  doc.setFontSize(12); doc.setFont("helvetica", "bold");
  doc.text("Executive Summary", 40, y); y += 6;
  doc.setFontSize(10); doc.setFont("helvetica", "normal");
  const summary = execSummary(data);
  const lines = doc.splitTextToSize(summary, W - 80);
  doc.text(lines, 40, y + 12);
  y += 12 + lines.length * 12 + 12;

  const k = data.kpis;
  autoTable(doc, {
    startY: y,
    head: [["KPI", "Nilai"]],
    body: [
      ["Physical Progress", `${k.physicalProgress.toFixed(1)}%`],
      ["Average Variance", `${k.avgVariance >= 0 ? "+" : ""}${k.avgVariance.toFixed(1)}%`],
      ["Contract Value", fmtIDR(k.contractValue)],
      ["VO Impact", fmtIDR(k.voImpact)],
      ["Invoice Paid", fmtIDR(k.invoicedPaid)],
      ["Invoice Open", fmtIDR(k.invoicedOpen)],
      ["Daily Reports", String(k.dailiesCount)],
      ["Monthly Reports", String(k.monthliesCount)],
      ["Total Tasks", String(k.taskCount)],
      ["Meetings", String(k.meetingsCount ?? 0)],
      ["Action Items (Open / Done)", `${k.openActions ?? 0} / ${k.doneActions ?? 0}`],
      ["Surat Masuk / Keluar", `${k.correspondenceIn ?? 0} / ${k.correspondenceOut ?? 0}`],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 41, 59] },
    theme: "striped",
  });
  y = (doc as any).lastAutoTable.finalY + 18;

  autoTable(doc, {
    startY: y,
    head: [["Quality", "Jumlah"]],
    body: [
      ["QA/QC Pass", String(k.qaPass)],
      ["QA/QC Fail", String(k.qaFail)],
      ["Open Risks", String(k.openRisks)],
      ...Object.entries(k.hseBySeverity ?? {}).map(([sev, n]) => [`HSE Incident · ${sev}`, String(n)]),
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 41, 59] },
    theme: "grid",
  });

  if (Array.isArray(data.weeklyTrend) && data.weeklyTrend.length > 0) {
    let y2 = (doc as any).lastAutoTable.finalY + 18;
    autoTable(doc, {
      startY: y2,
      head: [["Minggu", "Planned (%)", "Actual (%)", "Variance"]],
      body: data.weeklyTrend.map((w: any) => [
        String(w.idx),
        w.planned.toFixed(1),
        w.actual.toFixed(1),
        (w.actual - w.planned).toFixed(1),
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 41, 59] },
      theme: "striped",
    });
  }

  doc.setFontSize(8); doc.setTextColor(140);
  doc.text(`Generated ${new Date().toLocaleString("id-ID")}`, 40, doc.internal.pageSize.getHeight() - 24);
  doc.save(`Final-Report-${(data.project?.code ?? "project").replace(/\s+/g,"_")}.pdf`);
}