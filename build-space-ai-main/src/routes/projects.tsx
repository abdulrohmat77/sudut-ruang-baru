import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, PageHeader } from "@/components/app-layout";
import { useI18n } from "@/lib/i18n";
import { mockProjects, PIPELINE_STAGES, type LeadStage } from "@/lib/mock-data";

export const Route = createFileRoute("/projects")({ component: Page });

function Page() {
  const { t, fmtIDR } = useI18n();
  return (
    <AppLayout>
      <PageHeader title={t("projects.title")} subtitle="Kanban board across the project lifecycle." />
      <div className="flex gap-3 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((stage: LeadStage) => {
          const items = mockProjects.filter((p) => p.stage === stage);
          return (
            <div key={stage} className="min-w-[260px] w-[260px] shrink-0">
              <div className="flex items-center justify-between mb-2 px-1">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-primary">{stage}</h4>
                <span className="text-xs text-muted-foreground">{items.length}</span>
              </div>
              <div className="space-y-2 bg-secondary/40 rounded-xl p-2 min-h-[120px]">
                {items.map((p) => (
                  <div key={p.id} className="rounded-lg bg-card border p-3 shadow-sm">
                    <div className="text-xs text-muted-foreground">{p.code}</div>
                    <div className="font-medium text-sm text-primary">{p.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{p.client}</div>
                    <div className="text-xs mt-2 tabular-nums">{fmtIDR(p.value)}</div>
                    <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full bg-accent" style={{ width: `${p.progress}%` }} />
                    </div>
                    <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                      <span>{p.pm}</span><span>{p.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
