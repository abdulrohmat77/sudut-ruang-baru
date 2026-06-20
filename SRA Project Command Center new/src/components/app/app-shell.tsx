import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, FolderKanban, CalendarRange, FileText, FileBarChart, FileSpreadsheet,
  FilePieChart, ScrollText, Wallet, Receipt, GitPullRequest, ShieldCheck, HardHat,
  AlertTriangle, FolderOpen, Mail, CalendarDays, Camera, Sparkles, Settings, LogOut,
  Compass, ListChecks, Users, Sun, Moon, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import sraLogo from "@/assets/sra-logo.png";
import { NotificationCenter } from "@/components/app/notification-center";
import { AppFooter } from "@/components/app/footer";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, SidebarRail, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type NavItem = { to: string; label: string; icon: any; group: string; soon?: boolean };

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Executive Dashboard", icon: LayoutDashboard, group: "Overview" },
  { to: "/projects", label: "Projects", icon: FolderKanban, group: "Overview" },
  { to: "/design-monitoring", label: "Design Monitoring", icon: Compass, group: "Delivery" },
  { to: "/planning", label: "Planning & Scheduling", icon: CalendarRange, group: "Delivery" },
  { to: "/reports/daily", label: "Daily Report", icon: FileText, group: "Reporting" },
  { to: "/reports/weekly", label: "Weekly Report", icon: FileBarChart, group: "Reporting" },
  { to: "/reports/monthly", label: "Monthly Report", icon: FileSpreadsheet, group: "Reporting" },
  { to: "/reports/final", label: "Final Project Report", icon: FilePieChart, group: "Reporting" },
  { to: "/contracts", label: "Contract Management", icon: ScrollText, group: "Commercial" },
  { to: "/finance", label: "Finance & Cashflow", icon: Wallet, group: "Commercial" },
  { to: "/invoices", label: "Invoice & Payment", icon: Receipt, group: "Commercial" },
  { to: "/variations", label: "Variation Order / CCO", icon: GitPullRequest, group: "Commercial" },
  { to: "/qaqc", label: "QA / QC", icon: ShieldCheck, group: "Quality & Safety" },
  { to: "/hse", label: "HSE", icon: HardHat, group: "Quality & Safety" },
  { to: "/risks", label: "Risk Management", icon: AlertTriangle, group: "Quality & Safety" },
  { to: "/documents", label: "Document Management", icon: FolderOpen, group: "Knowledge" },
  { to: "/correspondence", label: "Correspondence", icon: Mail, group: "Knowledge" },
  { to: "/meetings", label: "Meetings", icon: CalendarDays, group: "Knowledge" },
  { to: "/photos", label: "Photo & Drone", icon: Camera, group: "Knowledge" },
  { to: "/assistant", label: "AI Assistant", icon: Sparkles, group: "Intelligence" },
  { to: "/qa-labels", label: "QA Label Audit", icon: ListChecks, group: "Admin" },
  { to: "/admin-profiles", label: "Profil Pengguna", icon: Users, group: "Admin" },
  { to: "/settings", label: "System Settings", icon: Settings, group: "Admin" },
];

function useDarkMode() {
  // SSR-safe: start `false` on both server and first client render,
  // then sync from storage/system after mount to avoid hydration mismatch.
  const [dark, setDark] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const initial = stored
      ? stored === "dark"
      : window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
    setDark(initial);
    setMounted(true);
  }, []);
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark, mounted]);
  return [dark, setDark, mounted] as const;
}

function readSidebarCookie(): boolean {
  if (typeof document === "undefined") return true;
  const m = document.cookie.match(/(?:^|; )sidebar_state=([^;]+)/);
  return m ? m[1] === "true" : true;
}

