# Backend Refactor: SRA → CRM-Compatible (Supabase + n8n)

Tujuan: bikin SRA Project kompatibel dengan arsitektur CRM existing (Supabase + n8n) **tanpa mengubah schema CRM**, dengan model **hybrid**: read langsung dari Supabase client, write via n8n webhook, dan sinkron 2 arah tabel SRA ↔ CRM via n8n.

---

## 1. Analisis Dependency saat ini (yang bikin SRA "lock-in")

| Area | Kondisi sekarang | Masalah utk CRM |
|---|---|---|
| **Server logic** | 20+ file `src/lib/*.functions.ts` pakai `createServerFn` + `requireSupabaseAuth` (TanStack Start RPC) | Wajib server runtime TanStack; CRM tidak punya layer ini. Business logic terkunci di RPC. |
| **Auth** | Supabase Auth single-project + `user_roles` (super_admin/admin) + RLS via `has_role()` | CRM = Supabase project berbeda → token tidak interchangeable, RLS terikat ke `auth.uid()` lokal. |
| **Database** | 30 tabel SRA (projects, project_phases, daily_reports, invoices, dst.) dengan FK ke `auth.users` SRA | CRM punya struktur sendiri (contacts/deals/companies) — relasi user_id beda project. |
| **Server state** | Auth attacher (`attachSupabaseAuth`) inject bearer di setiap RPC; SSR loaders; overflow logger; owner-notify; AI gateway | Semua jalan di Worker SSR — bukan stateless frontend. |
| **Business logic** | Validasi, seed phases (trigger DB), digest email/WA, AI analysis, monetary overflow — campur di server fn + DB trigger | Harusnya pindah ke n8n (orchestration single source). |
| **Edge function publik** | `src/routes/api/public/hooks/owner-digest.ts` (cron) | Bagus, sudah pola webhook — bisa di-handle n8n. |

---

## 2. Arsitektur Target

```text
                ┌─────────────────────────────┐
                │   Frontend (SRA, React)     │
                │   - TanStack Router (SPA)   │
                │   - supabase-js client      │
                │   - Service Layer (adapter) │
                └────────┬──────────┬─────────┘
            READ (RLS)   │          │  WRITE / ACTION
                         ▼          ▼
              ┌──────────────┐  ┌────────────────────┐
              │ Supabase SRA │  │  n8n Webhook API    │
              │ (DB + Auth)  │  │  (orchestration)    │
              └──────┬───────┘  └──────┬──────────────┘
                     │                 │
                     │    sync 2-way   │
                     │◄────────────────┤
                     │                 ▼
                     │         ┌────────────────┐
                     │         │ Supabase CRM   │
                     │         │ (source of     │
                     │         │  truth, beda   │
                     │         │  project)      │
                     │         └────────────────┘
```

### Prinsip
- **Read** → frontend pakai `supabase-js` langsung (RLS jadi gate). Cepat, no server hop.
- **Write / mutation / business action** → frontend POST ke n8n webhook. n8n yang validasi, tulis ke Supabase SRA, dan sync ke CRM.
- **Auth cross-project** → user login ke Supabase CRM (source of truth). SRA verifikasi token CRM via JWT verification (shared JWT secret) atau lookup ke endpoint CRM. Profil & role di-mirror lokal (read-only) buat RLS SRA.
- **Server functions dihapus** — tidak ada lagi `createServerFn` untuk app logic. SRA jadi SPA murni + n8n.
- **Tabel SRA tetap** sebagai operational store; n8n yang jaga konsistensi ke CRM.

---

## 3. Daftar Perubahan

### A. Frontend / Service Layer (perubahan utama)
1. Buat folder baru `src/services/` berisi:
   - `supabase-read.ts` — wrapper read-only (list/get) ke Supabase langsung dengan RLS.
   - `n8n-client.ts` — POST helper ke n8n webhook (signed request, timeout, retry, error mapping).
   - Per-domain adapter: `projects.service.ts`, `tasks.service.ts`, `daily-reports.service.ts`, dst. — ekspos API yang sama bentuknya dengan server fn sekarang (biar route minim berubah).
