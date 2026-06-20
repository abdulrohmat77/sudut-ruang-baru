import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppLayout, PageHeader } from "@/components/app-layout";
import { PremiumCard, TechLabel, RuleLine, Pill, Dot } from "@/components/architectural";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useI18n } from "@/lib/i18n";
import { mockSPK } from "@/lib/mock-data";
import {
  PRINCIPAL, SPK_TAHAPAN, SPK_EXCLUSIONS, SPK_GUARDRAILS, SPK_QA_CHECKLIST,
  generateSpkNumber, computeSpkTermins, terbilang, formatTanggalIndo,
  type SpkJenis, type SpkKategori,
} from "@/lib/sra-spk";
import {
  FileSignature, CheckCircle2, AlertTriangle, Download, Sparkles,
  Wallet, Calendar, MapPin, User, Building2, Hash, ShieldCheck, BadgeCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/spk")({
  head: () => ({
    meta: [
      { title: "SPK Generator — Sudut Ruang Arsitek" },
      { name: "description", content: "Generator SPK resmi SRA — 9 pasal, termin 50/40/10, nomor otomatis." },
    ],
  }),
  component: SpkPage,
});

function SpkPage() {
  const { t, fmtIDR } = useI18n();
  const today = formatTanggalIndo();

  const [vars, setVars] = useState({
    NO_SPK: generateSpkNumber(5),
    HARI: today.hari,
    TANGGAL: today.tanggal,
    BULAN: today.bulan,
    TAHUN: today.tahun,
    NAMA_KLIEN: "Bp. Ahmad Wijaya",
    ALAMAT_KLIEN: "Jl. Merpati No. 12, Denpasar, Bali",
    HP_KLIEN: "+62 812-3456-7890",
    KAPASITAS_KLIEN: "pemilik kavling",
    NAMA_PROYEK: "Perencanaan Pembangunan Villa Wijaya di Ubud",
    JENIS_PEKERJAAN: "Perancangan Arsitektur" as SpkJenis,
    LOKASI_PROYEK: "Jl. Raya Ubud, Bali",
    LUAS_LAHAN: "20 x 30 meter / 600 m²",
    KATEGORI: "Membangun baru" as SpkKategori,
    PROGRAM_RUANG: "Lt.1: Carport, Living, Dining, Pantry, 1 KT tamu\nLt.2: Master BR + WIC, 2 KT anak, Family room\nRoof: Open deck + taman",
    TOTAL_FEE: 192_000_000,
    DURASI_BULAN: 3,
    INCLUDE_RAB: true,
  });

  const set = <K extends keyof typeof vars>(k: K, v: (typeof vars)[K]) =>
    setVars(prev => ({ ...prev, [k]: v }));

  const termins = useMemo(() => computeSpkTermins(vars.TOTAL_FEE), [vars.TOTAL_FEE]);
  const terbilangText = useMemo(() => terbilang(vars.TOTAL_FEE), [vars.TOTAL_FEE]);
  const totalPct = termins.reduce((s, x) => s + x.pct, 0);
  const allGood = totalPct === 100 && vars.NAMA_KLIEN && vars.TOTAL_FEE > 0 && vars.NO_SPK;

  return (
    <AppLayout>
      <PageHeader
        title="SPK Generator"
        subtitle="9 pasal · termin 50/40/10 · tanda tangan digital. Sesuai SRA-KB-TPL-SPK v2.0."
        refCode="REF · SRA-SPK-2026"
        eyebrow="Contract Engine"
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-2">
              <Sparkles className="size-4" /> Tarik dari Proposal
            </Button>
            <Button size="sm" className="gap-2">
              <Download className="size-4" /> Generate PDF
            </Button>
          </>
        }
      />

      {/* ── Library ─────────────────────────────────────────────── */}
      <PremiumCard className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <TechLabel ref="LIB · 01" label="SPK Library — kontrak aktif" />
          <Pill tone="info">{mockSPK.length} dokumen</Pill>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {mockSPK.map(s => (
            <div key={s.id} className="rounded-lg border border-border bg-background/40 p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="font-mono text-[10px] text-accent">{s.number}</div>
                <Pill tone={s.status === "Signed" ? "success" : "warning"}>
                  <Dot tone={s.status === "Signed" ? "success" : "warning"} pulse={s.status !== "Signed"} />
                  {s.status}
                </Pill>
              </div>
              <div className="font-semibold text-sm text-foreground leading-tight">{s.project}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.client}</div>
              <RuleLine className="my-3" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Nilai</span>
                <span className="font-bold text-foreground">{fmtIDR(s.value)}</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-muted-foreground">Ditandatangani</span>
                <span className="text-foreground">{s.signedAt ?? "—"}</span>
              </div>
            </div>
          ))}
        </div>
      </PremiumCard>

      {/* ── Two columns: form + sticky preview ──────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        {/* LEFT — form */}
        <div className="space-y-6">
          {/* Identitas SPK */}
          <PremiumCard>
            <TechLabel ref="§1" label="Identitas SPK" className="mb-4" />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nomor SPK" icon={Hash}>
                <Input value={vars.NO_SPK} onChange={e => set("NO_SPK", e.target.value)} className="font-mono text-xs" />
              </Field>
              <Field label="Tanggal Kontrak" icon={Calendar}>
                <div className="grid grid-cols-4 gap-2">
                  <Input value={vars.HARI} onChange={e => set("HARI", e.target.value)} placeholder="Hari" />
                  <Input value={vars.TANGGAL} onChange={e => set("TANGGAL", e.target.value)} placeholder="Tgl" />
                  <Input value={vars.BULAN} onChange={e => set("BULAN", e.target.value)} placeholder="Bulan" />
                  <Input value={vars.TAHUN} onChange={e => set("TAHUN", e.target.value)} placeholder="Thn" />
                </div>
              </Field>
            </div>
          </PremiumCard>

          {/* Pihak Pertama */}
          <PremiumCard>
            <TechLabel ref="§2" label="Pihak Pertama — Pemberi Tugas" className="mb-4" />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nama Klien" icon={User}>
                <Input value={vars.NAMA_KLIEN} onChange={e => set("NAMA_KLIEN", e.target.value)} />
              </Field>
              <Field label="Kapasitas" icon={BadgeCheck}>
                <Input value={vars.KAPASITAS_KLIEN} onChange={e => set("KAPASITAS_KLIEN", e.target.value)} placeholder="pemilik kavling / direktur / dll" />
              </Field>
              <Field label="Alamat Klien" icon={MapPin}>
                <Input value={vars.ALAMAT_KLIEN} onChange={e => set("ALAMAT_KLIEN", e.target.value)} />
              </Field>
              <Field label="No. HP / WhatsApp" icon={User}>
                <Input value={vars.HP_KLIEN} onChange={e => set("HP_KLIEN", e.target.value)} />
              </Field>
            </div>
          </PremiumCard>

          {/* Proyek */}
          <PremiumCard>
            <TechLabel ref="§3" label="Detail Proyek" className="mb-4" />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nama Proyek" icon={Building2} className="md:col-span-2">
                <Input value={vars.NAMA_PROYEK} onChange={e => set("NAMA_PROYEK", e.target.value)} />
              </Field>
              <Field label="Jenis Pekerjaan" icon={FileSignature}>
                <select
                  value={vars.JENIS_PEKERJAAN}
                  onChange={e => set("JENIS_PEKERJAAN", e.target.value as SpkJenis)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  {["Perancangan Arsitektur","Perancangan Interior","Perancangan Lanskap","Design & Build","Construction Supervision","Project Management"].map(o => (
                    <option key={o} value={o} className="bg-background">{o}</option>
                  ))}
                </select>
              </Field>
              <Field label="Kategori" icon={Building2}>
                <select
                  value={vars.KATEGORI}
                  onChange={e => set("KATEGORI", e.target.value as SpkKategori)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  {["Membangun baru","Renovasi","Penambahan lantai","Interior fit-out"].map(o => (
                    <option key={o} value={o} className="bg-background">{o}</option>
                  ))}
                </select>
              </Field>
              <Field label="Lokasi Proyek" icon={MapPin}>
                <Input value={vars.LOKASI_PROYEK} onChange={e => set("LOKASI_PROYEK", e.target.value)} />
              </Field>
              <Field label="Luas Lahan">
                <Input value={vars.LUAS_LAHAN} onChange={e => set("LUAS_LAHAN", e.target.value)} placeholder="contoh: 8 x 24 m / 192 m²" />
              </Field>
              <Field label="Program Ruang" className="md:col-span-2">
                <Textarea
                  value={vars.PROGRAM_RUANG}
                  onChange={e => set("PROGRAM_RUANG", e.target.value)}
                  rows={4}
                  className="text-sm"
                />
              </Field>
            </div>
          </PremiumCard>

          {/* Biaya + termin */}
          <PremiumCard>
            <TechLabel ref="§4" label="Biaya & Termin Pembayaran" className="mb-4" />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Total Fee (Rp)" icon={Wallet}>
                <Input
                  type="number"
                  value={vars.TOTAL_FEE}
                  onChange={e => set("TOTAL_FEE", Number(e.target.value) || 0)}
                  className="font-mono"
                />
              </Field>
              <Field label="Durasi Pengerjaan (bulan)" icon={Calendar}>
                <Input
                  type="number"
                  value={vars.DURASI_BULAN}
                  onChange={e => set("DURASI_BULAN", Number(e.target.value) || 0)}
                />
              </Field>
              <div className="md:col-span-2 flex items-center gap-3 rounded-lg border border-border bg-background/40 p-3">
                <Checkbox
                  id="rab"
                  checked={vars.INCLUDE_RAB}
                  onCheckedChange={v => set("INCLUDE_RAB", Boolean(v))}
                />
                <label htmlFor="rab" className="text-sm cursor-pointer">
                  Termasuk <b>RAB</b> (Rencana Anggaran Biaya) di Tahap 4 — Detail Drawing
                </label>
              </div>
            </div>

            <RuleLine label="Termin pembayaran 50 / 40 / 10" className="my-5" />

            <div className="space-y-2">
              {termins.map(t => (
                <div key={t.kode} className="grid grid-cols-[60px_1fr_80px_140px] items-center gap-3 rounded-md border border-border bg-background/30 p-3">
                  <span className="font-mono text-xs text-accent font-bold">{t.kode}</span>
                  <div className="text-sm">
                    <div className="font-medium text-foreground">{t.label}</div>
                    <div className="text-xs text-muted-foreground">{t.trigger}</div>
                  </div>
                  <Pill tone="info">{t.pct}%</Pill>
                  <div className="text-right font-mono text-sm font-bold text-foreground">{fmtIDR(t.nominal)}</div>
                </div>
              ))}
              <div className="grid grid-cols-[60px_1fr_80px_140px] items-center gap-3 rounded-md border border-accent/40 bg-accent/5 p-3">
                <span className="font-mono text-xs text-accent font-bold">Σ</span>
                <div className="text-sm font-bold text-foreground">GRAND TOTAL</div>
                <Pill tone={totalPct === 100 ? "success" : "danger"}>{totalPct}%</Pill>
                <div className="text-right font-mono text-sm font-extrabold text-foreground">{fmtIDR(vars.TOTAL_FEE)}</div>
              </div>
              <p className="text-xs text-muted-foreground italic mt-2">
                Terbilang: <span className="text-foreground not-italic">{terbilangText}</span>
              </p>
            </div>
          </PremiumCard>

          {/* Tahapan */}
          <PremiumCard>
            <TechLabel ref="§5" label="5 Tahap Pekerjaan (Pasal 1.5)" className="mb-4" />
            <div className="grid gap-2 md:grid-cols-2">
              {SPK_TAHAPAN.map(t => (
                <div key={t.no} className="rounded-md border border-border bg-background/30 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] text-accent">T{t.no}</span>
                    <span className="font-semibold text-sm text-foreground">{t.nama}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t.deskripsi}</p>
                </div>
              ))}
            </div>
            <RuleLine label="Tidak termasuk pekerjaan PIHAK KEDUA" className="my-4" />
            <div className="flex flex-wrap gap-2">
              {SPK_EXCLUSIONS.map(x => (
                <Pill key={x} tone="muted">{x}</Pill>
              ))}
            </div>
          </PremiumCard>

          {/* Guardrails */}
          <PremiumCard>
            <TechLabel ref="§G" label="Guardrails — DO & DON'T" className="mb-4" />
            <div className="grid gap-2 md:grid-cols-2">
              {SPK_GUARDRAILS.map((g, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-start gap-2 rounded-md border p-3 text-xs",
                    g.tone === "ok"
                      ? "border-success/30 bg-success/5"
                      : "border-destructive/30 bg-destructive/5",
                  )}
                >
                  {g.tone === "ok"
                    ? <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
                    : <AlertTriangle className="size-4 text-destructive shrink-0 mt-0.5" />}
                  <div>
                    <div className="font-mono text-[10px] font-bold opacity-70">{g.code}</div>
                    <div className="text-foreground">{g.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </PremiumCard>

          {/* QA Checklist */}
          <PremiumCard>
            <TechLabel ref="§QA" label="Checklist Pra-Kirim" className="mb-4" />
            <ul className="space-y-2">
              {SPK_QA_CHECKLIST.map((q, i) => (
                <li key={i} className="flex items-start gap-2 text-xs">
                  <Checkbox id={`qa-${i}`} className="mt-0.5" />
                  <label htmlFor={`qa-${i}`} className="cursor-pointer text-foreground leading-relaxed">{q}</label>
                </li>
              ))}
            </ul>
          </PremiumCard>
        </div>

        {/* RIGHT — sticky preview */}
        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <PremiumCard padded={false} className="overflow-hidden">
            {/* Cover */}
            <div className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="font-mono text-[10px] tracking-wider opacity-80">SUDUT RUANG ARSITEK</div>
                <Pill tone="info" className="bg-white/15 text-primary-foreground border-white/20">SPK · v2.0</Pill>
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] opacity-70 mb-1">Surat Perjanjian Kerja</div>
              <div className="font-mono text-xs mb-3 opacity-90">{vars.NO_SPK || "—"}</div>
              <div className="font-display text-xl font-extrabold leading-tight">{vars.NAMA_PROYEK}</div>
              <div className="text-xs mt-1 opacity-80">{vars.JENIS_PEKERJAAN} · {vars.LOKASI_PROYEK}</div>
            </div>

            {/* Mini body */}
            <div className="p-5 space-y-4 text-xs">
              <Row label="Pihak Pertama" value={vars.NAMA_KLIEN} />
              <Row label="Pihak Kedua" value={`${PRINCIPAL.nama} · ${PRINCIPAL.studio}`} />
              <Row label="Tanggal" value={`${vars.HARI}, ${vars.TANGGAL} ${vars.BULAN} ${vars.TAHUN}`} />
              <Row label="Kategori" value={vars.KATEGORI} />
              <Row label="Luas Lahan" value={vars.LUAS_LAHAN} />
              <Row label="Durasi" value={`${vars.DURASI_BULAN} bulan`} />
              <RuleLine />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground uppercase tracking-wider text-[10px]">Grand Total</span>
                <span className="font-mono text-base font-extrabold text-foreground">{fmtIDR(vars.TOTAL_FEE)}</span>
              </div>
              <div className="space-y-1">
                {termins.map(t => (
                  <div key={t.kode} className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">{t.kode} · {t.pct}%</span>
                    <span className="font-mono text-foreground">{fmtIDR(t.nominal)}</span>
                  </div>
                ))}
              </div>
              <RuleLine />
              <div className="rounded-md border border-border bg-background/40 p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Pembayaran via</div>
                <div className="font-semibold text-foreground">{PRINCIPAL.bank.nama}</div>
                <div className="font-mono text-xs">{PRINCIPAL.bank.rekening}</div>
                <div className="text-xs text-muted-foreground">a.n. {PRINCIPAL.bank.an}</div>
              </div>
            </div>
          </PremiumCard>

          <PremiumCard padded>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className={cn("size-4", allGood ? "text-success" : "text-warning")} />
              <span className="text-xs font-semibold uppercase tracking-wider">
                {allGood ? "Siap dikirim" : "Belum lengkap"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Pastikan checklist QA dicentang sebelum men-generate PDF & mengirim ke klien.
            </p>
            <Button className="w-full gap-2" disabled={!allGood}>
              <FileSignature className="size-4" /> Generate & Kirim
            </Button>
          </PremiumCard>
        </div>
      </div>
    </AppLayout>
  );
}

// ── Tiny helpers ──────────────────────────────────────────────────────
function Field({
  label,
  icon: Icon,
  children,
  className,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
        {Icon && <Icon className="size-3.5" />}
        {label}
      </Label>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground uppercase tracking-wider text-[10px] shrink-0">{label}</span>
      <span className="text-foreground text-right">{value}</span>
    </div>
  );
}
