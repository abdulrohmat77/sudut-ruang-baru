import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listQAQC, createQAQC, updateQAQC, deleteQAQC } from "@/lib/quality.functions";
import { ModuleHeader, CreateDialog, ProjectSelect, EmptyState, useProjectsList } from "@/components/app/module-page";
import { RowActions } from "@/components/app/row-actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/qaqc")({ component: Page });

function Page() {
  const [pid, setPid] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const list = useServerFn(listQAQC);
  const create = useServerFn(createQAQC);
  const update = useServerFn(updateQAQC);
  const remove = useServerFn(deleteQAQC);
  const projects = useProjectsList();
  const { data, isLoading, refetch } = useQuery({ queryKey: ["qaqc", pid], queryFn: () => list({ data: { projectId: pid } }) });
  return (
    <div className="space-y-6">
      <ModuleHeader title="QA / QC Inspections" subtitle="Pemeriksaan kualitas pekerjaan per area & item."
        projectId={pid} onProjectChange={setPid}
        actions={<CreateDialog open={open} onOpenChange={setOpen} title="Inspeksi QA/QC Baru">
          <QAQCForm projects={projects.data?.projects ?? []} onSubmit={async (d) => { await create({ data: d }); toast.success("Inspection tersimpan"); setOpen(false); refetch(); }} />
        </CreateDialog>} />

      {isLoading ? <div className="text-sm text-muted-foreground">Memuat...</div>
        : (data.length ?? 0) === 0 ? <EmptyState label="Belum ada inspeksi QA/QC." />
        : <Card><Table>
            <TableHeader><TableRow>
              <TableHead>No.</TableHead><TableHead>Project</TableHead><TableHead>Tipe</TableHead>
              <TableHead>Area</TableHead><TableHead>Tanggal</TableHead><TableHead>Hasil</TableHead><TableHead className="w-10" />
            </TableRow></TableHeader>
            <TableBody>{data!.rows.map((r: any) => (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-xs">{r.inspection_no ?? "—"}</TableCell>
                <TableCell className="text-xs">{r.projects?.code ?? "—"}</TableCell>
                <TableCell>{r.inspection_type ?? "—"}</TableCell>
                <TableCell>{r.area ?? "—"}</TableCell>
                <TableCell className="text-xs">{r.inspected_date ?? "—"}</TableCell>
                <TableCell><Badge variant={r.result === "pass" ? "default" : r.result === "fail" ? "destructive" : "secondary"} className="capitalize">{r.result ?? "—"}</Badge></TableCell>
                <TableCell><RowActions
                  editTitle="Edit Inspeksi"
                  editForm={(close) => (
                    <QAQCForm initial={r} projects={projects.data?.projects ?? []} onSubmit={async (d) => {
                      const { project_id, ...patch } = d;
                      await update({ data: { id: r.id, ...patch } as any }); toast.success("Diperbarui"); close(); refetch();
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

function QAQCForm({ initial, projects, onSubmit }: { initial?: any; projects: any[]; onSubmit: (d: any) => Promise<void> }) {
  const [f, setF] = useState({
    project_id: initial?.project_id ?? "",
    inspection_no: initial?.inspection_no ?? "",
    inspection_type: initial?.inspection_type ?? "",
    area: initial?.area ?? "",
    inspected_date: initial?.inspected_date ?? "",
    result: initial?.result ?? "pass",
    notes: initial?.notes ?? "",
  });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit({
        project_id: f.project_id, inspection_no: f.inspection_no || null,
        inspection_type: f.inspection_type || null, area: f.area || null,
        inspected_date: f.inspected_date || null, result: f.result, notes: f.notes || null,
      });
    } catch (e: any) { toast.error(e.message); }
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <div><Label>Project</Label><ProjectSelect value={f.project_id} onChange={v=>setF({...f,project_id:v})} projects={projects} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>No. Inspeksi</Label><Input value={f.inspection_no} onChange={e=>setF({...f,inspection_no:e.target.value})} /></div>
        <div><Label>Tipe</Label><Input value={f.inspection_type} onChange={e=>setF({...f,inspection_type:e.target.value})} placeholder="Pekerjaan struktur" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Area</Label><Input value={f.area} onChange={e=>setF({...f,area:e.target.value})} /></div>
        <div><Label>Tanggal</Label><Input type="date" value={f.inspected_date} onChange={e=>setF({...f,inspected_date:e.target.value})} /></div>
      </div>
      <div><Label>Hasil</Label>
        <Select value={f.result} onValueChange={v=>setF({...f,result:v})}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pass">Pass</SelectItem>
            <SelectItem value="fail">Fail</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div><Label>Catatan</Label><Textarea rows={3} value={f.notes} onChange={e=>setF({...f,notes:e.target.value})} /></div>
      <Button type="submit" className="w-full">Simpan</Button>
    </form>
  );
}