2. Refactor setiap `src/routes/_authenticated/*` agar:
   - Read pakai `useQuery` + service read (Supabase).
   - Mutation pakai `useMutation` + service n8n.
   - Hapus semua `useServerFn(...)`.
3. Hapus `src/start.ts` middleware `attachSupabaseAuth` (tidak perlu, tidak ada RPC).
4. Hapus `_authenticated` SSR gate berbasis server fn; ganti dengan client-side guard murni (cek session supabase di `beforeLoad`, `ssr: false`).

### B. Server Layer (dibersihkan)
1. **Hapus**: semua `src/lib/*.functions.ts` (projects, tasks, documents, design-monitoring, dst.) — total 20+ file.
2. **Hapus**: `src/lib/*.server.ts` yang dipakai server fn (ai-gateway, config, owner-notify dll.) → logic-nya pindah ke n8n workflow.
3. **Pertahankan minimal**:
   - `src/routes/api/public/hooks/*` — endpoint webhook yang dipanggil n8n (mis. callback, signed events).
   - `src/integrations/supabase/client.ts` — browser client.
4. **Hapus** `client.server.ts`, `auth-middleware.ts`, `auth-attacher.ts` (tidak terpakai lagi).

### C. Auth (cross-project)
1. Login form pakai Supabase **CRM** client (URL+anon key CRM dari env baru: `VITE_CRM_SUPABASE_URL`, `VITE_CRM_SUPABASE_ANON_KEY`).
2. SRA Supabase di-set agar **menerima JWT** dari CRM:
   - Opsi A (recommended): set `JWT_SECRET` SRA = `JWT_SECRET` CRM → token interchangeable. RLS SRA tetap pakai `auth.uid()`.
   - Opsi B: SRA tetap punya auth sendiri, sync user via n8n saat login event.
3. Buat tabel mirror `crm_user_profiles` (read-only di SRA) yang di-populate n8n dari CRM. Role check di SRA pakai data ini.
4. Semua call ke n8n webhook menyertakan JWT user → n8n verifikasi sebelum forward ke CRM.

### D. n8n Workflow (yang harus dibuat)
1. `POST /sra/projects/upsert` — terima payload dari frontend, validasi, tulis ke `projects` SRA, lalu sync ke entity CRM yang relevan (deals/companies).
2. `POST /sra/tasks/upsert`, `/daily-reports/submit`, `/invoices/upsert`, dst. (mirror tiap mutation server fn lama).
3. `POST /sra/auth/sync-user` — dipanggil saat user login, mirror profil CRM → `crm_user_profiles` SRA.
4. `cron /sra/digest/owner-daily` — gantikan `owner-digest.ts` cron.
5. `POST /sra/ai/analyze` — gantikan `ai-analysis.functions.ts` (call ke AI gateway, return hasil).
6. Webhook callback: n8n → SRA endpoint `src/routes/api/public/hooks/*` untuk notifikasi balik (mis. status sync).

### E. Database SRA (tanpa ubah schema CRM)
- **Tidak ada** perubahan ke CRM.
- Di SRA: tambah tabel kecil `crm_user_profiles` (mirror) dan `n8n_sync_log` (audit sync). Itu saja.
- Trigger `seed_project_phases` boleh tetap (logic tidak bocor ke CRM).
- RLS SRA tetap; di-tighten ke `auth.uid()` (yang sekarang = user CRM via shared JWT).

---

## 4. Langkah Migrasi Aman (bertahap, tanpa downtime)

**Fase 0 — Persiapan (no code change)**
- Konfirmasi shared JWT secret antara CRM & SRA Supabase.
- Siapkan base URL n8n + secret signing key (disimpan via Lovable secret).
- Bikin daftar mapping field CRM ↔ SRA (per entitas).

**Fase 1 — Service Layer skeleton (paralel, belum dipakai)**
- Tambah `src/services/n8n-client.ts` + `src/services/supabase-read.ts`.
- Adapter per domain, signature sama dengan server fn lama.
- 1 route pilot (mis. `/projects`) di-switch ke service layer; sisanya tetap server fn.

**Fase 2 — Pindah Auth ke CRM**
- Tambah env CRM. Login form pakai client CRM.
- n8n workflow `sync-user` aktif. Mirror table aktif.
- SRA Supabase set shared JWT secret. Test login end-to-end di pilot route.

