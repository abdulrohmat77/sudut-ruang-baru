import React, { useEffect, useMemo, useRef, useState } from 'react'
import { T } from '../components/AcosUI'
import { ArrowLeft, Plus, Trash2, Loader2, Eye, Save, ArrowRight, Send } from 'lucide-react'
import { AIConfigService, DocumentService, ClientService, ConversationService, DBClient } from '../services/supabaseClient'
import ProposalPreviewModal from '../components/ProposalPreviewModal'
import {
  ProposalData,
  ProposalLineItem,
  ProposalTimelineItem,
  ProposalQA,
  ProposalPillar,
  buildProposalHTML,
  computeTotals,
  formatMoney,
  DEFAULT_UNDERSTANDING,
} from '../services/proposalTemplate'
import { SpkPrefill, ProposalPrefill } from '../services/spkData'
import { loadPricing } from '../services/pricingService'
import {
  getProposalPackage,
  proposalCats,
  proposalTiers,
  proposalJenisLabel,
  proposalUnitPrice,
  type ProposalMode,
} from '../services/proposalPackages'

// Pisahkan teks multiline jadi array (untuk textarea lingkup yang editable).
function linesToList(text: string): string[] {
  return text.split('\n').map((s) => s.trim().replace(/^[+\-•✓]\s*/, '')).filter(Boolean)
}

// Hitung line item harga otomatis dari mode + kategori + tier + luas.
function computeAutoLine(mode: ProposalMode, cat: string, tier: string, areaStr: string): ProposalLineItem {
  const area = parseFloat(String(areaStr).replace(/[^\d.]/g, '')) || 0
  const unit = proposalUnitPrice(mode, cat, tier)
  return {
    description: `Jasa ${mode === 'plan' ? 'Desain' : 'Design & Build'} - ${cat} (${tier})`,
    volume: area ? `${area} m²` : '1 Paket',
    qty: area || 1,
    unitPrice: unit,
  }
}

// Tebak kategori standalone dari kategori Estimator (prefill).
function mapPrefillCat(mode: ProposalMode, raw: string): string {
  const cats = proposalCats(mode)
  if (cats.includes(raw)) return raw
  const c = (raw || '').toLowerCase()
  if (mode === 'plan') {
    if (c.includes('interior')) return 'Interior'
    if (c.includes('landscape') || c.includes('lanskap') || c.includes('taman')) return 'Landscape'
    if (c.includes('renovasi')) return 'Renovasi'
    return 'Arsitektur'
  }
  if (c.includes('cafe') || c.includes('komersial') || c.includes('resto')) return 'Interior (Cafe/Komersial)'
  if (c.includes('interior') || c.includes('kitchen') || c.includes('wardrobe')) return 'Interior (Residensial)'
  if (c.includes('kolam') || c.includes('renang')) return 'Landscape (Kolam Renang)'
  if (c.includes('villa')) return 'Landscape (Taman Villa)'
  if (c.includes('landscape') || c.includes('lanskap') || c.includes('taman') || c.includes('garden')) return 'Landscape (Taman Rumah)'
  return 'Arsitektur'
}

interface Props {
  onBack: () => void
  onCreateSpk?: (prefill: SpkPrefill) => void
  prefill?: ProposalPrefill | null
}

const getInputStyle = (): React.CSSProperties => ({
  width: '100%', padding: '9px 12px', background: T.inset, border: `1px solid ${T.line}`,
  borderRadius: 8, color: T.txt, fontSize: 13, fontFamily: T.font, outline: 'none',
})

const Field: React.FC<{ label: string; children: React.ReactNode; full?: boolean }> = ({ label, children, full }) => (
  <div style={{ gridColumn: full ? '1 / -1' : 'auto' }}>
    <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: T.dim, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>{label}</label>
    {children}
  </div>
)

const Card: React.FC<{ tag: string; title: string; children: React.ReactNode }> = ({ tag, title, children }) => (
  <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 14, padding: 18 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.sky, background: `${T.sky}18`, border: `1px solid ${T.sky}33`, padding: '2px 7px', borderRadius: 6 }}>{tag}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: T.txt, textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</span>
    </div>
    {children}
  </div>
)

