import React, { useEffect, useRef, useState } from 'react'
import { T, Panel, Btn } from '../components/AcosUI'
import {
  FileText, Sparkles, Loader2, Calendar, Trash2, ExternalLink,
  Copy, Check, Clock, X, Send, Image as ImageIcon,
} from 'lucide-react'
import { supabase } from '../services/supabaseClient'

// ── Types ───────────────────────────────────────────────────
export interface DBArticle {
  id: string
  topic: string | null
  title: string | null
  content: string | null
  excerpt: string | null
  tags: string | null
  category: string | null
  featured_image_url: string | null
  platform: string
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  scheduled_at: string | null
  published_at: string | null
  publish_result: string | null
  wp_post_id: number | null
  created_at: string
  updated_at: string
}

// ── Supabase Service ────────────────────────────────────────
const ArticleService = {
  async getAll(): Promise<DBArticle[]> {
    const { data, error } = await supabase
      .from('ai_articles')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) { console.error('ai_articles getAll:', error); return [] }
    return data || []
  },
  async insert(row: Partial<DBArticle>) {
    const { data, error } = await supabase
      .from('ai_articles')
      .insert({ ...row, updated_at: new Date().toISOString() })
      .select().single()
    if (error) console.error('ai_articles insert:', error)
    return { data, error }
  },
  async update(id: string, patch: Partial<DBArticle>) {
    const { error } = await supabase
      .from('ai_articles')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) console.error('ai_articles update:', error)
    return { error }
  },
  async delete(id: string) {
    const { error } = await supabase.from('ai_articles').delete().eq('id', id)
    return { error }
  },
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: T.dim },
  scheduled: { label: 'Terjadwal', color: T.amber },
  published: { label: 'Published', color: T.green },
  failed: { label: 'Gagal', color: T.red },
}

