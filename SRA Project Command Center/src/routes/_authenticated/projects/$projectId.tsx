import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getProject, updatePhase } from "@/lib/projects.functions";
import { forecastProject } from "@/lib/ai-analysis.functions";
import { AiResultButton } from "@/components/app/ai-result-dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle2, Circle, PlayCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/projects/$projectId")({ component: ProjectDetail });

const STATUS_META: Record<string, { icon: any; label: string; tone: string }> = {
  not_started: { icon: Circle, label: "Belum Mulai", tone: "text-muted-foreground" },
  in_progress: { icon: PlayCircle, label: "Berjalan", tone: "text-info" },
  completed: { icon: CheckCircle2, label: "Selesai", tone: "text-success" },
  blocked: { icon: AlertCircle, label: "Terblokir", tone: "text-destructive" },
};

function ProjectDetail() {
  const { projectId } = Route.useParams();
  const get = useServerFn(getProject);
  const update = useServerFn(updatePhase);
  const forecast = useServerFn(forecastProject);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => get({ data: { id: projectId } }),
  });

  const advance = async (id: string, next: string) => {
    try {
      await update({ data: { id, status: next as any } });
      toast.success("Status fase diperbarui");
      refetch();
    } catch (e: any) { toast.error(e.message); }
  };

  if (isLoading) return <div className="text-muted-foreground">Memuat...</div>;
  const p = data?.project;
  if (!p) return <div>Project tidak ditemukan.</div>;

  return (
    <div className="space-y-6">
      <Link to="/projects" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
        <ArrowLeft className="size-4" /> Semua Project
      </Link>
      <div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">{p.code}</div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">{p.name}</h1>
            <p className="text-muted-foreground mt-1">{p.client_name ?? "—"} · {p.location ?? "—"}</p>
          </div>
          <AiResultButton
            label="Forecast Cashflow & ETC"
            title={`Forecast AI — ${p.name}`}
            run={() => forecast({ data: { projectId } })}
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Card className="p-4"><div className="text-xs text-muted-foreground">Status</div><Badge className="mt-1 capitalize">{p.status}</Badge></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground">Progress Aktual</div><div className="text-2xl font-bold mt-1">{Number(p.progress_percent).toFixed(0)}%</div></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground">Nilai Kontrak</div><div className="text-lg font-semibold font-mono mt-1">Rp {Number(p.contract_value ?? 0).toLocaleString("id-ID")}</div></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground">Periode</div><div className="text-sm mt-1">{p.start_date ?? "—"} → {p.end_date ?? "—"}</div></Card>
      </div>

      <Card className="p-6">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-semibold text-lg">Tahapan Proyek — SOP SRA</h2>
          <span className="text-xs text-muted-foreground">Brief → Konsep → DD → DED → Tender → Konstruksi → BAST</span>
        </div>
        <div className="space-y-3">
          {data?.phases.map((ph: any) => {
            const meta = STATUS_META[ph.status];
            const Icon = meta.icon;
            return (
              <div key={ph.id} className="flex items-center gap-4 p-3 rounded-md border bg-card/50">
                <Icon className={`size-5 shrink-0 ${meta.tone}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{ph.name}</div>
                  <div className="text-xs text-muted-foreground">Bobot {Number(ph.weight)}% · {meta.label}</div>
                </div>
                <div className="flex gap-1">
                  {ph.status !== "in_progress" && <Button size="sm" variant="outline" onClick={()=>advance(ph.id,"in_progress")}>Mulai</Button>}
                  {ph.status !== "completed" && <Button size="sm" onClick={()=>advance(ph.id,"completed")}>Selesai</Button>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}