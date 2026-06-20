/* ============================================================
   App — routing, shell, tweaks
   ============================================================ */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": ["#4AB3D8", "#045D93"],
  "appBg": "#F4F8FB",
  "font": "Montserrat",
  "radius": 14,
  "density": "Normal",
  "collapsed": false
}/*EDITMODE-END*/;

const FONTS = {
  Montserrat: "'Montserrat','Poppins','Inter',system-ui,sans-serif",
  Poppins: "'Poppins','Montserrat',system-ui,sans-serif",
  Inter: "'Inter','Montserrat',system-ui,sans-serif",
};
const DENSITY = { Rapat: 0.8, Normal: 1, Lega: 1.25 };

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [screen, setScreen] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(t.collapsed);

  useEffect(() => { setCollapsed(t.collapsed); }, [t.collapsed]);

  const go = (s) => {
    setScreen(s);
    const c = document.querySelector(".canvas");
    if (c) c.scrollTop = 0;
  };

  const accent = Array.isArray(t.accent) ? t.accent : [t.accent, "#045D93"];
  const rootStyle = {
    "--accent": accent[0],
    "--accent-deep": accent[1],
    "--app-bg": t.appBg,
    "--radius": t.radius + "px",
    "--density": DENSITY[t.density] || 1,
    "--font-sans": FONTS[t.font] || FONTS.Montserrat,
  };

  const screens = {
    dashboard: Dashboard, proposals: ProposalLibrary, templates: TemplateLibrary,
    assets: AssetLibrary, ai: AIWriter, builder: Builder, pricing: PricingEngine,
    analytics: Analytics, wizard: Wizard, responsive: Responsive,
  };
  const Screen = screens[screen] || Dashboard;
  const fullBleed = screen === "builder"; // builder manages its own scroll

  return (
    <div className="app" style={rootStyle}>
      <Sidebar screen={screen} go={go} collapsed={collapsed} />
      <div className="main">
        <Topbar screen={screen} toggleSidebar={() => setCollapsed((c) => !c)} />
        {fullBleed
          ? <div className="canvas" style={{ overflow: "hidden" }}><Builder go={go} /></div>
          : <div className="canvas"><Screen go={go} /></div>}
      </div>

      <TweaksPanel>
        <TweakSection label="Brand" />
        <TweakColor label="Aksen" value={t.accent}
          options={[["#4AB3D8", "#045D93"], ["#045D93", "#043666"], ["#1E7FB8", "#045D93"], ["#043666", "#022747"]]}
          onChange={(v) => setTweak("accent", v)} />
        <TweakColor label="Latar App" value={t.appBg}
          options={["#F4F8FB", "#FEFEFE", "#F2F9FC", "#EDF1F4"]}
          onChange={(v) => setTweak("appBg", v)} />
        <TweakSelect label="Tipografi" value={t.font} options={["Montserrat", "Poppins", "Inter"]}
          onChange={(v) => setTweak("font", v)} />
        <TweakSection label="Layout" />
        <TweakRadio label="Kepadatan" value={t.density} options={["Rapat", "Normal", "Lega"]}
          onChange={(v) => setTweak("density", v)} />
        <TweakSlider label="Sudut (radius)" value={t.radius} min={4} max={24} unit="px"
          onChange={(v) => setTweak("radius", v)} />
        <TweakToggle label="Sidebar ringkas" value={t.collapsed}
          onChange={(v) => setTweak("collapsed", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