function NavGroups({ pathname }: { pathname: string }) {
  const { setOpenMobile, isMobile } = useSidebar();
  const groups = Array.from(new Set(NAV.map((n) => n.group)));
  return (
    <>
      {groups.map((g) => (
        <SidebarGroup key={g}>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-sidebar-foreground/70">
            {g}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.filter((n) => n.group === g).map((n) => {
                const active = pathname === n.to || (n.to !== "/dashboard" && pathname.startsWith(n.to));
                return (
                  <SidebarMenuItem key={n.to}>
                    <SidebarMenuButton asChild isActive={active} tooltip={n.label}>
                      <Link
                        to={n.to as any}
                        onClick={() => isMobile && setOpenMobile(false)}
                        className="flex items-center gap-3"
                      >
                        <n.icon className="size-4 shrink-0" />
                        <span className="flex-1 truncate">{n.label}</span>
                        {n.soon && <span className="text-[9px] uppercase tracking-wider opacity-60">Soon</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}

function AppHeader({ email, onSignOut, dark, setDark, mounted }: {
  email: string; onSignOut: () => void; dark: boolean; setDark: (v: boolean) => void; mounted: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const current = NAV.find((n) => pathname === n.to || (n.to !== "/dashboard" && pathname.startsWith(n.to)));
  const group = current?.group ?? "";
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-card/80 px-3 backdrop-blur supports-[backdrop-filter]:bg-card/60 sm:px-4 lg:px-6">
      <SidebarTrigger className="size-9" />
      <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-sm min-w-0">
        <span className="text-muted-foreground">{group}</span>
        {current && (
          <>
            <ChevronRight className="size-3.5 text-muted-foreground/60" />
            <span className="font-medium truncate">{current.label}</span>
          </>
        )}
      </nav>
      <div className="sm:hidden text-sm font-medium truncate">{current?.label ?? "PMIS"}</div>
      <div className="ml-auto flex items-center gap-1">
        <Button
          size="icon"
          variant="ghost"
          className="size-9"
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          onClick={() => setDark(!dark)}
          suppressHydrationWarning
        >
          {mounted ? (
            dark ? <Sun className="size-4" /> : <Moon className="size-4" />
          ) : (
            <span className="size-4 inline-block" aria-hidden />
          )}
        </Button>
        <NotificationCenter />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 px-1.5 sm:px-2" aria-label="User menu">
              <Avatar className="size-7">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {(email || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline text-xs max-w-[140px] truncate">{email}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs">
              <div className="font-semibold truncate">{email || "—"}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Super Admin</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link to="/settings"><Settings className="size-4 mr-2" /> Settings</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/admin-profiles"><Users className="size-4 mr-2" /> Profil Pengguna</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onSignOut} className="text-destructive focus:text-destructive">
              <LogOut className="size-4 mr-2" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [email, setEmail] = useState<string>("");
  const [dark, setDark, themeMounted] = useDarkMode();
  const [defaultOpen] = useState<boolean>(() => readSidebarCookie());

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <Sidebar collapsible="icon" className="border-r-0">
        <SidebarHeader className="gap-2 border-b border-sidebar-border/60 px-2 py-3">
          <div className="flex items-center gap-2.5 px-1.5">
            <div className="size-9 rounded-md bg-white/95 flex items-center justify-center p-1.5 shadow-sm shrink-0">
              <img src={sraLogo} alt="Sudut Ruang Arsitek" className="size-full object-contain" />
            </div>
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <div className="font-bold text-sm tracking-tight truncate font-[var(--font-display)]">Sudut Ruang PMIS</div>
              <div className="text-[9px] uppercase tracking-widest opacity-60 truncate">Designing Corners · Defining Spaces</div>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="gap-0">
          <NavGroups pathname={pathname} />
        </SidebarContent>
        <SidebarFooter className="border-t border-sidebar-border/60 p-2">
          <div className="flex items-center gap-2 px-1.5 py-1 group-data-[collapsible=icon]:justify-center">
            <Avatar className="size-8 shrink-0">
              <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs font-semibold">
                {(email || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
              <div className="text-xs truncate">{email || "—"}</div>
              <div className="text-[10px] opacity-60">Super Admin</div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={signOut}
              aria-label="Sign out"
              className="size-8 text-sidebar-foreground hover:bg-sidebar-accent group-data-[collapsible=icon]:hidden"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className={cn("min-w-0 bg-background")}>
        <AppHeader email={email} onSignOut={signOut} dark={dark} setDark={setDark} mounted={themeMounted} />
        <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
          <main className="flex-1 p-3 sm:p-4 lg:p-6 xl:p-8 max-w-[1600px] w-full mx-auto fade-in-up">
            {children}
          </main>
          <AppFooter />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}