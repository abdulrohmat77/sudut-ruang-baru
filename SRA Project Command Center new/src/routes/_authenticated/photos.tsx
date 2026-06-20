import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listPhotos, createPhoto, deletePhoto, updatePhoto } from "@/lib/knowledge.functions";
import { ModuleHeader, CreateDialog, ProjectSelect, EmptyState, useProjectsList } from "@/components/app/module-page";
import { RowActions } from "@/components/app/row-actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Camera } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/photos")({ component: Page });

function Page() {
  const [pid, setPid] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const list = useServerFn(listPhotos);
  const create = useServerFn(createPhoto);
  const del = useServerFn(deletePhoto);
  const update = useServerFn(updatePhoto);
  const projects = useProjectsList();
  const { data, isLoading, refetch } = useQuery({ queryKey: ["photos", pid], queryFn: () => list({ data: { projectId: pid } }) });
  const [f, setF] = useState({ project_id: "", photo_url: "", caption: "", taken_at: "", source: "site" as "site"|"drone" });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await create({ data: { project_id: f.project_id, photo_url: f.photo_url, caption: f.caption || null, taken_at: f.taken_at || null, source: f.source } });
      toast.success("Foto tersimpan"); setOpen(false); refetch();
    } catch (e: any) { toast.error(e.message); }
  };
  return (
    <div className="space-y-6">
      <ModuleHeader title="Photo & Drone" subtitle="Dokumentasi visual lapangan dan drone shot per proyek."
        projectId={pid} onProjectChange={setPid}
        actions={<CreateDialog open={open} onOpenChange={setOpen} title="Tambah Foto">
          <form onSubmit={submit} className="space-y-3">
            <div><Label>Project</Label><ProjectSelect value={f.project_id} onChange={v=>setF({...f,project_id:v})} projects={projects.data?.projects ?? []} /></div>
            <div><Label>URL Foto</Label><Input type="url" required placeholder="https://..." value={f.photo_url} onChange={e=>setF({...f,photo_url:e.target.value})} /></div>
            <div><Label>Caption</Label><Input value={f.caption} onChange={e=>setF({...f,caption:e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Tanggal Ambil</Label><Input type="datetime-local" value={f.taken_at} onChange={e=>setF({...f,taken_at:e.target.value})} /></div>
              <div><Label>Sumber</Label>
                <Select value={f.source} onValueChange={(v:any)=>setF({...f,source:v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="site">Site (HP / kamera)</SelectItem>
                    <SelectItem value="drone">Drone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="w-full">Simpan</Button>
          </form>
        </CreateDialog>} />

      {isLoading ? <div className="text-sm text-muted-foreground">Memuat...</div>
        : (data?.rows.length ?? 0) === 0 ? <EmptyState label="Belum ada foto." />
        : <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {data!.rows.map((r: any) => (
              <Card key={r.id} className="overflow-hidden relative">
                <div className="aspect-square bg-muted relative">
                  <img src={r.photo_url} alt={r.caption ?? "foto"} className="size-full object-cover" loading="lazy" onError={(e:any)=>{e.currentTarget.style.opacity="0.2";}} />
                  <Badge className="absolute top-2 left-2 text-[10px]" variant={r.source === "drone" ? "default" : "secondary"}>
                    <Camera className="size-3 mr-1" />{r.source}
                  </Badge>
                  <div className="absolute top-1.5 right-1.5 bg-background/80 backdrop-blur rounded">
                    <RowActions
                      editTitle="Edit Foto"
                      editForm={(close) => (
                        <PhotoEditForm initial={r} onSubmit={async (d) => {
                          await update({ data: { id: r.id, ...d } }); toast.success("Diperbarui"); close(); refetch();
                        }} />
                      )}
                      onDelete={async () => { await del({ data: { id: r.id } }); refetch(); }}
                    />
                  </div>
                </div>
                <div className="p-2.5">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">{r.projects?.code ?? "—"}</div>
                  <div className="text-xs truncate">{r.caption ?? "—"}</div>
                  {r.taken_at && <div className="text-[10px] text-muted-foreground mt-0.5">{new Date(r.taken_at).toLocaleDateString("id-ID")}</div>}
                </div>
              </Card>
            ))}
          </div>}
    </div>
  );
}

function PhotoEditForm({ initial, onSubmit }: { initial: any; onSubmit: (d: any) => Promise<void> }) {
  const [f, setF] = useState({
    caption: initial?.caption ?? "",
    taken_at: initial?.taken_at ? new Date(initial.taken_at).toISOString().slice(0,16) : "",
    source: (initial?.source ?? "site") as "site"|"drone",
  });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await onSubmit({ caption: f.caption || null, taken_at: f.taken_at || null, source: f.source }); }
    catch (e: any) { toast.error(e.message); }
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <div><Label>Caption</Label><Input value={f.caption} onChange={e=>setF({...f,caption:e.target.value})} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Tanggal Ambil</Label><Input type="datetime-local" value={f.taken_at} onChange={e=>setF({...f,taken_at:e.target.value})} /></div>
        <div><Label>Sumber</Label>
          <Select value={f.source} onValueChange={(v:any)=>setF({...f,source:v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="site">Site (HP / kamera)</SelectItem>
              <SelectItem value="drone">Drone</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" className="w-full">Simpan</Button>
    </form>
  );
}