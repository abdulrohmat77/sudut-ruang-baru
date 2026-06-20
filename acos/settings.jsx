/* ACOS — Settings: theme engine, i18n, and the Settings page */

// ── THEME PALETTES ───────────────────────────────────────
const PALETTES = {
  dark: {
    mode: "dark", bg: "#04203a",
    bgGrad: "radial-gradient(1100px 620px at 82% -12%, #0c3a64 0%, rgba(12,58,100,0) 60%), radial-gradient(900px 600px at -5% 110%, #06294a 0%, rgba(6,41,74,0) 55%), #04203a",
    panel: "#082a4b", panelHi: "#0b3460", inset: "#06223e",
    sidebar: "#022747", topbar: "rgba(8,42,75,0.7)",
    line: "rgba(255,255,255,0.09)", lineHi: "rgba(255,255,255,0.16)", track: "rgba(255,255,255,0.08)",
    txt: "#EAF4FB", sub: "#9DBAD2", dim: "#5F7C97",
  },
  light: {
    mode: "light", bg: "#EEF3F8",
    bgGrad: "radial-gradient(1000px 560px at 84% -16%, #ffffff 0%, rgba(255,255,255,0) 64%), radial-gradient(820px 520px at -6% 112%, #e3eef7 0%, rgba(227,238,247,0) 58%), #EEF3F8",
    panel: "#FFFFFF", panelHi: "#FFFFFF", inset: "#F1F6FB",
    sidebar: "#FFFFFF", topbar: "rgba(255,255,255,0.82)",
    line: "rgba(4,54,102,0.10)", lineHi: "rgba(4,54,102,0.20)", track: "rgba(4,54,102,0.09)",
    txt: "#063763", sub: "#3D5C77", dim: "#8198AC",
  },
};
function applyTheme(mode) {
  const p = PALETTES[mode] || PALETTES.dark;
  Object.assign(window.T, p);
  // shadows softer & navy-tinted in light per brand
  document.body.style.background = p.bg;
  const sb = document.querySelector("style#ac-dyn") || (() => { const s = document.createElement("style"); s.id = "ac-dyn"; document.head.appendChild(s); return s; })();
  sb.textContent = mode === "light"
    ? `::-webkit-scrollbar-thumb{background:rgba(4,54,102,0.18)} input::placeholder{color:#8198AC} .ac-row:hover{background:rgba(74,179,216,0.10)!important} .ac-trow:hover{background:rgba(74,179,216,0.07)}`
    : `::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12)} input::placeholder{color:#5F7C97}`;
}

// ── i18n ─────────────────────────────────────────────────
window.ACOS_LANG = { v: "hybrid" };
const DICT = {
  // nav + page keys → [hybrid, full-ID]
  "Command Center": ["Command Center", "Pusat Kendali"],
  "Operations Flow": ["Operations Flow", "Alur Operasi"],
  "CRM & Leads": ["CRM & Leads", "CRM & Prospek"],
  "AI Agent": ["AI Agent", "Agen AI"],
  "AI Estimator": ["AI Estimator", "Estimator AI"],
  "Proposals": ["Proposals", "Proposal"],
  "SPK & Kontrak": ["SPK & Kontrak", "SPK & Kontrak"],
  "Finance & Payments": ["Finance & Payments", "Keuangan & Pembayaran"],
  "Projects": ["Projects", "Proyek"],
  "Portfolio": ["Portfolio", "Portofolio"],
  "Analytics & KPI": ["Analytics & KPI", "Analitik & KPI"],
  "Automation Center": ["Automation Center", "Pusat Automasi"],
  "Blueprint Teknis": ["Blueprint Teknis", "Cetak Biru Teknis"],
  "Settings": ["Settings", "Pengaturan"],
  // groups
  "PUSAT": ["PUSAT", "PUSAT"],
  "SALES & KLIEN": ["SALES & KLIEN", "PENJUALAN & KLIEN"],
  "DOKUMEN": ["DOKUMEN", "DOKUMEN"],
  "EKSEKUSI": ["EKSEKUSI", "EKSEKUSI"],
  "INTELIJEN": ["INTELIJEN", "INTELIJEN"],
  "SISTEM": ["SISTEM", "SISTEM"],
};
function tr(key) {
  const e = DICT[key];
  if (!e) return key;
  return window.ACOS_LANG.v === "id" ? e[1] : e[0];
}

