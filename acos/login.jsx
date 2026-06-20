/* ACOS — Login */
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("habib@sudutruang.com");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const D = window.ACOS_DATA;
  const go = (user) => { setLoading(true); setTimeout(() => { setLoading(false); onLogin(user); }, 900); };
  const stats = [["17+", "Proyek terdokumentasi"], ["6", "Workflow n8n aktif"], ["86%", "Lead ditangani AI"]];
  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: T.font, background: T.bg, overflow: "hidden" }}>
      {/* LEFT — brand showcase */}
      <div style={{ flex: "1.15", position: "relative", background: T.bgGrad, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "54px 56px", overflow: "hidden", minWidth: 0 }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(74,179,216,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(74,179,216,0.05) 1px,transparent 1px)", backgroundSize: "44px 44px", maskImage: "radial-gradient(circle at 30% 40%,#000,transparent 78%)" }} />
        <Brackets c="rgba(74,179,216,0.25)" s={26} />
        <div style={{ display: "flex", alignItems: "center", gap: 13, position: "relative" }}>
          <Mark size={42} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: T.white, letterSpacing: 3 }}>SUDUT RUANG</div>
            <div style={{ fontWeight: 600, fontSize: 8.5, color: T.sky, letterSpacing: 4, marginTop: 2 }}>ARCHITECTURE OPERATING SYSTEM</div>
          </div>
        </div>
        <div style={{ position: "relative", maxWidth: 480 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: T.sky, marginBottom: 18 }}>ACOS · v1.0</div>
          <div style={{ fontSize: 46, fontWeight: 800, color: T.white, lineHeight: 1.05, letterSpacing: -1 }}>
            Satu sistem.<br />Seluruh studio<br /><span style={{ color: T.sky }}>terhubung.</span>
          </div>
          <div style={{ fontSize: 14.5, color: T.sub, lineHeight: 1.6, marginTop: 20, maxWidth: 420 }}>
            Lead, CRM, estimasi, proposal, SPK, invoice, proyek, hingga portfolio — mengalir otomatis dalam satu pusat operasional, ditenagai n8n.
          </div>
          <div style={{ display: "flex", gap: 30, marginTop: 36 }}>
            {stats.map(([n, l], i) => (
              <div key={i}>
                <div style={{ fontSize: 26, fontWeight: 800, color: T.white }}>{n}</div>
                <div style={{ fontSize: 10.5, color: T.dim, marginTop: 2, maxWidth: 100 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: "relative", fontSize: 10.5, color: T.dim, letterSpacing: 1.5 }}>DESIGNING CORNERS · DEFINING SPACES — SURABAYA, ID</div>
      </div>
      {/* RIGHT — auth */}
      <div style={{ width: 460, flexShrink: 0, background: T.panel, borderLeft: `1px solid ${T.line}`, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 54px" }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: T.txt, letterSpacing: -0.4 }}>Masuk ke ACOS</div>
        <div style={{ fontSize: 13, color: T.dim, marginTop: 6 }}>Pusat operasional Sudut Ruang Arsitek.</div>

        <button onClick={() => go({ name: "M. Habib Arrohman I.", role: "Owner · Principal", initials: "HA" })} style={{ marginTop: 28, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "12px", borderRadius: 10, border: `1px solid ${T.lineHi}`, background: T.white, color: "#1a1a1a", fontFamily: T.font, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          <svg width="17" height="17" viewBox="0 0 48 48"><path fill="#4285F4" d="M45 24c0-1.6-.1-2.7-.4-3.9H24v7.4h12c-.2 1.9-1.5 4.8-4.4 6.7l6.7 5.2C42.4 36 45 30.5 45 24z" /><path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.3l-6.7-5.2c-1.9 1.3-4.4 2.2-7.8 2.2-6 0-11-4-12.8-9.5l-7 5.4C7.7 40.9 15.2 46 24 46z" /><path fill="#FBBC05" d="M11.2 28.2c-.5-1.3-.7-2.7-.7-4.2s.3-2.9.7-4.2l-7-5.4C3.5 17.4 3 20.6 3 24s.5 6.6 1.2 9.6l7-5.4z" /><path fill="#EA4335" d="M24 10.7c3.3 0 5.6 1.4 6.9 2.6l5.9-5.8C33.5 4.1 29 2 24 2 15.2 2 7.7 7.1 4.2 14.4l7 5.4C13 14.7 18 10.7 24 10.7z" /></svg>
          Lanjut dengan Google Workspace
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0" }}>
          <div style={{ flex: 1, height: 1, background: T.line }} /><span style={{ fontSize: 10, color: T.dim, letterSpacing: 1 }}>ATAU</span><div style={{ flex: 1, height: 1, background: T.line }} />
        </div>

        <label style={{ fontSize: 11, fontWeight: 700, color: T.sub, letterSpacing: 0.5 }}>EMAIL</label>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 7, marginBottom: 16, background: T.inset, border: `1px solid ${T.line}`, borderRadius: 10, padding: "11px 13px" }}>
          <Icon name="Mail" size={15} color={T.dim} />
          <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: T.txt, fontSize: 13, fontFamily: T.font }} />
        </div>
        <label style={{ fontSize: 11, fontWeight: 700, color: T.sub, letterSpacing: 0.5 }}>PASSWORD</label>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 7, background: T.inset, border: `1px solid ${T.line}`, borderRadius: 10, padding: "11px 13px" }}>
          <Icon name="Lock" size={15} color={T.dim} />
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" onKeyDown={(e) => e.key === "Enter" && go({ name: "M. Habib Arrohman I.", role: "Owner · Principal", initials: "HA" })} style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: T.txt, fontSize: 13, fontFamily: T.font }} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", margin: "10px 0 18px" }}>
          <a style={{ fontSize: 11.5, color: T.sky, textDecoration: "none", cursor: "pointer" }}>Lupa password?</a>
        </div>

        <Btn v="primary" onClick={() => go({ name: "M. Habib Arrohman I.", role: "Owner · Principal", initials: "HA" })} style={{ width: "100%", justifyContent: "center", padding: "12px" }}>
          {loading ? <Icon name="LoaderCircle" size={16} color="#03203a" style={{ animation: "acspin 0.8s linear infinite" }} /> : <>Masuk ke Command Center<Icon name="ArrowRight" size={15} color="#03203a" /></>}
        </Btn>

        <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "rgba(52,211,153,0.08)", border: `1px solid rgba(52,211,153,0.2)`, borderRadius: 9 }}>
          <Dot color={T.green} pulse /><span style={{ fontSize: 11, color: T.sub }}>Semua sistem operasional · 6 workflow n8n aktif</span>
        </div>
        <div style={{ marginTop: 20, fontSize: 10, color: T.dim, textAlign: "center", letterSpacing: 0.5 }}>Akses terenkripsi · RBAC · Audit trail aktif</div>
      </div>
    </div>
  );
}
Object.assign(window, { LoginPage });
