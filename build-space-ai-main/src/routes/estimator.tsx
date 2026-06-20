import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/stub-page";
import { useI18n } from "@/lib/i18n";
import { Calculator } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/estimator")({ component: Page });

function Page() {
  const { t, fmtIDR } = useI18n();
  const [area, setArea] = useState(200);
  const [tier, setTier] = useState<"standard" | "mid" | "premium">("mid");
  const rates = { standard: 6_000_000, mid: 8_500_000, premium: 14_000_000 };
  const construction = area * rates[tier];
  const arch = area * 275_000;
  const interior = area * 500_000;
  const landscape = area * 0.4 * 175_000;
  const total = construction + arch + interior + landscape;
  return (
    <StubPage title={t("estimator.title")} subtitle="Quick architecture & build estimation (IDR).">
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Building Area (m²)</label>
            <input type="number" value={area} onChange={(e) => setArea(Number(e.target.value) || 0)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Quality Tier</label>
            <div className="mt-1 grid grid-cols-3 gap-2">
              {(["standard", "mid", "premium"] as const).map((x) => (
                <button key={x} onClick={() => setTier(x)}
                  className={`rounded-md border px-3 py-2 text-sm capitalize ${tier === x ? "bg-primary text-primary-foreground border-primary" : "bg-background"}`}>
                  {x}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="h-4 w-4 text-accent" />
            <h3 className="font-semibold text-primary">Estimation</h3>
          </div>
          <ul className="text-sm space-y-2">
            <li className="flex justify-between"><span>Architectural Design Fee</span><span className="tabular-nums">{fmtIDR(arch)}</span></li>
            <li className="flex justify-between"><span>Interior Design Fee</span><span className="tabular-nums">{fmtIDR(interior)}</span></li>
            <li className="flex justify-between"><span>Landscape Design Fee</span><span className="tabular-nums">{fmtIDR(landscape)}</span></li>
            <li className="flex justify-between"><span>Construction ({tier})</span><span className="tabular-nums">{fmtIDR(construction)}</span></li>
            <li className="flex justify-between pt-3 border-t font-semibold text-primary"><span>Total</span><span className="tabular-nums">{fmtIDR(total)}</span></li>
          </ul>
        </div>
      </div>
    </StubPage>
  );
}
