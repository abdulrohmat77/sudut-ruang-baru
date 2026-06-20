/* ACOS — CRM & Leads (Kanban + table) */
function LeadCard({ lead, onClick }) {
  const D = window.ACOS_DATA;
  const chIcon = { WhatsApp: "MessageCircle", Instagram: "Instagram", Website: "Globe", Referral: "Users", Tender: "Gavel" }[lead.channel] || "Inbox";
  return (
    <div onClick={onClick} className="ac-row" style={{ background: T.inset, border: `1px solid ${T.line}`, borderRadius: 11, padding: 12, cursor: "pointer", marginBottom: 9 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar initials={lead.name.split(" ").map((w) => w[0]).slice(0, 2).join("")} color={statusColor[lead.status]} size={28} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.txt, lineHeight: 1.2 }}>{lead.name}</div>
            <div style={{ fontSize: 9.5, color: T.dim, fontFamily: T.mono }}>{lead.id}</div>
          </div>
        </div>
        <Tag color={statusColor[lead.status]} style={{ fontSize: 8.5 }}>{lead.status.toUpperCase()}</Tag>
      </div>
      <div style={{ fontSize: 11.5, color: T.sub, fontWeight: 600, marginBottom: 3 }}>{lead.project}</div>
      <div style={{ fontSize: 10, color: T.dim, marginBottom: 9 }}>{lead.loc} · {lead.area} m²</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: T.tint, fontFamily: T.mono }}>{D.fmtRp(lead.value)}</span>
        <span style={{ fontSize: 9.5, color: T.dim }}>fee {D.fmtRp(lead.fee)}</span>
      </div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
          <span style={{ fontSize: 9, color: T.dim }}>AI Score</span><span style={{ fontSize: 9.5, fontWeight: 700, color: lead.score > 85 ? T.green : lead.score > 70 ? T.amber : T.dim }}>{lead.score}/100</span>
        </div>
        <ProgBar value={lead.score} color={lead.score > 85 ? T.green : lead.score > 70 ? T.amber : T.dim} h={4} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: `1px solid ${T.line}` }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 9.5, color: T.dim }}><Icon name={chIcon} size={12} color={T.sub} />{lead.channel}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {lead.handler === "AI" ? <Tag color={T.tint} style={{ fontSize: 8 }}><Icon name="Bot" size={9} color={T.tint} />Syifa</Tag> : <Tag color={T.sub} style={{ fontSize: 8 }}>Human</Tag>}
          <span style={{ fontSize: 9, color: T.dim }}>{lead.last}</span>
        </span>
      </div>
    </div>
  );
}

