import * as React from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Bell, CheckCheck, AlertTriangle, Info, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/notifications.functions";

function iconFor(type: string) {
  if (type === "error" || type === "overflow") return AlertTriangle;
  if (type === "warning") return AlertCircle;
  return Info;
}

export function NotificationCenter() {
  const list = useServerFn(listNotifications);
  const markOne = useServerFn(markNotificationRead);
  const markAll = useServerFn(markAllNotificationsRead);
  const [open, setOpen] = React.useState(false);
  const q = useQuery({ queryKey: ["notifications"], queryFn: () => list(), staleTime: 30_000 });

  // Realtime: refetch when a new row arrives for the current user.
  React.useEffect(() => {
    const channel = supabase
      .channel("notifications-center")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => q.refetch(),
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unread = q.data?.unread ?? 0;

  const onMarkAll = async () => {
    try { await markAll(); q.refetch(); } catch { /* noop */ }
  };
  const onClick = async (row: { id: string; link?: string | null; read_at: string | null }) => {
    if (!row.read_at) {
      try { await markOne({ data: { id: row.id } }); q.refetch(); } catch { /* noop */ }
    }
    if (row.link) setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="icon" variant="ghost" className="relative" aria-label="Notifikasi">
          <Bell className="size-5" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold flex items-center justify-center">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[380px] sm:w-[420px] flex flex-col p-0">
        <SheetHeader className="px-5 py-4 border-b flex-row items-center justify-between space-y-0">
          <SheetTitle className="flex items-center gap-2">
            <Bell className="size-4" /> Notifikasi
            {unread > 0 && <Badge variant="secondary" className="text-[10px]">{unread} baru</Badge>}
          </SheetTitle>
          {unread > 0 && (
            <Button size="sm" variant="ghost" onClick={onMarkAll} className="text-xs">
              <CheckCheck className="size-3.5 mr-1" /> Tandai semua dibaca
            </Button>
          )}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto divide-y">
          {q.isLoading && <div className="p-6 text-sm text-muted-foreground">Memuat...</div>}
          {!q.isLoading && (q.data?.rows.length ?? 0) === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">
              <Bell className="size-8 mx-auto mb-2 opacity-50" />
              Belum ada notifikasi.
            </div>
          )}
          {(q.data?.rows ?? []).map((r: any) => {
            const Icon = iconFor(r.type);
            const inner = (
              <div
                onClick={() => onClick(r)}
                className={cn(
                  "px-5 py-3 flex gap-3 cursor-pointer hover:bg-accent/50 transition-colors",
                  !r.read_at && "bg-accent/30",
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 size-8 shrink-0 rounded-full flex items-center justify-center",
                    r.type === "error" || r.type === "overflow"
                      ? "bg-destructive/15 text-destructive"
                      : r.type === "warning"
                        ? "bg-amber-500/15 text-amber-600"
                        : "bg-primary/15 text-primary",
                  )}
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className={cn("text-sm truncate", !r.read_at && "font-semibold")}>
                      {r.title}
                    </div>
                    {!r.read_at && <span className="size-1.5 rounded-full bg-primary shrink-0" />}
                  </div>
                  {r.body && (
                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{r.body}</div>
                  )}
                  <div className="text-[10px] text-muted-foreground/70 mt-1 font-mono">
                    {new Date(r.created_at).toLocaleString("id-ID")}
                  </div>
                </div>
              </div>
            );
            return r.link
              ? <Link key={r.id} to={r.link as any}>{inner}</Link>
              : <div key={r.id}>{inner}</div>;
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}