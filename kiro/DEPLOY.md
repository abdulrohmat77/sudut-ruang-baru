# Deploy Dashboard ke Netlify

Dashboard ini app statis (Vite + React) dan saat ini **live di Netlify**.
Konfigurasi build & redirect sudah disiapkan di `netlify.toml` (bukan `vercel.json`).

## Langkah (sekali setup, ±5 menit)

1. Buka https://app.netlify.com → **Log in pakai akun GitHub**.
2. **Add new site → Import an existing project → GitHub**.
3. Pilih repo **`sherlyndika-bit/sudut-ruang-fixed`**.
4. Netlify membaca `netlify.toml` otomatis. Pastikan:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. (Opsional) **Site settings → Environment variables** untuk override default:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_N8N_WEBHOOK_URL` (mis. `https://n8n.srv1696073.hstgr.cloud/webhook`)
   - `VITE_DASHBOARD_EMAIL`, `VITE_DASHBOARD_PASSWORD`
   > Kalau dikosongkan, app pakai nilai default di kode.
6. **Deploy site**. Tunggu ±1 menit → dapat URL `https://<nama>.netlify.app`.

Buka URL → halaman login → masuk pakai kredensial dashboard.

## Update otomatis
Setiap commit baru ke branch `main` di GitHub → Netlify build & deploy ulang otomatis.

## File pendukung
- `netlify.toml` — build + redirect. Catch-all `/*` → `/index.html` membuat refresh
  halaman SPA tidak 404. Aturan `/commandcenter/*` melayani app statis Command Center
  (file asli tetap dilayani langsung; redirect hanya untuk path non-file).

## Domain sendiri (sudutruang.com)
Setelah punya akses DNS:

### Opsi A — subdomain `dashboard.sudutruang.com` (paling gampang)
1. Netlify → **Domain settings → Add a domain** → `dashboard.sudutruang.com`.
2. Tambahkan record DNS yang diberikan Netlify (CNAME `dashboard` → `<site>.netlify.app`)
   di panel DNS domain (Hostinger).
3. Tunggu propagasi → https://dashboard.sudutruang.com

### Opsi B — subfolder `sudutruang.com/dashboard`
Lebih rumit bila web utama beda server (perlu reverse proxy). Sarankan Opsi A.

## Catatan keamanan
- Anon key Supabase & URL n8n terlihat di bundle (wajar untuk anon key).
  **Pastikan RLS Supabase aktif & ketat** — itu satu-satunya proteksi data nyata.
- Ganti password default lewat **Settings → Akun & Keamanan** setelah online,
  atau set `VITE_DASHBOARD_PASSWORD` di Environment Variables Netlify.
- CORS: webhook n8n yang dipanggil dari domain Netlify harus mengizinkan origin
  tersebut (set Allowed Origins di node Webhook n8n).
