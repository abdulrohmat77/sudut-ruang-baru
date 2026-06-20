import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listProjects } from "@/lib/projects.functions";
import { listTasks, createTask, updateTask, deleteTask, sCurve } from "@/lib/tasks.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Trash2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export const Route = createFileRoute("/_authenticated/planning")({ component: PlanningPage });

const STATUS_TONE: Record<string, string> = {
  not_started: "bg-muted text-muted-foreground",
  in_progress: "bg-info/15 text-info",
  completed: "bg-success/15 text-success",
  blocked: "bg-destructive/15 text-destructive",
};

function PlanningPage() {
  const lp = useServerFn(listProjects);
  const lt = useServerFn(listTasks);
  const ct = useServerFn(createTask);
  const ut = useServerFn(updateTask);
  const dt = useServerFn(deleteTask);
  const sc = useServerFn(sCurve);

  const projects = useQuery({ queryKey: ["projects"], queryFn: () => lp() });
  const [projectId, setProjectId] = useState<string | null>(null);
  const activeId = projectId ?? projects.data?.projects[0]?.id ?? null;

  const tasks = useQuery({
    queryKey: ["tasks", activeId],
    queryFn: () => lt({ data: { projectId: activeId! } }),
    enabled: !!activeId,
  });
  const curve = useQuery({
    queryKey: ["scurve", activeId],
    queryFn: () => sc({ data: { projectId: activeId! } }),
    enabled: !!activeId,
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", wbs_code: "", parent_id: "", weight: "0", planned_start: "", planned_end: "" });

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeId) return;
    try {
      await ct({ data: {
        project_id: activeId,
        name: form.name,
        wbs_code: form.wbs_code || null,
        parent_id: form.parent_id || null,
        weight: Number(form.weight) || 0,
        planned_start: form.planned_start || null,
        planned_end: form.planned_end || null,
      }});
      toast.success("Task ditambahkan");
      setOpen(false);
      setForm({ name: "", wbs_code: "", parent_id: "", weight: "0", planned_start: "", planned_end: "" });
      tasks.refetch(); curve.refetch();
    } catch (e: any) { toast.error(e.message); }
  };

  const onProgress = async (id: string, v: number) => {
    try {
      await ut({ data: { id, progress_percent: v, status: v >= 100 ? "completed" : v > 0 ? "in_progress" : "not_started" } });
      tasks.refetch(); curve.refetch();
    } catch (e: any) { toast.error(e.message); }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Hapus task ini?")) return;
    try { await dt({ data: { id } }); tasks.refetch(); curve.refetch(); }
    catch (e: any) { toast.error(e.message); }
  };

  // Gantt range
  const ganttRange = useMemo(() => {
    const rows = (tasks.data?.tasks ?? []).filter((t: any) => t.planned_start && t.planned_end);
    if (rows.length === 0) return null;
    const min = Math.min(...rows.map((t: any) => new Date(t.planned_start).getTime()));
    const max = Math.max(...rows.map((t: any) => new Date(t.planned_end).getTime()));
    return { min, max, span: Math.max(1, max - min) };
  }, [tasks.data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Planning & Scheduling</h1>
          <p className="text-muted-foreground text-sm mt-1">WBS hirarki, Gantt timeline, dan kurva-S planned vs actual per proyek</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={activeId ?? ""} onValueChange={(v) => setProjectId(v)}>
            <SelectTrigger className="w-full sm:w-[280px]"><SelectValue placeholder="Pilih project" /></SelectTrigger>
            <SelectContent>
              {projects.data?.projects.map((p: any) => (
                <SelectItem key={p.id} value={p.id}>{p.code} · {p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button disabled={!activeId}><Plus className="size-4 mr-1" /> Task</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Task / WBS</DialogTitle>
                <DialogDescription>Buat task baru dalam struktur Work Breakdown Structure.</DialogDescription>
              </DialogHeader>
              <form onSubmit={onCreate} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Kode WBS</Label><Input value={form.wbs_code} onChange={e=>setForm({...form,wbs_code:e.target.value})} placeholder="1.2.1" /></div>
                  <div><Label>Bobot (%)</Label><Input type="number" step="0.01" value={form.weight} onChange={e=>setForm({...form,weight:e.target.value})} /></div>
                </div>
                <div><Label>Nama Task</Label><Input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
                <div>
                  <Label>Parent (opsional)</Label>
                  <Select value={form.parent_id} onValueChange={(v)=>setForm({...form,parent_id:v})}>
                    <SelectTrigger><SelectValue placeholder="— root —" /></SelectTrigger>
                    <SelectContent>
                      {tasks.data?.tasks.map((t: any) => (
                        <SelectItem key={t.id} value={t.id}>{t.wbs_code ? `${t.wbs_code} · ` : ""}{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Planned Start</Label><Input type="date" value={form.planned_start} onChange={e=>setForm({...form,planned_start:e.target.value})} /></div>
                  <div><Label>Planned End</Label><Input type="date" value={form.planned_end} onChange={e=>setForm({...form,planned_end:e.target.value})} /></div>
                </div>
                <Button type="submit" className="w-full">Simpan</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!activeId ? (
        <Card className="p-12 text-center text-muted-foreground text-sm">Belum ada project. Buat project dulu di menu Projects.</Card>
      ) : (
        <Tabs defaultValue="wbs">
          <TabsList>
            <TabsTrigger value="wbs">WBS</TabsTrigger>
            <TabsTrigger value="gantt">Gantt</TabsTrigger>
            <TabsTrigger value="scurve">Kurva-S</TabsTrigger>
          </TabsList>

          <TabsContent value="wbs" className="mt-4">
            <Card className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <div className="min-w-[760px]">
                  <div className="grid grid-cols-[80px_1fr_90px_120px_180px_40px] gap-3 px-4 py-2 border-b bg-muted/40 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                    <div>WBS</div><div>Task</div><div>Bobot</div><div>Status</div><div>Progress</div><div></div>
                  </div>
                  <div className="divide-y">
                    {tasks.data.length === 0 && <div className="p-8 text-center text-muted-foreground text-sm">Belum ada task. Tambah task pertama.</div>}
                    {tasks.data?.tasks.map((t: any) => (
                      <div key={t.id} className="grid grid-cols-[80px_1fr_90px_120px_180px_40px] gap-3 px-4 py-2.5 items-center text-sm hover:bg-muted/30">
                        <div className="font-mono text-xs text-muted-foreground">{t.wbs_code ?? "—"}</div>
                        <div className="min-w-0">
                          <div className="truncate font-medium">{t.parent_id && <ChevronRight className="inline size-3 mr-1 text-muted-foreground" />}{t.name}</div>
                          <div className="text-[10px] text-muted-foreground">{t.planned_start ?? "—"} → {t.planned_end ?? "—"}</div>
                        </div>
                        <div className="font-mono text-xs">{Number(t.weight ?? 0).toFixed(1)}%</div>
                        <div><Badge variant="secondary" className={`text-[10px] ${STATUS_TONE[t.status] ?? ""}`}>{t.status.replace("_"," ")}</Badge></div>
                        <div className="flex items-center gap-2">
                          <Input type="number" min={0} max={100} value={Number(t.progress_percent)} onChange={e=>onProgress(t.id, Number(e.target.value))} className="h-7 w-16 text-xs" />
                          <Progress value={Number(t.progress_percent)} className="h-1.5 flex-1" />
                        </div>
                        <Button size="icon" variant="ghost" onClick={()=>onDelete(t.id)}><Trash2 className="size-3.5 text-muted-foreground" /></Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="gantt" className="mt-4">
            <Card className="p-4 overflow-x-auto">
              {!ganttRange ? <div className="text-muted-foreground text-sm p-8 text-center">Belum ada task dengan tanggal planned.</div> : (
                <div className="min-w-[700px] space-y-1.5">
                  {tasks.data?.tasks.filter((t: any)=>t.planned_start && t.planned_end).map((t: any) => {
                    const s = new Date(t.planned_start).getTime();
                    const e = new Date(t.planned_end).getTime();
                    const left = ((s - ganttRange.min) / ganttRange.span) * 100;
                    const width = Math.max(0.5, ((e - s) / ganttRange.span) * 100);
                    const prog = Number(t.progress_percent);
                    return (
                      <div key={t.id} className="grid grid-cols-[220px_1fr] gap-3 items-center">
                        <div className="text-xs truncate"><span className="font-mono text-muted-foreground mr-1">{t.wbs_code ?? "·"}</span>{t.name}</div>
                        <div className="relative h-6 bg-muted/40 rounded">
                          <div className="absolute top-0 h-full rounded bg-primary/30" style={{ left: `${left}%`, width: `${width}%` }}>
                            <div className="h-full rounded bg-primary" style={{ width: `${prog}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="grid grid-cols-[220px_1fr] gap-3 pt-2 text-[10px] text-muted-foreground border-t mt-3">
                    <div></div>
                    <div className="flex justify-between"><span>{new Date(ganttRange.min).toISOString().slice(0,10)}</span><span>{new Date(ganttRange.max).toISOString().slice(0,10)}</span></div>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="scurve" className="mt-4">
            <Card className="p-4">
              <div className="flex items-baseline justify-between mb-3">
                <h3 className="font-semibold">Kurva-S — Planned vs Actual</h3>
                <span className="text-xs text-muted-foreground">Cumulative % progress per minggu</span>
              </div>
              {(!curve.data?.points || curve.data.points.length === 0) ? (
                <div className="text-muted-foreground text-sm p-8 text-center">Butuh task dengan tanggal planned & bobot untuk menghitung kurva-S.</div>
              ) : (
                <div className="h-[360px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={curve.data.points} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="date" fontSize={11} stroke="var(--muted-foreground)" />
                      <YAxis domain={[0,100]} fontSize={11} stroke="var(--muted-foreground)" />
                      <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line type="monotone" dataKey="planned" name="Planned" stroke="var(--muted-foreground)" strokeWidth={2} dot={false} strokeDasharray="4 4" />
                      <Line type="monotone" dataKey="actual" name="Actual" stroke="var(--primary)" strokeWidth={2.5} dot={false} connectNulls />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}