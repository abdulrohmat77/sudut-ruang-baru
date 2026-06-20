-- ============================================================
-- PRICING RATES — RAB Konstruksi & Fee Jasa Desain
-- Sumber edit: Google Sheet → sync n8n → tabel ini. App (Estimator) baca dari sini.
-- Jalankan sekali di SQL Editor SudutRuang (wbfqudrzwsnlzevxjlkm).
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

create table if not exists public.design_service_rates (
  id              text primary key,
  service_name    text not null,
  category        text not null,
  tier            text,
  description     text,
  fee_percent_min numeric default 0,
  fee_percent_max numeric default 0,
  fee_per_sqm_min numeric default 0,
  fee_per_sqm_max numeric default 0,
  suitable_for    text,
  rab_termasuk    text,
  sort_order      int default 0,
  is_active       boolean default true,
  updated_at      timestamptz default now()
);

-- RLS anon-all (baca/tulis pakai anon key, sama pola tabel lain)
alter table public.construction_rates enable row level security;
drop policy if exists "construction_rates anon all" on public.construction_rates;
create policy "construction_rates anon all" on public.construction_rates for all to anon, authenticated using (true) with check (true);

alter table public.design_service_rates enable row level security;
drop policy if exists "design_service_rates anon all" on public.design_service_rates;
create policy "design_service_rates anon all" on public.design_service_rates for all to anon, authenticated using (true) with check (true);

-- ============================================================
-- SEED — data harga saat ini (baseline). ON CONFLICT DO NOTHING
-- supaya tidak menimpa kalau sudah ada (mis. sudah disync dari Sheet).
-- ============================================================
insert into public.construction_rates (id, type, tier, price_per_sqm_min, price_per_sqm_max, specification, notes, sort_order) values
  ('rmh-eko','Rumah Tinggal','Ekonomi',3000000,4500000,'Bata merah, keramik standar, cat lokal','Type 21-36',10),
  ('rmh-std','Rumah Tinggal','Standar',4500000,6000000,'Bata ringan, granit, cat premium','Type 36-70',20),
  ('rmh-mng','Rumah Tinggal','Menengah Atas',6000000,8000000,'Material impor sebagian, plafon gypsum detail','Type 70-150',30),
  ('rmh-prm','Rumah Tinggal','Mewah/Premium',8000000,15000000,'Full material premium, smart home, kolam renang','Custom design',40),
  ('ruko-std','Ruko / Kios','Standar',3500000,5000000,'Struktur beton, fasad sederhana','2-3 lantai',50),
  ('ruko-prm','Ruko / Kios','Premium',5000000,7000000,'ACP, kaca tempered, lift opsional','3-5 lantai',60),
  ('cafe-std','Cafe / Restoran','Standar',4000000,6000000,'Partisi, plafon ekspos, lighting dasar','Termasuk fit-out dasar',70),
  ('cafe-prm','Cafe / Restoran','Premium',7000000,10000000,'Full custom interior, HVAC, audio system','Flagship store',80),
  ('kntr-std','Kantor','Standar',3500000,5000000,'Open plan, raised floor opsional','Per m2 luas lantai',90),
  ('kntr-prm','Kantor','Premium',5000000,8000000,'Full partisi, false ceiling, M&E lengkap','Grade A',100),
  ('vila-std','Villa / Guest House','Standar',5000000,7000000,'Tropis, kayu lokal, kolam kecil','',110),
  ('vila-prm','Villa / Guest House','Premium',10000000,12000000,'Infinity pool, stone wall, smart system','',120),
  ('reno-rng','Renovasi (Parsial)','Ringan',1500000,3000000,'Cat ulang, keramik, partisi ringan','Max 30% area',130),
  ('reno-sdg','Renovasi (Parsial)','Sedang',3000000,5000000,'Bongkar pasang, MEP sebagian','30-60% area',140),
  ('reno-ttl','Renovasi (Total)','Full Gut',5000000,8000000,'Bongkar total hingga struktur','60-100% area',150)
