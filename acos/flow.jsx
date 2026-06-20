/* ACOS — Operations Flow (Lead → Portfolio, animated, event-driven) */
const FLOW_META = {
  lead: { module: "Inbox / Channels", creates: "leads", engine: "WF-1 · Incoming Handler", trigger: "WhatsApp / IG webhook", auto: "auto", sla: "Balas < 30 dtk", conv: 100, time: "0 hari", note: "Pesan masuk WA/IG/Web ditangkap webhook n8n & dicatat sebagai lead." },
  crm: { module: "CRM & Leads", creates: "clients · leads.stage", engine: "WF-1 scorer + WF-4 sync", trigger: "Skor AI dihitung", auto: "auto", sla: "Real-time", conv: 64, time: "0–1 hari", note: "Lead di-dedupe ke client, diberi skor & tahap, lalu disinkron ke Supabase + Sheet." },
  ai: { module: "AI Agent (Syifa)", creates: "conversations.memory", engine: "WF-1 · Groq llama-3.3-70b", trigger: "Balasan dibutuhkan", auto: "auto", sla: "< 5 dtk/balas", conv: 58, time: "1–2 hari", note: "Syifa menjawab dengan konteks memory; bisa dialihkan ke manusia via WF-6." },
  estimate: { module: "AI Estimator", creates: "estimates (RAB+fee+PPN)", engine: "WF-2 · Auto Estimator", trigger: "Brief lengkap", auto: "auto", sla: "< 1 menit", conv: 45, time: "1–3 hari", note: "RAB, fee per-m²/persen, dan PPN 11% dihitung dari rate table 2026." },
  proposal: { module: "Proposal Generator", creates: "proposals (PDF)", engine: "Doc Engine + WF-0", trigger: "Estimasi disetujui", auto: "semi", sla: "1×24 jam", conv: 28, time: "3–5 hari", note: "Proposal branded ter-generate dari data estimasi — tanpa ketik ulang." },
  spk: { module: "SPK Generator", creates: "spk (e-sign)", engine: "Doc Engine (event)", trigger: "proposal.approved", auto: "auto", sla: "Instan", conv: 14, time: "5–10 hari", note: "Event proposal.approved otomatis menyusun SPK 9-pasal siap e-signature." },
  invoice: { module: "Invoice Generator", creates: "invoices · termin 1", engine: "Doc Engine (event)", trigger: "spk.signed", auto: "auto", sla: "Instan", conv: 14, time: "Sama hari", note: "SPK ditandatangani → invoice Termin 1 (DP 30%) terbit otomatis + QR." },
  payment: { module: "Finance & Payments", creates: "payments", engine: "Reminder workflow", trigger: "invoice.due", auto: "auto", sla: "Reminder H-3", conv: 13, time: "1–14 hari", note: "Reminder WA otomatis; konfirmasi bayar direkonsiliasi & memicu tahap proyek." },
  project: { module: "Projects", creates: "projects · tasks", engine: "Project bootstrap", trigger: "payment.confirmed", auto: "auto", sla: "Instan", conv: 13, time: "Mulai eksekusi", note: "Pembayaran Termin 1 → board proyek + task 4-termin otomatis terbentuk." },
  portfolio: { module: "Portfolio", creates: "portfolio_items", engine: "Auto-publish", trigger: "project.completed", auto: "semi", sla: "Pasca-serah-terima", conv: 12, time: "Selesai", note: "Proyek selesai → studi kasus & galeri otomatis dipublikasi ke sudutruang.com." },
};

