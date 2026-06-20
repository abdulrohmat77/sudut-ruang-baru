import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { listRisks, createRisk, updateRisk, deleteRisk } from "@/lib/quality.functions";
import { analyzeProjectRisks } from "@/lib/ai-analysis.functions";
import { ModuleHeader, CreateDialog, ProjectSelect, EmptyState, useProjectsList } from "@/components/app/module-page";
import { RowActions } from "@/components/app/row-actions";
import { AiResultButton } from "@/components/app/ai-result-dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/risks")({ component: Page });

const LEVELS = ["low", "medium", "high", "critical"] as const;
const SCORE: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };

function cellColor(p: string, i: string) {
  const s = SCORE[p] * SCORE[i];
  if (s >= 12) return "bg-destructive/80 text-destructive-foreground";
  if (s >= 6) return "bg-orange-500/70 text-white";
  if (s >= 3) return "bg-yellow-500/70 text-yellow-950";
  return "bg-emerald-500/60 text-emerald-950";
}

function Page() {
  const [pid, setPid] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const list = useServerFn(listRisks);
  const create = useServerFn(createRisk);
  const update = useServerFn(updateRisk);
  const remove = useServerFn(deleteRisk);
  const analyze = useServerFn(analyzeProjectRisks);
  const projects = useProjectsList();
  const { data, isLoading, refetch } = useQuery({ queryKey: ["risks", pid], queryFn: () => list({ data: { projectId: pid } }) });

  const matrix = useMemo(() => {
    const grid: Record<string, Record<string, number>> = {};
    LEVELS.forEach(p => { grid[p] = {}; LEVELS.forEach(i => grid[p][i] = 0); });
    (data?.rows ?? []).forEach((r: any) => { grid[r.probability][r.impact] += 1; });
    return grid;
  }, [data]);

  return (
    <div className="space-y-6">
      <ModuleHeader title="Risk Management" subtitle="Daftar risiko + Probability × Impact heatmap."
        projectId={pid} onProjectChange={setPid}
        actions={<div className="flex gap-2">
          {pid && <AiResultButton label="Analisis Risiko AI" title="Analisis Risiko Proyek (AI)" run={() => analyze({ data: { projectId: pid } })} />}
          <CreateDialog open={open} onOpenChange={setOpen} title="Risk Baru">
            <RiskForm projects={projects.data?.projects ?? []} onSubmit={async (d) => { await create({ data: d }); toast.success("Risk tersimpan"); setOpen(false); refetch(); }} />
          </CreateDialog>
        </div>} />

      <Card className="p-5">
        <div className="text-sm font-semibold mb-3">Probability × Impact Heatmap</div>
        <div className="inline-grid" style={{ gridTemplateColumns: `auto repeat(${LEVELS.length}, 80px)` }}>
          <div />
          {LEVELS.map(i => <div key={i} className="text-center text-[10px] uppercase tracking-widest text-muted-foreground pb-1">{i}</div>)}
          {[...LEVELS].reverse().map(p => (
            <div key={p} className="contents">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground pr-2 flex items-center justify-end">{p}</div>
              {LEVELS.map(i => (
                <div key={i} className={cn("h-14 m-0.5 rounded flex items-center justify-center text-sm font-bold", cellColor(p, i))}>
                  {matrix[p][i] || ""}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="text-[11px] text-muted-foreground mt-2">Baris = Probability · Kolom = Impact</div>
      </Card>

      {isLoading ? <div className="text-sm text-muted-foreground">Memuat...</div>
        : (data?.rows.length ?? 0) === 0 ? <EmptyState label="Belum ada risk yang dicatat." />
        : <div className="grid gap-3 md:grid-cols-2">
            {data!.rows.map((r: any) => (
              <Card key={r.id} className="p-4">
                <div className="flex justify-between gap-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">{r.projects?.code ?? "—"} · {r.category ?? "—"}</div>
                    <div className="font-semibold text-sm">{r.title}</div>
                  </div>
                  <div className="flex items-start gap-1 shrink-0">
                    <Badge variant="outline" className="capitalize text-[10px]">P:{r.probability}</Badge>
                    <Badge variant="outline" className="capitalize text-[10px]">I:{r.impact}</Badge>
                    <RowActions
                      editTitle="Edit Risk"
                      editForm={(close) => (
                        <RiskForm initial={r} projects={projects.data?.projects ?? []} onSubmit={async (d) => {
                          const { project_id, ...patch } = d;
                          await update({ data: { id: r.id, ...patch } as any }); toast.success("Diperbarui"); close(); refetch();
                        }} />
                      )}
                      onDelete={async () => { await remove({ data: { id: r.id } }); refetch(); }}
                    />
                  </div>
                </div>
                {r.mitigation && <p className="mt-2 text-xs text-muted-foreground"><b>Mitigasi:</b> {r.mitigation}</p>}
              </Card>
            ))}
          </div>}
    </div>
  );
}

function RiskForm({ initial, projects, onSubmit }: { initial?: any; projects: any[]; onSubmit: (d: any) => Promise<void> }) {
  const [f, setF] = useState({
    project_id: initial?.project_id ?? "",
    title: initial?.title ?? "",
    category: initial?.category ?? "",
    probability: (initial?.probability ?? "medium") as any,
    impact: (initial?.impact ?? "medium") as any,
    mitigation: initial?.mitigation ?? "",
    status: initial?.status ?? "open",
  });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit({
        project_id: f.project_id, title: f.title,
        category: f.category || null, probability: f.probability, impact: f.impact,
        mitigation: f.mitigation || null, status: f.status,
      });
    } catch (e: any) { toast.error(e.message); }
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <div><Label>Project</Label><ProjectSelect value={f.project_id} onChange={v=>setF({...f,project_id:v})} projects={projects} /></div>
      <div><Label>Judul Risiko</Label><Input required value={f.title} onChange={e=>setF({...f,title:e.target.value})} /></div>
      <div><Label>Kategori</Label><Input value={f.category} onChange={e=>setF({...f,category:e.target.value})} placeholder="Teknis / Komersial / SDM" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Probability</Label>
          <Select value={f.probability} onValueChange={v=>setF({...f,probability:v as any})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{LEVELS.map(l=><SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Impact</Label>
          <Select value={f.impact} onValueChange={v=>setF({...f,impact:v as any})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{LEVELS.map(l=><SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div><Label>Mitigasi</Label><Textarea rows={3} value={f.mitigation} onChange={e=>setF({...f,mitigation:e.target.value})} /></div>
      <Button type="submit" className="w-full">Simpan</Button>
    </form>
  );
}