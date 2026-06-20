## Tujuan
1. Menampilkan kepemilikan & copyright **Sudut Ruang Arsitek** di seluruh aplikasi.
2. Mengunci halaman/aksi paling penting dengan password developer `@Bismillah2025`. Jika user ingin password atau mengubah konfigurasi inti, harus menghubungi Sudut Ruang Arsitek (kontak ada di SOP).

> Catatan penting (transparansi): Karena aplikasi ini adalah web app frontend, password yang disimpan di kode tetap bisa dilihat oleh orang yang mengakses source code. Untuk pencegahan casual tampering (orang biasa coba-coba ubah), kunci ini efektif. Untuk perlindungan kuat dari developer lain yang punya akses kode, perlu pindahkan ke backend (server function + Lovable Cloud) — bisa kita lakukan di langkah berikutnya kalau dibutuhkan.

## Yang akan dibuat

### 1. Copyright & Kepemilikan
- **Footer global** di `src/components/app/app-shell.tsx`:
  - Teks: `© 2026 Sudut Ruang Arsitek. All Rights Reserved.`
  - Subteks: `Web App ini adalah hak milik Sudut Ruang Arsitek. Kontak resmi tercantum pada SOP.`
- **Halaman Auth** (`src/routes/auth.tsx`): copyright kecil di bawah form login.
- **File `LICENSE`** di root project: lisensi proprietary "All Rights Reserved — Sudut Ruang Arsitek".
- **Header komentar** pada file kunci (`src/router.tsx`, `src/routes/__root.tsx`, `src/routes/_authenticated/route.tsx`):
  ```
  /**
   * © 2026 Sudut Ruang Arsitek — All Rights Reserved.
   * Web App ini adalah hak milik Sudut Ruang Arsitek.
   * Dilarang menyalin, memodifikasi, atau mendistribusikan tanpa izin tertulis.
   * Kontak: lihat SOP resmi Sudut Ruang Arsitek.
   */
  ```
- **Metadata SEO** di `__root.tsx`: tambah `<meta name="author" content="Sudut Ruang Arsitek">` dan `<meta name="copyright" content="© Sudut Ruang Arsitek">`.

### 2. Developer Lock (Password Gate)
Dibuat komponen `DeveloperLockDialog` + hook `useDeveloperUnlock`:
- Password: `@Bismillah2025` (di-hash sederhana di kode untuk tidak plaintext langsung).
- Status unlock disimpan di `sessionStorage` (hilang saat tab ditutup) — supaya tidak permanen.
- Dialog muncul dengan teks:
  > "Halaman ini dikunci oleh Sudut Ruang Arsitek. Masukkan kode developer untuk melanjutkan. Jika Anda tidak memiliki kode, silakan hubungi Sudut Ruang Arsitek (kontak ada di SOP)."

Halaman/aksi yang dikunci (paling penting):
- `Settings` (`/settings`) — konfigurasi inti aplikasi.
- `Admin Profiles` (`/admin-profiles`) — manajemen user/role.
- `QA Labels` (`/qa-labels`) — master data QA.

Cara kerja:
- Jika belum unlock, route menampilkan dialog di atas konten dan memblokir interaksi.
- Setelah password benar dimasukkan, akses terbuka selama sesi tab tsb.
- Tombol "Lock Again" tersedia di footer kecil tiap halaman terkunci.

### 3. (Opsional, kalau disetujui) Penguatan kontekstual
- Disable klik kanan + DevTools shortcut (F12, Ctrl+Shift+I) di production — hanya menyulitkan, tidak mencegah, tapi menambah barrier psikologis.
- Tambahkan watermark kecil "Sudut Ruang Arsitek" di sudut layar saat development/preview.

## File yang akan diubah / dibuat
- **Baru**: `LICENSE`, `src/components/app/footer.tsx`, `src/components/app/developer-lock-dialog.tsx`, `src/hooks/use-developer-unlock.ts`.
- **Diubah**: `src/components/app/app-shell.tsx` (mount footer), `src/routes/auth.tsx` (copyright), `src/routes/__root.tsx` (meta), `src/routes/_authenticated/settings.tsx`, `admin-profiles.tsx`, `qa-labels.tsx` (developer lock wrap).

## Konfirmasi yang dibutuhkan dari Anda
1. Apakah daftar halaman terkunci sudah pas (Settings, Admin Profiles, QA Labels)? Atau ingin tambah/kurangi?
2. Mau aktifkan opsi penguatan kontekstual (disable klik kanan + DevTools shortcut + watermark)?
3. Setuju password disimpan di frontend (bisa dilihat di source) untuk sekarang, dan nanti dipindah ke backend kalau perlu proteksi lebih kuat?
