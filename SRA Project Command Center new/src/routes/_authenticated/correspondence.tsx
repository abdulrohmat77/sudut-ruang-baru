import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import {
  listCorrespondence, createCorrespondence, updateCorrespondence, deleteCorrespondence,
  listCorrespondenceTemplates, upsertCorrespondenceTemplate, deleteCorrespondenceTemplate,
  createAttachmentUploadUrl, getAttachmentSignedUrl,
} from "@/lib/knowledge.functions";
import { crmSupabase as supabase } from "@/integrations/crm/client";
import { ModuleHeader, CreateDialog, ProjectSelect, EmptyState, useProjectsList } from "@/components/app/module-page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowDownLeft, ArrowUpRight, Paperclip, Pencil, Trash2, Plus, Upload, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/correspondence")({ component: Page });

type Status = "draft" | "sent" | "received";
const STATUS_META: Record<Status, { label: string; cls: string }> = {
  draft:    { label: "Draft",    cls: "bg-muted text-muted-foreground" },
  sent:     { label: "Sent",     cls: "bg-success/15 text-success" },
  received: { label: "Received", cls: "bg-info/15 text-info" },
};

function emptyForm(pid: string | null) {
  return {
    id: undefined as string | undefined,
    project_id: pid ?? "",
    ref_no: "", direction: "out" as "in" | "out",
    status: "draft" as Status, subject: "",
    from_party: "", to_party: "",
    sent_date: "", body: "",
    attachment_path: "" as string,
    template_id: "" as string,
  };
}

function Page() {
  const [pid, setPid] = useState<string | null>(null);
  const [tab, setTab] = useState("letters");
  return (
    <div className="space-y-6">
      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Correspondence</h1>
            <p className="text-muted-foreground text-sm mt-1">Surat masuk & keluar, template, status, dan lampiran per proyek.</p>
          </div>
          <TabsList>
            <TabsTrigger value="letters"><FileText className="size-3.5 mr-1.5" /> Surat</TabsTrigger>
            <TabsTrigger value="templates"><FileText className="size-3.5 mr-1.5" /> Template</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="letters" className="mt-4 space-y-4"><Letters pid={pid} setPid={setPid} /></TabsContent>
        <TabsContent value="templates" className="mt-4"><Templates /></TabsContent>
      </Tabs>
    </div>
  );
}

