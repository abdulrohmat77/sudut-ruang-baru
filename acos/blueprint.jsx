/* ACOS — Blueprint: audit, architecture, schema, n8n, roadmap */
function Blueprint({ setPage }) {
  const D = window.ACOS_DATA;
  const [tab, setTab] = useState("audit");
  const tabs = [["audit", "Audit", "ClipboardCheck"], ["arch", "Architecture", "Boxes"], ["schema", "Database", "Database"], ["n8n", "n8n Workflows", "Workflow"], ["roadmap", "Roadmap", "Map"]];
  return (
    <div style={{ padding: 22, height: "100%", overflowY: "auto" }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: T.txt, margin: 0 }}>Blueprint Teknis</h1>
        <div style={{ fontSize: 13, color: T.dim, marginTop: 6 }}>Audit, arsitektur, skema database, automasi n8n & roadmap menuju enterprise.</div>
      </div>

      <div style={{ display: "flex", gap: 7, marginBottom: 18, flexWrap: "wrap" }}>
        {tabs.map(([k, l, ic]) => (
          <button key={k} onClick={() => setTab(k)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 15px", borderRadius: 10, border: `1px solid ${tab === k ? T.sky + "55" : T.line}`, background: tab === k ? "rgba(74,179,216,0.14)" : T.panel, color: tab === k ? T.sky : T.sub, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: T.font }}>
            <Icon name={ic} size={14} color={tab === k ? T.sky : T.sub} />{l}
          </button>
        ))}
      </div>

      {tab === "audit" && <AuditView D={D} />}
      {tab === "arch" && <ArchView D={D} setPage={setPage} />}
      {tab === "schema" && <SchemaView D={D} />}
      {tab === "n8n" && <N8nView D={D} setPage={setPage} />}
      {tab === "roadmap" && <RoadmapView D={D} />}
    </div>
  );
}

