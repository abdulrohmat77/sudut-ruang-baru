import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { DeveloperLockGate } from "@/components/app/developer-lock";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  listUsers, getMyProfile, updateMyProfile,
  assignRole, revokeRole, listAuditLogs, APP_ROLE_LIST,
} from "@/lib/knowledge.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Shield, User, Activity, X, Plus, Crown, AlertTriangle, Bell, Users as UsersIcon, Clock, Mail, MessageCircle, Send } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  listOverflowEvents, listNotifications, markAllNotificationsRead,
} from "@/lib/notifications.functions";
import {
  getOrgSettings, updateOrgSettings, updateNotificationPrefs,
  sendTestOwnerNotification, listProjectsForOwners, updateProjectOwner, listWaSendLog,
} from "@/lib/org-settings.functions";

export const Route = createFileRoute("/_authenticated/settings")({ component: GatedPage });

function GatedPage() {
  return (
    <DeveloperLockGate
      title="System Settings Terkunci"
      description="System Settings memuat konfigurasi inti organisasi, notifikasi pemilik proyek, dan integrasi WhatsApp. Hanya developer Sudut Ruang Arsitek yang dapat membuka."
    >
      <Page />
    </DeveloperLockGate>
  );
}

function Page() {
  const lu = useServerFn(listUsers);
  const gp = useServerFn(getMyProfile);
  const up = useServerFn(updateMyProfile);
  const users = useQuery({ queryKey: ["users"], queryFn: () => lu() });
  const me = useQuery({ queryKey: ["my-profile"], queryFn: () => gp() });
  const isSuper = (me.data?.roles ?? []).includes("super_admin");

  const [f, setF] = useState({ full_name: "", job_title: "", phone: "" });
  useEffect(() => {
    if (me.data?.profile) {
      setF({
        full_name: me.data.profile.full_name ?? "",
        job_title: me.data.profile.job_title ?? "",
        phone: me.data.profile.phone ?? "",
      });
    }
  }, [me.data]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await up({ data: { full_name: f.full_name || null, job_title: f.job_title || null, phone: f.phone || null } });
      toast.success("Profil tersimpan"); me.refetch();
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Kelola profil, pengguna & peran, dan audit aktivitas sistem.
          {isSuper && <span className="inline-flex items-center gap-1 ml-2"><Crown className="size-3 text-amber-500" /> <span className="text-amber-600 dark:text-amber-400 font-medium">Super Admin</span></span>}
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile"><User className="size-3.5 mr-1.5" /> Profil</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="size-3.5 mr-1.5" /> Notifikasi</TabsTrigger>
          <TabsTrigger value="users"><Shield className="size-3.5 mr-1.5" /> Pengguna & Peran</TabsTrigger>
          <TabsTrigger value="audit"><Activity className="size-3.5 mr-1.5" /> Audit Log</TabsTrigger>
          {isSuper && <TabsTrigger value="overflow"><AlertTriangle className="size-3.5 mr-1.5" /> Overflow Events</TabsTrigger>}
          {isSuper && <TabsTrigger value="owners"><UsersIcon className="size-3.5 mr-1.5" /> Owner Notifications</TabsTrigger>}
          {isSuper && <TabsTrigger value="schedule"><Clock className="size-3.5 mr-1.5" /> Delivery Schedule</TabsTrigger>}
          {isSuper && <TabsTrigger value="channels"><Mail className="size-3.5 mr-1.5" /> Email & WhatsApp</TabsTrigger>}
          <TabsTrigger value="rbac"><Shield className="size-3.5 mr-1.5" /> RBAC (Future)</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card className="p-6 max-w-xl">
            <form onSubmit={save} className="space-y-3">
              <div><Label>Email</Label><Input value={me.data?.profile?.email ?? ""} disabled /></div>
              <div><Label>Nama Lengkap</Label><Input value={f.full_name} onChange={e=>setF({...f,full_name:e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Jabatan</Label><Input value={f.job_title} onChange={e=>setF({...f,job_title:e.target.value})} /></div>
                <div><Label>Telepon</Label><Input value={f.phone} onChange={e=>setF({...f,phone:e.target.value})} /></div>
              </div>
              <div><Label>Peran Aktif</Label>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(me.data?.roles ?? []).length === 0 && <span className="text-xs text-muted-foreground">Belum ada peran.</span>}
                  {(me.data?.roles ?? []).map((r: string) => <Badge key={r} variant="secondary">{r}</Badge>)}
                </div>
              </div>
              <Button type="submit">Simpan Profil</Button>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <NotificationsPanel prefs={me.data?.profile?.notification_prefs ?? {}} onSaved={() => me.refetch()} />
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <UsersPanel users={users} isSuper={isSuper} />
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <AuditPanel />
        </TabsContent>

        {isSuper && (
          <TabsContent value="overflow" className="mt-4">
            <OverflowPanel />
          </TabsContent>
        )}

        {isSuper && (
          <TabsContent value="owners" className="mt-4">
            <OwnersPanel />
          </TabsContent>
        )}
        {isSuper && (
          <TabsContent value="schedule" className="mt-4">
            <SchedulePanel />
          </TabsContent>
        )}
        {isSuper && (
          <TabsContent value="channels" className="mt-4">
            <ChannelsPanel />
          </TabsContent>
        )}

        <TabsContent value="rbac" className="mt-4">
          <RbacPreview />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OverflowPanel() {
  const list = useServerFn(listOverflowEvents);
  const { data, isLoading } = useQuery({ queryKey: ["overflow-events"], queryFn: () => list() });
  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-[170px_180px_140px_140px_120px_1fr] gap-3 px-4 py-2 border-b bg-muted/40 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
        <div>Waktu</div><div>User</div><div>Table</div><div>Field</div><div>Attempted</div><div>Error</div>
      </div>
      <div className="divide-y max-h-[600px] overflow-y-auto">
        {isLoading && <div className="p-6 text-sm text-muted-foreground">Memuat...</div>}
        {!isLoading && (data?.rows.length ?? 0) === 0 && (
          <div className="p-10 text-center text-sm text-muted-foreground">
            <AlertTriangle className="size-8 mx-auto mb-2 opacity-50" />
            Belum ada overflow event tercatat.
          </div>
        )}
        {(data?.rows ?? []).map((r: any) => (
          <div key={r.id} className="grid grid-cols-[170px_180px_140px_140px_120px_1fr] gap-3 px-4 py-2 text-xs items-start">
            <div className="text-muted-foreground font-mono">{new Date(r.created_at).toLocaleString("id-ID")}</div>
            <div className="truncate">{r.user_email ?? r.user_id?.slice(0,8) ?? "—"}</div>
            <div className="truncate font-mono">{r.table_name}</div>
            <div className="truncate font-mono"><Badge variant="outline" className="text-[10px]">{r.field_name ?? "—"}</Badge></div>
            <div className="truncate font-mono">{r.attempted_value ?? "—"}</div>
            <div className="text-muted-foreground truncate">{r.raw_error ?? ""}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function UsersPanel({ users, isSuper }: { users: any; isSuper: boolean }) {
  const assign = useServerFn(assignRole);
  const revoke = useServerFn(revokeRole);
  const [editing, setEditing] = useState<any | null>(null);
  const [newRole, setNewRole] = useState<string>("");

  const doAssign = async () => {
    if (!editing || !newRole) return;
    try { await assign({ data: { user_id: editing.id, role: newRole as any } }); toast.success("Role ditambahkan"); users.refetch(); setNewRole(""); }
    catch (e: any) { toast.error(e.message); }
  };
  const doRevoke = async (uid: string, role: string) => {
    try { await revoke({ data: { user_id: uid, role: role as any } }); toast.success("Role dicabut"); users.refetch(); if (editing?.id === uid) setEditing({ ...editing, roles: editing.roles.filter((r: string) => r !== role) }); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-[1fr_220px_180px_1fr_120px] gap-3 px-4 py-2 border-b bg-muted/40 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
        <div>Nama</div><div>Email</div><div>Jabatan</div><div>Peran</div><div className="text-right">Aksi</div>
      </div>
      <div className="divide-y">
        {users.isLoading && <div className="p-6 text-sm text-muted-foreground">Memuat...</div>}
        {users.data?.users.map((u: any) => (
          <div key={u.id} className="grid grid-cols-[1fr_220px_180px_1fr_120px] gap-3 px-4 py-2.5 text-sm items-center">
            <div className="truncate font-medium">{u.full_name ?? "—"}</div>
            <div className="truncate text-muted-foreground">{u.email}</div>
            <div className="truncate text-muted-foreground">{u.job_title ?? "—"}</div>
            <div className="flex flex-wrap gap-1">
              {u.roles.length === 0 ? <span className="text-xs text-muted-foreground">—</span>
                : u.roles.map((r: string) => <Badge key={r} variant="secondary" className="text-[10px]">{r}</Badge>)}
            </div>
            <div className="text-right">
              {isSuper && (
                <Dialog open={editing?.id === u.id} onOpenChange={(o) => setEditing(o ? u : null)}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">Kelola</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Kelola Peran: {u.full_name ?? u.email}</DialogTitle>
                      <DialogDescription>Tambah atau cabut peran RBAC untuk pengguna ini.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs">Peran Aktif</Label>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {(editing?.roles ?? []).length === 0 && <span className="text-xs text-muted-foreground">Belum ada peran.</span>}
                          {(editing?.roles ?? []).map((r: string) => (
                            <Badge key={r} variant="secondary" className="gap-1">
                              {r}
                              <button type="button" onClick={() => doRevoke(u.id, r)}><X className="size-3" /></button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Tambah Peran</Label>
                        <div className="flex gap-2 mt-1.5">
                          <Select value={newRole} onValueChange={setNewRole}>
                            <SelectTrigger><SelectValue placeholder="Pilih peran" /></SelectTrigger>
                            <SelectContent>
                              {APP_ROLE_LIST.filter(r => !(editing?.roles ?? []).includes(r)).map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <Button type="button" onClick={doAssign} disabled={!newRole}><Plus className="size-4 mr-1" />Tambah</Button>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function AuditPanel() {
  const list = useServerFn(listAuditLogs);
  const [entity, setEntity] = useState<string>("all");
  const { data, isLoading } = useQuery({ queryKey: ["audit", entity], queryFn: () => list({ data: { entity: entity === "all" ? null : entity, limit: 200 } }) });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label className="text-xs">Filter entitas:</Label>
        <Select value={entity} onValueChange={setEntity}>
          <SelectTrigger className="w-full sm:w-[220px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="correspondence">Correspondence</SelectItem>
            <SelectItem value="correspondence_template">Template Surat</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="user_role">User Role</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card className="overflow-hidden">
        <div className="grid grid-cols-[170px_180px_120px_120px_1fr] gap-3 px-4 py-2 border-b bg-muted/40 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
          <div>Waktu</div><div>Aktor</div><div>Aksi</div><div>Entitas</div><div>Detail</div>
        </div>
        <div className="divide-y max-h-[600px] overflow-y-auto">
          {isLoading && <div className="p-6 text-sm text-muted-foreground">Memuat...</div>}
          {!isLoading && (data?.rows.length ?? 0) === 0 && <div className="p-6 text-sm text-muted-foreground">Belum ada aktivitas tercatat.</div>}
          {(data?.rows ?? []).map((r: any) => (
            <div key={r.id} className="grid grid-cols-[170px_180px_120px_120px_1fr] gap-3 px-4 py-2 text-xs items-center">
              <div className="text-muted-foreground font-mono">{new Date(r.created_at).toLocaleString("id-ID")}</div>
              <div className="truncate">{r.actor?.full_name ?? r.actor?.email ?? r.actor_id?.slice(0,8) ?? "—"}</div>
              <div><Badge variant="outline" className="text-[10px]">{r.action}</Badge></div>
              <div className="truncate">{r.entity}</div>
              <div className="truncate text-muted-foreground font-mono">{r.entity_id ?? ""} {Object.keys(r.meta ?? {}).length > 0 && JSON.stringify(r.meta).slice(0,100)}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function RbacPreview() {
  return (
    <Card className="p-6 max-w-3xl">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="size-5 text-muted-foreground" />
        <h2 className="font-semibold">RBAC Roadmap</h2>
        <Badge variant="outline" className="text-[10px]">Future</Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Skema peran sudah ter-deklarasi di database (<code className="text-xs bg-muted px-1 rounded">app_role</code> enum). Pemberian role di tab <em>Pengguna & Peran</em> sudah aktif; mapping role → permission per modul akan diaktifkan bertahap tanpa migrasi schema.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {APP_ROLE_LIST.map(r => (
          <div key={r} className="flex items-center justify-between border rounded-md px-3 py-2 text-sm">
            <span className="font-medium">{r}</span>
            <Badge variant="secondary" className="text-[10px]">{r === "super_admin" ? "Aktif" : "Reserved"}</Badge>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        Saat ini hanya <code className="text-xs bg-muted px-1 rounded">super_admin</code> yang men-enforce policy RLS lintas modul. Role lain disiapkan untuk fase berikutnya (mis. <code>finance</code> hanya akses Commercial, <code>qaqc</code> hanya QA/QC + HSE).
      </p>
    </Card>
  );
}

function NotificationsPanel({ prefs, onSaved }: { prefs: any; onSaved: () => void }) {
  const list = useServerFn(listNotifications);
  const markAll = useServerFn(markAllNotificationsRead);
  const upd = useServerFn(updateNotificationPrefs);
  const q = useQuery({ queryKey: ["all-notifications"], queryFn: () => list() });
  const [sound, setSound] = useState<boolean>(prefs?.sound ?? true);
  const [emailCopy, setEmailCopy] = useState<boolean>(prefs?.email_copy ?? false);
  const savePrefs = async () => {
    try { await upd({ data: { prefs: { sound, email_copy: emailCopy } } }); toast.success("Preferensi tersimpan"); onSaved(); }
    catch (e: any) { toast.error(e.message); }
  };
  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-4">
      <Card className="overflow-hidden">
        <div className="px-4 py-2 border-b bg-muted/40 flex items-center justify-between">
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Riwayat Notifikasi</div>
          <Button size="sm" variant="ghost" onClick={async () => { await markAll(); q.refetch(); }}>Tandai semua dibaca</Button>
        </div>
        <div className="divide-y max-h-[560px] overflow-y-auto">
          {q.isLoading && <div className="p-6 text-sm text-muted-foreground">Memuat...</div>}
          {!q.isLoading && (q.data?.rows.length ?? 0) === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground"><Bell className="size-8 mx-auto mb-2 opacity-50" />Belum ada notifikasi.</div>
          )}
          {(q.data?.rows ?? []).map((r: any) => (
            <div key={r.id} className={`px-4 py-2.5 text-sm ${!r.read_at ? "bg-accent/30" : ""}`}>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">{r.type}</Badge>
                <span className={!r.read_at ? "font-semibold" : ""}>{r.title}</span>
                <span className="ml-auto text-[10px] text-muted-foreground font-mono">{new Date(r.created_at).toLocaleString("id-ID")}</span>
              </div>
              {r.body && <div className="text-xs text-muted-foreground mt-1">{r.body}</div>}
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-4 space-y-3 h-fit">
        <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Preferensi Pribadi</div>
        <div className="flex items-center justify-between"><Label className="text-sm">Suara in-app</Label><Switch checked={sound} onCheckedChange={setSound} /></div>
        <div className="flex items-center justify-between"><Label className="text-sm">Email copy notifikasi</Label><Switch checked={emailCopy} onCheckedChange={setEmailCopy} /></div>
        <Button size="sm" className="w-full" onClick={savePrefs}>Simpan</Button>
      </Card>
    </div>
  );
}

function OwnersPanel() {
  const list = useServerFn(listProjectsForOwners);
  const upd = useServerFn(updateProjectOwner);
  const test = useServerFn(sendTestOwnerNotification);
  const q = useQuery({ queryKey: ["owner-projects"], queryFn: () => list() });
  const [drafts, setDrafts] = useState<Record<string, any>>({});
  const save = async (id: string) => {
    try {
      const d = drafts[id] ?? {};
      await upd({ data: { id, ...d } });
      toast.success("Owner tersimpan");
      setDrafts((s) => { const n = { ...s }; delete n[id]; return n; });
      q.refetch();
    } catch (e: any) { toast.error(e.message); }
  };
  const sendTest = async (id: string | null) => {
    try {
      const r = await test({ data: { projectId: id } });
      if (!r.ok) toast.error(r.message ?? "Gagal"); else toast.success("Tes dikirim");
    } catch (e: any) { toast.error(e.message); }
  };
  return (
    <div className="space-y-4">
      <Card className="p-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">Tes Pengiriman Fallback</div>
          <div className="text-xs text-muted-foreground">Mengirim notifikasi tes ke kontak owner cadangan (org-wide).</div>
        </div>
        <Button size="sm" variant="outline" onClick={() => sendTest(null)}><Send className="size-3.5 mr-1.5" />Kirim Tes</Button>
      </Card>
      <Card className="overflow-hidden">
        <div className="grid grid-cols-[140px_1fr_180px_220px_160px_120px] gap-3 px-4 py-2 border-b bg-muted/40 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
          <div>Kode</div><div>Proyek</div><div>Owner Name</div><div>Owner Email</div><div>Owner Phone (WA)</div><div className="text-right">Aksi</div>
        </div>
        <div className="divide-y max-h-[560px] overflow-y-auto">
          {q.isLoading && <div className="p-6 text-sm text-muted-foreground">Memuat...</div>}
          {(q.data?.rows ?? []).map((p: any) => {
            const d = drafts[p.id] ?? {};
            const v = (k: string) => d[k] ?? p[k] ?? "";
            const setF = (k: string, val: string) => setDrafts((s) => ({ ...s, [p.id]: { ...(s[p.id] ?? {}), [k]: val } }));
            const dirty = drafts[p.id] != null;
            return (
              <div key={p.id} className="grid grid-cols-[140px_1fr_180px_220px_160px_120px] gap-3 px-4 py-2 text-xs items-center">
                <div className="font-mono">{p.code ?? "—"}</div>
                <div className="truncate font-medium">{p.name}</div>
                <Input className="h-8 text-xs" value={v("owner_name")} onChange={(e) => setF("owner_name", e.target.value)} />
                <Input className="h-8 text-xs" type="email" value={v("owner_email")} onChange={(e) => setF("owner_email", e.target.value)} placeholder="owner@..." />
                <Input className="h-8 text-xs" value={v("owner_phone")} onChange={(e) => setF("owner_phone", e.target.value)} placeholder="+62..." />
                <div className="flex justify-end gap-1">
                  <Button size="sm" variant="ghost" disabled={!dirty} onClick={() => save(p.id)}>Simpan</Button>
                  <Button size="sm" variant="outline" onClick={() => sendTest(p.id)}><Send className="size-3" /></Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function SchedulePanel() {
  const get = useServerFn(getOrgSettings);
  const upd = useServerFn(updateOrgSettings);
  const q = useQuery({ queryKey: ["org-settings"], queryFn: () => get() });
  const s = q.data?.settings;
  const [hour, setHour] = useState<number>(8);
  const [enabled, setEnabled] = useState<boolean>(true);
  const [realtime, setRealtime] = useState<boolean>(true);
  const [fbEmail, setFbEmail] = useState<string>("");
  const [fbPhone, setFbPhone] = useState<string>("");
  useEffect(() => {
    if (s) {
      setHour(s.digest_hour_wib ?? 8);
      setEnabled(s.digest_enabled ?? true);
      setRealtime(s.realtime_overflow_enabled ?? true);
      setFbEmail(s.fallback_owner_email ?? "");
      setFbPhone(s.fallback_owner_phone ?? "");
    }
  }, [s]);
  const save = async () => {
    try {
      await upd({ data: {
        digest_hour_wib: hour, digest_enabled: enabled, realtime_overflow_enabled: realtime,
        fallback_owner_email: fbEmail || null, fallback_owner_phone: fbPhone || null,
      } });
      toast.success("Pengaturan tersimpan");
      q.refetch();
    } catch (e: any) { toast.error(e.message); }
  };
  return (
    <Card className="p-6 max-w-2xl space-y-4">
      <div>
        <h3 className="font-semibold mb-1">Jadwal Digest Harian</h3>
        <p className="text-xs text-muted-foreground">Ringkasan harian dikirim ke owner setiap project (atau fallback) pada jam yang ditentukan WIB.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Jam Kirim (WIB)</Label>
          <Select value={String(hour)} onValueChange={(v) => setHour(Number(v))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{Array.from({length:24}).map((_,i) => <SelectItem key={i} value={String(i)}>{String(i).padStart(2,"0")}:00</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex items-end gap-3">
          <div className="flex items-center gap-2"><Switch checked={enabled} onCheckedChange={setEnabled} /><Label className="text-sm">Digest aktif</Label></div>
        </div>
      </div>
      <div className="flex items-center gap-2"><Switch checked={realtime} onCheckedChange={setRealtime} /><Label className="text-sm">Alert overflow real-time ke owner</Label></div>
      <hr />
      <div>
        <h3 className="font-semibold mb-1">Owner Cadangan (Org-wide)</h3>
        <p className="text-xs text-muted-foreground mb-2">Digunakan jika proyek tidak memiliki owner sendiri.</p>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Email Fallback</Label><Input type="email" value={fbEmail} onChange={(e) => setFbEmail(e.target.value)} placeholder="owner@perusahaan.com" /></div>
          <div><Label>WhatsApp Fallback</Label><Input value={fbPhone} onChange={(e) => setFbPhone(e.target.value)} placeholder="+628..." /></div>
        </div>
      </div>
      <Button onClick={save}>Simpan Pengaturan</Button>
      <div className="text-[11px] text-muted-foreground border-t pt-3">
        Pengiriman digest dijalankan oleh cron internal. Pastikan tabel <code className="font-mono">org_settings</code> aktif dan email/WhatsApp ter-konfigurasi di tab <em>Email & WhatsApp</em>.
      </div>
    </Card>
  );
}

function ChannelsPanel() {
  const waList = useServerFn(listWaSendLog);
  const wa = useQuery({ queryKey: ["wa-send-log"], queryFn: () => waList() });
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Card className="p-5 space-y-3">
        <div className="flex items-center gap-2"><Mail className="size-4" /><h3 className="font-semibold">Email Domain</h3></div>
        <p className="text-xs text-muted-foreground">Aktifkan domain email kustom untuk mengirim digest & alert ke owner via email.</p>
        <div className="text-xs">Status: <Badge variant="outline">Cek di Cloud → Emails</Badge></div>
        <p className="text-[11px] text-muted-foreground">Untuk konfigurasi pertama kali, gunakan tombol setup di chat — minta: <em>"Set up email domain"</em>.</p>
      </Card>
      <Card className="p-5 space-y-3">
        <div className="flex items-center gap-2"><MessageCircle className="size-4" /><h3 className="font-semibold">WhatsApp (Twilio)</h3></div>
        <p className="text-xs text-muted-foreground">Hubungkan Twilio + WhatsApp Business sender untuk mengirim alert ke nomor owner.</p>
        <div className="text-xs">Status: <Badge variant="outline">Cek koneksi di Project Settings</Badge></div>
        <p className="text-[11px] text-muted-foreground">Untuk menghubungkan, minta di chat: <em>"connect twilio"</em>, lalu set secret <code className="font-mono">TWILIO_WHATSAPP_FROM</code>.</p>
      </Card>
      <Card className="overflow-hidden lg:col-span-2">
        <div className="px-4 py-2 border-b bg-muted/40 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-2">
          <MessageCircle className="size-3.5" /> WhatsApp Send Log (50 terakhir)
        </div>
        <div className="divide-y max-h-[400px] overflow-y-auto">
          {wa.isLoading && <div className="p-6 text-sm text-muted-foreground">Memuat...</div>}
          {!wa.isLoading && (wa.data?.rows.length ?? 0) === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">Belum ada pengiriman WhatsApp tercatat.</div>
          )}
          {(wa.data?.rows ?? []).map((r: any) => (
            <div key={r.id} className="grid grid-cols-[170px_180px_140px_100px_1fr] gap-3 px-4 py-2 text-xs items-center">
              <div className="text-muted-foreground font-mono">{new Date(r.created_at).toLocaleString("id-ID")}</div>
              <div className="truncate font-mono">{r.recipient_phone}</div>
              <div className="truncate">{r.template_name ?? "—"}</div>
              <div><Badge variant={r.status === "sent" ? "secondary" : r.status === "failed" ? "destructive" : "outline"} className="text-[10px]">{r.status}</Badge></div>
              <div className="truncate text-muted-foreground">{r.error_message ?? ""}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}