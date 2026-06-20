import React, { useEffect, useState } from 'react'
import { ClientService, ConversationService, AiSummaryService, DBClient, DBAiSummary } from '../services/supabaseClient'
import type { ConversationAnalysis } from '../services/n8nWebhookService'
import { T, Icon, Avatar, Tag, ProgBar, Btn, Dot, Panel, statusColor } from '../components/AcosUI'
import CustomerInsights from '../components/CustomerInsights'
import type { PageType } from '../App'
import type { ProposalPrefill, SpkPrefill, InvoicePrefill } from '../services/spkData'

const CRM_COLS = [
  { key: 'lead', label: 'LEADS BARU', color: T.amber },
  { key: 'estimasi', label: 'ESTIMASI', color: T.sky },
  { key: 'proposal', label: 'PROPOSAL', color: T.tint },
  { key: 'negosiasi', label: 'NEGOSIASI', color: T.red },
  { key: 'deal', label: 'DEAL/WON', color: T.green },
]

const fmtRp = (num: number) => {
  if (num >= 1_000_000_000) return `Rp ${(num / 1_000_000_000).toFixed(1)}M`
  if (num >= 1_000_000) return `Rp ${Math.round(num / 1_000_000)}jt`
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num)
}

// ── Helper untuk ringkasan AI (gabungan dari Customer CRM AI) ──
const aiTone = (s?: string | null): string => {
  const v = (s || '').toLowerCase()
  if (v.includes('clos') || v.includes('deal') || v.includes('won')) return T.green
  if (v.includes('hot')) return T.red
  if (v.includes('warm')) return T.amber
  if (v.includes('cold')) return T.dim
  return T.sky
}
const bantOf = (r: DBAiSummary) => {
  const budget = r.estimasi_value ? 1 : 0
  const authority = r.phone ? 1 : 0
  const need = (r.project_type || r.lokasi) ? 1 : 0
  const timeline = r.design_stage ? 1 : 0
  return { budget, authority, need, timeline, total: budget + authority + need + timeline }
}
const aiScoreOf = (r: DBAiSummary): number => {
  const p = Number(r.progress_pct)
  if (!isNaN(p) && r.progress_pct) return Math.round(p)
  return Math.round((bantOf(r).total / 4) * 100)
}

function LeadCard({ lead, onClick, onMove, onDelete }: { lead: any, onClick: () => void, onMove: (stage: string) => void, onDelete: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const channelIconMap: Record<string, string> = { 
    whatsapp: "MessageCircle", instagram: "Instagram", website: "Globe", referral: "Users", dashboard: "LayoutDashboard" 
  };
  const chIcon = channelIconMap[lead.channel.toLowerCase()] || "Inbox";
  
  return (
    <div className="ac-row" style={{ background: T.inset, border: `1px solid ${T.line}`, borderRadius: 11, padding: 12, cursor: "pointer", marginBottom: 9, position: "relative" }}>
      {/* Menu button */}
      <button
        onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
        style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6 }}
        onMouseEnter={(e) => (e.currentTarget.style.background = T.inset)}
        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
      >
        <Icon name="MoreVertical" size={14} color={T.dim} />
      </button>
      {/* Context menu */}
      {menuOpen && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={(e) => { e.stopPropagation(); setMenuOpen(false) }} />
          <div style={{ position: "absolute", top: 28, right: 8, background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.4)", zIndex: 50, minWidth: 160, overflow: "hidden" }}>
            <div style={{ padding: "8px 12px", fontSize: 9, fontWeight: 700, color: T.dim, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: `1px solid ${T.line}` }}>Pindahkan ke</div>
            {CRM_COLS.filter((c) => c.key !== lead.stage).map((c) => (
              <button
                key={c.key}
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onMove(c.key) }}
                style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: "none", border: "none", cursor: "pointer", color: T.txt, fontSize: 11.5, fontWeight: 600, textAlign: "left" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(74,179,216,0.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                <Dot color={c.color} size={6} />{c.label}
              </button>
            ))}
            <div style={{ borderTop: `1px solid ${T.line}` }}>
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete() }}
                style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 11.5, fontWeight: 600, textAlign: "left" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                <Icon name="Trash2" size={12} color="#ef4444" />Hapus
              </button>
            </div>
          </div>
        </>
      )}
      <div onClick={onClick}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, paddingRight: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar initials={lead.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("")} color={statusColor[lead.status] || T.sky} size={28} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.txt, lineHeight: 1.2 }}>{lead.name}</div>
            <div style={{ fontSize: 9.5, color: T.dim, fontFamily: T.mono, overflow: "hidden", textOverflow: "ellipsis", maxWidth: 100, whiteSpace: "nowrap" }}>{lead.id}</div>
          </div>
        </div>
        <Tag color={statusColor[lead.status] || T.sky} style={{ fontSize: 8.5 }}>{lead.status.toUpperCase()}</Tag>
      </div>
      <div style={{ fontSize: 11.5, color: T.sub, fontWeight: 600, marginBottom: 3 }}>{lead.project}</div>
      <div style={{ fontSize: 10, color: T.dim, marginBottom: 9 }}>{lead.loc} · {lead.area} m²</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: T.tint, fontFamily: T.mono }}>{fmtRp(lead.value)}</span>
        <span style={{ fontSize: 9.5, color: T.dim }}>fee {fmtRp(lead.fee)}</span>
      </div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
          <span style={{ fontSize: 9, color: T.dim }}>AI Score</span><span style={{ fontSize: 9.5, fontWeight: 700, color: lead.score > 85 ? T.green : lead.score > 70 ? T.amber : T.dim }}>{lead.score}/100</span>
        </div>
        <ProgBar value={lead.score} color={lead.score > 85 ? T.green : lead.score > 70 ? T.amber : T.dim} h={4} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: `1px solid ${T.line}` }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 9.5, color: T.dim }}><Icon name={chIcon} size={12} color={T.sub} />{lead.channel}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Tag color={T.sub} style={{ fontSize: 8 }}>Human</Tag>
          <span style={{ fontSize: 9, color: T.dim }}>{lead.last}</span>
        </span>
      </div>
      </div>
    </div>
  );
}

