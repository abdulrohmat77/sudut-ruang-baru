import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { DeveloperLockGate } from "@/components/app/developer-lock";
import { useState } from "react";
import { runLabelAudit } from "@/lib/qa-labels.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/qa-labels")({ component: GatedQaLabels });

function GatedQaLabels() {
  return (
    <DeveloperLockGate
      title="QA Label Audit Terkunci"
      description="Audit label QA memeriksa integritas penamaan modul inti. Hanya developer Sudut Ruang Arsitek yang dapat menjalankan."
    >
      <QaLabelsPage />
    </DeveloperLockGate>
  );
}

const UI_CHECKLIST = [
  { id: "title", label: "Judul halaman Design Monitoring tidak mengandung 'SOP' atau 'SRA'" },
  { id: "subtitle", label: "Subjudul tidak menyebut 'pemerintahan'" },
  { id: "button", label: "Tombol seed template netral (tanpa 'Pemerintahan')" },
  { id: "nav", label: "Sidebar menampilkan 'Design Monitoring' (tanpa '(SOP)')" },
  { id: "dialog", label: "Dialog tambah deliverable tidak menyebut 'SOP SRA / standar pemerintah'" },
  { id: "template-comment", label: "Komentar template di kode sudah dibersihkan" },
];

function QaLabelsPage() {
  const run = useServerFn(runLabelAudit);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  const onRun = async () => {
    setBusy(true);
    try {
      const r = await run();
      setResult(r);
      toast.success(`Audit selesai — ${r.findings.length} temuan`);
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const total = UI_CHECKLIST.length;
  const done = Object.values(checks).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          <ShieldCheck className="size-7 text-primary" /> QA Label Audit
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Verifikasi label UI &amp; pindai sisa kata <span className="font-mono">SOP</span>, <span className="font-mono">SRA</span>, <span className="font-mono">pemerintah</span> di seluruh modul.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Checklist UI ({done}/{total})</h2>
          </div>
          <div className="space-y-2">
            {UI_CHECKLIST.map((c) => (
              <label key={c.id} className="flex items-start gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!checks[c.id]}
                  onChange={(e) => setChecks({ ...checks, [c.id]: e.target.checked })}
                  className="mt-1"
                />
                <span>{c.label}</span>
              </label>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Audit Database</h2>
            <Button size="sm" onClick={onRun} disabled={busy}>
              {busy ? <Loader2 className="size-4 mr-1 animate-spin" /> : null}
              Jalankan Audit
            </Button>
          </div>
          {!result ? (
            <p className="text-sm text-muted-foreground">Belum dijalankan. Klik tombol di atas untuk memindai 8 tabel utama.</p>
          ) : result.findings.length === 0 ? (
            <div className="flex items-center gap-2 text-success text-sm">
              <CheckCircle2 className="size-5" /> Bersih — tidak ada sisa kata terlarang di database.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
              <div className="flex items-center gap-2 text-destructive text-sm mb-2">
                <XCircle className="size-5" /> {result.findings.length} baris perlu dibersihkan
              </div>
              {result.findings.map((f: any, i: number) => (
                <div key={i} className="text-xs border rounded p-2 bg-muted/30">
                  <div className="flex gap-2 items-center mb-1">
                    <Badge variant="outline" className="font-mono text-[10px]">{f.table}.{f.column}</Badge>
                    <Badge variant="destructive" className="text-[10px]">{f.matched}</Badge>
                  </div>
                  <div className="text-muted-foreground truncate">{f.snippet}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}