import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listProjects, createProject, updateProject, deleteProject } from "@/lib/projects.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RowActions } from "@/components/app/row-actions";
import { toast } from "sonner";
import { Plus, FolderKanban } from "lucide-react";
import { MONEY_OVERFLOW_MESSAGE, isWithinMonetaryRange } from "@/lib/money";
import { MoneyInput } from "@/components/app/money-input";

export const Route = createFileRoute("/_authenticated/projects/")({ component: ProjectsPage });

function ProjectsPage() {
  const list = useServerFn(listProjects);
  const create = useServerFn(createProject);
  const update = useServerFn(updateProject);
  const remove = useServerFn(deleteProject);
  const router = useRouter();
  const { data, isLoading, refetch } = useQuery({ queryKey: ["projects"], queryFn: () => list() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    code: "", name: "", client_name: "", location: "", description: "", contract_value: "",
    owner_name: "", owner_email: "", owner_phone: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cv = form.contract_value ? Number(form.contract_value) : null;
    if (!isWithinMonetaryRange(cv)) {
      toast.error(MONEY_OVERFLOW_MESSAGE);
      return;
    }
    setSubmitting(true);
    try {
      await create({ data: {
        code: form.code, name: form.name,
        client_name: form.client_name || null,
        location: form.location || null,
        description: form.description || null,
        contract_value: cv,
        owner_name: form.owner_name || null,
        owner_email: form.owner_email || null,
        owner_phone: form.owner_phone || null,
      }});
      toast.success("Project dibuat");
      setOpen(false);
      setForm({ code: "", name: "", client_name: "", location: "", description: "", contract_value: "", owner_name: "", owner_email: "", owner_phone: "" });
      refetch();
      router.invalidate();
    } catch (err: any) {
      toast.error(err.message ?? "Gagal membuat project");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground text-sm mt-1">Portofolio proyek SRA mengikuti SOP: Brief → Konsep → DD → DED → Tender → Konstruksi → BAST</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="size-4 mr-1" /> Project Baru</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Buat Project Baru</DialogTitle>
              <DialogDescription>Isi data dasar proyek. Tahapan SOP akan otomatis dibuat.</DialogDescription>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Kode Proyek</Label><Input required value={form.code} onChange={e=>setForm({...form,code:e.target.value})} placeholder="SRA-2026-001" /></div>
                <div><Label>Nilai Kontrak (IDR)</Label><MoneyInput fieldLabel="Nilai Kontrak" value={form.contract_value} onValueChange={(v)=>setForm({...form,contract_value:v})} placeholder="0" /></div>
              </div>
              <div><Label>Nama Proyek</Label><Input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Klien</Label><Input value={form.client_name} onChange={e=>setForm({...form,client_name:e.target.value})} /></div>
                <div><Label>Lokasi</Label><Input value={form.location} onChange={e=>setForm({...form,location:e.target.value})} /></div>
              </div>
              <div><Label>Deskripsi</Label><Textarea rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} /></div>
              <div className="border-t pt-3 mt-1">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">Owner / Klien Penerima Laporan</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2"><Label>Nama Owner</Label><Input value={form.owner_name} onChange={e=>setForm({...form,owner_name:e.target.value})} placeholder="Nama owner / PIC klien" /></div>
                  <div><Label>Email Owner</Label><Input type="email" value={form.owner_email} onChange={e=>setForm({...form,owner_email:e.target.value})} placeholder="owner@example.com" /></div>
                  <div><Label>WhatsApp Owner</Label><Input value={form.owner_phone} onChange={e=>setForm({...form,owner_phone:e.target.value})} placeholder="+6281234567890" /></div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5">Digest harian & alert akan dikirim otomatis ke email / WhatsApp ini.</p>
              </div>
              <Button type="submit" disabled={submitting} className="w-full">{submitting ? "Menyimpan..." : "Simpan Project"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground text-sm">Memuat...</div>
      ) : data.length === 0 ? (
        <Card className="p-12 text-center">
          <FolderKanban className="size-10 mx-auto text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">Belum ada project. Klik "Project Baru" untuk mulai.</p>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data?.projects.map((p: any) => (
            <Card key={p.id} className="p-5 hover:border-primary/60 transition-colors h-full relative">
              <div className="absolute top-3 right-3 z-10">
                <RowActions
                  editTitle="Edit Project"
                  confirmText="Project akan dihapus permanen. Pastikan tidak ada data terkait."
                  editForm={(close) => (
                    <ProjectEditForm initial={p} onSubmit={async (d) => {
                      await update({ data: { id: p.id, ...d } as any });
                      toast.success("Project diperbarui"); close(); refetch();
                    }} />
                  )}
                  onDelete={async () => { await remove({ data: { id: p.id } }); refetch(); router.invalidate(); }}
                />
              </div>
              <Link to="/projects/$projectId" params={{ projectId: p.id }} className="block">
                <div className="flex items-start justify-between gap-2 pr-8">
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">{p.code}</div>
                    <div className="font-semibold mt-0.5 truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground mt-1 truncate">{p.client_name ?? "—"} · {p.location ?? "—"}</div>
                  </div>
                  <Badge variant="secondary" className="capitalize shrink-0">{p.status}</Badge>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{Number(p.progress_percent).toFixed(0)}%</span>
                  </div>
                  <Progress value={Number(p.progress_percent)} className="h-1.5" />
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  Nilai: <span className="font-mono text-foreground">Rp {Number(p.contract_value ?? 0).toLocaleString("id-ID")}</span>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectEditForm({ initial, onSubmit }: { initial: any; onSubmit: (d: any) => Promise<void> }) {
  const [f, setF] = useState({
    code: initial?.code ?? "",
    name: initial?.name ?? "",
    client_name: initial?.client_name ?? "",
    location: initial?.location ?? "",
    description: initial?.description ?? "",
    contract_value: initial?.contract_value?.toString() ?? "",
    status: initial?.status ?? "active",
    progress_percent: initial?.progress_percent?.toString() ?? "0",
    owner_name: initial?.owner_name ?? "",
    owner_email: initial?.owner_email ?? "",
    owner_phone: initial?.owner_phone ?? "",
  });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cv = f.contract_value ? Number(f.contract_value) : null;
    if (!isWithinMonetaryRange(cv)) { toast.error(MONEY_OVERFLOW_MESSAGE); return; }
    try {
      await onSubmit({
        code: f.code, name: f.name,
        client_name: f.client_name || null, location: f.location || null,
        description: f.description || null, contract_value: cv,
        status: f.status,
        progress_percent: f.progress_percent ? Number(f.progress_percent) : 0,
        owner_name: f.owner_name || null,
        owner_email: f.owner_email || null,
        owner_phone: f.owner_phone || null,
      });
    } catch (e: any) { toast.error(e.message); }
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Kode</Label><Input required value={f.code} onChange={e=>setF({...f,code:e.target.value})} /></div>
        <div><Label>Nilai Kontrak (IDR)</Label><MoneyInput fieldLabel="Nilai Kontrak" value={f.contract_value} onValueChange={(v)=>setF({...f,contract_value:v})} /></div>
      </div>
      <div><Label>Nama Proyek</Label><Input required value={f.name} onChange={e=>setF({...f,name:e.target.value})} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Klien</Label><Input value={f.client_name} onChange={e=>setF({...f,client_name:e.target.value})} /></div>
        <div><Label>Lokasi</Label><Input value={f.location} onChange={e=>setF({...f,location:e.target.value})} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Status</Label><Input value={f.status} onChange={e=>setF({...f,status:e.target.value})} placeholder="active / on_hold / completed" /></div>
        <div><Label>Progress %</Label><Input type="number" step="0.1" value={f.progress_percent} onChange={e=>setF({...f,progress_percent:e.target.value})} /></div>
      </div>
      <div><Label>Deskripsi</Label><Textarea rows={2} value={f.description} onChange={e=>setF({...f,description:e.target.value})} /></div>
      <div className="border-t pt-2"><div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">Owner</div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Label>Nama Owner</Label><Input value={f.owner_name} onChange={e=>setF({...f,owner_name:e.target.value})} /></div>
          <div><Label>Email</Label><Input type="email" value={f.owner_email} onChange={e=>setF({...f,owner_email:e.target.value})} /></div>
          <div><Label>WhatsApp</Label><Input value={f.owner_phone} onChange={e=>setF({...f,owner_phone:e.target.value})} /></div>
        </div>
      </div>
      <Button type="submit" className="w-full">Simpan</Button>
    </form>
  );
}