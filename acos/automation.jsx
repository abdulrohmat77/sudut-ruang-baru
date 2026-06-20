/* ACOS — Automation Center (n8n monitoring) */
function NodeMap({ wf }) {
  const nodeIcon = (n) => {
    const s = n.toLowerCase();
    if (s.includes("webhook")) return "Webhook";
    if (s.includes("cron") || s.includes("schedule")) return "Clock";
    if (s.includes("groq") || s.includes("llm") || s.includes("compose") || s.includes("ai")) return "Sparkles";
    if (s.includes("supabase") || s.includes("upsert") || s.includes("insert") || s.includes("read") || s.includes("get")) return "Database";
    if (s.includes("whatsapp") || s.includes("reply") || s.includes("send")) return "MessageSquare";
    if (s.includes("sheet")) return "Table";
    if (s.includes("switch") || s.includes("route") || s.includes("scorer") || s.includes("parse") || s.includes("calc") || s.includes("lookup") || s.includes("reconcile")) return "GitBranch";
    if (s.includes("notify") || s.includes("alert")) return "Bell";
    if (s.includes("assert") || s.includes("respond") || s.includes("ping")) return "CircleCheck";
    return "Box";
  };
  return (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0, padding: "20px 18px" }}>
      {wf.nodes.map((n, i) => (
        <React.Fragment key={i}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, width: 96 }}>
            <div style={{ width: 50, height: 50, borderRadius: 13, background: "rgba(74,179,216,0.1)", border: `1px solid ${T.sky}44`, display: "grid", placeItems: "center", position: "relative" }}>
              <Icon name={nodeIcon(n)} size={20} color={T.sky} />
              <div style={{ position: "absolute", bottom: -4, right: -4 }}><Dot color={T.green} size={8} /></div>
            </div>
            <div style={{ fontSize: 9.5, color: T.sub, textAlign: "center", lineHeight: 1.25, fontWeight: 600 }}>{n}</div>
          </div>
          {i < wf.nodes.length - 1 && (
            <div style={{ width: 30, marginTop: -22, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="30" height="10"><line x1="0" y1="5" x2="24" y2="5" stroke={T.sky} strokeWidth="1.6" strokeDasharray="3 3" /><path d="M24 1 L29 5 L24 9" fill="none" stroke={T.sky} strokeWidth="1.6" /></svg>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function AutomationCenter() {
  const D = window.ACOS_DATA;
  const [sel, setSel] = useState(D.workflows[1]);
  const [tab, setTab] = useState("nodes");
  const totalRuns = D.workflows.reduce((s, w) => s + w.runs24, 0);
  const kindC = { ok: T.green, warn: T.amber, info: T.sky, error: T.red };
  const execs = [
    { id: "exec_9f2a1", wf: "WF-1", status: "success", ms: 1180, t: "12 dtk" },
    { id: "exec_9f2a0", wf: "WF-PING", status: "success", ms: 88, t: "31 dtk" },
    { id: "exec_9f29f", wf: "WF-2", status: "success", ms: 2040, t: "3 mnt" },
    { id: "exec_9f29e", wf: "WF-4", status: "success", ms: 520, t: "5 mnt" },
    { id: "exec_9f29d", wf: "WF-2", status: "retry", ms: 4100, t: "16 mnt" },
    { id: "exec_9f29c", wf: "WF-6", status: "success", ms: 205, t: "22 mnt" },
    { id: "exec_9f29b", wf: "WF-1", status: "success", ms: 1320, t: "24 mnt" },
  ];
  const head = [
    { l: "Workflow Aktif", v: "6", icon: "Workflow", c: T.green },
    { l: "Eksekusi / 24j", v: totalRuns.toLocaleString("id-ID"), icon: "Activity", c: T.sky },
    { l: "Success Rate", v: "99.2%", icon: "CircleCheck", c: T.green },
    { l: "Avg Latency", v: "0.7s", icon: "Zap", c: T.tint },
    { l: "Error 24j", v: "3", icon: "TriangleAlert", c: T.amber },
    { l: "Antrian", v: "0", icon: "ListChecks", c: T.green },
  ];
  return (
    <div style={{ padding: 22, height: "100%", overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: T.txt, margin: 0 }}>Automation Center</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <Dot color={T.green} pulse size={7} /><span style={{ fontFamily: T.mono, fontSize: 11, color: T.sub }}>n8n.srv1696073.hstgr.cloud</span>
            <Tag color={T.green}>CONNECTED</Tag>
          </div>
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <Btn v="ghost" size="sm" icon="RefreshCw">Refresh</Btn>
          <Btn v="ghost" size="sm" icon="FileText">Logs</Btn>
          <Btn v="primary" size="sm" icon="ExternalLink">Buka n8n</Btn>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12, marginBottom: 16 }}>
        {head.map((h, i) => (
          <Panel key={i} pad={14}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 10, color: T.dim, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{h.l}</span>
              <Icon name={h.icon} size={15} color={h.c} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: T.txt, marginTop: 8 }}>{h.v}</div>
          </Panel>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.35fr", gap: 16, alignItems: "start" }}>
        {/* workflow list */}
        <Panel>
          <PanelHead title="Workflows" sub="6 published · Sudut Ruang" icon="Workflow" />
          <div style={{ padding: 8 }}>
            {D.workflows.map((w) => {
              const on = sel.id === w.id;
              return (
                <div key={w.id} onClick={() => setSel(w)} style={{ padding: "12px 12px", borderRadius: 11, cursor: "pointer", marginBottom: 4, background: on ? "rgba(74,179,216,0.12)" : "transparent", border: `1px solid ${on ? T.sky + "55" : "transparent"}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
                    <Dot color={w.success > 99 ? T.green : T.amber} pulse={w.success > 99} size={7} />
                    <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: on ? T.txt : T.sub }}>{w.name}</span>
                    <Tag color={T.tint} style={{ fontSize: 9 }}>{w.trigger}</Tag>
                  </div>
                  <div style={{ display: "flex", gap: 16, paddingLeft: 16 }}>
                    {[["Runs 24j", w.runs24.toLocaleString("id-ID")], ["Success", w.success + "%"], ["Avg", w.avgMs + "ms"]].map(([l, v], i) => (
                      <div key={i}><div style={{ fontSize: 8.5, color: T.dim, textTransform: "uppercase", letterSpacing: 0.4 }}>{l}</div><div style={{ fontSize: 11.5, fontWeight: 700, color: T.txt, fontFamily: T.mono }}>{v}</div></div>
                    ))}
                    <div style={{ marginLeft: "auto", fontSize: 9.5, color: T.dim, alignSelf: "flex-end" }}>{w.lastRun}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        {/* detail */}
        <div style={{ display: "grid", gap: 16 }}>
          <Panel>
            <PanelHead title={sel.name} sub={sel.desc} icon="GitBranch"
              right={<div style={{ display: "flex", gap: 8 }}>{["nodes", "webhook", "runs"].map((t) => (
                <button key={t} onClick={() => setTab(t)} style={{ padding: "5px 11px", borderRadius: 7, border: `1px solid ${tab === t ? T.sky + "55" : T.line}`, background: tab === t ? "rgba(74,179,216,0.14)" : "transparent", color: tab === t ? T.sky : T.dim, fontSize: 10.5, fontWeight: 700, cursor: "pointer", fontFamily: T.font, textTransform: "capitalize" }}>{t}</button>
              ))}</div>} />
            {tab === "nodes" && <div style={{ overflowX: "auto" }}><NodeMap wf={sel} /></div>}
            {tab === "webhook" && (
              <div style={{ padding: 18 }}>
                <div style={{ fontSize: 10.5, color: T.dim, fontWeight: 700, letterSpacing: 0.5, marginBottom: 8 }}>WEBHOOK CONTRACT</div>
                <div style={{ background: T.inset, border: `1px solid ${T.line}`, borderRadius: 10, padding: 14, fontFamily: T.mono, fontSize: 11.5, color: T.sub, lineHeight: 1.7 }}>
                  <div><span style={{ color: T.green }}>POST</span> <span style={{ color: T.tint }}>/webhook/{sel.id.toLowerCase()}</span></div>
                  <div style={{ color: T.dim }}>Content-Type: application/json</div>
                  <div style={{ color: T.dim }}>x-acos-signature: hmac-sha256</div>
                  <div style={{ marginTop: 8, color: T.txt }}>{`{`}</div>
                  <div style={{ paddingLeft: 16 }}><span style={{ color: T.sky }}>"event"</span>: <span style={{ color: T.amber }}>"{sel.id === "WF-1" ? "message.incoming" : sel.id === "WF-2" ? "estimate.request" : "sync.tick"}"</span>,</div>
                  <div style={{ paddingLeft: 16 }}><span style={{ color: T.sky }}>"lead_id"</span>: <span style={{ color: T.amber }}>"L-2041"</span>,</div>
                  <div style={{ paddingLeft: 16 }}><span style={{ color: T.sky }}>"payload"</span>: {`{ … }`}</div>
                  <div style={{ color: T.txt }}>{`}`}</div>
                </div>
                <div style={{ display: "flex", gap: 18, marginTop: 14 }}>
                  {[["Auth", "HMAC + Bearer"], ["Retry", "3× exp. backoff"], ["Timeout", "30s"], ["Idempotency", "event_id"]].map(([l, v], i) => (
                    <div key={i}><div style={{ fontSize: 9, color: T.dim, textTransform: "uppercase" }}>{l}</div><div style={{ fontSize: 11.5, color: T.txt, fontWeight: 700, marginTop: 2 }}>{v}</div></div>
                  ))}
                </div>
              </div>
            )}
            {tab === "runs" && (
              <div style={{ padding: "10px 12px" }}>
                {execs.filter((e) => e.wf === sel.id || sel.id.includes(e.wf)).concat(execs).slice(0, 6).map((e, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 8px", borderBottom: `1px solid ${T.line}` }}>
                    <Dot color={e.status === "success" ? T.green : e.status === "retry" ? T.amber : T.red} size={7} />
                    <span style={{ fontFamily: T.mono, fontSize: 11, color: T.sub, flex: 1 }}>{e.id}</span>
                    <Tag color={e.status === "success" ? T.green : T.amber} style={{ fontSize: 9 }}>{e.status}</Tag>
                    <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.dim, width: 60, textAlign: "right" }}>{e.ms}ms</span>
                    <span style={{ fontSize: 10, color: T.dim, width: 48, textAlign: "right" }}>{e.t}</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          {/* live executions */}
          <Panel>
            <PanelHead title="Live Execution Log" sub="Streaming dari n8n" icon="Activity" right={<Tag color={T.green}><Dot color={T.green} pulse size={6} />STREAMING</Tag>} />
            <div style={{ padding: "8px 14px 14px", fontFamily: T.mono, fontSize: 11, maxHeight: 180, overflowY: "auto" }}>
              {execs.map((e, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "5px 0", color: T.sub }}>
                  <span style={{ color: T.dim, width: 52 }}>{e.t}</span>
                  <span style={{ color: kindC[e.status === "success" ? "ok" : e.status === "retry" ? "warn" : "error"] }}>[{e.status === "success" ? "OK " : e.status === "retry" ? "RETRY" : "ERR"}]</span>
                  <span style={{ color: T.sky }}>{e.wf}</span>
                  <span style={{ flex: 1, color: T.sub }}>{e.id} · {e.ms}ms</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
Object.assign(window, { AutomationCenter });