// ── Component ───────────────────────────────────────────────
const ArticleGenerator = () => {
  const [articles, setArticles] = useState<DBArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [err, setErr] = useState('')
  const [copied, setCopied] = useState('')

  // Form
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState('Profesional, informatif, SEO-friendly')
  const [wordCount, setWordCount] = useState('800')
  const [category, setCategory] = useState('Arsitektur')

  // Image upload (featured image opsional)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const onPickFile = (f: File | null) => {
    setFile(f)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(f ? URL.createObjectURL(f) : '')
  }
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])

  // Preview modal
  const [preview, setPreview] = useState<DBArticle | null>(null)

  // Schedule modal
  const [scheduleTarget, setScheduleTarget] = useState<DBArticle | null>(null)
  const [scheduleValue, setScheduleValue] = useState('')
  const [savingSchedule, setSavingSchedule] = useState(false)
  const [scheduleErr, setScheduleErr] = useState('')

  const toLocalInput = (d: Date) => {
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    return local.toISOString().slice(0, 16)
  }
  const MIN_LEAD_MS = 5 * 60 * 1000

  const load = async () => { setLoading(true); setArticles(await ArticleService.getAll()); setLoading(false) }
  useEffect(() => { load() }, [])

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', background: T.inset, border: `1px solid ${T.line}`, borderRadius: 8, color: T.txt, fontSize: 13, fontFamily: T.font, outline: 'none' }

  const handleGenerate = async () => {
    if (!topic.trim() || generating) return
    setGenerating(true); setErr('')
    try {
      // Upload featured image jika ada (ke Cloudinary)
      let imageUrl = ''
      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', 'dashboard_uploads')
        formData.append('folder', 'articles')
        const cloudRes = await fetch('https://api.cloudinary.com/v1_1/dtfmjwofq/image/upload', { method: 'POST', body: formData })
        const cloudData = await cloudRes.json()
        if (!cloudData.secure_url) throw new Error('Upload gambar ke Cloudinary gagal.')
        imageUrl = cloudData.secure_url
      }

      let url = ''
      try { url = localStorage.getItem('n8n_article_url') || '' } catch { /* */ }
      if (!url) {
        const base = localStorage.getItem('n8n_base_url') || ''
        url = base ? `${base}/generate-article` : ''
      }
      if (!url) { setErr('Set URL n8n artikel di Pengaturan → Integrasi (n8n_article_url).'); setGenerating(false); return }

      const res = await fetch(url, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim(), tone, word_count: Number(wordCount) || 800, category, image_url: imageUrl }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const d = await res.json()

      await ArticleService.insert({
        topic: topic.trim(),
        title: d.title || topic.trim(),
        content: d.content || d.article || '',
        excerpt: d.excerpt || d.summary || '',
        tags: d.tags || d.keywords || '',
        category,
        featured_image_url: imageUrl || d.image_url || null,
        platform: 'wordpress',
        status: d.post_id || d.link ? 'published' : 'draft',
        published_at: d.post_id || d.link ? new Date().toISOString() : null,
        wp_post_id: d.post_id || null,
        publish_result: d.link || null,
      })
      setTopic('')
      onPickFile(null)
      if (fileRef.current) fileRef.current.value = ''
      load()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Gagal generate artikel.')
    }
    setGenerating(false)
  }

  const handlePublish = async (a: DBArticle) => {
    try {
      let url = ''
      try { url = localStorage.getItem('n8n_publish_article_url') || '' } catch { /* */ }
      if (!url) {
        const base = localStorage.getItem('n8n_base_url') || ''
        url = base ? `${base}/publish-article` : ''
      }
      if (!url) { setErr('Set URL n8n publish di Pengaturan → Integrasi.'); return }

      const res = await fetch(url, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: a.id, title: a.title, content: a.content, excerpt: a.excerpt, tags: a.tags, category: a.category, featured_image_url: a.featured_image_url }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const d = await res.json()
      await ArticleService.update(a.id, { status: 'published', published_at: new Date().toISOString(), wp_post_id: d.post_id || null, publish_result: JSON.stringify(d) })
      load()
    } catch (e) {
      await ArticleService.update(a.id, { status: 'failed', publish_result: e instanceof Error ? e.message : 'error' })
      load()
    }
  }

  const handleSchedule = (a: DBArticle) => {
    const base = a.scheduled_at ? new Date(a.scheduled_at) : new Date(Date.now() + MIN_LEAD_MS)
    setScheduleValue(toLocalInput(base)); setScheduleErr(''); setScheduleTarget(a)
  }
  const confirmSchedule = async () => {
    if (!scheduleTarget || !scheduleValue) return
    const dt = new Date(scheduleValue)
    if (isNaN(dt.getTime())) { setScheduleErr('Tanggal tidak valid.'); return }
    if (dt.getTime() < Date.now() + MIN_LEAD_MS) { setScheduleErr('Jadwal minimal 5 menit dari sekarang.'); return }
    setSavingSchedule(true)
    await ArticleService.update(scheduleTarget.id, { status: 'scheduled', scheduled_at: dt.toISOString() })
    setSavingSchedule(false); setScheduleTarget(null); load()
  }

  const handleDelete = async (id: string) => { await ArticleService.delete(id); setArticles((p) => p.filter((a) => a.id !== id)) }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(''), 2000)
  }

  return (
    <div style={{ padding: 22, height: '100%', overflowY: 'auto', background: T.bgGrad }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: T.txt, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={22} color={T.sky} /> Artikel & Blog Generator
          </h1>
          <div style={{ fontSize: 13, color: T.dim, marginTop: 4 }}>Generate artikel SEO-friendly via AI, lalu publish otomatis ke WordPress via n8n.</div>
        </div>
        <Btn v="ghost" size="sm" icon="RefreshCw" onClick={load}>Refresh</Btn>
      </div>

      {/* Generator Form */}
      <Panel pad={18} style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Sparkles size={16} color={T.sky} />
          <span style={{ fontSize: 13, fontWeight: 700, color: T.txt }}>Generate Artikel Baru</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.dim, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Topik / Judul Artikel</label>
            <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Mis. 10 Tips Desain Rumah Minimalis Modern untuk Lahan Sempit" />
          </div>
          {/* Featured Image (opsional) */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.dim, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Featured Image (opsional)</label>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => onPickFile(e.target.files?.[0] || null)} />
            {previewUrl ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ position: 'relative', width: 80, height: 56, borderRadius: 8, overflow: 'hidden', border: `1px solid ${T.line}`, flexShrink: 0 }}>
                  <img src={previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => fileRef.current?.click()} style={{ padding: '6px 12px', background: T.inset, color: T.sky, border: `1px solid ${T.line}`, borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Ganti</button>
                  <button onClick={() => { onPickFile(null); if (fileRef.current) fileRef.current.value = '' }} style={{ padding: '6px 12px', background: 'transparent', color: T.dim, border: `1px solid ${T.line}`, borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Hapus</button>
                </div>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: T.inset, border: `1.5px dashed ${T.line}`, borderRadius: 8, color: T.dim, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                <ImageIcon size={16} /> Pilih gambar untuk thumbnail blog
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 160px' }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: T.dim, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Kategori</label>
              <select style={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)}>
                {['Arsitektur', 'Interior', 'Landscape', 'Tips & Trik', 'Material', 'Renovasi', 'Smart Home'].map((c) => <option key={c} value={c} style={{ background: T.panel }}>{c}</option>)}
              </select>
            </div>
            <div style={{ flex: '1 1 100px' }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: T.dim, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Panjang (kata)</label>
              <input type="number" style={inputStyle} value={wordCount} onChange={(e) => setWordCount(e.target.value)} />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: T.dim, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Tone / Gaya</label>
              <input style={inputStyle} value={tone} onChange={(e) => setTone(e.target.value)} />
            </div>
            <button onClick={handleGenerate} disabled={generating || !topic.trim()} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', background: T.sky, color: '#03203a', borderRadius: 9, border: 'none', fontWeight: 700, fontSize: 13, cursor: generating ? 'not-allowed' : 'pointer', opacity: (generating || !topic.trim()) ? 0.6 : 1 }}>
              {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {generating ? 'Generating...' : 'Generate Artikel'}
            </button>
          </div>
          {err && <div style={{ fontSize: 12, color: T.red, lineHeight: 1.5 }}>{err}</div>}
        </div>
      </Panel>

      {/* Articles List */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center' }}><Loader2 size={24} className="animate-spin" style={{ color: T.sky }} /></div>
      ) : articles.length === 0 ? (
        <Panel pad={40}>
          <div style={{ textAlign: 'center', color: T.dim, fontSize: 13 }}>
            <FileText size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            Belum ada artikel. Generate artikel pertama di atas.
          </div>
        </Panel>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {articles.map((a) => {
            const st = STATUS_MAP[a.status] || STATUS_MAP.draft
            return (
              <Panel key={a.id} pad={14} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                {/* Left: content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 999, background: `${st.color}22`, color: st.color, border: `1px solid ${st.color}44` }}>{st.label}</span>
                    {a.category && <span style={{ fontSize: 10, color: T.dim, background: T.inset, padding: '2px 7px', borderRadius: 99 }}>{a.category}</span>}
                    <span style={{ fontSize: 10, color: T.dim, marginLeft: 'auto' }}>{new Date(a.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.txt, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title || a.topic || '—'}</div>
                  <div style={{ fontSize: 12, color: T.dim, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.excerpt || (a.content || '').slice(0, 200)}</div>
                  {a.tags && <div style={{ fontSize: 11, color: T.sky, marginTop: 4 }}>{a.tags}</div>}
                  {a.scheduled_at && <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: T.amber, marginTop: 4 }}><Calendar size={12} /> {new Date(a.scheduled_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>}
                </div>
                {/* Right: actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => setPreview(a)} title="Preview" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', background: `${T.sky}14`, color: T.sky, border: `1px solid ${T.sky}44`, borderRadius: 7, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
                    <ExternalLink size={12} /> Preview
                  </button>
                  {a.status === 'published' && a.publish_result && (
                    <a href={a.publish_result} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', background: `${T.green}14`, color: T.green, border: `1px solid ${T.green}44`, borderRadius: 7, textDecoration: 'none', fontSize: 11, fontWeight: 700 }}>
                      <ExternalLink size={12} /> Buka di WP
                    </a>
                  )}
                  {a.status === 'draft' && (
                    <>
                      <button onClick={() => handlePublish(a)} title="Publish sekarang" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', background: `${T.green}14`, color: T.green, border: `1px solid ${T.green}44`, borderRadius: 7, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
                        <Send size={12} /> Publish
                      </button>
                      <button onClick={() => handleSchedule(a)} title="Jadwalkan" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', background: `${T.amber}14`, color: T.amber, border: `1px solid ${T.amber}44`, borderRadius: 7, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
                        <Calendar size={12} /> Jadwal
                      </button>
                    </>
                  )}
                  {a.status === 'scheduled' && (
                    <button onClick={async () => { await ArticleService.update(a.id, { status: 'draft', scheduled_at: null }); load() }} style={{ padding: '6px 10px', background: T.inset, color: T.dim, border: `1px solid ${T.line}`, borderRadius: 7, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>Batal Jadwal</button>
                  )}
                  <button onClick={() => copyToClipboard(a.content || '', a.id)} title="Copy konten" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', background: T.inset, color: copied === a.id ? T.green : T.dim, border: `1px solid ${T.line}`, borderRadius: 7, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
                    {copied === a.id ? <Check size={12} /> : <Copy size={12} />} {copied === a.id ? 'Copied' : 'Copy'}
                  </button>
                  <button onClick={() => handleDelete(a.id)} title="Hapus" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 10px', background: 'transparent', color: T.dim, border: `1px solid ${T.line}`, borderRadius: 7, cursor: 'pointer' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = T.red)} onMouseLeave={(e) => (e.currentTarget.style.color = T.dim)}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </Panel>
            )
          })}
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div onClick={() => setPreview(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 700, maxHeight: '85vh', background: T.panel, border: `1px solid ${T.line}`, borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: T.txt }}>{preview.title}</div>
              <button onClick={() => setPreview(null)} style={{ background: 'transparent', border: 'none', color: T.dim, cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
              {preview.featured_image_url && <img src={preview.featured_image_url} alt="" style={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 10, marginBottom: 16 }} />}
              {preview.excerpt && <p style={{ fontSize: 13, color: T.bright, fontStyle: 'italic', marginBottom: 14, lineHeight: 1.6 }}>{preview.excerpt}</p>}
              <div style={{ fontSize: 13, color: T.txt, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{preview.content}</div>
              {preview.tags && <div style={{ marginTop: 16, fontSize: 12, color: T.sky }}>{preview.tags}</div>}
            </div>
            <div style={{ padding: '12px 20px', borderTop: `1px solid ${T.line}`, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => { copyToClipboard(preview.content || '', preview.id); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: T.inset, color: T.txt, border: `1px solid ${T.line}`, borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                {copied === preview.id ? <Check size={14} /> : <Copy size={14} />} {copied === preview.id ? 'Copied!' : 'Copy Artikel'}
              </button>
              {preview.status === 'draft' && (
                <button onClick={() => { handlePublish(preview); setPreview(null) }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: T.green, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                  <Send size={14} /> Publish ke WordPress
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {scheduleTarget && (
        <div onClick={() => !savingSchedule && setScheduleTarget(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 380, background: T.panel, border: `1px solid ${T.line}`, borderRadius: 16, padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: `${T.amber}1e`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Calendar size={17} color={T.amber} /></div>
                <div style={{ fontSize: 15, fontWeight: 800, color: T.txt }}>Jadwalkan Publish</div>
              </div>
              <button onClick={() => !savingSchedule && setScheduleTarget(null)} style={{ background: 'transparent', border: 'none', color: T.dim, cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ fontSize: 12, color: T.dim, marginBottom: 14 }}>Artikel akan otomatis dipublish ke WordPress saat waktunya tiba (via n8n scheduler).</div>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.dim, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}><Clock size={12} /> Tanggal & Jam</label>
            <input type="datetime-local" value={scheduleValue} min={toLocalInput(new Date(Date.now() + MIN_LEAD_MS))} onChange={(e) => { setScheduleValue(e.target.value); setScheduleErr('') }}
              style={{ width: '100%', padding: '11px 12px', background: T.inset, border: `1px solid ${scheduleErr ? T.red : T.line}`, borderRadius: 9, color: T.txt, fontSize: 14, fontFamily: T.font, outline: 'none', colorScheme: 'dark' }} />
            {scheduleErr && <div style={{ marginTop: 10, fontSize: 12, color: T.red }}>{scheduleErr}</div>}
            {!scheduleErr && scheduleValue && <div style={{ marginTop: 10, fontSize: 12, color: T.sky, fontWeight: 600 }}>{new Date(scheduleValue).toLocaleString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB</div>}
            <div style={{ display: 'flex', gap: 9, marginTop: 20 }}>
              <button onClick={() => setScheduleTarget(null)} disabled={savingSchedule} style={{ flex: 1, padding: '11px', background: T.inset, color: T.dim, border: `1px solid ${T.line}`, borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Batal</button>
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

export default ArticleGenerator
