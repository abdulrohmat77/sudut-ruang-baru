/* ============================================================
   Proposal Builder — sections · live preview · style controls
   ============================================================ */
function Builder({ go }) {
  const blocks = SRA.builderBlocks;
  const [active, setActive] = useState("cover");
  const [accent, setAccent] = useState("#4AB3D8");
  const [cover, setCover] = useState("navy");
  const [layout, setLayout] = useState("classic");
  const [zoom, setZoom] = useState(0.7);
  const previewRef = useRef(null);
  const blockRefs = useRef({});

  const scrollTo = (id) => {
    setActive(id);
    const el = blockRefs.current[id];
    if (el && previewRef.current) previewRef.current.scrollTop = el.offsetTop - 24;
  };

  const coverStyles = {
    navy: { background: "var(--grad-navy)", color: "#fff" },
    photo: { background: `linear-gradient(160deg, rgba(4,54,102,.4), rgba(4,54,102,.85)), linear-gradient(135deg,#1E7FB8,#022747)`, color: "#fff" },
    light: { background: "var(--light-blue)", color: "var(--deep-navy)" },
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "236px 1fr 264px", height: "100%", overflow: "hidden" }}>
      {/* LEFT — sections */}
      <div style={{ borderRight: "1px solid var(--border-soft)", background: "#fff", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "18px 18px 12px" }}>
          <div className="eyebrow">Manggo Villa</div>
          <div className="row between" style={{ marginTop: 10 }}>
            <span className="sec-title" style={{ fontSize: 14 }}>Bagian</span>
            <span className="chip">{blocks.length}</span>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 12px 12px" }}>
          {blocks.map((b, i) => (
            <button key={b.id} onClick={() => scrollTo(b.id)} className="row gap-s sb-item" style={{ marginBottom: 2, background: active === b.id ? "var(--tint-100)" : "transparent" }}>
              <Icon name="grip-vertical" size={15} style={{ color: "var(--grey-300)" }} />
              <Icon name={b.icon} size={16} style={{ color: active === b.id ? "var(--accent-deep)" : "var(--grey-500)" }} />
              <span style={{ fontSize: 13, fontWeight: active === b.id ? 600 : 500, color: active === b.id ? "var(--deep-navy)" : "var(--grey-700)" }}>{b.label}</span>
            </button>
          ))}
          <button className="row gap-s" style={{ width: "100%", padding: "10px 12px", marginTop: 8, borderRadius: 10, border: "1.5px dashed var(--border)", color: "var(--grey-500)", fontSize: 13, fontWeight: 600 }}>
            <Icon name="plus" size={16} />Tambah Bagian
          </button>
        </div>
      </div>

      {/* CENTER — live preview */}
      <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", background: "#eef3f7" }}>
        <div className="row between" style={{ padding: "12px 22px", borderBottom: "1px solid var(--border-soft)", background: "rgba(254,254,254,.8)", backdropFilter: "blur(8px)" }}>
          <div className="row gap-s">
            <span className="chip" style={{ background: "var(--ok-bg)", color: "var(--ok)" }}><span className="bdot" />Tersimpan</span>
            <span className="caption">Diperbarui 2 menit lalu</span>
          </div>
          <div className="row gap-s">
            <div className="seg">
              <button className={zoom === 0.55 ? "on" : ""} onClick={() => setZoom(0.55)}><Icon name="minimize-2" size={14} /></button>
              <button className={zoom === 0.7 ? "on" : ""} onClick={() => setZoom(0.7)}>70%</button>
              <button className={zoom === 0.85 ? "on" : ""} onClick={() => setZoom(0.85)}><Icon name="maximize-2" size={14} /></button>
            </div>
            <button className="btn btn-outline btn-sm"><Icon name="eye" size={15} />Preview</button>
            <div className="row" style={{ position: "relative" }}>
              <button className="btn btn-primary btn-sm"><Icon name="download" size={15} />Export</button>
            </div>
          </div>
        </div>

        <div ref={previewRef} style={{ flex: 1, overflowY: "auto", padding: "32px 0", display: "flex", justifyContent: "center" }}>
          <div style={{ width: 794, transform: `scale(${zoom})`, transformOrigin: "top center", display: "grid", gap: 24 }}>
            {/* COVER */}
            <Page setRef={(el) => (blockRefs.current.cover = el)}>
              <div className="scrim-grid" style={{ ...coverStyles[cover], minHeight: 1010, padding: 64, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div className="row between">
                  <img src="assets/logo-mark.png" style={{ height: 56, filter: cover === "light" ? "none" : "brightness(0) invert(1)" }} alt="" />
                  <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: ".16em", textTransform: "uppercase", opacity: .8 }}>SRA · 2026</span>
                </div>
                <div>
                  <div style={{ width: 60, height: 4, background: accent, marginBottom: 28 }} />
                  <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: ".18em", textTransform: "uppercase", color: accent, marginBottom: 18 }}>Design &amp; Build Proposal</div>
                  <h1 style={{ fontSize: 58, fontWeight: 800, letterSpacing: "-.02em", lineHeight: 1.05 }}>Manggo Villa</h1>
                  <p style={{ fontSize: 19, marginTop: 18, opacity: .85, maxWidth: 480, lineHeight: 1.5 }}>Retret tropis kontemporer untuk PT Manggo Properti · Ubud, Bali</p>
                </div>
                <div className="row between" style={{ fontSize: 14, opacity: .8 }}>
                  <span>Disusun oleh Sudut Ruang Arsitek</span>
                  <span>REF · SRA-2026-0612</span>
                </div>
              </div>
            </Page>

            {/* CONTENT PAGE */}
            <Page setRef={(el) => { blockRefs.current.summary = el; blockRefs.current.understanding = el; blockRefs.current.concept = el; }}>
              <div style={{ padding: 64, minHeight: 1010 }}>
                <div className="row between" style={{ borderBottom: "2px solid " + accent, paddingBottom: 14, marginBottom: 36 }}>
                  <img src="assets/logo-mark.png" style={{ height: 28 }} alt="" />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--grey-500)", letterSpacing: ".1em" }}>EXECUTIVE SUMMARY</span>
                </div>
                {SRA.aiSections.map((s) => (
                  <div key={s.id} style={{ marginBottom: 38 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: accent, marginBottom: 12 }}>{s.label}</div>
                    <h2 style={{ fontSize: 26, fontWeight: 800, color: "var(--deep-navy)", letterSpacing: "-.01em", marginBottom: 14 }}>{s.label === "Executive Summary" ? "Tropis yang tumbuh bersama Anda." : s.label}</h2>
                    <p style={{ fontSize: 16, lineHeight: 1.75, color: "var(--grey-700)" }}>{s.text}</p>
                  </div>
                ))}
              </div>
            </Page>

            {/* PRICING PAGE */}
            <Page setRef={(el) => { blockRefs.current.pricing = el; blockRefs.current.method = el; blockRefs.current.team = el; blockRefs.current.portfolio = el; blockRefs.current.closing = el; }}>
              <div style={{ padding: 64, minHeight: 1010 }}>
                <div className="row between" style={{ borderBottom: "2px solid " + accent, paddingBottom: 14, marginBottom: 36 }}>
                  <img src="assets/logo-mark.png" style={{ height: 28 }} alt="" />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--grey-500)", letterSpacing: ".1em" }}>INVESTASI</span>
                </div>
                <h2 style={{ fontSize: 26, fontWeight: 800, color: "var(--deep-navy)", marginBottom: 24 }}>Struktur Investasi &amp; Termin</h2>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
                  <tbody>
                    {[["Desain Arsitektur — Premium", "Rp 128.000.000"], ["Desain Interior — Premium", "Rp 96.000.000"], ["Desain Lansekap — Premium", "Rp 42.000.000"], ["PPN 11%", "Rp 29.260.000"]].map(([l, v]) => (
                      <tr key={l}><td style={{ padding: "14px 0", borderBottom: "1px solid var(--border-soft)", color: "var(--grey-700)" }}>{l}</td><td style={{ padding: "14px 0", borderBottom: "1px solid var(--border-soft)", textAlign: "right", fontWeight: 700, color: "var(--deep-navy)" }}>{v}</td></tr>
                    ))}
                    <tr><td style={{ padding: "18px 0", fontWeight: 800, fontSize: 18, color: "var(--deep-navy)" }}>Total Estimasi</td><td style={{ padding: "18px 0", textAlign: "right", fontWeight: 800, fontSize: 22, color: accent }}>Rp 295.260.000</td></tr>
                  </tbody>
                </table>
                <div style={{ marginTop: 40, padding: 36, background: "var(--light-blue)", borderRadius: 16, textAlign: "center" }}>
                  <p style={{ fontSize: 20, fontWeight: 700, color: "var(--deep-navy)", lineHeight: 1.5, fontStyle: "italic" }}>"Kami tidak hanya merancang ruang. Kami merancang hasil."</p>
                  <p style={{ fontSize: 14, color: "var(--grey-500)", marginTop: 12 }}>Sudut Ruang Arsitek · Designing Corners · Defining Spaces</p>
                </div>
              </div>
            </Page>
          </div>
        </div>
      </div>

      {/* RIGHT — style controls */}
      <div style={{ borderLeft: "1px solid var(--border-soft)", background: "#fff", overflowY: "auto", padding: 20 }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>Style</div>

        <Control label="Layout Preset">
          <div className="grid g-3" style={{ gap: 8 }}>
            {["classic", "modern", "bold"].map((l) => (
              <button key={l} onClick={() => setLayout(l)} style={{ borderRadius: 9, border: "1.5px solid " + (layout === l ? "var(--accent)" : "var(--border)"), padding: 6, background: layout === l ? "var(--tint-050)" : "#fff" }}>
                <div style={{ height: 38, borderRadius: 4, background: "var(--grey-100)", display: "flex", flexDirection: "column", gap: 3, padding: 5 }}>
                  <div style={{ height: 4, width: l === "bold" ? "80%" : "55%", background: "var(--grey-300)", borderRadius: 2 }} />
                  <div style={{ height: 3, background: "var(--grey-200)", borderRadius: 2 }} />
                  <div style={{ height: 3, width: "70%", background: "var(--grey-200)", borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 10.5, fontWeight: 600, marginTop: 5, color: layout === l ? "var(--deep-navy)" : "var(--grey-500)", textTransform: "capitalize" }}>{l}</div>
              </button>
            ))}
          </div>
        </Control>

        <Control label="Cover Style">
          <div className="grid g-3" style={{ gap: 8 }}>
            {[["navy", "var(--grad-navy)"], ["photo", "linear-gradient(135deg,#1E7FB8,#022747)"], ["light", "var(--light-blue)"]].map(([k, bg]) => (
              <button key={k} onClick={() => setCover(k)} style={{ borderRadius: 9, overflow: "hidden", border: "2px solid " + (cover === k ? "var(--accent)" : "transparent") }}>
                <div style={{ height: 46, background: bg }} />
                <div style={{ fontSize: 10.5, fontWeight: 600, padding: "5px 0", color: cover === k ? "var(--deep-navy)" : "var(--grey-500)", textTransform: "capitalize" }}>{k}</div>
              </button>
            ))}
          </div>
        </Control>

        <Control label="Warna Aksen">
          <div className="row gap-s" style={{ flexWrap: "wrap" }}>
            {["#4AB3D8", "#045D93", "#043666", "#1E7FB8", "#0A3863"].map((c) => (
              <button key={c} onClick={() => setAccent(c)} style={{ width: 34, height: 34, borderRadius: 9, background: c, border: "3px solid " + (accent === c ? "var(--accent)" : "#fff"), boxShadow: accent === c ? "0 0 0 1.5px var(--accent)" : "var(--shadow-xs)" }} />
            ))}
          </div>
        </Control>

        <Control label="Tipografi">
          <select className="winput"><option>Montserrat (Brand)</option><option>Poppins</option><option>Inter</option></select>
        </Control>

        <Control label="Kepadatan">
          <div className="seg" style={{ width: "100%" }}>{["Rapat", "Normal", "Lega"].map((d, i) => <button key={d} className={i === 1 ? "on" : ""} style={{ flex: 1 }}>{d}</button>)}</div>
        </Control>

        <div className="divider" style={{ margin: "18px 0" }} />
        <button className="btn btn-navy" style={{ width: "100%", justifyContent: "center" }} onClick={() => go("ai")}><Icon name="sparkles" size={16} />Sempurnakan dengan AI</button>
      </div>
    </div>
  );
}

function Page({ children, setRef }) {
  return <div ref={setRef} className="card" style={{ overflow: "hidden", boxShadow: "var(--shadow-md)", borderRadius: 4 }}>{children}</div>;
}
function Control({ label, children }) {
  return <div style={{ marginBottom: 20 }}><div style={{ fontSize: 12, fontWeight: 600, color: "var(--grey-700)", marginBottom: 10 }}>{label}</div>{children}</div>;
}

Object.assign(window, { Builder });
