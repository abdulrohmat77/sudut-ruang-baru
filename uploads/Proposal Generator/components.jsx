/* ============================================================
   Shared components — Proposal OS
   ============================================================ */
const { useState, useEffect, useRef, useLayoutEffect, useMemo, Fragment } = React;

/* ---------- Icon (inline SVG from Lucide global) ---------- */
function pascal(name) {
  return name.split(/[-_]/).map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join("");
}
function Icon({ name, size = 18, className = "", style = {}, stroke }) {
  const lib = (window.lucide && window.lucide.icons) || {};
  const raw = lib[pascal(name)] || lib[name];
  // lucide node shape: ["svg", svgAttrs, [[tag, attrs], ...]]
  const node = raw && raw.length === 3 && Array.isArray(raw[2]) ? raw[2] : raw;
  const kids = Array.isArray(node)
    ? node.map(([tag, attrs], i) => {
        const a = { key: i };
        for (const k in attrs) {
          const ck = k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
          a[ck] = attrs[k];
        }
        return React.createElement(tag, a);
      })
    : null;
  return (
    <span className={"ico " + className} style={{ width: size, height: size, ...style }}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={stroke || 1.85} strokeLinecap="round" strokeLinejoin="round">
        {kids}
      </svg>
    </span>
  );
}

/* ---------- Avatars ---------- */
function Avatar({ m, size = 30 }) {
  return (
    <span className="avatar" style={{ width: size, height: size, background: m.color, fontSize: size * 0.38 }}>
      {m.initials}
    </span>
  );
}
function AvatarStack({ ids, size = 28 }) {
  return (
    <div className="av-stack">
      {ids.map((id) => <Avatar key={id} m={SRA.memberById(id)} size={size} />)}
    </div>
  );
}

/* ---------- Status badge ---------- */
function StatusBadge({ status }) {
  const s = SRA.statusMeta[status] || SRA.statusMeta.Draft;
  return (
    <span className="badge" style={{ color: s.color, background: s.bg }}>
      <span className="bdot" /> {s.label}
    </span>
  );
}

/* ---------- Progress ---------- */
function Progress({ value }) {
  return <div className="prog"><i style={{ width: value + "%" }} /></div>;
}

/* ---------- Logo ---------- */
function BrandMark({ size = 32 }) {
  return <img src="assets/logo-mark.png" alt="SRA" style={{ width: size * 0.8, height: size }} />;
}

/* ---------- Sidebar ---------- */
const NAV = [
  { group: "Workspace", items: [
    { id: "dashboard", label: "Dashboard", icon: "layout-dashboard" },
    { id: "proposals", label: "Proposals", icon: "folder-open", count: "31" },
    { id: "templates", label: "Templates", icon: "layout-template" },
    { id: "assets", label: "Asset Library", icon: "library" },
  ]},
  { group: "Generate", items: [
    { id: "ai", label: "AI Writer", icon: "sparkles" },
    { id: "builder", label: "Proposal Builder", icon: "layout-panel-left" },
    { id: "pricing", label: "Pricing Engine", icon: "calculator" },
  ]},
  { group: "Insights", items: [
    { id: "analytics", label: "Analytics", icon: "chart-no-axes-column" },
  ]},
  { group: "Platform", items: [
    { id: "responsive", label: "Responsive", icon: "monitor-smartphone" },
  ]},
];

function Sidebar({ screen, go, collapsed }) {
  const me = SRA.memberById("habib");
  return (
    <aside className={"sidebar" + (collapsed ? " collapsed" : "")}>
      <div className="sb-brand">
        <BrandMark size={40} />
        <div className="bt">
          <b>Proposal OS</b>
          <span>Sudut Ruang</span>
        </div>
      </div>
      <button className="sb-new" onClick={() => go("wizard")}>
        <Icon name="plus" size={18} /><span>Buat Proposal Baru</span>
      </button>
      <div className="sb-scroll">
        {NAV.map((g) => (
          <div key={g.group}>
            <div className="sb-group-label">{g.group}</div>
            {g.items.map((it) => (
              <button key={it.id} className={"sb-item" + (screen === it.id ? " active" : "")} onClick={() => go(it.id)}>
                <Icon name={it.icon} size={18} />
                <span className="label">{it.label}</span>
                {it.count && <span className="count">{it.count}</span>}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="sb-foot">
        <button className="sb-user">
          <span className="av" style={{ background: me.color }}>{me.initials}</span>
          <span className="ut"><b>{me.name.split(" ").slice(0, 2).join(" ")}</b><span>{me.role}</span></span>
        </button>
      </div>
    </aside>
  );
}

/* ---------- Topbar ---------- */
const CRUMBS = {
  dashboard: "Dashboard", proposals: "Proposals", templates: "Template Library",
  assets: "Asset Library", ai: "AI Writer", builder: "Proposal Builder",
  pricing: "Pricing Engine", analytics: "Analytics", wizard: "New Proposal",
  responsive: "Responsive Preview",
};
function Topbar({ screen, toggleSidebar }) {
  return (
    <header className="topbar">
      <button className="tb-toggle" onClick={toggleSidebar}><Icon name="panel-left" size={19} /></button>
      <div className="tb-crumb">
        <span>Proposal OS</span>
        <Icon name="chevron-right" size={15} />
        <b>{CRUMBS[screen] || "Dashboard"}</b>
      </div>
      <div className="tb-search">
        <Icon name="search" size={16} />
        <input placeholder="Cari proposal, klien, template…" />
        <kbd>⌘K</kbd>
      </div>
      <div className="tb-actions">
        <button className="tb-icon-btn"><Icon name="circle-help" size={19} /></button>
        <button className="tb-icon-btn"><Icon name="bell" size={19} /><span className="dot" /></button>
        <Avatar m={SRA.memberById("habib")} size={36} />
      </div>
    </header>
  );
}

/* ---------- Small UI helpers ---------- */
function Stat({ icon, value, label, delta, up }) {
  return (
    <div className="stat">
      {delta && <span className={"sd " + (up ? "up" : "down")}>{delta}</span>}
      <span className="si"><Icon name={icon} size={20} /></span>
      <div className="sv">{value}</div>
      <div className="sl">{label}</div>
    </div>
  );
}

function PageHead({ eyebrow, title, sub, actions }) {
  return (
    <div className="row between" style={{ alignItems: "flex-end", gap: 24, marginBottom: 26 }}>
      <div>
        {eyebrow && <div className="eyebrow" style={{ marginBottom: 8 }}>{eyebrow}</div>}
        <h1 className="page-title">{title}</h1>
        {sub && <p className="page-sub">{sub}</p>}
      </div>
      {actions && <div className="row gap-s" style={{ flexShrink: 0 }}>{actions}</div>}
    </div>
  );
}

function Bars({ data, labels }) {
  const max = Math.max(...data);
  return (
    <div className="bars">
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div className={"bar" + (i === data.length - 1 ? "" : " muted")}
            style={{ height: (v / max * 100) + "%", width: "100%", animationDelay: i * 0.04 + "s" }} />
          {labels && <span style={{ fontSize: 10.5, color: "var(--grey-300)", fontWeight: 600 }}>{labels[i]}</span>}
        </div>
      ))}
    </div>
  );
}

Object.assign(window, {
  Icon, Avatar, AvatarStack, StatusBadge, Progress, BrandMark,
  Sidebar, Topbar, Stat, PageHead, Bars, NAV,
});
