import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { cashflowSummary } from "@/lib/commercial.functions";
import { ModuleHeader } from "@/components/app/module-page";
import { Card } from "@/components/ui/card";
import { Wallet, TrendingUp, FileText, AlertCircle, GitPullRequest } from "lucide-react";

export const Route = createFileRoute("/_authenticated/finance")({ component: Page });

function fmt(n: number) { return "Rp " + Math.round(n).toLocaleString("id-ID"); }

function Page() {
  const [pid, setPid] = useState<string | null>(null);
  const fn = useServerFn(cashflowSummary);
  const { data, isLoading } = useQuery({ queryKey: ["cashflow", pid], queryFn: () => fn({ data: { projectId: pid } }) });

  const cards = [
    { label: "Nilai Kontrak", value: data?.totalContract ?? 0, icon: FileText, hint: "Total nilai kontrak aktif" },
    { label: "VO Approved", value: data?.totalVO ?? 0, icon: GitPullRequest, hint: "Tambahan dari VO yang disetujui" },
    { label: "Total Diinvoice", value: data?.totalInvoiced ?? 0, icon: Wallet, hint: "Termasuk PPN" },
    { label: "Sudah Dibayar", value: data?.totalPaid ?? 0, icon: TrendingUp, hint: "Inflow kas" },
    { label: "Outstanding", value: data?.outstanding ?? 0, icon: AlertCircle, hint: "Belum diterima" },
  ];

  return (
    <div className="space-y-6">
      <ModuleHeader title="Finance & Cashflow" subtitle="Ringkasan komersial portofolio: kontrak, VO, invoice, dan piutang."
        projectId={pid} onProjectChange={setPid} />

      {isLoading ? <div className="text-sm text-muted-foreground">Memuat...</div> : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {cards.map(c => (
            <Card key={c.label} className="p-5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><c.icon className="size-4" />{c.label}</div>
              <div className="mt-2 text-xl font-bold font-mono">{fmt(c.value)}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">{c.hint}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}