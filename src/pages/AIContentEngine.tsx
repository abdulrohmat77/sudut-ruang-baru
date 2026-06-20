import { useEffect, useState, useRef } from 'react'
import { T, Panel, Btn } from '../components/AcosUI'
import { AiContentService, DBAiContent } from '../services/supabaseClient'
import { n8nService } from '../services/n8nWebhookService'
import { Sparkles, Loader2, Trash2, Image as ImageIcon, Calendar, Wand2, RotateCw, Upload as UploadIcon, X, Clock } from 'lucide-react'

async function uploadImageToSupabase(file: File): Promise<string> {
  const { supabase } = await import('../services/supabaseClient')
  const ext = file.name.split('.').pop() || 'jpg'
  const filename = `content-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage.from('content-images').upload(filename, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type,
  })
  if (error) throw new Error('Upload Supabase gagal: ' + error.message)
  const { data: urlData } = supabase.storage.from('content-images').getPublicUrl(filename)
  return urlData.publicUrl
}

// Gambar konten dengan state loading + error + retry (Pollinations kadang lambat/queue full)
function ContentImage({ url }: { url: string | null }) {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>(url ? 'loading' : 'error')
  const [bust, setBust] = useState(0)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => { setStatus(url ? 'loading' : 'error') }, [url, bust])

  // Gambar yang sudah ke-cache kadang nggak men-trigger onLoad — cek manual.
  useEffect(() => {
    const img = imgRef.current
    if (img && img.complete && img.naturalWidth > 0) setStatus('ok')
  }, [url, bust])

  const src = url ? (bust ? `${url}${url.includes('?') ? '&' : '?'}_r=${bust}` : url) : ''

  return (
    <div style={{ aspectRatio: '4/3', background: T.inset, position: 'relative', overflow: 'hidden', maxHeight: 160 }}>
      {url && (
        <img
          ref={imgRef}
          key={bust}
          src={src}
          alt=""
          onLoad={() => setStatus('ok')}
          onError={() => setStatus('error')}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: status === 'ok' ? 'block' : 'none' }}
        />
      )}
      {status === 'loading' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: T.dim }}>
          <Loader2 size={24} className="animate-spin" style={{ color: T.sky }} />
          <span style={{ fontSize: 10.5 }}>Memuat gambar...</span>
        </div>
      )}
      {status === 'error' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: T.dim }}>
          <ImageIcon size={26} style={{ opacity: 0.4 }} />
          {url ? (
            <button onClick={() => setBust((b) => b + 1)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', background: T.inset, border: `1px solid ${T.line}`, borderRadius: 7, color: T.sky, fontSize: 10.5, fontWeight: 700, cursor: 'pointer' }}>
              <RotateCw size={12} /> Coba lagi
            </button>
          ) : (
            <span style={{ fontSize: 10.5 }}>Belum ada gambar</span>
          )}
        </div>
      )}
    </div>
  )
}

const STATUS = {
  draft: { label: 'Draft', color: T.dim },
  scheduled: { label: 'Terjadwal', color: T.amber },
  posted: { label: 'Terposting', color: T.green },
  failed: { label: 'Gagal', color: T.red },
}

const AIContentEngine = () => {
  const [contents, setContents] = useState<DBAiContent[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [err, setErr] = useState('')

  // Generate form
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState('Profesional & inspiratif')
  const [platform, setPlatform] = useState('instagram')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const fileRef = useRef<HTMLInputElement>(null)

  // Modal jadwal
  const [scheduleTarget, setScheduleTarget] = useState<DBAiContent | null>(null)
  const [scheduleValue, setScheduleValue] = useState('')
  const [savingSchedule, setSavingSchedule] = useState(false)
  const [scheduleErr, setScheduleErr] = useState('')

  // datetime-local pakai waktu lokal (bukan UTC) → format YYYY-MM-DDTHH:MM
  const toLocalInput = (d: Date) => {
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    return local.toISOString().slice(0, 16)
  }
  // Minimal jadwal: 5 menit dari sekarang (hindari limitasi/penolakan IG)
  const MIN_LEAD_MS = 5 * 60 * 1000

  const onPickFile = (f: File | null) => {
    setFile(f)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(f ? URL.createObjectURL(f) : '')
  }
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])

  const load = async () => {
    setLoading(true)
    setContents(await AiContentService.getAll())
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const handleGenerate = async () => {
    if (!topic.trim() || generating) return
    if (!file) { setErr('Pilih gambar dulu untuk dianalisa AI.'); return }
    setGenerating(true)
    setErr('')

    // 1. Upload gambar user ke Supabase Storage
    let imageUrl = ''
    try {
      imageUrl = await uploadImageToSupabase(file)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Upload gambar gagal.')
      setGenerating(false)
      return
    }

    // 2. Kirim ke n8n: analisa gambar → caption + hashtags + image_prompt
    const res = await n8nService.generateContent({ topic: topic.trim(), tone, platform, image_url: imageUrl })
    if (res.success && res.data) {
      const d = res.data
      // 3. Simpan caption + URL gambar (Supabase Storage) ke tabel ai_contents
      await AiContentService.insert({
        topic: topic.trim(),
        caption: d.caption || null,
        hashtags: d.hashtags || null,
        image_prompt: d.image_prompt || null,
        image_url: imageUrl,
        platform,
        status: 'draft',
      })
      setTopic('')
      onPickFile(null)
      if (fileRef.current) fileRef.current.value = ''
      load()
    } else {
      setErr(res.error || 'Gagal generate konten. Pastikan workflow n8n /generate-content aktif.')
    }
    setGenerating(false)
  }

  const handleSchedule = (c: DBAiContent) => {
    // Default: 5 menit dari sekarang, atau pakai jadwal lama kalau ada
    const base = c.scheduled_at ? new Date(c.scheduled_at) : new Date(Date.now() + MIN_LEAD_MS)
    setScheduleValue(toLocalInput(base))
    setScheduleErr('')
    setScheduleTarget(c)
  }

  const confirmSchedule = async () => {
    if (!scheduleTarget || !scheduleValue) return
    const dt = new Date(scheduleValue) // datetime-local diparse sebagai waktu lokal
    if (isNaN(dt.getTime())) { setScheduleErr('Tanggal tidak valid.'); return }
    // Wajib minimal 5 menit dari sekarang
    if (dt.getTime() < Date.now() + MIN_LEAD_MS) {
      setScheduleErr('Jadwal minimal 5 menit dari sekarang untuk menghindari limitasi Instagram.')
      return
    }
    setScheduleErr('')
    setSavingSchedule(true)
    await AiContentService.update(scheduleTarget.id, { status: 'scheduled', scheduled_at: dt.toISOString() })
    setSavingSchedule(false)
    setScheduleTarget(null)
    load()
  }

  const handleStatus = async (c: DBAiContent, status: DBAiContent['status']) => {
    await AiContentService.update(c.id, { status })
    load()
  }

  const handleDelete = async (id: string) => {
    await AiContentService.delete(id)
    setContents((prev) => prev.filter((c) => c.id !== id))
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', background: T.inset, border: `1px solid ${T.line}`, borderRadius: 8, color: T.txt, fontSize: 13, fontFamily: T.font, outline: 'none' }

  return (
    <div style={{ padding: 22, height: '100%', overflowY: 'auto', background: T.bgGrad }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: T.txt, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Wand2 size={22} color={T.sky} /> AI Content Engine
          </h1>
          <div style={{ fontSize: 13, color: T.dim, marginTop: 4 }}>Upload gambar, AI buatkan caption + hashtags, lalu jadwalkan & autopost ke channel terpilih (IG / Facebook / WordPress) via n8n.</div>
        </div>
        <Btn v="ghost" size="sm" icon="RefreshCw" onClick={load}>Refresh</Btn>
      </div>

      {/* Generator */}
      <Panel pad={18} style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Sparkles size={16} color={T.sky} />
          <span style={{ fontSize: 13, fontWeight: 700, color: T.txt }}>Generate Konten Baru</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.dim, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Topik / Brief</label>
            <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Mis. Tips memilih material lantai untuk rumah tropis" />
          </div>

          {/* Upload gambar (wajib) — dianalisa AI untuk bikin caption */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.dim, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Gambar Konten (wajib)</label>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => onPickFile(e.target.files?.[0] || null)} />
            {previewUrl ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ position: 'relative', width: 96, height: 96, borderRadius: 8, overflow: 'hidden', border: `1px solid ${T.line}`, flexShrink: 0 }}>
                  <img src={previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ fontSize: 12, color: T.txt, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file?.name}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => fileRef.current?.click()} style={{ padding: '6px 12px', background: T.inset, color: T.sky, border: `1px solid ${T.line}`, borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Ganti</button>
                    <button onClick={() => { onPickFile(null); if (fileRef.current) fileRef.current.value = '' }} style={{ padding: '6px 12px', background: 'transparent', color: T.dim, border: `1px solid ${T.line}`, borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Hapus</button>
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '18px', background: T.inset, border: `1.5px dashed ${T.line}`, borderRadius: 8, color: T.dim, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                <UploadIcon size={16} /> Pilih gambar untuk dianalisa AI
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 220px' }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: T.dim, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Platform Tujuan</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[['instagram', 'Instagram'], ['facebook', 'Facebook'], ['wordpress', 'WordPress']].map(([v, l]) => (
                  <button key={v} type="button" onClick={() => setPlatform(v)} style={{ flex: 1, padding: '9px 6px', borderRadius: 7, border: `1px solid ${platform === v ? T.sky : T.line}`, background: platform === v ? 'rgba(74,179,216,0.14)' : T.inset, color: platform === v ? T.sky : T.dim, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: T.font }}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: T.dim, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Tone / Gaya</label>
              <input style={inputStyle} value={tone} onChange={(e) => setTone(e.target.value)} placeholder="Profesional & inspiratif" />
            </div>
            <button onClick={handleGenerate} disabled={generating || !topic.trim() || !file} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', background: T.sky, color: '#03203a', borderRadius: 9, border: 'none', fontWeight: 700, fontSize: 13, cursor: (generating || !file) ? 'not-allowed' : 'pointer', opacity: (generating || !topic.trim() || !file) ? 0.6 : 1 }}>
              {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {generating ? 'Generating...' : 'Generate'}
            </button>
          </div>
          {err && <div style={{ fontSize: 12, color: T.red, lineHeight: 1.5 }}>{err}</div>}
          <div style={{ fontSize: 10.5, color: T.dim, lineHeight: 1.5 }}>
            Autopost ke Instagram/Facebook (Meta Business) &amp; WordPress, serta penghematan token, diatur di workflow n8n (endpoint <span style={{ fontFamily: T.mono }}>/generate-content</span>) — set Webhook di Pengaturan → Integrasi. Caption &amp; gambar dibuat sekali lalu dipakai ulang untuk semua channel agar tidak boros token.
          </div>
        </div>
      </Panel>

      {/* Content gallery */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center' }}><Loader2 size={24} className="animate-spin" style={{ color: T.sky }} /></div>
      ) : contents.length === 0 ? (
        <Panel pad={40}>
          <div style={{ textAlign: 'center', color: T.dim, fontSize: 13 }}>
            <ImageIcon size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            Belum ada konten. Generate konten pertama di atas.
          </div>
        </Panel>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {contents.map((c) => {
            const st = STATUS[c.status] || STATUS.draft
            return (
              <Panel key={c.id} style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Image */}
                <div style={{ position: 'relative' }}>
                  <ContentImage url={c.image_url} />
                  <span style={{ position: 'absolute', top: 10, left: 10, fontSize: 9, fontWeight: 900, textTransform: 'uppercase', padding: '3px 9px', borderRadius: 999, background: `${st.color}dd`, color: '#fff', zIndex: 2 }}>{st.label}</span>
                </div>
                {/* Body */}
                <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                  {c.topic && <div style={{ fontSize: 10, color: T.dim, textTransform: 'uppercase', letterSpacing: 0.5 }}>{c.topic}</div>}
                  <div style={{ fontSize: 12.5, color: T.txt, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.caption || '—'}</div>
                  {c.hashtags && <div style={{ fontSize: 11, color: T.sky, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.hashtags}</div>}
                  {c.scheduled_at && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: T.amber }}>
                      <Calendar size={12} /> {new Date(c.scheduled_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 6, marginTop: 'auto', paddingTop: 8, borderTop: `1px solid ${T.line}` }}>
                    {c.status === 'draft' && (
                      <button onClick={() => handleSchedule(c)} title="Jadwalkan" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px', background: `${T.amber}18`, color: T.amber, border: `1px solid ${T.amber}44`, borderRadius: 7, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
                        <Calendar size={13} /> Jadwalkan
                      </button>
                    )}
                    {c.status === 'scheduled' && (
                      <button onClick={() => handleStatus(c, 'draft')} title="Batalkan jadwal" style={{ flex: 1, padding: '7px', background: T.inset, color: T.dim, border: `1px solid ${T.line}`, borderRadius: 7, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
                        Batal Jadwal
                      </button>
                    )}
                    {c.image_url && (
                      <a href={c.image_url} target="_blank" rel="noopener noreferrer" title="Buka gambar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '7px 10px', background: T.inset, color: T.sky, border: `1px solid ${T.line}`, borderRadius: 7, textDecoration: 'none' }}>
                        <ImageIcon size={13} />
                      </a>
                    )}
                    <button onClick={() => handleDelete(c.id)} title="Hapus" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '7px 10px', background: 'transparent', color: T.dim, border: `1px solid ${T.line}`, borderRadius: 7, cursor: 'pointer' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = T.red)} onMouseLeave={(e) => (e.currentTarget.style.color = T.dim)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </Panel>
            )
          })}
        </div>
      )}

      {/* Modal Jadwalkan */}
      {scheduleTarget && (
        <div
          onClick={() => !savingSchedule && setScheduleTarget(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 380, background: T.panel, border: `1px solid ${T.line}`, borderRadius: 16, padding: 22, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: `${T.amber}1e`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={17} color={T.amber} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: T.txt }}>Jadwalkan Posting</div>
              </div>
              <button onClick={() => !savingSchedule && setScheduleTarget(null)} style={{ background: 'transparent', border: 'none', color: T.dim, cursor: 'pointer', padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: 12, color: T.dim, lineHeight: 1.5, marginBottom: 14 }}>
              Pilih tanggal & jam posting. Konten otomatis ter-post ke channel terpilih (IG / Facebook / WordPress) saat waktunya tiba.
            </div>

            <label style={{ fontSize: 11, fontWeight: 700, color: T.dim, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
              <Clock size={12} /> Tanggal & Jam
            </label>
            <input
              type="datetime-local"
              value={scheduleValue}
              min={toLocalInput(new Date(Date.now() + MIN_LEAD_MS))}
              onChange={(e) => { setScheduleValue(e.target.value); setScheduleErr('') }}
              style={{ width: '100%', padding: '11px 12px', background: T.inset, border: `1px solid ${scheduleErr ? T.red : T.line}`, borderRadius: 9, color: T.txt, fontSize: 14, fontFamily: T.font, outline: 'none', colorScheme: 'dark' }}
            />

            {scheduleErr ? (
              <div style={{ marginTop: 10, fontSize: 12, color: T.red, lineHeight: 1.45 }}>{scheduleErr}</div>
            ) : scheduleValue && (
              <div style={{ marginTop: 10, fontSize: 12, color: T.sky, fontWeight: 600 }}>
                {new Date(scheduleValue).toLocaleString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB
              </div>
            )}

            <div style={{ display: 'flex', gap: 9, marginTop: 20 }}>
              <button onClick={() => setScheduleTarget(null)} disabled={savingSchedule} style={{ flex: 1, padding: '11px', background: T.inset, color: T.dim, border: `1px solid ${T.line}`, borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                Batal
              </button>
              <button onClick={confirmSchedule} disabled={savingSchedule || !scheduleValue} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px', background: T.amber, color: '#3a2a03', border: 'none', borderRadius: 9, fontWeight: 800, fontSize: 13, cursor: savingSchedule ? 'not-allowed' : 'pointer', opacity: (savingSchedule || !scheduleValue) ? 0.6 : 1 }}>
                {savingSchedule ? <Loader2 size={15} className="animate-spin" /> : <Calendar size={15} />}
                {savingSchedule ? 'Menyimpan...' : 'Jadwalkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIContentEngine
