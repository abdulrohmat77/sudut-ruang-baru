/* ============================================================
   Proposal Creation Wizard — 9 steps
   ============================================================ */
function Wizard({ go }) {
  const steps = SRA.wizardSteps;
  const [si, setSi] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);

  const [form, setForm] = useState({
    name: "Manggo Villa — Design & Build",
    type: "Design & Build",
    location: "Ubud, Bali",
    area: "640",
    summary: "Retret tropis kontemporer dengan kolam infinity, void cahaya alami, dan material lokal yang jujur pada teksturnya.",
    client: "PT Manggo Properti", contact: "Ibu Sari Manggala", sector: "Korporat", email: "sari@manggo.co.id",
    services: ["design-build", "architecture", "interior", "landscape"],
    scope: ["Konsep desain & moodboard", "Gambar kerja (DED)", "Visualisasi 3D / render", "RAB & estimasi biaya", "Manajemen konstruksi"],
    method: [1, 2, 3, 4],
    team: ["habib", "patricia", "rasia"],
    portfolio: ["ubud-villa", "kyoto-gion", "ikn-minister"],
    feeModel: "Persentase",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggle = (k, v) => setForm((f) => ({ ...f, [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] }));

  const genStages = ["Menyusun struktur proposal…", "Menulis konten dengan AI…", "Menata layout & cover…", "Menyisipkan portofolio & RAB…", "Finalisasi draft"];

  function generate() {
    setGenerating(true); setGenStep(0);
    let k = 0;
    const tick = () => {
      k++; setGenStep(k);
      if (k < genStages.length) setTimeout(tick, 720);
      else setTimeout(() => go("builder"), 700);
    };
    setTimeout(tick, 600);
  }

  const cur = steps[si];

  if (generating) {
    return (
      <div className="page fade-in" style={{ maxWidth: 620, display: "grid", placeItems: "center", minHeight: "70vh" }}>
        <div className="card card-pad" style={{ width: "100%", textAlign: "center", padding: 44 }}>
          <div className="si" style={{ margin: "0 auto 22px", width: 64, height: 64, background: "var(--grad-navy)", color: "#fff" }}>
            <Icon name="sparkles" size={30} />
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: "var(--deep-navy)", letterSpacing: "-.02em" }}>Menghasilkan proposal Anda</h3>
          <p className="page-sub" style={{ marginBottom: 28 }}>AI sedang menyusun {form.name}</p>
          <div className="grid" style={{ gap: 12, textAlign: "left", maxWidth: 380, margin: "0 auto" }}>
            {genStages.map((s, i) => (
              <div key={i} className="row gap-s" style={{ fontSize: 13.5, fontWeight: 600, color: i < genStep ? "var(--deep-navy)" : i === genStep ? "var(--bright-blue)" : "var(--grey-300)" }}>
                <Icon name={i < genStep ? "circle-check-big" : i === genStep ? "loader-circle" : "circle"} size={18}
                  style={{ color: i < genStep ? "var(--ok)" : i === genStep ? "var(--accent)" : "var(--grey-200)", animation: i === genStep ? "spin 1s linear infinite" : "none" }} />
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page fade-in" style={{ maxWidth: 1180 }}>
      <PageHead eyebrow="Buat Proposal" title="Proposal Creation Wizard" sub="Sembilan langkah terstruktur — AI mengisi sisanya." />
      <div className="grid" style={{ gridTemplateColumns: "260px 1fr", alignItems: "start", gap: 26 }}>
        {/* STEP RAIL */}
        <div className="card card-pad" style={{ position: "sticky", top: 8 }}>
          {steps.map((s, i) => (
            <button key={s.key} onClick={() => setSi(i)} className="row gap-m" style={{ width: "100%", textAlign: "left", padding: "10px 8px", borderRadius: 10, background: i === si ? "var(--tint-050)" : "transparent" }}>
              <span style={{ width: 30, height: 30, borderRadius: 99, display: "grid", placeItems: "center", flexShrink: 0, fontSize: 12, fontWeight: 700,
                background: i < si ? "var(--ok)" : i === si ? "var(--accent)" : "var(--grey-100)", color: i <= si ? "#fff" : "var(--grey-500)" }}>
                {i < si ? <Icon name="check" size={15} /> : s.n}
              </span>
              <span style={{ fontSize: 13, fontWeight: i === si ? 700 : 500, color: i === si ? "var(--deep-navy)" : "var(--grey-500)", lineHeight: 1.3 }}>{s.label}</span>
            </button>
          ))}
        </div>

        {/* STEP CONTENT */}
        <div className="card" style={{ minHeight: 460, display: "flex", flexDirection: "column" }}>
          <div className="card-pad" style={{ flex: 1, padding: 32 }}>
            <div className="row gap-m" style={{ marginBottom: 26 }}>
              <span className="si" style={{ margin: 0, width: 46, height: 46 }}><Icon name={cur.icon} size={22} /></span>
              <div>
                <div className="caption" style={{ color: "var(--accent)" }}>Langkah {cur.n} dari 9</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--deep-navy)", letterSpacing: "-.01em" }}>{cur.label}</h2>
              </div>
            </div>

            <div className="fade-in" key={si}>
              {si === 0 && <StepFields>
                <Field label="Nama Proyek"><input className="winput" value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
                <div className="grid g-2" style={{ gap: 16 }}>
                  <Field label="Jenis Proposal"><Selectish value={form.type} options={SRA.proposalTypes} onChange={(v) => set("type", v)} /></Field>
                  <Field label="Lokasi"><input className="winput" value={form.location} onChange={(e) => set("location", e.target.value)} /></Field>
                </div>
                <Field label="Luas (m²)"><input className="winput" value={form.area} onChange={(e) => set("area", e.target.value)} style={{ maxWidth: 200 }} /></Field>
                <Field label="Ringkasan Proyek"><textarea className="winput" rows={3} value={form.summary} onChange={(e) => set("summary", e.target.value)} /></Field>
              </StepFields>}

              {si === 1 && <StepFields>
                <div className="grid g-2" style={{ gap: 16 }}>
                  <Field label="Nama Klien / Instansi"><input className="winput" value={form.client} onChange={(e) => set("client", e.target.value)} /></Field>
                  <Field label="Kontak Person"><input className="winput" value={form.contact} onChange={(e) => set("contact", e.target.value)} /></Field>
                </div>
                <Field label="Sektor"><div className="seg">{["Pemerintah", "Korporat", "Hunian Premium"].map((s) => <button key={s} className={form.sector === s ? "on" : ""} onClick={() => set("sector", s)}>{s}</button>)}</div></Field>
                <Field label="Email"><input className="winput" value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
              </StepFields>}

              {si === 2 && <div className="grid g-2 stagger" style={{ gap: 14 }}>
                {[["design-build","Design & Build"],["architecture","Architecture"],["interior","Interior"],["landscape","Landscape"],["planning-supervision","Planning & Supervision"],["cost-estimate","Cost Estimate"]].map(([k, n]) => {
                  const on = form.services.includes(k);
                  return <button key={k} onClick={() => toggle("services", k)} className="row between" style={{ padding: "16px 18px", borderRadius: 12, border: "1.5px solid " + (on ? "var(--accent)" : "var(--border)"), background: on ? "var(--tint-050)" : "#fff" }}>
                    <span className="row gap-s" style={{ fontWeight: 600, fontSize: 14, color: "var(--deep-navy)" }}><Icon name="layers" size={16} style={{ color: "var(--accent)" }} />{n}</span>
                    <Icon name={on ? "circle-check-big" : "circle"} size={20} style={{ color: on ? "var(--ok)" : "var(--grey-300)" }} />
                  </button>;
                })}
              </div>}

              {si === 3 && <div className="grid stagger" style={{ gap: 10 }}>
                {form.scope.concat(["Permit & perizinan", "Animasi eksterior"]).map((s, i) => {
                  const on = form.scope.includes(s);
                  return <button key={s} onClick={() => toggle("scope", s)} className="row gap-m" style={{ padding: "13px 16px", borderRadius: 10, border: "1px solid var(--border-soft)", background: on ? "var(--tint-050)" : "#fff", textAlign: "left" }}>
                    <Icon name={on ? "square-check-big" : "square"} size={19} style={{ color: on ? "var(--accent)" : "var(--grey-300)" }} />
                    <span style={{ fontSize: 14, fontWeight: 500, color: "var(--deep-navy)" }}>{s}</span>
                  </button>;
                })}
              </div>}

              {si === 4 && <div className="grid g-2 stagger" style={{ gap: 14 }}>
                {[[1,"Termin 1 — Down Payment","30%","Briefing, data tapak, konsep awal"],[2,"Termin 2 — Schematic Design","30%","Layout, zoning, massing, fasad"],[3,"Termin 3 — Design Development","30%","Detail, render 3D, RAB awal"],[4,"Termin 4 — Final Documentation","10%","Gambar kerja DED, spec, RAB final"]].map(([n, t, pct, d]) => {
                  const on = form.method.includes(n);
                  return <button key={n} onClick={() => toggle("method", n)} className="card-pad" style={{ textAlign: "left", borderRadius: 12, border: "1.5px solid " + (on ? "var(--accent)" : "var(--border)"), background: on ? "var(--tint-050)" : "#fff", padding: 18 }}>
                    <div className="row between" style={{ marginBottom: 8 }}>
                      <span className="badge" style={{ color: "var(--bright-blue)", background: "var(--tint-100)" }}>{pct}</span>
                      <Icon name={on ? "circle-check-big" : "circle"} size={18} style={{ color: on ? "var(--ok)" : "var(--grey-300)" }} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: "var(--deep-navy)" }}>{t}</div>
                    <div style={{ fontSize: 12, color: "var(--grey-500)", marginTop: 4, lineHeight: 1.45 }}>{d}</div>
                  </button>;
                })}
              </div>}

              {si === 5 && <div className="grid stagger" style={{ gap: 10 }}>
                {SRA.team.map((m) => {
                  const on = form.team.includes(m.id);
                  return <button key={m.id} onClick={() => toggle("team", m.id)} className="row between" style={{ padding: 14, borderRadius: 12, border: "1.5px solid " + (on ? "var(--accent)" : "var(--border)"), background: on ? "var(--tint-050)" : "#fff" }}>
                    <span className="row gap-m"><Avatar m={m} size={40} /><span style={{ textAlign: "left" }}><b style={{ fontSize: 14, color: "var(--deep-navy)", display: "block" }}>{m.name}</b><span style={{ fontSize: 12, color: "var(--grey-500)" }}>{m.role}</span></span></span>
                    <Icon name={on ? "circle-check-big" : "circle"} size={20} style={{ color: on ? "var(--ok)" : "var(--grey-300)" }} />
                  </button>;
                })}
              </div>}

              {si === 6 && <div className="grid g-3 stagger" style={{ gap: 14 }}>
                {SRA.projects.slice(0, 6).map((p) => {
                  const on = form.portfolio.includes(p.id);
                  return <button key={p.id} onClick={() => toggle("portfolio", p.id)} className="card" style={{ overflow: "hidden", border: "1.5px solid " + (on ? "var(--accent)" : "var(--border-soft)"), textAlign: "left" }}>
                    <div className="scrim-grid" style={{ height: 80, background: `linear-gradient(150deg,${p.tone},var(--deep-navy))`, position: "relative" }}>
                      {on && <span style={{ position: "absolute", top: 8, right: 8, background: "#fff", borderRadius: 99, display: "grid", placeItems: "center", width: 24, height: 24 }}><Icon name="check" size={15} style={{ color: "var(--ok)" }} /></span>}
                    </div>
                    <div style={{ padding: "10px 12px" }}><div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--deep-navy)", lineHeight: 1.3 }}>{p.name}</div><div style={{ fontSize: 11, color: "var(--grey-500)", marginTop: 2 }}>{p.scope}</div></div>
                  </button>;
                })}
              </div>}

              {si === 7 && <StepFields>
                <Field label="Model Fee"><div className="seg">{["Lump Sum", "Persentase", "Unit Rate", "Custom"].map((s) => <button key={s} className={form.feeModel === s ? "on" : ""} onClick={() => set("feeModel", s)}>{s}</button>)}</div></Field>
                <div className="card-pad" style={{ background: "var(--tint-050)", borderRadius: 12, border: "1px solid var(--tint-100)" }}>
                  {[["Desain Arsitektur — Premium (640 m² × Rp 200rb)", "Rp 128 jt"], ["Interior — Premium", "Rp 96 jt"], ["Lansekap — Premium", "Rp 42 jt"]].map(([l, v]) => (
                    <div key={l} className="row between" style={{ padding: "9px 0", borderBottom: "1px solid var(--border-soft)", fontSize: 13.5 }}><span style={{ color: "var(--grey-700)" }}>{l}</span><b style={{ color: "var(--deep-navy)" }}>{v}</b></div>
                  ))}
                  <div className="row between" style={{ padding: "9px 0", fontSize: 13.5, color: "var(--grey-500)" }}><span>PPN 11%</span><span>Rp 29,3 jt</span></div>
                  <div className="row between" style={{ paddingTop: 12, fontSize: 15 }}><b style={{ color: "var(--deep-navy)" }}>Total Estimasi</b><b style={{ color: "var(--bright-blue)", fontSize: 18 }}>Rp 295,3 jt</b></div>
                </div>
              </StepFields>}

              {si === 8 && <div>
                <div className="grid g-2" style={{ gap: 14, marginBottom: 20 }}>
                  {[["Proyek", form.name], ["Klien", form.client], ["Jenis", form.type], ["Layanan", form.services.length + " dipilih"], ["Tim", form.team.length + " personel"], ["Portofolio", form.portfolio.length + " karya"]].map(([l, v]) => (
                    <div key={l} className="row between" style={{ padding: "12px 16px", background: "var(--tint-050)", borderRadius: 10, fontSize: 13.5 }}><span style={{ color: "var(--grey-500)" }}>{l}</span><b style={{ color: "var(--deep-navy)" }}>{v}</b></div>
                  ))}
                </div>
                <div className="card-pad" style={{ background: "var(--grad-navy)", borderRadius: 14, color: "#fff", textAlign: "center", padding: 28 }}>
                  <Icon name="sparkles" size={26} style={{ color: "var(--sky-blue)" }} />
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: "10px 0 6px" }}>Siap dihasilkan</h3>
                  <p style={{ fontSize: 13, color: "var(--fg-muted-dark,#B9CFE0)", marginBottom: 18 }}>AI akan menyusun draft lengkap dengan tone Strategic dalam ±90 detik.</p>
                  <button className="btn btn-primary" onClick={generate} style={{ margin: "0 auto" }}><Icon name="wand-sparkles" size={17} />Generate Proposal</button>
                </div>
              </div>}
            </div>
          </div>

          {/* footer nav */}
          <div className="row between" style={{ padding: "16px 24px", borderTop: "1px solid var(--border-soft)" }}>
            <button className="btn btn-ghost" disabled={si === 0} style={{ opacity: si === 0 ? .4 : 1 }} onClick={() => setSi((s) => Math.max(0, s - 1))}><Icon name="arrow-left" size={16} />Kembali</button>
            <span className="caption">{si + 1} / 9</span>
            {si < 8
              ? <button className="btn btn-primary" onClick={() => setSi((s) => Math.min(8, s + 1))}>Lanjut<Icon name="arrow-right" size={16} /></button>
              : <button className="btn btn-primary" onClick={generate}><Icon name="sparkles" size={16} />Generate</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepFields({ children }) { return <div className="grid" style={{ gap: 18 }}>{children}</div>; }
function Field({ label, children }) {
  return <div><label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--grey-700)", marginBottom: 7 }}>{label}</label>{children}</div>;
}
function Selectish({ value, options, onChange }) {
  return <select className="winput" value={value} onChange={(e) => onChange(e.target.value)}>{options.map((o) => <option key={o}>{o}</option>)}</select>;
}

Object.assign(window, { Wizard });
