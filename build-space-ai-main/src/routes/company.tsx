import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, PageHeader } from "@/components/app-layout";
import { PremiumCard, RuleLine, TechLabel, CornerFrame, SRMonogram } from "@/components/architectural";
import { useI18n } from "@/lib/i18n";
import { Compass, Layers, Hammer, Leaf, Building2, MapPin, Award, Eye, Target, Heart } from "lucide-react";

export const Route = createFileRoute("/company")({
  head: () => ({
    meta: [
      { title: "Studio Profile — Sudut Ruang Arsitek" },
      { name: "description", content: "CV. Sudut Ruang Archineering — a premium architecture, interior, landscape, and design & build studio based in Surabaya, with national-scale experience including the IKN ecosystem." },
    ],
  }),
  component: Company,
});

const services = [
  { icon: Compass, title: "Architecture", desc: "Site-driven architectural design grounded in contemporary tropical and Nusantara-modern principles." },
  { icon: Layers, title: "Interior Design", desc: "Spatial choreography that translates client narrative into material, light, and proportion." },
  { icon: Leaf, title: "Landscape Design", desc: "Outdoor systems that mediate climate, ecology, and human ritual." },
  { icon: Hammer, title: "Design & Build", desc: "An integrated delivery model — one accountable team from sketch to handover." },
];

const values = [
  { icon: Eye, title: "Visionary", desc: "We design with the next generation of users in mind, not only the first occupant." },
  { icon: Target, title: "Strategic", desc: "Every form decision is tested against budget, schedule, climate, and brand strategy." },
  { icon: Heart, title: "Rooted", desc: "We carry the wisdom of the Nusantara into a contemporary, sustainable language." },
];

function Company() {
  const { t } = useI18n();
  return (
    <AppLayout>
      <PageHeader
        title={t("company.title")}
        subtitle="CV. Sudut Ruang Archineering — a premium architecture and design & build studio based in Surabaya, with experience spanning private commissions, government projects, and the Ibu Kota Nusantara (IKN) ecosystem."
        refCode="REF · 04"
        eyebrow="About the Studio · Edisi 2026"
      />

      {/* Hero / Foreword */}
      <PremiumCard className="relative overflow-hidden mb-8">
        <div className="absolute inset-0 blueprint-grid opacity-40 pointer-events-none" />
        <div className="relative grid md:grid-cols-[1fr_auto] gap-8 items-end">
          <div className="max-w-2xl">
            <TechLabel ref="01" label="Foreword" className="mb-4" />
            <p className="font-display text-xl md:text-[22px] font-medium text-primary leading-snug text-balance">
              "Space is never merely a surface bound by walls, roof, and floor. It is where people grow older, work, pray, and remember — a decision about the morning light, the wind allowed to pass, the material chosen to endure decades."
            </p>
            <p className="mt-5 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              M. Habib Arrohman I. <span className="text-accent">— "Izzun"</span> · Principal Architect & Project Strategist
            </p>
          </div>
          <div className="hidden md:block text-primary/80">
            <SRMonogram size={96} />
          </div>
        </div>
      </PremiumCard>

      {/* Vision / Mission */}
      <div className="grid md:grid-cols-3 gap-5 mb-8">
        {[
          { ref: "02·VIS", title: "Vision", body: "To be Indonesia's most trusted studio at the intersection of architectural craft, design & build delivery, and Nusantara cultural intelligence." },
          { ref: "03·MIS", title: "Mission", body: "Translate every brief into spaces that are beautiful, build-able, and meaningful — on time, within budget, and aligned with a long-term brand narrative." },
          { ref: "04·POS", title: "Positioning", body: "A premium studio for clients who refuse to choose between aesthetics and accountability — design with strategy, build with precision." },
        ].map((b) => (
          <PremiumCard key={b.title}>
            <TechLabel ref={b.ref} label={b.title} className="mb-3" />
            <h3 className="font-display text-lg font-bold text-primary mb-2">{b.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{b.body}</p>
          </PremiumCard>
        ))}
      </div>

      {/* Services */}
      <TechLabel ref="REF · 05" label="Services" className="mb-3" />
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {services.map((s) => (
          <PremiumCard key={s.title} className="group hover:shadow-[var(--shadow-elev)] transition-shadow">
            <s.icon className="h-5 w-5 text-accent mb-4" strokeWidth={1.5} />
            <h4 className="font-display font-bold text-primary mb-1.5">{s.title}</h4>
            <p className="text-[13px] text-muted-foreground leading-relaxed">{s.desc}</p>
          </PremiumCard>
        ))}
      </div>

      {/* Core values */}
      <TechLabel ref="REF · 06" label="Core Values" className="mb-3" />
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {values.map((v) => (
          <CornerFrame key={v.title} tone="muted" className="p-6">
            <v.icon className="h-4 w-4 text-primary mb-3" strokeWidth={1.6} />
            <h4 className="font-display font-bold text-primary mb-2">{v.title}</h4>
            <p className="text-[13px] text-muted-foreground leading-relaxed">{v.desc}</p>
          </CornerFrame>
        ))}
      </div>

      {/* Strategic experience */}
      <PremiumCard className="bg-primary text-primary-foreground relative overflow-hidden mb-8">
        <div className="absolute inset-0 blueprint-grid opacity-10 pointer-events-none" />
        <div className="relative grid md:grid-cols-[auto_1fr] gap-6 items-start">
          <Award className="h-10 w-10 text-accent shrink-0" strokeWidth={1.5} />
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/60 mb-2">Strategic Experience</div>
            <h3 className="font-display text-xl font-bold mb-3">IKN — Ibu Kota Nusantara</h3>
            <p className="text-sm text-primary-foreground/85 leading-relaxed max-w-2xl">
              The studio has contributed to the master vision and selected building studies for the new Indonesian capital — an experience that informs how we approach climate-responsive, identity-anchored architecture at every scale.
            </p>
            <RuleLine className="my-5 opacity-30" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              {[
                { k: "Years in practice", v: "12+" },
                { k: "Projects delivered", v: "180+" },
                { k: "Cities served", v: "24" },
                { k: "Disciplines", v: "4" },
              ].map((m) => (
                <div key={m.k}>
                  <div className="font-display text-2xl font-bold text-accent tabular-nums">{m.v}</div>
                  <div className="uppercase tracking-[0.16em] text-primary-foreground/55 mt-1">{m.k}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PremiumCard>

      {/* Contact */}
      <PremiumCard>
        <TechLabel ref="REF · 07" label="Contact" className="mb-3" />
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 text-primary mb-1.5">
              <Building2 className="h-4 w-4" strokeWidth={1.6} />
              <span className="font-medium text-sm">Studio</span>
            </div>
            <p className="text-sm text-muted-foreground">CV. Sudut Ruang Archineering<br />Surabaya, Jawa Timur, Indonesia</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-primary mb-1.5">
              <MapPin className="h-4 w-4" strokeWidth={1.6} />
              <span className="font-medium text-sm">Service Area</span>
            </div>
            <p className="text-sm text-muted-foreground">Java · Bali · Sumatra · Kalimantan · IKN ecosystem</p>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5">Document Ref</div>
            <p className="font-mono text-xs text-primary">SRA-BGB-2026 / v1.0</p>
          </div>
        </div>
      </PremiumCard>
    </AppLayout>
  );
}
