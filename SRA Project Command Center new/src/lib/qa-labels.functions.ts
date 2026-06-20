import { pmis } from "@/integrations/crm/client";

const BANNED = ["SOP", "SRA", "pemerintah"];

type Finding = { table: string; column: string; id: string; matched: string; snippet: string };

async function scan(table: string, columns: string[]): Promise<Finding[]> {
  const findings: Finding[] = [];
  const orParts = columns.flatMap((c) => BANNED.map((w) => `${c}.ilike.%${w}%`)).join(",");
  const { data, error } = await pmis(table)
    .select(["id", ...columns].join(","))
    .or(orParts)
    .limit(200);
  if (error) return findings;
  for (const row of (data ?? []) as any[]) {
    for (const c of columns) {
      const v: string | null = row[c];
      if (!v) continue;
      for (const w of BANNED) {
        if (v.toLowerCase().includes(w.toLowerCase())) {
          findings.push({ table: `pmis_${table}`, column: c, id: row.id, matched: w, snippet: v.length > 140 ? v.slice(0, 140) + "…" : v });
          break;
        }
      }
    }
  }
  return findings;
}

export async function runLabelAudit() {
  const scans = await Promise.all([
    scan("phase_deliverables", ["name", "notes", "code"]),
    scan("projects", ["name", "description", "location"]),
    scan("daily_reports", ["work_summary", "issues"]),
    scan("weekly_reports", ["summary"]),
    scan("monthly_reports", ["executive_summary"]),
    scan("risks", ["title", "mitigation"]),
    scan("documents", ["name", "description"]),
    scan("correspondence", ["subject", "body"]),
  ]);
  return { findings: scans.flat(), scannedAt: new Date().toISOString(), bannedWords: BANNED };
}