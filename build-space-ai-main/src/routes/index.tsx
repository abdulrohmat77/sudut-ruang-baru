import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout, PageHeader } from "@/components/app-layout";
import { PremiumCard, RuleLine, TechLabel, CornerFrame } from "@/components/architectural";
import { useI18n } from "@/lib/i18n";
import {
  mockLeads, mockProjects, mockInvoices, mockProposals,
  revenueSeries, leadSourceData, PIPELINE_STAGES,
} from "@/lib/mock-data";
import {
  TrendingUp, Users, FolderKanban, FileText, AlertCircle, Wallet,
  ArrowUpRight, ArrowRight, Sparkles, Clock, ShieldAlert, CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Command Center — Sudut Ruang Arsitek" },
      { name: "description", content: "Decision-first studio operating system: pipeline, financials, projects requiring attention, and AI strategic briefings." },
    ],
  }),
  component: Dashboard,
});

const PIE_COLORS = ["#043666", "#045D93", "#0A3863", "#4AB3D8", "#E1F0F8"];

function Kpi({ label, value, icon: Icon, hint, accent }: { label: string; value: string; icon: any; hint?: string; accent?: boolean }) {
  return (
    <PremiumCard padded={false} className="p-5 group">
      <div className="flex items-start justify-between mb-3">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.18em]">{label}</span>
        <Icon className={`h-4 w-4 ${accent ? "text-accent" : "text-primary/60"}`} strokeWidth={1.6} />
      </div>
      <div className="text-2xl md:text-[28px] font-bold text-primary tabular-nums leading-none">{value}</div>
      {hint && <div className="text-[11px] text-muted-foreground mt-2 font-medium">{hint}</div>}
    </PremiumCard>
  );
}

function AttentionItem({
  ref, title, meta, action, tone = "neutral", to,
}: {
  ref: string; title: string; meta: string; action: string; tone?: "neutral" | "warn" | "alert"; to?: string;
}) {
  const dot = tone === "alert" ? "bg-destructive" : tone === "warn" ? "bg-warning" : "bg-accent";
  return (
    <Link to={(to ?? "/") as "/"} className="block group">
      <div className="flex items-center gap-4 py-3.5 border-b border-border last:border-0 hover:bg-secondary/40 -mx-2 px-2 rounded-md transition-colors">
        <span className={`h-1.5 w-1.5 rounded-full ${dot} shrink-0`} />
        <span className="font-mono text-[10px] text-muted-foreground w-20 shrink-0">{ref}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-foreground truncate">{title}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{meta}</div>
        </div>
        <div className="text-xs text-primary font-medium flex items-center gap-1 opacity-70 group-hover:opacity-100">
          {action} <ArrowRight className="h-3 w-3" />
        </div>
      </div>
    </Link>
  );
}

