import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listWeeklyReports, createWeeklyReport, updateWeeklyReport, deleteWeeklyReport } from "@/lib/reporting.functions";
import { summarizeReports } from "@/lib/ai-analysis.functions";
import { ModuleHeader, CreateDialog, ProjectSelect, EmptyState, useProjectsList } from "@/components/app/module-page";
import { RowActions } from "@/components/app/row-actions";
import { AiResultButton } from "@/components/app/ai-result-dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/reports/weekly")({ component: Page });

function Page() {
  const [pid, setPid] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const list = useServerFn(listWeeklyReports);
  const create = useServerFn(createWeeklyReport);
  const update = useServerFn(updateWeeklyReport);
  const remove = useServerFn(deleteWeeklyReport);
  const summarize = useServerFn(summarizeReports);
  const projects = useProjectsList();
  const { data, isLoading, refetch } = useQuery({ queryKey: ["weekly", pid], queryFn: () => list({ data: { projectId: pid } }) });
  return (
    <div className="space-y-6">
      <ModuleHeader title="Weekly Report" subtitle="Ringkasan mingguan: planned vs actual progress + variance."
        projectId={pid} onProjectChange={setPid}
        actions={<div className="flex gap-2">
          <AiResultButton label="Ringkas AI" title="Ringkasan Weekly Report (AI)" run={() => summarize({ data: { type: "weekly", projectId: pid } })} />
          <CreateDialog open={open} onOpenChange={setOpen} title="Weekly Report Baru">
            <WeeklyForm projects={projects.data?.projects ?? []} onSubmit={async (d) => { await create({ data: d }); toast.success("Weekly report tersimpan"); setOpen(false); refetch(); }} />
          </CreateDialog>
        </div>} />

      {isLoading ? <div className="text-sm text-muted-foreground">Memuat...</div>
        : (data.length ?? 0) === 0 ? <EmptyState label="Belum ada weekly report." />
        : <div className="grid gap-3 md:grid-cols-2">
            {data!.rows.map((r: any) => {
              const v = Number(r.variance ?? 0);
              return (
                <Card key={r.id} className="p-4">
                  <div className="flex justify-between gap-2">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">{r.projects?.code ?? "—"}</div>
                      <div className="font-semibold text-sm">{r.week_start} → {r.week_end}</div>
                    </div>
                    <div className="flex items-start gap-1 shrink-0">
                      <Badge variant={v < 0 ? "destructive" : "secondary"}>{v >= 0 ? "+" : ""}{v.toFixed(1)}%</Badge>
                      <RowActions
                        editTitle="Edit Weekly Report"
                        editForm={(close) => (
                          <WeeklyForm initial={r} projects={projects.data?.projects ?? []} onSubmit={async (d) => {
                            const { project_id, ...patch } = d;
                            await update({ data: { id: r.id, ...patch } as any }); toast.success("Diperbarui"); close(); refetch();
                          }} />
                        )}
                        onDelete={async () => { await remove({ data: { id: r.id } }); refetch(); }}
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">Plan: {Number(r.planned_progress ?? 0).toFixed(1)}% · Actual: {Number(r.actual_progress ?? 0).toFixed(1)}%</div>
                  {r.summary && <p className="mt-2 text-sm line-clamp-3">{r.summary}</p>}
                </Card>
              );
            })}
          </div>}
    </div>
  );
}

function WeeklyForm({ initial, projects, onSubmit }: { initial?: any; projects: any[]; onSubmit: (d: any) => Promise<void> }) {
  const [f, setF] = useState({
    project_id: initial?.project_id ?? "",
    week_start: initial?.week_start ?? "",
    week_end: initial?.week_end ?? "",
    planned_progress: initial?.planned_progress?.toString() ?? "",
    actual_progress: initial?.actual_progress?.toString() ?? "",
    summary: initial?.summary ?? "",
  });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit({
        project_id: f.project_id, week_start: f.week_start, week_end: f.week_end,
        planned_progress: f.planned_progress ? Number(f.planned_progress) : null,
        actual_progress: f.actual_progress ? Number(f.actual_progress) : null,
        summary: f.summary || null,
      });
    } catch (e: any) { toast.error(e.message); }
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <div><Label>Project</Label><ProjectSelect value={f.project_id} onChange={v=>setF({...f,project_id:v})} projects={projects} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Minggu Mulai</Label><Input type="date" required value={f.week_start} onChange={e=>setF({...f,week_start:e.target.value})} /></div>
        <div><Label>Minggu Selesai</Label><Input type="date" required value={f.week_end} onChange={e=>setF({...f,week_end:e.target.value})} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Planned %</Label><Input type="number" step="0.1" value={f.planned_progress} onChange={e=>setF({...f,planned_progress:e.target.value})} /></div>
        <div><Label>Actual %</Label><Input type="number" step="0.1" value={f.actual_progress} onChange={e=>setF({...f,actual_progress:e.target.value})} /></div>
      </div>
      <div><Label>Ringkasan</Label><Textarea rows={4} value={f.summary} onChange={e=>setF({...f,summary:e.target.value})} /></div>
      <Button type="submit" className="w-full">Simpan</Button>
    </form>
  );
}