/* ============================================================
   Library screens — Proposals · Templates · Assets
   ============================================================ */

/* ---------------- PROPOSAL LIBRARY ---------------- */
function ProposalLibrary({ go }) {
  const [status, setStatus] = useState("All");
  const [q, setQ] = useState("");
  const [view, setView] = useState("list");
  const filters = ["All", "Draft", "Review", "Submitted", "Won", "Lost"];

  const list = SRA.proposals.filter((p) =>
    (status === "All" || p.status === status) &&
    (q === "" || (p.title + p.client).toLowerCase().includes(q.toLowerCase()))
  );

  const folders = [...new Set(SRA.proposals.map((p) => p.folder))];

  return (
    <div className="page fade-in">
      <PageHead
        eyebrow="Workspace"
        title="Proposals"
        sub="248 proposal · 31 aktif · diorganisir per folder, status, dan tag."
        actions={[
          <button key="b" className="btn btn-primary" onClick={() => go("wizard")}><Icon name="plus" size={17} />Buat Proposal</button>,
        ]}
      />

      <div className="row between" style={{ marginBottom: 18, gap: 14, flexWrap: "wrap" }}>
        <div className="seg">
          {filters.map((f) => (
            <button key={f} className={status === f ? "on" : ""} onClick={() => setStatus(f)}>{f}</button>
          ))}
        </div>
        <div className="filterbar">
          <div className="tb-search" style={{ margin: 0, maxWidth: 260, background: "#fff", border: "1px solid var(--border)" }}>
            <Icon name="search" size={15} />
            <input placeholder="Cari proposal…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <button className="pill-filter"><Icon name="arrow-up-down" size={14} />Terbaru</button>
          <div className="seg">
            <button className={view === "list" ? "on" : ""} onClick={() => setView("list")}><Icon name="list" size={15} /></button>
            <button className={view === "folder" ? "on" : ""} onClick={() => setView("folder")}><Icon name="folder" size={15} /></button>
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="card"><div className="empty">
          <div className="eo"><Icon name="search-x" size={40} /></div>
          <h3>Tidak ada proposal ditemukan</h3>
          <p>Coba ubah filter status atau kata kunci pencarian Anda.</p>
          <button className="btn btn-outline" onClick={() => { setStatus("All"); setQ(""); }}>Reset filter</button>
        </div></div>
      ) : view === "folder" ? (
        <div className="grid g-3 stagger">
          {folders.map((f) => {
            const items = SRA.proposals.filter((p) => p.folder === f);
            const val = items.reduce((s, p) => s + p.value, 0);
            return (
              <div key={f} className="card card-hover card-pad" onClick={() => setView("list")}>
                <div className="row between" style={{ marginBottom: 16 }}>
                  <span className="si" style={{ margin: 0, width: 44, height: 44, background: "var(--tint-100)" }}><Icon name="folder" size={22} /></span>
                  <span className="chip">{items.length} proposal</span>
                </div>
                <div className="sec-title">{f}</div>
                <div className="page-sub" style={{ marginTop: 4 }}>Total nilai {SRA.rupiah(val)}</div>
                <div className="av-stack" style={{ marginTop: 16 }}>
                  {[...new Set(items.map((p) => p.owner))].slice(0, 4).map((id) => <Avatar key={id} m={SRA.memberById(id)} size={28} />)}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card fade-in">
          <table className="tbl">
            <thead><tr>
              <th>Proposal</th><th>Tipe</th><th>Status</th><th>Nilai</th><th>Owner</th><th>Diperbarui</th><th style={{ width: 110 }}>Progress</th>
            </tr></thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} onClick={() => go("builder")}>
                  <td>
                    <div className="pname">{p.title}</div>
                    <div className="pclient">{p.client} · {p.deadline}</div>
                  </td>
                  <td><span className="chip">{p.type}</span></td>
                  <td><StatusBadge status={p.status} /></td>
                  <td style={{ fontWeight: 700, color: "var(--deep-navy)" }}>{SRA.rupiah(p.value)}</td>
                  <td><Avatar m={SRA.memberById(p.owner)} size={28} /></td>
                  <td style={{ color: "var(--grey-500)", fontSize: 12.5 }}>{p.updated}</td>
                  <td><div className="row gap-s"><Progress value={p.progress} /><span style={{ fontSize: 11, fontWeight: 700, color: "var(--grey-500)" }}>{p.progress}%</span></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------------- TEMPLATE LIBRARY ---------------- */
function TemplateLibrary({ go }) {
  const cats = ["Semua", ...new Set(SRA.templates.map((t) => t.cat))];
  const [cat, setCat] = useState("Semua");
  const list = SRA.templates.filter((t) => cat === "Semua" || t.cat === cat);
  const heroBg = { navy: "var(--grad-navy)", blue: "linear-gradient(150deg,#0A3863,#045D93)", sky: "var(--grad-brand)" };

  return (
    <div className="page fade-in">
      <PageHead
        eyebrow="Workspace"
        title="Template Library"
        sub="Mulai dari kerangka teruji — masing-masing dengan estimasi waktu & bagian standar."
        actions={[<button key="b" className="btn btn-outline"><Icon name="plus" size={16} />Template Baru</button>]}
      />
      <div className="row gap-s" style={{ marginBottom: 22, flexWrap: "wrap" }}>
        {cats.map((c) => (
          <button key={c} className="pill-filter" onClick={() => setCat(c)}
            style={{ borderColor: cat === c ? "var(--accent)" : "var(--border)", background: cat === c ? "var(--tint-050)" : "#fff", color: cat === c ? "var(--deep-navy)" : "var(--grey-700)" }}>{c}</button>
        ))}
      </div>
      <div className="grid g-3 stagger">
        {list.map((t) => (
          <div key={t.id} className="card card-hover" style={{ overflow: "hidden" }} onClick={() => go("wizard")}>
            <div className="scrim-grid" style={{ height: 132, background: heroBg[t.hero], position: "relative", display: "grid", placeItems: "center" }}>
              <img src="assets/logo-mark.png" alt="" style={{ height: 52, filter: "brightness(0) invert(1)", opacity: .92 }} />
              <span className="badge" style={{ position: "absolute", top: 14, left: 14, color: "var(--deep-navy)", background: "rgba(255,255,255,.92)" }}>{t.cat}</span>
            </div>
            <div className="card-pad" style={{ padding: 20 }}>
              <div className="sec-title">{t.name}</div>
              <p style={{ fontSize: 13, color: "var(--grey-500)", lineHeight: 1.55, margin: "8px 0 16px", minHeight: 60 }}>{t.desc}</p>
              <div className="row gap-m" style={{ fontSize: 12, color: "var(--grey-500)", fontWeight: 600 }}>
                <span className="row gap-s"><Icon name="layers" size={14} style={{ color: "var(--accent)" }} />{t.sections} bagian</span>
                <span className="dot-sep" />
                <span className="row gap-s"><Icon name="clock" size={14} style={{ color: "var(--accent)" }} />{t.time}</span>
                <span className="dot-sep" />
                <span className="row gap-s"><Icon name="users" size={14} style={{ color: "var(--accent)" }} />{t.uses}×</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- ASSET LIBRARY ---------------- */
function AssetLibrary() {
  const tabs = [
    { k: "portfolio", label: "Portfolio", icon: "image" },
    { k: "team", label: "Tim & CV", icon: "users" },
    { k: "cert", label: "Sertifikasi", icon: "badge-check" },
    { k: "brand", label: "Brand Assets", icon: "palette" },
  ];
  const [tab, setTab] = useState("portfolio");

  return (
    <div className="page fade-in">
      <PageHead
        eyebrow="Workspace"
        title="Asset Library"
        sub="Portofolio, profil tim, CV, sertifikasi & aset brand — siap disisipkan ke proposal mana pun."
        actions={[<button key="b" className="btn btn-outline"><Icon name="upload" size={16} />Unggah Aset</button>]}
      />
      <div className="seg" style={{ marginBottom: 22 }}>
        {tabs.map((t) => (
          <button key={t.k} className={tab === t.k ? "on" : ""} onClick={() => setTab(t.k)}>
            <span className="row gap-s"><Icon name={t.icon} size={15} />{t.label}</span>
          </button>
        ))}
      </div>

      {tab === "portfolio" && (
        <div className="grid g-4 stagger">
          {SRA.projects.map((p) => (
            <div key={p.id} className="card card-hover" style={{ overflow: "hidden" }}>
              <div className="scrim-grid" style={{ height: 140, background: `linear-gradient(150deg, ${p.tone}, var(--deep-navy))`, position: "relative", display: "grid", placeItems: "center" }}>
                <Icon name="image" size={30} style={{ color: "rgba(255,255,255,.5)" }} />
                <span className="badge" style={{ position: "absolute", top: 12, left: 12, color: "var(--deep-navy)", background: "rgba(255,255,255,.92)" }}>{p.cat}</span>
                <span style={{ position: "absolute", bottom: 12, right: 14, fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.85)" }}>{p.year}</span>
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--deep-navy)", lineHeight: 1.3 }}>{p.name}</div>
                <div className="row gap-s" style={{ marginTop: 8, fontSize: 11.5, color: "var(--grey-500)", fontWeight: 600 }}>
                  <Icon name="ruler" size={13} style={{ color: "var(--accent)" }} />{p.scope}
                </div>
                <div className="row gap-s" style={{ marginTop: 5, fontSize: 11.5, color: "var(--grey-500)" }}>
                  <Icon name="map-pin" size={13} style={{ color: "var(--grey-300)" }} />{p.loc}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "team" && (
        <div className="grid g-3 stagger">
          {SRA.team.map((m) => (
            <div key={m.id} className="card card-pad card-hover">
              <div className="row gap-m">
                <Avatar m={m} size={56} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15.5, color: "var(--deep-navy)" }}>{m.name}</div>
                  <div style={{ fontSize: 12.5, color: "var(--bright-blue)", fontWeight: 600, marginTop: 2 }}>{m.role}</div>
                </div>
              </div>
              <div className="divider" style={{ margin: "16px 0" }} />
              <div className="row between">
                <span className="chip"><Icon name="file-text" size={13} />CV tersedia</span>
                <button className="btn btn-ghost btn-sm">Lihat profil<Icon name="arrow-right" size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "cert" && (
        <div className="grid g-2 stagger">
          {SRA.certifications.map((c) => (
            <div key={c} className="card card-pad row gap-m">
              <span className="si" style={{ margin: 0, width: 46, height: 46, background: "var(--ok-bg)", color: "var(--ok)" }}><Icon name="badge-check" size={24} /></span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14.5, color: "var(--deep-navy)" }}>{c}</div>
                <div style={{ fontSize: 12, color: "var(--grey-500)", marginTop: 3 }}>SKA aktif · CV. Sudut Ruang Archineering</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "brand" && (
        <div className="grid g-3 stagger">
          <div className="card card-pad" style={{ display: "grid", placeItems: "center", textAlign: "center", padding: 32, background: "var(--grad-navy)" }}>
            <img src="assets/logo-mark.png" style={{ height: 64 }} alt="logo" />
            <div style={{ color: "#fff", fontWeight: 700, marginTop: 16 }}>Monogram SR</div>
            <div style={{ color: "var(--fg-muted-dark,#B9CFE0)", fontSize: 12, marginTop: 4 }}>PNG · SVG · transparan</div>
          </div>
          {[["Deep Navy", "#043666"], ["Sky Blue", "#4AB3D8"], ["Light Blue", "#E1F0F8"], ["Royal Blue", "#0A3863"], ["Bright Blue", "#045D93"]].map(([n, c]) => (
            <div key={n} className="card" style={{ overflow: "hidden" }}>
              <div style={{ height: 96, background: c }} />
              <div style={{ padding: "14px 18px" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--deep-navy)" }}>{n}</div>
                <div style={{ fontSize: 12, color: "var(--grey-500)", fontFamily: "monospace", marginTop: 3 }}>{c}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { ProposalLibrary, TemplateLibrary, AssetLibrary });
