import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listProjects } from "@/lib/projects.functions";
import {
  SRA_PHASES, listDeliverables, seedGovTemplate, upsertDeliverable,
  updateDeliverableStatus, deleteDeliverable,
} from "@/lib/design-monitoring.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Trash2, Sparkles, FileText, Image as ImageIcon, ClipboardCheck, FileSignature, Layers } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/design-monitoring")({ component: DesignMonitoringPage });

const STATUS_TONE: Record<string, string> = {
  todo: "bg-muted text-muted-foreground",
  in_progress: "bg-info/15 text-info",
  in_review: "bg-warning/15 text-warning",
  approved: "bg-success/15 text-success",
  revisi: "bg-destructive/15 text-destructive",
};

const STATUS_LABEL: Record<string, string> = {
  todo: "Belum Mulai", in_progress: "Dikerjakan", in_review: "Review", approved: "Disetujui", revisi: "Revisi",
};

const CAT_ICON: Record<string, any> = {
  dokumen: FileText, gambar: ImageIcon, laporan: ClipboardCheck, ba: FileSignature, administrasi: Layers,
};

function DesignMonitoringPage() {
  const lp = useServerFn(listProjects);
  const ld = useServerFn(listDeliverables);
  const seed = useServerFn(seedGovTemplate);
  const upsert = useServerFn(upsertDeliverable);
  const setStatus = useServerFn(updateDeliverableStatus);
  const del = useServerFn(deleteDeliverable);

  const projects = useQuery({ queryKey: ["projects"], queryFn: () => lp() });
  const [projectId, setProjectId] = useState<string | null>(null);
  const activeId = projectId ?? projects.data?.projects[0]?.id ?? null;

  const deliverables = useQuery({
    queryKey: ["deliverables", activeId],
    queryFn: () => ld({ data: { projectId: activeId! } }),
    enabled: !!activeId,
  });

  const grouped = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const ph of SRA_PHASES) map[ph.key] = [];
    (deliverables.data?.deliverables ?? []).forEach((d: any) => {
      (map[d.phase_key] ||= []).push(d);
    });
    return map;
  }, [deliverables.data]);

  const overall = useMemo(() => {
    const all = deliverables.data?.deliverables ?? [];
    if (all.length === 0) return { total: 0, approved: 0, pct: 0 };
    const approved = all.filter((d: any) => d.status === "approved").length;
    return { total: all.length, approved, pct: Math.round((approved / all.length) * 100) };
  }, [deliverables.data]);

  const onSeed = async (overwrite: boolean) => {
    if (!activeId) return;
    if (overwrite && !confirm("Hapus semua deliverable yang ada lalu seed ulang dengan template pemerintahan?")) return;
    try {
      const r = await seed({ data: { projectId: activeId, overwrite } });
      toast.success(`Template dimuat: ${r.inserted} item`);
      deliverables.refetch();
    } catch (e: any) { toast.error(e.message); }
  };

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ phase_key: "brief", code: "", name: "", category: "dokumen", due_date: "", file_url: "", notes: "" });

  const openNew = (phaseKey: string) => {
    setEditing(null);
    setForm({ phase_key: phaseKey, code: "", name: "", category: "dokumen", due_date: "", file_url: "", notes: "" });
    setOpen(true);
  };
  const openEdit = (d: any) => {
    setEditing(d);
    setForm({
      phase_key: d.phase_key, code: d.code ?? "", name: d.name, category: d.category,
      due_date: d.due_date ?? "", file_url: d.file_url ?? "", notes: d.notes ?? "",
    });
    setOpen(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeId) return;
    try {
      await upsert({ data: {
        id: editing?.id,
        project_id: activeId,
        phase_key: form.phase_key,
        code: form.code || null,
        name: form.name,
        category: form.category,
        required: true,
        due_date: form.due_date || null,
        file_url: form.file_url || null,
        notes: form.notes || null,
        sequence: editing?.sequence ?? 0,
      }});
      toast.success(editing ? "Deliverable diperbarui" : "Deliverable ditambahkan");
      setOpen(false);
      deliverables.refetch();
    } catch (e: any) { toast.error(e.message); }
  };

  const onStatus = async (id: string, status: string) => {
    try { await setStatus({ data: { id, status: status as any } }); deliverables.refetch(); }
    catch (e: any) { toast.error(e.message); }
  };
  const onDel = async (id: string) => {
    if (!confirm("Hapus deliverable ini?")) return;
    try { await del({ data: { id } }); deliverables.refetch(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Design Monitoring</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monitoring deliverable perencanaan per tahap (Brief → Konsep → DD → DED → Tender → Konstruksi → BAST).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={activeId ?? ""} onValueChange={(v) => setProjectId(v)}>
            <SelectTrigger className="w-full sm:w-[280px]"><SelectValue placeholder="Pilih project" /></SelectTrigger>
            <SelectContent>
              {projects.data?.projects.map((p: any) => (
                <SelectItem key={p.id} value={p.id}>{p.code} · {p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => onSeed(false)} disabled={!activeId}>
            <Sparkles className="size-4 mr-1" /> Seed Template
          </Button>
        </div>
      </div>

      {!activeId ? (
        <Card className="p-12 text-center text-muted-foreground text-sm">Belum ada project. Buat project dulu.</Card>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-4">
            <Card className="p-4"><div className="text-xs text-muted-foreground">Total Deliverable</div><div className="text-2xl font-bold mt-1">{overall.total}</div></Card>
            <Card className="p-4"><div className="text-xs text-muted-foreground">Disetujui</div><div className="text-2xl font-bold mt-1 text-success">{overall.approved}</div></Card>
            <Card className="p-4"><div className="text-xs text-muted-foreground">Outstanding</div><div className="text-2xl font-bold mt-1">{overall.total - overall.approved}</div></Card>
            <Card className="p-4">
              <div className="text-xs text-muted-foreground">Progress Perencanaan</div>
              <div className="text-2xl font-bold mt-1">{overall.pct}%</div>
              <Progress value={overall.pct} className="h-1.5 mt-2" />
            </Card>
          </div>

          {overall.total === 0 ? (
            <Card className="p-12 text-center space-y-3">
              <div className="text-muted-foreground text-sm">Belum ada deliverable untuk project ini.</div>
              <Button onClick={() => onSeed(false)}><Sparkles className="size-4 mr-1" /> Muat Template Standar</Button>
              <p className="text-xs text-muted-foreground">Template mencakup ~40 deliverable: KAK, RAB, RKS, BOQ, DED, BA Aanwijzing, BAST I/II, dll.</p>
            </Card>
          ) : (
            <Tabs defaultValue={SRA_PHASES[0].key}>
              <TabsList className="flex-wrap h-auto">
                {SRA_PHASES.map((ph) => {
                  const items = grouped[ph.key] ?? [];
                  const done = items.filter((d) => d.status === "approved").length;
                  return (
                    <TabsTrigger key={ph.key} value={ph.key} className="text-xs">
                      {ph.name}
                      <Badge variant="secondary" className="ml-2 text-[10px]">{done}/{items.length}</Badge>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {SRA_PHASES.map((ph) => {
                const items = grouped[ph.key] ?? [];
                const done = items.filter((d) => d.status === "approved").length;
                const pct = items.length ? Math.round((done / items.length) * 100) : 0;
                return (
                  <TabsContent key={ph.key} value={ph.key} className="mt-4">
                    <Card className="p-0 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                        <div>
                          <div className="font-semibold">{ph.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{done} dari {items.length} deliverable disetujui · {pct}%</div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => openNew(ph.key)}>
                          <Plus className="size-3.5 mr-1" /> Deliverable
                        </Button>
                      </div>
                      <Progress value={pct} className="h-1 rounded-none" />
                      <div className="overflow-x-auto">
                        <div className="min-w-[720px] divide-y">
                          {items.length === 0 && <div className="p-8 text-center text-muted-foreground text-sm">Belum ada deliverable pada tahap ini.</div>}
                          {items.map((d: any) => {
                          const Icon = CAT_ICON[d.category] ?? FileText;
                          return (
                            <div key={d.id} className="grid grid-cols-[28px_70px_1fr_140px_150px_70px] gap-3 items-center px-4 py-2.5 text-sm hover:bg-muted/30">
                              <Icon className="size-4 text-muted-foreground" />
                              <div className="font-mono text-[11px] text-muted-foreground">{d.code ?? "—"}</div>
                              <div className="min-w-0">
                                <button onClick={() => openEdit(d)} className="text-left font-medium hover:underline truncate block w-full">{d.name}</button>
                                <div className="text-[10px] text-muted-foreground capitalize">
                                  {d.category}{d.due_date ? ` · due ${d.due_date}` : ""}{d.file_url ? " · ada lampiran" : ""}
                                </div>
                              </div>
                              <Badge variant="secondary" className={`text-[10px] ${STATUS_TONE[d.status]}`}>{STATUS_LABEL[d.status]}</Badge>
                              <Select value={d.status} onValueChange={(v) => onStatus(d.id, v)}>
                                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {Object.entries(STATUS_LABEL).map(([k, v]) => (
                                    <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button size="icon" variant="ghost" onClick={() => onDel(d.id)}><Trash2 className="size-3.5 text-muted-foreground" /></Button>
                            </div>
                          );
                        })}
                        </div>
                      </div>
                    </Card>
                  </TabsContent>
                );
              })}
            </Tabs>
          )}
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Deliverable" : "Tambah Deliverable"}</DialogTitle>
            <DialogDescription>Deliverable yang harus diselesaikan pada tahap ini.</DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tahap</Label>
                <Select value={form.phase_key} onValueChange={(v) => setForm({ ...form, phase_key: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SRA_PHASES.map((p) => <SelectItem key={p.key} value={p.key}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Kategori</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dokumen">Dokumen</SelectItem>
                    <SelectItem value="gambar">Gambar</SelectItem>
                    <SelectItem value="laporan">Laporan</SelectItem>
                    <SelectItem value="ba">Berita Acara</SelectItem>
                    <SelectItem value="administrasi">Administrasi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Kode</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="DED-01" /></div>
              <div className="col-span-2"><Label>Nama Deliverable</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Due Date</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
              <div><Label>Link File / URL</Label><Input value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} placeholder="https://..." /></div>
            </div>
            <div><Label>Catatan</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <Button type="submit" className="w-full">Simpan</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}