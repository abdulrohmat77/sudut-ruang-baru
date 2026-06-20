/* ACOS — Shell (sidebar IA + topbar) + App router */

const NAV = [
  { group: "PUSAT", items: [["Command Center", "LayoutDashboard"], ["Operations Flow", "Workflow"]] },
  { group: "SALES & KLIEN", items: [["CRM & Leads", "Users"], ["AI Agent", "Bot"], ["AI Estimator", "Calculator"]] },
  { group: "DOKUMEN", items: [["Proposals", "FileText"], ["SPK & Kontrak", "FileCheck"], ["Finance & Payments", "Receipt"]] },
  { group: "EKSEKUSI", items: [["Projects", "Kanban"], ["Portfolio", "Award"]] },
  { group: "INTELIJEN", items: [["Analytics & KPI", "BarChart3"], ["Automation Center", "Activity"], ["Blueprint Teknis", "Boxes"]] },
  { group: "SISTEM", items: [["Settings", "Settings"]] },
];

function Sidebar({ page, setPage, collapsed, setCollapsed }) {
  const D = window.ACOS_DATA;
  return (
    <div style={{ width: collapsed ? 66 : 234, flexShrink: 0, background: T.sidebar, borderRight: `1px solid ${T.line}`, display: "flex", flexDirection: "column", transition: "width .2s", height: "100%", position: "relative", zIndex: 20 }}>
      <div style={{ padding: collapsed ? "18px 0" : "18px 18px", display: "flex", alignItems: "center", gap: 11, justifyContent: collapsed ? "center" : "flex-start", borderBottom: `1px solid ${T.line}` }}>
        <Mark size={32} />
        {!collapsed && <div><div style={{ fontWeight: 800, fontSize: 13, color: T.txt, letterSpacing: 1.5 }}>ACOS</div><div style={{ fontSize: 7.5, color: T.sky, letterSpacing: 2, fontWeight: 600 }}>SUDUT RUANG</div></div>}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "10px 10px" }}>
        {NAV.map((sec, si) => (
          <div key={si} style={{ marginBottom: 12 }}>
            {!collapsed && <div style={{ fontSize: 8.5, color: T.dim, fontWeight: 700, letterSpacing: 1.2, padding: "6px 10px 5px" }}>{tr(sec.group)}</div>}
            {sec.items.map(([name, icon]) => {
              const on = page === name;
              return (
                <div key={name} onClick={() => setPage(name)} title={tr(name)} style={{
                  display: "flex", alignItems: "center", gap: 11, padding: collapsed ? "10px 0" : "9px 10px", borderRadius: 9, cursor: "pointer", marginBottom: 2,
                  justifyContent: collapsed ? "center" : "flex-start", position: "relative",
                  background: on ? "rgba(74,179,216,0.15)" : "transparent", color: on ? T.tint : T.sub, transition: "background .15s",
                }} onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = "rgba(74,179,216,0.09)"; }} onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = "transparent"; }}>
                  {on && <div style={{ position: "absolute", left: 0, top: 8, bottom: 8, width: 3, borderRadius: 999, background: T.sky }} />}
                  <Icon name={icon} size={17} color={on ? T.sky : T.sub} />
                  {!collapsed && <span style={{ fontSize: 12.5, fontWeight: on ? 700 : 500 }}>{tr(name)}</span>}
                  {!collapsed && name === "CRM & Leads" && <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 800, color: T.tint, background: "rgba(74,179,216,0.15)", borderRadius: 999, padding: "1px 6px" }}>8</span>}
                  {!collapsed && name === "Automation Center" && <Dot color={T.green} pulse size={6} style={{ marginLeft: "auto" }} />}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ padding: 10, borderTop: `1px solid ${T.line}` }}>
        <div onClick={() => setCollapsed(!collapsed)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "8px", borderRadius: 8, cursor: "pointer", color: T.dim, fontSize: 11 }}>
          <Icon name={collapsed ? "ChevronsRight" : "ChevronsLeft"} size={16} color={T.dim} />{!collapsed && <span>Ciutkan</span>}
        </div>
      </div>
    </div>
  );
}

