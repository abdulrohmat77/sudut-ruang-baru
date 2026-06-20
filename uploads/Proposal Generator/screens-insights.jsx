/* ============================================================
   Insights — Pricing Engine · Analytics · Responsive
   ============================================================ */

/* ---------------- PRICING ENGINE ---------------- */
function PricingEngine() {
  const [model, setModel] = useState("Unit Rate");
  const [area, setArea] = useState(640);
  const [svc, setSvc] = useState(SRA.designFees[2]); // Arsitektur Premium
  const [rab, setRab] = useState(8000000); // construction per m2

  const ppn = 0.11;
  let baseFee = 0, basis = "";
  if (model === "Unit Rate") { baseFee = area * svc.per_m2; basis = `${area} m² × ${SRA.rupiah(svc.per_m2)}`; }
  else if (model === "Persentase") { const rabTotal = area * rab; baseFee = rabTotal * (svc.percent / 100); basis = `${svc.percent}% × RAB ${SRA.rupiah(rabTotal)}`; }
  else if (model === "Lump Sum") { baseFee = 295000000; basis = "Nilai tetap disepakati"; }
  else { baseFee = 320000000; basis = "Struktur khusus per item"; }
  const tax = baseFee * ppn;
  const total = baseFee + tax;

  return (
    <div className="page fade-in">
      <PageHead eyebrow="Generate" title="Pricing Engine" sub="Hitung fee desain berdasarkan model harga resmi Sudut Ruang 2026 — otomatis tersisip ke proposal." />
      <div className="grid" style={{ gridTemplateColumns: "1fr 380px", alignItems: "start", gap: 22 }}>
        {/* calculator */}
        <div className="card card-pad">
          <div className="row between" style={{ marginBottom: 20 }}>
            <div className="sec-title">Kalkulator Fee</div>
            <div className="seg">{["Lump Sum", "Persentase", "Unit Rate", "Custom"].map((m) => <button key={m} className={model === m ? "on" : ""} onClick={() => setModel(m)}>{m}</button>)}</div>
          </div>

          <div className="grid g-2" style={{ gap: 18, marginBottom: 22 }}>
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--grey-700)", display: "block", marginBottom: 8 }}>Layanan</label>
              <select className="winput" value={svc.service} onChange={(e) => setSvc(SRA.designFees.find((f) => f.service === e.target.value))}>
                {SRA.designFees.map((f) => <option key={f.service}>{f.service}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--grey-700)", display: "block", marginBottom: 8 }}>Luas Bangunan</label>
              <div className="tb-search" style={{ margin: 0, maxWidth: "none", background: "#fff", border: "1px solid var(--border)" }}>
                <input type="number" value={area} onChange={(e) => setArea(+e.target.value || 0)} style={{ fontWeight: 600 }} />
                <span style={{ fontSize: 13, color: "var(--grey-500)", fontWeight: 600 }}>m²</span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 22 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--grey-700)", display: "block", marginBottom: 10 }}>Biaya Konstruksi / m² (untuk basis RAB)</label>
            <input type="range" min={3000000} max={15000000} step={500000} value={rab} onChange={(e) => setRab(+e.target.value)} style={{ width: "100%", accentColor: "var(--accent)" }} />
            <div className="row between" style={{ marginTop: 6, fontSize: 12, color: "var(--grey-500)" }}><span>Rp 3 jt</span><b style={{ color: "var(--bright-blue)" }}>{SRA.rupiah(rab)} / m²</b><span>Rp 15 jt</span></div>
          </div>

          <div className="divider" style={{ margin: "4px 0 18px" }} />
          <div style={{ fontSize: 12.5, color: "var(--grey-500)", marginBottom: 14 }}>Cocok untuk: <b style={{ color: "var(--grey-700)" }}>{svc.fit}</b></div>
          <div className="grid g-3" style={{ gap: 12 }}>
            {SRA.constructionGrades.map((g) => (
              <div key={g.type + g.grade} className="card-pad" style={{ background: "var(--tint-050)", borderRadius: 10, border: "1px solid var(--tint-100)", padding: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--deep-navy)" }}>{g.type}</div>
                <div style={{ fontSize: 10.5, color: "var(--grey-500)", margin: "2px 0 6px" }}>{g.grade}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--bright-blue)" }}>{SRA.rupiah(g.min)}–{(g.max / 1e6)}jt</div>
              </div>
            ))}
          </div>
        </div>

        {/* result */}
        <div className="card" style={{ overflow: "hidden", position: "sticky", top: 8 }}>
          <div className="scrim-grid" style={{ background: "var(--grad-navy)", color: "#fff", padding: 26 }}>
            <div className="eyebrow" style={{ color: "var(--sky-blue)" }}>Estimasi Fee Desain</div>
            <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-.02em", marginTop: 10 }}>{SRA.rupiah(Math.round(total))}</div>
            <div style={{ fontSize: 12.5, color: "var(--fg-muted-dark,#B9CFE0)", marginTop: 6 }}>Termasuk PPN 11% · Model {model}</div>
          </div>
          <div className="card-pad">
            {[["Fee dasar", SRA.rupiah(Math.round(baseFee))], ["PPN 11%", SRA.rupiah(Math.round(tax))]].map(([l, v]) => (
              <div key={l} className="row between" style={{ padding: "11px 0", borderBottom: "1px solid var(--border-soft)", fontSize: 13.5 }}><span style={{ color: "var(--grey-500)" }}>{l}</span><b style={{ color: "var(--deep-navy)" }}>{v}</b></div>
            ))}
            <div style={{ fontSize: 11.5, color: "var(--grey-300)", margin: "12px 0 4px" }}>Basis: {basis}</div>
            <div className="grid termin-grid" style={{ gap: 8, marginTop: 16 }}>
              <div className="caption" style={{ marginBottom: 2 }}>TERMIN PEMBAYARAN</div>
              {[["DP", 30], ["Schematic", 30], ["Development", 30], ["Final", 10]].map(([l, p]) => (
                <div key={l} className="row between" style={{ fontSize: 12.5 }}><span style={{ color: "var(--grey-500)" }}>{l} ({p}%)</span><b style={{ color: "var(--deep-navy)" }}>{SRA.rupiah(Math.round(total * p / 100))}</b></div>
              ))}
            </div>
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 18 }}><Icon name="file-down" size={16} />Sisipkan ke Proposal</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- ANALYTICS ---------------- */
function Analytics() {
  const A = SRA.analytics;
  return (
    <div className="page fade-in">
      <PageHead eyebrow="Insights" title="Proposal Analytics" sub="Performa proposal, win rate, dan efektivitas template — Q2 2026."
        actions={[<button key="x" className="btn btn-outline btn-sm"><Icon name="calendar" size={15} />12 bulan terakhir</button>]} />

      <div className="grid g-4 stagger" style={{ marginBottom: 22 }}>
        {A.kpis.map((k) => <Stat key={k.label} icon={k.icon} value={k.value} label={k.label} delta={k.delta} up={k.up} />)}
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1.4fr 1fr", gap: 22, marginBottom: 22 }}>
        <div className="card card-pad">
          <div className="sec-title" style={{ marginBottom: 4 }}>Nilai Proposal Dikirim</div>
          <div className="page-sub" style={{ marginBottom: 22 }}>Per bulan (Rp miliar)</div>
          <Bars data={A.monthly} labels={["Jul","Agu","Sep","Okt","Nov","Des","Jan","Feb","Mar","Apr","Mei","Jun"]} />
        </div>
        <div className="card card-pad">
          <div className="sec-title" style={{ marginBottom: 22 }}>Conversion Funnel</div>
          <div className="grid" style={{ gap: 14 }}>
            {A.funnel.map((f, i) => (
              <div key={f.stage}>
                <div className="row between" style={{ marginBottom: 6, fontSize: 13 }}><b style={{ color: "var(--deep-navy)" }}>{f.stage}</b><span style={{ color: "var(--grey-500)", fontWeight: 600 }}>{f.count} · {f.pct}%</span></div>
                <div style={{ height: 12, borderRadius: 99, background: "var(--grey-100)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: f.pct + "%", borderRadius: 99, background: "var(--grad-brand)", opacity: 1 - i * 0.15 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        <div className="card card-pad">
          <div className="sec-title" style={{ marginBottom: 22 }}>Win Rate per Jenis Proposal</div>
          <div className="grid" style={{ gap: 16 }}>
            {A.byType.map((t) => (
              <div key={t.type} className="row gap-m">
                <div style={{ width: 150, fontSize: 12.5, fontWeight: 600, color: "var(--grey-700)" }}>{t.type}</div>
                <div style={{ flex: 1, height: 10, borderRadius: 99, background: "var(--grey-100)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: t.win + "%", background: "var(--grad-brand)", borderRadius: 99 }} />
                </div>
                <b style={{ fontSize: 13, color: "var(--deep-navy)", width: 36, textAlign: "right" }}>{t.win}%</b>
              </div>
            ))}
          </div>
        </div>
        <div className="card card-pad">
          <div className="sec-title" style={{ marginBottom: 18 }}>Template Paling Efektif</div>
          <div className="grid" style={{ gap: 4 }}>
            {A.topTemplates.map((t, i) => (
              <div key={t.name} className="row between" style={{ padding: "12px 0", borderTop: i ? "1px solid var(--border-soft)" : "none" }}>
                <div className="row gap-m">
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: "var(--tint-100)", color: "var(--bright-blue)", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700 }}>{i + 1}</span>
                  <div><b style={{ fontSize: 13.5, color: "var(--deep-navy)", display: "block" }}>{t.name}</b><span style={{ fontSize: 11.5, color: "var(--grey-500)" }}>{t.uses} kali digunakan</span></div>
                </div>
                <span className="badge" style={{ color: "var(--ok)", background: "var(--ok-bg)" }}>{t.rate}% menang</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- RESPONSIVE PREVIEW ---------------- */
function MiniDash({ scale }) {
  return (
    <div style={{ padding: 12, fontSize: 10 }}>
      <div className="row between" style={{ marginBottom: 10 }}>
        <div className="row gap-s"><img src="assets/logo-mark.png" style={{ height: 18 }} alt="" /><b style={{ fontSize: 11, color: "var(--deep-navy)" }}>Proposal OS</b></div>
        <span style={{ width: 20, height: 20, borderRadius: 99, background: "var(--deep-navy)", color: "#fff", display: "grid", placeItems: "center", fontSize: 8, fontWeight: 700 }}>HA</span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 800, color: "var(--deep-navy)", marginBottom: 10 }}>Dashboard</div>
      <div className="grid g-2" style={{ gap: 6, marginBottom: 10 }}>
        {[["248", "Total"], ["63%", "Win Rate"]].map(([v, l]) => (
          <div key={l} style={{ background: "#fff", border: "1px solid var(--border-soft)", borderRadius: 8, padding: 8 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--deep-navy)" }}>{v}</div>
            <div style={{ fontSize: 9, color: "var(--grey-500)" }}>{l}</div>
          </div>
        ))}
      </div>
      {SRA.proposals.slice(0, 3).map((p) => (
        <div key={p.id} style={{ background: "#fff", border: "1px solid var(--border-soft)", borderRadius: 8, padding: 8, marginBottom: 6 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--deep-navy)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</div>
          <div className="row between" style={{ marginTop: 4 }}><span style={{ fontSize: 8, color: "var(--grey-500)" }}>{p.client}</span><StatusBadge status={p.status} /></div>
        </div>
      ))}
    </div>
  );
}

function Responsive() {
  return (
    <div className="page fade-in">
      <PageHead eyebrow="Platform" title="Responsive Design" sub="Satu sistem, tiga breakpoint — desktop, tablet, dan mobile dengan navigasi adaptif." />
      <div className="card card-pad" style={{ background: "var(--tint-050)", overflow: "hidden" }}>
        <div className="row" style={{ gap: 40, justifyContent: "center", alignItems: "flex-end", flexWrap: "wrap", padding: "20px 0 8px" }}>
          {/* Desktop */}
          <div style={{ textAlign: "center" }}>
            <div className="device" style={{ width: 440, height: 300, padding: 0, borderRadius: 12 }}>
              <div style={{ height: 22, background: "var(--grey-100)", display: "flex", alignItems: "center", gap: 5, padding: "0 10px", borderBottom: "1px solid var(--border-soft)" }}>
                {["#ff6058", "#ffbd2e", "#28c840"].map((c) => <span key={c} style={{ width: 8, height: 8, borderRadius: 99, background: c }} />)}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "70px 1fr", height: "calc(100% - 22px)", background: "var(--app-bg)" }}>
                <div style={{ background: "#fff", borderRight: "1px solid var(--border-soft)", padding: 8 }}>
                  {NAV[0].items.map((it) => <div key={it.id} style={{ height: 8, background: it.id === "dashboard" ? "var(--tint-100)" : "var(--grey-100)", borderRadius: 4, marginBottom: 6 }} />)}
                </div>
                <div style={{ transform: "scale(.92)", transformOrigin: "top left" }}><MiniDash /></div>
              </div>
            </div>
            <div className="row gap-s" style={{ justifyContent: "center", marginTop: 16, fontSize: 13, fontWeight: 600, color: "var(--grey-700)" }}><Icon name="monitor" size={16} style={{ color: "var(--accent)" }} />Desktop · 1440px</div>
          </div>
          {/* Tablet */}
          <div style={{ textAlign: "center" }}>
            <div className="device tablet" style={{ width: 280, height: 360 }}>
              <div className="screen"><MiniDash /></div>
            </div>
            <div className="row gap-s" style={{ justifyContent: "center", marginTop: 16, fontSize: 13, fontWeight: 600, color: "var(--grey-700)" }}><Icon name="tablet" size={16} style={{ color: "var(--accent)" }} />Tablet · 768px</div>
          </div>
          {/* Phone */}
          <div style={{ textAlign: "center" }}>
            <div className="device phone" style={{ width: 200, height: 400 }}>
              <div className="screen" style={{ position: "relative" }}>
                <MiniDash />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 44, background: "#fff", borderTop: "1px solid var(--border-soft)", display: "flex", justifyContent: "space-around", alignItems: "center" }}>
                  {["layout-dashboard", "folder-open", "sparkles", "chart-no-axes-column"].map((ic, i) => <Icon key={ic} name={ic} size={17} style={{ color: i === 0 ? "var(--accent-deep)" : "var(--grey-300)" }} />)}
                </div>
              </div>
            </div>
            <div className="row gap-s" style={{ justifyContent: "center", marginTop: 16, fontSize: 13, fontWeight: 600, color: "var(--grey-700)" }}><Icon name="smartphone" size={16} style={{ color: "var(--accent)" }} />Mobile · 390px</div>
          </div>
        </div>
      </div>
      <div className="grid g-3 stagger" style={{ marginTop: 22 }}>
        {[["panel-left", "Sidebar adaptif", "Penuh di desktop, rail ikon di tablet, tab bar bawah di mobile."], ["move-horizontal", "Builder responsif", "Panel style menjadi bottom sheet; preview tetap WYSIWYG."], ["hand", "Target sentuh 44px", "Semua elemen interaktif memenuhi minimum hit target mobile."]].map(([ic, t, d]) => (
          <div key={t} className="card card-pad">
            <span className="si" style={{ margin: "0 0 12px" }}><Icon name={ic} size={20} /></span>
            <div className="sec-title" style={{ fontSize: 14.5 }}>{t}</div>
            <p style={{ fontSize: 12.5, color: "var(--grey-500)", lineHeight: 1.5, marginTop: 6 }}>{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { PricingEngine, Analytics, Responsive });