on conflict (id) do nothing;

-- Fee Jasa Desain — data asli studio (per m², ada kolom rab_termasuk).
-- Kolom tambahan rab_termasuk (idempotent) + bersihkan seed lama (id format berbeda).
alter table public.design_service_rates add column if not exists rab_termasuk text;
delete from public.design_service_rates where id in ('arsi-std','arsi-mng','arsi-prm','int-std','int-mng','int-prm','lns-std','lns-prm','kom-all','pgw-all');

insert into public.design_service_rates (id, service_name, category, tier, description, fee_percent_min, fee_percent_max, fee_per_sqm_min, fee_per_sqm_max, suitable_for, rab_termasuk, sort_order) values
  ('arsitektur-ekonomi','Arsitektur - Ekonomi','Arsitektur','Ekonomi','Layout denah, denah final, tampak utama, 2-3 perspektif 3D, estimasi kasar',0,0,50000,50000,'Rumah subsidi, rumah tumbuh, developer kecil','Tidak',10),
  ('arsitektur-standar','Arsitektur - Standar','Arsitektur','Standar','Konsep, denah lengkap, tampak 4 sisi, potongan, atap, DD, 3D, RAB, material board',0,0,110000,110000,'Rumah 100-300 m2, proyek menengah','Ya (estimasi)',20),
  ('arsitektur-premium','Arsitektur - Premium','Arsitektur','Premium','Semua Standar + detail drawing, plafon, pola lantai, schedule, RAB&BOQ, 3D realistis, 3x kunjungan, garansi konsultasi 30 hari',0,0,200000,200000,'Rumah mewah, villa, klien luar provinsi','Ya (detail+BOQ)',30),
  ('interior-ekonomi','Interior - Ekonomi','Interior','Ekonomi','Moodboard, layout furniture, 3D sederhana, estimasi kasar',0,0,60000,60000,'Kebutuhan dasar 1-2 ruang','Tidak',40),
  ('interior-standar','Interior - Standar','Interior','Standar','Moodboard, layout semua ruang, gambar interior, material schedule, 3D realistis, RAB',0,0,120000,120000,'Full unit menengah','Ya (estimasi)',50),
  ('interior-premium','Interior - Premium','Interior','Premium','Semua Standar + shop drawing custom, BOQ, rekomendasi vendor, 3D multi-ruang, garansi 30 hari',0,0,225000,225000,'Luxury, hospitality','Ya (detail+BOQ)',60),
  ('landscape-ekonomi','Landscape - Ekonomi','Landscape','Ekonomi','Layout taman, planting plan dasar, 3D sederhana, estimasi kasar',0,0,40000,40000,'Taman rumah sederhana','Tidak',70),
  ('landscape-standar','Landscape - Standar','Landscape','Standar','Layout lengkap, planting plan detail, hardscape dasar, 3D realistis, RAB',0,0,80000,80000,'Taman residensial','Ya (estimasi)',80),
  ('landscape-premium','Landscape - Premium','Landscape','Premium','Masterplan, hardscape & softscape detail, lighting plan, RAB&BOQ, 3D multi-view, garansi 30 hari',0,0,150000,150000,'Villa, resort, komersial','Ya (detail+BOQ)',90),
  ('renovasi-ekonomi','Renovasi - Ekonomi','Renovasi','Ekonomi','Survey existing, layout usulan, estimasi kasar',0,0,50000,50000,'Renovasi ringan','Tidak',100),
  ('renovasi-standar','Renovasi - Standar','Renovasi','Standar','Existing drawing, DD, 3D, RAB',0,0,100000,100000,'Renovasi sedang','Ya',110),
  ('renovasi-premium','Renovasi - Premium','Renovasi','Premium','Existing survey detail, gambar lengkap, detail drawing, RAB&BOQ, 3D, pendampingan, garansi 30 hari',0,0,175000,175000,'Renovasi total','Ya (detail+BOQ)',120)
on conflict (id) do nothing;
