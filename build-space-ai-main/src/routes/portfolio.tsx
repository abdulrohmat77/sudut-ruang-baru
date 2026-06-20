import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout, PageHeader } from "@/components/app-layout";
import { PremiumCard, TechLabel, CornerFrame } from "@/components/architectural";
import { useI18n } from "@/lib/i18n";
import { MapPin, Calendar, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Selected Works — Sudut Ruang Arsitek" },
      { name: "description", content: "A curated portfolio of architecture, interior, landscape, and design & build projects from the studio." },
    ],
  }),
  component: Portfolio,
});

type Category = "All" | "Architecture" | "Interior" | "Landscape" | "Design & Build" | "Government" | "Private";

interface Work {
  ref: string;
  title: string;
  location: string;
  year: string;
  category: Exclude<Category, "All">;
  value: string;
  services: string[];
  story: string;
  challenge: string;
  solution: string;
}

const works: Work[] = [
  {
    ref: "SR-W-001", title: "Villa Wijaya — Ubud Ridge", location: "Ubud, Bali", year: "2026",
    category: "Architecture", value: "IDR 4.5 B",
    services: ["Architecture", "Interior", "Landscape"],
    story: "A 320 m² tropical residence carved into a ricefield ridge — a private retreat that holds the client's family ritual at its center.",
    challenge: "A steep east-facing site with monsoon exposure and a strict 6-meter ridgeline.",
    solution: "Split-level pavilions threaded along the contour, a deep verandah strategy, and rain-chain water management feeding into a passive cooling court.",
  },
  {
    ref: "SR-W-002", title: "Sentra HQ Tower", location: "Jakarta", year: "2027",
    category: "Architecture", value: "IDR 18 B",
    services: ["Architecture", "Interior", "Design & Build"],
    story: "A 1,200 m² corporate headquarters expressing Sentra's brand discipline — quiet from outside, precise within.",
    challenge: "Aggressive 14-month delivery with a five-tenant occupancy plan and a constrained urban site.",
    solution: "Modular post-tension structural grid, prefabricated façade modules, and a phased fit-out that allowed partial occupancy from month nine.",
  },
  {
    ref: "SR-W-003", title: "Al-Hidayah Mosque", location: "Yogyakarta", year: "2027",
    category: "Government", value: "IDR 6.5 B",
    services: ["Architecture", "Interior", "Landscape"],
    story: "A 900 m² community mosque grounded in Javanese-modern proportions, designed to host both daily prayer and weekly community programs.",
    challenge: "Acoustic clarity for 600 worshippers, natural ventilation in equatorial heat, and a dignified material palette within a community budget.",
    solution: "Layered roof geometry with internal acoustic baffling, cross-ventilated mezzanine, and locally fired brick screens that double as solar control.",
  },
  {
    ref: "SR-W-004", title: "Cafe Sari — Bandung", location: "Bandung", year: "2026",
    category: "Interior", value: "IDR 1.2 B",
    services: ["Interior", "Design & Build"],
    story: "An industrial-Japandi café placed inside a 1970s warehouse shell — restraint as the signature.",
    challenge: "A heritage-leaning shell with no insulation, low daylight, and a tight 5-month build window.",
    solution: "A floating timber 'room within a room', warm clay-plaster walls, and a single skylight intervention that anchors the entire interior.",
  },
  {
    ref: "SR-W-005", title: "Rumah Santoso", location: "Surabaya", year: "2026",
    category: "Private", value: "IDR 2.2 B",
    services: ["Architecture", "Interior", "Design & Build"],
    story: "A 220 m² modern minimalist family home for a multi-generational household.",
    challenge: "Three generations under one roof with very different acoustic and privacy needs.",
    solution: "A central garden court separating quiet wings from social wings, with a shared rooftop reading terrace.",
  },
  {
    ref: "SR-W-006", title: "IKN Civic Pavilion Study", location: "Ibu Kota Nusantara", year: "2025",
    category: "Government", value: "Confidential",
    services: ["Architecture", "Landscape"],
    story: "A study contribution to a civic pavilion within the IKN ecosystem — exploring Nusantara-modern vocabulary at a national scale.",
    challenge: "Designing climate-responsive civic identity for a city with no established precedent.",
    solution: "Tropical filigree screens, a raised circulation plinth that respects local hydrology, and a material logic drawn from Kalimantan craft traditions.",
  },
];

const categories: Category[] = ["All", "Architecture", "Interior", "Landscape", "Design & Build", "Government", "Private"];

function Portfolio() {
  const { t } = useI18n();
  const [active, setActive] = useState<Category>("All");
  const filtered = active === "All" ? works : works.filter((w) => w.category === active || w.services.includes(active as string));

  return (
    <AppLayout>
      <PageHeader
        title={t("portfolio.title")}
        subtitle="A curated selection of architecture, interior, landscape, and design & build projects — each presented as a brief case study, not just an image."
        refCode="REF · 08"
        eyebrow="Portfolio · Selected Works 2025–2027"
      />

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={cn(
              "px-3.5 py-1.5 rounded-md text-xs font-medium uppercase tracking-[0.14em] transition-colors border",
              active === c
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-primary",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {filtered.map((w) => (
          <CornerFrame key={w.ref} tone="navy" className="p-6 bg-card rounded-xl">
            <div className="flex items-start justify-between mb-4">
              <TechLabel ref={w.ref} label={w.category} />
              <span className="text-[10px] font-mono text-muted-foreground">{w.year}</span>
            </div>

            {/* Visual placeholder — blueprint-styled */}
            <div className="relative aspect-[16/9] rounded-lg mb-5 overflow-hidden bg-secondary border border-border">
              <div className="absolute inset-0 blueprint-grid-fine" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Layers className="h-10 w-10 text-primary/20" strokeWidth={1.2} />
              </div>
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono text-primary/50">
                <span>PLAN · 01</span>
                <span>SCALE 1:200</span>
              </div>
            </div>

            <h3 className="font-display text-lg font-bold text-primary mb-2">{w.title}</h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" strokeWidth={1.6} />{w.location}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" strokeWidth={1.6} />{w.year}</span>
              <span className="font-mono text-primary">{w.value}</span>
            </div>

            <p className="text-[13px] text-foreground/80 leading-relaxed mb-4">{w.story}</p>

            <div className="space-y-2.5 text-[12px] border-t border-border pt-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.18em] text-accent font-semibold">Challenge</span>
                <p className="mt-1 text-muted-foreground leading-relaxed">{w.challenge}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-[0.18em] text-accent font-semibold">Solution</span>
                <p className="mt-1 text-muted-foreground leading-relaxed">{w.solution}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {w.services.map((s) => (
                <span key={s} className="text-[10px] uppercase tracking-[0.14em] px-2 py-1 rounded bg-secondary text-secondary-foreground border border-border">
                  {s}
                </span>
              ))}
            </div>
          </CornerFrame>
        ))}
      </div>
    </AppLayout>
  );
}