const Pipeline: React.FC<{ onNavigate?: (p: PageType) => void; onCreateProposal?: (p: ProposalPrefill) => void; onCreateSpk?: (p: SpkPrefill) => void; onCreateInvoice?: (p: InvoicePrefill) => void }> = ({ onNavigate, onCreateProposal, onCreateSpk, onCreateInvoice }) => {
  const [clients, setClients] = useState<DBClient[]>([])
  const [summaries, setSummaries] = useState<Map<string, DBAiSummary>>(new Map())
  const [view, setView] = useState("semua")
  const [sel, setSel] = useState<any>(null)
  const [dtab, setDtab] = useState("detail")
  const [filter, setFilter] = useState("all")
  // Filter & cari untuk tampilan "Semua Kontak" (gabungan leads + AI summary).
  const [allFilter, setAllFilter] = useState("all")
  const [allSearch, setAllSearch] = useState("")

  // Add-client modal
  const emptyForm = { name: '', phone: '', building_type: '', tier: '', area_sqm: '', source: 'dashboard' }
  const [addStage, setAddStage] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadClients()
    loadSummaries()
  }, [])

  // Muat ringkasan AI (ai_summaries + fallback metadata percakapan), di-index
  // berdasarkan conversation_id dan nomor telepon agar bisa dicocokkan ke lead.
  const loadSummaries = async () => {
    try {
      const [table, convs] = await Promise.all([
        AiSummaryService.getAll(),
        ConversationService.getAll(),
      ])
      const map = new Map<string, DBAiSummary>()
      const put = (row: DBAiSummary) => {
        map.set(row.conversation_id, row)
        const d = (row.phone || '').replace(/\D/g, '')
        if (d) map.set(d, row)
      }
      convs.forEach((c) => {
        const a = (c.metadata as Record<string, unknown> | undefined)?.aiAnalysis as ConversationAnalysis | undefined
        if (!a) return
        put({
          conversation_id: c.id,
          tanggal: a.tanggal || null,
          nama: a.nama || c.client_name || null,
          phone: a.phone || c.id,
          channel: a.channel || c.source || null,
          project_type: a.project_type || null,
          lokasi: a.lokasi || null,
          luas_m2: a.luas_m2 != null ? String(a.luas_m2) : null,
          estimasi_value: a.estimasi_value != null ? String(a.estimasi_value) : null,
          status: a.status || null,
          design_stage: a.design_stage || null,
          progress_pct: a.progress_pct != null ? String(a.progress_pct) : null,
          ringkasan: a.ringkasan || null,
        })
      })
      table.forEach(put)
      setSummaries(map)
    } catch {
      /* abaikan — detail AI bersifat opsional */
    }
  }

  const findSummary = (leadId: string): DBAiSummary | null => {
    return summaries.get(leadId) || summaries.get((leadId || '').replace(/\D/g, '')) || null
  }

  const loadClients = async () => {
    const data = await ClientService.getAll()
    // #8/#9 Auto-lead: percakapan dari Active Chat yang belum ada di CRM
    // otomatis dibuat sebagai lead baru (tidak menimpa lead yang sudah ada).
    const created = await syncLeadsFromConversations(data)
    setClients(created ? await ClientService.getAll() : data)
  }

  // Buat lead dari percakapan yang belum terdaftar di CRM. Mengembalikan true bila ada yang dibuat.
  const syncLeadsFromConversations = async (existing: DBClient[]): Promise<boolean> => {
    try {
      const convs = await ConversationService.getAll()
      const existingIds = new Set(existing.map((c) => c.id))
      const existingPhones = new Set(
        existing.map((c) => (c.phone || '').replace(/\D/g, '')).filter(Boolean),
      )
      const toCreate = convs.filter((cv) => {
        const digits = (cv.id || '').replace(/\D/g, '')
        const dupId = existingIds.has(cv.id)
        const dupPhone = !!digits && existingPhones.has(digits)
        return !dupId && !dupPhone
      })
      if (toCreate.length === 0) return false
      for (const cv of toCreate) {
        const digits = (cv.id || '').replace(/\D/g, '')
        await ClientService.upsert({
          id: digits || cv.id,
          name: cv.client_name || 'Pelanggan',
          phone: digits || null,
          source: cv.source || 'whatsapp',
          status: 'lead',
          last_contact_at: cv.last_message_at || new Date().toISOString(),
        })
      }
      return true
    } catch {
      return false
    }
  }

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addStage || saving) return
    setSaving(true)
    const phone = form.phone.replace(/[^\d]/g, '')
    const id = phone || `client_${Date.now()}`
    await ClientService.upsert({
      id,
      name: form.name.trim() || 'Klien Baru',
      phone: phone || null,
      source: form.source || 'dashboard',
      status: addStage,
      building_type: form.building_type.trim() || null,
      tier: form.tier.trim() || null,
      area_sqm: form.area_sqm ? parseFloat(form.area_sqm) : null,
      last_contact_at: new Date().toISOString(),
    })
    setSaving(false)
    setAddStage(null)
    loadClients()
  }

  // Map DBClient to ACOS Lead format
  const mappedLeads = clients.map(c => {
    // Typecast metadata to handle JSONB appropriately
    const metadata = (typeof c.metadata === 'object' && c.metadata !== null) ? c.metadata as any : {};
    
    return {
      id: c.id,
      name: c.name || "Pelanggan",
      project: metadata.projectName || "Proyek Baru",
      loc: metadata.loc || "-",
      area: c.area_sqm || 0,
      value: c.rab_avg || 0,
      fee: c.fee_avg || ((c.rab_avg || 0) * 0.1),
      score: metadata.ai_score || 0,
      prob: c.status === 'deal' ? 100 : c.status === 'negosiasi' ? 80 : c.status === 'proposal' ? 60 : c.status === 'estimasi' ? 40 : 10,
      channel: c.source || "dashboard",
      status: c.status === 'deal' ? 'paid' : (c.status === 'negosiasi' ? 'hot' : 'info'),
      handler: c.status === 'lead' ? "AI" : "Human",
      last: c.last_contact_at ? new Date(c.last_contact_at).toLocaleDateString('id-ID') : "-",
      stage: c.status || 'lead'
    };
  });

  const leads = filter === "all" ? mappedLeads : mappedLeads.filter((l) => l.status === filter);
  const totalVal = mappedLeads.reduce((s, l) => s + l.value, 0);

  // ── "Semua Kontak": gabungan lead pipeline + data Customer CRM (AI) ──
  // Lead pipeline (dari tabel clients) + kontak yang hanya punya ringkasan AI
  // (ai_summaries) yang belum tercatat sebagai lead → ditampilkan jadi satu daftar.
  const leadKeySet = new Set<string>()
  mappedLeads.forEach((l) => {
    leadKeySet.add(String(l.id))
    const d = String(l.id || '').replace(/\D/g, '')
    if (d) leadKeySet.add(d)
  })
  const extraContacts: any[] = []
  const seenConv = new Set<string>()
  summaries.forEach((s) => {
    if (seenConv.has(s.conversation_id)) return
    seenConv.add(s.conversation_id)
    const dig = (s.phone || '').replace(/\D/g, '')
    if (leadKeySet.has(s.conversation_id) || (dig && leadKeySet.has(dig))) return
    const st = (s.status || '').toLowerCase()
    const mapped = st.includes('clos') || st.includes('deal') || st.includes('won') ? 'paid'
      : st.includes('hot') ? 'hot' : st.includes('warm') ? 'warm' : st.includes('cold') ? 'cold' : 'info'
    extraContacts.push({
      id: dig || s.conversation_id,
      name: s.nama || 'Pelanggan',
      project: s.project_type || 'Proyek Baru',
      loc: s.lokasi || '-',
      area: s.luas_m2 ? (parseFloat(String(s.luas_m2)) || 0) : 0,
      value: Number(s.estimasi_value) || 0,
      fee: 0,
      score: aiScoreOf(s),
      prob: 0,
      channel: s.channel || 'whatsapp',
      status: mapped,
      handler: 'AI',
      last: s.tanggal || '-',
      stage: 'lead',
    })
  })
  const allContacts = [...mappedLeads, ...extraContacts]
  const allFiltered = allContacts.filter((c) => {
    const sum = findSummary(String(c.id))
    const st = (sum?.status || c.status || '').toLowerCase()
    const matchF = allFilter === 'all' ? true
      : allFilter === 'deal' ? (st.includes('clos') || st.includes('deal') || st.includes('won') || c.status === 'paid')
      : st.includes(allFilter)
    const q = allSearch.trim().toLowerCase()
    const matchS = !q || c.name.toLowerCase().includes(q) || String(c.id).includes(q) || (c.loc || '').toLowerCase().includes(q)
    return matchF && matchS
  })

  return (
    <div style={{ padding: 22, height: "100%", overflowY: "auto", background: T.bgGrad }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: T.txt, margin: 0 }}>CRM & Leads</h1>
          <div style={{ fontSize: 13, color: T.dim, marginTop: 6 }}>{allContacts.length} kontak · {fmtRp(totalVal)} potensi nilai · gabungan Leads + Customer CRM (AI)</div>
        </div>
        <div className="crm-controls" style={{ display: "flex", gap: 9, alignItems: "center" }}>
          <div className="crm-toggle" style={{ display: "flex", background: T.inset, borderRadius: 9, padding: 3, border: `1px solid ${T.line}` }}>
            {([["semua", "Users", "Semua Kontak"], ["data", "Database", "Data Customer"], ["kanban", "LayoutGrid", "Kanban"], ["table", "Table", "Pipeline"]] as const).map(([v, ic, lbl]) => (
              <button key={v} onClick={() => setView(v)} style={{ padding: "6px 12px", borderRadius: 7, border: "none", background: view === v ? T.sky : "transparent", color: view === v ? "#03203a" : T.dim, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, fontFamily: T.font, whiteSpace: "nowrap" }}><Icon name={ic} size={13} color={view === v ? "#03203a" : T.dim} />{lbl}</button>
            ))}
          </div>
          <Btn v="primary" size="sm" icon="Plus" onClick={() => { setForm(emptyForm); setAddStage("lead") }}>Lead Baru</Btn>
        </div>
      </div>

      {view === "semua" ? (
        <Panel>
          <div style={{ display: "flex", gap: 10, padding: "12px 16px", borderBottom: `1px solid ${T.line}`, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.inset, border: `1px solid ${T.line}`, borderRadius: 9, padding: "7px 11px", flex: "1 1 200px", minWidth: 160 }}>
              <Icon name="Search" size={14} color={T.dim} />
              <input value={allSearch} onChange={(e) => setAllSearch(e.target.value)} placeholder="Cari nama / lokasi / nomor..." style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: T.txt, fontSize: 12, fontFamily: T.font }} />
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["all", "hot", "warm", "cold", "deal"].map((f) => (
                <button key={f} onClick={() => setAllFilter(f)} style={{ padding: "6px 13px", borderRadius: 999, border: `1px solid ${allFilter === f ? T.sky + "55" : T.line}`, background: allFilter === f ? "rgba(74,179,216,0.14)" : "transparent", color: allFilter === f ? T.sky : T.dim, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: T.font, textTransform: "capitalize" }}>{f === "all" ? "Semua" : f}</button>
              ))}
            </div>
          </div>
          <div className="custom-scrollbar" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
              <thead><tr style={{ borderBottom: `1px solid ${T.line}` }}>
                {["Kontak", "Channel", "Status", "Estimasi", "Ringkasan AI"].map((h) => (
                  <th key={h} style={{ textAlign: h === "Estimasi" ? "right" : "left", padding: "11px 16px", fontSize: 9.5, color: T.dim, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {allFiltered.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 30, textAlign: "center", color: T.dim, fontSize: 12 }}>Tidak ada kontak.</td></tr>
                ) : allFiltered.map((c) => {
                  const sum = findSummary(String(c.id))
                  const stText = (sum?.status || '').trim()
                  const tone = stText ? aiTone(stText) : (statusColor[c.status] || T.sky)
                  return (
                    <tr key={c.id} onClick={() => { setSel(c); setDtab("detail") }} className="ac-trow hover:bg-white/5 transition-colors" style={{ borderBottom: `1px solid ${T.line}`, cursor: "pointer" }}>
                      <td style={{ padding: "11px 16px" }}><div style={{ display: "flex", alignItems: "center", gap: 9 }}><Avatar initials={c.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("")} color={tone} size={28} /><div style={{ minWidth: 0 }}><div style={{ fontSize: 12, fontWeight: 700, color: T.txt }}>{c.name}</div><div style={{ fontSize: 9.5, color: T.dim, fontFamily: T.mono, overflow: "hidden", textOverflow: "ellipsis", maxWidth: 120, whiteSpace: "nowrap" }}>{c.id}</div></div></div></td>
                      <td style={{ padding: "11px 16px" }}><Tag color={T.tint} style={{ fontSize: 9 }}>{String(c.channel).toUpperCase()}</Tag></td>
                      <td style={{ padding: "11px 16px" }}><span style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0.5, padding: "3px 9px", borderRadius: 999, background: `${tone}22`, color: tone, border: `1px solid ${tone}55`, whiteSpace: "nowrap" }}>{stText || CRM_COLS.find((x) => x.key === c.stage)?.label || c.status}</span></td>
                      <td style={{ padding: "11px 16px", textAlign: "right", fontSize: 12, fontWeight: 700, color: T.tint, fontFamily: T.mono, whiteSpace: "nowrap" }}>{c.value ? fmtRp(c.value) : '—'}</td>
                      <td style={{ padding: "11px 16px", fontSize: 11, color: T.sub, maxWidth: 280 }}><div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sum?.ringkasan || '—'}</div></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : view === "data" ? (
        <CustomerInsights
          setPage={(p) => onNavigate?.(p as PageType)}
          panelStyle={{ marginBottom: 0 }}
          showLeadActions
          onCreateDoc={(d) => onCreateProposal?.({ clientName: d.clientName, clientPhone: d.clientPhone })}
        />
      ) : view === "kanban" ? (
        <div className="custom-scrollbar" style={{ display: "flex", gap: 13, overflowX: "auto", paddingBottom: 10, alignItems: "flex-start", height: "calc(100vh - 160px)" }}>
          {CRM_COLS.map((col) => {
            const items = mappedLeads.filter((l) => l.stage === col.key);
            const sum = items.reduce((s, l) => s + l.value, 0);
            return (
              <div key={col.key} style={{ width: 250, flexShrink: 0, height: "100%", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: T.panel, border: `1px solid ${T.line}`, borderRadius: 11, marginBottom: 10, borderTop: `2px solid ${col.color}`, flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Dot color={col.color} size={7} /><span style={{ fontSize: 12, fontWeight: 700, color: T.txt }}>{col.label}</span>
                    <span style={{ fontSize: 10, color: T.dim, background: T.inset, borderRadius: 999, padding: "1px 7px" }}>{items.length}</span>
                  </div>
                  <span style={{ fontSize: 9.5, color: T.dim, fontFamily: T.mono }}>{fmtRp(sum)}</span>
                </div>
                <div className="custom-scrollbar" style={{ overflowY: "auto", flex: 1 }}>
                  {items.map((l) => <LeadCard key={l.id} lead={l} onClick={() => { setSel(l); setDtab("detail"); }} onMove={async (stage) => { await ClientService.upsert({ id: l.id, status: stage } as any); loadClients(); }} onDelete={async () => { if (confirm(`Hapus ${l.name} dari CRM?`)) { await ClientService.delete(l.id); loadClients(); } }} />)}
                  {items.length === 0 && <div style={{ padding: 20, textAlign: "center", fontSize: 10.5, color: T.dim, border: `1px dashed ${T.line}`, borderRadius: 11 }}>Kosong</div>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Panel>
          <div style={{ display: "flex", gap: 6, padding: "12px 16px", borderBottom: `1px solid ${T.line}` }}>
            {["all", "hot", "info", "paid"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: "5px 13px", borderRadius: 999, border: `1px solid ${filter === f ? T.sky + "55" : T.line}`, background: filter === f ? "rgba(74,179,216,0.14)" : "transparent", color: filter === f ? T.sky : T.dim, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: T.font, textTransform: "capitalize" }}>{f === "all" ? "Semua" : f}</button>
            ))}
          </div>
          <div className="custom-scrollbar" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
              <thead><tr style={{ borderBottom: `1px solid ${T.line}` }}>
                {["Lead", "Proyek", "Channel", "Nilai", "Fee", "Score", "Prob", "Handler", "Tahap"].map((h) => (
                  <th key={h} style={{ textAlign: h === "Nilai" || h === "Fee" ? "right" : "left", padding: "11px 16px", fontSize: 9.5, color: T.dim, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} onClick={() => { setSel(l); setDtab("detail"); }} className="ac-trow hover:bg-white/5 transition-colors" style={{ borderBottom: `1px solid ${T.line}`, cursor: "pointer" }}>
                    <td style={{ padding: "11px 16px" }}><div style={{ display: "flex", alignItems: "center", gap: 9 }}><Avatar initials={l.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("")} color={statusColor[l.status] || T.sky} size={28} /><div><div style={{ fontSize: 12, fontWeight: 700, color: T.txt }}>{l.name}</div><div style={{ fontSize: 9.5, color: T.dim, fontFamily: T.mono, overflow: "hidden", textOverflow: "ellipsis", maxWidth: 100, whiteSpace: "nowrap" }}>{l.id}</div></div></div></td>
                    <td style={{ padding: "11px 16px", fontSize: 11.5, color: T.sub }}>{l.project}<div style={{ fontSize: 9.5, color: T.dim }}>{l.loc}</div></td>
                    <td style={{ padding: "11px 16px" }}><Tag color={T.tint} style={{ fontSize: 9 }}>{l.channel}</Tag></td>
                    <td style={{ padding: "11px 16px", textAlign: "right", fontSize: 12, fontWeight: 700, color: T.tint, fontFamily: T.mono }}>{fmtRp(l.value)}</td>
                    <td style={{ padding: "11px 16px", textAlign: "right", fontSize: 11, color: T.sub, fontFamily: T.mono }}>{fmtRp(l.fee)}</td>
                    <td style={{ padding: "11px 16px" }}><span style={{ fontSize: 11, fontWeight: 700, color: l.score > 85 ? T.green : l.score > 70 ? T.amber : T.dim }}>{l.score}</span></td>
                    <td style={{ padding: "11px 16px", fontSize: 11, color: T.sub }}>{l.prob}%</td>
                    <td style={{ padding: "11px 16px" }}><Tag color={T.sub} style={{ fontSize: 8.5 }}>Human</Tag></td>
                    <td style={{ padding: "11px 16px" }}><Tag color={CRM_COLS.find((c) => c.key === l.stage)?.color || T.sky} style={{ fontSize: 8.5 }}>{CRM_COLS.find((c) => c.key === l.stage)?.label || l.stage}</Tag></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* lead drawer */}
      {sel && (
        <div onClick={() => setSel(null)} style={{ position: "fixed", inset: 0, background: "rgba(2,16,30,0.6)", zIndex: 60, display: "flex", justifyContent: "flex-end", backdropFilter: "blur(3px)" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "min(440px, 100vw)", background: T.panel, borderLeft: `1px solid ${T.lineHi}`, height: "100%", overflowY: "auto", animation: "acslide .25s ease-out" }}>
            <div style={{ padding: "18px 20px", borderBottom: `1px solid ${T.line}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", gap: 12 }}>
                <Avatar initials={sel.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("")} color={statusColor[sel.status] || T.sky} size={46} />
                <div><div style={{ fontSize: 16, fontWeight: 800, color: T.txt }}>{sel.name}</div><div style={{ fontSize: 11, color: T.dim, fontFamily: T.mono, overflow: "hidden", textOverflow: "ellipsis", maxWidth: 150, whiteSpace: "nowrap" }}>{sel.id} · {sel.channel}</div></div>
              </div>
              <button onClick={() => setSel(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><Icon name="X" size={20} color={T.dim} /></button>
            </div>
            <div style={{ display: "flex", gap: 4, padding: "10px 16px 0" }}>
              {[["detail", "Detail", "LayoutList"]].map(([k, l, ic]) => (
                <button key={k} onClick={() => setDtab(k)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: "9px 9px 0 0", border: "none", borderBottom: `2px solid ${dtab === k ? T.sky : "transparent"}`, background: "transparent", color: dtab === k ? T.sky : T.dim, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: T.font }}>
                  <Icon name={ic} size={13} color={dtab === k ? T.sky : T.dim} />{l}
                </button>
              ))}
            </div>
            <div style={{ padding: 20, borderTop: `1px solid ${T.line}` }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
                {[["Proyek", sel.project], ["Lokasi", sel.loc], ["Luas", sel.area + " m²"], ["Nilai est.", fmtRp(sel.value)], ["Fee est.", fmtRp(sel.fee)], ["Probabilitas", sel.prob + "%"]].map(([l, v], i) => (
                  <div key={i} style={{ background: T.inset, borderRadius: 10, padding: "10px 12px", border: `1px solid ${T.line}` }}>
                    <div style={{ fontSize: 9, color: T.dim, textTransform: "uppercase", letterSpacing: 0.5 }}>{l}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.txt, marginTop: 3 }}>{v}</div>
                  </div>
                ))}
              </div>
              {(() => {
                const sum = findSummary(sel.id)
                if (!sum) {
                  return (
                    <div style={{ background: "rgba(143,208,232,0.08)", border: `1px solid ${T.sky}33`, borderRadius: 12, padding: 14, marginBottom: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <Icon name="Bot" size={16} color={T.tint} /><span style={{ fontSize: 12, fontWeight: 700, color: T.tint }}>Ringkasan Data</span>
                        <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 800, color: T.green }}>Skor {sel.score}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: T.sub, lineHeight: 1.6 }}>Lead {sel.status} tersimpan di CRM. Brief proyek {sel.project.toLowerCase()} sedang di tahap {CRM_COLS.find((c) => c.key === sel.stage)?.label.toLowerCase()}. Belum ada ringkasan AI — buka Active Chats → AI Analyst → Generate Rangkuman.</div>
                    </div>
                  )
                }
                const tone = aiTone(sum.status)
                const q = bantOf(sum)
                const score = aiScoreOf(sum)
                const bant: [string, number, string][] = [
                  ['Budget', q.budget, sum.estimasi_value ? fmtRp(Number(sum.estimasi_value) || 0) : 'Belum ada'],
                  ['Otoritas', q.authority, sum.phone ? 'Kontak tersedia' : 'Belum ada'],
                  ['Kebutuhan', q.need, sum.project_type || sum.lokasi || 'Belum ada'],
                  ['Timeline', q.timeline, sum.design_stage || 'Belum ada'],
                ]
                return (
                  <>
                    <div style={{ background: T.inset, border: `1px solid ${T.line}`, borderRadius: 12, padding: 14, marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <span style={{ fontSize: 9.5, fontWeight: 800, color: T.dim, textTransform: 'uppercase', letterSpacing: 0.6 }}>Skor Kualifikasi</span>
                        <span style={{ fontSize: 22, fontWeight: 900, color: tone, fontFamily: T.mono, lineHeight: 1 }}>{score}</span>
                        <span style={{ fontSize: 11, color: T.dim }}>/100</span>
                        <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.6, padding: '3px 10px', borderRadius: 999, background: `${tone}18`, color: tone, border: `1px solid ${tone}44` }}>{(sum.status || 'lead').toString()}</span>
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
                    <div style={{ background: 'rgba(143,208,232,0.08)', border: `1px solid ${T.sky}33`, borderRadius: 12, padding: 14, marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <Icon name="Bot" size={15} color={T.sky} /><span style={{ fontSize: 12, fontWeight: 700, color: T.sky }}>Ringkasan AI</span>
                        {sum.tanggal && <span style={{ marginLeft: 'auto', fontSize: 10, color: T.dim, fontFamily: T.mono }}>{sum.tanggal}</span>}
                      </div>
                      <div style={{ fontSize: 11.5, color: T.sub, lineHeight: 1.6 }}>{sum.ringkasan || 'Belum ada ringkasan untuk percakapan ini.'}</div>
                    </div>
                  </>
                )
              })()}
              {/* Tombol lanjut ke tahap berikutnya */}
              {sel.stage === 'estimasi' && onCreateProposal && (() => {
                const m = (typeof sel.metadata === 'object' && sel.metadata) ? sel.metadata as any : {}
                return <Btn v="sky" style={{ width: "100%", justifyContent: "center", marginBottom: 8 }} icon="FileText" onClick={() => { setSel(null); onCreateProposal({ clientName: sel.name, clientPhone: String(sel.id), projectTitle: m.projectName || '', feeAmount: m.fee || sel.value || 0, category: m.category || '', tier: m.tier, area: m.area || sel.area, mode: m.mode }) }}>Lanjut: Buat Proposal</Btn>
              })()}
              {sel.stage === 'proposal' && onCreateSpk && (() => {
                const m = (typeof sel.metadata === 'object' && sel.metadata) ? sel.metadata as any : {}
                return <Btn v="sky" style={{ width: "100%", justifyContent: "center", marginBottom: 8 }} icon="FileCheck" onClick={() => { setSel(null); onCreateSpk({ clientName: sel.name, clientPhone: String(sel.id), projectName: m.projectName || sel.project || '', totalFee: m.fee || sel.value || 0, luas: m.area ? `${m.area} m2` : (sel.area ? `${sel.area} m2` : '') }) }}>Lanjut: Buat SPK</Btn>
              })()}
              {sel.stage === 'negosiasi' && onCreateInvoice && (() => {
                const m = (typeof sel.metadata === 'object' && sel.metadata) ? sel.metadata as any : {}
                return <Btn v="sky" style={{ width: "100%", justifyContent: "center", marginBottom: 8 }} icon="Receipt" onClick={() => { setSel(null); onCreateInvoice({ clientName: sel.name, clientPhone: String(sel.id), projectName: m.projectName || sel.project || '', contractValue: m.fee || sel.value || 0 }) }}>Lanjut: Buat Invoice</Btn>
              })()}
              <Btn v="primary" style={{ width: "100%", justifyContent: "center" }} icon="ArrowUpRight" onClick={() => setSel(null)}>Tutup Detail</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Add-client modal */}
      {addStage && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setAddStage(null)}>
          <Panel style={{ width: "100%", maxWidth: 400, animation: "acscale .2s ease-out" }} pad={24}>
            <div onClick={(e: any) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[16px] font-bold text-on-surface tracking-tight" style={{ color: T.txt }}>
                  Tambah Client — {CRM_COLS.find(c => c.key === addStage)?.label}
                </h3>
                <button onClick={() => setAddStage(null)} className="p-1 rounded-md text-dim-text" style={{ background: "transparent", border: "none", cursor: "pointer" }}><Icon name="X" size={18} color={T.dim} /></button>
              </div>

              <form onSubmit={handleAddClient} className="space-y-4">
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: T.dim, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>Nama Client *</label>
                  <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Contoh: Bpk. Budi" 
                    style={{ width: "100%", padding: "10px 14px", background: T.inset, border: `1px solid ${T.line}`, borderRadius: 8, color: T.txt, fontSize: 13, fontFamily: T.font, outline: "none" }} />
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: T.dim, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>Nomor WhatsApp</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Contoh: 6281234567890" 
                    style={{ width: "100%", padding: "10px 14px", background: T.inset, border: `1px solid ${T.line}`, borderRadius: 8, color: T.txt, fontSize: 13, fontFamily: T.font, outline: "none" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 700, color: T.dim, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>Tipe Bangunan</label>
                    <input type="text" value={form.building_type} onChange={(e) => setForm({ ...form, building_type: e.target.value })} placeholder="Rumah Tinggal" 
                      style={{ width: "100%", padding: "10px 14px", background: T.inset, border: `1px solid ${T.line}`, borderRadius: 8, color: T.txt, fontSize: 13, fontFamily: T.font, outline: "none" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 700, color: T.dim, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>Luas (m²)</label>
                    <input type="number" value={form.area_sqm} onChange={(e) => setForm({ ...form, area_sqm: e.target.value })} placeholder="100" 
                      style={{ width: "100%", padding: "10px 14px", background: T.inset, border: `1px solid ${T.line}`, borderRadius: 8, color: T.txt, fontSize: 13, fontFamily: T.font, outline: "none" }} />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, paddingTop: 10 }}>
                  <Btn v="ghost" style={{ flex: 1, justifyContent: "center" }} onClick={() => setAddStage(null)}>Batal</Btn>
                  <Btn v="primary" style={{ flex: 1, justifyContent: "center" }} onClick={handleAddClient}>{saving ? "Menyimpan..." : "Simpan"}</Btn>
                </div>
              </form>
            </div>
          </Panel>
        </div>
      )}
    </div>
  )
}

export default Pipeline
