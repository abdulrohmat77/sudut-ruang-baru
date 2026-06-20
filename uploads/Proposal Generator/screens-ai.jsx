/* ============================================================
   AI Proposal Writer — streaming generation experience
   ============================================================ */
function AIWriter({ go }) {
  const SECTIONS = SRA.aiSections;
  const queued = ["Work Plan", "Team Profile", "Value Proposition", "Closing Statement"];
  const tones = ["Professional", "Strategic", "Premium", "Persuasive"];

  const [tone, setTone] = useState("Strategic");
  const [phase, setPhase] = useState("idle"); // idle | thinking | streaming | done
  const [typed, setTyped] = useState({}); // id -> string
  const [activeIdx, setActiveIdx] = useState(-1);
  const [regenId, setRegenId] = useState(null);
  const timers = useRef([]);
  const canvasRef = useRef(null);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => clearTimers, []);

  function typeSection(idx, after) {
    const sec = SECTIONS[idx];
    setActiveIdx(idx);
    let i = 0;
    const step = () => {
      i += 3;
      setTyped((t) => ({ ...t, [sec.id]: sec.text.slice(0, i) }));
      if (canvasRef.current) canvasRef.current.scrollTop = canvasRef.current.scrollHeight;
      if (i < sec.text.length) {
        timers.current.push(setTimeout(step, 16));
      } else {
        setTyped((t) => ({ ...t, [sec.id]: sec.text }));
        after && after();
      }
    };
    timers.current.push(setTimeout(step, 120));
  }

  function generateAll() {
    clearTimers();
    setTyped({}); setRegenId(null);
    setPhase("thinking");
    timers.current.push(setTimeout(() => {
      setPhase("streaming");
      const chain = (k) => {
        if (k >= SECTIONS.length) { setPhase("done"); setActiveIdx(-1); return; }
        typeSection(k, () => timers.current.push(setTimeout(() => chain(k + 1), 260)));
      };
      chain(0);
    }, 900));
  }

  function regen(idx) {
    clearTimers();
    setRegenId(SECTIONS[idx].id);
    setTyped((t) => ({ ...t, [SECTIONS[idx].id]: "" }));
    setPhase("streaming");
    typeSection(idx, () => { setPhase("done"); setActiveIdx(-1); setRegenId(null); });
  }

  const ctxChips = [
    { ic: "building-2", t: "Manggo Villa" },
    { ic: "user-round", t: "PT Manggo Properti" },
    { ic: "layers", t: "Design & Build" },
    { ic: "map-pin", t: "Bali" },
  ];

  return (
    <div className="page fade-in" style={{ maxWidth: 1280 }}>
      <PageHead
        eyebrow="AI Proposal Writer"
        title="Tulis proposal dengan suara brand Anda."
        sub="AI Sudut Ruang menyusun draft profesional dari konteks proyek — Anda tinggal mengarahkan dan menyempurnakan."
        actions={[
          <button key="x" className="btn btn-outline" onClick={() => go("builder")}><Icon name="layout-panel-left" size={16} />Buka di Builder</button>,
        ]}
      />

      <div className="grid" style={{ gridTemplateColumns: "320px 1fr", alignItems: "start", gap: 22 }}>
        {/* CONTROL RAIL */}
        <div className="grid" style={{ gap: 18, position: "sticky", top: 8 }}>
          <div className="card card-pad">
            <div className="eyebrow" style={{ marginBottom: 14 }}>Konteks Proyek</div>
            <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
              {ctxChips.map((c) => (
                <span key={c.t} className="chip" style={{ background: "var(--tint-050)", color: "var(--bright-blue)" }}>
                  <Icon name={c.ic} size={13} />{c.t}
                </span>
              ))}
            </div>
            <div className="divider" style={{ margin: "18px 0" }} />
            <div className="eyebrow" style={{ marginBottom: 12 }}>Tone Penulisan</div>
            <div className="grid g-2" style={{ gap: 8 }}>
              {tones.map((t) => (
                <button key={t} onClick={() => setTone(t)}
                  className="pill-filter" style={{
                    justifyContent: "center",
                    borderColor: tone === t ? "var(--accent)" : "var(--border)",
                    background: tone === t ? "var(--tint-050)" : "#fff",
                    color: tone === t ? "var(--deep-navy)" : "var(--grey-700)",
                  }}>{t}</button>
              ))}
            </div>
          </div>

          <div className="card card-pad">
            <div className="row between" style={{ marginBottom: 12 }}>
              <div className="eyebrow">Bagian Proposal</div>
              <span className="caption" style={{ color: "var(--grey-300)" }}>{SECTIONS.length} aktif</span>
            </div>
            <div className="grid" style={{ gap: 4 }}>
              {SECTIONS.map((s, i) => {
                const done = typed[s.id] === s.text;
                const active = activeIdx === i;
                return (
                  <div key={s.id} className="row gap-s" style={{ padding: "8px 6px", fontSize: 13, fontWeight: 600, color: done ? "var(--deep-navy)" : "var(--grey-500)" }}>
                    <Icon name={done ? "circle-check-big" : active ? "loader-circle" : "circle"} size={16}
                      className={active ? "spin-ico" : ""}
                      style={{ color: done ? "var(--ok)" : active ? "var(--accent)" : "var(--grey-300)", animation: active ? "spin 1s linear infinite" : "none" }} />
                    {s.label}
                  </div>
                );
              })}
              {queued.map((q) => (
                <div key={q} className="row gap-s" style={{ padding: "8px 6px", fontSize: 13, fontWeight: 500, color: "var(--grey-300)" }}>
                  <Icon name="circle-dashed" size={16} />{q}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CANVAS */}
        <div className="card" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 240px)", minHeight: 480 }}>
          <div ref={canvasRef} style={{ flex: 1, overflowY: "auto", padding: "30px 38px" }}>
            {phase === "idle" && (
              <div className="empty" style={{ height: "100%" }}>
                <div className="eo"><Icon name="wand-sparkles" size={40} /></div>
                <h3>Siap menyusun draft Anda</h3>
                <p>AI akan menghasilkan {SECTIONS.length} bagian inti dengan tone <b>{tone}</b>. Tinjau, regenerasi, lalu kirim ke Builder.</p>
                <button className="btn btn-primary" onClick={generateAll}><Icon name="sparkles" size={17} />Hasilkan Draft</button>
              </div>
            )}

            {phase === "thinking" && (
              <div className="fade-in">
                <div className="row gap-s" style={{ color: "var(--bright-blue)", fontWeight: 600, fontSize: 14, marginBottom: 22 }}>
                  <Icon name="loader-circle" size={18} style={{ animation: "spin 1s linear infinite" }} />
                  Menganalisis konteks proyek & data studio…
                </div>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ marginBottom: 26 }}>
                    <div className="skel" style={{ height: 18, width: 200, marginBottom: 14 }} />
                    <div className="skel" style={{ height: 12, marginBottom: 9 }} />
                    <div className="skel" style={{ height: 12, marginBottom: 9, width: "92%" }} />
                    <div className="skel" style={{ height: 12, width: "70%" }} />
                  </div>
                ))}
              </div>
            )}

            {(phase === "streaming" || phase === "done") && (
              <div>
                {SECTIONS.map((s, i) => {
                  const val = typed[s.id];
                  if (val === undefined) return null;
                  const isTyping = activeIdx === i || regenId === s.id;
                  return (
                    <div key={s.id} className="fade-up" style={{ marginBottom: 30 }}>
                      <div className="row between" style={{ marginBottom: 10 }}>
                        <h3 style={{ fontSize: 19, fontWeight: 800, color: "var(--deep-navy)", letterSpacing: "-.01em" }}>{s.label}</h3>
                        {!isTyping && val === s.text && (
                          <div className="row gap-s">
                            <button className="tb-icon-btn" style={{ width: 30, height: 30 }} onClick={() => regen(i)} title="Regenerasi"><Icon name="refresh-cw" size={15} /></button>
                            <button className="tb-icon-btn" style={{ width: 30, height: 30 }} title="Salin"><Icon name="copy" size={15} /></button>
                          </div>
                        )}
                      </div>
                      <p style={{ fontSize: 15, lineHeight: 1.72, color: "var(--grey-700)" }}>
                        {val}
                        {isTyping && <span style={{ display: "inline-block", width: 2, height: 17, background: "var(--accent)", marginLeft: 2, verticalAlign: "text-bottom", animation: "blink 1s step-end infinite" }} />}
                      </p>
                    </div>
                  );
                })}
                {phase === "done" && (
                  <div className="row gap-s fade-in" style={{ marginTop: 8, paddingTop: 20, borderTop: "1px solid var(--border-soft)" }}>
                    <button className="btn btn-primary" onClick={() => go("builder")}><Icon name="arrow-right" size={16} />Kirim ke Builder</button>
                    <button className="btn btn-outline" onClick={generateAll}><Icon name="refresh-cw" size={16} />Regenerasi Semua</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* prompt bar */}
          <div style={{ borderTop: "1px solid var(--border-soft)", padding: "14px 20px" }}>
            <div className="row gap-s" style={{ flexWrap: "wrap", marginBottom: 12 }}>
              {SRA.aiPrompts.map((p) => (
                <button key={p} className="chip" style={{ cursor: "pointer", background: "#fff", border: "1px solid var(--border)" }}
                  onClick={() => phase === "idle" ? generateAll() : regen(0)}>
                  <Icon name="sparkles" size={12} style={{ color: "var(--accent)" }} />{p}
                </button>
              ))}
            </div>
            <div className="tb-search" style={{ maxWidth: "none", margin: 0, background: "#fff", border: "1px solid var(--border)" }}>
              <Icon name="message-square" size={16} />
              <input placeholder="Berikan instruksi ke AI… mis. 'tekankan pengalaman IKN'" />
              <button className="btn btn-primary btn-sm" onClick={generateAll}><Icon name="send" size={14} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AIWriter });
