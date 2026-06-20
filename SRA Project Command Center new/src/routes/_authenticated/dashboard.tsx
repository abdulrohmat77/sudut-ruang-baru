import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { dashboardStats, listProjects } from "@/lib/projects.functions";
import {
  getDashboardKPIs, getDashboardTrends, getDashboardAlerts, getRiskMatrix,
  getDashboardPrefs, saveDashboardPrefs,
} from "@/lib/dashboard.functions";
import { exportDashboardPDF, exportDashboardXLSX } from "@/lib/dashboard-export";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  FolderKanban, Wallet, TrendingUp, BookOpen, AlertTriangle, RefreshCw,
  FileDown, FileSpreadsheet, Settings2, Activity, ShieldAlert,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar,
} from "recharts";

const searchSchema = z.object({
  period: fallback(z.enum(["7d", "30d", "90d", "ytd"]), "30d").default("30d"),
});

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
  validateSearch: zodValidator(searchSchema),
});

const STATUS_COLORS: Record<string, string> = {
  planning: "hsl(220 14% 60%)",
  active: "var(--primary)",
  on_hold: "hsl(38 92% 50%)",
  completed: "hsl(142 70% 45%)",
  cancelled: "hsl(0 72% 55%)",
};

const fmtIDR = (v: number) => new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(v);
const fmtFull = (v: number) => new Intl.NumberFormat("id-ID").format(Math.round(v));

const WIDGETS = [
  { id: "kpi", label: "KPI Strip" },
  { id: "alerts", label: "Needs Attention" },
  { id: "cashflow", label: "Cashflow Trend" },
  { id: "scurve", label: "S-Curve Progress" },
  { id: "contracts", label: "Contract per Project" },
  { id: "portfolio", label: "Portfolio List" },
  { id: "status", label: "Status Breakdown" },
  { id: "risk", label: "Risk Heatmap" },
];

