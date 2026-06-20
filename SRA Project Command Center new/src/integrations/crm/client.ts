// Single-database client. Points to CRM Supabase (wbfqudrzwsnlzevxjlkm).
// Hardcoded URL + anon key — public/publishable, safe to ship.
// No auth/session: the PMIS app does not use Supabase Auth; identity is a
// display name in localStorage. All tables are accessed under the `pmis_*`
// prefix; RLS on those tables is permissive for anon + authenticated.
import { createClient } from "@supabase/supabase-js";

const CRM_URL = "https://wbfqudrzwsnlzevxjlkm.supabase.co";
const CRM_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiZnF1ZHJ6d3NubHpldnhqbGttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2OTY2NjUsImV4cCI6MjA5NTI3MjY2NX0.6ceWsWJ2g9ilLdHvKgolh7rKt5X8JEQyBHwDEhGJ4lc";

export const crmSupabase = createClient(CRM_URL, CRM_ANON, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

// Convenience helper so callers don't sprinkle pmis_ everywhere.
export const pmis = (table: string) => crmSupabase.from(`pmis_${table}` as any);