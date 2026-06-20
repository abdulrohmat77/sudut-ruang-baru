-- ============================================================
-- PRICING v2 — model Perencanaan + Design & Build (sesuai bisnis client)
-- Jalankan sekali di SQL Editor SudutRuang (wbfqudrzwsnlzevxjlkm).
-- Editable lewat menu "Kelola Harga". Estimator baca dari sini.
-- ============================================================

-- 1) PERENCANAAN (jasa desain) — harga per m²: list + floor (batas nego)
create table if not exists public.planning_rates (
  id            text primary key,
  category      text not null,      -- Arsitektur, Interior, Landscape, Renovasi
  tier          text not null,      -- Ekonomi, Standar, Premium
  list_per_m2   numeric not null default 0,
  floor_per_m2  numeric not null default 0,
  scope         text,               -- ringkasan lingkup per tier
  sort_order    int default 0,
  is_active     boolean default true,
  updated_at    timestamptz default now()
);

-- 2) DESIGN & BUILD — harga per satuan (m²/m'/bulan): min–max
create table if not exists public.build_rates (
  id            text primary key,
  grup          text not null,      -- Bangunan, Interior, Komponen, Landscape, Fitur Air, Maintenance
  category      text not null,      -- D&B Arsitektur, Kitchen Set, Kolam Renang, dst
  tier          text not null,      -- Standar, Premium, Luxury, Basic, Custom
  price_min     numeric not null default 0,
  price_max     numeric not null default 0,
  unit          text default 'm2',  -- m2 | m' | bulan
  notes         text,
  sort_order    int default 0,
  is_active     boolean default true,
  updated_at    timestamptz default now()
);

-- RLS anon-all
alter table public.planning_rates enable row level security;
drop policy if exists "planning_rates anon all" on public.planning_rates;
create policy "planning_rates anon all" on public.planning_rates for all to anon, authenticated using (true) with check (true);

alter table public.build_rates enable row level security;
drop policy if exists "build_rates anon all" on public.build_rates;
create policy "build_rates anon all" on public.build_rates for all to anon, authenticated using (true) with check (true);

-- ============================================================
-- SEED PERENCANAAN (list/m², floor/m²)
-- ============================================================
insert into public.planning_rates (id, category, tier, list_per_m2, floor_per_m2, scope, sort_order) values
  ('plan-arsitektur-ekonomi','Arsitektur','Ekonomi',50000,40000,'Konsep + layout/denah utama + 3D sederhana + estimasi biaya kasar. 1x revisi mayor. Tanpa RAB formal.',10),
  ('plan-arsitektur-standar','Arsitektur','Standar',110000,90000,'Gambar/denah lengkap + tampak + potongan + 3D realistis + RAB estimasi (Excel+PDF). 2x revisi mayor.',20),
  ('plan-arsitektur-premium','Arsitektur','Premium',200000,160000,'Semua item Standar + detail drawing + RAB/BOQ detail + pendampingan lapangan + garansi konsultasi 30 hari.',30),
  ('plan-interior-ekonomi','Interior','Ekonomi',60000,48000,'Moodboard + layout furniture + 3D sederhana + estimasi kasar.',40),
  ('plan-interior-standar','Interior','Standar',120000,95000,'Moodboard + layout semua ruang + gambar interior + material schedule + 3D realistis + RAB.',50),
  ('plan-interior-premium','Interior','Premium',225000,180000,'Semua Standar + shop drawing custom + BOQ + rekomendasi vendor + 3D multi-ruang + garansi 30 hari.',60),
  ('plan-landscape-ekonomi','Landscape','Ekonomi',40000,32000,'Layout taman + planting plan dasar + 3D sederhana + estimasi kasar.',70),
  ('plan-landscape-standar','Landscape','Standar',80000,65000,'Layout lengkap + planting plan detail + hardscape dasar + 3D realistis + RAB.',80),
  ('plan-landscape-premium','Landscape','Premium',150000,120000,'Masterplan + hardscape & softscape detail + lighting plan + RAB&BOQ + 3D multi-view + garansi 30 hari.',90),
  ('plan-renovasi-ekonomi','Renovasi','Ekonomi',50000,40000,'Survey existing + layout usulan + estimasi kasar.',100),
  ('plan-renovasi-standar','Renovasi','Standar',100000,80000,'Existing drawing + DD + 3D + RAB.',110),
  ('plan-renovasi-premium','Renovasi','Premium',175000,140000,'Existing survey detail + gambar lengkap + detail drawing + RAB&BOQ + 3D + pendampingan + garansi 30 hari.',120)
on conflict (id) do nothing;

-- ============================================================
-- SEED DESIGN & BUILD (min/satuan, max/satuan)
-- ============================================================
-- ============================================================
-- Hapus semua kategori D&B lama, isi ulang dengan 6 kategori standar.
delete from public.build_rates;
insert into public.build_rates (id, grup, category, tier, price_min, price_max, unit, notes, sort_order) values
  ('db-arsitektur-standar','Bangunan','Arsitektur','Standar',4500000,5500000,'m2','Rumah keluarga, kost, ruko/kantor',10),
  ('db-arsitektur-premium','Bangunan','Arsitektur','Premium',6000000,8000000,'m2','Rumah premium, villa, cafe, klinik',20),
  ('db-arsitektur-luxury','Bangunan','Arsitektur','Luxury',9000000,15000000,'m2','Rumah mewah, resort',30),
  ('db-interior-residensial-standar','Interior','Interior (Residensial)','Standar',2500000,4500000,'m2','Ceiling, cat, furniture loose, built-in sederhana',40),
  ('db-interior-residensial-premium','Interior','Interior (Residensial)','Premium',4500000,7500000,'m2','Custom furniture, kitchen set, wardrobe, wall panel',50),
  ('db-interior-residensial-luxury','Interior','Interior (Residensial)','Luxury',7500000,12000000,'m2','Veneer, marble, solid wood, smart home',60),
  ('db-interior-komersial-standar','Interior','Interior (Cafe/Komersial)','Standar',3000000,5000000,'m2','Fit-out cafe dasar',70),
  ('db-interior-komersial-premium','Interior','Interior (Cafe/Komersial)','Premium',5000000,10000000,'m2','Full custom interior cafe',80),
  ('db-interior-komersial-luxury','Interior','Interior (Cafe/Komersial)','Luxury',10000000,20000000,'m2','Flagship store',90),
  ('db-landscape-taman-rumah-standar','Landscape','Landscape (Taman Rumah)','Standar',350000,750000,'m2','Rumput, tanaman, stepping stone, lampu sederhana',100),
  ('db-landscape-taman-rumah-premium','Landscape','Landscape (Taman Rumah)','Premium',750000,2000000,'m2','Hardscape, softscape, lighting, irigasi',110),
  ('db-landscape-taman-rumah-luxury','Landscape','Landscape (Taman Rumah)','Luxury',2000000,5000000,'m2','Batu alam premium, kolam, decking, smart irrigation',120),
  ('db-landscape-taman-villa-standar','Landscape','Landscape (Taman Villa)','Standar',750000,1500000,'m2','Tropis, kayu lokal, kolam kecil',130),
  ('db-landscape-taman-villa-premium','Landscape','Landscape (Taman Villa)','Premium',1500000,3000000,'m2','Hardscape + softscape lengkap',140),
  ('db-landscape-taman-villa-luxury','Landscape','Landscape (Taman Villa)','Luxury',3000000,6000000,'m2','Infinity, stone wall, smart system',150),
  ('db-landscape-kolam-renang-standar','Landscape','Landscape (Kolam Renang)','Standar',5000000,8000000,'m2','Kolam standar + filtrasi dasar',160),
  ('db-landscape-kolam-renang-premium','Landscape','Landscape (Kolam Renang)','Premium',8000000,15000000,'m2','Finishing premium + sistem lengkap',170),
  ('db-landscape-kolam-renang-luxury','Landscape','Landscape (Kolam Renang)','Luxury',15000000,25000000,'m2','Infinity pool, sistem lengkap',180)
on conflict (id) do update set
  grup = excluded.grup, category = excluded.category, tier = excluded.tier,
  price_min = excluded.price_min, price_max = excluded.price_max,
  unit = excluded.unit, notes = excluded.notes, sort_order = excluded.sort_order;


-- ============================================================
-- 3) RAB KONSTRUKSI (biaya borongan all-in pasar — referensi)
-- ============================================================
create table if not exists public.construction_rates (
  id                 text primary key,
  type               text not null,
  tier               text not null,
  price_per_sqm_min  numeric not null default 0,
  price_per_sqm_max  numeric not null default 0,
  specification      text,
  notes              text,
  sort_order         int default 0,
  is_active          boolean default true,
  updated_at         timestamptz default now()
);
alter table public.construction_rates enable row level security;
drop policy if exists "construction_rates anon all" on public.construction_rates;
create policy "construction_rates anon all" on public.construction_rates for all to anon, authenticated using (true) with check (true);