const ProposalBuilder = ({ onBack, onCreateSpk, prefill }: Props) => {
  const inputStyle = getInputStyle()
  const [saving, setSaving] = useState(false)
  const [savedInfo, setSavedInfo] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [savedDoc, setSavedDoc] = useState(false)

  const [clientName, setClientName] = useState(prefill?.clientName || '')
  const [clientPhone, setClientPhone] = useState(prefill?.clientPhone || '')
  const [projectTitle, setProjectTitle] = useState(prefill?.projectTitle || '')
  const [subtitle, setSubtitle] = useState('')
  const [category, setCategory] = useState('Residensial')
  // Mode + kategori + tier mengikuti standalone (Jasa Perencanaan / Design & Build).
  const initMode: ProposalMode = prefill?.mode === 'db' ? 'db' : 'plan'
  const initCat = mapPrefillCat(initMode, prefill?.category || '')
  const initTier = proposalTiers(initMode).includes(prefill?.tier || '') ? (prefill!.tier as string) : (initMode === 'plan' ? 'Standar' : 'Standar')
  const initPkg = getProposalPackage(initMode, initCat, initTier)
  const [mode, setMode] = useState<ProposalMode>(initMode)
  const [layCategory, setLayCategory] = useState(initCat)
  const [tier, setTier] = useState(initTier)
  const [jenisPekerjaan, setJenisPekerjaan] = useState(() => proposalJenisLabel(initMode, initCat))
  const [jenisOverridden, setJenisOverridden] = useState(false)
  const [scopeInc, setScopeInc] = useState<string[]>(initPkg.included)
  const [scopeExc, setScopeExc] = useState<string[]>(initPkg.excluded)
  const [deliverable, setDeliverable] = useState(initPkg.deliverable)
  const [revisi, setRevisi] = useState(initPkg.revisi)
  const [pillarsState, setPillarsState] = useState<ProposalPillar[]>(
    initPkg.pillars.map((p) => ({ name: p.title, desc: p.desc })),
  )
  const [scopeEdited, setScopeEdited] = useState(false)
  // Harga awal dari Estimator dikunci; berubah otomatis saat user ganti paket.
  const [priceEdited, setPriceEdited] = useState(!!prefill?.feeAmount)
  const [crmClients, setCrmClients] = useState<DBClient[]>([])
  const [crmQuery, setCrmQuery] = useState('')
  const [crmOpen, setCrmOpen] = useState(false)
  const [location, setLocation] = useState('')
  const [landArea, setLandArea] = useState('')
  const [buildingArea, setBuildingArea] = useState(prefill?.area ? String(prefill.area) : '')
  const [tagline, setTagline] = useState('')
  const [currency, setCurrency] = useState<'IDR' | 'USD'>('IDR')
  const [ppnEnabled, setPpnEnabled] = useState(true)
  const taxPct = ppnEnabled ? '11' : '0'
  const [sending, setSending] = useState(false)
  const [conceptTagline, setConceptTagline] = useState(initPkg.conceptTagline)
  const [conceptBody, setConceptBody] = useState('')
  const [understanding, setUnderstanding] = useState<ProposalQA[]>(() => DEFAULT_UNDERSTANDING.map((x) => ({ ...x })))
  const [aboutBody, setAboutBody] = useState(
    'Sudut Ruang Arsitek — di bawah badan hukum CV. Sudut Ruang Archineering — adalah studio Design & Build premium berbasis di Surabaya. Kami menggabungkan desain arsitektur, storytelling visual, pendekatan teknis rancang-bangun, dan strategi branding arsitektur, dengan pengalaman menjangkau proyek strategis nasional termasuk ekosistem IKN.',
  )
  const [closingNote, setClosingNote] = useState(
    'Terima kasih atas kepercayaan Anda. Kami siap berdiskusi lebih lanjut untuk mewujudkan ruang impian Anda.',
  )
  const [lineItems, setLineItems] = useState<ProposalLineItem[]>(() => {
    const line = computeAutoLine(initMode, initCat, initTier, prefill?.area ? String(prefill.area) : '')
    if (prefill?.feeAmount) line.unitPrice = prefill.feeAmount, line.qty = 1, line.volume = prefill?.area ? `${prefill.area} m²` : '1 Paket'
    return [line]
  })
  const [timeline, setTimeline] = useState<ProposalTimelineItem[]>(() =>
    initPkg.timeline.map((t) => ({ badge: t.w, text: `${t.label}: ${t.detail}` })))

  const [company, setCompany] = useState({
    name: 'Sudut Ruang Arsitek',
    locations: 'Surabaya · Indonesia',
    phone: '+62 851-77000-990 · +62 821-1111-5619',
    logo: '',
  })

  useEffect(() => {
    AIConfigService.getAll().then((cfg) => {
      setCompany({
        name: cfg.company_name || 'Sudut Ruang Arsitek',
        locations: cfg.company_locations || 'Surabaya · Indonesia',
        phone: cfg.company_phone || '+62 851-77000-990 · +62 821-1111-5619',
        logo: cfg.company_logo || '',
      })
    })
    ClientService.getAll().then(setCrmClients)
    // Pastikan tabel harga (untuk harga auto) ter-load.
    loadPricing().then((changed) => {
      if (changed && !priceEdited) {
        const line = computeAutoLine(mode, layCategory, tier, buildingArea)
        setLineItems((prev) => [line, ...prev.slice(1)])
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Opsi kategori & tier mengikuti mode (sama persis standalone).
  const catOptions = useMemo(() => proposalCats(mode), [mode])
  const tierOptions = useMemo(() => proposalTiers(mode), [mode])

  // Saat mode berubah, pastikan kategori & tier masih valid.
  useEffect(() => {
    if (!catOptions.includes(layCategory)) setLayCategory(catOptions[0])
    if (!tierOptions.includes(tier)) setTier(tierOptions[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  // Label jenis pekerjaan auto-ikut mode + kategori (kecuali di-override manual).
  useEffect(() => {
    if (!jenisOverridden) setJenisPekerjaan(proposalJenisLabel(mode, layCategory))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, layCategory, jenisOverridden])

  // Ganti paket (mode/kategori/tier) → reset lingkup, deliverable, revisi, konsep, timeline.
  useEffect(() => {
    if (scopeEdited) return
    const pkg = getProposalPackage(mode, layCategory, tier)
    setScopeInc(pkg.included)
    setScopeExc(pkg.excluded)
    setDeliverable(pkg.deliverable)
    setRevisi(pkg.revisi)
    setPillarsState(pkg.pillars.map((p) => ({ name: p.title, desc: p.desc })))
    setConceptTagline(pkg.conceptTagline)
    setTimeline(pkg.timeline.map((t) => ({ badge: t.w, text: `${t.label}: ${t.detail}` })))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, layCategory, tier])

  // Auto-isi harga line item pertama dari paket + luas (kecuali sudah diedit manual).
  useEffect(() => {
    if (priceEdited) return
    const line = computeAutoLine(mode, layCategory, tier, buildingArea)
    setLineItems((prev) => [line, ...prev.slice(1)])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, layCategory, tier, buildingArea])

  const pickCrmClient = (id: string) => {
    const c = crmClients.find((x) => x.id === id)
    if (!c) return
    setClientName(c.name || '')
    setClientPhone(c.phone || '')
    setCrmQuery(c.name || '')
    setCrmOpen(false)
  }

  // Filter CRM: hanya tahap estimasi ke atas (sudah diproses), + bisa cari manual
  const ELIGIBLE_STAGES = ['estimasi', 'proposal', 'negosiasi', 'deal']
  const crmFiltered = useMemo(() => {
    const eligible = crmClients.filter((c) => ELIGIBLE_STAGES.includes(c.status || ''))
    const q = crmQuery.trim().toLowerCase()
    const list = !q ? eligible : eligible.filter((c) =>
      (c.name || '').toLowerCase().includes(q) || (c.phone || '').toLowerCase().includes(q) || String(c.id).includes(q))
    return list.slice(0, 40)
  }, [crmClients, crmQuery])

  const proposalNo = useMemo(() => `PROP-${Date.now()}`, [])

  const setItem = (i: number, patch: Partial<ProposalLineItem>) => {
    setPriceEdited(true)
    setLineItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))
  }
  const addItem = () =>
    setLineItems((prev) => [...prev, { description: '', volume: '1 Paket', qty: 1, unitPrice: 0 }])
  const removeItem = (i: number) =>
    setLineItems((prev) => (prev.length <= 1 ? prev : prev.filter((_, idx) => idx !== i)))

  const setTl = (i: number, patch: Partial<ProposalTimelineItem>) => {
    setScopeEdited(true)
    setTimeline((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))
  }
  const addTl = () => { setScopeEdited(true); setTimeline((prev) => [...prev, { badge: `W${prev.length + 1}`, text: '' }]) }
  const removeTl = (i: number) => { setScopeEdited(true); setTimeline((prev) => prev.filter((_, idx) => idx !== i)) }
  const resetTl = () => { setScopeEdited(false); const pkg = getProposalPackage(mode, layCategory, tier); setTimeline(pkg.timeline.map((t) => ({ badge: t.w, text: `${t.label}: ${t.detail}` }))) }

  const setQa = (i: number, patch: Partial<ProposalQA>) =>
    setUnderstanding((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))
  const addQa = () => setUnderstanding((prev) => [...prev, { q: '', a: '' }])
  const removeQa = (i: number) => setUnderstanding((prev) => prev.filter((_, idx) => idx !== i))

  const data: ProposalData = useMemo(() => {
    const now = new Date()
    const dateLabel = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
    return {
      proposalNo,
      dateLabel,
      confidentialNote: `Confidential · ${dateLabel}`,
      projectTitle: projectTitle || 'Nama Proyek',
      projectTitleAccent: '',
      subtitle,
      preparedFor: clientName || 'Calon Klien',
      metaSmall: `${clientPhone ? `WA: ${clientPhone} | ` : ''}${jenisPekerjaan ? `Jenis: ${jenisPekerjaan} | ` : ''}Kategori: ${category} | Studio: ${company.name}`,
      currency,
      taxRate: (parseFloat(taxPct) || 0) / 100,
      coverImage: undefined,
      aboutTitle: 'Tentang Studio',
      aboutBody: aboutBody.trim(),
      gallery: [],
      galleryTitle: 'Portofolio & Referensi Desain',
      moodboard: [],
      moodboardTitle: 'BAB 16 · Design Moodboard',
      summaryTitle: 'Satu halaman. Semua yang perlu Anda tahu.',
      summaryCards: [],
      paletteTitle: 'Material & Color Direction',
      paletteIntro: '',
      palette: [],
      timelineTitle: 'Dari kick-off ke serah terima.',
      timeline,
      pricingTitle: 'Investasi desain yang menghasilkan nilai.',
      lineItems,
      notes:
        'Nilai bersifat LUMPSUM FIXED PRICE selama lingkup tidak berubah. Belum termasuk PPN/PPh (jika dikenakan), biaya perjalanan luar kota Surabaya, biaya cetak, dan perizinan PBG. Validity proposal: 30 hari kalender sejak tanggal terbit.',
      closingNote: closingNote.trim() || undefined,
      company,
      // Master fields
      category,
      location,
      landArea,
      buildingArea,
      tagline,
      conceptTagline,
      conceptBody,
      understanding: understanding.filter((q) => q.q.trim() || q.a.trim()),
      pillars: pillarsState.filter((p) => p.name.trim() || p.desc.trim()),
      scopeIncluded: scopeInc.length ? scopeInc : undefined,
      scopeExcluded: scopeExc.length ? scopeExc : undefined,
      deliverables: [deliverable, revisi ? `Ketentuan revisi: ${revisi}` : ''].filter(Boolean),
    }
  }, [proposalNo, projectTitle, subtitle, clientName, clientPhone, currency, taxPct, aboutBody, closingNote, lineItems, timeline, company, category, location, landArea, buildingArea, tagline, conceptTagline, conceptBody, understanding, jenisPekerjaan, mode, layCategory, scopeInc, scopeExc, deliverable, revisi, pillarsState])
  const docHtml = useMemo(() => buildProposalHTML(data), [data])
  const totals = useMemo(() => computeTotals(data), [data])

  // Jaga posisi scroll preview saat dokumen di-render ulang (ganti paket/field).
  const previewRef = useRef<HTMLIFrameElement>(null)
  const previewScroll = useRef(0)
  const onPreviewLoad = () => {
    const win = previewRef.current?.contentWindow
    if (!win) return
    try {
      win.scrollTo(0, previewScroll.current)
      win.addEventListener('scroll', () => { previewScroll.current = win.scrollY || 0 }, { passive: true })
    } catch { /* noop */ }
  }

  const handleSave = async () => {
    setSaving(true)
    const normalizedPhone = clientPhone.replace(/\D/g, '')
    try {
      const { error } = await DocumentService.insert({
        conversation_id: null,
        client_phone: normalizedPhone || null,
        client_name: clientName || 'Klien',
        type: 'proposal',
        status: 'draft',
        file_url: null,
        proposal_no: proposalNo,
        data: {
          projectName: projectTitle,
          subtitle,
          currency,
          taxRate: (parseFloat(taxPct) || 0) / 100,
          lineItems,
          subtotal: totals.subtotal,
          tax: totals.tax,
          totalAvg: totals.grandTotal,
          clientName,
          generatedAt: new Date().toISOString(),
        },
        sent_at: null,
        valid_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      })
      if (error) throw error
      // Proposal dibuat → tahap lead naik jadi "proposal" (hanya maju).
      await ClientService.advanceStage(normalizedPhone, clientName, 'proposal')
      setSavedDoc(true)
      setSavedInfo({ type: 'success', message: `Proposal ${proposalNo} tersimpan sebagai draft di Dokumen.` })
    } catch (e) {
      setSavedInfo({ type: 'error', message: 'Gagal menyimpan proposal: ' + ((e as { message?: string })?.message || 'coba lagi.') })
    } finally {
      setSaving(false)
    }
  }

  // ── SS-20: validasi field wajib + kirim ke WhatsApp ──────────
  const requiredFields: [string, string][] = [
    ['Nama Klien', clientName],
    ['No. WhatsApp', clientPhone],
    ['Judul Proyek', projectTitle],
    ['Kategori Proyek', category],
    ['Jenis Pekerjaan', jenisPekerjaan],
    ['Lokasi', location],
    ['Luas Lahan', landArea],
    ['Luas Bangunan', buildingArea],
  ]
  const missingFields = requiredFields.filter(([, v]) => !String(v).trim()).map(([k]) => k)

  const normalizeWa = (phone: string) => {
    const raw = phone.replace(/\D/g, '')
    if (raw.startsWith('0')) return '62' + raw.slice(1)
    if (raw.startsWith('62')) return raw
    if (raw.startsWith('8')) return '62' + raw
    return raw
  }

  const handleSendWa = async () => {
    if (missingFields.length > 0) {
      setSavedInfo({ type: 'error', message: 'Lengkapi dulu field wajib sebelum kirim: ' + missingFields.join(', ') + '.' })
      return
    }
    setSending(true)
    const recipient = normalizeWa(clientPhone)
    try {
      // 1. Simpan dokumen sebagai "sent".
      const { error: docErr } = await DocumentService.insert({
        conversation_id: null,
        client_phone: recipient || null,
        client_name: clientName || 'Klien',
        type: 'proposal',
        status: 'sent',
        file_url: null,
        proposal_no: proposalNo,
        data: {
          projectName: projectTitle, subtitle, currency,
          taxRate: (parseFloat(taxPct) || 0) / 100,
          lineItems, subtotal: totals.subtotal, tax: totals.tax, totalAvg: totals.grandTotal,
          clientName, jenisPekerjaan, kategoriProyek: category, location, landArea, buildingArea,
          generatedAt: new Date().toISOString(),
        },
        sent_at: new Date().toISOString(),
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      if (docErr) throw docErr

      // Proposal dikirim → tahap lead naik jadi "proposal" (hanya maju).
      await ClientService.advanceStage(recipient, clientName, 'proposal')

      // 2. Trigger webhook n8n (n8n yang mengirim WA + sinkron balik). Endpoint dari Pengaturan.
      const webhookUrl = (await AIConfigService.get('webhook_pdf_url')) || ''
      let waTriggered = false
      if (webhookUrl) {
        try {
          const res = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              doc_type: 'proposal',
              proposal_number: proposalNo,
              client_name: clientName,
              client_phone: recipient,
              recipient,
              project_name: projectTitle,
              total_value: totals.grandTotal,
              currency,
              html: docHtml,
              timestamp: new Date().toISOString(),
            }),
          })
          waTriggered = res.ok
        } catch (whErr) {
          console.warn('Webhook proposal gagal dipanggil:', whErr)
        }
      }

      // 3. Catat ke Active Chat (best-effort) agar langsung terlihat di dashboard.
      try {
        const convId = `wa-${recipient}`
        await ConversationService.upsertConversation({
          id: convId,
          client_name: clientName || 'Klien',
          source: 'whatsapp',
          mode: 'manual',
          status: 'active',
          last_message: `Proposal "${projectTitle}" dikirim`,
          last_message_at: new Date().toISOString(),
          unread_count: 0,
        })
        await ConversationService.insertMessage({
          conversation_id: convId,
          content: `Proposal "${projectTitle}" (${proposalNo}) dikirim ke ${recipient}. Total ${currency} ${formatMoney(currency, totals.grandTotal)}.`,
          role: 'human',
          source: 'whatsapp',
          ai_confidence: null,
          needs_human_review: false,
          metadata: { kind: 'proposal', proposalNo },
        })
      } catch (chatErr) {
        console.warn('Gagal mencatat ke Active Chat:', chatErr)
      }

      setSavedDoc(true)
      setSavedInfo({
        type: 'success',
        message: webhookUrl
          ? waTriggered
            ? `Proposal dikirim ke WhatsApp ${recipient} & tercatat di Active Chat.`
            : `Proposal tersimpan & tercatat di Active Chat, tapi webhook n8n belum mengonfirmasi pengiriman WA. Cek workflow n8n.`
          : `Proposal tersimpan & tercatat di Active Chat. Atur Webhook n8n di Pengaturan → Integrasi agar bisa kirim WA otomatis.`,
      })
    } catch (e) {
      setSavedInfo({ type: 'error', message: 'Gagal mengirim proposal: ' + ((e as { message?: string })?.message || 'coba lagi.') })
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: T.bgGrad }}>
      {/* Top bar */}
      <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: `1px solid ${T.line}`, background: T.panel, flexShrink: 0 }}>
        <button
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', background: T.inset, border: `1px solid ${T.line}`, color: T.txt, cursor: 'pointer' }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = T.sky)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = T.line)}
        >
          <ArrowLeft size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: T.txt }}>Proposal Generator</h1>
          <p style={{ fontSize: 12, color: T.dim, margin: '2px 0 0' }}>Proposal penawaran branded — cover, ruang lingkup, timeline & harga.</p>
        </div>
        <button
          onClick={() => setShowPreview(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 9, border: `1px solid ${T.line}`, background: T.inset, color: T.txt, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = T.sky)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = T.line)}
        >
          <Eye size={15} /> Preview & Cetak
        </button>
      </div>

      {/* Body */}
      <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        <div className="doc-builder-grid">
          {/* LEFT — form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card tag="§1" title="Identitas Proposal">
              {crmClients.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: T.dim, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>Pilih dari CRM (opsional)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      value={crmQuery}
                      onChange={(e) => { setCrmQuery(e.target.value); setCrmOpen(true) }}
                      onFocus={() => setCrmOpen(true)}
                      onBlur={() => setTimeout(() => setCrmOpen(false), 150)}
                      placeholder="Ketik nama / nomor klien (tahap estimasi+)..."
                      style={inputStyle}
                    />
                    {crmOpen && crmFiltered.length > 0 && (
                      <div className="custom-scrollbar" style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, maxHeight: 240, overflowY: 'auto', background: T.panel, border: `1px solid ${T.lineHi}`, borderRadius: 10, zIndex: 50, boxShadow: '0 14px 40px rgba(0,0,0,0.45)' }}>
                        {crmFiltered.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); pickCrmClient(c.id) }}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', textAlign: 'left', padding: '9px 12px', background: 'transparent', border: 'none', borderBottom: `1px solid ${T.line}`, color: T.txt, cursor: 'pointer', fontSize: 13 }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(74,179,216,0.12)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                          >
                            <span><b>{c.name || 'Pelanggan'}</b>{c.phone ? <span style={{ opacity: 0.7, fontFamily: 'monospace', marginLeft: 8 }}>{c.phone}</span> : null}</span>
                            <span style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', padding: '2px 7px', borderRadius: 999, background: 'rgba(74,179,216,0.15)', color: T.sky }}>{c.status}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {crmOpen && crmQuery.trim() && crmFiltered.length === 0 && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, padding: '10px 12px', background: T.panel, border: `1px solid ${T.lineHi}`, borderRadius: 10, zIndex: 50, color: T.dim, fontSize: 12.5 }}>
                        Tidak ada klien tahap estimasi+ cocok "{crmQuery}". Input manual di bawah.
                      </div>
                    )}
                  </div>
                  {clientName && <div style={{ marginTop: 6, fontSize: 11, color: T.dim }}>Terpilih: <b style={{ color: T.txt }}>{clientName}</b>{clientPhone ? ` · ${clientPhone}` : ''} · <button type="button" onClick={() => { setClientName(''); setClientPhone(''); setCrmQuery('') }} style={{ background: 'none', border: 'none', color: T.sky, textDecoration: 'underline', cursor: 'pointer', fontSize: 11 }}>reset</button></div>}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="Nama Klien *"><input style={inputStyle} value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Bpk. Budi" /></Field>
                <Field label="No. WhatsApp *"><input style={inputStyle} value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="6281234567890" /></Field>
                <Field label="Judul Proyek *" full><input style={inputStyle} value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} placeholder="Villa Tropis Ubud" /></Field>
                <Field label="Jenis Layanan *" full>
                  <div style={{ display: 'flex', gap: 6, background: T.inset, border: `1px solid ${T.line}`, borderRadius: 8, padding: 4 }}>
                    {([['plan', 'Jasa Perencanaan'], ['db', 'Design & Build']] as const).map(([m, lbl]) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => { setMode(m); setScopeEdited(false); setPriceEdited(false) }}
                        style={{ flex: 1, padding: '9px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 700, fontFamily: T.font, background: mode === m ? T.sky : 'transparent', color: mode === m ? '#03203a' : T.dim, transition: 'all .15s' }}
                      >{lbl}</button>
                    ))}
                  </div>
                </Field>
                <Field label="Kategori *">
                  <select style={inputStyle} value={layCategory} onChange={(e) => { setLayCategory(e.target.value); setScopeEdited(false); setPriceEdited(false) }}>
                    {catOptions.map((c) => <option key={c} value={c} style={{ background: T.panel }}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Tier / Paket *">
                  <div style={{ display: 'flex', gap: 6, background: T.inset, border: `1px solid ${T.line}`, borderRadius: 8, padding: 4 }}>
                    {tierOptions.map((o) => (
                      <button
                        key={o}
                        type="button"
                        onClick={() => { setTier(o); setScopeEdited(false); setPriceEdited(false) }}
                        style={{ flex: 1, padding: '9px 6px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: T.font, background: tier === o ? T.sky : 'transparent', color: tier === o ? '#03203a' : T.dim, transition: 'all .15s' }}
                      >{o}</button>
                    ))}
                  </div>
                </Field>
                <Field label="Label Jenis Pekerjaan (di dokumen)" full>
                  <input style={inputStyle} value={jenisPekerjaan} onChange={(e) => { setJenisPekerjaan(e.target.value); setJenisOverridden(true) }} placeholder="Perancangan Arsitektur" />
                </Field>
                <Field label="Kategori Proyek *">
                  <select style={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)}>
                    {['Residensial', 'Hospitality', 'Komersial', 'Interior', 'Lanskap', 'Mixed-Use', 'Pemerintah'].map((c) => (
                      <option key={c} value={c} style={{ background: T.panel }}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Lokasi *"><input style={inputStyle} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ubud, Bali" /></Field>
                <Field label="Luas Lahan (m²) *"><input style={inputStyle} value={landArea} onChange={(e) => setLandArea(e.target.value)} placeholder="260" /></Field>
                <Field label="Luas Bangunan (m²) *"><input style={inputStyle} value={buildingArea} onChange={(e) => setBuildingArea(e.target.value)} placeholder="180" /></Field>
                <Field label="Subjudul"><input style={inputStyle} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Design & Build Proposal" /></Field>
                <Field label="Tagline / Positioning" full><input style={inputStyle} value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Rumah tropis yang bernapas" /></Field>
                <Field label="Mata Uang">
                  <div style={{ display: 'flex', gap: 6, background: T.inset, border: `1px solid ${T.line}`, borderRadius: 8, padding: 4 }}>
                    {(['IDR', 'USD'] as const).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCurrency(c)}
                        style={{
                          flex: 1, padding: '8px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                          fontSize: 12, fontWeight: 700, fontFamily: T.font,
                          background: currency === c ? T.sky : 'transparent',
                          color: currency === c ? '#03203a' : T.dim,
                          transition: 'all .15s',
                        }}
                      >{c}</button>
                    ))}
                  </div>
                </Field>
                <Field label="Pajak (PPN)">
                  <div style={{ display: 'flex', gap: 6, background: T.inset, border: `1px solid ${T.line}`, borderRadius: 8, padding: 4 }}>
                    {[['Kenakan PPN 11%', true], ['Tanpa PPN', false]].map(([lbl, val]) => (
                      <button
                        key={String(val)}
                        type="button"
                        onClick={() => setPpnEnabled(val as boolean)}
                        style={{
                          flex: 1, padding: '8px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                          fontSize: 12, fontWeight: 700, fontFamily: T.font,
                          background: ppnEnabled === val ? T.sky : 'transparent',
                          color: ppnEnabled === val ? '#03203a' : T.dim,
                          transition: 'all .15s',
                        }}
                      >{lbl as string}</button>
                    ))}
                  </div>
                </Field>
              </div>
            </Card>

            <Card tag="§2" title="Rincian Harga (Line Items)">
              <div style={{ fontSize: 11, color: T.dim, marginBottom: 10, lineHeight: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <span>{priceEdited ? 'Harga diedit manual.' : <>Harga otomatis dari tier <b style={{ color: T.sky }}>{tier}</b> × luas.</>}</span>
                {priceEdited && (
                  <button
                    type="button"
                    onClick={() => { setPriceEdited(false); const line = computeAutoLine(mode, layCategory, tier, buildingArea); setLineItems((prev) => [line, ...prev.slice(1)]) }}
                    style={{ fontSize: 10.5, fontWeight: 700, color: T.dim, background: T.inset, border: `1px solid ${T.line}`, borderRadius: 7, padding: '5px 10px', cursor: 'pointer' }}
                  >
                    Isi otomatis dari tier {tier}
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {lineItems.map((it, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 56px 130px 30px', gap: 8, alignItems: 'center', background: T.inset, border: `1px solid ${T.line}`, borderRadius: 8, padding: 8 }}>
                    <input style={{ ...inputStyle, padding: '7px 9px', fontSize: 12 }} value={it.description} onChange={(e) => setItem(i, { description: e.target.value })} placeholder="Deskripsi" />
                    <input style={{ ...inputStyle, padding: '7px 9px', fontSize: 12 }} value={it.volume} onChange={(e) => setItem(i, { volume: e.target.value })} placeholder="Volume" />
                    <input type="number" style={{ ...inputStyle, padding: '7px 9px', fontSize: 12, textAlign: 'right' }} value={it.qty} onChange={(e) => setItem(i, { qty: Number(e.target.value) || 0 })} />
                    <input type="number" style={{ ...inputStyle, padding: '7px 9px', fontSize: 12, textAlign: 'right', fontFamily: T.mono }} value={it.unitPrice} onChange={(e) => setItem(i, { unitPrice: Number(e.target.value) || 0 })} placeholder="Harga" />
                    <button onClick={() => removeItem(i)} disabled={lineItems.length <= 1} title="Hapus" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 7, background: 'transparent', border: `1px solid ${T.line}`, color: lineItems.length <= 1 ? T.line : '#ef4444', cursor: lineItems.length <= 1 ? 'not-allowed' : 'pointer' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button onClick={addItem} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: 10, borderRadius: 8, border: `1px dashed ${T.sky}55`, background: `${T.sky}0d`, color: T.sky, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                  <Plus size={15} /> Tambah Item
                </button>
              </div>
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: T.sub }}><span>Subtotal</span><span style={{ fontFamily: T.mono }}>{currency} {formatMoney(currency, totals.subtotal)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: T.sub }}><span>PPN {taxPct || 0}%</span><span style={{ fontFamily: T.mono }}>{currency} {formatMoney(currency, totals.tax)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: T.txt, fontWeight: 800, paddingTop: 6, borderTop: `1px solid ${T.line}` }}><span>TOTAL</span><span style={{ fontFamily: T.mono, color: T.sky }}>{currency} {formatMoney(currency, totals.grandTotal)}</span></div>
              </div>
            </Card>

            <Card tag="§3" title="Narasi & Konsep">
              <Field label="Tentang Studio" full>
                <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={3} value={aboutBody} onChange={(e) => setAboutBody(e.target.value)} />
              </Field>
              <div style={{ height: 12 }} />
              <Field label="Tagline Konsep Desain (BAB-06)" full>
                <input style={inputStyle} value={conceptTagline} onChange={(e) => setConceptTagline(e.target.value)} placeholder="Rumah yang bernapas" />
              </Field>
              <div style={{ height: 12 }} />
              <Field label="Narasi Konsep Desain" full>
                <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={3} value={conceptBody} onChange={(e) => setConceptBody(e.target.value)} placeholder="Ceritakan pengalaman ruang yang ingin diciptakan (kosongkan untuk teks default)" />
              </Field>
              <div style={{ height: 12 }} />
              <Field label="Catatan Penutup" full>
                <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={closingNote} onChange={(e) => setClosingNote(e.target.value)} />
              </Field>
            </Card>

            <Card tag="§6" title="Lingkup Pekerjaan (sesuai Tier)">
              <div style={{ fontSize: 11, color: T.dim, marginBottom: 10, lineHeight: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <span>Auto-terisi dari paket <b style={{ color: T.sky }}>{jenisPekerjaan} · {tier}</b>. Ganti Jenis/Tier untuk reset, atau edit manual - dokumen ikut berubah.</span>
                {scopeEdited && (
                  <button
                    type="button"
                    onClick={() => {
                      setScopeEdited(false)
                      const pkg = getProposalPackage(mode, layCategory, tier)
                      {
                        setScopeInc(pkg.included); setScopeExc(pkg.excluded)
                        setDeliverable(pkg.deliverable); setRevisi(pkg.revisi)
                        setPillarsState(pkg.pillars.map((p) => ({ name: p.title, desc: p.desc })))
                        setConceptTagline(pkg.conceptTagline)
                        setTimeline(pkg.timeline.map((t) => ({ badge: t.w, text: `${t.label}: ${t.detail}` })))
                      }
                    }}
                    style={{ fontSize: 10.5, fontWeight: 700, color: T.dim, background: T.inset, border: `1px solid ${T.line}`, borderRadius: 7, padding: '5px 10px', cursor: 'pointer' }}
                  >
                    Reset paket {tier}
                  </button>
                )}
              </div>
              <Field label="Termasuk dalam lingkup (1 baris = 1 item)" full>
                <textarea
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                  rows={6}
                  value={scopeInc.join('\n')}
                  onChange={(e) => { setScopeInc(linesToList(e.target.value)); setScopeEdited(true) }}
                  placeholder="Konsep desain&#10;Denah lengkap&#10;3D realistis..."
                />
              </Field>
              <div style={{ height: 12 }} />
              <Field label="Tidak termasuk (1 baris = 1 item)" full>
                <textarea
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                  rows={4}
                  value={scopeExc.join('\n')}
                  onChange={(e) => { setScopeExc(linesToList(e.target.value)); setScopeEdited(true) }}
                  placeholder="Gambar struktur&#10;Perizinan PBG..."
                />
              </Field>
              <div style={{ height: 12 }} />
              <Field label="Deliverable Akhir" full>
                <textarea
                  style={{ ...inputStyle, resize: 'vertical' }}
                  rows={2}
                  value={deliverable}
                  onChange={(e) => { setDeliverable(e.target.value); setScopeEdited(true) }}
                />
              </Field>
              <div style={{ height: 12 }} />
              <Field label="Ketentuan Revisi" full>
                <input
                  style={inputStyle}
                  value={revisi}
                  onChange={(e) => { setRevisi(e.target.value); setScopeEdited(true) }}
                />
              </Field>
            </Card>

            <Card tag="§5" title="Understanding the Brief (BAB-03)">
              <div style={{ fontSize: 11, color: T.dim, marginBottom: 10, lineHeight: 1.5 }}>Pertanyaan & jawaban yang menunjukkan pemahaman ke proyek klien. Sudah terisi default — edit sesuai konteks.</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {understanding.map((qa, i) => (
                  <div key={i} style={{ background: T.inset, border: `1px solid ${T.line}`, borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.sky }}>{String(i + 1).padStart(2, '0')}</span>
                      <input style={{ ...inputStyle, padding: '7px 9px', fontSize: 12, flex: 1 }} value={qa.q} onChange={(e) => setQa(i, { q: e.target.value })} placeholder="Pertanyaan klien" />
                      <button onClick={() => removeQa(i)} title="Hapus" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 7, background: 'transparent', border: `1px solid ${T.line}`, color: '#ef4444', cursor: 'pointer', flexShrink: 0 }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <textarea style={{ ...inputStyle, padding: '7px 9px', fontSize: 12, resize: 'vertical' }} rows={2} value={qa.a} onChange={(e) => setQa(i, { a: e.target.value })} placeholder="Jawaban yang menunjukkan pemahaman" />
                  </div>
                ))}
                <button onClick={addQa} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: 10, borderRadius: 8, border: `1px dashed ${T.sky}55`, background: `${T.sky}0d`, color: T.sky, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                  <Plus size={15} /> Tambah Pertanyaan
                </button>
              </div>
            </Card>

            <Card tag="§4" title="Timeline Kerja">
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                <button onClick={resetTl} style={{ fontSize: 10.5, fontWeight: 700, color: T.dim, background: T.inset, border: `1px solid ${T.line}`, borderRadius: 7, padding: '5px 10px', cursor: 'pointer' }}>Reset Default</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {timeline.map((t, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 30px', gap: 8, alignItems: 'center', background: T.inset, border: `1px solid ${T.line}`, borderRadius: 8, padding: 8 }}>
                    <input style={{ ...inputStyle, padding: '7px 9px', fontSize: 12, fontFamily: T.mono }} value={t.badge} onChange={(e) => setTl(i, { badge: e.target.value })} placeholder="W1-W2" />
                    <input style={{ ...inputStyle, padding: '7px 9px', fontSize: 12 }} value={t.text} onChange={(e) => setTl(i, { text: e.target.value })} placeholder="Tahap pekerjaan" />
                    <button onClick={() => removeTl(i)} title="Hapus" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 7, background: 'transparent', border: `1px solid ${T.line}`, color: '#ef4444', cursor: 'pointer' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button onClick={addTl} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: 10, borderRadius: 8, border: `1px dashed ${T.sky}55`, background: `${T.sky}0d`, color: T.sky, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                  <Plus size={15} /> Tambah Tahap
                </button>
              </div>
            </Card>
          </div>

          {/* RIGHT — live preview + actions */}
          <div className="doc-builder-aside" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: T.dim, textTransform: 'uppercase', letterSpacing: 0.6 }}>Preview Dokumen (live)</span>
              <span style={{ fontSize: 10.5, color: T.dim }}>= hasil cetak</span>
            </div>
            <div className="doc-preview-frame" style={{ background: '#fff', border: `1px solid ${T.line}`, borderRadius: 14, overflow: 'hidden', height: 'calc(100vh - 250px)', minHeight: 460 }}>
              <iframe ref={previewRef} title="Preview Proposal" srcDoc={docHtml} onLoad={onPreviewLoad} style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }} />
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: 14, borderRadius: 12, border: 'none', fontWeight: 700, fontSize: 14, background: T.sky, color: '#03203a', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Menyimpan...' : 'Simpan Proposal'}
            </button>
            <button
              onClick={handleSendWa}
              disabled={sending}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: 14, borderRadius: 12, border: 'none', fontWeight: 700, fontSize: 14, background: '#25D366', color: '#fff', cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.7 : 1 }}
            >
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {sending ? 'Mengirim...' : 'Kirim ke WhatsApp'}
            </button>
            {missingFields.length > 0 && (
              <p style={{ fontSize: 11, color: T.amber, textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
                Wajib dilengkapi sebelum kirim: {missingFields.join(', ')}
              </p>
            )}
            <button
              onClick={() => setShowPreview(true)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: 12, borderRadius: 12, border: `1px solid ${T.line}`, background: T.panel, color: T.txt, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = T.sky)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = T.line)}
            >
              <Eye size={16} /> Preview & Cetak (PDF)
            </button>
            {onCreateSpk && (
              <button
                onClick={() =>
                  onCreateSpk({
                    clientName,
                    clientPhone,
                    projectName: projectTitle,
                    totalFee: totals.subtotal,
                    mode,
                    layCategory,
                    tier,
                    lokasi: location,
                    luas: buildingArea,
                  })
                }
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: 12, borderRadius: 12, border: 'none', fontWeight: 700, fontSize: 13, background: T.bright, color: '#fff', cursor: 'pointer' }}
              >
                <ArrowRight size={16} /> Lanjut ke SPK (pakai data ini)
              </button>
            )}
          </div>
        </div>
      </div>

      {showPreview && (
        <ProposalPreviewModal
          data={data}
          onClose={() => setShowPreview(false)}
          onSave={handleSave}
          saving={saving}
          saved={savedDoc}
        />
      )}

      {savedInfo && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: T.panel, padding: 32, borderRadius: 20, width: '100%', maxWidth: 400, border: `1px solid ${T.line}`, textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: savedInfo.type === 'success' ? `${T.green}20` : '#ef444420', color: savedInfo.type === 'success' ? T.green : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 32 }}>{savedInfo.type === 'success' ? 'check_circle' : 'error'}</span>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 12px', color: T.txt }}>{savedInfo.type === 'success' ? 'Berhasil!' : 'Terjadi Kesalahan'}</h3>
            <p style={{ fontSize: 14, color: T.dim, lineHeight: 1.6, margin: '0 0 24px' }}>{savedInfo.message}</p>
            <button onClick={() => setSavedInfo(null)} style={{ width: '100%', padding: 14, borderRadius: 12, fontWeight: 700, cursor: 'pointer', background: savedInfo.type === 'success' ? T.sky : '#ef4444', color: '#fff', border: 'none' }}>Tutup</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProposalBuilder
