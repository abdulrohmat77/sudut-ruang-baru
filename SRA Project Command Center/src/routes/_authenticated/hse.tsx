import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listHSE, createHSE, updateHSE, deleteHSE } from "@/lib/quality.functions";
import { ModuleHeader, CreateDialog, ProjectSelect, EmptyState, useProjectsList } from "@/components/app/module-page";
import { RowActions } from "@/components/app/row-actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/hse")({ component: Page });

const sevColor: Record<string, any> = { low: "secondary", medium: "secondary", high: "destructive", critical: "destructive" };

function Page() {
  const [pid, setPid] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const list = useServerFn(listHSE);
  const create = useServerFn(createHSE);
  const update = useServerFn(updateHSE);
  const remove = useServerFn(deleteHSE);
  const projects = useProjectsList();
  const { data, isLoading, refetch } = useQuery({ queryKey: ["hse", pid], queryFn: () => list({ data: { projectId: pid } }) });
  return (
    <div className="space-y-6">
      <ModuleHeader title="HSE Incidents" subtitle="Catatan insiden K3 dengan severity & tindakan korektif."
        projectId={pid} onProjectChange={setPid}
        actions={<CreateDialog open={open} onOpenChange={setOpen} title="Insiden HSE Baru">
          <HSEForm projects={projects.data?.projects ?? []} onSubmit={async (d) => { await create({ data: d }); toast.success("Insiden tersimpan"); setOpen(false); refetch(); }} />
        </CreateDialog>} />

      {isLoading ? <div className="text-sm text-muted-foreground">Memuat...</div>
        : (data.length ?? 0) === 0 ? <EmptyState label="Belum ada insiden HSE." />
        : <div className="grid gap-3 md:grid-cols-2">
            {data!.rows.map((r: any) => (
              <Card key={r.id} className="p-4">
                <div className="flex justify-between gap-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">{r.incident_no ?? "—"} · {r.projects?.code ?? "—"}</div>
                    <div className="font-semibold text-sm">{r.category ?? "Insiden"} · {r.incident_date ?? "—"}</div>
                  </div>
                  <div className="flex items-start gap-1 shrink-0">
                    <Badge variant={sevColor[r.severity] ?? "secondary"} className="capitalize">{r.severity}</Badge>
                    <RowActions
                      editTitle="Edit Insiden HSE"
                      editForm={(close) => (
                        <HSEForm initial={r} projects={projects.data?.projects ?? []} onSubmit={async (d) => {
                          const { project_id, ...patch } = d;
                          await update({ data: { id: r.id, ...patch } as any }); toast.success("Diperbarui"); close(); refetch();
                        }} />
                      )}
                      onDelete={async () => { await remove({ data: { id: r.id } }); refetch(); }}
                    />
                  </div>
                </div>
                {r.description && <p className="mt-2 text-sm line-clamp-3">{r.description}</p>}
                {r.corrective_action && <p className="mt-2 text-xs text-muted-foreground"><b>CA:</b> {r.corrective_action}</p>}
              </Card>
            ))}
          </div>}
    </div>
  );
}

function HSEForm({ initial, projects, onSubmit }: { initial?: any; projects: any[]; onSubmit: (d: any) => Promise<void> }) {
  const [f, setF] = useState({
    project_id: initial?.project_id ?? "",
    incident_no: initial?.incident_no ?? "",
    incident_date: initial?.incident_date ?? "",
    severity: (initial?.severity ?? "low") as "low"|"medium"|"high"|"critical",
    category: initial?.category ?? "",
    description: initial?.description ?? "",
    corrective_action: initial?.corrective_action ?? "",
    status: initial?.status ?? "open",
  });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit({
        project_id: f.project_id, incident_no: f.incident_no || null,
        incident_date: f.incident_date || null, severity: f.severity,
        category: f.category || null, description: f.description || null,
        corrective_action: f.corrective_action || null, status: f.status,
      });
    } catch (e: any) { toast.error(e.message); }
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <div><Label>Project</Label><ProjectSelect value={f.project_id} onChange={v=>setF({...f,project_id:v})} projects={projects} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>No. Insiden</Label><Input value={f.incident_no} onChange={e=>setF({...f,incident_no:e.target.value})} /></div>
        <div><Label>Tanggal</Label><Input type="date" value={f.incident_date} onChange={e=>setF({...f,incident_date:e.target.value})} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Severity</Label>
          <Select value={f.severity} onValueChange={v=>setF({...f,severity:v as any})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["low","medium","high","critical"].map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Kategori</Label><Input value={f.category} onChange={e=>setF({...f,category:e.target.value})} placeholder="Near-miss / First aid" /></div>
      </div>
      <div><Label>Deskripsi</Label><Textarea rows={3} value={f.description} onChange={e=>setF({...f,description:e.target.value})} /></div>
      <div><Label>Tindakan Korektif</Label><Textarea rows={3} value={f.corrective_action} onChange={e=>setF({...f,corrective_action:e.target.value})} /></div>
      <Button type="submit" className="w-full">Simpan</Button>
    </form>
  );
}