function AuditView({ D }) {
  const sevC = { high: T.red, med: T.amber, low: T.green };
  const sevL = { high: "KRITIS", med: "SEDANG", low: "RINGAN" };
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 16 }}>
        {[["3", "Temuan kritis", T.red], ["3", "Temuan sedang", T.amber], ["1", "Temuan ringan", T.green]].map(([n, l, c], i) => (
          <Panel key={i} pad={16}><div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ fontSize: 30, fontWeight: 800, color: c }}>{n}</div><div style={{ fontSize: 12, color: T.sub, fontWeight: 600 }}>{l}</div></div></Panel>
        ))}
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        {D.audit.map((a, i) => (
          <Panel key={i} pad={0}>
            <div style={{ display: "flex", gap: 0 }}>
              <div style={{ width: 5, background: sevC[a.sev], flexShrink: 0 }} />
              <div style={{ padding: "16px 18px", flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9, flexWrap: "wrap" }}>
                  <Tag color={sevC[a.sev]} solid={a.sev === "high"}>{sevL[a.sev]}</Tag>
                  <Tag color={T.sub}>{a.area}</Tag>
                  <span style={{ fontSize: 14, fontWeight: 700, color: T.txt }}>{a.title}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ display: "flex", gap: 9 }}><Icon name="CircleX" size={15} color={T.red} style={{ marginTop: 1, flexShrink: 0 }} /><div><div style={{ fontSize: 9.5, color: T.dim, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>Masalah</div><div style={{ fontSize: 11.5, color: T.sub, lineHeight: 1.55 }}>{a.finding}</div></div></div>
                  <div style={{ display: "flex", gap: 9 }}><Icon name="CircleCheck" size={15} color={T.green} style={{ marginTop: 1, flexShrink: 0 }} /><div><div style={{ fontSize: 9.5, color: T.dim, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>Solusi ACOS</div><div style={{ fontSize: 11.5, color: T.light, lineHeight: 1.55 }}>{a.fix}</div></div></div>
                </div>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function ArchView({ D, setPage }) {
  const layers = [
    { name: "Presentation — ACOS (React)", color: T.sky, items: ["Command Center", "Operations Flow", "CRM", "Projects", "Finance", "Analytics", "Automation Center"], icon: "MonitorSmartphone" },
    { name: "API & Realtime — Supabase Edge", color: T.tint, items: ["Auth + RBAC", "REST / GraphQL", "Realtime channels", "Row-Level Security", "Storage (PDF/render)"], icon: "Cloud" },
    { name: "Automation — n8n Engine", color: T.green, items: ["WF-0 Dashboard", "WF-1 Incoming+Memory", "WF-2 Auto Estimator", "WF-4 Sync Hub", "WF-6 Toggle Mode", "WF-Ping Health"], icon: "Workflow" },
    { name: "Data — Postgres (Supabase)", color: T.bright, items: ["clients", "leads", "estimates", "proposals", "spk", "invoices", "payments", "projects", "workflow_runs"], icon: "Database" },
    { name: "Integrations", color: T.amber, items: ["WhatsApp Cloud API", "Groq · llama-3.3-70b", "Google Sheets", "Payment Gateway / QRIS", "sudutruang.com"], icon: "Plug" },
  ];
  return (
    <div>
      <Panel style={{ marginBottom: 16 }}>
        <PanelHead title="Arsitektur ACOS — Event-Driven, Automation-First" sub="Satu sumber kebenaran · semua modul membaca data yang sama" icon="Boxes" />
        <div style={{ padding: 20, display: "grid", gap: 12 }}>
          {layers.map((L, i) => (
            <div key={i}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: `${L.color}1f`, display: "grid", placeItems: "center" }}><Icon name={L.icon} size={16} color={L.color} /></div>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.txt }}>{L.name}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, paddingLeft: 40 }}>
                {L.items.map((it, j) => (
                  <span key={j} style={{ fontSize: 11, fontFamily: i >= 2 ? T.mono : T.font, color: T.sub, padding: "5px 11px", borderRadius: 8, background: T.inset, border: `1px solid ${L.color}33` }}>{it}</span>
                ))}
              </div>
              {i < layers.length - 1 && <div style={{ display: "flex", justifyContent: "center", margin: "10px 0 -2px" }}><Icon name="ArrowDown" size={16} color={T.dim} /></div>}
            </div>
          ))}
        </div>
      </Panel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {[["GitBranch", "Event-Driven", "Setiap aksi memancarkan event (proposal.approved → SPK → invoice). Tanpa handoff manual."], ["Database", "Single Source of Truth", "client_id mengalir lintas dokumen via foreign key — nol input ulang."], ["ShieldCheck", "Secure by Design", "RBAC per peran, RLS Supabase, audit trail, webhook bertanda HMAC."]].map(([ic, t, d], i) => (
          <Panel key={i} pad={16}>
            <Icon name={ic} size={20} color={T.sky} />
            <div style={{ fontSize: 13.5, fontWeight: 700, color: T.txt, marginTop: 10 }}>{t}</div>
            <div style={{ fontSize: 11.5, color: T.sub, lineHeight: 1.55, marginTop: 6 }}>{d}</div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function SchemaView({ D }) {
  return (
    <div>
      <Panel style={{ marginBottom: 16 }} pad={16}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name="Database" size={18} color={T.sky} />
          <span style={{ fontSize: 13, color: T.sub }}><b style={{ color: T.txt }}>13 tabel inti</b> di PostgreSQL (Supabase) — dihubungkan foreign key, dilindungi Row-Level Security per peran. Alur dokumen <span style={{ fontFamily: T.mono, color: T.tint }}>leads → estimates → proposals → spk → invoices → payments → projects</span>.</span>
        </div>
      </Panel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {D.schema.map((t, i) => (
          <Panel key={i} pad={0}>
            <div style={{ padding: "12px 14px", borderBottom: `1px solid ${T.line}`, display: "flex", alignItems: "center", gap: 9 }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: `${t.color}1f`, display: "grid", placeItems: "center" }}><Icon name={t.icon} size={14} color={t.color} /></div>
              <span style={{ fontSize: 13, fontWeight: 800, color: T.txt, fontFamily: T.mono }}>{t.name}</span>
            </div>
            <div style={{ padding: "10px 14px" }}>
              <div style={{ fontSize: 10.5, color: T.dim, marginBottom: 10, lineHeight: 1.4 }}>{t.desc}</div>
              {t.cols.map(([col, type], j) => (
                <div key={j} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: j < t.cols.length - 1 ? `1px solid ${T.line}` : "none" }}>
                  <span style={{ fontFamily: T.mono, fontSize: 10.5, color: type.includes("PK") ? T.tint : type.includes("fk") ? T.sky : T.sub, fontWeight: type.includes("PK") ? 700 : 500 }}>{col}</span>
                  <span style={{ fontFamily: T.mono, fontSize: 9.5, color: T.dim }}>{type}</span>
                </div>
              ))}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function N8nView({ D, setPage }) {
  return (
    <div>
      <Panel style={{ marginBottom: 16 }} pad={16}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name="Workflow" size={18} color={T.green} />
            <span style={{ fontSize: 13, color: T.sub }}><b style={{ color: T.txt }}>6 workflow produksi</b> di instance n8n — terhubung WhatsApp, Groq & Supabase.</span>
          </div>
          <Btn v="sky" size="sm" icon="ArrowUpRight" onClick={() => setPage("Automation Center")}>Monitor live</Btn>
        </div>
      </Panel>
      <div style={{ display: "grid", gap: 12 }}>
        {D.workflows.map((w) => (
          <Panel key={w.id} pad={0}>
            <div style={{ padding: "13px 16px", borderBottom: `1px solid ${T.line}`, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <Dot color={T.green} pulse size={7} />
              <span style={{ fontSize: 13, fontWeight: 700, color: T.txt }}>{w.name}</span>
              <Tag color={T.tint} style={{ fontSize: 9 }}>{w.trigger}</Tag>
              <span style={{ marginLeft: "auto", fontFamily: T.mono, fontSize: 10.5, color: T.dim }}>{w.runs24.toLocaleString("id-ID")} runs/24j · {w.success}%</span>
            </div>
            <div style={{ padding: "14px 16px" }}>
              <div style={{ fontSize: 11.5, color: T.sub, marginBottom: 12, lineHeight: 1.5 }}>{w.desc}</div>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 0 }}>
                {w.nodes.map((n, i) => (
                  <React.Fragment key={i}>
                    <span style={{ fontFamily: T.mono, fontSize: 10, color: T.tint, padding: "5px 10px", borderRadius: 7, background: T.inset, border: `1px solid ${T.sky}33` }}>{n}</span>
                    {i < w.nodes.length - 1 && <Icon name="ChevronRight" size={13} color={T.dim} style={{ margin: "0 2px" }} />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function RoadmapView({ D }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
      {D.roadmap.map((p, i) => (
        <Panel key={i} pad={0}>
          <div style={{ padding: "16px 18px", borderBottom: `1px solid ${T.line}`, borderTop: `3px solid ${p.color}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: T.txt }}>{p.phase}</span>
              <Tag color={p.color}>{p.tag}</Tag>
            </div>
            <div style={{ fontSize: 11.5, color: T.sub, marginTop: 8, lineHeight: 1.5 }}>{p.goal}</div>
          </div>
          <div style={{ padding: "12px 18px 16px" }}>
            {p.items.map((it, j) => (
              <div key={j} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", borderBottom: j < p.items.length - 1 ? `1px solid ${T.line}` : "none" }}>
                <div style={{ width: 18, height: 18, borderRadius: 6, background: `${p.color}1f`, display: "grid", placeItems: "center", marginTop: 1, flexShrink: 0 }}><Icon name="Check" size={11} color={p.color} /></div>
                <span style={{ fontSize: 11.5, color: T.light, lineHeight: 1.45 }}>{it}</span>
              </div>
            ))}
          </div>
        </Panel>
      ))}
    </div>
  );
}
Object.assign(window, { Blueprint });
