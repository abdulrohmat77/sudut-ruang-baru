/* ============================================================
   Dashboard screen
   ============================================================ */
function Dashboard({ go }) {
  const recent = SRA.proposals.slice(0, 6);
  const kpis = [
    { icon: "files", value: "248", label: "Total Proposal", delta: "+12%", up: true },
    { icon: "loader-circle", value: "31", label: "Proposal Aktif", delta: "+5", up: true },
    { icon: "trophy", value: "63%", label: "Win Rate", delta: "+8 pts", up: true },
    { icon: "wallet", value: "Rp 184 M", label: "Total Nilai Proposal", delta: "+22%", up: true },
  ];
  const me = SRA.memberById("habib").name.split(" ")[1] || "Habib";

  return (
    <div className="page fade-in">
      <PageHead
        eyebrow="Senin · 3 Juni 2026"
        title={"Selamat pagi, " + me + "."}
        sub="Lima proposal menunggu tindakan Anda hari ini. Pipeline bernilai Rp 38 M sedang berjalan."
        actions={[
          <button key="a" className="btn btn-outline" onClick={() => go("templates")}><Icon name="layout-template" size={17} />Template</button>,
          <button key="b" className="btn btn-primary" onClick={() => go("wizard")}><Icon name="plus" size={17} />Buat Proposal</button>,
        ]}
      />

      <div className="grid g-4 stagger" style={{ marginBottom: 22 }}>
        {kpis.map((k) => <Stat key={k.label} {...k} />)}
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1.55fr 1fr", alignItems: "start" }}>
        {/* LEFT */}
        <div className="grid" style={{ gap: 22 }}>
          <div className="card">
            <div className="row between" style={{ padding: "20px 24px 14px" }}>
              <div className="sec-title">Proposal Terbaru</div>
              <button className="btn btn-ghost btn-sm" onClick={() => go("proposals")}>Lihat semua<Icon name="arrow-right" size={15} /></button>
            </div>
            <table className="tbl">
              <thead><tr>
                <th>Proposal</th><th>Tipe</th><th>Status</th><th>Nilai</th><th style={{ width: 120 }}>Progress</th>
              </tr></thead>
              <tbody>
                {recent.map((p) => (
                  <tr key={p.id} onClick={() => go("builder")}>
                    <td>
                      <div className="pname">{p.title}</div>
                      <div className="pclient">{p.client}</div>
                    </td>
                    <td><span className="chip">{p.type}</span></td>
                    <td><StatusBadge status={p.status} /></td>
                    <td style={{ fontWeight: 700, color: "var(--deep-navy)" }}>{SRA.rupiah(p.value)}</td>
                    <td>
                      <div className="row gap-s">
                        <Progress value={p.progress} />
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--grey-500)", width: 30 }}>{p.progress}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pipeline mini */}
          <div className="card card-pad">
            <div className="row between" style={{ marginBottom: 18 }}>
              <div>
                <div className="sec-title">Pipeline 12 Bulan</div>
                <div className="page-sub" style={{ marginTop: 2 }}>Nilai proposal dikirim per bulan</div>
              </div>
              <span className="chip" style={{ color: "var(--ok)", background: "var(--ok-bg)" }}><Icon name="trending-up" size={14} />Tren naik</span>
            </div>
            <Bars data={SRA.analytics.monthly} labels={["J","F","M","A","M","J","J","A","S","O","N","D"]} />
          </div>
        </div>

        {/* RIGHT */}
        <div className="grid" style={{ gap: 22 }}>
          {/* AI quick card */}
          <div className="card card-pad" style={{ background: "var(--grad-navy)", color: "#fff", border: "none", position: "relative", overflow: "hidden" }}>
            <div className="scrim-grid" style={{ position: "absolute", inset: 0, opacity: .5 }} />
            <div style={{ position: "relative" }}>
              <span className="badge" style={{ color: "var(--deep-navy)", background: "var(--sky-blue)" }}><Icon name="sparkles" size={13} />AI Writer</span>
              <h3 style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-.02em", margin: "16px 0 8px", lineHeight: 1.2 }}>
                Dari brief ke draft<br />dalam 15 menit.
              </h3>
              <p style={{ fontSize: 13.5, color: "var(--fg-muted-dark, #B9CFE0)", lineHeight: 1.55, marginBottom: 18 }}>
                Hasilkan executive summary, konsep desain & metodologi otomatis — dengan suara brand Sudut Ruang.
              </p>
              <button className="btn btn-primary" onClick={() => go("ai")} style={{ width: "100%", justifyContent: "center" }}>
                <Icon name="wand-sparkles" size={17} />Mulai dengan AI
              </button>
            </div>
          </div>

          {/* Activity */}
          <div className="card card-pad">
            <div className="row between" style={{ marginBottom: 16 }}>
              <div className="sec-title">Aktivitas Tim</div>
              <Icon name="ellipsis" size={18} className="" style={{ color: "var(--grey-300)" }} />
            </div>
            <div className="grid" style={{ gap: 2 }}>
              {SRA.activity.map((a, i) => {
                const m = SRA.memberById(a.who);
                return (
                  <div key={i} className="row gap-m" style={{ padding: "10px 0", borderTop: i ? "1px solid var(--border-soft)" : "none" }}>
                    <Avatar m={m} size={34} />
                    <div style={{ fontSize: 13, lineHeight: 1.45, color: "var(--grey-700)" }}>
                      <b style={{ color: "var(--deep-navy)" }}>{m.name.split(" ").slice(0, 2).join(" ")}</b> {a.action}{" "}
                      <b style={{ color: "var(--bright-blue)" }}>{a.target}</b>
                      <div style={{ fontSize: 11.5, color: "var(--grey-300)", marginTop: 2 }}>{a.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard });
