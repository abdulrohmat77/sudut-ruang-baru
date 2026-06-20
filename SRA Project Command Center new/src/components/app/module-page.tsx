import { useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listProjects } from "@/lib/projects.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export function ModuleHeader({
  title, subtitle, projectId, onProjectChange, actions,
}: {
  title: string;
  subtitle?: string;
  projectId: string | null;
  onProjectChange: (v: string | null) => void;
  actions?: ReactNode;
}) {
  const list = useServerFn(listProjects);
  const { data } = useQuery({ queryKey: ["projects-select"], queryFn: () => list() });
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        <Select value={projectId ?? "all"} onValueChange={v => onProjectChange(v === "all" ? null : v)}>
          <SelectTrigger className="w-[240px]"><SelectValue placeholder="Semua Project" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Project</SelectItem>
            {(data?.projects ?? []).map((p: any) => (
              <SelectItem key={p.id} value={p.id}>{p.code} · {p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {actions}
      </div>
    </div>
  );
}

export function CreateDialog({
  trigger, title, open, onOpenChange, children,
}: {
  trigger?: ReactNode;
  title: string;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  children: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger ?? <Button><Plus className="size-4 mr-1" /> Tambah</Button>}</DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">{title}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

export function ProjectSelect({ value, onChange, projects }: { value: string; onChange: (v: string) => void; projects: any[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue placeholder="Pilih project" /></SelectTrigger>
      <SelectContent>
        {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.code} · {p.name}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

export function EmptyState({ label }: { label: string }) {
  return <Card className="p-12 text-center text-sm text-muted-foreground">{label}</Card>;
}

export function useProjectsList() {
  const list = useServerFn(listProjects);
  return useQuery({ queryKey: ["projects-select"], queryFn: () => list() });
}