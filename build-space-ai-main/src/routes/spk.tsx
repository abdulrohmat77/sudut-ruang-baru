import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, PageHeader } from "@/components/app-layout";
import { useState, useMemo } from "react";
import {
  SPK_KATEGORI_OPTIONS,
  getCategories, getTiers, getScopeItems, getExcludeItems,
  getDefaultTermins, buildTermins, buildSpkNumber,
  formatTanggalIndo, formatIDR, terbilang, jenisFromPackage,
  getTahapItems,
  type SpkJenis, type SpkKategori, type SpkMode, type SpkTier,
  type SpkTerminInput,
} from "@/lib/spk-data";
import { buildSpkDocumentHtml, type SpkDocVars } from "@/lib/spk-document";
import { mockLeads, mockProposals, type Proposal } from "@/lib/mock-data";

export const Route = createFileRoute("/spk")({ component: Page });

function Page() {
  // ── Pipeline clients: hanya yang sudah di fase Proposal ke atas ──
  const ELIGIBLE_STAGES = ["Proposal", "Negotiation", "Approved", "SPK"];
  const pipelineClients = useMemo(() => {
    return mockLeads.filter((l) => ELIGIBLE_STAGES.includes(l.stage));
  }, []);

  // Cari proposal yang cocok berdasarkan nama klien
  const findProposal = (clientName: string): Proposal | undefined => {
    return mockProposals.find((p) => p.client === clientName);
  };

  // Search state untuk filter klien
  const [clientSearch, setClientSearch] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  const filteredClients = useMemo(() => {
    if (!clientSearch) return pipelineClients;
    const q = clientSearch.toLowerCase();
    return pipelineClients.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.projectType.toLowerCase().includes(q)
    );
  }, [clientSearch, pipelineClients]);

  // ── Paket Layanan (mode/kategori/tier) ──
  const [pkgMode, setPkgMode] = useState<SpkMode>("plan");
  const [pkgCat, setPkgCat] = useState("Arsitektur");
  const [pkgTier, setPkgTier] = useState<SpkTier>("Standar");

  // ── Data SPK ──
  const [spkSeq, setSpkSeq] = useState("5");
  const [contractDate, setContractDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const [namaKlien, setNamaKlien] = useState("");
  const [alamatKlien, setAlamatKlien] = useState("");
  const [hpKlien, setHpKlien] = useState("");
  const [kapasitas, setKapasitas] = useState("pemilik kavling");
  const [namaProyek, setNamaProyek] = useState("");
  const [lokasiProyek, setLokasiProyek] = useState("");
  const [luasLahan, setLuasLahan] = useState("");
  const [programRuang, setProgramRuang] = useState("");
  const [totalFee, setTotalFee] = useState(0);
  const [durasiBulan, setDurasiBulan] = useState(3);
  const [scopeTahap, setScopeTahap] = useState(5);

  // Jenis & kategori SPK — otomatis dari paket
  const jenisPekerjaan: SpkJenis = jenisFromPackage(pkgMode, pkgCat);
  const [kategori, setKategori] = useState<SpkKategori>("Membangun baru");

  // Lingkup — otomatis berubah dari paket (mode × kategori × tier)
  const scopeItems = useMemo(
    () => getScopeItems(pkgMode, pkgCat, pkgTier),
    [pkgMode, pkgCat, pkgTier]
  );
  const excludeItems = useMemo(
    () => getExcludeItems(pkgMode, pkgCat, pkgTier),
    [pkgMode, pkgCat, pkgTier]
  );

  // Tahapan pekerjaan (1.5) — berubah per mode × kategori × tier
  const tahapItems = useMemo(
    () => getTahapItems(pkgMode, pkgCat, pkgTier),
    [pkgMode, pkgCat, pkgTier]
  );

  // scopeTahap harus mengikuti jumlah tahap yang tersedia
  const maxTahap = tahapItems.length;
  const effectiveScopeTahap = Math.min(scopeTahap, maxTahap);

  // Termin — otomatis berubah dari paket
  const terminRows: SpkTerminInput[] = useMemo(
    () => getDefaultTermins(pkgMode, pkgCat, pkgTier),
    [pkgMode, pkgCat, pkgTier]
  );
  const termins = useMemo(
    () => buildTermins(terminRows, totalFee),
    [terminRows, totalFee]
  );

  // Nomor SPK — otomatis berubah dari jenis + tanggal
  const noSpk = useMemo(() => {
    const d = contractDate ? new Date(contractDate + "T00:00:00") : new Date();
    return buildSpkNumber(spkSeq, jenisPekerjaan, d);
  }, [spkSeq, jenisPekerjaan, contractDate]);

  // Tanggal Indo
  const tanggalIndo = useMemo(() => {
    const d = contractDate ? new Date(contractDate + "T00:00:00") : new Date();
    return formatTanggalIndo(d);
  }, [contractDate]);

  // ── Build dokumen HTML (preview live) ──
  const docVars: SpkDocVars = {
    NO_SPK: noSpk,
    HARI: tanggalIndo.hari,
    TANGGAL: tanggalIndo.tanggal,
    BULAN: tanggalIndo.bulan,
    TAHUN: tanggalIndo.tahun,
    NAMA_KLIEN: namaKlien || "(Nama Klien)",
    ALAMAT_KLIEN: alamatKlien,
    HP_KLIEN: hpKlien,
    KAPASITAS_KLIEN: kapasitas,
    NAMA_PROYEK: namaProyek || "(Nama Proyek)",
    JENIS_PEKERJAAN: jenisPekerjaan,
    LOKASI_PROYEK: lokasiProyek,
    LUAS_LAHAN: luasLahan,
    KATEGORI: kategori,
    PROGRAM_RUANG: programRuang,
    TOTAL_FEE: totalFee,
    DURASI_BULAN: durasiBulan,
    INCLUDE_RAB: true,
    scopeTahap: effectiveScopeTahap,
    scopeItems,
    excludeItems,
    tahapItems,
  };
  const docHtml = useMemo(
    () => buildSpkDocumentHtml(docVars, termins),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(docVars), JSON.stringify(termins)]
  );

  // Handler: ganti paket mode
  const onChangeMode = (m: SpkMode) => {
    setPkgMode(m);
    const cats = getCategories(m);
    if (!cats.includes(pkgCat)) setPkgCat(cats[0]);
    const tiers = getTiers(m);
    if (!tiers.includes(pkgTier)) setPkgTier(tiers[0]);
  };

  const totalPct = terminRows.reduce((s, r) => s + r.pct, 0);
  const allGood = totalPct === 100 && !!namaKlien && totalFee > 0;

  const inputCls =
    "w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";
  const labelCls =
    "block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1";

  return (
    <AppLayout>
      <PageHeader
        title="SPK Generator"
        subtitle="Surat Perjanjian Kerja — 9 pasal · termin fleksibel · preview live"
        refCode="REF · SPK"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ══════ LEFT: Form ══════ */}
        <div className="space-y-5">

          {/* §P — Paket Layanan */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-primary mb-4">
              §P · Paket Layanan
              <span className="ml-2 text-[10px] text-muted-foreground font-normal normal-case">
                (mengubah ini = mengubah lingkup, pengecualian & termin di Pasal 1–3)
              </span>
            </h3>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Mode Layanan</label>
                <div className="flex gap-2">
                  {(["plan", "db"] as SpkMode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => onChangeMode(m)}
                      className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold border transition-colors ${
                        pkgMode === m
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border hover:border-primary/40"
                      }`}
                    >
                      {m === "plan" ? "Jasa Perencanaan" : "Design & Build"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Kategori Paket</label>
                  <select
                    className={inputCls}
                    value={pkgCat}
                    onChange={(e) => setPkgCat(e.target.value)}
                  >
                    {getCategories(pkgMode).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Tier</label>
                  <div className="flex gap-1">
                    {getTiers(pkgMode).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setPkgTier(t)}
                        className={`flex-1 rounded-lg px-2 py-2 text-[11px] font-bold border transition-colors ${
                          pkgTier === t
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background border-border hover:border-primary/40"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* §1 — Identitas SPK */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-primary mb-4">§1 · Identitas SPK</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Kolom kiri: Nomor SPK */}
              <div>
                <label className={labelCls}># Nomor SPK</label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    className="w-20 rounded-lg border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
                    value={spkSeq}
                    onChange={(e) => setSpkSeq(e.target.value)}
                    placeholder="5"
                  />
                  <span className="rounded-md bg-primary px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                    Auto
                  </span>
                </div>
                <input className={`${inputCls} font-mono text-xs bg-muted`} value={noSpk} readOnly />
              </div>
              {/* Kolom kanan: Tanggal Kontrak */}
              <div>
                <label className={labelCls}>Tanggal Kontrak</label>
                <input type="date" className={inputCls} value={contractDate} onChange={(e) => setContractDate(e.target.value)} />
                <p className="text-xs text-muted-foreground mt-2">
                  {tanggalIndo.hari}, {tanggalIndo.tanggal} {tanggalIndo.bulan} {tanggalIndo.tahun}
                </p>
              </div>
            </div>
          </div>

          {/* §2 — Pihak Pertama */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-primary mb-4">§2 · Pihak Pertama — Pemberi Tugas</h3>

            {/* Pencarian klien dari pipeline */}
            <div className="mb-4 relative">
              <label className={labelCls}>Pilih dari Pipeline (Proposal / Negotiation / Approved)</label>
              <input
                className={inputCls}
                value={clientSearch}
                onChange={(e) => { setClientSearch(e.target.value); setShowClientDropdown(true); }}
                onFocus={() => setShowClientDropdown(true)}
                placeholder="Cari nama klien, HP, atau tipe proyek..."
              />
              {showClientDropdown && filteredClients.length > 0 && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-lg border bg-card shadow-lg">
                  {filteredClients.map((c) => {
                    const proposal = findProposal(c.name);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        className="w-full text-left px-3 py-2 text-xs hover:bg-secondary/60 border-b border-border/30 last:border-b-0"
                        onClick={() => {
                          setNamaKlien(c.name);
                          setHpKlien(c.phone);
                          setLokasiProyek(c.location);
                          setLuasLahan(`${c.landArea} m²`);
                          if (proposal) {
                            setNamaProyek(proposal.project);
                            setTotalFee(proposal.value);
                          }
                          setClientSearch("");
                          setShowClientDropdown(false);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{c.name}</span>
                          <span className="text-[10px] font-medium text-muted-foreground px-1.5 py-0.5 rounded bg-secondary">{c.stage}</span>
                        </div>
                        <div className="text-muted-foreground mt-0.5">
                          {c.phone} · {c.projectType} · {c.location}
                          {proposal && <span className="text-primary"> · {formatIDR(proposal.value)}</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              {showClientDropdown && filteredClients.length === 0 && clientSearch && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 rounded-lg border bg-card shadow-lg px-3 py-3 text-xs text-muted-foreground text-center">
                  Tidak ditemukan — isi manual di bawah
                </div>
              )}
              {/* Backdrop untuk close dropdown */}
              {showClientDropdown && (
                <div className="fixed inset-0 z-10" onClick={() => setShowClientDropdown(false)} />
              )}
            </div>

            <p className="text-[10px] text-muted-foreground mb-3 -mt-2">Atau isi manual:</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Nama Klien</label>
                <input className={inputCls} value={namaKlien} onChange={(e) => setNamaKlien(e.target.value)} placeholder="Bp. Ahmad Wijaya" />
              </div>
              <div>
                <label className={labelCls}>Kapasitas</label>
                <input className={inputCls} value={kapasitas} onChange={(e) => setKapasitas(e.target.value)} placeholder="pemilik kavling" />
              </div>
              <div>
                <label className={labelCls}>Alamat</label>
                <input className={inputCls} value={alamatKlien} onChange={(e) => setAlamatKlien(e.target.value)} placeholder="Jl. ..." />
              </div>
              <div>
                <label className={labelCls}>No. HP / WhatsApp</label>
                <input className={inputCls} value={hpKlien} onChange={(e) => setHpKlien(e.target.value)} placeholder="+62 812-..." />
              </div>
            </div>
          </div>

          {/* §3 — Detail Proyek */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-primary mb-4">§3 · Detail Proyek (Pasal 1.1)</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={labelCls}>Nama Proyek</label>
                <input className={inputCls} value={namaProyek} onChange={(e) => setNamaProyek(e.target.value)} placeholder="Perencanaan Pembangunan Villa ..." />
              </div>
              <div>
                <label className={labelCls}>Jenis Pekerjaan (auto dari paket)</label>
                <input className={`${inputCls} bg-muted`} value={jenisPekerjaan} readOnly />
              </div>
              <div>
                <label className={labelCls}>Kategori Proyek</label>
                <select className={inputCls} value={kategori} onChange={(e) => setKategori(e.target.value as SpkKategori)}>
                  {SPK_KATEGORI_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Lokasi Proyek</label>
                <input className={inputCls} value={lokasiProyek} onChange={(e) => setLokasiProyek(e.target.value)} placeholder="Jl. Raya ..." />
              </div>
              <div>
                <label className={labelCls}>Luas Lahan</label>
                <input className={inputCls} value={luasLahan} onChange={(e) => setLuasLahan(e.target.value)} placeholder="8 x 24 m / 192 m²" />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Program Ruang (Pasal 1.2)</label>
                <textarea className={`${inputCls} resize-y`} rows={3} value={programRuang} onChange={(e) => setProgramRuang(e.target.value)} placeholder="Lt.1: Teras, Ruang Tamu, ..." />
              </div>
            </div>
          </div>

          {/* §4 — Biaya & Durasi (Pasal 2 & 5) */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-primary mb-4">§4 · Biaya & Durasi (Pasal 2 & 5)</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Total Fee (Rp)</label>
                <input type="number" className={`${inputCls} font-mono`} value={totalFee} onChange={(e) => setTotalFee(Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className={labelCls}>Durasi (bulan)</label>
                <input type="number" className={inputCls} value={durasiBulan} onChange={(e) => setDurasiBulan(Number(e.target.value) || 0)} />
              </div>

              <div className="col-span-2">
                <label className={labelCls}>Lingkup sampai Tahap</label>
                <select className={inputCls} value={scopeTahap} onChange={(e) => setScopeTahap(Number(e.target.value))}>
                  {tahapItems.map((t, i) => (
                    <option key={i} value={i + 1}>Sampai Tahap {i + 1} – {t.title.replace(/^Tahap \d+[A-Z]?\s*–?\s*/, '')}</option>
                  ))}
                </select>
              </div>
            </div>
            {totalFee > 0 && (
              <p className="text-xs text-muted-foreground mt-3 italic">
                Terbilang: {terbilang(totalFee)}
              </p>
            )}
          </div>

          {/* §5 — Tahapan Pekerjaan (Pasal 1.5) */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-primary mb-3">
              §5 · {tahapItems.length} Tahap Pekerjaan (Pasal 1.5)
            </h3>
            <p className="text-[10px] text-muted-foreground mb-3">
              Lingkup pekerjaan mengikuti pembayaran — atur sampai tahap berapa SPK ini berlaku.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {tahapItems.map((t, i) => {
                const outOfScope = i >= effectiveScopeTahap;
                return (
                  <div key={i} className={`rounded-lg border p-3 ${outOfScope ? "opacity-40 border-border" : "border-primary/30"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold text-primary">T{i + 1}</span>
                      <span className="text-xs font-bold">{t.title.replace(/^Tahap \d+[A-Z]?\s*–?\s*/, '')}</span>
                      {outOfScope && <span className="text-[8px] text-muted-foreground ml-auto font-bold">DI LUAR LINGKUP</span>}
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      {t.desc || t.bullets.slice(0, 2).join(', ')}{t.bullets.length > 2 ? '...' : ''}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lingkup & Termin live info */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-primary mb-3">
              Lingkup Pekerjaan (Pasal 1.3) — auto dari paket
            </h3>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4 mb-4">
              {scopeItems.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
            <h3 className="text-xs font-bold uppercase tracking-wide text-primary mb-3">
              Tidak Termasuk (Pasal 1.4)
            </h3>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4 mb-4">
              {excludeItems.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
            <h3 className="text-xs font-bold uppercase tracking-wide text-primary mb-3">
              Termin Pembayaran (Pasal 3) — {terminRows.length} termin · total {totalPct}%
            </h3>
            <div className="space-y-1">
              {termins.map((t) => (
                <div key={t.kode} className="flex justify-between text-xs border-b border-border/50 py-1">
                  <span className="font-medium">{t.label}</span>
                  <span className="font-mono text-muted-foreground">{t.pct}% · {formatIDR(t.nominal)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className={`rounded-xl border p-4 text-center text-sm font-bold ${
            allGood ? "bg-green-50 border-green-200 text-green-700" : "bg-amber-50 border-amber-200 text-amber-700"
          }`}>
            {allGood ? "✓ Siap generate — semua data lengkap" : "⚠ Belum lengkap — isi nama klien & total fee"}
          </div>
        </div>

        {/* ══════ RIGHT: Live Preview ══════ */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Preview Dokumen (live) — Pasal 1–9
            </span>
            <span className="text-[10px] text-muted-foreground">
              Ubah paket/kategori/tier → dokumen berubah otomatis
            </span>
          </div>
          <div className="rounded-xl border bg-white overflow-hidden" style={{ height: "calc(100vh - 200px)", minHeight: 500 }}>
            <iframe
              title="Preview SPK"
              srcDoc={docHtml}
              className="w-full h-full border-none"
              style={{ background: "#fff" }}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