function OperationsFlow({ setPage }) {
  const D = window.ACOS_DATA;
  const counts = { lead: 8, crm: 5, ai: 4, estimate: 3, proposal: 3, spk: 2, invoice: 6, payment: 4, project: 8, portfolio: 17 };
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(true);
  const railRef = useRef(null);
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setActive((a) => (a + 1) % D.FLOW.length), 1700);
    return () => clearInterval(t);
  }, [playing]);
  useEffect(() => { setSelected(active); }, [active]);
  const sm = D.FLOW[selected], meta = FLOW_META[sm.key];
  const autoC = { auto: T.green, semi: T.amber, manual: T.dim };
  const autoL = { auto: "OTOMATIS", semi: "SEMI-OTO", manual: "MANUAL" };

  return (
    <div style={{ padding: 22, height: "100%", overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: T.txt, margin: 0 }}>Operations Flow</h1>
          <div style={{ fontSize: 13, color: T.dim, marginTop: 6 }}>Alur otomatis end-to-end — satu lead mengalir tanpa input ulang.</div>
        </div>
        <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 12, marginRight: 6 }}>
            {[["auto", "Otomatis"], ["semi", "Semi-oto"], ["manual", "Manual"]].map(([k, l]) => (
              <span key={k} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, color: T.dim }}><Dot color={autoC[k]} size={7} />{l}</span>
            ))}
          </div>
          <Btn v={playing ? "sky" : "primary"} size="sm" icon={playing ? "Pause" : "Play"} onClick={() => setPlaying(!playing)}>{playing ? "Jeda" : "Putar"}</Btn>
        </div>
      </div>

      {/* RAIL */}
      <Panel style={{ marginBottom: 16 }}>
        <div style={{ padding: "10px 18px", borderBottom: `1px solid ${T.line}`, display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar initials="BS" color={T.sky} size={26} />
          <span style={{ fontSize: 12, color: T.sub }}>Menelusuri lead <b style={{ color: T.txt }}>Budi Santoso</b> <span style={{ fontFamily: T.mono, color: T.sky }}>L-2041</span> — kini di tahap <b style={{ color: T.tint }}>{D.FLOW[active].label}</b></span>
        </div>
        <div ref={railRef} style={{ overflowX: "auto", padding: "30px 20px 22px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", minWidth: 1180 }}>
            {D.FLOW.map((s, i) => {
              const on = i === active, done = i < active, seld = i === selected;
              const m = FLOW_META[s.key];
              return (
                <React.Fragment key={s.key}>
                  <div onClick={() => { setSelected(i); setPlaying(false); }} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 9, cursor: "pointer", position: "relative" }}>
                    {on && <div style={{ position: "absolute", top: -24, background: T.sky, color: "#03203a", fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 999, whiteSpace: "nowrap" }}>● BUDI S.</div>}
                    <div style={{ width: 56, height: 56, borderRadius: 16, display: "grid", placeItems: "center", position: "relative",
                      background: on ? "rgba(74,179,216,0.25)" : done ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.04)",
                      border: `1.5px solid ${seld ? T.tint : on ? T.sky : done ? T.green + "66" : T.line}`,
                      boxShadow: on ? `0 0 22px ${T.sky}66` : "none", transition: "all .4s", transform: on ? "scale(1.1)" : "none" }}>
                      <Icon name={done ? "Check" : s.icon} size={22} color={on ? T.sky : done ? T.green : T.sub} />
                      <div style={{ position: "absolute", top: -8, right: -8, minWidth: 20, height: 20, padding: "0 5px", borderRadius: 10, background: T.navy700, border: `1px solid ${T.sky}55`, display: "grid", placeItems: "center", fontSize: 10, fontWeight: 800, color: T.tint }}>{counts[s.key]}</div>
                    </div>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: on || seld ? T.txt : T.sub, textAlign: "center" }}>{s.label}</div>
                    <div style={{ fontSize: 9, color: T.dim, textAlign: "center", maxWidth: 92, lineHeight: 1.25 }}>{s.sub}</div>
                    <Dot color={autoC[m.auto]} size={6} />
                  </div>
                  {i < D.FLOW.length - 1 && (
                    <div style={{ width: 40, marginTop: 28, position: "relative", flexShrink: 0 }}>
                      <div style={{ height: 2, background: i < active ? T.green : T.line, borderRadius: 2, transition: "background .4s" }} />
                      {i === active && <div style={{ position: "absolute", top: -2, left: 0, width: 8, height: 6, borderRadius: 3, background: T.sky, animation: "acflow 1.7s linear infinite" }} />}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </Panel>

      {/* DETAIL + STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, alignItems: "start" }}>
        <Panel>
          <PanelHead title={`${sm.label} — ${meta.module}`} sub={meta.note} icon={sm.icon}
            right={<Tag color={autoC[meta.auto]} solid={meta.auto === "auto"}>{autoL[meta.auto]}</Tag>} />
          <div style={{ padding: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
              {[
                ["Modul ACOS", meta.module, "LayoutGrid"],
                ["Data dibuat", meta.creates, "Database"],
                ["Engine automasi", meta.engine, "Workflow"],
                ["Trigger event", meta.trigger, "Zap"],
                ["SLA target", meta.sla, "Clock"],
                ["Konversi tahap", meta.conv + "% dari lead", "Filter"],
              ].map(([l, v, ic], i) => (
                <div key={i} style={{ display: "flex", gap: 11, padding: "12px 13px", background: T.inset, borderRadius: 10, border: `1px solid ${T.line}` }}>
                  <Icon name={ic} size={16} color={T.sky} style={{ marginTop: 2 }} />
                  <div><div style={{ fontSize: 9.5, color: T.dim, textTransform: "uppercase", letterSpacing: 0.5 }}>{l}</div><div style={{ fontSize: 12.5, color: T.txt, fontWeight: 700, marginTop: 3, fontFamily: ic === "Database" || ic === "Workflow" ? T.mono : T.font }}>{v}</div></div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
              <Btn v="primary" size="sm" icon="ArrowUpRight" onClick={() => setPage(meta.module.includes("Estimator") ? "AI Estimator" : meta.module.includes("CRM") ? "CRM & Leads" : meta.module.includes("Project") ? "Projects" : meta.module.includes("Finance") ? "Finance & Payments" : meta.module.includes("Automation") ? "Automation Center" : "Command Center")}>Buka modul</Btn>
              <Btn v="ghost" size="sm" icon="Workflow" onClick={() => setPage("Automation Center")}>Lihat workflow</Btn>
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelHead title="Konversi Pipeline" sub="Funnel lead → closing" icon="Filter" />
          <div style={{ padding: 18 }}>
            {D.funnel.map((f, i) => {
              const pct = Math.round((f.v / D.funnel[0].v) * 100);
              return (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 11.5, color: T.sub, fontWeight: 600 }}>{f.label}</span>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: T.txt }}>{f.v} <span style={{ color: T.dim, fontWeight: 500 }}>· {pct}%</span></span>
                  </div>
                  <div style={{ height: 24, borderRadius: 7, background: T.inset, overflow: "hidden", border: `1px solid ${T.line}` }}>
                    <div style={{ width: pct + "%", height: "100%", background: `linear-gradient(90deg,${T.bright},${T.sky})`, borderRadius: 7, transition: "width .6s" }} />
                  </div>
                </div>
              );
            })}
            <div style={{ marginTop: 6, padding: "12px 14px", background: "rgba(52,211,153,0.08)", border: `1px solid rgba(52,211,153,0.2)`, borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
              <Icon name="Sparkles" size={16} color={T.green} />
              <span style={{ fontSize: 11, color: T.sub }}>Win rate <b style={{ color: T.green }}>38%</b> — naik 5pt sejak automasi WF-1 & WF-2 aktif.</span>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
Object.assign(window, { OperationsFlow });
