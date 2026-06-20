import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listVOs, createVO, updateVO, deleteVO } from "@/lib/commercial.functions";
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
import { MONEY_OVERFLOW_MESSAGE, isWithinMonetaryRange } from "@/lib/money";
import { MoneyInput } from "@/components/app/money-input";

export const Route = createFileRoute("/_authenticated/variations")({ component: Page });

function Page() {
  const [pid, setPid] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const list = useServerFn(listVOs);
  const create = useServerFn(createVO);
  const update = useServerFn(updateVO);
  const remove = useServerFn(deleteVO);
  const projects = useProjectsList();
  const { data, isLoading, refetch } = useQuery({ queryKey: ["vos", pid], queryFn: () => list({ data: { projectId: pid } }) });
  return (
    <div className="space-y-6">
      <ModuleHeader title="Variation Order / CCO" subtitle="Pengajuan perubahan lingkup dengan dampak biaya & waktu."
        projectId={pid} onProjectChange={setPid}
        actions={<CreateDialog open={open} onOpenChange={setOpen} title="VO Baru">
          <VOForm projects={projects.data?.projects ?? []} onSubmit={async (d) => { await create({ data: d }); toast.success("VO tersimpan"); setOpen(false); refetch(); }} />
        </CreateDialog>} />

      {isLoading ? <div className="text-sm text-muted-foreground">Memuat...</div>
        : (data?.rows.length ?? 0) === 0 ? <EmptyState label="Belum ada VO." />
        : <div className="grid gap-3 md:grid-cols-2">
            {data!.rows.map((r: any) => (
              <Card key={r.id} className="p-4">
                <div className="flex justify-between gap-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">{r.vo_no} · {r.projects?.code ?? "—"}</div>
                    <div className="font-semibold">{r.title}</div>
                  </div>
                  <div className="flex items-start gap-1 shrink-0">
                    <Badge variant={r.status === "approved" ? "default" : r.status === "rejected" ? "destructive" : "secondary"} className="capitalize">{r.status}</Badge>
                    <RowActions
                      editTitle="Edit VO"
                      editForm={(close) => (
                        <VOForm initial={r} projects={projects.data?.projects ?? []} onSubmit={async (d) => {
                          const { project_id, ...patch } = d;
                          await update({ data: { id: r.id, ...patch } as any }); toast.success("VO diperbarui"); close(); refetch();
                        }} />
                      )}
                      onDelete={async () => { await remove({ data: { id: r.id } }); refetch(); }}
                    />
                  </div>
                </div>
                {r.description && <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{r.description}</p>}
                <div className="mt-2 text-xs font-mono">Rp {Number(r.amount ?? 0).toLocaleString("id-ID")} · +{r.time_impact_days ?? 0} hari</div>
              </Card>
            ))}
          </div>}
    </div>
  );
}

function VOForm({ initial, projects, onSubmit }: { initial?: any; projects: any[]; onSubmit: (d: any) => Promise<void> }) {
  const [f, setF] = useState({
    project_id: initial?.project_id ?? "",
    vo_no: initial?.vo_no ?? "",
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    amount: initial?.amount?.toString() ?? "",
    time_impact_days: initial?.time_impact_days?.toString() ?? "",
    submitted_date: initial?.submitted_date ?? "",
    status: initial?.status ?? "submitted",
  });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = f.amount ? Number(f.amount) : 0;
    if (!isWithinMonetaryRange(amt)) { toast.error(MONEY_OVERFLOW_MESSAGE); return; }
    try {
      await onSubmit({
        project_id: f.project_id, vo_no: f.vo_no, title: f.title,
        description: f.description || null, amount: amt,
        time_impact_days: f.time_impact_days ? Number(f.time_impact_days) : 0,
        submitted_date: f.submitted_date || null, status: f.status,
      });
    } catch (e: any) { toast.error(e.message); }
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <div><Label>Project</Label><ProjectSelect value={f.project_id} onChange={v=>setF({...f,project_id:v})} projects={projects} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>No. VO</Label><Input required value={f.vo_no} onChange={e=>setF({...f,vo_no:e.target.value})} /></div>
        <div><Label>Status</Label>
          <Select value={f.status} onValueChange={v=>setF({...f,status:v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["submitted","under_review","approved","rejected"].map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div><Label>Judul</Label><Input required value={f.title} onChange={e=>setF({...f,title:e.target.value})} /></div>
      <div><Label>Deskripsi</Label><Textarea rows={3} value={f.description} onChange={e=>setF({...f,description:e.target.value})} /></div>
      <div className="grid grid-cols-3 gap-3">
        <div><Label>Amount (IDR)</Label><MoneyInput fieldLabel="Amount VO" value={f.amount} onValueChange={(v)=>setF({...f,amount:v})} /></div>
        <div><Label>+Hari</Label><Input type="number" value={f.time_impact_days} onChange={e=>setF({...f,time_impact_days:e.target.value})} /></div>
        <div><Label>Tgl Submit</Label><Input type="date" value={f.submitted_date} onChange={e=>setF({...f,submitted_date:e.target.value})} /></div>
      </div>
      <Button type="submit" className="w-full">Simpan</Button>
    </form>
  );
}