**Fase 3 — Migrasi route per route**
- Convert routes secara bertahap (urutan saran): projects → tasks → daily-reports → documents → reports → finance → admin pages.
- Setiap route yang dimigrasi: hapus dependency ke `*.functions.ts` terkait.

**Fase 4 — Hapus server layer**
- Setelah semua route migrated: hapus folder `src/lib/*.functions.ts`, `*.server.ts`, middleware auth, `start.ts` middleware.
- Smoke test full app.

**Fase 5 — n8n sync 2-arah aktif penuh**
- Aktifkan workflow sync SRA ↔ CRM (sebelumnya bisa dry-run / log only).
- Monitor `n8n_sync_log` selama 1-2 minggu.

**Rollback strategy**: tiap fase reversible karena service layer punya signature sama dengan server fn — tinggal swap import.

---

## 5. Catatan teknis penting

- **Tanpa schema CRM detail**, mapping field di adapter & n8n masih placeholder. Begitu Anda share struktur tabel CRM, plan ini bisa di-extend jadi mapping konkret per entitas.
- **Read langsung dari client** mengandalkan RLS yang ketat di Supabase SRA — sebelum buang server fn, audit RLS tiap tabel.
- **n8n webhook** harus pakai HMAC signing (frontend sign dengan JWT user, n8n verifikasi) untuk cegah abuse.
- **AI Gateway (`LOVABLE_API_KEY`)** saat ini di server fn. Di model baru, n8n yang panggil AI Gateway — API key disimpan di n8n credentials, bukan di SRA lagi.
- **SEO / SSR**: dengan SPA murni, public pages (kalau ada) kehilangan SSR. Sejauh ini SRA semuanya `_authenticated` — tidak masalah.

---

Plan ini intentionally **arsitektural / prinsip dulu** (sesuai jawaban Anda). Step berikutnya butuh skema CRM untuk bikin mapping konkret dan workflow n8n per entitas.

---

## 6. Status eksekusi

- ✅ **Fase 0** — Secrets tersimpan: `N8N_BASE_URL`, `N8N_WEBHOOK_SIGNING_SECRET`, `CRM_SUPABASE_URL`, `CRM_SUPABASE_ANON_KEY`.
- ✅ **Fase 1 (skeleton)** — Service layer paralel dibuat, belum di-wire ke route apa pun:
  - `src/lib/n8n-proxy.functions.ts` — server-fn proxy HMAC-sign + forward ke n8n (15s timeout). Secret tetap server-side.
  - `src/services/n8n-client.ts` — wrapper browser yang panggil proxy.
  - `src/services/supabase-read.ts` — read helper langsung dari client (RLS).
  - `src/services/projects.service.ts` — pilot adapter, signature mirror `lib/projects.functions.ts`.
- ⏸️ **Fase 2 (cross-project auth) — DITUNDA**. CRM tidak pakai Supabase Auth → tidak ada JWT interchangeable. Saat dibutuhkan, pakai Opsi B (auth terpisah + sync user via n8n).
- ⏭️ **Fase 3 berikutnya**: ketika n8n workflow `webhook/sra/projects/*` sudah dibuat di sisi n8n, swap route `/projects` ke `projects.service.ts` sebagai proof of concept. Sebelum itu, route lama tetap jalan via `createServerFn`.

### Konvensi path n8n yang dipakai adapter pilot

| Action          | n8n path                              |
| --------------- | ------------------------------------- |
| create project  | `POST webhook/sra/projects/create`    |
| update project  | `POST webhook/sra/projects/update`    |
| delete project  | `POST webhook/sra/projects/delete`    |
| update phase    | `POST webhook/sra/projects/update-phase` |

### Kontrak signing n8n

- Header: `x-sra-signature` (HMAC-SHA256 hex), `x-sra-timestamp` (epoch ms).
- Pesan yang di-sign: `` `${timestamp}.${body}` ``.
- Body JSON: `{ payload, actor: { user_id, email }, ts }`.
- n8n workflow wajib: tolak request bila timestamp > ±5 menit, dan re-compute HMAC pakai `N8N_WEBHOOK_SIGNING_SECRET` lalu timing-safe compare.
