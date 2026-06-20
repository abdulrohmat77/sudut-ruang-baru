import { AppLayout, PageHeader } from "@/components/app-layout";
import type { ReactNode } from "react";

export function StubPage({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <AppLayout>
      <PageHeader title={title} subtitle={subtitle} />
      {children ?? (
        <div className="rounded-xl border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Module ready for build-out. Centralized data, AI generation, and workflows wire in here.
          </p>
        </div>
      )}
    </AppLayout>
  );
}

export function DataTable<T extends { id: string }>({
  rows, columns,
}: {
  rows: T[];
  columns: { key: keyof T | string; label: string; render?: (r: T) => ReactNode; align?: "left" | "right" }[];
}) {
  return (
    <div className="rounded-xl border bg-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>{columns.map((c) => (
            <th key={String(c.key)} className={`px-4 py-2.5 ${c.align === "right" ? "text-right" : "text-left"}`}>{c.label}</th>
          ))}</tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t hover:bg-secondary/30">
              {columns.map((c) => (
                <td key={String(c.key)} className={`px-4 py-3 ${c.align === "right" ? "text-right tabular-nums" : ""}`}>
                  {c.render ? c.render(r) : String((r as any)[c.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "success" | "warning" | "danger" | "info" }) {
  const tones: Record<string, string> = {
    default: "bg-secondary text-secondary-foreground",
    success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-warning-foreground",
    danger: "bg-destructive/15 text-destructive",
    info: "bg-accent/25 text-primary",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}