// ── small controls ───────────────────────────────────────
function Segmented({ value, onChange, options }) {
  return (
    <div style={{ display: "inline-flex", background: T.inset, borderRadius: 10, padding: 3, border: `1px solid ${T.line}`, gap: 2 }}>
      {options.map((o) => {
        const on = value === o.v;
        return (
          <button key={o.v} onClick={() => onChange(o.v)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 15px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: T.font, fontSize: 12, fontWeight: 700, background: on ? T.sky : "transparent", color: on ? "#03203a" : T.sub, transition: "all .15s" }}>
            {o.icon && <Icon name={o.icon} size={14} color={on ? "#03203a" : T.sub} />}{o.label}
          </button>
        );
      })}
    </div>
  );
}
function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} style={{ width: 44, height: 25, borderRadius: 999, border: "none", cursor: "pointer", background: on ? T.sky : T.inset, position: "relative", transition: "background .2s", flexShrink: 0, boxShadow: on ? "none" : `inset 0 0 0 1px ${T.line}` }}>
      <span style={{ position: "absolute", top: 3, left: on ? 22 : 3, width: 19, height: 19, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
    </button>
  );
}
function Row({ title, sub, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "15px 0", borderBottom: `1px solid ${T.line}` }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.txt }}>{title}</div>
        {sub && <div style={{ fontSize: 11, color: T.dim, marginTop: 3, lineHeight: 1.45 }}>{sub}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}