function DashboardPage() {
  const { period } = Route.useSearch();
  const navigate = useNavigate({ from: "/dashboard" });
  const ds = useServerFn(dashboardStats);
  const lp = useServerFn(listProjects);
  const kf = useServerFn(getDashboardKPIs);
  const tf = useServerFn(getDashboardTrends);
  const af = useServerFn(getDashboardAlerts);
  const rf = useServerFn(getRiskMatrix);
  const pf = useServerFn(getDashboardPrefs);
  const sf = useServerFn(saveDashboardPrefs);

  const refetchInterval = 60_000;
  const stats = useQuery({ queryKey: ["dashboard-stats"], queryFn: () => ds(), refetchInterval });
  const projects = useQuery({ queryKey: ["projects"], queryFn: () => lp(), refetchInterval });
  const kpis = useQuery({ queryKey: ["dash-kpi", period], queryFn: () => kf({ data: { period } }), refetchInterval });
  const trends = useQuery({ queryKey: ["dash-trends"], queryFn: () => tf(), refetchInterval });
  const alerts = useQuery({ queryKey: ["dash-alerts"], queryFn: () => af(), refetchInterval });
  const risk = useQuery({ queryKey: ["dash-risk"], queryFn: () => rf(), refetchInterval });
  const prefs = useQuery({ queryKey: ["dash-prefs"], queryFn: () => pf() });

  const widgets = { ...Object.fromEntries(WIDGETS.map((w) => [w.id, true])), ...(prefs.data?.widgets ?? {}) } as Record<string, boolean>;
  const visible = (id: string) => widgets[id] !== false;
  const [savingPrefs, setSavingPrefs] = useState(false);
  const toggleWidget = async (id: string, on: boolean) => {
    setSavingPrefs(true);
    const next = { ...widgets, [id]: on };
    try { await sf({ data: { widgets: next } }); await prefs.refetch(); } finally { setSavingPrefs(false); }
  };

  const byStatus = stats.data?.byStatus ?? {};
  const pieData = Object.entries(byStatus).map(([name, value]) => ({ name, value }));
  const lastUpdated = new Date().toLocaleTimeString("id-ID");

  const refreshAll = () => {
    stats.refetch(); projects.refetch(); kpis.refetch(); trends.refetch(); alerts.refetch(); risk.refetch();
  };

  const doExportPDF = () => {
    if (!kpis.data || !projects.data || !alerts.data) return;
    exportDashboardPDF({ kpis: kpis.data, projects: projects.data.projects, alerts: alerts.data, period });
  };
  const doExportXLSX = () => {
    if (!kpis.data || !projects.data || !alerts.data) return;
    exportDashboardXLSX({ kpis: kpis.data, projects: projects.data.projects, alerts: alerts.data });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 lg:gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Executive Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">Portfolio health · auto-refresh tiap 60 dtk · Last updated {lastUpdated}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center rounded-md border bg-card p-0.5">
            {(["7d","30d","90d","ytd"] as const).map((p) => (
              <button key={p}
                onClick={() => navigate({ search: (prev: any) => ({ ...prev, period: p }) })}
                className={`px-2.5 py-1 text-xs rounded ${period === p ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                {p.toUpperCase()}
              </button>
            ))}
          </div>
          <Button size="sm" variant="outline" onClick={refreshAll}><RefreshCw className="size-3.5 mr-1" />Refresh</Button>
          <Button size="sm" variant="outline" onClick={doExportPDF}><FileDown className="size-3.5 sm:mr-1" /><span className="hidden sm:inline">PDF</span></Button>
          <Button size="sm" variant="outline" onClick={doExportXLSX}><FileSpreadsheet className="size-3.5 sm:mr-1" /><span className="hidden sm:inline">Excel</span></Button>
          <Sheet>
            <SheetTrigger asChild><Button size="sm" variant="outline"><Settings2 className="size-3.5 sm:mr-1" /><span className="hidden sm:inline">Widgets</span></Button></SheetTrigger>
            <SheetContent>
              <SheetHeader><SheetTitle>Customize Widgets</SheetTitle></SheetHeader>
              <div className="mt-4 space-y-3">
                {WIDGETS.map((w) => (
                  <div key={w.id} className="flex items-center justify-between">
                    <Label htmlFor={`w-${w.id}`} className="text-sm">{w.label}</Label>
                    <Switch id={`w-${w.id}`} checked={visible(w.id)} disabled={savingPrefs}
                      onCheckedChange={(v) => toggleWidget(w.id, v)} />
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {visible("kpi") && (
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Total Project</div>
            <FolderKanban className="size-4 text-muted-foreground" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold mt-2">{stats.data?.totalProjects ?? 0}</div>
          <div className="text-[10px] text-muted-foreground mt-1">Burn {kpis.data?.burnPct.toFixed(1) ?? 0}% · Margin est {kpis.data?.marginPct.toFixed(1) ?? 0}%</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Nilai Kontrak</div>
            <Wallet className="size-4 text-muted-foreground" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold mt-2 font-mono">Rp {fmtIDR(stats.data?.totalValue ?? 0)}</div>
          <div className="text-[10px] text-muted-foreground mt-1">Paid periode: Rp {fmtIDR(kpis.data?.paidInPeriod ?? 0)}</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Outstanding AR</div>
            <Activity className="size-4 text-muted-foreground" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold mt-2 font-mono">Rp {fmtIDR(kpis.data?.outstandingTotal ?? 0)}</div>
          <div className="text-[10px] text-muted-foreground mt-1">{kpis.data?.outstandingCount ?? 0} invoice belum lunas</div>
          <ARBuckets buckets={kpis.data?.buckets} />
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Avg Progress</div>
            <TrendingUp className="size-4 text-muted-foreground" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold mt-2">{(stats.data?.avgProgress ?? 0).toFixed(0)}%</div>
          <Progress value={stats.data?.avgProgress ?? 0} className="h-1.5 mt-2" />
          <div className="text-[10px] text-muted-foreground mt-1">KB {stats.data?.kbCount ?? 0} · Docs {stats.data?.docsCount ?? 0}</div>
        </Card>
      </div>
      )}

      {visible("alerts") && <AlertsPanel alerts={alerts.data} />}

      {(visible("cashflow") || visible("scurve")) && (
      <div className="grid gap-4 lg:grid-cols-2">
        {visible("cashflow") && (
        <Card className="p-5">
          <h2 className="font-semibold mb-3">Cashflow Trend (6 bulan)</h2>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends.data?.cashflow ?? []}>
                <defs>
                  <linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(142 70% 45%)" stopOpacity={0.6}/><stop offset="100%" stopColor="hsl(142 70% 45%)" stopOpacity={0}/></linearGradient>
                  <linearGradient id="gOut" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(0 72% 55%)" stopOpacity={0.6}/><stop offset="100%" stopColor="hsl(0 72% 55%)" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="label" fontSize={11} tick={{ fill: "var(--muted-foreground)" }} stroke="var(--border)" />
                <YAxis fontSize={11} tickFormatter={(v) => fmtIDR(Number(v))} tick={{ fill: "var(--muted-foreground)" }} stroke="var(--border)" />
                <Tooltip formatter={(v: any) => `Rp ${fmtFull(Number(v))}`} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="inflow" name="Inflow" stroke="hsl(142 70% 45%)" fill="url(#gIn)" />
                <Area type="monotone" dataKey="outflow" name="Outflow" stroke="hsl(0 72% 55%)" fill="url(#gOut)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        )}
        {visible("scurve") && (
        <Card className="p-5">
          <h2 className="font-semibold mb-3">S-Curve Progress (portfolio avg)</h2>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 sm:h-[240px]">
            <ProgressGauge label="Planned" value={trends.data?.sCurve.planned ?? 0} color="hsl(220 14% 50%)" />
            <ProgressGauge label="Actual" value={trends.data?.sCurve.actual ?? 0} color="var(--primary)" />
            <div className="flex-1 min-w-[180px] text-sm text-muted-foreground">
              <p>Selisih: <span className="font-semibold text-foreground">{((trends.data?.sCurve.actual ?? 0) - (trends.data?.sCurve.planned ?? 0)).toFixed(1)}%</span></p>
              <p className="text-xs mt-2">Negatif = di belakang jadwal. Klik project di tabel untuk drill-down.</p>
            </div>
          </div>
        </Card>
        )}
      </div>
      )}

      {visible("contracts") && (
      <Card className="p-5">
        <h2 className="font-semibold mb-3">Top 10 Nilai Kontrak per Project</h2>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trends.data?.contractBars ?? []} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis type="number" fontSize={11} tickFormatter={(v) => fmtIDR(Number(v))} tick={{ fill: "var(--muted-foreground)" }} stroke="var(--border)" />
              <YAxis type="category" dataKey="code" fontSize={11} width={70} tick={{ fill: "var(--muted-foreground)" }} stroke="var(--border)" />
              <Tooltip formatter={(v: any) => `Rp ${fmtFull(Number(v))}`} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)", fontSize: 12 }} cursor={{ fill: "color-mix(in oklab, var(--primary) 10%, transparent)" }} />
              <Bar dataKey="value" fill="var(--primary)" radius={[0,4,4,0]}
                onClick={(d: any) => navigate({ to: "/projects/$projectId", params: { projectId: d.id } })}
                style={{ cursor: "pointer" }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        {visible("portfolio") && (
        <Card className="p-5">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-semibold">Portfolio Project</h2>
            <Link to="/projects" className="text-xs text-primary hover:underline">Lihat semua →</Link>
          </div>
          {projects.isLoading && <div className="text-sm text-muted-foreground">Memuat...</div>}
          {projects.data?.projects.length === 0 && <div className="text-sm text-muted-foreground p-4 text-center">Belum ada project.</div>}
          <div className="space-y-2">
            {projects.data?.projects.slice(0, 8).map((p: any) => (
              <Link key={p.id} to="/projects/$projectId" params={{ projectId: p.id }} className="block">
                {/* Mobile: stacked compact card */}
                <div className="sm:hidden p-3 rounded-md border bg-card hover:bg-muted/40 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-mono text-[10px] text-muted-foreground truncate">{p.code}</div>
                    <div className="text-xs font-semibold shrink-0">{Number(p.progress_percent).toFixed(0)}%</div>
                  </div>
                  <div className="text-sm font-medium truncate mt-0.5">{p.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{p.client_name ?? "—"}</div>
                  <div className="flex items-center justify-between gap-2 mt-1.5">
                    <Badge variant="secondary" className="capitalize text-[10px]">{p.status}</Badge>
                    <div className="text-xs font-mono">Rp {fmtIDR(Number(p.contract_value ?? 0))}</div>
                  </div>
                </div>
                {/* sm+ : original row */}
                <div className="hidden sm:grid grid-cols-[80px_1fr_120px_140px_60px] gap-3 items-center p-2.5 rounded-md hover:bg-muted/40 transition-colors">
                  <div className="font-mono text-[10px] text-muted-foreground truncate">{p.code}</div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{p.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{p.client_name ?? "—"}</div>
                  </div>
                  <Badge variant="secondary" className="capitalize justify-self-start">{p.status}</Badge>
                  <div className="text-xs font-mono text-right">Rp {fmtIDR(Number(p.contract_value ?? 0))}</div>
                  <div className="text-right text-xs font-semibold">{Number(p.progress_percent).toFixed(0)}%</div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
        )}

        {visible("status") && (
        <Card className="p-5">
          <h2 className="font-semibold mb-3">Status Breakdown</h2>
          {pieData.length === 0 ? (
            <div className="text-sm text-muted-foreground p-8 text-center">Belum ada data.</div>
          ) : (
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}
                    onClick={(d: any) => navigate({ to: "/projects", search: { status: d.name } as any })}
                    style={{ cursor: "pointer" }}>
                    {pieData.map((d) => <Cell key={d.name} fill={STATUS_COLORS[d.name] ?? "var(--muted)"} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)", fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11, textTransform: "capitalize" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
        )}
      </div>

      {visible("risk") && <RiskHeatmap data={risk.data} />}
    </div>
  );
}

function ARBuckets({ buckets }: { buckets?: { d0_30: number; d31_60: number; d61_90: number; d90p: number } }) {
  if (!buckets) return null;
  const total = buckets.d0_30 + buckets.d31_60 + buckets.d61_90 + buckets.d90p || 1;
  const segs = [
    { k: "0-30", v: buckets.d0_30, c: "bg-emerald-500" },
    { k: "31-60", v: buckets.d31_60, c: "bg-yellow-500" },
    { k: "61-90", v: buckets.d61_90, c: "bg-orange-500" },
    { k: "90+", v: buckets.d90p, c: "bg-red-500" },
  ];
  return (
    <div className="mt-2">
      <div className="flex h-1.5 rounded-full overflow-hidden bg-muted">
        {segs.map((s) => <div key={s.k} className={s.c} style={{ width: `${(s.v / total) * 100}%` }} />)}
      </div>
      <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
        {segs.map((s) => <span key={s.k}>{s.k}: {fmtIDR(s.v)}</span>)}
      </div>
    </div>
  );
}

function ProgressGauge({ label, value, color }: { label: string; value: number; color: string }) {
  const v = Math.min(100, Math.max(0, value));
  const r = 56;
  const c = 2 * Math.PI * r;
  const off = c - (v / 100) * c;
  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--muted)" strokeWidth="10" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 70 70)" />
        <text x="70" y="76" textAnchor="middle" fontSize="22" fontWeight="700" fill="var(--foreground)">{v.toFixed(0)}%</text>
      </svg>
      <div className="text-xs text-muted-foreground -mt-1">{label}</div>
    </div>
  );
}

function AlertsPanel({ alerts }: { alerts: any }) {
  if (!alerts) return null;
  const items = [
    { icon: AlertTriangle, label: "Project Overdue", count: alerts.overdue.length, tone: "text-red-600", to: "/projects" },
    { icon: TrendingUp, label: "Progress Lag >15%", count: alerts.lag.length, tone: "text-orange-600", to: "/projects" },
    { icon: ShieldAlert, label: "HSE Open", count: alerts.hse.length, tone: "text-orange-600", to: "/hse" },
    { icon: Wallet, label: "Invoice Due ≤7d", count: alerts.invoicesDue.length, tone: "text-yellow-600", to: "/invoices" },
    { icon: Activity, label: "Overflow 24h", count: alerts.overflow.length, tone: "text-red-600", to: "/settings" },
    { icon: BookOpen, label: "Unread Notif", count: alerts.unreadNotifications, tone: "text-blue-600", to: "/settings" },
  ];
  return (
    <Card className="p-5">
      <h2 className="font-semibold mb-3 flex items-center gap-2"><AlertTriangle className="size-4" /> Needs Attention</h2>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {items.map((it) => (
          <Link key={it.label} to={it.to as any} className="flex items-center gap-3 p-3 rounded-md border bg-card hover:bg-muted/40 transition-colors">
            <it.icon className={`size-4 ${it.tone}`} />
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{it.label}</div>
              <div className="text-xl font-bold leading-none mt-1">{it.count}</div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}

function RiskHeatmap({ data }: { data: any }) {
  if (!data) return null;
  const levels: string[] = data.levels;
  const max = Math.max(1, ...levels.flatMap((l) => levels.map((i) => data.matrix[l]?.[i] ?? 0)));
  const shortLabel = (s: string) => s.replace("_", " ");
  return (
    <Card className="p-5">
      <h2 className="font-semibold mb-3">Risk Heatmap (Probability × Impact)</h2>
      <div className="overflow-x-auto">
        <table className="text-xs border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left text-muted-foreground">Prob \ Impact</th>
              {levels.map((i) => <th key={i} className="p-2 text-center capitalize text-muted-foreground">{shortLabel(i)}</th>)}
            </tr>
          </thead>
          <tbody>
            {[...levels].reverse().map((p) => (
              <tr key={p}>
                <td className="p-2 capitalize text-muted-foreground">{shortLabel(p)}</td>
                {levels.map((i) => {
                  const v = data.matrix[p]?.[i] ?? 0;
                  const intensity = v / max;
                  return (
                    <td key={i} className="p-1">
                      <div className="h-12 w-16 rounded flex items-center justify-center font-semibold"
                        style={{ background: v ? `hsla(0, 72%, 55%, ${0.15 + intensity * 0.6})` : "var(--muted)", color: v ? "hsl(0 72% 25%)" : "var(--muted-foreground)" }}>
                        {v}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}