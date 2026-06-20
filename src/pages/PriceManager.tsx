import { useEffect, useState } from 'react'
import { T, Panel, Btn, Icon } from '../components/AcosUI'
import {
  PricingAdmin, ConstructionAdmin, PlanningRate, BuildRate, ConstructionRate, loadPricing, formatIDRShort,
} from '../services/pricingService'

type Tab = 'plan' | 'db' | 'rab'
type PlanRow = PlanningRate & { sort_order?: number; is_active?: boolean }
type BuildRow = BuildRate & { sort_order?: number; is_active?: boolean }
type RabRow = ConstructionRate & { sort_order?: number; is_active?: boolean }

const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 11px', background: T.inset, border: `1px solid ${T.line}`, borderRadius: 8, color: T.txt, fontSize: 13, fontFamily: T.font, outline: 'none' }
const labelStyle: React.CSSProperties = { fontSize: 10.5, fontWeight: 700, color: T.dim, textTransform: 'uppercase', letterSpacing: 0.4, display: 'block', marginBottom: 5 }
const iconBtn: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 7, background: 'transparent', border: `1px solid ${T.line}`, cursor: 'pointer' }

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <div style={{ gridColumn: full ? '1 / -1' : undefined }}><span style={labelStyle}>{label}</span>{children}</div>
}

const emptyPlan = (): Partial<PlanRow> => ({ category: 'Arsitektur', tier: 'Standar', listPerM2: 0, floorPerM2: 0, scope: '', sort_order: 0, is_active: true })
const emptyBuild = (): Partial<BuildRow> => ({ grup: 'Bangunan', category: '', tier: 'Standar', priceMin: 0, priceMax: 0, unit: 'm2', notes: '', sort_order: 0, is_active: true })
const emptyRab = (): Partial<RabRow> => ({ type: '', tier: 'Standar', priceMin: 0, priceMax: 0, specification: '', notes: '', sort_order: 0, is_active: true })

