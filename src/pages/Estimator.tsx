import { useEffect, useMemo, useState } from 'react'
import {
  planningRates, buildRates, constructionRates,
  calcPlanning, calcBuild, calcConstruction, maxDiscPlanning,
  BUILD_MAX_DISC, BUILD_MIN_AREA, PLAN_MIN_ORDER,
  loadPricing, formatIDR, formatIDRShort,
} from '../services/pricingService'
import { ClientService, DBClient } from '../services/supabaseClient'
import { SpkPrefill, ProposalPrefill } from '../services/spkData'

interface EstimatorProps {
  onCreateSpk?: (prefill: SpkPrefill) => void
  onCreateProposal?: (prefill: ProposalPrefill) => void
  onSendToChat?: (phone: string, message: string) => void
}

type Mode = 'plan' | 'db' | 'rab'

const uniq = (arr: string[]) => Array.from(new Set(arr))

const Estimator = ({ onCreateSpk, onCreateProposal, onSendToChat }: EstimatorProps) => {
  const [mode, setMode] = useState<Mode>('plan')
  const [rev, setRev] = useState(0)

  // Perencanaan
  const [planCategory, setPlanCategory] = useState('Arsitektur')
  const [planTier, setPlanTier] = useState('Standar')
  // Design & Build
  const [buildCategory, setBuildCategory] = useState('Arsitektur')
  const [buildTier, setBuildTier] = useState('Standar')
  // RAB Konstruksi
  const [rabType, setRabType] = useState('Rumah Tinggal')
  const [rabTier, setRabTier] = useState('Standar')

  const [area, setArea] = useState('100')
  const [disc, setDisc] = useState(0)
  const [ppnOn, setPpnOn] = useState(true)

  // Client
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [projectName, setProjectName] = useState('')
  const [crmClients, setCrmClients] = useState<DBClient[]>([])
  // Combobox CRM (searchable)
  const [crmQuery, setCrmQuery] = useState('')
  const [crmOpen, setCrmOpen] = useState(false)

  useEffect(() => {
    ClientService.getAll().then(setCrmClients)
    loadPricing().then((changed) => { if (changed) setRev((r) => r + 1) })
  }, [])

  // Pastikan kategori/tier D&B valid terhadap data Kelola Harga (reset bila kategori lama hilang).
  useEffect(() => {
    const cats = uniq(buildRates.map((r) => r.category))
    if (cats.length && !cats.includes(buildCategory)) setBuildCategory(cats[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rev])
  useEffect(() => {
    const tiers = buildRates.filter((r) => r.category === buildCategory).map((r) => r.tier)
    if (tiers.length && !tiers.includes(buildTier)) setBuildTier(tiers[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildCategory, rev])

  const pickCrmClient = (id: string) => {
    const c = crmClients.find((x) => x.id === id)
    if (!c) return
    setClientName(c.name || ''); setClientPhone(c.phone || '')
  }

  const crmFiltered = useMemo(() => {
    const q = crmQuery.trim().toLowerCase()
    const list = !q ? crmClients : crmClients.filter((c) =>
      (c.name || '').toLowerCase().includes(q) || (c.phone || '').toLowerCase().includes(q) || String(c.id).includes(q))
    return list.slice(0, 50)
  }, [crmClients, crmQuery])

  // ── Opsi kategori & tier ──
  const planCategories = useMemo(() => uniq(planningRates.map((r) => r.category)), [rev])
  const planTiers = useMemo(() => planningRates.filter((r) => r.category === planCategory).map((r) => r.tier), [planCategory, rev])
  const planRate = useMemo(() => planningRates.find((r) => r.category === planCategory && r.tier === planTier), [planCategory, planTier, rev])

  // Build: kelompokkan kategori per grup
  const buildGroups = useMemo(() => {
    const g: Record<string, string[]> = {}
    buildRates.forEach((r) => { if (!g[r.grup]) g[r.grup] = []; if (!g[r.grup].includes(r.category)) g[r.grup].push(r.category) })
    return g
  }, [rev])
  const buildTiers = useMemo(() => buildRates.filter((r) => r.category === buildCategory).map((r) => r.tier), [buildCategory, rev])
  const buildRate = useMemo(() => buildRates.find((r) => r.category === buildCategory && r.tier === buildTier), [buildCategory, buildTier, rev])

  // RAB
  const rabTypes = useMemo(() => uniq(constructionRates.map((r) => r.type)), [rev])
  const rabTiers = useMemo(() => constructionRates.filter((r) => r.type === rabType).map((r) => r.tier), [rabType, rev])
  const rabRate = useMemo(() => constructionRates.find((r) => r.type === rabType && r.tier === rabTier), [rabType, rabTier, rev])

  // Pastikan tier valid saat kategori/mode/harga berubah
  useEffect(() => { if (planTiers.length && !planTiers.includes(planTier)) setPlanTier(planTiers.includes('Standar') ? 'Standar' : planTiers[0]) }, [planTiers]) // eslint-disable-line
  useEffect(() => { if (buildTiers.length && !buildTiers.includes(buildTier)) setBuildTier(buildTiers.includes('Standar') ? 'Standar' : buildTiers[0]) }, [buildTiers]) // eslint-disable-line
  useEffect(() => { if (rabTiers.length && !rabTiers.includes(rabTier)) setRabTier(rabTiers.includes('Standar') ? 'Standar' : rabTiers[0]) }, [rabTiers]) // eslint-disable-line
  useEffect(() => { setDisc(0) }, [mode, planCategory, planTier, buildCategory, buildTier])

  const qty = parseFloat(area) || 0
  const planCalc = useMemo(() => (planRate ? calcPlanning(planRate, qty, disc, ppnOn) : null), [planRate, qty, disc, ppnOn, rev])
  const buildCalc = useMemo(() => (buildRate ? calcBuild(buildRate, qty, disc, ppnOn) : null), [buildRate, qty, disc, ppnOn, rev])
  const rabCalc = useMemo(() => (rabRate ? calcConstruction(rabRate, qty) : null), [rabRate, qty, rev])

  const maxDisc = mode === 'plan' ? (planRate ? maxDiscPlanning(planRate) : 0) : BUILD_MAX_DISC
  const unitLabel = mode === 'db' ? (buildRate?.unit || 'm2') : 'm²'

  // Nilai untuk handoff ke Proposal/SPK (sebelum PPN)
  const handoffFee = mode === 'plan' ? (planCalc?.subtotal || 0) : mode === 'db' ? (buildCalc?.avg || 0) : (rabCalc?.avg || 0)

  const TierBtns = ({ tiers, active, onPick }: { tiers: string[]; active: string; onPick: (t: string) => void }) => (
    <div className="flex gap-1 p-1 rounded-xl bg-surface-container w-full">
      {uniq(tiers).map((t) => (
        <button key={t} onClick={() => onPick(t)}
          className={`flex-1 px-2 py-2.5 rounded-lg text-body-md font-bold transition-colors whitespace-nowrap ${active === t ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
          {t}
        </button>
      ))}
    </div>
  )

  return (
    <div className="p-sm md:p-gutter max-w-container-max mx-auto space-y-md">
      <div>
        <h1 className="font-serif-display text-display-lg text-on-background">AI Estimator</h1>
        <p className="text-body-md text-on-surface-variant">
          Estimasi biaya: Jasa Perencanaan (fee/m²) atau Design & Build (all-in). Harga resmi per m², negosiasi sampai floor, PPN opsional.
        </p>
      </div>

      {/* Mode */}
      <div className="bg-surface border border-outline-variant rounded-2xl p-md">
        <div className="text-label-caps text-on-surface-variant uppercase mb-2">Jenis Layanan</div>
        <div className="flex gap-1 p-1 rounded-xl bg-surface-container w-full">
          {([['plan', 'Jasa Perencanaan'], ['db', 'Design & Build'], ['rab', 'RAB Konstruksi']] as const).map(([v, lbl]) => (
            <button key={v} onClick={() => setMode(v)}
              className={`flex-1 py-3 px-2 rounded-lg text-body-md font-bold transition-colors whitespace-nowrap ${mode === v ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* Client */}
      <div className="bg-surface border border-outline-variant rounded-2xl p-md">
        {crmClients.length > 0 && (
          <div className="mb-sm">
            <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide block mb-2">Pilih dari CRM (opsional)</label>
            <div style={{ position: 'relative' }}>
              <input
                value={crmQuery}
                onChange={(e) => { setCrmQuery(e.target.value); setCrmOpen(true) }}
                onFocus={() => setCrmOpen(true)}
                onBlur={() => setTimeout(() => setCrmOpen(false), 150)}
                placeholder="Ketik nama / nomor klien untuk cari..."
                className="w-full px-md py-3 bg-surface-container-low border border-outline-variant rounded-lg text-body-md text-on-surface focus:ring-2 focus:ring-brand-accent outline-none"
              />
              {crmOpen && crmFiltered.length > 0 && (
                <div className="custom-scrollbar" style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, maxHeight: 260, overflowY: 'auto', background: '#082a4b', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 10, zIndex: 50, boxShadow: '0 14px 40px rgba(0,0,0,0.45)' }}>
                  {crmFiltered.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); pickCrmClient(c.id); setCrmQuery(c.name || ''); setCrmOpen(false) }}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#e1f0f8', cursor: 'pointer', fontSize: 13 }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(74,179,216,0.14)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span style={{ fontWeight: 700 }}>{c.name || 'Pelanggan'}</span>
                      {c.phone ? <span style={{ opacity: 0.7, fontFamily: 'monospace', marginLeft: 8 }}>{c.phone}</span> : null}
                    </button>
                  ))}
                </div>
              )}
              {crmOpen && crmQuery.trim() && crmFiltered.length === 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, padding: '10px 12px', background: '#082a4b', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 10, zIndex: 50, color: '#8fb0c8', fontSize: 12.5 }}>
                  Tidak ada klien cocok "{crmQuery}".
                </div>
              )}
            </div>
            {clientName && (
              <div className="text-label-caps text-on-surface-variant mt-2">Terpilih: <b className="text-on-surface">{clientName}</b>{clientPhone ? ` · ${clientPhone}` : ''} · <button type="button" onClick={() => { setClientName(''); setClientPhone(''); setCrmQuery('') }} className="text-secondary underline">reset</button></div>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-sm">
          <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide block mb-2">Nama Klien (opsional)</label>
            <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Bpk. Budi" className="w-full px-md py-3 bg-surface-container-low border border-outline-variant rounded-lg text-body-md text-on-surface focus:ring-2 focus:ring-brand-accent outline-none" /></div>
          <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide block mb-2">No. WhatsApp (opsional)</label>
            <input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="6281234567890" className="w-full px-md py-3 bg-surface-container-low border border-outline-variant rounded-lg text-body-md text-on-surface focus:ring-2 focus:ring-brand-accent outline-none" /></div>
          <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide block mb-2">Nama Proyek (opsional)</label>
            <input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Rumah Tropis Surabaya" className="w-full px-md py-3 bg-surface-container-low border border-outline-variant rounded-lg text-body-md text-on-surface focus:ring-2 focus:ring-brand-accent outline-none" /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        {/* INPUT */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md space-y-md">
          <h2 className="font-headline-sm text-headline-sm font-bold">{mode === 'plan' ? 'Jasa Perencanaan' : 'Design & Build'}</h2>

          {/* Kategori */}
          <div>
            <label className="text-label-caps text-on-surface-variant uppercase block mb-2">{mode === 'rab' ? 'Tipe Bangunan' : 'Kategori'}</label>
            {mode === 'plan' ? (
              <select value={planCategory} onChange={(e) => setPlanCategory(e.target.value)}
                className="w-full px-md py-3 bg-surface-container-low border-none rounded-lg text-body-md text-on-surface focus:ring-2 focus:ring-secondary outline-none">
                {planCategories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            ) : mode === 'db' ? (
              <select value={buildCategory} onChange={(e) => setBuildCategory(e.target.value)}
                className="w-full px-md py-3 bg-surface-container-low border-none rounded-lg text-body-md text-on-surface focus:ring-2 focus:ring-secondary outline-none">
                {Object.entries(buildGroups).map(([grup, cats]) => (
                  <optgroup key={grup} label={grup}>
                    {cats.map((c) => <option key={c} value={c}>{c}</option>)}
                  </optgroup>
                ))}
              </select>
            ) : (
              <select value={rabType} onChange={(e) => setRabType(e.target.value)}
                className="w-full px-md py-3 bg-surface-container-low border-none rounded-lg text-body-md text-on-surface focus:ring-2 focus:ring-secondary outline-none">
                {rabTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            )}
          </div>

          {/* Tier */}
          <div>
            <label className="text-label-caps text-on-surface-variant uppercase block mb-2">{mode === 'rab' ? 'Kelas' : 'Tier / Kelas'}</label>
            {mode === 'plan'
              ? <TierBtns tiers={planTiers} active={planTier} onPick={setPlanTier} />
              : mode === 'db'
                ? <TierBtns tiers={buildTiers} active={buildTier} onPick={setBuildTier} />
                : <TierBtns tiers={rabTiers} active={rabTier} onPick={setRabTier} />}
          </div>

          {/* Volume */}
          <div>
            <label className="text-label-caps text-on-surface-variant uppercase block mb-2">
              Volume ({unitLabel === 'm2' ? 'm²' : unitLabel === 'bulan' ? 'bulan' : unitLabel})
            </label>
            <div className="relative">
              <input type="number" value={area} onChange={(e) => setArea(e.target.value)}
                className="w-full px-md py-3 pr-12 bg-surface-container-low border-none rounded-lg text-body-md text-on-surface focus:ring-2 focus:ring-secondary outline-none" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">{unitLabel === 'm2' ? 'm²' : unitLabel}</span>
            </div>
            {mode === 'db' && (buildRate?.unit === 'm2') && qty > 0 && qty < BUILD_MIN_AREA && (
              <p className="text-label-caps mt-2" style={{ color: '#d97706' }}>⚠ Disarankan ≥ {BUILD_MIN_AREA} m² agar mobilisasi & manajemen proyek D&B tetap layak.</p>
            )}
          </div>

          {/* Negosiasi (tidak untuk RAB — biaya borongan referensi) */}
          {mode !== 'rab' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-label-caps text-on-surface-variant uppercase">Negosiasi — Diskon</label>
              <span className="font-bold text-secondary">{disc}%</span>
            </div>
            <input type="range" min={0} max={maxDisc} step={1} value={Math.min(disc, maxDisc)} onChange={(e) => setDisc(Number(e.target.value))} className="w-full" />
            <div className="flex justify-between text-label-caps text-on-surface-variant mt-1">
              <span>0%</span>
              <span>maks {maxDisc}%{mode === 'plan' ? ' (sampai floor)' : ''}</span>
            </div>
          </div>
          )}

          {/* PPN (tidak untuk RAB) */}
          {mode !== 'rab' && (
          <div>
            <label className="text-label-caps text-on-surface-variant uppercase block mb-2">PPN</label>
            <div className="flex gap-1 p-1 rounded-xl bg-surface-container w-full">
              {([['Kena PPN 11%', true], ['Tanpa PPN', false]] as const).map(([lbl, v]) => (
                <button key={String(v)} onClick={() => setPpnOn(v)}
                  className={`flex-1 py-2.5 px-2 rounded-lg text-body-md font-bold transition-colors ${ppnOn === v ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>
          )}
        </div>

        {/* HASIL */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md">
          {mode === 'plan' && planCalc && planRate ? (
            <div className="bg-secondary-container rounded-lg p-md text-on-secondary-container">
              <div className="text-label-caps uppercase opacity-80 mb-1">Estimasi Fee Perencanaan</div>
              <div className="text-[13px] opacity-80 mb-sm">{planRate.category} · {planRate.tier} · {formatIDR(planCalc.listPerM2)}/m²</div>
              <div className="font-display-lg text-[30px] font-bold mb-sm">{formatIDR(planCalc.total)}</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="opacity-80">{qty || 0} m² × {formatIDRShort(planCalc.unitAfterDisc)}/m²{disc > 0 ? ` (disc ${disc}%)` : ''}</span><span className="font-mono-label">{formatIDR(planCalc.raw)}</span></div>
                {planCalc.minOrderApplied && <div className="flex justify-between" style={{ color: '#b45309' }}><span>Minimum order {formatIDRShort(PLAN_MIN_ORDER)}</span><span className="font-mono-label">{formatIDR(planCalc.subtotal)}</span></div>}
                <div className="flex justify-between"><span className="opacity-80">PPN {ppnOn ? '11%' : '0%'}</span><span className="font-mono-label">{formatIDR(planCalc.ppn)}</span></div>
                <div className="flex justify-between font-bold pt-1 border-t border-white/20"><span>TOTAL</span><span className="font-mono-label">{formatIDR(planCalc.total)}</span></div>
              </div>
              <div className="text-label-caps opacity-80 mt-sm pt-sm border-t border-white/20">Floor negosiasi: {formatIDR(planCalc.floorPerM2)}/m²</div>
              {planRate.scope && <div className="text-[12px] opacity-90 mt-2 leading-relaxed">📋 {planRate.scope}</div>}
            </div>
          ) : mode === 'db' && buildCalc && buildRate ? (
            <div className="bg-secondary-container rounded-lg p-md text-on-secondary-container">
              <div className="text-label-caps uppercase opacity-80 mb-1">Estimasi Design & Build</div>
              <div className="text-[13px] opacity-80 mb-sm">{buildRate.category} · {buildRate.tier} · {formatIDRShort(buildCalc.perMin)}–{formatIDRShort(buildCalc.perMax)}/{buildRate.unit}</div>
              <div className="grid grid-cols-3 gap-2 mb-sm">
                <div><div className="text-label-caps opacity-70">Min</div><div className="font-mono-label font-bold">{formatIDRShort(buildCalc.min)}</div></div>
                <div className="text-center"><div className="text-label-caps font-bold">Rata-rata</div><div className="font-display-lg text-[24px] font-bold">{formatIDRShort(buildCalc.avg)}</div></div>
                <div className="text-right"><div className="text-label-caps opacity-70">Max</div><div className="font-mono-label font-bold">{formatIDRShort(buildCalc.max)}</div></div>
              </div>
              <div className="space-y-1 text-sm pt-sm border-t border-white/20">
                <div className="flex justify-between"><span className="opacity-80">{qty || 0} {buildRate.unit} {disc > 0 ? `(disc ${disc}%)` : ''}</span><span className="font-mono-label">{formatIDR(buildCalc.min)}–{formatIDR(buildCalc.max)}</span></div>
                <div className="flex justify-between"><span className="opacity-80">PPN {ppnOn ? '11%' : '0%'} (atas rata-rata)</span><span className="font-mono-label">{formatIDR(buildCalc.ppn)}</span></div>
                <div className="flex justify-between font-bold pt-1 border-t border-white/20"><span>TOTAL (rata-rata)</span><span className="font-mono-label">{formatIDR(buildCalc.totalAvg)}</span></div>
                <div className="flex justify-between opacity-80"><span>Rentang total</span><span className="font-mono-label">{formatIDRShort(buildCalc.totalMin)}–{formatIDRShort(buildCalc.totalMax)}</span></div>
              </div>
              {buildRate.notes && <div className="text-[12px] opacity-90 mt-2 leading-relaxed">📋 {buildRate.notes}</div>}
            </div>
          ) : mode === 'rab' && rabCalc && rabRate ? (
            <div className="bg-secondary-container rounded-lg p-md text-on-secondary-container">
              <div className="text-label-caps uppercase opacity-80 mb-1">Estimasi RAB Konstruksi</div>
              <div className="text-[13px] opacity-80 mb-sm">{rabRate.type} · {rabRate.tier} · {formatIDRShort(rabCalc.perMin)}–{formatIDRShort(rabCalc.perMax)}/m²</div>
              <div className="grid grid-cols-3 gap-2 mb-sm">
                <div><div className="text-label-caps opacity-70">Min</div><div className="font-mono-label font-bold">{formatIDRShort(rabCalc.min)}</div></div>
                <div className="text-center"><div className="text-label-caps font-bold">Rata-rata</div><div className="font-display-lg text-[24px] font-bold">{formatIDRShort(rabCalc.avg)}</div></div>
                <div className="text-right"><div className="text-label-caps opacity-70">Max</div><div className="font-mono-label font-bold">{formatIDRShort(rabCalc.max)}</div></div>
              </div>
              <div className="text-sm pt-sm border-t border-white/20 flex justify-between"><span className="opacity-80">{qty || 0} m² × {formatIDRShort(rabCalc.perMin)}–{formatIDRShort(rabCalc.perMax)}/m²</span><span className="font-mono-label">{formatIDR(rabCalc.min)}–{formatIDR(rabCalc.max)}</span></div>
              {rabRate.specification && <div className="text-[12px] opacity-90 mt-2 leading-relaxed">📋 {rabRate.specification}{rabRate.notes ? ` · ${rabRate.notes}` : ''}</div>}
              <div className="text-[11px] opacity-75 mt-2">⚠ Biaya borongan all-in pasar (referensi), bukan harga jual D&B.</div>
            </div>
          ) : (
            <div className="text-on-surface-variant text-body-md p-md text-center">Pilih kategori & tier untuk lihat estimasi.</div>
          )}
        </div>
      </div>

      {/* Simpan ke CRM (tanpa navigasi) */}
      {handoffFee > 0 && (clientPhone || clientName) && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md">
          <button
            onClick={async () => {
              await ClientService.advanceStage(clientPhone, clientName, 'estimasi', {
                building_type: mode === 'plan' ? planCategory : mode === 'db' ? buildCategory : rabType,
                area_sqm: qty || null,
                rab_avg: handoffFee || null,
                metadata: {
                  projectName: projectName || null,
                  mode,
                  category: mode === 'plan' ? planCategory : mode === 'db' ? buildCategory : rabType,
                  tier: mode === 'plan' ? planTier : mode === 'db' ? buildTier : rabTier,
                  area: qty || null,
                  fee: handoffFee || null,
                },
              })
              alert('Tersimpan ke CRM (kolom Estimasi)')
            }}
            className="flex items-center justify-center gap-sm w-full py-3 bg-surface-container text-on-surface rounded-lg font-bold hover:bg-surface-container-high active:scale-95 transition-all border border-outline-variant"
          >
            <span className="material-symbols-outlined">person_add</span> Simpan ke CRM
          </button>
          <p className="text-[11px] text-on-surface-variant mt-2 text-center">Simpan klien ke Kanban CRM (kolom Estimasi) tanpa buat dokumen.</p>
        </div>
      )}

      {/* Kirim ke Client via Chat */}
      {handoffFee > 0 && onSendToChat && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md">
          <button
            disabled={!clientPhone}
            onClick={() => {
              const phone = (clientPhone || '').replace(/\D/g, '')
              const convId = phone.startsWith('62') ? phone : `62${phone}`
              const catLabel = mode === 'plan' ? planCategory : mode === 'db' ? buildCategory : rabType
              const tierLabel = mode === 'plan' ? planTier : mode === 'db' ? buildTier : rabTier
              const layanan = mode === 'plan' ? `Jasa Perencanaan — ${catLabel} (${tierLabel})` : mode === 'db' ? `Design & Build — ${catLabel} (${tierLabel})` : `RAB Konstruksi — ${catLabel} (${tierLabel})`
              const scope = mode === 'plan' && planRate ? planRate.scope : mode === 'db' && buildRate ? buildRate.notes : rabRate ? rabRate.specification : ''
              const unitLbl = unitLabel === 'm2' ? 'm²' : unitLabel
              const hargaPerUnit = mode === 'plan' && planCalc ? `${formatIDR(planCalc.unitAfterDisc)}/${unitLbl}` : mode === 'db' && buildRate ? `${formatIDRShort(buildCalc!.perMin)} – ${formatIDRShort(buildCalc!.perMax)}/${buildRate.unit}` : rabRate ? `${formatIDRShort(rabCalc!.perMin)} – ${formatIDRShort(rabCalc!.perMax)}/m²` : ''
              const subtotalStr = mode === 'plan' ? formatIDR(planCalc?.subtotal || 0) : mode === 'db' ? `${formatIDR(buildCalc?.min || 0)} – ${formatIDR(buildCalc?.max || 0)}` : `${formatIDR(rabCalc?.min || 0)} – ${formatIDR(rabCalc?.max || 0)}`
              const ppnStr = mode !== 'rab' && ppnOn ? `PPN 11%: ${mode === 'plan' ? formatIDR(planCalc?.ppn || 0) : formatIDR(buildCalc?.ppn || 0)}` : ''
              const totalStr = mode === 'plan' ? formatIDR(planCalc?.total || 0) : mode === 'db' ? `${formatIDRShort(buildCalc?.totalMin || 0)} – ${formatIDRShort(buildCalc?.totalMax || 0)}` : `${formatIDRShort(rabCalc?.min || 0)} – ${formatIDRShort(rabCalc?.max || 0)}`

              const msg = [
                `*ESTIMASI BIAYA — SUDUT RUANG ARSITEK*`,
                ``,
                `Halo ${clientName || 'Kak'},`,
                `Berikut estimasi untuk proyek Anda:`,
                ``,
                `*Proyek:* ${projectName || '-'}`,
                `*Layanan:* ${layanan}`,
                scope ? `*Lingkup Pekerjaan:* ${scope}` : '',
                `*Luas:* ${qty || '-'} ${unitLbl}`,
                `*Harga:* ${hargaPerUnit}`,
                ``,
                `Subtotal jasa: ${subtotalStr}`,
                ppnStr,
                `*TOTAL TAGIHAN: ${totalStr}*`,
                ``,
                `Estimasi bersifat sementara; angka final dikunci di RAB/BOQ & SPK.`,
                `— Sudut Ruang Arsitek · sudutruang.com`,
              ].filter(Boolean).join('\n')

              onSendToChat(convId, msg)
            }}
            className={`flex items-center justify-center gap-sm w-full py-3 rounded-lg font-bold active:scale-95 transition-all border border-outline-variant ${clientPhone ? 'bg-surface-container text-on-surface hover:bg-surface-container-high cursor-pointer' : 'bg-surface-container text-on-surface-variant opacity-50 cursor-not-allowed'}`}
          >
            <span className="material-symbols-outlined">send</span> Kirim Estimasi ke Client (WhatsApp)
          </button>
          {!clientPhone && <p className="text-[11px] text-on-surface-variant mt-2 text-center">⬆ Isi nomor WhatsApp klien di atas untuk menggunakan fitur ini.</p>}
        </div>
      )}

      {/* Lanjut */}
      {handoffFee > 0 && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md">
          <div className="flex items-center justify-between mb-md">
            <div>
              <h3 className="font-headline-sm text-headline-sm font-bold">Lanjutkan</h3>
              <p className="text-label-caps text-on-surface-variant">Estimasi siap — buat dokumen dengan data ini.</p>
            </div>
            <span className="px-2 py-1 bg-tertiary-fixed text-on-tertiary-fixed rounded-full text-label-caps font-bold uppercase">Estimasi</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
            {onCreateProposal && (
              <button onClick={async () => {
                // Naikkan tahap lead ke "estimasi" (kalau belum lebih tinggi)
                if (clientPhone || clientName) await ClientService.advanceStage(clientPhone, clientName, 'estimasi', {
                  building_type: mode === 'plan' ? planCategory : mode === 'db' ? buildCategory : rabType,
                  area_sqm: qty || null,
                  rab_avg: handoffFee || null,
                })
                onCreateProposal({ clientName, clientPhone, projectTitle: projectName, feeAmount: handoffFee, category: mode === 'plan' ? planCategory : mode === 'db' ? buildCategory : rabType, tier: mode === 'plan' ? planTier : mode === 'db' ? buildTier : rabTier, area: qty || undefined, mode })
              }}
                className="flex items-center justify-center gap-sm py-3 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all">
                <span className="material-symbols-outlined">description</span> Buat Proposal
              </button>
            )}
            {onCreateSpk && (
              <button onClick={async () => {
                if (clientPhone || clientName) await ClientService.advanceStage(clientPhone, clientName, 'estimasi', {
                  building_type: mode === 'plan' ? planCategory : mode === 'db' ? buildCategory : rabType,
                  area_sqm: qty || null,
                  rab_avg: handoffFee || null,
                })
                onCreateSpk({ clientName, clientPhone, projectName, totalFee: handoffFee, luas: area ? `${area} ${unitLabel === 'm2' ? 'm²' : unitLabel}` : '' })
              }}
                className="flex items-center justify-center gap-sm py-3 bg-secondary-container text-on-secondary-container rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all">
                <span className="material-symbols-outlined">assignment</span> Lanjut ke SPK
              </button>
            )}
          </div>
          <p className="text-[11px] text-on-surface-variant mt-sm">Estimator hanya untuk perhitungan. Proposal & dokumen final dibuat di halaman Proposal / SPK.</p>
        </div>
      )}
    </div>
  )
}

export default Estimator
