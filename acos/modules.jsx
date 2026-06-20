/* ACOS — Projects, Finance, Analytics */

// ─────────────────── PROJECTS ───────────────────
function ProjectsPage({ setPage }) {
  const D = window.ACOS_DATA;
  const [view, setView] = useState("board");
  const termColor = (t) => [T.dim, T.sky, T.tint, T.bright, T.green][t] || T.sky;
  return (
    <div style={{ padding: 22, height: "100%", overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: T.txt, margin: 0 }}>Projects</h1>
          <div style={{ fontSize: 13, color: T.dim, marginTop: 6 }}>{D.projects.length} proyek aktif · dibuat otomatis dari pembayaran termin 1</div>
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <div style={{ display: "flex", background: T.inset, borderRadius: 9, padding: 3, border: `1px solid ${T.line}` }}>
            {[["board", "Columns3"], ["list", "List"]].map(([v, ic]) => (
              <button key={v} onClick={() => setView(v)} style={{ padding: "6px 12px", borderRadius: 7, border: "none", background: view === v ? T.sky : "transparent", color: view === v ? "#03203a" : T.dim, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, fontFamily: T.font }}><Icon name={ic} size={13} color={view === v ? "#03203a" : T.dim} />{v === "board" ? "Board" : "List"}</button>
            ))}
          </div>
          <Btn v="primary" size="sm" icon="Plus">Proyek</Btn>
        </div>
      </div>

      {view === "board" ? (
        <div style={{ display: "flex", gap: 13, overflowX: "auto", paddingBottom: 10, alignItems: "flex-start" }}>
          {D.PRJ_STAGES.map((stage, si) => {
            const items = D.projects.filter((p) => p.stage === stage);
            return (
              <div key={stage} style={{ width: 270, flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: T.panel, border: `1px solid ${T.line}`, borderRadius: 11, marginBottom: 10, borderTop: `2px solid ${termColor(si + 1)}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 12, fontWeight: 700, color: T.txt }}>{stage}</span><span style={{ fontSize: 10, color: T.dim, background: T.inset, borderRadius: 999, padding: "1px 7px" }}>{items.length}</span></div>
                </div>
                {items.map((p) => (
                  <div key={p.id} className="ac-row" style={{ background: T.inset, border: `1px solid ${T.line}`, borderRadius: 11, padding: 13, marginBottom: 9, cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: T.txt, lineHeight: 1.25 }}>{p.name}</span>
                      <Tag color={statusColor[p.risk]} style={{ fontSize: 8 }}>{p.risk === "high" ? "RISIKO" : p.risk === "med" ? "PANTAU" : "AMAN"}</Tag>
                    </div>
                    <div style={{ fontSize: 10, color: T.dim, marginBottom: 10 }}>{p.client} · {p.loc}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: 9.5, color: T.dim }}>Progress</span><span style={{ fontSize: 10, fontWeight: 700, color: T.tint }}>{p.progress}%</span></div>
                    <ProgBar value={p.progress} color={statusColor[p.risk]} h={5} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 11, paddingTop: 10, borderTop: `1px solid ${T.line}` }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: T.sub, fontFamily: T.mono }}>{D.fmtRp(p.value)}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ display: "flex", gap: 2 }}>{[1, 2, 3, 4].map((t) => <span key={t} style={{ width: 6, height: 6, borderRadius: "50%", background: t <= p.termin ? T.green : T.line }} />)}</span>
                        <Avatar initials={p.lead} color={T.bright} size={22} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <Panel>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 880 }}>
              <thead><tr style={{ borderBottom: `1px solid ${T.line}` }}>
                {["Proyek", "Klien", "Scope", "Nilai", "Tahap", "Termin", "Progress", "Deadline", "Lead"].map((h) => (
                  <th key={h} style={{ textAlign: h === "Nilai" ? "right" : "left", padding: "11px 16px", fontSize: 9.5, color: T.dim, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {D.projects.map((p) => (
                  <tr key={p.id} className="ac-trow" style={{ borderBottom: `1px solid ${T.line}`, cursor: "pointer" }}>
                    <td style={{ padding: "11px 16px" }}><div style={{ fontSize: 12.5, fontWeight: 700, color: T.txt }}>{p.name}</div><div style={{ fontSize: 9.5, color: T.dim, fontFamily: T.mono }}>{p.id}</div></td>
                    <td style={{ padding: "11px 16px", fontSize: 11.5, color: T.sub }}>{p.client}</td>
                    <td style={{ padding: "11px 16px", fontSize: 11, color: T.dim }}>{p.scope}</td>
                    <td style={{ padding: "11px 16px", textAlign: "right", fontSize: 12, fontWeight: 700, color: T.tint, fontFamily: T.mono }}>{D.fmtRp(p.value)}</td>
                    <td style={{ padding: "11px 16px" }}><Tag color={T.sky} style={{ fontSize: 8.5 }}>{p.stage}</Tag></td>
                    <td style={{ padding: "11px 16px" }}><span style={{ display: "flex", gap: 3 }}>{[1, 2, 3, 4].map((t) => <span key={t} style={{ width: 7, height: 7, borderRadius: "50%", background: t <= p.termin ? T.green : T.line }} />)}</span></td>
                    <td style={{ padding: "11px 16px", width: 120 }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><ProgBar value={p.progress} color={statusColor[p.risk]} h={5} /><span style={{ fontSize: 10, fontWeight: 700, color: T.sub }}>{p.progress}%</span></div></td>
                    <td style={{ padding: "11px 16px", fontSize: 11, color: T.sub }}>{p.due}</td>
                    <td style={{ padding: "11px 16px" }}><Avatar initials={p.lead} color={T.bright} size={26} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
}

// ─────────────────── FINANCE ───────────────────
function FinancePage({ setPage }) {
  const D = window.ACOS_DATA;
  const paid = D.invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const due = D.invoices.filter((i) => i.status === "due" || i.status === "sent").reduce((s, i) => s + i.amount, 0);
  const overdue = D.invoices.filter((i) => i.status === "overdue").reduce((s, i) => s + i.amount, 0);
  const stats = [
    { l: "Terbayar (MTD)", v: D.fmtRp(paid), c: T.green, ic: "CircleCheck" },
    { l: "Menunggu Bayar", v: D.fmtRp(due), c: T.amber, ic: "Clock" },
    { l: "Overdue", v: D.fmtRp(overdue), c: T.red, ic: "TriangleAlert" },
    { l: "Total Piutang", v: D.fmtRp(D.kpis.arOutstanding), c: T.sky, ic: "Receipt" },
  ];
  const stLabel = { paid: "Lunas", due: "Jatuh tempo", sent: "Terkirim", overdue: "Overdue" };
  return (
    <div style={{ padding: 22, height: "100%", overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: T.txt, margin: 0 }}>Finance & Payments</h1>
          <div style={{ fontSize: 13, color: T.dim, marginTop: 6 }}>Invoice termin otomatis (30/30/30/10) · reminder WhatsApp · rekonsiliasi</div>
        </div>
        <Btn v="primary" size="sm" icon="Plus" onClick={() => setPage("Operations Flow")}>Invoice Baru</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 16 }}>
        {stats.map((s, i) => (
          <Panel key={i} pad={16}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: 10.5, color: T.dim, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>{s.l}</span><Icon name={s.ic} size={16} color={s.c} /></div>
            <div style={{ fontSize: 22, fontWeight: 800, color: T.txt, marginTop: 8 }}>{s.v}</div>
          </Panel>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16, alignItems: "start" }}>
        <Panel>
          <PanelHead title="Invoice Terbaru" sub="Termin model · sinkron payments table" icon="Receipt" />
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
              <thead><tr style={{ borderBottom: `1px solid ${T.line}` }}>
                {["No. Invoice", "Proyek / Klien", "Termin", "Jumlah", "Status"].map((h) => (
                  <th key={h} style={{ textAlign: h === "Jumlah" ? "right" : "left", padding: "11px 16px", fontSize: 9.5, color: T.dim, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {D.invoices.map((inv) => (
                  <tr key={inv.no} className="ac-trow" style={{ borderBottom: `1px solid ${T.line}`, cursor: "pointer" }}>
                    <td style={{ padding: "12px 16px", fontFamily: T.mono, fontSize: 11, color: T.sky }}>{inv.no}</td>
                    <td style={{ padding: "12px 16px" }}><div style={{ fontSize: 12, fontWeight: 600, color: T.txt }}>{inv.project}</div><div style={{ fontSize: 10, color: T.dim }}>{inv.client}</div></td>
                    <td style={{ padding: "12px 16px", fontSize: 11, color: T.sub }}>{inv.termin}</td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontSize: 12.5, fontWeight: 700, color: T.txt, fontFamily: T.mono }}>{D.fmtRp(inv.amount)}</td>
                    <td style={{ padding: "12px 16px" }}><Tag color={statusColor[inv.status]} style={{ fontSize: 8.5 }}>{stLabel[inv.status]}</Tag><div style={{ fontSize: 9, color: T.dim, marginTop: 3 }}>{inv.age}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <div style={{ display: "grid", gap: 16 }}>
          <Panel>
            <PanelHead title="Struktur Termin" sub="Standar SRA per kontrak" icon="Layers" />
            <div style={{ padding: 18 }}>
              {[["Termin 1 · DP", 30, "Saat SPK ditandatangani"], ["Termin 2", 30, "Skema desain disetujui"], ["Termin 3", 30, "Gambar kerja (DED) selesai"], ["Termin 4 · Pelunasan", 10, "Serah terima dokumen"]].map(([l, p, n], i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: 11.5, fontWeight: 700, color: T.txt }}>{l}</span><span style={{ fontSize: 11.5, fontWeight: 800, color: T.tint }}>{p}%</span></div>
                  <ProgBar value={p} color={T.sky} h={6} />
                  <div style={{ fontSize: 9.5, color: T.dim, marginTop: 4 }}>{n}</div>
                </div>
              ))}
            </div>
          </Panel>
          <Panel>
            <div style={{ padding: 16, display: "flex", gap: 11, alignItems: "flex-start", background: "rgba(248,113,113,0.07)", borderRadius: 14 }}>
              <Icon name="Zap" size={18} color={T.amber} style={{ marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.txt }}>Auto-reminder aktif</div>
                <div style={{ fontSize: 11, color: T.sub, lineHeight: 1.55, marginTop: 4 }}>Workflow mengirim reminder WhatsApp H-3 sebelum jatuh tempo & eskalasi saat overdue. INV-061 sudah dieskalasi.</div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

// ─────────────────── ANALYTICS ───────────────────
function AnalyticsPage() {
  const D = window.ACOS_DATA;
  const kc = [
    { l: "Win Rate", v: D.kpis.winRate + "%", d: "+5pt", c: T.green },
    { l: "Avg Fee", v: D.kpis.avgFee + "%", d: "stabil", c: T.sky },
    { l: "AI Handled", v: D.kpis.aiHandled + "%", d: "+12pt", c: T.tint },
    { l: "Avg Response", v: D.kpis.avgResponse + " mnt", d: "-94%", c: T.green },
    { l: "Dokumen Auto", v: D.kpis.docsAuto, d: "bln ini", c: T.sky },
    { l: "Lead / Bln", v: D.kpis.leadsMonth, d: "+19%", c: T.green },
  ];
  return (
    <div style={{ padding: 22, height: "100%", overflowY: "auto" }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: T.txt, margin: 0 }}>Analytics & KPI</h1>
        <div style={{ fontSize: 13, color: T.dim, marginTop: 6 }}>Performa studio · sumber data: seluruh modul ACOS terintegrasi</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 14, marginBottom: 16 }}>
        {kc.map((k, i) => (
          <Panel key={i} pad={15}>
            <div style={{ fontSize: 10, color: T.dim, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>{k.l}</div>
            <div style={{ fontSize: 23, fontWeight: 800, color: T.txt, marginTop: 7 }}>{k.v}</div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: k.c, marginTop: 4 }}>{k.d}</div>
          </Panel>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16, marginBottom: 16 }}>
        <Panel>
          <PanelHead title="Revenue 6 Bulan" sub="Realisasi pembayaran · Rp Miliar" icon="BarChart3" />
          <div style={{ padding: "20px 18px" }}><Bars data={D.revenueBars} h={170} fmt={(v) => v.toFixed(1)} /></div>
        </Panel>
        <Panel>
          <PanelHead title="Sumber Lead" sub="Channel acquisition" icon="PieChart" />
          <div style={{ padding: 18 }}>
            {D.channelSplit.map((c, i) => (
              <div key={i} style={{ marginBottom: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, color: T.sub, fontWeight: 600 }}><Dot color={c.color} size={8} />{c.label}</span><span style={{ fontSize: 11.5, fontWeight: 700, color: T.txt }}>{c.v}%</span></div>
                <ProgBar value={c.v} color={c.color} h={6} />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Panel>
          <PanelHead title="Funnel Konversi" sub="Lead → Closing" icon="Filter" />
          <div style={{ padding: 18 }}>
            {D.funnel.map((f, i) => {
              const pct = Math.round((f.v / D.funnel[0].v) * 100);
              return (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}><span style={{ fontSize: 11.5, color: T.sub, fontWeight: 600 }}>{f.label}</span><span style={{ fontSize: 11.5, fontWeight: 700, color: T.txt }}>{f.v} · {pct}%</span></div>
                  <div style={{ height: 22, borderRadius: 7, background: T.inset, overflow: "hidden", border: `1px solid ${T.line}` }}><div style={{ width: pct + "%", height: "100%", background: `linear-gradient(90deg,${T.bright},${T.sky})` }} /></div>
                </div>
              );
            })}
          </div>
        </Panel>
        <Panel>
          <PanelHead title="Dampak Automasi" sub="Sebelum vs sesudah ACOS" icon="Sparkles" accent={T.green} />
          <div style={{ padding: 18 }}>
            {[["Waktu respons lead", "4 jam", "1.2 mnt", T.green], ["Buat proposal", "2 hari", "5 menit", T.green], ["Input data ulang", "5×/deal", "0×", T.green], ["Lead tertangani AI", "0%", "86%", T.tint], ["Dokumen / bulan", "~30", "142", T.sky]].map(([l, before, after, c], i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: i < 4 ? `1px solid ${T.line}` : "none" }}>
                <span style={{ flex: 1, fontSize: 12, color: T.sub, fontWeight: 600 }}>{l}</span>
                <span style={{ fontSize: 11, color: T.dim, textDecoration: "line-through" }}>{before}</span>
                <Icon name="ArrowRight" size={13} color={T.dim} />
                <span style={{ fontSize: 12.5, fontWeight: 800, color: c, minWidth: 64, textAlign: "right" }}>{after}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
Object.assign(window, { ProjectsPage, FinancePage, AnalyticsPage });