function Letters({ pid, setPid }: { pid: string | null; setPid: (v: string | null) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm(pid));
  const [uploading, setUploading] = useState(false);

  const list = useServerFn(listCorrespondence);
  const create = useServerFn(createCorrespondence);
  const update = useServerFn(updateCorrespondence);
  const del = useServerFn(deleteCorrespondence);
  const listTpl = useServerFn(listCorrespondenceTemplates);
  const createUpload = useServerFn(createAttachmentUploadUrl);
  const getUrl = useServerFn(getAttachmentSignedUrl);

  const projects = useProjectsList();
  const tpls = useQuery({ queryKey: ["corr-templates"], queryFn: () => listTpl() });
  const { data, isLoading, refetch } = useQuery({ queryKey: ["corr", pid], queryFn: () => list({ data: { projectId: pid } }) });

  const fileRef = useRef<HTMLInputElement>(null);

  const onOpen = () => { setForm(emptyForm(pid)); setOpen(true); };
  const onEdit = (r: any) => {
    setForm({
      id: r.id, project_id: r.project_id, ref_no: r.ref_no ?? "",
      direction: r.direction ?? "out", status: r.status ?? "draft",
      subject: r.subject ?? "", from_party: r.from_party ?? "", to_party: r.to_party ?? "",
      sent_date: r.sent_date ?? "", body: r.body ?? "",
      attachment_path: r.attachment_url ?? "", template_id: r.template_id ?? "",
    });
    setOpen(true);
  };

  const applyTemplate = (tplId: string) => {
    const t = (tpls.data?.rows ?? []).find((x: any) => x.id === tplId);
    if (!t) return;
    setForm(f => ({
      ...f,
      template_id: tplId,
      direction: (t.direction === "in" || t.direction === "out") ? t.direction : f.direction,
      subject: f.subject || t.subject_template,
      body: f.body || (t.body_template ?? ""),
    }));
  };

  const upload = async (file: File) => {
    if (!form.project_id) { toast.error("Pilih project dulu"); return; }
    setUploading(true);
    try {
      const { path, token } = await createUpload({ data: { folder: "correspondence", project_id: form.project_id, filename: file.name } });
      const { error } = await supabase.storage.from("attachments").uploadToSignedUrl(path, token, file);
      if (error) throw error;
      setForm(f => ({ ...f, attachment_path: path }));
      toast.success("Lampiran terupload");
    } catch (e: any) { toast.error(e.message); }
    finally { setUploading(false); }
  };

  const openAttachment = async (p: string) => {
    try {
      if (/^https?:/.test(p)) { window.open(p, "_blank"); return; }
      const { signedUrl } = await getUrl({ data: { path: p } });
      window.open(signedUrl, "_blank");
    } catch (e: any) { toast.error(e.message); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        project_id: form.project_id,
        ref_no: form.ref_no || null,
        direction: form.direction,
        status: form.status,
        subject: form.subject,
        from_party: form.from_party || null,
        to_party: form.to_party || null,
        sent_date: form.sent_date || null,
        body: form.body || null,
        attachment_url: form.attachment_path || null,
        template_id: form.template_id || null,
      };
      if (form.id) await update({ data: { id: form.id, ...payload } });
      else await create({ data: payload });
      toast.success("Surat tersimpan"); setOpen(false); refetch();
    } catch (e: any) { toast.error(e.message); }
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus surat?")) return;
    try { await del({ data: { id } }); toast.success("Dihapus"); refetch(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-4">
      <ModuleHeader title="" projectId={pid} onProjectChange={setPid}
        actions={<Button onClick={onOpen}><Plus className="size-4 mr-1" />Surat Baru</Button>} />

      <CreateDialog open={open} onOpenChange={setOpen} title={form.id ? "Edit Surat" : "Surat Baru"} trigger={<span className="hidden" />}>
        <form onSubmit={submit} className="space-y-3">
          <div><Label>Project</Label><ProjectSelect value={form.project_id} onChange={v=>setForm({...form,project_id:v})} projects={projects.data?.projects ?? []} /></div>
          {(tpls.data?.rows ?? []).length > 0 && (
            <div><Label>Template (opsional)</Label>
              <Select value={form.template_id || "none"} onValueChange={v => v === "none" ? setForm({...form, template_id: ""}) : applyTemplate(v)}>
                <SelectTrigger><SelectValue placeholder="Pilih template" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Tanpa template —</SelectItem>
                  {(tpls.data?.rows ?? []).map((t: any) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-3 gap-3">
            <div><Label>No. Referensi</Label><Input value={form.ref_no} onChange={e=>setForm({...form,ref_no:e.target.value})} /></div>
            <div><Label>Arah</Label>
              <Select value={form.direction} onValueChange={(v:any)=>setForm({...form,direction:v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">Masuk</SelectItem>
                  <SelectItem value="out">Keluar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Status</Label>
              <Select value={form.status} onValueChange={(v:any)=>setForm({...form,status:v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Subjek</Label><Input required value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Dari</Label><Input value={form.from_party} onChange={e=>setForm({...form,from_party:e.target.value})} /></div>
            <div><Label>Kepada</Label><Input value={form.to_party} onChange={e=>setForm({...form,to_party:e.target.value})} /></div>
          </div>
          <div><Label>Tanggal</Label><Input type="date" value={form.sent_date} onChange={e=>setForm({...form,sent_date:e.target.value})} /></div>
          <div><Label>Isi</Label><Textarea rows={5} value={form.body} onChange={e=>setForm({...form,body:e.target.value})} /></div>
          <div>
            <Label>Lampiran File</Label>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading || !form.project_id}>
                {uploading ? <Loader2 className="size-4 mr-1 animate-spin" /> : <Upload className="size-4 mr-1" />}
                {form.attachment_path ? "Ganti file" : "Upload file"}
              </Button>
              <input ref={fileRef} type="file" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); }} />
              {form.attachment_path && <span className="text-xs text-muted-foreground truncate flex-1">{form.attachment_path.split("/").pop()}</span>}
              {form.attachment_path && <Button type="button" size="sm" variant="ghost" onClick={() => setForm({...form, attachment_path: ""})}>Hapus</Button>}
            </div>
          </div>
          <Button type="submit" className="w-full">{form.id ? "Simpan Perubahan" : "Simpan Surat"}</Button>
        </form>
      </CreateDialog>

      {isLoading ? <div className="text-sm text-muted-foreground">Memuat...</div>
        : (data?.rows.length ?? 0) === 0 ? <EmptyState label="Belum ada surat tercatat." />
        : <div className="space-y-2">
            {data!.rows.map((r: any) => {
              const st: Status = (r.status ?? "draft") as Status;
              const meta = STATUS_META[st] ?? STATUS_META.draft;
              return (
                <Card key={r.id} className="p-4 flex gap-3 items-start">
                  <div className={`size-8 rounded-md flex items-center justify-center shrink-0 ${r.direction === "in" ? "bg-info/15 text-info" : "bg-success/15 text-success"}`}>
                    {r.direction === "in" ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-2">
                      {r.ref_no && <span className="font-mono text-[10px] text-muted-foreground">{r.ref_no}</span>}
                      <span className="font-semibold text-sm truncate">{r.subject}</span>
                      <Badge variant="outline" className="text-[10px]">{r.projects?.code ?? "—"}</Badge>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${meta.cls}`}>{meta.label}</span>
                      {r.correspondence_templates?.name && <Badge variant="secondary" className="text-[10px]">tpl: {r.correspondence_templates.name}</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{r.from_party ?? "—"} → {r.to_party ?? "—"} · {r.sent_date ?? "—"}</div>
                    {r.body && <p className="text-sm mt-1 line-clamp-2">{r.body}</p>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {r.attachment_url && (
                      <Button size="icon" variant="ghost" onClick={() => openAttachment(r.attachment_url)} title="Buka lampiran"><Paperclip className="size-4" /></Button>
                    )}
                    <Button size="icon" variant="ghost" onClick={() => onEdit(r)}><Pencil className="size-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="size-4 text-destructive" /></Button>
                  </div>
                </Card>
              );
            })}
          </div>}
    </div>
  );
}

function Templates() {
  const list = useServerFn(listCorrespondenceTemplates);
  const upsert = useServerFn(upsertCorrespondenceTemplate);
  const del = useServerFn(deleteCorrespondenceTemplate);
  const { data, isLoading, refetch } = useQuery({ queryKey: ["corr-templates"], queryFn: () => list() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ id: undefined as string|undefined, name: "", direction: "out" as "in"|"out", subject_template: "", body_template: "" });

  const onNew = () => { setForm({ id: undefined, name: "", direction: "out", subject_template: "", body_template: "" }); setOpen(true); };
  const onEdit = (t: any) => { setForm({ id: t.id, name: t.name, direction: t.direction, subject_template: t.subject_template, body_template: t.body_template ?? "" }); setOpen(true); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await upsert({ data: form }); toast.success("Template tersimpan"); setOpen(false); refetch(); }
    catch (e: any) { toast.error(e.message); }
  };
  const remove = async (id: string) => {
    if (!confirm("Hapus template?")) return;
    try { await del({ data: { id } }); toast.success("Dihapus"); refetch(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button onClick={onNew}><Plus className="size-4 mr-1" />Template Baru</Button>
      </div>
      <CreateDialog open={open} onOpenChange={setOpen} title={form.id ? "Edit Template" : "Template Baru"} trigger={<span className="hidden" />}>
        <form onSubmit={submit} className="space-y-3">
          <div><Label>Nama Template</Label><Input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Surat Permohonan Approval" /></div>
          <div><Label>Arah</Label>
            <Select value={form.direction} onValueChange={(v:any)=>setForm({...form,direction:v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="in">Masuk</SelectItem>
                <SelectItem value="out">Keluar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Subjek</Label><Input required value={form.subject_template} onChange={e=>setForm({...form,subject_template:e.target.value})} /></div>
          <div><Label>Body Template</Label><Textarea rows={8} value={form.body_template} onChange={e=>setForm({...form,body_template:e.target.value})} /></div>
          <Button type="submit" className="w-full">{form.id ? "Simpan" : "Buat Template"}</Button>
        </form>
      </CreateDialog>

      {isLoading ? <div className="text-sm text-muted-foreground">Memuat...</div>
        : (data?.rows.length ?? 0) === 0 ? <EmptyState label="Belum ada template surat." />
        : <div className="grid gap-3 md:grid-cols-2">
            {data!.rows.map((t: any) => (
              <Card key={t.id} className="p-4">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm truncate">{t.name}</h3>
                      <Badge variant="outline" className="text-[10px]">{t.direction === "in" ? "Masuk" : "Keluar"}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 truncate">{t.subject_template}</div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" onClick={() => onEdit(t)}><Pencil className="size-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(t.id)}><Trash2 className="size-4 text-destructive" /></Button>
                  </div>
                </div>
                {t.body_template && <p className="text-xs text-muted-foreground line-clamp-3 mt-2 border-t pt-2 whitespace-pre-wrap">{t.body_template}</p>}
              </Card>
            ))}
          </div>}
    </div>
  );
}