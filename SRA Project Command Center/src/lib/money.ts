/**
 * Monetary value limits.
 *
 * DB columns for IDR amounts are `numeric(22,2)` (see migration
 * `20260611_*` and follow-up). That allows up to 20 digits before the decimal
 * (~10^20 - 1). We cap business inputs slightly below the raw DB max to leave
 * headroom for tax/aggregation and to give a clean round number in the UI.
 *
 * MAX_MONETARY = 1e19 (10 quintillion IDR) — far above any realistic project
 * contract while still safely inside `numeric(22,2)`.
 */
export const MAX_MONETARY = 1e19;

export const MONEY_OVERFLOW_MESSAGE =
  `Nilai melebihi batas maksimum (Rp ${MAX_MONETARY.toLocaleString("id-ID")}). Periksa angka yang dimasukkan.`;

/** Zod-friendly refinement: ensures a numeric value fits the monetary cap. */
export function isWithinMonetaryRange(n: number | null | undefined): boolean {
  if (n === null || n === undefined) return true;
  return Number.isFinite(n) && n >= 0 && n <= MAX_MONETARY;
}

/**
 * Format a numeric / numeric-string value as IDR with thousands separators.
 * Returns an empty string for null/empty input. Decimal portion is preserved
 * up to 2 digits (matches DB scale).
 */
export function formatIDR(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";
  const raw = String(value).replace(/[^0-9.,-]/g, "").replace(/,/g, ".");
  if (raw === "" || raw === "-" || raw === ".") return raw;
  const negative = raw.startsWith("-");
  const cleaned = (negative ? raw.slice(1) : raw);
  const [intPart, decPart] = cleaned.split(".");
  const n = Number(intPart || "0");
  if (!Number.isFinite(n)) return String(value);
  const formattedInt = n.toLocaleString("id-ID");
  const out = decPart !== undefined ? `${formattedInt},${decPart.slice(0, 2)}` : formattedInt;
  return (negative ? "-" : "") + out;
}

/**
 * Parse a user-typed IDR string (e.g. "Rp 1.250.000,50" or "1,250,000.50")
 * back into a clean numeric string suitable for storage/submission.
 * Returns "" for empty input. Returns NaN-producing string if invalid.
 */
export function parseIDR(input: string): string {
  if (input === null || input === undefined) return "";
  let s = String(input).trim();
  if (s === "") return "";
  // strip currency markers / spaces
  s = s.replace(/rp/gi, "").replace(/\s+/g, "");
  const negative = s.startsWith("-");
  if (negative) s = s.slice(1);
  // detect last separator as decimal
  const lastDot = s.lastIndexOf(".");
  const lastComma = s.lastIndexOf(",");
  let decimalSep: string | null = null;
  if (lastDot === -1 && lastComma === -1) decimalSep = null;
  else if (lastDot === -1) decimalSep = ",";
  else if (lastComma === -1) decimalSep = ".";
  else decimalSep = lastDot > lastComma ? "." : ",";
  let intPart = s;
  let decPart = "";
  if (decimalSep) {
    const idx = s.lastIndexOf(decimalSep);
    intPart = s.slice(0, idx);
    decPart = s.slice(idx + 1);
  }
  intPart = intPart.replace(/[.,\s]/g, "");
  if (intPart === "" && decPart === "") return "";
  const norm = decPart ? `${intPart || "0"}.${decPart}` : intPart;
  return (negative ? "-" : "") + norm;
}

/**
 * Map a Postgres error to a user-friendly message, attaching a field name
 * when we know which column was being written. This is the safety net for
 * any overflow that slips past client + zod validation.
 */
export function mapDbError(err: unknown, fieldLabel?: string): Error {
  const msg = err instanceof Error ? err.message : String(err);
  // numeric overflow OR our DB CHECK constraint with "_monetary_range_chk" suffix
  const isOverflow =
    /numeric field overflow/i.test(msg) ||
    /_monetary_range_chk/i.test(msg) ||
    /violates check constraint.*monetary/i.test(msg);
  if (isOverflow) {
    // Try to extract field name from constraint name "<table>_<field>_monetary_range_chk"
    let extracted: string | undefined;
    const m = msg.match(/"([a-z0-9_]+)_monetary_range_chk"/i);
    if (m) {
      const parts = m[1].split("_");
      // last token(s) before "monetary" — best-effort
      extracted = parts.slice(1).join("_");
    }
    const where = ` pada kolom "${fieldLabel ?? extracted ?? "nilai"}"`;
    // Server-side log with full context for ops triage
    if (typeof process !== "undefined" && process?.stderr) {
      // eslint-disable-next-line no-console
      console.error("[money] overflow rejected", { fieldLabel, extracted, msg });
    }
    return new Error(`Nilai numerik terlalu besar${where}. ${MONEY_OVERFLOW_MESSAGE}`);
  }
  return err instanceof Error ? err : new Error(msg);
}