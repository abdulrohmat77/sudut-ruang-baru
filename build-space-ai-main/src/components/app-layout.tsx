import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Bot, Users, UserSquare2, Calculator, FileText,
  FileSignature, Receipt, FolderKanban, FolderOpen, ShieldCheck, BarChart3,
  Building2, ImageIcon, Sun, Moon,
} from "lucide-react";
import { useI18n, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { SRMonogram, TechLabel } from "@/components/architectural";
import { type ReactNode, useState, useEffect } from "react";

const navGroups: Array<{
  label: string;
  items: Array<{ to: string; icon: typeof LayoutDashboard; key: string; highlight?: boolean }>;
}> = [
  {
    label: "01 · Command",
    items: [
      { to: "/", icon: LayoutDashboard, key: "nav.dashboard" },
      { to: "/ai-agent", icon: Bot, key: "nav.ai_agent", highlight: true },
    ],
  },
  {
    label: "02 · Pipeline",
    items: [
      { to: "/leads", icon: Users, key: "nav.leads" },
      { to: "/clients", icon: UserSquare2, key: "nav.clients" },
      { to: "/estimator", icon: Calculator, key: "nav.estimator" },
      { to: "/proposals", icon: FileText, key: "nav.proposals" },
      { to: "/spk", icon: FileSignature, key: "nav.spk" },
      { to: "/invoices", icon: Receipt, key: "nav.invoices" },
    ],
  },
  {
    label: "03 · Delivery",
    items: [
      { to: "/projects", icon: FolderKanban, key: "nav.projects" },
      { to: "/documents", icon: FolderOpen, key: "nav.documents" },
      { to: "/portal", icon: ShieldCheck, key: "nav.client_portal" },
      { to: "/reports", icon: BarChart3, key: "nav.reports" },
    ],
  },
  {
    label: "04 · Studio",
    items: [
      { to: "/company", icon: Building2, key: "nav.company" },
      { to: "/portfolio", icon: ImageIcon, key: "nav.portfolio" },
    ],
  },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { t, lang, setLang } = useI18n();
  const path = useRouterState({ select: (s) => s.location.pathname });

  // Theme toggle
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem("sra-theme");
    if (stored) return stored === "dark";
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("sra-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("sra-theme", "light");
    }
  }, [dark]);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
        <div className="px-5 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md border border-sidebar-primary/40 text-sidebar-primary flex items-center justify-center">
              <SRMonogram size={22} />
            </div>
            <div className="leading-tight">
              <div className="font-semibold text-[13px] tracking-wide">{t("app.name")}</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/60">
                {t("app.tagline")}
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-5">
              <div className="px-2 mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-sidebar-foreground/45">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = item.to === "/" ? path === "/" : path.startsWith(item.to);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to as "/"}
                      className={cn(
                        "group flex items-center gap-3 rounded-md px-2.5 py-2 text-[13px] transition-colors",
                        active
                          ? "bg-sidebar-accent text-sidebar-primary-foreground font-medium"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "h-3.5 w-px",
                          active ? "bg-sidebar-primary" : "bg-transparent group-hover:bg-sidebar-primary/40",
                        )}
                      />
                      <Icon className={cn("h-4 w-4", active ? "text-sidebar-primary" : item.highlight && "text-sidebar-primary")} strokeWidth={1.6} />
                      <span>{t(item.key)}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-sidebar-border space-y-3">
          <div className="px-2 text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/45">
            Theme
          </div>
          <button
            onClick={() => setDark(!dark)}
            className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-xs font-medium transition-colors bg-sidebar-accent/50 text-sidebar-foreground/80 hover:bg-sidebar-accent"
          >
            {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            {dark ? "Light Mode" : "Dark Mode"}
          </button>
          <div className="px-2 text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/45">
            Language
          </div>
          <div className="flex items-center gap-1">
            {(["id", "en"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={cn(
                  "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                  lang === l
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "bg-sidebar-accent/50 text-sidebar-foreground/80 hover:bg-sidebar-accent",
                )}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="px-2 pt-1 text-[10px] text-sidebar-foreground/40 font-mono">
            REF · SRA-OS / v1.0
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-card">
          <div className="flex items-center gap-2">
            <SRMonogram size={20} className="text-primary" />
            <div className="font-semibold text-primary text-sm">{t("app.name")}</div>
          </div>
          <div className="flex gap-2 items-center text-xs">
            <button
              onClick={() => setDark(!dark)}
              className="rounded p-1.5 border border-border hover:bg-secondary"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {(["id", "en"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={cn(
                  "rounded px-2 py-1 border",
                  lang === l ? "bg-primary text-primary-foreground border-primary" : "border-border",
                )}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </header>
        <div className="px-5 md:px-10 py-7 md:py-9 max-w-[1400px] mx-auto">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
  refCode,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  refCode?: string;
  eyebrow?: string;
}) {
  return (
    <div className="mb-8">
      <TechLabel ref={refCode ?? "REF · 00"} label={eyebrow ?? "Sudut Ruang Operating System"} className="mb-3" />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="font-display text-3xl md:text-[2.25rem] font-extrabold leading-tight text-primary tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm md:text-[15px] text-muted-foreground mt-2 leading-relaxed text-balance">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
      <div className="mt-5 h-px w-full bg-gradient-to-r from-border via-border to-transparent" />
    </div>
  );
}