function ConversationView({ lead, setPage }) {
  const D = window.ACOS_DATA;
  const c = D.conversations[lead.id] || D.defaultConvo;
  const [mode, setMode] = useState(c.mode);
  const chIcon = { WhatsApp: "MessageCircle", Instagram: "Instagram", Website: "Globe" }[c.channel] || "MessageCircle";
  return (
    <div>
      {/* AI control bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: T.inset, borderRadius: 12, border: `1px solid ${T.line}`, marginBottom: 14, flexWrap: "wrap" }}>
        <Icon name={chIcon} size={15} color={T.sky} />
        <span style={{ fontSize: 11.5, color: T.sub, fontFamily: T.mono }}>{c.number}</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10.5, color: T.dim }}>Mode</span>
          <Segmented value={mode} onChange={setMode} options={[{ v: "ai", label: "AI", icon: "Bot" }, { v: "manual", label: "Manual", icon: "Hand" }]} />
        </div>
      </div>
      {mode === "manual" && (
        <div style={{ display: "flex", gap: 9, padding: "10px 13px", background: "rgba(251,191,36,0.08)", border: `1px solid rgba(251,191,36,0.25)`, borderRadius: 10, marginBottom: 14, alignItems: "center" }}>
          <Icon name="Hand" size={14} color={T.amber} /><span style={{ fontSize: 11, color: T.sub }}>Mode manual aktif (WF-6) — Syifa berhenti membalas, staf mengambil alih chat ini.</span>
        </div>
      )}

      {/* transcript */}
      <div style={{ background: T.inset, borderRadius: 12, border: `1px solid ${T.line}`, padding: 14, marginBottom: 14 }}>
        {c.msgs.map((m, i) => {
          const ai = m.from === "ai";
          return (
            <div key={i} style={{ display: "flex", justifyContent: ai ? "flex-end" : "flex-start", marginBottom: 12 }}>
              <div style={{ maxWidth: "82%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, justifyContent: ai ? "flex-end" : "flex-start" }}>
                  {ai && <Icon name="Bot" size={11} color={T.tint} />}
                  <span style={{ fontSize: 9.5, color: T.dim, fontWeight: 600 }}>{ai ? "Syifa (AI)" : lead.name.split(" ")[0]} · {m.t}</span>
                </div>
                <div style={{ padding: "9px 12px", borderRadius: ai ? "12px 12px 3px 12px" : "12px 12px 12px 3px", fontSize: 12, lineHeight: 1.5,
                  background: ai ? "linear-gradient(135deg,rgba(74,179,216,0.2),rgba(74,179,216,0.1))" : T.panel,
                  border: `1px solid ${ai ? T.sky + "44" : T.line}`, color: T.txt }}>{m.text}</div>
                {m.meta && <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4, justifyContent: "flex-end" }}><Icon name="Sparkles" size={9} color={T.tint} /><span style={{ fontSize: 9, color: T.dim, fontFamily: T.mono }}>{m.meta}</span></div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI analysis */}
      <div style={{ background: "rgba(143,208,232,0.08)", border: `1px solid ${T.sky}33`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Icon name="Bot" size={15} color={T.tint} /><span style={{ fontSize: 12, fontWeight: 700, color: T.tint }}>Analisis AI</span>
          <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 800, color: lead.score > 85 ? T.green : T.amber }}>Skor {lead.score}/100</span>
        </div>
        <div style={{ fontSize: 11.5, color: T.sub, lineHeight: 1.6 }}>{c.aiSummary}</div>
        {c.flags.length > 0 && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.sky}22` }}>
            {c.flags.map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start", marginBottom: 4 }}>
                <Icon name="TriangleAlert" size={12} color={T.amber} style={{ marginTop: 1, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: T.amber }}>{f}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* composer + actions */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: T.inset, border: `1px solid ${T.line}`, borderRadius: 10, padding: "9px 12px" }}>
          <input placeholder={mode === "ai" ? "Syifa menangani otomatis…" : "Ketik balasan…"} disabled={mode === "ai"} style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: T.txt, fontSize: 12, fontFamily: T.font }} />
          <Icon name="Send" size={15} color={mode === "ai" ? T.dim : T.sky} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Btn v="ghost" size="sm" icon="Settings2" onClick={() => setPage("Settings")} style={{ flex: 1, justifyContent: "center" }}>Setting Prompt AI</Btn>
        <Btn v="primary" size="sm" icon="Calculator" onClick={() => setPage("AI Estimator")} style={{ flex: 1, justifyContent: "center" }}>Buat Estimasi</Btn>
      </div>
    </div>
  );
}

function CRMPage({ setPage }) {
  const D = window.ACOS_DATA;
  const [view, setView] = useState("kanban");
  const [sel, setSel] = useState(null);
  const [dtab, setDtab] = useState("detail");
  const [filter, setFilter] = useState("all");
  const leads = filter === "all" ? D.leads : D.leads.filter((l) => l.status === filter);
  const totalVal = D.leads.reduce((s, l) => s + l.value, 0);

  return (
    <div style={{ padding: 22, height: "100%", overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: T.txt, margin: 0 }}>CRM & Leads</h1>
          <div style={{ fontSize: 13, color: T.dim, marginTop: 6 }}>{D.leads.length} lead aktif · {D.fmtRp(totalVal)} potensi nilai · disinkron WF-4</div>
        </div>
        <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
          <div style={{ display: "flex", background: T.inset, borderRadius: 9, padding: 3, border: `1px solid ${T.line}` }}>
            {[["kanban", "LayoutGrid"], ["table", "Table"]].map(([v, ic]) => (
              <button key={v} onClick={() => setView(v)} style={{ padding: "6px 12px", borderRadius: 7, border: "none", background: view === v ? T.sky : "transparent", color: view === v ? "#03203a" : T.dim, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, fontFamily: T.font }}><Icon name={ic} size={13} color={view === v ? "#03203a" : T.dim} />{v === "kanban" ? "Kanban" : "Tabel"}</button>
            ))}
          </div>
          <Btn v="primary" size="sm" icon="Plus">Lead Baru</Btn>
        </div>
      </div>

      {view === "kanban" ? (
        <div style={{ display: "flex", gap: 13, overflowX: "auto", paddingBottom: 10, alignItems: "flex-start" }}>
          {D.CRM_COLS.map((col) => {
            const items = D.leads.filter((l) => l.stage === col.key);
            const sum = items.reduce((s, l) => s + l.value, 0);
            return (
              <div key={col.key} style={{ width: 250, flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: T.panel, border: `1px solid ${T.line}`, borderRadius: 11, marginBottom: 10, borderTop: `2px solid ${col.color}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Dot color={col.color} size={7} /><span style={{ fontSize: 12, fontWeight: 700, color: T.txt }}>{col.label}</span>
                    <span style={{ fontSize: 10, color: T.dim, background: T.inset, borderRadius: 999, padding: "1px 7px" }}>{items.length}</span>
                  </div>
                  <span style={{ fontSize: 9.5, color: T.dim, fontFamily: T.mono }}>{D.fmtRp(sum)}</span>
                </div>
                {items.map((l) => <LeadCard key={l.id} lead={l} onClick={() => { setSel(l); setDtab("detail"); }} />)}
                {items.length === 0 && <div style={{ padding: 20, textAlign: "center", fontSize: 10.5, color: T.dim, border: `1px dashed ${T.line}`, borderRadius: 11 }}>Kosong</div>}
              </div>
            );
          })}
        </div>
      ) : (
        <Panel>
          <div style={{ display: "flex", gap: 6, padding: "12px 16px", borderBottom: `1px solid ${T.line}` }}>
            {["all", "hot", "warm", "cold"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: "5px 13px", borderRadius: 999, border: `1px solid ${filter === f ? T.sky + "55" : T.line}`, background: filter === f ? "rgba(74,179,216,0.14)" : "transparent", color: filter === f ? T.sky : T.dim, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: T.font, textTransform: "capitalize" }}>{f === "all" ? "Semua" : f}</button>
            ))}
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
              <thead><tr style={{ borderBottom: `1px solid ${T.line}` }}>
                {["Lead", "Proyek", "Channel", "Nilai", "Fee", "Score", "Prob", "Handler", "Tahap"].map((h) => (
                  <th key={h} style={{ textAlign: h === "Nilai" || h === "Fee" ? "right" : "left", padding: "11px 16px", fontSize: 9.5, color: T.dim, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} onClick={() => { setSel(l); setDtab("detail"); }} className="ac-trow" style={{ borderBottom: `1px solid ${T.line}`, cursor: "pointer" }}>
                    <td style={{ padding: "11px 16px" }}><div style={{ display: "flex", alignItems: "center", gap: 9 }}><Avatar initials={l.name.split(" ").map((w) => w[0]).slice(0, 2).join("")} color={statusColor[l.status]} size={28} /><div><div style={{ fontSize: 12, fontWeight: 700, color: T.txt }}>{l.name}</div><div style={{ fontSize: 9.5, color: T.dim, fontFamily: T.mono }}>{l.id}</div></div></div></td>
                    <td style={{ padding: "11px 16px", fontSize: 11.5, color: T.sub }}>{l.project}<div style={{ fontSize: 9.5, color: T.dim }}>{l.loc}</div></td>
                    <td style={{ padding: "11px 16px" }}><Tag color={T.tint} style={{ fontSize: 9 }}>{l.channel}</Tag></td>
                    <td style={{ padding: "11px 16px", textAlign: "right", fontSize: 12, fontWeight: 700, color: T.tint, fontFamily: T.mono }}>{D.fmtRp(l.value)}</td>
                    <td style={{ padding: "11px 16px", textAlign: "right", fontSize: 11, color: T.sub, fontFamily: T.mono }}>{D.fmtRp(l.fee)}</td>
                    <td style={{ padding: "11px 16px" }}><span style={{ fontSize: 11, fontWeight: 700, color: l.score > 85 ? T.green : l.score > 70 ? T.amber : T.dim }}>{l.score}</span></td>
                    <td style={{ padding: "11px 16px", fontSize: 11, color: T.sub }}>{l.prob}%</td>
                    <td style={{ padding: "11px 16px" }}>{l.handler === "AI" ? <Tag color={T.tint} style={{ fontSize: 8.5 }}><Icon name="Bot" size={9} color={T.tint} />Syifa</Tag> : <Tag color={T.sub} style={{ fontSize: 8.5 }}>Human</Tag>}</td>
                    <td style={{ padding: "11px 16px" }}><Tag color={D.CRM_COLS.find((c) => c.key === l.stage)?.color || T.sky} style={{ fontSize: 8.5 }}>{D.CRM_COLS.find((c) => c.key === l.stage)?.label || l.stage}</Tag></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* lead drawer */}
      {sel && (
        <div onClick={() => setSel(null)} style={{ position: "fixed", inset: 0, background: "rgba(2,16,30,0.6)", zIndex: 60, display: "flex", justifyContent: "flex-end", backdropFilter: "blur(3px)" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 440, background: T.panel, borderLeft: `1px solid ${T.lineHi}`, height: "100%", overflowY: "auto", animation: "acslide .25s ease-out" }}>
            <div style={{ padding: "18px 20px", borderBottom: `1px solid ${T.line}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", gap: 12 }}>
                <Avatar initials={sel.name.split(" ").map((w) => w[0]).slice(0, 2).join("")} color={statusColor[sel.status]} size={46} />
                <div><div style={{ fontSize: 16, fontWeight: 800, color: T.txt }}>{sel.name}</div><div style={{ fontSize: 11, color: T.dim, fontFamily: T.mono }}>{sel.id} · {sel.channel}</div></div>
              </div>
              <button onClick={() => setSel(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><Icon name="X" size={20} color={T.dim} /></button>
            </div>
            <div style={{ display: "flex", gap: 4, padding: "10px 16px 0" }}>
              {[["detail", "Detail", "LayoutList"], ["convo", "Percakapan", "MessageSquare"]].map(([k, l, ic]) => (
                <button key={k} onClick={() => setDtab(k)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: "9px 9px 0 0", border: "none", borderBottom: `2px solid ${dtab === k ? T.sky : "transparent"}`, background: "transparent", color: dtab === k ? T.sky : T.dim, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: T.font }}>
                  <Icon name={ic} size={13} color={dtab === k ? T.sky : T.dim} />{l}{k === "convo" && <span style={{ fontSize: 9, fontWeight: 800, color: T.tint, background: "rgba(74,179,216,0.15)", borderRadius: 999, padding: "1px 6px" }}>{sel.msgs}</span>}
                </button>
              ))}
            </div>
            <div style={{ padding: 20, borderTop: `1px solid ${T.line}` }}>
              {dtab === "convo" ? <ConversationView lead={sel} setPage={setPage} /> : (<>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
                {[["Proyek", sel.project], ["Lokasi", sel.loc], ["Luas", sel.area + " m²"], ["Nilai est.", D.fmtRp(sel.value)], ["Fee est.", D.fmtRp(sel.fee)], ["Probabilitas", sel.prob + "%"]].map(([l, v], i) => (
                  <div key={i} style={{ background: T.inset, borderRadius: 10, padding: "10px 12px", border: `1px solid ${T.line}` }}>
                    <div style={{ fontSize: 9, color: T.dim, textTransform: "uppercase", letterSpacing: 0.5 }}>{l}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.txt, marginTop: 3 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "rgba(143,208,232,0.08)", border: `1px solid ${T.sky}33`, borderRadius: 12, padding: 14, marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <Icon name="Bot" size={16} color={T.tint} /><span style={{ fontSize: 12, fontWeight: 700, color: T.tint }}>Ringkasan AI (Syifa)</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 800, color: T.green }}>Skor {sel.score}</span>
                </div>
                <div style={{ fontSize: 11.5, color: T.sub, lineHeight: 1.6 }}>Lead {sel.status} dengan intensi tinggi. {sel.msgs} pesan dipertukarkan via {sel.channel}. Brief proyek {sel.project.toLowerCase()} sudah lengkap — siap masuk tahap {D.CRM_COLS.find((c) => c.key === sel.stage)?.label.toLowerCase()}.</div>
              </div>
              <div style={{ fontSize: 10, color: T.dim, fontWeight: 700, letterSpacing: 0.5, marginBottom: 10 }}>NEXT ACTION OTOMATIS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
                {[["Calculator", "Generate estimasi RAB", "AI Estimator"], ["FileText", "Buat proposal branded", "Proposals"], ["MessageCircle", "Kirim follow-up WhatsApp", null]].map(([ic, label, pg], i) => (
                  <div key={i} onClick={() => pg && setPage(pg)} className="ac-row" style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 13px", background: T.inset, borderRadius: 10, border: `1px solid ${T.line}`, cursor: pg ? "pointer" : "default" }}>
                    <Icon name={ic} size={15} color={T.sky} /><span style={{ flex: 1, fontSize: 12, color: T.txt, fontWeight: 600 }}>{label}</span><Icon name="ArrowRight" size={14} color={T.dim} />
                  </div>
                ))}
              </div>
              <Btn v="primary" style={{ width: "100%", justifyContent: "center" }} icon="ArrowUpRight" onClick={() => setPage("Operations Flow")}>Lihat di Operations Flow</Btn>
              </>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
Object.assign(window, { CRMPage });
