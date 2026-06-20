import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { DeveloperLockGate } from "@/components/app/developer-lock";
import { useQuery } from "@tanstack/react-query";
import { listAllProfiles, getAdminOverview } from "@/lib/admin-profiles.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Download, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin-profiles")({ component: GatedAdminPage });

function GatedAdminPage() {
  return (
    <DeveloperLockGate
      title="Profil Pengguna Terkunci"
      description="Halaman ini menampilkan data pribadi seluruh pengguna dan kontrol role. Hanya developer Sudut Ruang Arsitek yang dapat membuka."
    >
      <AdminPage />
    </DeveloperLockGate>
  );
}

const fmt = (v: any) => (v == null || v === "" ? "—" : String(v));
const idr = (v: any) => (v == null ? "—" : "Rp " + Number(v).toLocaleString("id-ID"));

async function exportPdf(title: string, head: string[], body: any[][]) {
  try {
    const [{ default: jsPDF }, autoTableMod] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);
    const autoTable = (autoTableMod as any).default ?? autoTableMod;
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(14);
    doc.text(title, 14, 16);
    doc.setFontSize(9);
    doc.text(`Diunduh: ${new Date().toLocaleString("id-ID")}`, 14, 22);
    autoTable(doc, {
      startY: 28,
      head: [head],
      body,
      styles: { fontSize: 7, cellPadding: 1.5 },
      headStyles: { fillColor: [30, 41, 59] },
    });
    doc.save(`${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success("PDF diunduh");
  } catch (e: any) {
    toast.error("Gagal export PDF: " + e.message);
  }
}

function SectionCard({ title, head, rows }: { title: string; head: string[]; rows: any[][] }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div>
          <div className="font-semibold">{title}</div>
          <div className="text-xs text-muted-foreground">{rows.length} baris</div>
        </div>
        <Button size="sm" variant="outline" onClick={() => exportPdf(title, head, rows)} disabled={rows.length === 0}>
          <Download className="size-3.5 mr-1" /> Export PDF
        </Button>
      </div>
      <div className="max-h-[420px] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-card">
            <TableRow>{head.map((h) => <TableHead key={h} className="text-xs">{h}</TableHead>)}</TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={head.length} className="text-center text-muted-foreground py-6 text-sm">Tidak ada data.</TableCell></TableRow>
            )}
            {rows.map((r, i) => (
              <TableRow key={i}>
                {r.map((c, j) => <TableCell key={j} className="text-xs">{c}</TableCell>)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

function AdminPage() {
  const profilesFn = useServerFn(listAllProfiles);
  const overviewFn = useServerFn(getAdminOverview);
  const profiles = useQuery({ queryKey: ["admin-profiles"], queryFn: () => profilesFn(), retry: false });
  const ov = useQuery({ queryKey: ["admin-overview"], queryFn: () => overviewFn(), retry: false });

  if (profiles.isError || ov.isError) {
    return (
      <Card className="p-12 text-center space-y-2">
        <ShieldAlert className="size-10 mx-auto text-destructive" />
        <div className="font-semibold">Akses Ditolak</div>
        <p className="text-sm text-muted-foreground">Halaman ini hanya untuk role <span className="font-mono">super_admin</span>.</p>
      </Card>
    );
  }

  const d = ov.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          <ShieldCheck className="size-7 text-primary" /> Super Admin · Pusat Data
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Tarik seluruh data lintas modul — deliverable, proyek, keuangan & tagihan, QA, K3, permasalahan. Setiap tab memiliki tombol Export PDF.
        </p>
      </div>

      <Tabs defaultValue="profiles">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="profiles">Profil ({profiles.data?.profiles.length ?? 0})</TabsTrigger>
          <TabsTrigger value="projects">Proyek ({d?.projects.length ?? 0})</TabsTrigger>
          <TabsTrigger value="deliverables">Deliverable ({d?.deliverables.length ?? 0})</TabsTrigger>
          <TabsTrigger value="finance">Keuangan ({(d?.contracts.length ?? 0) + (d?.invoices.length ?? 0)})</TabsTrigger>
          <TabsTrigger value="qa">QA / K3 ({(d?.qaqc.length ?? 0) + (d?.hse.length ?? 0)})</TabsTrigger>
          <TabsTrigger value="issues">Permasalahan ({(d?.risks.length ?? 0)})</TabsTrigger>
        </TabsList>

        <TabsContent value="profiles" className="mt-4">
          <SectionCard
            title="Profil Pengguna"
            head={["Nama", "Email", "Jabatan", "Telepon", "Role", "Bergabung"]}
            rows={(profiles.data?.profiles ?? []).map((p: any) => [
              fmt(p.full_name), fmt(p.email), fmt(p.job_title), fmt(p.phone),
              (p.roles ?? []).join(", ") || "—",
              p.created_at ? new Date(p.created_at).toLocaleDateString("id-ID") : "—",
            ])}
          />
        </TabsContent>

        <TabsContent value="projects" className="mt-4">
          <SectionCard
            title="Status Proyek"
            head={["Kode", "Nama", "Klien", "Lokasi", "Status", "Progress", "Nilai Kontrak", "Periode"]}
            rows={(d?.projects ?? []).map((p: any) => [
              fmt(p.code), fmt(p.name), fmt(p.client_name), fmt(p.location),
              fmt(p.status), `${Number(p.progress_percent ?? 0).toFixed(0)}%`,
              idr(p.contract_value), `${fmt(p.start_date)} → ${fmt(p.end_date)}`,
            ])}
          />
        </TabsContent>

        <TabsContent value="deliverables" className="mt-4">
          <SectionCard
            title="Status Deliverable Perencanaan"
            head={["Proyek", "Tahap", "Kode", "Deliverable", "Kategori", "Status", "Due", "Disetujui"]}
            rows={(d?.deliverables ?? []).map((x: any) => [
              fmt(x.project_code), fmt(x.phase_key), fmt(x.code), fmt(x.name),
              fmt(x.category), fmt(x.status), fmt(x.due_date),
              x.approved_at ? new Date(x.approved_at).toLocaleDateString("id-ID") : "—",
            ])}
          />
        </TabsContent>

        <TabsContent value="finance" className="mt-4 space-y-4">
          <SectionCard
            title="Kontrak"
            head={["Proyek", "No Kontrak", "Judul", "Mitra", "Nilai", "Status", "TTD", "Berakhir"]}
            rows={(d?.contracts ?? []).map((c: any) => [
              fmt(c.project_code), fmt(c.contract_no), fmt(c.title), fmt(c.counterparty),
              idr(c.value), fmt(c.status), fmt(c.signed_date), fmt(c.end_date),
            ])}
          />
          <SectionCard
            title="Tagihan / Invoice"
            head={["Proyek", "No Invoice", "Nilai", "Pajak", "Status", "Terbit", "Jatuh Tempo", "Dibayar"]}
            rows={(d?.invoices ?? []).map((i: any) => [
              fmt(i.project_code), fmt(i.invoice_no), idr(i.amount), idr(i.tax_amount),
              fmt(i.status), fmt(i.issued_date), fmt(i.due_date), fmt(i.paid_date),
            ])}
          />
        </TabsContent>

        <TabsContent value="qa" className="mt-4 space-y-4">
          <SectionCard
            title="Inspeksi QA / QC"
            head={["Proyek", "No Inspeksi", "Area", "Tipe", "Hasil", "Tanggal"]}
            rows={(d?.qaqc ?? []).map((q: any) => [
              fmt(q.project_code), fmt(q.inspection_no), fmt(q.area),
              fmt(q.inspection_type), fmt(q.result), fmt(q.inspected_date),
            ])}
          />
          <SectionCard
            title="Insiden K3 / HSE"
            head={["Proyek", "No Insiden", "Tanggal", "Severity", "Kategori", "Deskripsi", "Status"]}
            rows={(d?.hse ?? []).map((h: any) => [
              fmt(h.project_code), fmt(h.incident_no), fmt(h.incident_date),
              fmt(h.severity), fmt(h.category), fmt(h.description), fmt(h.status),
            ])}
          />
        </TabsContent>

        <TabsContent value="issues" className="mt-4 space-y-4">
          <SectionCard
            title="Risiko & Mitigasi"
            head={["Proyek", "Judul", "Kategori", "Probability", "Impact", "Status", "Mitigasi"]}
            rows={(d?.risks ?? []).map((r: any) => [
              fmt(r.project_code), fmt(r.title), fmt(r.category),
              fmt(r.probability), fmt(r.impact), fmt(r.status), fmt(r.mitigation),
            ])}
          />
          <SectionCard
            title="Permasalahan Lapangan (Daily Report)"
            head={["Proyek", "Tanggal", "Cuaca", "Manpower", "Issues", "Progress"]}
            rows={(d?.dailyReports ?? []).filter((x: any) => x.issues).map((x: any) => [
              fmt(x.project_code), fmt(x.report_date), fmt(x.weather),
              fmt(x.manpower_count), fmt(x.issues), `${Number(x.progress_percent ?? 0).toFixed(0)}%`,
            ])}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}