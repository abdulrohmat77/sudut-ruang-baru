import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listInvoices, createInvoice, updateInvoice, deleteInvoice } from "@/lib/commercial.functions";
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
import { MONEY_OVERFLOW_MESSAGE, isWithinMonetaryRange } from "@/lib/money";
import { MoneyInput } from "@/components/app/money-input";

export const Route = createFileRoute("/_authenticated/invoices")({ component: Page });

function Page() {
  const [pid, setPid] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const list = useServerFn(listInvoices);
  const create = useServerFn(createInvoice);
  const update = useServerFn(updateInvoice);
  const remove = useServerFn(deleteInvoice);
  const projects = useProjectsList();
  const { data, isLoading, refetch } = useQuery({ queryKey: ["invoices", pid], queryFn: () => list({ data: { projectId: pid } }) });
  return (
    <div className="space-y-6">
      <ModuleHeader title="Invoice & Payment" subtitle="Pelacakan invoice, pajak, dan status pembayaran."
        projectId={pid} onProjectChange={setPid}
        actions={<CreateDialog open={open} onOpenChange={setOpen} title="Invoice Baru">
          <InvoiceForm projects={projects.data?.projects ?? []} onSubmit={async (data) => {
            await create({ data }); toast.success("Invoice tersimpan"); setOpen(false); refetch();
          }} />
        </CreateDialog>} />

      {isLoading ? <div className="text-sm text-muted-foreground">Memuat...</div>
        : (data.length ?? 0) === 0 ? <EmptyState label="Belum ada invoice." />
        : <Card><Table>
            <TableHeader><TableRow>
              <TableHead>No.</TableHead><TableHead>Project</TableHead><TableHead>Terbit</TableHead>
              <TableHead>Jatuh Tempo</TableHead><TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">PPN</TableHead><TableHead>Status</TableHead><TableHead className="w-10" />
            </TableRow></TableHeader>
            <TableBody>{data!.rows.map((r: any) => (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-xs">{r.invoice_no}</TableCell>
                <TableCell className="text-xs">{r.projects?.code ?? "—"}</TableCell>
                <TableCell className="text-xs">{r.issued_date ?? "—"}</TableCell>
                <TableCell className="text-xs">{r.due_date ?? "—"}</TableCell>
                <TableCell className="text-right font-mono">Rp {Number(r.amount).toLocaleString("id-ID")}</TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">Rp {Number(r.tax_amount ?? 0).toLocaleString("id-ID")}</TableCell>
                <TableCell><Badge variant={r.status === "paid" ? "default" : r.status === "overdue" ? "destructive" : "secondary"} className="capitalize">{r.status}</Badge></TableCell>
                <TableCell><RowActions
                  editTitle="Edit Invoice"
                  editForm={(close) => (
                    <InvoiceForm initial={r} projects={projects.data?.projects ?? []} onSubmit={async (d) => {
                      const { project_id, ...patch } = d;
                      await update({ data: { id: r.id, ...patch } as any });
                      toast.success("Invoice diperbarui"); close(); refetch();
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

function InvoiceForm({ initial, projects, onSubmit }: { initial?: any; projects: any[]; onSubmit: (data: any) => Promise<void> }) {
  const [f, setF] = useState({
    project_id: initial?.project_id ?? "",
    invoice_no: initial?.invoice_no ?? "",
    amount: initial?.amount?.toString() ?? "",
    tax_amount: initial?.tax_amount?.toString() ?? "",
    issued_date: initial?.issued_date ?? "",
    due_date: initial?.due_date ?? "",
    status: initial?.status ?? "pending",
    notes: initial?.notes ?? "",
  });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(f.amount || 0);
    const tax = Number(f.tax_amount || 0);
    if (!isWithinMonetaryRange(amt) || !isWithinMonetaryRange(tax)) { toast.error(MONEY_OVERFLOW_MESSAGE); return; }
    try {
      await onSubmit({
        project_id: f.project_id, invoice_no: f.invoice_no, amount: amt, tax_amount: tax,
        issued_date: f.issued_date || null, due_date: f.due_date || null,
        status: f.status, notes: f.notes || null,
      });
    } catch (e: any) { toast.error(e.message); }
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <div><Label>Project</Label><ProjectSelect value={f.project_id} onChange={v=>setF({...f,project_id:v})} projects={projects} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>No. Invoice</Label><Input required value={f.invoice_no} onChange={e=>setF({...f,invoice_no:e.target.value})} /></div>
        <div><Label>Status</Label>
          <Select value={f.status} onValueChange={v=>setF({...f,status:v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Amount (IDR)</Label><MoneyInput fieldLabel="Amount" required value={f.amount} onValueChange={(v)=>setF({...f,amount:v})} /></div>
        <div><Label>PPN (IDR)</Label><MoneyInput fieldLabel="PPN" value={f.tax_amount} onValueChange={(v)=>setF({...f,tax_amount:v})} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Tgl Terbit</Label><Input type="date" value={f.issued_date} onChange={e=>setF({...f,issued_date:e.target.value})} /></div>
        <div><Label>Jatuh Tempo</Label><Input type="date" value={f.due_date} onChange={e=>setF({...f,due_date:e.target.value})} /></div>
      </div>
      <div><Label>Catatan</Label><Textarea rows={2} value={f.notes} onChange={e=>setF({...f,notes:e.target.value})} /></div>
      <Button type="submit" className="w-full">Simpan</Button>
    </form>
  );
}