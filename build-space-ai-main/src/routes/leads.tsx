import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, PageHeader } from "@/components/app-layout";
import { useI18n } from "@/lib/i18n";
import { mockLeads } from "@/lib/mock-data";
import { Plus, Search } from "lucide-react";

export const Route = createFileRoute("/leads")({ component: Leads });

const stageColor: Record<string, string> = {
  Lead: "bg-muted text-muted-foreground",
  Qualified: "bg-accent/30 text-primary",
  Estimation: "bg-warning/20 text-warning-foreground",
  Proposal: "bg-accent/40 text-primary",
  Negotiation: "bg-warning/30 text-warning-foreground",
  Approved: "bg-success/20 text-success",
};

function Leads() {
  const { t, fmtIDR } = useI18n();
  return (
    <AppLayout>
      <PageHeader
        title={t("leads.title")}
        subtitle="CRM — Lead pipeline, qualification, follow-up."
        actions={
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-3.5 py-2 text-sm font-medium hover:bg-primary/90">
            <Plus className="h-4 w-4" /> {t("leads.new")}
          </button>
        }
      />
      <div className="rounded-xl border bg-card">
        <div className="p-3 border-b flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input placeholder={t("common.search")} className="w-full rounded-md border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2.5">Name</th>
                <th className="text-left px-4 py-2.5">Project</th>
                <th className="text-left px-4 py-2.5">Location</th>
                <th className="text-right px-4 py-2.5">Budget</th>
                <th className="text-left px-4 py-2.5">Stage</th>
                <th className="text-left px-4 py-2.5">Source</th>
              </tr>
            </thead>
            <tbody>
              {mockLeads.map((l) => (
                <tr key={l.id} className="border-t hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <div className="font-medium text-primary">{l.name}</div>
                    <div className="text-xs text-muted-foreground">{l.phone}</div>
                  </td>
                  <td className="px-4 py-3">{l.projectType} · {l.buildingArea} m²</td>
                  <td className="px-4 py-3">{l.location}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmtIDR(l.budget)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${stageColor[l.stage] ?? "bg-secondary"}`}>{l.stage}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{l.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