const PriceManager = () => {
  const [tab, setTab] = useState<Tab>('plan')
  const [plan, setPlan] = useState<PlanRow[]>([])
  const [build, setBuild] = useState<BuildRow[]>([])
  const [rab, setRab] = useState<RabRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editP, setEditP] = useState<Partial<PlanRow> | null>(null)
  const [editB, setEditB] = useState<Partial<BuildRow> | null>(null)
  const [editR, setEditR] = useState<Partial<RabRow> | null>(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const [p, b, r] = await Promise.all([PricingAdmin.getPlanning(), PricingAdmin.getBuild(), ConstructionAdmin.getAll()])
    setPlan(p); setBuild(b); setRab(r); setLoading(false)
  }
  useEffect(() => { load() }, [])

  const afterSave = async () => { await loadPricing(true); await load() }

  const savePlan = async () => {
    if (!editP || !editP.category?.trim() || !editP.tier?.trim()) return
    setSaving(true); await PricingAdmin.savePlanning(editP); setSaving(false); setEditP(null); afterSave()
  }
  const saveBuild = async () => {
    if (!editB || !editB.category?.trim() || !editB.tier?.trim()) return
    setSaving(true); await PricingAdmin.saveBuild(editB); setSaving(false); setEditB(null); afterSave()
  }
  const saveRab = async () => {
    if (!editR || !editR.type?.trim() || !editR.tier?.trim()) return
    setSaving(true); await ConstructionAdmin.save(editR); setSaving(false); setEditR(null); afterSave()
  }
  const delPlan = async (id: string) => { if (confirm('Hapus tarif perencanaan ini?')) { await PricingAdmin.deletePlanning(id); afterSave() } }
  const delBuild = async (id: string) => { if (confirm('Hapus tarif D&B ini?')) { await PricingAdmin.deleteBuild(id); afterSave() } }
  const delRab = async (id: string) => { if (confirm('Hapus tarif RAB ini?')) { await ConstructionAdmin.remove(id); afterSave() } }

  return (
    <div style={{ padding: 22, height: '100%', overflowY: 'auto', background: T.bgGrad }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: T.txt, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}><Icon name="Tag" size={22} color={T.sky} /> Kelola Harga</h1>
          <div style={{ fontSize: 13, color: T.dim, marginTop: 4 }}>Atur tarif Jasa Perencanaan & Design & Build. Perubahan langsung dipakai AI Estimator.</div>
        </div>
        <div style={{ display: 'flex', gap: 9, alignItems: 'center' }}>
          <div style={{ display: 'flex', background: T.inset, borderRadius: 9, padding: 3, border: `1px solid ${T.line}` }}>
            {([['plan', 'Jasa Perencanaan'], ['db', 'Design & Build'], ['rab', 'RAB Konstruksi']] as const).map(([v, lbl]) => (
              <button key={v} onClick={() => setTab(v)} style={{ padding: '6px 14px', borderRadius: 7, border: 'none', background: tab === v ? T.sky : 'transparent', color: tab === v ? '#03203a' : T.dim, cursor: 'pointer', fontSize: 11.5, fontWeight: 700, fontFamily: T.font }}>{lbl}</button>
            ))}
          </div>
          <Btn v="primary" size="sm" icon="Plus" onClick={() => tab === 'plan' ? setEditP(emptyPlan()) : tab === 'db' ? setEditB(emptyBuild()) : setEditR(emptyRab())}>Tambah</Btn>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: T.dim }}>Memuat...</div>
      ) : tab === 'plan' ? (
        <Panel>
          <div className="custom-scrollbar" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
              <thead><tr style={{ borderBottom: `1px solid ${T.line}` }}>
                {['Kategori', 'Tier', 'List/m²', 'Floor/m²', 'Lingkup', ''].map((h) => (
                  <th key={h} style={{ textAlign: h.includes('/m²') ? 'right' : 'left', padding: '11px 14px', fontSize: 9.5, color: T.dim, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {plan.length === 0 ? <tr><td colSpan={6} style={{ padding: 30, textAlign: 'center', color: T.dim, fontSize: 12 }}>Belum ada data. Klik Tambah.</td></tr>
                : plan.map((r) => (
                  <tr key={r.id} style={{ borderBottom: `1px solid ${T.line}`, opacity: r.is_active === false ? 0.5 : 1 }}>
                    <td style={{ padding: '10px 14px', fontSize: 12.5, fontWeight: 700, color: T.txt, whiteSpace: 'nowrap' }}>{r.category}</td>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: T.sub, whiteSpace: 'nowrap' }}>{r.tier}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: T.mono, fontSize: 12, color: T.tint, whiteSpace: 'nowrap' }}>{formatIDRShort(r.listPerM2)}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: T.mono, fontSize: 12, color: T.dim, whiteSpace: 'nowrap' }}>{formatIDRShort(r.floorPerM2)}</td>
                    <td style={{ padding: '10px 14px', fontSize: 11, color: T.dim, maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.scope}</td>
                    <td style={{ padding: '10px 14px' }}><div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button onClick={() => setEditP(r)} title="Edit" style={iconBtn}><Icon name="Pencil" size={13} color={T.sky} /></button>
                      <button onClick={() => delPlan(r.id)} title="Hapus" style={iconBtn}><Icon name="Trash2" size={13} color={T.red} /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : tab === 'db' ? (
        <Panel>
          <div className="custom-scrollbar" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
              <thead><tr style={{ borderBottom: `1px solid ${T.line}` }}>
                {['Grup', 'Kategori', 'Tier', 'Min', 'Max', 'Satuan', 'Catatan', ''].map((h) => (
                  <th key={h} style={{ textAlign: h === 'Min' || h === 'Max' ? 'right' : 'left', padding: '11px 14px', fontSize: 9.5, color: T.dim, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {build.length === 0 ? <tr><td colSpan={8} style={{ padding: 30, textAlign: 'center', color: T.dim, fontSize: 12 }}>Belum ada data. Klik Tambah.</td></tr>
                : build.map((r) => (
                  <tr key={r.id} style={{ borderBottom: `1px solid ${T.line}`, opacity: r.is_active === false ? 0.5 : 1 }}>
                    <td style={{ padding: '10px 14px', fontSize: 11, color: T.dim, whiteSpace: 'nowrap' }}>{r.grup}</td>
                    <td style={{ padding: '10px 14px', fontSize: 12.5, fontWeight: 700, color: T.txt, whiteSpace: 'nowrap' }}>{r.category}</td>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: T.sub, whiteSpace: 'nowrap' }}>{r.tier}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: T.mono, fontSize: 12, color: T.tint, whiteSpace: 'nowrap' }}>{formatIDRShort(r.priceMin)}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: T.mono, fontSize: 12, color: T.tint, whiteSpace: 'nowrap' }}>{formatIDRShort(r.priceMax)}</td>
                    <td style={{ padding: '10px 14px', fontSize: 11, color: T.sub, whiteSpace: 'nowrap' }}>{r.unit}</td>
                    <td style={{ padding: '10px 14px', fontSize: 11, color: T.dim, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.notes}</td>
                    <td style={{ padding: '10px 14px' }}><div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button onClick={() => setEditB(r)} title="Edit" style={iconBtn}><Icon name="Pencil" size={13} color={T.sky} /></button>
                      <button onClick={() => delBuild(r.id)} title="Hapus" style={iconBtn}><Icon name="Trash2" size={13} color={T.red} /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : (
        <Panel>
          <div className="custom-scrollbar" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
              <thead><tr style={{ borderBottom: `1px solid ${T.line}` }}>
                {['Tipe Bangunan', 'Kelas', 'Min/m²', 'Max/m²', 'Spesifikasi', 'Ket.', ''].map((h) => (
                  <th key={h} style={{ textAlign: h.includes('/m²') ? 'right' : 'left', padding: '11px 14px', fontSize: 9.5, color: T.dim, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {rab.length === 0 ? <tr><td colSpan={7} style={{ padding: 30, textAlign: 'center', color: T.dim, fontSize: 12 }}>Belum ada data. Klik Tambah.</td></tr>
                : rab.map((r) => (
                  <tr key={r.id} style={{ borderBottom: `1px solid ${T.line}`, opacity: r.is_active === false ? 0.5 : 1 }}>
                    <td style={{ padding: '10px 14px', fontSize: 12.5, fontWeight: 700, color: T.txt, whiteSpace: 'nowrap' }}>{r.type}</td>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: T.sub, whiteSpace: 'nowrap' }}>{r.tier}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: T.mono, fontSize: 12, color: T.tint, whiteSpace: 'nowrap' }}>{formatIDRShort(r.priceMin)}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: T.mono, fontSize: 12, color: T.tint, whiteSpace: 'nowrap' }}>{formatIDRShort(r.priceMax)}</td>
                    <td style={{ padding: '10px 14px', fontSize: 11, color: T.dim, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.specification}</td>
                    <td style={{ padding: '10px 14px', fontSize: 11, color: T.dim, whiteSpace: 'nowrap' }}>{r.notes}</td>
                    <td style={{ padding: '10px 14px' }}><div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button onClick={() => setEditR(r)} title="Edit" style={iconBtn}><Icon name="Pencil" size={13} color={T.sky} /></button>
                      <button onClick={() => delRab(r.id)} title="Hapus" style={iconBtn}><Icon name="Trash2" size={13} color={T.red} /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* Modal Perencanaan */}
      {editP && (
        <ModalShell title={editP.id ? 'Edit Tarif Perencanaan' : 'Tambah Tarif Perencanaan'} onClose={() => !saving && setEditP(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Kategori *"><input style={inputStyle} value={editP.category || ''} onChange={(e) => setEditP({ ...editP, category: e.target.value })} placeholder="Arsitektur" /></Field>
            <Field label="Tier *"><input style={inputStyle} value={editP.tier || ''} onChange={(e) => setEditP({ ...editP, tier: e.target.value })} placeholder="Standar" /></Field>
            <Field label="List Harga/m² (Rp)"><input type="number" style={inputStyle} value={editP.listPerM2 ?? 0} onChange={(e) => setEditP({ ...editP, listPerM2: Number(e.target.value) || 0 })} /></Field>
            <Field label="Floor Harga/m² (Rp)"><input type="number" style={inputStyle} value={editP.floorPerM2 ?? 0} onChange={(e) => setEditP({ ...editP, floorPerM2: Number(e.target.value) || 0 })} /></Field>
            <Field label="Lingkup (scope)" full><textarea style={{ ...inputStyle, resize: 'vertical' }} rows={3} value={editP.scope || ''} onChange={(e) => setEditP({ ...editP, scope: e.target.value })} placeholder="Gambar lengkap + 3D + RAB..." /></Field>
            <Field label="Urutan"><input type="number" style={inputStyle} value={editP.sort_order ?? 0} onChange={(e) => setEditP({ ...editP, sort_order: Number(e.target.value) || 0 })} /></Field>
          </div>
          <ModalActions saving={saving} onCancel={() => setEditP(null)} onSave={savePlan} />
        </ModalShell>
      )}

      {/* Modal D&B */}
      {editB && (
        <ModalShell title={editB.id ? 'Edit Tarif Design & Build' : 'Tambah Tarif Design & Build'} onClose={() => !saving && setEditB(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Grup *"><input style={inputStyle} value={editB.grup || ''} onChange={(e) => setEditB({ ...editB, grup: e.target.value })} placeholder="Bangunan / Interior / Komponen / Landscape / Fitur Air / Maintenance" /></Field>
            <Field label="Kategori *"><input style={inputStyle} value={editB.category || ''} onChange={(e) => setEditB({ ...editB, category: e.target.value })} placeholder="D&B Arsitektur" /></Field>
            <Field label="Tier *"><input style={inputStyle} value={editB.tier || ''} onChange={(e) => setEditB({ ...editB, tier: e.target.value })} placeholder="Standar / Premium / Luxury" /></Field>
            <Field label="Satuan"><input style={inputStyle} value={editB.unit || ''} onChange={(e) => setEditB({ ...editB, unit: e.target.value })} placeholder="m2 / m' / bulan" /></Field>
            <Field label="Harga Min (Rp)"><input type="number" style={inputStyle} value={editB.priceMin ?? 0} onChange={(e) => setEditB({ ...editB, priceMin: Number(e.target.value) || 0 })} /></Field>
            <Field label="Harga Max (Rp)"><input type="number" style={inputStyle} value={editB.priceMax ?? 0} onChange={(e) => setEditB({ ...editB, priceMax: Number(e.target.value) || 0 })} /></Field>
            <Field label="Catatan" full><input style={inputStyle} value={editB.notes || ''} onChange={(e) => setEditB({ ...editB, notes: e.target.value })} placeholder="Rumah keluarga, kost, ruko/kantor" /></Field>
            <Field label="Urutan"><input type="number" style={inputStyle} value={editB.sort_order ?? 0} onChange={(e) => setEditB({ ...editB, sort_order: Number(e.target.value) || 0 })} /></Field>
          </div>
          <ModalActions saving={saving} onCancel={() => setEditB(null)} onSave={saveBuild} />
        </ModalShell>
      )}

      {/* Modal RAB Konstruksi */}
      {editR && (
        <ModalShell title={editR.id ? 'Edit Tarif RAB Konstruksi' : 'Tambah Tarif RAB Konstruksi'} onClose={() => !saving && setEditR(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Tipe Bangunan *"><input style={inputStyle} value={editR.type || ''} onChange={(e) => setEditR({ ...editR, type: e.target.value })} placeholder="Rumah Tinggal" /></Field>
            <Field label="Kelas *"><input style={inputStyle} value={editR.tier || ''} onChange={(e) => setEditR({ ...editR, tier: e.target.value })} placeholder="Standar" /></Field>
            <Field label="Harga Min/m² (Rp)"><input type="number" style={inputStyle} value={editR.priceMin ?? 0} onChange={(e) => setEditR({ ...editR, priceMin: Number(e.target.value) || 0 })} /></Field>
            <Field label="Harga Max/m² (Rp)"><input type="number" style={inputStyle} value={editR.priceMax ?? 0} onChange={(e) => setEditR({ ...editR, priceMax: Number(e.target.value) || 0 })} /></Field>
            <Field label="Spesifikasi" full><input style={inputStyle} value={editR.specification || ''} onChange={(e) => setEditR({ ...editR, specification: e.target.value })} placeholder="Bata ringan, granit, cat premium" /></Field>
            <Field label="Keterangan"><input style={inputStyle} value={editR.notes || ''} onChange={(e) => setEditR({ ...editR, notes: e.target.value })} placeholder="Type 36-70" /></Field>
            <Field label="Urutan"><input type="number" style={inputStyle} value={editR.sort_order ?? 0} onChange={(e) => setEditR({ ...editR, sort_order: Number(e.target.value) || 0 })} /></Field>
          </div>
          <ModalActions saving={saving} onCancel={() => setEditR(null)} onSave={saveRab} />
        </ModalShell>
      )}
    </div>
  )
}

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', background: T.panel, border: `1px solid ${T.line}`, borderRadius: 16, padding: 22, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.txt }}>{title}</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: T.dim, cursor: 'pointer', padding: 4 }}><Icon name="X" size={18} color={T.dim} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

function ModalActions({ saving, onCancel, onSave }: { saving: boolean; onCancel: () => void; onSave: () => void }) {
  return (
    <div style={{ display: 'flex', gap: 9, marginTop: 20 }}>
      <button onClick={onCancel} disabled={saving} style={{ flex: 1, padding: '11px', background: T.inset, color: T.dim, border: `1px solid ${T.line}`, borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Batal</button>
      <button onClick={onSave} disabled={saving} style={{ flex: 1, padding: '11px', background: T.sky, color: '#03203a', border: 'none', borderRadius: 9, fontWeight: 800, fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
    </div>
  )
}

export default PriceManager
