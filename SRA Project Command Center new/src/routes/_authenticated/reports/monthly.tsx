import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listMonthlyReports, createMonthlyReport, updateMonthlyReport, deleteMonthlyReport } from "@/lib/reporting.functions";
import { summarizeReports } from "@/lib/ai-analysis.functions";
import { ModuleHeader, CreateDialog, ProjectSelect, EmptyState, useProjectsList } from "@/components/app/module-page";
import { RowActions } from "@/components/app/row-actions";
import { AiResultButton } from "@/components/app/ai-result-dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/reports/monthly")({ component: Page });

function Page() {
  const [pid, setPid] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const list = useServerFn(listMonthlyReports);
  const create = useServerFn(createMonthlyReport);
  const update = useServerFn(updateMonthlyReport);
  const remove = useServerFn(deleteMonthlyReport);
  const summarize = useServerFn(summarizeReports);
  const projects = useProjectsList();
  const { data, isLoading, refetch } = useQuery({ queryKey: ["monthly", pid], queryFn: () => list({ data: { projectId: pid } }) });
  return (
    <div className="space-y-6">
      <ModuleHeader title="Monthly Report" subtitle="Executive summary bulanan per proyek."
        projectId={pid} onProjectChange={setPid}
        actions={<div className="flex gap-2">
          <AiResultButton label="Ringkas AI" title="Ringkasan Monthly Report (AI)" run={() => summarize({ data: { type: "monthly", projectId: pid } })} />
          <CreateDialog open={open} onOpenChange={setOpen} title="Monthly Report Baru">
            <MonthlyForm projects={projects.data?.projects ?? []} onSubmit={async (d) => { await create({ data: d }); toast.success("Monthly report tersimpan"); setOpen(false); refetch(); }} />
          </CreateDialog>
        </div>} />

      {isLoading ? <div className="text-sm text-muted-foreground">Memuat...</div>
        : (data?.rows.length ?? 0) === 0 ? <EmptyState label="Belum ada monthly report." />
        : <div className="space-y-3">
            {data!.rows.map((r: any) => (
              <Card key={r.id} className="p-4">
                <div className="flex justify-between gap-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">{r.projects?.code ?? "—"}</div>
                    <div className="font-semibold">{new Date(r.month).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}</div>
                  </div>
                  <RowActions
                    editTitle="Edit Monthly Report"
                    editForm={(close) => (
                      <MonthlyForm initial={r} projects={projects.data?.projects ?? []} onSubmit={async (d) => {
                        const { project_id, ...patch } = d;
                        await update({ data: { id: r.id, ...patch } as any }); toast.success("Diperbarui"); close(); refetch();
                      }} />
                    )}
                    onDelete={async () => { await remove({ data: { id: r.id } }); refetch(); }}
                  />
                </div>
                {r.executive_summary && <p className="mt-2 text-sm whitespace-pre-wrap">{r.executive_summary}</p>}
              </Card>
            ))}
          </div>}
    </div>
  );
}

function MonthlyForm({ initial, projects, onSubmit }: { initial?: any; projects: any[]; onSubmit: (d: any) => Promise<void> }) {
  const [f, setF] = useState({
    project_id: initial?.project_id ?? "",
    month: initial?.month ?? (new Date().toISOString().slice(0,7) + "-01"),
    executive_summary: initial?.executive_summary ?? "",
  });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit({ project_id: f.project_id, month: f.month, executive_summary: f.executive_summary || null });
    } catch (e: any) { toast.error(e.message); }
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <div><Label>Project</Label><ProjectSelect value={f.project_id} onChange={v=>setF({...f,project_id:v})} projects={projects} /></div>
      <div><Label>Bulan</Label><Input type="date" required value={f.month} onChange={e=>setF({...f,month:e.target.value})} /></div>
      <div><Label>Executive Summary</Label><Textarea rows={6} value={f.executive_summary} onChange={e=>setF({...f,executive_summary:e.target.value})} /></div>
      <Button type="submit" className="w-full">Simpan</Button>
    </form>
  );
}