function Topbar({ page, user, onLogout }) {
  const D = window.ACOS_DATA;
  const [notif, setNotif] = useState(false);
  return (
    <div style={{ height: 58, flexShrink: 0, background: T.topbar, backdropFilter: "blur(12px)", borderBottom: `1px solid ${T.line}`, display: "flex", alignItems: "center", padding: "0 20px", gap: 16, position: "relative", zIndex: 15 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: T.txt }}>{tr(page)}</span>
      </div>
      <div style={{ flex: 1, maxWidth: 420, marginLeft: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, background: T.inset, border: `1px solid ${T.line}`, borderRadius: 9, padding: "8px 12px" }}>
          <Icon name="Search" size={15} color={T.dim} />
          <input placeholder="Cari lead, proyek, invoice, workflow…" style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: T.txt, fontSize: 12, fontFamily: T.font }} />
          <kbd style={{ fontSize: 9, color: T.dim, border: `1px solid ${T.line}`, borderRadius: 5, padding: "2px 6px", fontFamily: T.mono }}>⌘K</kbd>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
        <Tag color={T.green}><Dot color={T.green} pulse size={6} />n8n LIVE</Tag>
        <button style={{ width: 36, height: 36, borderRadius: 9, background: T.inset, border: `1px solid ${T.line}`, display: "grid", placeItems: "center", cursor: "pointer", position: "relative" }} onClick={() => setNotif(!notif)}>
          <Icon name="Bell" size={16} color={T.sub} /><span style={{ position: "absolute", top: 7, right: 8, width: 7, height: 7, borderRadius: "50%", background: T.red }} />
        </button>
        <div style={{ width: 1, height: 26, background: T.line, margin: "0 4px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }} onClick={onLogout} title="Klik untuk keluar">
          <Avatar initials={user.initials} color={T.sky} size={32} />
          <div style={{ lineHeight: 1.2 }}><div style={{ fontSize: 12, fontWeight: 700, color: T.txt }}>{user.name.split(" ").slice(0, 2).join(" ")}</div><div style={{ fontSize: 9.5, color: T.dim }}>{user.role}</div></div>
          <Icon name="LogOut" size={14} color={T.dim} />
        </div>
      </div>
    </div>
  );
}