function Field({ label, value, mask, full }) {
  return (
    <div style={{ flex: full ? "1 1 100%" : "1 1 220px", minWidth: 0 }}>
      <div style={{ fontSize: 9.5, color: T.dim, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700, marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.inset, border: `1px solid ${T.line}`, borderRadius: 9, padding: "9px 12px" }}>
        <span style={{ flex: 1, fontFamily: mask ? T.mono : T.font, fontSize: 12, color: T.txt, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</span>
        {mask && <Icon name="Eye" size={13} color={T.dim} />}
      </div>
    </div>
  );
}

// ── SETTINGS PAGE ────────────────────────────────────────
function SettingsPage({ theme, setTheme, lang, setLang }) {
  const D = window.ACOS_DATA;
  const [tab, setTab] = useState("umum");
  const [cfg, setCfg] = useState(D.aiConfig);
  const [gen, setGen] = useState({ notif: true, autoRefresh: true, density: "comfortable", sound: false, weekStart: "mon" });
  const tabs = [["umum", "Umum", "SlidersHorizontal"], ["ai", "AI Agent (Syifa)", "Bot"], ["integrasi", "Integrasi", "Plug"], ["notif", "Notifikasi", "Bell"], ["tim", "Tim & Peran", "Users"]];
  const stC = { connected: T.green, warning: T.amber, disconnected: T.dim };
  const stL = { connected: "Terhubung", warning: "Perlu perhatian", disconnected: "Belum terhubung" };

  return (
    <div style={{ padding: 22, height: "100%", overflowY: "auto" }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: T.txt, margin: 0 }}>{tr("Settings")}</h1>
        <div style={{ fontSize: 13, color: T.dim, marginTop: 6 }}>Tampilan, AI Agent, integrasi & preferensi sistem ACOS.</div>
      </div>

      <div style={{ display: "flex", gap: 7, marginBottom: 18, flexWrap: "wrap" }}>
        {tabs.map(([k, l, ic]) => (
          <button key={k} onClick={() => setTab(k)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 15px", borderRadius: 10, border: `1px solid ${tab === k ? T.sky + "55" : T.line}`, background: tab === k ? "rgba(74,179,216,0.14)" : T.panel, color: tab === k ? T.sky : T.sub, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: T.font }}>
            <Icon name={ic} size={14} color={tab === k ? T.sky : T.sub} />{l}
          </button>
        ))}
      </div>

      {/* ── UMUM ── */}
      {tab === "umum" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start", maxWidth: 1000 }}>
          <Panel>
            <PanelHead title="Tampilan" sub="Tema & kepadatan antarmuka" icon="Palette" />
            <div style={{ padding: "4px 18px 16px" }}>
              <Row title="Mode tema" sub="Gelap (mission-control) atau terang (putih)">
                <Segmented value={theme} onChange={setTheme} options={[{ v: "dark", label: "Gelap", icon: "Moon" }, { v: "light", label: "Terang", icon: "Sun" }]} />
              </Row>
              <Row title="Kepadatan" sub="Jarak antar elemen">
                <Segmented value={gen.density} onChange={(v) => setGen({ ...gen, density: v })} options={[{ v: "comfortable", label: "Nyaman" }, { v: "compact", label: "Padat" }]} />
              </Row>
              <Row title="Pratinjau tema">
                <div style={{ display: "flex", gap: 8 }}>
                  {["dark", "light"].map((m) => (
                    <div key={m} onClick={() => setTheme(m)} style={{ width: 66, height: 44, borderRadius: 9, cursor: "pointer", border: `2px solid ${theme === m ? T.sky : T.line}`, overflow: "hidden", background: m === "dark" ? "#04203a" : "#EEF3F8", position: "relative" }}>
                      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 16, background: m === "dark" ? "#022747" : "#fff", borderRight: `1px solid ${m === "dark" ? "rgba(255,255,255,0.1)" : "rgba(4,54,102,0.1)"}` }} />
                      <div style={{ position: "absolute", left: 22, top: 8, width: 30, height: 6, borderRadius: 3, background: "#4AB3D8" }} />
                      <div style={{ position: "absolute", left: 22, top: 19, width: 36, height: 4, borderRadius: 2, background: m === "dark" ? "rgba(255,255,255,0.18)" : "rgba(4,54,102,0.15)" }} />
                      <div style={{ position: "absolute", left: 22, top: 27, width: 22, height: 4, borderRadius: 2, background: m === "dark" ? "rgba(255,255,255,0.12)" : "rgba(4,54,102,0.1)" }} />
                    </div>
                  ))}
                </div>
              </Row>
            </div>
          </Panel>

          <Panel>
            <PanelHead title="Bahasa & Wilayah" sub="Bahasa antarmuka & format" icon="Languages" />
            <div style={{ padding: "4px 18px 16px" }}>
              <Row title="Bahasa antarmuka" sub="Hybrid memakai istilah industri (EN); Full ID menerjemahkan semua menu">
                <Segmented value={lang} onChange={setLang} options={[{ v: "id", label: "Full Indonesia" }, { v: "hybrid", label: "Hybrid" }]} />
              </Row>
              <Row title="Mata uang" sub="Format tampilan nilai"><span style={{ fontSize: 12, fontWeight: 700, color: T.txt, fontFamily: T.mono }}>IDR · Rp</span></Row>
              <Row title="Zona waktu"><span style={{ fontSize: 12, fontWeight: 700, color: T.txt }}>WIB (GMT+7)</span></Row>
              <Row title="Awal minggu">
                <Segmented value={gen.weekStart} onChange={(v) => setGen({ ...gen, weekStart: v })} options={[{ v: "mon", label: "Senin" }, { v: "sun", label: "Minggu" }]} />
              </Row>
            </div>
          </Panel>

          <Panel style={{ gridColumn: "1 / -1" }}>
            <PanelHead title="Preferensi Dashboard" sub="Perilaku umum command center" icon="LayoutDashboard" />
            <div style={{ padding: "4px 18px 16px" }}>
              <Row title="Auto-refresh data realtime" sub="Tarik update dari Supabase setiap 30 detik"><Toggle on={gen.autoRefresh} onChange={(v) => setGen({ ...gen, autoRefresh: v })} /></Row>
              <Row title="Suara notifikasi" sub="Bunyi saat lead/pembayaran masuk"><Toggle on={gen.sound} onChange={(v) => setGen({ ...gen, sound: v })} /></Row>
              <Row title="Halaman default saat login"><span style={{ fontSize: 12, fontWeight: 700, color: T.txt }}>{tr("Command Center")}</span></Row>
            </div>
          </Panel>
        </div>
      )}

      {/* ── AI AGENT ── */}
      {tab === "ai" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, alignItems: "start" }}>
          <div style={{ display: "grid", gap: 16 }}>
            <Panel>
              <PanelHead title="System Prompt — Syifa" sub="Instruksi inti yang mengatur cara AI menjawab" icon="FileCode" accent={T.tint}
                right={<Tag color={T.green}><Dot color={T.green} pulse size={6} />Aktif</Tag>} />
              <div style={{ padding: 18 }}>
                <textarea value={cfg.systemPrompt} onChange={(e) => setCfg({ ...cfg, systemPrompt: e.target.value })}
                  style={{ width: "100%", minHeight: 280, background: T.inset, border: `1px solid ${T.line}`, borderRadius: 10, padding: 14, color: T.txt, fontFamily: T.mono, fontSize: 11.5, lineHeight: 1.65, resize: "vertical", outline: "none" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                  <span style={{ fontSize: 10.5, color: T.dim }}>{cfg.systemPrompt.length} karakter · perubahan diterapkan ke WF-1 & WF-2</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn v="ghost" size="sm" icon="RotateCcw" onClick={() => setCfg({ ...cfg, systemPrompt: D.aiConfig.systemPrompt })}>Reset</Btn>
                    <Btn v="primary" size="sm" icon="Save">Simpan & Deploy</Btn>
                  </div>
                </div>
              </div>
            </Panel>
            <Panel>
              <PanelHead title="Persona & Gaya Bahasa" icon="Drama" />
              <div style={{ padding: 18 }}>
                <textarea value={cfg.persona} onChange={(e) => setCfg({ ...cfg, persona: e.target.value })}
                  style={{ width: "100%", minHeight: 70, background: T.inset, border: `1px solid ${T.line}`, borderRadius: 10, padding: 13, color: T.sub, fontFamily: T.font, fontSize: 12, lineHeight: 1.6, resize: "vertical", outline: "none" }} />
              </div>
            </Panel>
          </div>

          <div style={{ display: "grid", gap: 16 }}>
            <Panel>
              <PanelHead title="Model & Parameter" sub="Groq inference engine" icon="Cpu" />
              <div style={{ padding: "4px 18px 16px" }}>
                <Row title="Provider"><Tag color={T.sky}>{cfg.provider}</Tag></Row>
                <Row title="Model"><span style={{ fontSize: 11, fontWeight: 700, color: T.txt, fontFamily: T.mono }}>{cfg.model}</span></Row>
                <Row title="Temperature" sub="Rendah = konsisten · tinggi = kreatif">
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input type="range" min="0" max="1" step="0.1" value={cfg.temperature} onChange={(e) => setCfg({ ...cfg, temperature: parseFloat(e.target.value) })} style={{ width: 110, accentColor: T.sky }} />
                    <span style={{ fontSize: 12, fontWeight: 800, color: T.tint, fontFamily: T.mono, width: 26 }}>{cfg.temperature.toFixed(1)}</span>
                  </div>
                </Row>
                <Row title="Max tokens / balasan"><span style={{ fontSize: 12, fontWeight: 700, color: T.txt, fontFamily: T.mono }}>{cfg.maxTokens}</span></Row>
              </div>
            </Panel>
            <Panel>
              <PanelHead title="Perilaku & Eskalasi" icon="GitBranch" />
              <div style={{ padding: "4px 18px 16px" }}>
                <Row title="Auto-reply" sub="AI balas otomatis tanpa tunggu staf"><Toggle on={cfg.autoReply} onChange={(v) => setCfg({ ...cfg, autoReply: v })} /></Row>
                <Row title="Jam operasi"><span style={{ fontSize: 12, fontWeight: 700, color: T.txt }}>{cfg.workingHours}</span></Row>
                <Row title="Eskalasi bila skor <" sub="Alihkan ke manusia (WF-6)"><span style={{ fontSize: 13, fontWeight: 800, color: T.amber, fontFamily: T.mono }}>{cfg.escalateScoreBelow}</span></Row>
                <div style={{ paddingTop: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.sub, marginBottom: 8 }}>Kata kunci handoff ke manusia</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {cfg.handoffKeywords.map((k, i) => <Tag key={i} color={T.tint}>{k}</Tag>)}
                    <span style={{ fontSize: 11, color: T.sky, cursor: "pointer", alignSelf: "center" }}>+ tambah</span>
                  </div>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      )}

      {/* ── INTEGRASI ── */}
      {tab === "integrasi" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16, maxWidth: 1100 }}>
          {D.integrations.map((it) => (
            <Panel key={it.key} pad={0}>
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.line}`, display: "flex", alignItems: "center", gap: 11 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${it.color}1f`, display: "grid", placeItems: "center" }}><Icon name={it.icon} size={18} color={it.color} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: T.txt }}>{it.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}><Dot color={stC[it.status]} pulse={it.status === "connected"} size={6} /><span style={{ fontSize: 10.5, color: stC[it.status], fontWeight: 600 }}>{stL[it.status]}</span></div>
                </div>
                <Btn v={it.status === "disconnected" ? "primary" : "ghost"} size="sm" icon={it.status === "disconnected" ? "Plug" : "Settings2"}>{it.status === "disconnected" ? "Hubungkan" : "Kelola"}</Btn>
              </div>
              <div style={{ padding: 16, display: "flex", flexWrap: "wrap", gap: 12 }}>
                {it.fields.map(([l, v], i) => <Field key={i} label={l} value={v} mask={/key|token/i.test(l)} />)}
              </div>
            </Panel>
          ))}
        </div>
      )}

      {/* ── NOTIFIKASI ── */}
      {tab === "notif" && (
        <Panel style={{ maxWidth: 720 }}>
          <PanelHead title="Preferensi Notifikasi" sub="Kanal & jenis peringatan" icon="Bell" />
          <div style={{ padding: "4px 18px 16px" }}>
            {[["Lead baru masuk", "Saat lead masuk via WA/IG/Web", true], ["Lead HOT (skor > 85)", "Prioritas tinggi siap closing", true], ["Proposal disetujui", "Memicu SPK & invoice otomatis", true], ["Invoice jatuh tempo / overdue", "Reminder pembayaran", true], ["Workflow n8n gagal", "Peringatan dari Automation Center", true], ["AI dialihkan ke manusia", "Saat WF-6 aktif untuk sebuah chat", false], ["Ringkasan harian", "Rekap operasional tiap pagi 08:00", true]].map(([t, s, on], i) => (
              <Row key={i} title={t} sub={s}><Toggle on={on} onChange={() => {}} /></Row>
            ))}
            <div style={{ paddingTop: 16, display: "flex", gap: 10 }}>
              <Tag color={T.green}><Icon name="MessageCircle" size={11} color={T.green} />WhatsApp</Tag>
              <Tag color={T.sky}><Icon name="Mail" size={11} color={T.sky} />Email</Tag>
              <Tag color={T.tint}><Icon name="Monitor" size={11} color={T.tint} />In-app</Tag>
            </div>
          </div>
        </Panel>
      )}

      {/* ── TIM & PERAN ── */}
      {tab === "tim" && (
        <Panel style={{ maxWidth: 820 }}>
          <PanelHead title="Tim & Hak Akses (RBAC)" sub="Peran menentukan modul yang dapat diakses" icon="Users" />
          <div style={{ padding: "6px 0" }}>
            {D.team.map((m, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 18px", borderBottom: i < D.team.length - 1 ? `1px solid ${T.line}` : "none" }}>
                <Avatar initials={m.initials} color={m.color} size={38} bot={m.bot} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.txt }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: T.dim }}>{m.role}</div>
                </div>
                <Tag color={m.bot ? T.tint : i === 0 ? T.sky : T.sub}>{m.bot ? "AI · Otomasi" : i === 0 ? "Owner · Full" : i === 1 ? "Architect" : "Staff"}</Tag>
                {!m.bot && <Btn v="ghost" size="sm" icon="Pencil" />}
              </div>
            ))}
          </div>
          <div style={{ padding: "14px 18px", borderTop: `1px solid ${T.line}` }}>
            <Btn v="primary" size="sm" icon="UserPlus">Undang anggota tim</Btn>
          </div>
        </Panel>
      )}
    </div>
  );
}

Object.assign(window, { PALETTES, applyTheme, tr, SettingsPage, Segmented, Toggle });
