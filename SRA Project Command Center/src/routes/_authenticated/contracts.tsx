import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listContracts, createContract, updateContract, deleteContract } from "@/lib/commercial.functions";
import { ModuleHeader, CreateDialog, ProjectSelect, EmptyState, useProjectsList } from "@/components/app/module-page";
import { RowActions } from "@/components/app/row-actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { MONEY_OVERFLOW_MESSAGE, isWithinMonetaryRange } from "@/lib/money";
import { MoneyInput } from "@/components/app/money-input";

export const Route = createFileRoute("/_authenticated/contracts")({ component: Page });

function Page() {
  const [pid, setPid] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const list = useServerFn(listContracts);
  const create = useServerFn(createContract);
  const update = useServerFn(updateContract);
  const remove = useServerFn(deleteContract);
  const projects = useProjectsList();
  const { data, isLoading, refetch } = useQuery({ queryKey: ["contracts", pid], queryFn: () => list({ data: { projectId: pid } }) });
  return (
    <div className="space-y-6">
      <ModuleHeader title="Contract Management" subtitle="Daftar kontrak proyek, vendor, dan nilai komersial."
        projectId={pid} onProjectChange={setPid}
        actions={<CreateDialog open={open} onOpenChange={setOpen} title="Kontrak Baru">
          <ContractForm projects={projects.data?.projects ?? []} onSubmit={async (d) => {
            await create({ data: d }); toast.success("Kontrak tersimpan"); setOpen(false); refetch();
          }} />
        </CreateDialog>} />

      {isLoading ? <div className="text-sm text-muted-foreground">Memuat...</div>
        : (data.length ?? 0) === 0 ? <EmptyState label="Belum ada kontrak." />
        : <Card><Table>
            <TableHeader><TableRow>
              <TableHead>No. Kontrak</TableHead><TableHead>Judul</TableHead><TableHead>Project</TableHead>
              <TableHead>Counterparty</TableHead><TableHead className="text-right">Nilai</TableHead><TableHead>Status</TableHead><TableHead className="w-10" />
            </TableRow></TableHeader>
            <TableBody>{data!.rows.map((r: any) => (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-xs">{r.contract_no}</TableCell>
                <TableCell className="font-medium">{r.title}</TableCell>
                <TableCell className="text-xs">{r.projects?.code ?? "—"}</TableCell>
                <TableCell>{r.counterparty ?? "—"}</TableCell>
                <TableCell className="text-right font-mono">Rp {Number(r.value ?? 0).toLocaleString("id-ID")}</TableCell>
                <TableCell><Badge variant="secondary" className="capitalize">{r.status}</Badge></TableCell>
                <TableCell><RowActions
                  editTitle="Edit Kontrak"
                  editForm={(close) => (
                    <ContractForm initial={r} projects={projects.data?.projects ?? []} onSubmit={async (d) => {
                      const { project_id, ...patch } = d;
                      await update({ data: { id: r.id, ...patch } as any });
                      toast.success("Kontrak diperbarui"); close(); refetch();
                    }} />
                  )}
                  onDelete={async () => { await remove({ data: { id: r.id } }); refetch(); }}
                /></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table></Card>}
    </div>
  );
}

function ContractForm({ initial, projects, onSubmit }: { initial?: any; projects: any[]; onSubmit: (d: any) => Promise<void> }) {
  const [f, setF] = useState({
    project_id: initial?.project_id ?? "",
    contract_no: initial?.contract_no ?? "",
    title: initial?.title ?? "",
    counterparty: initial?.counterparty ?? "",
    value: initial?.value?.toString() ?? "",
    start_date: initial?.start_date ?? "",
    end_date: initial?.end_date ?? "",
    signed_date: initial?.signed_date ?? "",
  });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = f.value ? Number(f.value) : 0;
    if (!isWithinMonetaryRange(val)) { toast.error(MONEY_OVERFLOW_MESSAGE); return; }
    try {
      await onSubmit({
        project_id: f.project_id, contract_no: f.contract_no, title: f.title,
        counterparty: f.counterparty || null, value: val,
        start_date: f.start_date || null, end_date: f.end_date || null, signed_date: f.signed_date || null,
      });
    } catch (e: any) { toast.error(e.message); }
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <div><Label>Project</Label><ProjectSelect value={f.project_id} onChange={v=>setF({...f,project_id:v})} projects={projects} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>No. Kontrak</Label><Input required value={f.contract_no} onChange={e=>setF({...f,contract_no:e.target.value})} /></div>
        <div><Label>Nilai (IDR)</Label><MoneyInput fieldLabel="Nilai Kontrak" value={f.value} onValueChange={(v)=>setF({...f,value:v})} /></div>
      </div>
      <div><Label>Judul</Label><Input required value={f.title} onChange={e=>setF({...f,title:e.target.value})} /></div>
      <div><Label>Counterparty</Label><Input value={f.counterparty} onChange={e=>setF({...f,counterparty:e.target.value})} /></div>
      <div className="grid grid-cols-3 gap-3">
        <div><Label>Tgl TTD</Label><Input type="date" value={f.signed_date} onChange={e=>setF({...f,signed_date:e.target.value})} /></div>
        <div><Label>Mulai</Label><Input type="date" value={f.start_date} onChange={e=>setF({...f,start_date:e.target.value})} /></div>
        <div><Label>Selesai</Label><Input type="date" value={f.end_date} onChange={e=>setF({...f,end_date:e.target.value})} /></div>
      </div>
      <Button type="submit" className="w-full">Simpan</Button>
    </form>
  );
}