-- Ganti seed lama (id format berbeda) dengan data RAB terbaru
delete from public.construction_rates where id in ('rmh-eko','rmh-std','rmh-mng','rmh-prm','ruko-std','ruko-prm','cafe-std','cafe-prm','kntr-std','kntr-prm','vila-std','vila-prm','reno-rng','reno-sdg','reno-ttl');

insert into public.construction_rates (id, type, tier, price_per_sqm_min, price_per_sqm_max, specification, notes, sort_order) values
  ('rab-rumah-tinggal-ekonomi','Rumah Tinggal','Ekonomi',3000000,4000000,'Bata merah, keramik standar, cat lokal','Type 21-36',10),
  ('rab-rumah-tinggal-standar','Rumah Tinggal','Standar',3500000,4500000,'Bata ringan, granit, cat premium','Type 36-70',20),
  ('rab-rumah-tinggal-menengah','Rumah Tinggal','Menengah',4500000,5500000,'Material campuran, plafon gypsum detail','Type 70-150',30),
  ('rab-rumah-tinggal-mewah','Rumah Tinggal','Mewah',5500000,7500000,'Material premium sebagian','Custom',40),
  ('rab-rumah-tinggal-luxury','Rumah Tinggal','Luxury',7500000,12000000,'Full premium, smart home, material impor','Custom',50),
  ('rab-ruko-kios-standar','Ruko / Kios','Standar',3500000,5000000,'Struktur beton, fasad sederhana','2-3 lantai',60),
  ('rab-ruko-kios-premium','Ruko / Kios','Premium',5000000,7000000,'ACP, kaca tempered, lift opsional','3-5 lantai',70),
  ('rab-cafe-restoran-standar','Cafe / Restoran','Standar',4000000,6000000,'Partisi, plafon ekspos, lighting dasar','Fit-out dasar',80),
  ('rab-cafe-restoran-premium','Cafe / Restoran','Premium',7000000,10000000,'Full custom interior, HVAC, audio system','Flagship',90),
  ('rab-kantor-standar','Kantor','Standar',3500000,5000000,'Open plan, raised floor opsional','Per m2 lantai',100),
  ('rab-kantor-premium','Kantor','Premium',5000000,8000000,'Full partisi, false ceiling, M&E lengkap','Grade A',110),
  ('rab-villa-guest-house-standar','Villa / Guest House','Standar',5000000,7000000,'Tropis, kayu lokal, kolam kecil','',120),
  ('rab-villa-guest-house-premium','Villa / Guest House','Premium',8000000,12000000,'Infinity pool, stone wall, smart system','',130),
  ('rab-renovasi-parsial-ringan','Renovasi (Parsial)','Ringan',1500000,3000000,'Cat ulang, keramik, partisi ringan','Max 30% area',140),
  ('rab-renovasi-parsial-sedang','Renovasi (Parsial)','Sedang',3000000,5000000,'Bongkar pasang, MEP sebagian','30-60% area',150),
  ('rab-renovasi-total-full-gut','Renovasi (Total)','Full Gut',5000000,8000000,'Bongkar total hingga struktur','60-100% area',160)
on conflict (id) do nothing;
