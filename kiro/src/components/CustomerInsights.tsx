import { useEffect, useState } from 'react'
import { T, Icon, Panel, PanelHead, Btn, Tag, Avatar, ProgBar } from './AcosUI'
import { ConversationService, ClientService, AiSummaryService } from '../services/supabaseClient'
import type { ConversationAnalysis } from '../services/n8nWebhookService'

const statusTone = (s?: string): string => {
  switch ((s || '').toLowerCase()) {
    case 'hot': return T.red
    case 'warm': return T.amber
    case 'cold': return T.dim
    case 'closing': return T.green
    default: return T.sky
  }
}

const fmtRp = (num: number) => {
  if (num >= 1_000_000_000) return `Rp ${(num / 1_000_000_000).toFixed(1)}M`
  if (num >= 1_000_000) return `Rp ${Math.round(num / 1_000_000)}jt`
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num)
}

/**
 * "Data Customer & Progress (AI Summary)" — master table + detail panel.
 * Dipakai di Dashboard (Command Center) dan CRM & Leads (tab Data Customer)
 * supaya tampilannya identik.
 */
export default function CustomerInsights({ setPage, panelStyle, onCreateDoc, showLeadActions }: { setPage: (p: any) => void; panelStyle?: React.CSSProperties; onCreateDoc?: (d: { clientName: string; clientPhone: string }) => void; showLeadActions?: boolean }) {
  const [rows, setRows] = useState<(ConversationAnalysis & { _id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [selId, setSelId] = useState<string | null>(null)
  const [leadBusy, setLeadBusy] = useState(false)
  const [leadDone, setLeadDone] = useState<'' | 'kirim' | 'update'>('')
  const [query, setQuery] = useState('')

  // Simpan/Update kontak ini ke tabel CRM (clients). mode 'kirim' = jadikan lead baru,
  // 'update' = perbarui data lead tanpa mengubah status yang sudah ada.
  const saveLead = async (r: ConversationAnalysis & { _id: string }, mode: 'kirim' | 'update') => {
    if (leadBusy) return
    setLeadBusy(true)
    const phone = (r.phone || '').replace(/\D/g, '')
    const base: any = {
      id: phone || r._id,
      name: r.nama || 'Pelanggan',
      phone: phone || null,
      source: (r.channel || 'whatsapp') as string,
      building_type: r.project_type || null,
      area_sqm: r.luas_m2 ? (parseFloat(String(r.luas_m2)) || null) : null,
      rab_avg: r.estimasi_value ? (Number(r.estimasi_value) || null) : null,
      last_contact_at: new Date().toISOString(),
    }
    if (mode === 'kirim') base.status = 'lead' // lead baru
    await ClientService.upsert(base)
    setLeadBusy(false)
    setLeadDone(mode)
    setTimeout(() => setLeadDone(''), 2000)
  }

  const load = () => {
    setLoading(true)
    Promise.all([ConversationService.getAll(), AiSummaryService.getAll()]).then(([convs, table]) => {
      const byKey = new Map<string, ConversationAnalysis & { _id: string }>()
      const put = (row: ConversationAnalysis & { _id: string }) => {
        // dedup berdasarkan conversation_id; kalau sudah ada, lengkapi field kosong
        const ex = byKey.get(row._id)
        if (ex) {
          byKey.set(row._id, { ...row, ...Object.fromEntries(Object.entries(ex).filter(([, v]) => v != null && v !== '')) })
        } else {
          byKey.set(row._id, row)
        }
      }
      // 1) Dari metadata percakapan (aiAnalysis)
      convs.forEach((c) => {
        const a = (c.metadata as Record<string, unknown> | undefined)?.aiAnalysis as ConversationAnalysis | undefined
        if (!a) return
        const meta = (c.metadata || {}) as Record<string, string>
        put({ ...a, _id: c.id, nama: a.nama || c.client_name || '—', channel: a.channel || c.source, phone: a.phone || meta.phoneNumber || c.id })
      })
      // 2) Dari tabel ai_summaries (sumber yang sama dengan Spreadsheet & CRM lain)
      table.forEach((s) => {
        put({
          _id: s.conversation_id,
          tanggal: s.tanggal || undefined,
          nama: s.nama || '—',
          phone: s.phone || s.conversation_id,
          channel: s.channel || undefined,
          project_type: s.project_type || undefined,
          lokasi: s.lokasi || undefined,
          luas_m2: s.luas_m2 || undefined,
          estimasi_value: s.estimasi_value || undefined,
          status: s.status || undefined,
          design_stage: s.design_stage || undefined,
          progress_pct: s.progress_pct || undefined,
          ringkasan: s.ringkasan || undefined,
        })
      })
      const out = Array.from(byKey.values())
      setRows(out)
      setSelId((prev) => prev && out.some((r) => r._id === prev) ? prev : (out[0]?._id ?? null))
      setLoading(false)
    })
  }
  useEffect(() => { load() }, [])

  const sel = rows.find((r) => r._id === selId) || null

  // Skor kualifikasi otomatis dari kelengkapan data nyata (bukan mengarang).
  const qualOf = (r: ConversationAnalysis) => {
    const budget = r.estimasi_value ? 1 : 0
    const authority = r.phone ? 1 : 0
    const need = (r.project_type || r.lokasi) ? 1 : 0
    const timeline = r.design_stage ? 1 : 0
    return { budget, authority, need, timeline, total: budget + authority + need + timeline }
  }
  const scoreOf = (r: ConversationAnalysis) => {
    const p = Number(r.progress_pct)
    if (!isNaN(p) && r.progress_pct !== '' && r.progress_pct !== undefined) return Math.round(p)
    return Math.round((qualOf(r).total / 4) * 100)
  }
  const initials = (n?: string) => (n || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

  const q = query.trim().toLowerCase()
  const filteredRows = !q ? rows : rows.filter((r) =>
    (r.nama || '').toLowerCase().includes(q)
    || (r.phone || '').toLowerCase().includes(q)
    || (r.lokasi || '').toLowerCase().includes(q)
    || (r.project_type || '').toLowerCase().includes(q)
    || (r.status || '').toLowerCase().includes(q)
  )

  return (
    <Panel style={{ marginBottom: 16, ...panelStyle }}>
      <PanelHead title="Data Customer & Progress (AI Summary)" sub="Rangkuman percakapan oleh AI — sinkron dengan Spreadsheet" icon="Sparkles" accent={T.sky}
        right={<Btn v="ghost" size="sm" icon="RefreshCw" onClick={load}>Refresh</Btn>} />

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: T.dim, fontSize: 12 }}>Memuat...</div>
      ) : rows.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: T.dim, fontSize: 12 }}>
          Belum ada rangkuman. Buka Active Chats → pilih percakapan → AI Analyst → Generate Rangkuman.
        </div>
      ) : (
        <div className="ai-crm-grid">
          {/* LEFT — master table */}
          <div style={{ borderRight: `1px solid ${T.line}`, overflowX: 'auto' }}>
            <div style={{ padding: '10px 14px', borderBottom: `1px solid ${T.line}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: T.inset, border: `1px solid ${T.line}`, borderRadius: 9, padding: '7px 11px' }}>
                <Icon name="Search" size={14} color={T.dim} />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama / nomor / lokasi / proyek / status..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: T.txt, fontSize: 12, fontFamily: T.font }} />
                {query && <span onClick={() => setQuery('')} style={{ cursor: 'pointer', color: T.dim, fontSize: 11 }}><Icon name="X" size={14} color={T.dim} /></span>}
              </div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
              <thead style={{ borderBottom: `1px solid ${T.line}` }}>
                <tr>
                  {['Klien', 'Channel', 'Tahap', 'Status', 'Estimasi'].map((h, i) => (
                    <th key={h} style={{ padding: '11px 14px', fontSize: 9.5, fontWeight: 700, color: T.dim, textTransform: 'uppercase', letterSpacing: 0.7, textAlign: i === 4 ? 'right' : 'left', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: T.dim, fontSize: 12 }}>Tidak ada hasil untuk "{query}".</td></tr>
                ) : filteredRows.map((r) => {
                  const isSel = r._id === selId
                  return (
                    <tr key={r._id} onClick={() => setSelId(r._id)} className="ac-row" style={{ borderBottom: `1px solid ${T.line}`, cursor: 'pointer', background: isSel ? 'rgba(74,179,216,0.08)' : 'transparent', borderLeft: `3px solid ${isSel ? T.sky : 'transparent'}` }}>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <Avatar initials={initials(r.nama)} color={statusTone(r.status)} size={28} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: T.txt, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 150 }}>{r.nama || '—'}</div>
                            <div style={{ fontSize: 9.5, color: T.dim }}>{r.lokasi || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '10px 14px' }}><Tag color={T.tint} style={{ fontSize: 9 }}>{(r.channel || '—').toString().toUpperCase()}</Tag></td>
                      <td style={{ padding: '10px 14px', fontSize: 11, color: T.sub, whiteSpace: 'nowrap' }}>{r.design_stage || '—'}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.6, padding: '3px 9px', borderRadius: 999, background: `${statusTone(r.status)}22`, color: statusTone(r.status), border: `1px solid ${statusTone(r.status)}55`, whiteSpace: 'nowrap' }}>{r.status || '—'}</span>
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: 11.5, color: T.txt, fontFamily: T.mono, textAlign: 'right', whiteSpace: 'nowrap' }}>{r.estimasi_value ? fmtRp(Number(r.estimasi_value) || 0) : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* RIGHT — detail panel */}
          <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {sel ? (() => {
              const q = qualOf(sel)
              const score = scoreOf(sel)
              const tone = statusTone(sel.status)
              const bant: [string, number, string][] = [
                ['Budget', q.budget, sel.estimasi_value ? fmtRp(Number(sel.estimasi_value) || 0) : 'Belum ada'],
                ['Otoritas', q.authority, sel.phone ? 'Kontak tersedia' : 'Belum ada'],
                ['Kebutuhan', q.need, sel.project_type || sel.lokasi || 'Belum ada'],
                ['Timeline', q.timeline, sel.design_stage || 'Belum ada'],
              ]
              return (
                <>
                  {/* header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar initials={initials(sel.nama)} color={tone} size={46} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: T.txt }}>{sel.nama || '—'}</div>
                      <div style={{ fontSize: 11, color: T.dim, fontFamily: T.mono }}>{sel.phone || sel._id}</div>
                    </div>
                    <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.6, padding: '4px 11px', borderRadius: 999, background: `${tone}22`, color: tone, border: `1px solid ${tone}55` }}>{sel.status || '—'}</span>
                  </div>

                  {/* contact grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      ['Channel', (sel.channel || '—').toString()],
                      ['Kota', sel.lokasi || '—'],
                      ['Proyek', sel.project_type || '—'],
                      ['Luas', sel.luas_m2 ? `${sel.luas_m2} m²` : '—'],
                    ].map(([k, v]) => (
                      <div key={k} style={{ background: T.inset, border: `1px solid ${T.line}`, borderRadius: 10, padding: '9px 11px' }}>
                        <div style={{ fontSize: 9, color: T.dim, textTransform: 'uppercase', letterSpacing: 0.5 }}>{k}</div>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: T.txt, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</div>
                      </div>
                    ))}
                  </div>

                  {/* skor kualifikasi */}
                  <div style={{ background: T.inset, border: `1px solid ${T.line}`, borderRadius: 12, padding: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <span style={{ fontSize: 9.5, fontWeight: 800, color: T.dim, textTransform: 'uppercase', letterSpacing: 0.6 }}>Skor Kualifikasi</span>
                      <span style={{ fontSize: 22, fontWeight: 900, color: tone, fontFamily: T.mono, lineHeight: 1 }}>{score}</span>
                      <span style={{ fontSize: 11, color: T.dim }}>/100</span>
                      <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.6, padding: '3px 10px', borderRadius: 999, background: `${tone}18`, color: tone, border: `1px solid ${tone}44` }}>{(sel.status || 'lead').toString()} lead</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {bant.map(([label, on, hint]) => (
                        <div key={label}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <span style={{ fontSize: 11, color: T.sub, fontWeight: 600 }}>{label}</span>
                            <span style={{ fontSize: 10, color: on ? T.green : T.dim }}>{hint}</span>
                          </div>
                          <ProgBar value={on ? 100 : 8} color={on ? T.green : T.line} h={5} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ringkasan AI */}
                  <div style={{ background: 'rgba(143,208,232,0.08)', border: `1px solid ${T.sky}33`, borderRadius: 12, padding: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <Icon name="Bot" size={15} color={T.sky} /><span style={{ fontSize: 12, fontWeight: 700, color: T.sky }}>Ringkasan AI</span>
                      {sel.tanggal && <span style={{ marginLeft: 'auto', fontSize: 10, color: T.dim, fontFamily: T.mono }}>{sel.tanggal}</span>}
                    </div>
                    <div style={{ fontSize: 11.5, color: T.sub, lineHeight: 1.6 }}>{sel.ringkasan || 'Belum ada ringkasan untuk percakapan ini.'}</div>
                  </div>

                  {/* actions */}
                  {showLeadActions ? (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <Btn v="primary" size="sm" icon={leadDone === 'kirim' ? 'CheckCircle' : 'UserPlus'} onClick={() => saveLead(sel, 'kirim')} style={{ flex: '1 1 45%', justifyContent: 'center' }}>{leadDone === 'kirim' ? 'Tersimpan' : 'Kirim ke Lead'}</Btn>
                      <Btn v="ghost" size="sm" icon="MessageSquare" onClick={() => setPage('chat-monitoring')} style={{ flex: '1 1 45%', justifyContent: 'center' }}>Chat</Btn>
                      <Btn v="ghost" size="sm" icon="FileText" onClick={() => onCreateDoc ? onCreateDoc({ clientName: sel.nama || '', clientPhone: (sel.phone || '').replace(/\D/g, '') }) : setPage('proposal-builder')} style={{ flex: '1 1 45%', justifyContent: 'center' }}>Buat Dokumen</Btn>
                      <Btn v="ghost" size="sm" icon={leadDone === 'update' ? 'CheckCircle' : 'RefreshCw'} onClick={() => saveLead(sel, 'update')} style={{ flex: '1 1 45%', justifyContent: 'center' }}>{leadDone === 'update' ? 'Diperbarui' : 'Update Lead'}</Btn>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Btn v="primary" size="sm" icon="MessageSquare" onClick={() => setPage('chat-monitoring')} style={{ flex: 1, justifyContent: 'center' }}>Chat</Btn>
                      <Btn v="ghost" size="sm" icon="FileText" onClick={() => setPage('proposal-builder')} style={{ flex: 1, justifyContent: 'center' }}>Proposal</Btn>
                      <Btn v="ghost" size="sm" icon="Kanban" onClick={() => setPage('pipeline')} style={{ flex: 1, justifyContent: 'center' }}>Proyek</Btn>
                    </div>
                  )}
                </>
              )
            })() : (
              <div style={{ padding: 30, textAlign: 'center', color: T.dim, fontSize: 12 }}>Pilih klien untuk lihat detail.</div>
            )}
          </div>
        </div>
      )}
    </Panel>
  )
}
