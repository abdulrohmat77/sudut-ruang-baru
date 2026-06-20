/* ACOS — Command Center (home) */
function FlowStrip({ setPage, compact = true }) {
  const D = window.ACOS_DATA;
  const counts = { lead: 8, crm: 5, ai: 4, estimate: 3, proposal: 3, spk: 2, invoice: 6, payment: 4, project: 8, portfolio: 17 };
  const [pulse, setPulse] = useState(0);
  useEffect(() => { const t = setInterval(() => setPulse((p) => (p + 1) % D.FLOW.length), 1100); return () => clearInterval(t); }, []);
  return (
    <Panel style={{ gridColumn: "1 / -1" }}>
      <PanelHead title="Operations Flow" sub="Lead → CRM → AI → Estimasi → Proposal → SPK → Invoice → Payment → Project → Portfolio" icon="Workflow"
        right={<Btn v="sky" size="sm" icon="Maximize2" onClick={() => setPage("Operations Flow")}>Buka Flow</Btn>} />
      <div style={{ display: "flex", alignItems: "stretch", padding: "18px 16px", gap: 0, overflowX: "auto" }}>
        {D.FLOW.map((s, i) => (
          <React.Fragment key={s.key}>
            <div onClick={() => setPage("Operations Flow")} style={{ flex: 1, minWidth: 92, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer", position: "relative" }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, display: "grid", placeItems: "center", position: "relative",
                background: pulse === i ? "rgba(74,179,216,0.22)" : "rgba(255,255,255,0.04)", border: `1px solid ${pulse === i ? T.sky : T.line}`, transition: "all .4s", transform: pulse === i ? "scale(1.08)" : "none" }}>
                <Icon name={s.icon} size={19} color={pulse === i ? T.sky : T.sub} />
                <div style={{ position: "absolute", top: -7, right: -7, minWidth: 18, height: 18, padding: "0 5px", borderRadius: 9, background: T.navy700, border: `1px solid ${T.sky}55`, display: "grid", placeItems: "center", fontSize: 9.5, fontWeight: 800, color: T.tint }}>{counts[s.key]}</div>
              </div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: pulse === i ? T.txt : T.sub, textAlign: "center" }}>{s.label}</div>
            </div>
            {i < D.FLOW.length - 1 && <div style={{ alignSelf: "flex-start", marginTop: 22, color: T.dim, flexShrink: 0 }}><Icon name="ChevronRight" size={15} color={pulse === i ? T.sky : T.dim} /></div>}
          </React.Fragment>
        ))}
      </div>
    </Panel>
  );
}

function AutomationCard({ setPage }) {
  const D = window.ACOS_DATA;
  const health = Math.round(D.workflows.reduce((s, w) => s + w.success, 0) / D.workflows.length * 10) / 10;
  return (
    <Panel>
      <PanelHead title="Automation Health" sub="n8n · srv1696073.hstgr.cloud" icon="Workflow" accent={T.green}
        right={<Tag color={T.green}><Dot color={T.green} pulse size={6} />LIVE</Tag>} />
      <div style={{ display: "flex", gap: 14, padding: "16px 18px", alignItems: "center", borderBottom: `1px solid ${T.line}` }}>
        <Ring value={Math.round(health)} size={68} color={T.green} label="uptime" />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: T.dim }}>Workflow aktif</span><span style={{ fontSize: 11, fontWeight: 700, color: T.txt }}>6 / 6</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: T.dim }}>Run / 24 jam</span><span style={{ fontSize: 11, fontWeight: 700, color: T.txt }}>3.352</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: T.dim }}>Avg latency</span><span style={{ fontSize: 11, fontWeight: 700, color: T.sky }}>0.7 s</span>
          </div>
        </div>
      </div>
      <div style={{ padding: "8px 10px" }}>
        {D.workflows.slice(0, 4).map((w) => (
          <div key={w.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 8px", borderRadius: 8 }}>
            <Dot color={w.success > 99 ? T.green : T.amber} pulse={w.success > 99} size={7} />
            <div style={{ flex: 1, minWidth: 0, fontSize: 11.5, fontWeight: 600, color: T.sub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.name}</div>
            <span style={{ fontFamily: T.mono, fontSize: 10, color: w.success > 99 ? T.green : T.amber }}>{w.success}%</span>
          </div>
        ))}
      </div>
      <div style={{ padding: "4px 14px 14px" }}>
        <Btn v="ghost" size="sm" icon="ArrowRight" onClick={() => setPage("Automation Center")} style={{ width: "100%", justifyContent: "center" }}>Buka Automation Center</Btn>
      </div>
    </Panel>
  );
}