// Placeholder for the lighter modules (AI Agent, Proposals, SPK, Portfolio)
function ModulePlaceholder({ page, setPage }) {
  const D = window.ACOS_DATA;
  const meta = {
    "AI Agent": { icon: "Bot", desc: "Syifa — agen AI WhatsApp bertenaga Groq llama-3.3-70b. Menjawab lead dengan memory percakapan, menskor intensi, dan dapat dialihkan ke manusia (WF-6).", stat: [["1.280", "Pesan / 24j"], ["86%", "Ditangani AI"], ["1.2 mnt", "Avg respons"]], wf: "WF-1 · WF-6" },
    "Proposals": { icon: "FileText", desc: "Generator proposal branded. Menarik data dari estimasi (RAB, fee, PPN) — tanpa input ulang. Event 'proposal.approved' otomatis memicu SPK.", stat: [["18", "Proposal aktif"], ["5 mnt", "Waktu buat"], ["62%", "Approval rate"]], wf: "Doc Engine · WF-0" },
    "SPK & Kontrak": { icon: "FileCheck", desc: "Surat Perjanjian Kerja 9-pasal dengan e-signature. Ter-generate otomatis dari proposal disetujui; penandatanganan memicu invoice Termin 1.", stat: [["2", "Menunggu e-sign"], ["9", "Pasal standar"], ["Instan", "Generate"]], wf: "Doc Engine (event)" },
    "Portfolio": { icon: "Award", desc: "Galeri karya selesai. Proyek 'completed' otomatis menyusun studi kasus & dipublikasi ke sudutruang.com.", stat: [["17", "Karya terdokumentasi"], ["IKN", "Proyek nasional"], ["Auto", "Publish"]], wf: "Auto-publish" },
  }[page] || { icon: "Box", desc: "Modul.", stat: [], wf: "" };
  return (
    <div style={{ padding: 22, height: "100%", overflowY: "auto" }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: T.txt, margin: 0 }}>{tr(page)}</h1>
        <div style={{ fontSize: 13, color: T.dim, marginTop: 6 }}>Bagian dari pipeline ACOS yang terhubung penuh.</div>
      </div>
      <Panel pad={0} style={{ maxWidth: 880 }}>
        <div style={{ padding: 26, display: "flex", gap: 18, alignItems: "flex-start" }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(74,179,216,0.12)", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name={meta.icon} size={28} color={T.sky} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: T.txt }}>{page}</span>
              <Tag color={T.green}><Dot color={T.green} pulse size={6} />Terintegrasi</Tag>
              {meta.wf && <Tag color={T.tint} style={{ fontFamily: T.mono }}>{meta.wf}</Tag>}
            </div>
            <div style={{ fontSize: 13, color: T.sub, lineHeight: 1.6, maxWidth: 620 }}>{meta.desc}</div>
            <div style={{ display: "flex", gap: 24, marginTop: 20 }}>
              {meta.stat.map(([v, l], i) => (
                <div key={i}><div style={{ fontSize: 22, fontWeight: 800, color: T.tint }}>{v}</div><div style={{ fontSize: 10.5, color: T.dim, marginTop: 2 }}>{l}</div></div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 9, marginTop: 22 }}>
              <Btn v="primary" size="sm" icon="Workflow" onClick={() => setPage("Operations Flow")}>Lihat di Operations Flow</Btn>
              <Btn v="ghost" size="sm" icon="Activity" onClick={() => setPage("Automation Center")}>Workflow terkait</Btn>
            </div>
          </div>
        </div>
        <div style={{ padding: "16px 26px", borderTop: `1px solid ${T.line}`, background: T.inset, display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name="Info" size={15} color={T.dim} />
          <span style={{ fontSize: 11.5, color: T.dim }}>Modul ini membaca data dari tabel bersama Supabase — semua nilai mengalir otomatis dari tahap sebelumnya tanpa input ulang.</span>
        </div>
      </Panel>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("Command Center");
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setThemeState] = useState(() => localStorage.getItem("acos_theme") || "dark");
  const [lang, setLangState] = useState(() => localStorage.getItem("acos_lang") || "hybrid");
  const setTheme = (v) => { setThemeState(v); localStorage.setItem("acos_theme", v); };
  const setLang = (v) => { setLangState(v); localStorage.setItem("acos_lang", v); };

  // apply theme + language synchronously each render (login stays dark for brand impact)
  applyTheme(user ? theme : "dark");
  window.ACOS_LANG.v = lang;

  if (!user) return <LoginPage onLogin={setUser} />;

  let content;
  switch (page) {
    case "Command Center": content = <CommandCenter setPage={setPage} user={user} />; break;
    case "Operations Flow": content = <OperationsFlow setPage={setPage} />; break;
    case "CRM & Leads": content = <CRMPage setPage={setPage} />; break;
    case "Automation Center": content = <AutomationCenter />; break;
    case "Projects": content = <ProjectsPage setPage={setPage} />; break;
    case "Finance & Payments": content = <FinancePage setPage={setPage} />; break;
    case "Analytics & KPI": content = <AnalyticsPage />; break;
    case "Blueprint Teknis": content = <Blueprint setPage={setPage} />; break;
    case "Settings": content = <SettingsPage theme={theme} setTheme={setTheme} lang={lang} setLang={setLang} />; break;
    default: content = <ModulePlaceholder page={page} setPage={setPage} />;
  }

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: T.font, background: T.bg, color: T.txt, overflow: "hidden" }}>
      <Sidebar page={page} setPage={setPage} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: T.bgGrad }}>
        <Topbar page={page} user={user} onLogout={() => setUser(null)} />
        <div style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>{content}</div>
      </div>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
