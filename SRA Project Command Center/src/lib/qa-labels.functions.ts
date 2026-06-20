import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const BANNED = ["SOP", "SRA", "pemerintah"];

type Finding = { table: string; column: string; id: string; matched: string; snippet: string };

async function scan(supabase: any, table: string, columns: string[]) {
  const findings: Finding[] = [];
  const orParts = columns
    .flatMap((c) => BANNED.map((w) => `${c}.ilike.%${w}%`))
    .join(",");
  const { data, error } = await supabase
    .from(table)
    .select(["id", ...columns].join(","))
    .or(orParts)
    .limit(200);
  if (error) return findings;
  for (const row of data ?? []) {
    for (const c of columns) {
      const v: string | null = row[c];
      if (!v) continue;
      for (const w of BANNED) {
        if (v.toLowerCase().includes(w.toLowerCase())) {
          findings.push({
            table,
            column: c,
            id: row.id,
            matched: w,
            snippet: v.length > 140 ? v.slice(0, 140) + "…" : v,
          });
          break;
        }
      }
    }
  }
  return findings;
}

export const runLabelAudit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const scans = await Promise.all([
      scan(context.supabase, "phase_deliverables", ["name", "notes", "code"]),
      scan(context.supabase, "projects", ["name", "description", "location"]),
      scan(context.supabase, "daily_reports", ["content", "constraints"]),
      scan(context.supabase, "weekly_reports", ["content", "highlights"]),
      scan(context.supabase, "monthly_reports", ["content"]),
      scan(context.supabase, "risks", ["title", "description", "mitigation"]),
      scan(context.supabase, "documents", ["name", "description"]),
      scan(context.supabase, "correspondence", ["subject", "body"]),
    ]);
    const findings = scans.flat();
    return { findings, scannedAt: new Date().toISOString(), bannedWords: BANNED };
  });