function AttentionCard({ setPage }) {
  const items = [
    { icon: "Receipt", color: T.red, title: "Invoice INV-061 jatuh tempo +12 hari", sub: "Royal Palace · Rp 260 jt — kirim reminder WA", page: "Finance & Payments" },
    { icon: "Flame", color: T.amber, title: "3 lead HOT menunggu follow-up", sub: "Budi S., Dr. Lavana, CV Mitra Bangun", page: "CRM & Leads" },
    { icon: "AlertTriangle", color: T.amber, title: "Royal Palace — Final Docs 94% · risiko tinggi", sub: "Deadline 18 Jun · butuh review CEO", page: "Projects" },
    { icon: "FileCheck", color: T.sky, title: "SPK CV Mitra Bangun siap e-sign", sub: "Proposal disetujui · generate SPK otomatis", page: "Operations Flow" },
  ];
  return (
    <Panel>
      <PanelHead title="Perlu Perhatian" sub="Prioritas hari ini" icon="Bell" accent={T.amber} right={<Tag color={T.amber}>4</Tag>} />
      <div style={{ padding: 8 }}>
        {items.map((it, i) => (
          <div key={i} onClick={() => setPage(it.page)} className="ac-row" style={{ display: "flex", gap: 11, padding: "10px 10px", borderRadius: 9, cursor: "pointer" }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: `${it.color}1c`, display: "grid", placeItems: "center" }}><Icon name={it.icon} size={15} color={it.color} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.txt, lineHeight: 1.3 }}>{it.title}</div>
              <div style={{ fontSize: 10.5, color: T.dim, marginTop: 2 }}>{it.sub}</div>
            </div>
            <Icon name="ChevronRight" size={15} color={T.dim} style={{ alignSelf: "center" }} />
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ActivityFeed() {
  const D = window.ACOS_DATA;
  const kindC = { ok: T.green, warn: T.amber, info: T.sky };
  return (
    <Panel>
      <PanelHead title="Aktivitas Live" sub="Lintas modul & automasi" icon="Activity" right={<Tag color={T.sky}><Dot color={T.sky} pulse size={6} />REALTIME</Tag>} />
      <div style={{ padding: "6px 14px 14px", maxHeight: 240, overflowY: "auto" }}>
        {D.autoFeed.map((e, i) => (
          <div key={i} style={{ display: "flex", gap: 11, padding: "9px 0", borderBottom: i < D.autoFeed.length - 1 ? `1px solid ${T.line}` : "none" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 2 }}>
              <Dot color={kindC[e.kind]} size={7} />
              {i < D.autoFeed.length - 1 && <div style={{ width: 1, flex: 1, background: T.line, marginTop: 4 }} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11.5, color: T.sub, lineHeight: 1.4 }}>{e.msg}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 3, alignItems: "center" }}>
                <span style={{ fontFamily: T.mono, fontSize: 9.5, color: T.sky }}>{e.wf}</span>
                <span style={{ fontSize: 9.5, color: T.dim }}>· {e.t}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ProjectsMini({ setPage }) {
  const D = window.ACOS_DATA;
  return (
    <Panel>
      <PanelHead title="Proyek Aktif" sub={`${D.projects.length} berjalan · Rp 20.4 M nilai kontrak`} icon="Kanban"
        right={<Btn v="ghost" size="sm" icon="ArrowRight" onClick={() => setPage("Projects")}>Semua</Btn>} />
      <div style={{ padding: "6px 0" }}>
        {D.projects.slice(0, 5).map((p) => (
          <div key={p.id} onClick={() => setPage("Projects")} className="ac-row" style={{ display: "flex", alignItems: "center", gap: 13, padding: "11px 18px", cursor: "pointer" }}>
            <Ring value={p.progress} size={42} stroke={5} color={statusColor[p.risk]} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: T.txt, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
              <div style={{ fontSize: 10.5, color: T.dim, marginTop: 2 }}>{p.client} · {p.loc}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <Tag color={T.sky}>{p.stage}</Tag>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.sub, marginTop: 5, fontFamily: T.mono }}>{D.fmtRp(p.value)}</div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function CommandCenter({ setPage, user }) {
  const D = window.ACOS_DATA;
  const f = D.fmtRp;
  const kpis = [
    { label: "Pipeline Value", value: f(D.kpis.pipelineValue), delta: "+24%", icon: "Target", accent: T.sky, spark: D.trend.slice(-7) },
    { label: "Proyek Aktif", value: D.kpis.activeProjects, delta: "+2", icon: "Kanban", accent: T.tint, spark: [4, 5, 5, 6, 7, 7, 8] },
    { label: "Revenue Bulan Ini", value: f(D.kpis.monthRevenue), delta: "+28%", icon: "TrendingUp", accent: T.green, spark: D.revenueBars.map((b) => b.v) },
    { label: "Piutang (AR)", value: f(D.kpis.arOutstanding), delta: "-8%", deltaUp: false, icon: "Receipt", accent: T.amber, spark: [4, 3.6, 3.9, 3.4, 3.3, 3.2] },
    { label: "Lead Bulan Ini", value: D.kpis.leadsMonth, delta: "+19%", icon: "Inbox", accent: T.sky, spark: [38, 44, 41, 52, 58, 64] },
    { label: "Win Rate", value: D.kpis.winRate + "%", delta: "+5pt", icon: "Award", accent: T.green, spark: [28, 31, 30, 34, 36, 38] },
  ];
  const hour = new Date().getHours();
  const greet = hour < 11 ? "Selamat pagi" : hour < 15 ? "Selamat siang" : hour < 19 ? "Selamat sore" : "Selamat malam";
  return (
    <div style={{ padding: 22, overflowY: "auto", height: "100%" }}>
      {/* hero */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 14 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: T.txt, margin: 0, letterSpacing: -0.6 }}>{greet}, {user.name.split(" ")[0]}.</h1>
            <Tag color={T.green}><Dot color={T.green} pulse size={6} />Studio beroperasi normal</Tag>
          </div>
          <div style={{ fontSize: 13, color: T.dim, marginTop: 6 }}>Selasa, 3 Juni 2026 · Berikut ringkasan operasional Sudut Ruang Arsitek hari ini.</div>
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <Btn v="ghost" size="sm" icon="Calculator" onClick={() => setPage("AI Estimator")}>Estimasi</Btn>
          <Btn v="ghost" size="sm" icon="FileText" onClick={() => setPage("Proposals")}>Proposal</Btn>
          <Btn v="primary" size="sm" icon="Plus" onClick={() => setPage("CRM & Leads")}>Lead Baru</Btn>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 14, marginBottom: 16 }}>
        {kpis.map((k, i) => <Stat key={i} {...k} />)}
      </div>

      <FlowStrip setPage={setPage} />

      {/* main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, marginTop: 16, alignItems: "start" }}>
        <div style={{ display: "grid", gap: 16 }}>
          <Panel>
            <PanelHead title="Pipeline & Revenue" sub="12 minggu terakhir · proyeksi closing" icon="BarChart3"
              right={<div style={{ display: "flex", gap: 6 }}><Tag color={T.sky}>Pipeline</Tag><Tag color={T.green}>Revenue</Tag></div>} />
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 0 }}>
              <div style={{ padding: "18px", borderRight: `1px solid ${T.line}` }}>
                <div style={{ fontSize: 11, color: T.dim, marginBottom: 4 }}>Nilai pipeline aktif</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: T.txt, marginBottom: 12 }}>{f(D.kpis.pipelineValue)}</div>
                <Spark data={D.trend} color={T.sky} w={340} h={90} />
              </div>
              <div style={{ padding: "18px" }}>
                <div style={{ fontSize: 11, color: T.dim, marginBottom: 10 }}>Revenue 6 bulan (Rp M)</div>
                <Bars data={D.revenueBars} h={110} fmt={(v) => v.toFixed(1)} />
              </div>
            </div>
          </Panel>
          <ProjectsMini setPage={setPage} />
        </div>
        <div style={{ display: "grid", gap: 16 }}>
          <AutomationCard setPage={setPage} />
          <AttentionCard setPage={setPage} />
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
Object.assign(window, { CommandCenter, FlowStrip });
