import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listDailyReports, createDailyReport, updateDailyReport, deleteDailyReport } from "@/lib/reporting.functions";
import { summarizeReports } from "@/lib/ai-analysis.functions";
import { meetingSummary } from "@/lib/knowledge.functions";
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

export const Route = createFileRoute("/_authenticated/reports/daily")({ component: Page });

function Page() {
  const [pid, setPid] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const list = useServerFn(listDailyReports);
  const create = useServerFn(createDailyReport);
  const update = useServerFn(updateDailyReport);
  const remove = useServerFn(deleteDailyReport);
  const summarize = useServerFn(summarizeReports);
  const projects = useProjectsList();
  const { data, isLoading, refetch } = useQuery({ queryKey: ["daily", pid], queryFn: () => list({ data: { projectId: pid } }) });
  const summary = useServerFn(meetingSummary);
  const meetings = useQuery({
    queryKey: ["daily-meetings", pid],
    queryFn: () => summary({ data: { projectId: pid! } }),
    enabled: !!pid,
  });

  return (
    <div className="space-y-6">
      <ModuleHeader title="Daily Report" subtitle="Catatan harian pekerjaan, manpower, cuaca, isu, dan rencana esok hari."
        projectId={pid} onProjectChange={setPid}
        actions={<div className="flex gap-2">
          <AiResultButton label="Ringkas AI" title="Ringkasan Daily Report (AI)" run={() => summarize({ data: { type: "daily", projectId: pid } })} />
          <CreateDialog open={open} onOpenChange={setOpen} title="Daily Report Baru">
            <DailyForm projects={projects.data?.projects ?? []} onSubmit={async (d) => {
              if (!d.project_id) { toast.error("Pilih project terlebih dahulu"); return; }
              await create({ data: d }); toast.success("Daily report tersimpan"); setOpen(false); refetch();
            }} />
          </CreateDialog>
        </div>} />

      {isLoading ? <div className="text-sm text-muted-foreground">Memuat...</div>
        : (data.length ?? 0) === 0 ? <EmptyState label="Belum ada daily report." />
        : <div className="grid gap-3 md:grid-cols-2">
            {data!.rows.map((r: any) => (
              <Card key={r.id} className="p-4">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">{r.projects?.code ?? "—"}</div>
                    <div className="font-semibold text-sm">{r.report_date}</div>
                  </div>
                  <div className="flex items-start gap-1 shrink-0">
                    <Badge variant="secondary">{r.weather ?? "—"}</Badge>
                    <RowActions
                      editTitle="Edit Daily Report"
                      editForm={(close) => (
                        <DailyForm initial={r} projects={projects.data?.projects ?? []} onSubmit={async (d) => {
                          const { project_id, ...patch } = d;
                          await update({ data: { id: r.id, ...patch } as any }); toast.success("Diperbarui"); close(); refetch();
                        }} />
                      )}
                      onDelete={async () => { await remove({ data: { id: r.id } }); refetch(); }}
                    />
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">Manpower: <span className="text-foreground font-medium">{r.manpower_count ?? 0}</span> · Progress: <span className="text-foreground font-medium">{r.progress_percent ?? 0}%</span></div>
                {r.work_summary && <p className="mt-2 text-sm line-clamp-2">{r.work_summary}</p>}
              </Card>
            ))}
          </div>}

      {pid && meetings.data && (
        <Card className="p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Meeting & Action Items Terkait</div>
            <div className="text-xs text-muted-foreground">{meetings.data.total} meeting · <span className="text-warning">{meetings.data.openActions} open</span> · <span className="text-success">{meetings.data.doneActions} done</span></div>
          </div>
          {(meetings.data.rows ?? []).length === 0 ? <div className="text-sm text-muted-foreground">Belum ada meeting tercatat.</div>
            : <ul className="space-y-1.5 text-xs">
              {(meetings.data.rows ?? []).slice(0,5).map((m: any) => (
                <li key={m.id} className="flex justify-between border-b last:border-0 py-1.5">
                  <span className="font-medium truncate">{m.title}</span>
                  <span className="text-muted-foreground shrink-0">{m.meeting_date ? new Date(m.meeting_date).toLocaleDateString("id-ID") : "—"} · {(m.action_items ?? []).length} action</span>
                </li>
              ))}
            </ul>}
        </Card>
      )}
    </div>
  );
}

function DailyForm({ initial, projects, onSubmit }: { initial?: any; projects: any[]; onSubmit: (d: any) => Promise<void> }) {
  const [f, setF] = useState({
    project_id: initial?.project_id ?? "",
    report_date: initial?.report_date ?? new Date().toISOString().slice(0,10),
    weather: initial?.weather ?? "",
    manpower_count: initial?.manpower_count?.toString() ?? "",
    work_summary: initial?.work_summary ?? "",
    issues: initial?.issues ?? "",
    next_day_plan: initial?.next_day_plan ?? "",
    progress_percent: initial?.progress_percent?.toString() ?? "",
  });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit({
        project_id: f.project_id, report_date: f.report_date,
        weather: f.weather || null,
        manpower_count: f.manpower_count ? Number(f.manpower_count) : 0,
        work_summary: f.work_summary || null, issues: f.issues || null,
        next_day_plan: f.next_day_plan || null,
        progress_percent: f.progress_percent ? Number(f.progress_percent) : null,
      });
    } catch (e: any) { toast.error(e.message); }
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <div><Label>Project</Label><ProjectSelect value={f.project_id} onChange={v=>setF({...f,project_id:v})} projects={projects} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Tanggal</Label><Input type="date" required value={f.report_date} onChange={e=>setF({...f,report_date:e.target.value})} /></div>
        <div><Label>Cuaca</Label><Input value={f.weather} onChange={e=>setF({...f,weather:e.target.value})} placeholder="Cerah / Hujan" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Manpower</Label><Input type="number" value={f.manpower_count} onChange={e=>setF({...f,manpower_count:e.target.value})} /></div>
        <div><Label>Progress %</Label><Input type="number" step="0.1" value={f.progress_percent} onChange={e=>setF({...f,progress_percent:e.target.value})} /></div>
      </div>
      <div><Label>Pekerjaan Hari Ini</Label><Textarea rows={3} value={f.work_summary} onChange={e=>setF({...f,work_summary:e.target.value})} /></div>
      <div><Label>Isu / Kendala</Label><Textarea rows={2} value={f.issues} onChange={e=>setF({...f,issues:e.target.value})} /></div>
      <div><Label>Rencana Esok</Label><Textarea rows={2} value={f.next_day_plan} onChange={e=>setF({...f,next_day_plan:e.target.value})} /></div>
      <Button type="submit" className="w-full">Simpan</Button>
    </form>
  );
}