import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "id";

type Dict = Record<string, { en: string; id: string }>;

const dict: Dict = {
  "app.name": { en: "Sudut Ruang Arsitek", id: "Sudut Ruang Arsitek" },
  "app.tagline": { en: "Designing Corners · Defining Spaces", id: "Designing Corners · Defining Spaces" },

  "nav.dashboard": { en: "Command Center", id: "Pusat Kendali" },
  "nav.ai_agent": { en: "AI Consultant", id: "Konsultan AI" },
  "nav.leads": { en: "Leads", id: "Prospek" },
  "nav.clients": { en: "Clients", id: "Klien" },
  "nav.estimator": { en: "Estimator", id: "Estimator" },
  "nav.proposals": { en: "Proposals", id: "Proposal" },
  "nav.spk": { en: "SPK / Contracts", id: "SPK / Kontrak" },
  "nav.invoices": { en: "Invoices", id: "Faktur" },
  "nav.projects": { en: "Projects", id: "Proyek" },
  "nav.documents": { en: "Documents", id: "Dokumen" },
  "nav.client_portal": { en: "Client Portal", id: "Portal Klien" },
  "nav.reports": { en: "Reports", id: "Laporan" },
  "nav.company": { en: "Company Profile", id: "Profil Studio" },
  "nav.portfolio": { en: "Portfolio", id: "Portofolio" },

  "dash.title": { en: "Studio Command Center", id: "Pusat Kendali Studio" },
  "dash.subtitle": {
    en: "A calm, decision-first view of the studio — what needs your attention today, this week, and this quarter.",
    id: "Pandangan yang tenang dan berorientasi keputusan — apa yang memerlukan perhatian Anda hari ini, minggu ini, dan kuartal ini.",
  },
  "dash.attention": { en: "Requires Your Attention", id: "Memerlukan Perhatian Anda" },
  "dash.attention_sub": {
    en: "Decisions, not data. Items the studio principal should personally review.",
    id: "Keputusan, bukan sekadar data. Item yang sebaiknya ditinjau langsung oleh principal studio.",
  },
  "dash.financial": { en: "Financial Pulse", id: "Denyut Finansial" },
  "dash.pipeline_health": { en: "Pipeline Health", id: "Kesehatan Pipeline" },
  "dash.ai_brief": { en: "AI Strategic Brief", id: "Ringkasan Strategis AI" },
  "dash.ai_brief_sub": {
    en: "Generated from current pipeline, project risks, and cashflow.",
    id: "Dihasilkan dari kondisi pipeline, risiko proyek, dan arus kas terkini.",
  },

  "kpi.total_leads": { en: "Active Leads", id: "Prospek Aktif" },
  "kpi.qualified": { en: "Qualified", id: "Terkualifikasi" },
  "kpi.active_projects": { en: "Active Projects", id: "Proyek Aktif" },
  "kpi.proposal_sent": { en: "Proposals Sent", id: "Proposal Terkirim" },
  "kpi.proposal_approved": { en: "Approved", id: "Disetujui" },
  "kpi.outstanding": { en: "Outstanding", id: "Belum Dibayar" },
  "kpi.monthly_revenue": { en: "Monthly Revenue", id: "Pendapatan Bulan Ini" },
  "kpi.annual_revenue": { en: "Annual Run-Rate", id: "Run-Rate Tahunan" },

  "chart.revenue": { en: "Revenue Trajectory", id: "Lintasan Pendapatan" },
  "chart.pipeline": { en: "Project Pipeline", id: "Pipeline Proyek" },
  "chart.sources": { en: "Lead Sources", id: "Sumber Prospek" },

  "common.new": { en: "New", id: "Baru" },
  "common.search": { en: "Search…", id: "Cari…" },
  "common.status": { en: "Status", id: "Status" },
  "common.actions": { en: "Actions", id: "Aksi" },
  "common.value": { en: "Value", id: "Nilai" },
  "common.client": { en: "Client", id: "Klien" },
  "common.project": { en: "Project", id: "Proyek" },
  "common.due": { en: "Due", id: "Jatuh Tempo" },
  "common.created": { en: "Created", id: "Dibuat" },
  "common.view": { en: "Open", id: "Buka" },

  "leads.title": { en: "Leads · CRM", id: "Prospek · CRM" },
  "leads.new": { en: "New Lead", id: "Prospek Baru" },

  "ai.title": { en: "AI Architectural Consultant", id: "Konsultan Arsitektur AI" },
  "ai.subtitle": {
    en: "A calm, strategic conversation with the studio. The consultant educates, qualifies, and prepares your brief — never pressures.",
    id: "Percakapan strategis yang tenang dengan studio. Konsultan akan mengedukasi, mengkualifikasi, dan menyiapkan brief Anda — tanpa tekanan.",
  },
  "ai.placeholder": {
    en: "Describe your project, site, ambition, or constraints…",
    id: "Ceritakan proyek, lokasi, visi, atau batasan Anda…",
  },
  "ai.send": { en: "Send", id: "Kirim" },
  "ai.empty": {
    en: "Begin the conversation — for example: \"We are planning a 320 sqm tropical residence in Ubud with a sustainable approach.\"",
    id: "Mulai percakapan — misalnya: \"Kami merencanakan hunian tropis 320 m² di Ubud dengan pendekatan berkelanjutan.\"",
  },

  "projects.title": { en: "Projects", id: "Proyek" },
  "proposals.title": { en: "Proposals", id: "Proposal" },
  "spk.title": { en: "SPK / Contracts", id: "SPK / Kontrak" },
  "invoices.title": { en: "Invoices", id: "Faktur" },
  "clients.title": { en: "Clients", id: "Klien" },
  "documents.title": { en: "Document Center", id: "Pusat Dokumen" },
  "portal.title": { en: "Client Portal", id: "Portal Klien" },
  "reports.title": { en: "Reports & Analytics", id: "Laporan & Analitik" },
  "estimator.title": { en: "Investment Estimator", id: "Estimator Investasi" },
  "company.title": { en: "Studio Profile", id: "Profil Studio" },
  "portfolio.title": { en: "Selected Works", id: "Karya Pilihan" },
};

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  fmtIDR: (n: number) => string;
}

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("id");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("sr.lang") as Lang | null;
    if (saved === "en" || saved === "id") setLangState(saved);
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("sr.lang", l);
  };
  const t = (key: string) => dict[key]?.[lang] ?? key;
  const fmtIDR = (n: number) =>
    new Intl.NumberFormat(lang === "id" ? "id-ID" : "en-US", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n);
  return <Ctx.Provider value={{ lang, setLang, t, fmtIDR }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useI18n must be used within I18nProvider");
  return c;
}