function Dashboard() {
  const { t, fmtIDR } = useI18n();
  const qualified = mockLeads.filter((l) => l.stage !== "Lead").length;
  const outstanding = mockInvoices.filter((i) => i.status === "Pending" || i.status === "Overdue").reduce((s, i) => s + i.amount, 0);
  const overdue = mockInvoices.filter((i) => i.status === "Overdue");
  const monthly = mockInvoices.filter((i) => i.status === "Paid").reduce((s, i) => s + i.amount, 0);
  const proposalsAwaiting = mockProposals.filter((p) => p.status === "Sent" || p.status === "Revision");
  const atRiskProjects = mockProjects.filter((p) => p.progress < 20);

  const pipelineData = PIPELINE_STAGES.map((s) => ({
    stage: s,
    count: mockProjects.filter((p) => p.stage === s).length + mockLeads.filter((l) => l.stage === s).length,
  })).filter((d) => d.count > 0);

  return (
    <AppLayout>
      <PageHeader
        title={t("dash.title")}
        subtitle={t("dash.subtitle")}
        refCode="REF · 01"
        eyebrow="Sudut Ruang Operating System · Surabaya"
      />

      {/* Decision-first attention surface */}
      <div className="grid lg:grid-cols-3 gap-5 mb-8">
        <PremiumCard className="lg:col-span-2">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h2 className="font-display text-lg font-bold text-primary">{t("dash.attention")}</h2>
              <p className="text-xs text-muted-foreground mt-1">{t("dash.attention_sub")}</p>
            </div>
            <TechLabel ref="A·01" label="Today" />
          </div>
          <RuleLine className="my-3" />
          <div>
            {overdue.map((inv) => (
              <AttentionItem
                key={inv.id}
                ref={inv.number.split("/").slice(-1)[0]}
                title={`Invoice overdue — ${inv.client}`}
                meta={`${inv.project} · ${fmtIDR(inv.amount)} · due ${inv.dueDate}`}
                action="Resolve"
                tone="alert"
                to="/invoices"
              />
            ))}
            {proposalsAwaiting.map((p) => (
              <AttentionItem
                key={p.id}
                ref={p.number.split("/").slice(-1)[0]}
                title={`Proposal awaiting client — ${p.client}`}
                meta={`${p.project} · ${p.status} · ${fmtIDR(p.value)}`}
                action="Follow up"
                tone="warn"
                to="/proposals"
              />
            ))}
            {atRiskProjects.slice(0, 2).map((p) => (
              <AttentionItem
                key={p.id}
                ref={p.code.split("-").slice(-1)[0]}
                title={`Slow progress — ${p.name}`}
                meta={`${p.client} · ${p.progress}% complete · PM ${p.pm}`}
                action="Review"
                tone="warn"
                to="/projects"
              />
            ))}
          </div>
        </PremiumCard>

        <PremiumCard className="bg-primary text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 blueprint-grid opacity-10 pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-accent" strokeWidth={1.6} />
              <span className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/70">{t("dash.ai_brief")}</span>
            </div>
            <p className="text-[13px] leading-relaxed text-primary-foreground/90 font-light">
              The studio is entering Q3 with a healthy {pipelineData.reduce((s, d) => s + d.count, 0)}-item pipeline. Cashflow risk is concentrated in <span className="font-semibold text-accent">one overdue invoice</span>; resolving it lifts the month's collected revenue to roughly <span className="font-semibold text-accent">{fmtIDR(monthly + outstanding * 0.6)}</span>. The Sentra HQ negotiation remains the single largest pipeline lever — prioritize a principal-level review this week.
            </p>
            <div className="mt-4 pt-4 border-t border-primary-foreground/15">
              <Link to="/ai-agent" className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 font-medium">
                Open AI consultant <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Financial pulse */}
      <TechLabel ref="REF · 02" label={t("dash.financial")} className="mb-3" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <Kpi label={t("kpi.monthly_revenue")} value={fmtIDR(monthly)} icon={Wallet} accent hint="Collected this month" />
        <Kpi label={t("kpi.outstanding")} value={fmtIDR(outstanding)} icon={AlertCircle} hint={`${overdue.length} overdue`} />
        <Kpi label={t("kpi.annual_revenue")} value={fmtIDR(monthly * 6.3)} icon={TrendingUp} hint="Projected run-rate" />
        <Kpi label={t("kpi.active_projects")} value={String(mockProjects.length)} icon={FolderKanban} hint={`${atRiskProjects.length} at risk`} />
      </div>

      {/* Pipeline health */}
      <TechLabel ref="REF · 03" label={t("dash.pipeline_health")} className="mb-3" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <Kpi label={t("kpi.total_leads")} value={String(mockLeads.length)} icon={Users} />
        <Kpi label={t("kpi.qualified")} value={String(qualified)} icon={CheckCircle2} />
        <Kpi label={t("kpi.proposal_sent")} value={String(mockProposals.length)} icon={FileText} />
        <Kpi label={t("kpi.proposal_approved")} value={String(mockProposals.filter(p => p.status === "Approved").length)} icon={ShieldAlert} accent />
      </div>

      {/* Charts — quiet, architectural */}
      <div className="grid lg:grid-cols-3 gap-5 mb-8">
        <PremiumCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-bold text-primary">{t("chart.revenue")}</h3>
            <TechLabel ref="FY·26" label="6 mo" />
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueSeries} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#045D93" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#4AB3D8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="#E1F0F8" vertical={false} />
              <XAxis dataKey="m" stroke="#0A3863" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#0A3863" fontSize={11} tickFormatter={(v) => `${v}jt`} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E1F0F8", fontSize: 12, fontFamily: "Montserrat" }} />
              <Area type="monotone" dataKey="v" stroke="#043666" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </PremiumCard>

        <PremiumCard>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-bold text-primary">{t("chart.sources")}</h3>
            <Clock className="h-4 w-4 text-muted-foreground" strokeWidth={1.6} />
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={leadSourceData} dataKey="value" innerRadius={50} outerRadius={78} paddingAngle={2} stroke="#FEFEFE" strokeWidth={2}>
                {leadSourceData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1.5 text-xs">
            {leadSourceData.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-foreground/80">
                  <span className="h-2 w-2 rounded-sm" style={{ background: PIE_COLORS[i] }} />
                  {s.name}
                </span>
                <span className="text-muted-foreground tabular-nums">{s.value}%</span>
              </div>
            ))}
          </div>
        </PremiumCard>
      </div>

      <CornerFrame tone="muted" className="p-6">
        <PremiumCard padded={false} className="border-0 shadow-none bg-transparent">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-bold text-primary">{t("chart.pipeline")}</h3>
            <TechLabel ref="P·LINE" label="Stages" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={pipelineData} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#E1F0F8" vertical={false} />
              <XAxis dataKey="stage" stroke="#0A3863" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#0A3863" fontSize={10} allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E1F0F8", fontSize: 12, fontFamily: "Montserrat" }} />
              <Bar dataKey="count" fill="#043666" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </PremiumCard>
      </CornerFrame>
    </AppLayout>
  );
}
