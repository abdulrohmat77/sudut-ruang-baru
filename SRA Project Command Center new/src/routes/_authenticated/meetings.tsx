import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  listMeetings, createMeeting, updateMeeting, deleteMeeting, toggleMeetingAction,
} from "@/lib/knowledge.functions";
import { ModuleHeader, CreateDialog, ProjectSelect, EmptyState, useProjectsList } from "@/components/app/module-page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarDays, MapPin, Users, Pencil, Trash2, Plus, X, FileDown } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/meetings")({ component: Page });

type Attendee = { name: string; role?: string|null; org?: string|null; present?: boolean };
type Action = { id?: string; task: string; owner?: string|null; due?: string|null; done?: boolean };

const emptyForm = () => ({
  id: undefined as string|undefined,
  project_id: "", title: "", meeting_date: "", location: "",
  agenda: "", minutes: "",
  attendees: [] as Attendee[],
  action_items: [] as Action[],
});

function Page() {
  const [pid, setPid] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());

  const list = useServerFn(listMeetings);
  const create = useServerFn(createMeeting);
  const update = useServerFn(updateMeeting);
  const del = useServerFn(deleteMeeting);
  const toggleAction = useServerFn(toggleMeetingAction);
  const projects = useProjectsList();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["meetings", pid],
    queryFn: () => list({ data: { projectId: pid } }),
  });

  const stats = useMemo(() => {
    const rows = data?.rows ?? [];
    let total = 0, done = 0;
    rows.forEach((m: any) => (m.action_items ?? []).forEach((a: any) => { total++; if (a.done) done++; }));
    return { meetings: rows.length, actions: total, done };
  }, [data]);

  const openCreate = () => { setForm({ ...emptyForm(), project_id: pid ?? "" }); setOpen(true); };
  const openEdit = (r: any) => {
    setForm({
      id: r.id, project_id: r.project_id, title: r.title ?? "",
      meeting_date: r.meeting_date ? new Date(r.meeting_date).toISOString().slice(0,16) : "",
      location: r.location ?? "", agenda: r.agenda ?? "", minutes: r.minutes ?? "",
      attendees: Array.isArray(r.attendees)
        ? r.attendees.map((a: any) => typeof a === "string" ? { name: a, present: true } : a)
        : [],
      action_items: Array.isArray(r.action_items) ? r.action_items : [],
    });
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        project_id: form.project_id,
        title: form.title,
        meeting_date: form.meeting_date || null,
        location: form.location || null,
        agenda: form.agenda || null,
        minutes: form.minutes || null,
        attendees: form.attendees.filter(a => a.name.trim()),
        action_items: form.action_items.filter(a => a.task.trim()),
      };
      if (form.id) await update({ data: { id: form.id, ...payload } });
      else await create({ data: payload });
      toast.success("Meeting tersimpan"); setOpen(false); refetch();
    } catch (e: any) { toast.error(e.message); }
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus meeting ini?")) return;
    try { await del({ data: { id } }); toast.success("Dihapus"); refetch(); }
    catch (e: any) { toast.error(e.message); }
  };

  const onToggle = async (mid: string, aid: string, done: boolean) => {
    try { await toggleAction({ data: { meeting_id: mid, action_id: aid, done } }); refetch(); }
    catch (e: any) { toast.error(e.message); }
  };

  const exportMOM = (r: any) => {
    const md = momToMarkdown(r);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `MOM-${(r.title ?? "meeting").replace(/\s+/g,"_")}.md`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <ModuleHeader title="Meetings" subtitle="Agenda, peserta, notulensi, dan action items — feed ke Daily & Final Report."
        projectId={pid} onProjectChange={setPid}
        actions={<Button onClick={openCreate}><Plus className="size-4 mr-1" />Meeting Baru</Button>} />

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="p-4"><div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Meetings</div><div className="text-2xl font-bold mt-1">{stats.meetings}</div></Card>
        <Card className="p-4"><div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Total Action</div><div className="text-2xl font-bold mt-1">{stats.actions}</div></Card>
        <Card className="p-4"><div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Selesai</div><div className="text-2xl font-bold mt-1 text-success">{stats.done}/{stats.actions}</div></Card>
      </div>

      <CreateDialog open={open} onOpenChange={setOpen} title={form.id ? "Edit Meeting" : "Meeting Baru"} trigger={<span className="hidden" />}>
        <form onSubmit={submit} className="space-y-3">
          <div><Label>Project</Label><ProjectSelect value={form.project_id} onChange={v=>setForm({...form,project_id:v})} projects={projects.data?.projects ?? []} /></div>
          <div><Label>Judul / Agenda Utama</Label><Input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Tanggal & Jam</Label><Input type="datetime-local" value={form.meeting_date} onChange={e=>setForm({...form,meeting_date:e.target.value})} /></div>
            <div><Label>Lokasi</Label><Input value={form.location} onChange={e=>setForm({...form,location:e.target.value})} /></div>
          </div>

          <AttendeesEditor value={form.attendees} onChange={v=>setForm({...form,attendees:v})} />

          <div><Label>Agenda Detail</Label><Textarea rows={3} value={form.agenda} onChange={e=>setForm({...form,agenda:e.target.value})} placeholder="1. Pembahasan progress...&#10;2. Review issue..." /></div>
          <div><Label>Notulensi (MOM)</Label><Textarea rows={5} value={form.minutes} onChange={e=>setForm({...form,minutes:e.target.value})} placeholder="Pembahasan, keputusan, kesepakatan..." /></div>

          <ActionsEditor value={form.action_items} onChange={v=>setForm({...form,action_items:v})} />

          <Button type="submit" className="w-full">{form.id ? "Simpan Perubahan" : "Simpan Meeting"}</Button>
        </form>
      </CreateDialog>

      {isLoading ? <div className="text-sm text-muted-foreground">Memuat...</div>
        : (data?.rows.length ?? 0) === 0 ? <EmptyState label="Belum ada meeting tercatat." />
        : <div className="grid gap-3 md:grid-cols-2">
            {data!.rows.map((r: any) => {
              const ai: Action[] = Array.isArray(r.action_items) ? r.action_items : [];
              const att: Attendee[] = Array.isArray(r.attendees) ? r.attendees : [];
              return (
                <Card key={r.id} className="p-4">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">{r.projects?.code ?? "—"}</div>
                      <h3 className="font-semibold text-sm truncate">{r.title}</h3>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="icon" variant="ghost" onClick={() => exportMOM(r)} title="Export MOM"><FileDown className="size-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => openEdit(r)}><Pencil className="size-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="size-4 text-destructive" /></Button>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {r.meeting_date && <span className="inline-flex items-center gap-1"><CalendarDays className="size-3" />{new Date(r.meeting_date).toLocaleString("id-ID")}</span>}
                    {r.location && <span className="inline-flex items-center gap-1"><MapPin className="size-3" />{r.location}</span>}
                    {att.length > 0 && <span className="inline-flex items-center gap-1"><Users className="size-3" />{att.length}</span>}
                  </div>
                  {r.agenda && <p className="mt-2 text-sm line-clamp-2 text-muted-foreground">{r.agenda}</p>}
                  {ai.length > 0 && (
                    <ul className="mt-3 space-y-1.5 text-xs border-t pt-2">
                      {ai.slice(0,5).map((a) => (
                        <li key={a.id ?? a.task} className="flex items-start gap-2">
                          <Checkbox checked={!!a.done} onCheckedChange={(v) => a.id && onToggle(r.id, a.id, !!v)} className="mt-0.5" />
                          <div className="flex-1 min-w-0 flex justify-between gap-2">
                            <span className={`truncate ${a.done ? "line-through text-muted-foreground" : ""}`}>{a.task}</span>
                            <span className="text-muted-foreground shrink-0">{a.owner ?? ""}{a.due ? ` · ${a.due}` : ""}</span>
                          </div>
                        </li>
                      ))}
                      {ai.length > 5 && <li className="text-muted-foreground italic">+{ai.length - 5} action lain</li>}
                    </ul>
                  )}
                </Card>
              );
            })}
          </div>}
    </div>
  );
}

