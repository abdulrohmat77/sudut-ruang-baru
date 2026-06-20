import React, { useEffect, useRef, useState } from 'react'
import { T, Panel, Btn } from '../components/AcosUI'
import { FileText, Sparkles, Loader2, Trash2, ExternalLink, Image as ImageIcon } from 'lucide-react'
import { supabase } from '../services/supabaseClient'

export interface DBArticle {
  id: string; topic: string | null; title: string | null; content: string | null
  excerpt: string | null; tags: string | null; category: string | null
  featured_image_url: string | null; platform: string
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  scheduled_at: string | null; published_at: string | null
  publish_result: string | null; wp_post_id: number | null
  created_at: string; updated_at: string
}

const ArticleService = {
  async getAll(): Promise<DBArticle[]> {
    const { data, error } = await supabase.from('ai_articles').select('*').order('created_at', { ascending: false })
    if (error) { console.error('ai_articles:', error); return [] }
    return data || []
  },
  async insert(row: Partial<DBArticle>) {
    const { error } = await supabase.from('ai_articles').insert({ ...row, updated_at: new Date().toISOString() })
    if (error) console.error('ai_articles insert:', error)
    return { error }
  },
  async delete(id: string) { await supabase.from('ai_articles').delete().eq('id', id) },
}

const ArticleGenerator = () => {
  const [articles, setArticles] = useState<DBArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [err, setErr] = useState('')
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState('Profesional, informatif, SEO-friendly')
  const [wordCount, setWordCount] = useState('800')
  const [category, setCategory] = useState('Arsitektur')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const onPickFile = (f: File | null) => { setFile(f); if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(f ? URL.createObjectURL(f) : '') }
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])

  const load = async () => { setLoading(true); setArticles(await ArticleService.getAll()); setLoading(false) }
  useEffect(() => { load() }, [])

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', background: T.inset, border: `1px solid ${T.line}`, borderRadius: 8, color: T.txt, fontSize: 13, fontFamily: T.font, outline: 'none' }

  const handleGenerate = async () => {
    if (!topic.trim() || generating) return
    setGenerating(true); setErr('')
    try {
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
      if (!url) { const base = localStorage.getItem('n8n_base_url') || ''; url = base ? `${base}/generate-article` : '' }
      if (!url) { setErr('Set URL n8n artikel di Pengaturan → Integrasi.'); setGenerating(false); return }

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
        status: 'published',
        published_at: new Date().toISOString(),
        wp_post_id: d.post_id || d.id || null,
        publish_result: d.link || null,
      })
      setTopic(''); onPickFile(null); if (fileRef.current) fileRef.current.value = ''
      load()
    } catch (e) { setErr(e instanceof Error ? e.message : 'Gagal generate artikel.') }
    setGenerating(false)
  }

  const handleDelete = async (id: string) => { await ArticleService.delete(id); setArticles((p) => p.filter((a) => a.id !== id)) }

  return (
    <div style={{ padding: 22, height: '100%', overflowY: 'auto', background: T.bgGrad }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: T.txt, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={22} color={T.sky} /> Artikel & Blog Generator
          </h1>
          <div style={{ fontSize: 13, color: T.dim, marginTop: 4 }}>Generate artikel SEO → otomatis publish ke WordPress.</div>
        </div>
        <Btn v="ghost" size="sm" icon="RefreshCw" onClick={load}>Refresh</Btn>
      </div>

      <Panel pad={18} style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Sparkles size={16} color={T.sky} />
          <span style={{ fontSize: 13, fontWeight: 700, color: T.txt }}>Generate & Publish Artikel</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.dim, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Topik / Judul Artikel</label>
            <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Mis. 10 Tips Desain Rumah Minimalis Modern untuk Lahan Sempit" />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.dim, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Featured Image (opsional)</label>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => onPickFile(e.target.files?.[0] || null)} />
            {previewUrl ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 80, height: 56, borderRadius: 8, overflow: 'hidden', border: `1px solid ${T.line}`, flexShrink: 0 }}>
                  <img src={previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => fileRef.current?.click()} style={{ padding: '6px 12px', background: T.inset, color: T.sky, border: `1px solid ${T.line}`, borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Ganti</button>
                  <button onClick={() => { onPickFile(null); if (fileRef.current) fileRef.current.value = '' }} style={{ padding: '6px 12px', background: 'transparent', color: T.dim, border: `1px solid ${T.line}`, borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Hapus</button>
                </div>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: T.inset, border: `1.5px dashed ${T.line}`, borderRadius: 8, color: T.dim, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                <ImageIcon size={16} /> Pilih gambar thumbnail
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
              {generating ? 'Generating...' : 'Generate & Publish'}
            </button>
          </div>
          {err && <div style={{ fontSize: 12, color: T.red, lineHeight: 1.5 }}>{err}</div>}
        </div>
      </Panel>

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center' }}><Loader2 size={24} className="animate-spin" style={{ color: T.sky }} /></div>
      ) : articles.length === 0 ? (
        <Panel pad={40}><div style={{ textAlign: 'center', color: T.dim, fontSize: 13 }}><FileText size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />Belum ada artikel.</div></Panel>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {articles.map((a) => (
            <Panel key={a.id} pad={14} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 999, background: `${T.green}22`, color: T.green, border: `1px solid ${T.green}44` }}>Published</span>
                  {a.category && <span style={{ fontSize: 10, color: T.dim, background: T.inset, padding: '2px 7px', borderRadius: 99 }}>{a.category}</span>}
                  <span style={{ fontSize: 10, color: T.dim, marginLeft: 'auto' }}>{new Date(a.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.txt, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title || a.topic || '—'}</div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {a.publish_result && (
                  <a href={a.publish_result} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', background: `${T.green}14`, color: T.green, border: `1px solid ${T.green}44`, borderRadius: 7, textDecoration: 'none', fontSize: 11, fontWeight: 700 }}>
                    <ExternalLink size={13} /> Buka Artikel
                  </a>
                )}
                <button onClick={() => handleDelete(a.id)} title="Hapus" style={{ padding: '7px 10px', background: 'transparent', color: T.dim, border: `1px solid ${T.line}`, borderRadius: 7, cursor: 'pointer' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = T.red)} onMouseLeave={(e) => (e.currentTarget.style.color = T.dim)}>
                  <Trash2 size={13} />
                </button>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  )
}

export default ArticleGenerator