function AttendeesEditor({ value, onChange }: { value: Attendee[]; onChange: (v: Attendee[]) => void }) {
  const add = () => onChange([...value, { name: "", role: "", org: "", present: true }]);
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <Label>Peserta</Label>
        <Button type="button" size="sm" variant="ghost" onClick={add}><Plus className="size-3.5 mr-1" />Tambah</Button>
      </div>
      {value.length === 0 && <div className="text-xs text-muted-foreground italic">Belum ada peserta.</div>}
      <div className="space-y-1.5">
        {value.map((a, i) => (
          <div key={i} className="grid grid-cols-[16px_1fr_120px_120px_28px] gap-1.5 items-center">
            <Checkbox checked={a.present !== false} onCheckedChange={v => onChange(value.map((x,j)=>j===i?{...x,present:!!v}:x))} />
            <Input placeholder="Nama" value={a.name} onChange={e=>onChange(value.map((x,j)=>j===i?{...x,name:e.target.value}:x))} />
            <Input placeholder="Jabatan" value={a.role ?? ""} onChange={e=>onChange(value.map((x,j)=>j===i?{...x,role:e.target.value}:x))} />
            <Input placeholder="Instansi" value={a.org ?? ""} onChange={e=>onChange(value.map((x,j)=>j===i?{...x,org:e.target.value}:x))} />
            <Button type="button" size="icon" variant="ghost" onClick={()=>onChange(value.filter((_,j)=>j!==i))}><X className="size-4" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionsEditor({ value, onChange }: { value: Action[]; onChange: (v: Action[]) => void }) {
  const add = () => onChange([...value, { task: "", owner: "", due: "", done: false }]);
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <Label>Action Items</Label>
        <Button type="button" size="sm" variant="ghost" onClick={add}><Plus className="size-3.5 mr-1" />Tambah</Button>
      </div>
      {value.length === 0 && <div className="text-xs text-muted-foreground italic">Tambahkan task tindak lanjut.</div>}
      <div className="space-y-1.5">
        {value.map((a, i) => (
          <div key={i} className="grid grid-cols-[1fr_120px_130px_28px] gap-1.5 items-center">
            <Input placeholder="Task" value={a.task} onChange={e=>onChange(value.map((x,j)=>j===i?{...x,task:e.target.value}:x))} />
            <Input placeholder="Owner" value={a.owner ?? ""} onChange={e=>onChange(value.map((x,j)=>j===i?{...x,owner:e.target.value}:x))} />
            <Input type="date" value={a.due ?? ""} onChange={e=>onChange(value.map((x,j)=>j===i?{...x,due:e.target.value}:x))} />
            <Button type="button" size="icon" variant="ghost" onClick={()=>onChange(value.filter((_,j)=>j!==i))}><X className="size-4" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function momToMarkdown(r: any): string {
  const att = Array.isArray(r.attendees) ? r.attendees : [];
  const ai = Array.isArray(r.action_items) ? r.action_items : [];
  return [
    `# Minutes of Meeting`, ``,
    `**Judul:** ${r.title ?? "-"}`,
    `**Project:** ${r.projects?.code ?? ""} ${r.projects?.name ?? ""}`,
    `**Tanggal:** ${r.meeting_date ? new Date(r.meeting_date).toLocaleString("id-ID") : "-"}`,
    `**Lokasi:** ${r.location ?? "-"}`, ``,
    `## Peserta`,
    ...att.map((a: any) => `- ${typeof a === "string" ? a : `${a.name}${a.role ? ` (${a.role})` : ""}${a.org ? ` — ${a.org}` : ""}${a.present === false ? " — _absent_" : ""}`}`),
    ``,
    `## Agenda`, r.agenda ?? "-", ``,
    `## Notulensi`, r.minutes ?? "-", ``,
    `## Action Items`,
    ...ai.map((a: any) => `- [${a.done ? "x" : " "}] ${a.task} — ${a.owner ?? "-"}${a.due ? ` (due ${a.due})` : ""}`),
  ].join("\n");
}