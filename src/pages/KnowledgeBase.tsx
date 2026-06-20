import { useEffect, useState, useRef } from 'react'
import { T, Panel, PanelHead, Btn, Tag, Icon } from '../components/AcosUI'
import { AiSkillService, DBAiSkill } from '../services/supabaseClient'

/**
 * Knowledge Base — daftar skill AI (unlimited).
 * Setiap skill: judul + deskripsi + konten teks (opsional) + lampiran file (opsional).
 * File didukung: .docx, .pdf, .txt, .md (disimpan di Supabase Storage bucket "ai-skills").
 * Data dipakai sebagai referensi/konteks AI (bisa di-fetch oleh n8n / LLM agent).
 */

const ACCEPTED_FILE = '.md'
const MAX_FILE_BYTES = 25 * 1024 * 1024 // 25 MB

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 9, border: `1px solid ${T.line}`,
  background: T.inset, color: T.txt, fontSize: 13, outline: 'none', boxSizing: 'border-box',
  fontFamily: T.font,
}
const labelStyle: React.CSSProperties = {
  fontSize: 11, color: T.dim, fontWeight: 600, letterSpacing: 0.4,
  textTransform: 'uppercase', display: 'block', marginBottom: 5,
}

function fmtSize(n: number | null | undefined) {
  if (!n) return ''
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

function fileExt(name: string) {
  const m = name.match(/\.([a-z0-9]+)$/i)
  return m ? m[1].toLowerCase() : ''
}

const KnowledgeBase: React.FC = () => {
  const [skills, setSkills] = useState<DBAiSkill[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<DBAiSkill | null>(null)
  const [busy, setBusy] = useState(false)

  const [form, setForm] = useState({
    title: '', description: '', content: '', category: '', tags: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<string>('')
  const fileRef = useRef<HTMLInputElement>(null)

  // Bulk upload state
  const fileBulkRef = useRef<HTMLInputElement>(null)
  const [bulkBusy, setBulkBusy] = useState(false)
  const [bulkProgress, setBulkProgress] = useState<string>('')

  const load = () => {
    setLoading(true)
    AiSkillService.getAll(true).then((rows) => { setSkills(rows); setLoading(false) })
  }
  useEffect(load, [])

  const resetForm = () => {
    setForm({ title: '', description: '', content: '', category: '', tags: '' })
    setFile(null); setEditing(null); setUploadProgress('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const startEdit = (s: DBAiSkill) => {
    setEditing(s)
    setForm({
      title: s.title || '', description: s.description || '', content: s.content || '',
      category: s.category || '', tags: (s.tags || []).join(', '),
    })
    setFile(null); setUploadProgress('')
    setShowForm(true)
  }

  const submit = async () => {
    // Judul opsional. Kalau kosong + ada file → pakai nama file. Kalau dua-duanya kosong, pakai timestamp.
    let title = form.title.trim()
    if (!title && file) title = file.name.replace(/\.[^.]+$/, '')
    if (!title && editing?.file_name) title = editing.file_name.replace(/\.[^.]+$/, '')
    if (!title) title = `Skill ${new Date().toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}`
    setBusy(true)

    let file_url = editing?.file_url || null
    let file_name = editing?.file_name || null
    let file_type = editing?.file_type || null
    let file_size = editing?.file_size || null

    if (file) {
      if (file.size > MAX_FILE_BYTES) {
        alert(`Ukuran file maks ${fmtSize(MAX_FILE_BYTES)}`); setBusy(false); return
      }
      setUploadProgress('Mengunggah file...')
      const up = await AiSkillService.uploadFile(file)
      if (!up) { alert('Gagal mengunggah file. Cek koneksi & bucket "ai-skills".'); setBusy(false); return }
      file_url = up.publicUrl
      file_name = file.name
      file_type = fileExt(file.name)
      file_size = file.size
    }

    const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean)
    const payload = {
      title,
      description: form.description.trim() || null,
      content: form.content.trim() || null,
      category: form.category.trim() || null,
      tags,
      file_url, file_name, file_type, file_size,
    }

    if (editing) {
      await AiSkillService.update(editing.id, payload)
    } else {
      await AiSkillService.insert(payload)
    }
    setBusy(false); setShowForm(false); resetForm(); load()
  }

  const toggleActive = async (s: DBAiSkill) => {
    await AiSkillService.update(s.id, { is_active: !s.is_active })
    load()
  }

  const remove = async (s: DBAiSkill) => {
    if (!confirm(`Hapus skill "${s.title}"?`)) return
    await AiSkillService.remove(s.id)
    load()
  }

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setBulkBusy(true)
    let success = 0, failed = 0
    const failedFiles: string[] = []

    // Helper: baca teks file (untuk .md/.txt) supaya AI langsung bisa pakai isinya.
    const readAsText = (f: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const r = new FileReader()
        r.onload = () => resolve(typeof r.result === 'string' ? r.result : '')
        r.onerror = () => reject(r.error)
        r.readAsText(f)
      })

    const TEXT_EXT = new Set(['md', 'txt', 'rtf', 'csv', 'json'])

    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      setBulkProgress(`${i + 1}/${files.length} · ${f.name}`)
      if (f.size > MAX_FILE_BYTES) {
        failed++; failedFiles.push(`${f.name} (terlalu besar)`); continue
      }
      try {
        const ext = fileExt(f.name)
        // Coba baca teks kalau formatnya plain (md, txt, dll). Kalau gagal/format binary, biarkan kosong.
        let textContent: string | null = null
        if (TEXT_EXT.has(ext)) {
          try { textContent = (await readAsText(f)).trim() || null } catch { textContent = null }
        }

        const up = await AiSkillService.uploadFile(f)
        if (!up) { failed++; failedFiles.push(`${f.name} (upload gagal)`); continue }

        const titleFromName = f.name.replace(/\.[^.]+$/, '')
        const { error } = await AiSkillService.insert({
          title: titleFromName,
          content: textContent,
          file_url: up.publicUrl,
          file_name: f.name,
          file_type: ext,
          file_size: f.size,
        })
        if (error) { failed++; failedFiles.push(`${f.name} (DB error)`) } else success++
      } catch (err) {
        failed++; failedFiles.push(`${f.name} (error)`)
      }
    }
    setBulkBusy(false)
    setBulkProgress('')
    if (fileBulkRef.current) fileBulkRef.current.value = ''
    const msg = `Upload selesai: ${success} sukses${failed ? `, ${failed} gagal\n${failedFiles.join('\n')}` : ''}.`
    alert(msg)
    load()
  }

  const filtered = skills.filter((s) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      s.title.toLowerCase().includes(q) ||
      (s.description || '').toLowerCase().includes(q) ||
      (s.content || '').toLowerCase().includes(q) ||
      (s.category || '').toLowerCase().includes(q) ||
      (s.tags || []).some((t) => t.toLowerCase().includes(q))
    )
  })

  return (
    <div style={{ padding: 20, height: '100%', overflowY: 'auto', background: T.bgGrad }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: T.txt, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="BookOpen" size={22} color={T.sky} /> Knowledge AI
          </h1>
          <div style={{ fontSize: 13, color: T.dim, marginTop: 4 }}>
            Pusat skill AI — upload pengetahuan/SOP dalam format <code>.md</code>. Tanpa batas jumlah skill.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Btn icon="Upload" v="ghost" onClick={() => fileBulkRef.current?.click()} style={{ opacity: bulkBusy ? 0.6 : 1, pointerEvents: bulkBusy ? 'none' : 'auto' }}>
            {bulkBusy ? `Uploading… ${bulkProgress}` : 'Upload Bulk'}
          </Btn>
          <Btn icon="Plus" onClick={() => { resetForm(); setShowForm(true) }}>Tambah Skill</Btn>
        </div>
      </div>

      {/* Hidden input untuk bulk upload */}
      <input
        ref={fileBulkRef} type="file" multiple accept={ACCEPTED_FILE}
        onChange={handleBulkUpload}
        style={{ display: 'none' }}
      />

      {/* Search */}
      <Panel pad={12} style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="Search" size={16} color={T.dim} />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari skill, kategori, atau tag…"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: T.txt, fontSize: 13 }}
          />
          <Tag color={T.dim}>{filtered.length} / {skills.length}</Tag>
        </div>
      </Panel>

      {/* List */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: T.dim }}>Memuat skill…</div>
      ) : filtered.length === 0 ? (
        <Panel pad={40}>
          <div style={{ textAlign: 'center', color: T.dim, fontSize: 13 }}>
            {skills.length === 0 ? 'Belum ada skill. Klik "Tambah Skill" untuk mulai.' : 'Tidak ada skill yang cocok.'}
          </div>
        </Panel>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: 12 }}>
          {filtered.map((s) => (
            <Panel key={s.id} pad={16} style={{ opacity: s.is_active ? 1 : 0.55 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 8 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 800, color: T.txt }}>{s.title}</div>
                  {s.category && <div style={{ fontSize: 10.5, color: T.dim, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.category}</div>}
                </div>
                <Tag color={s.is_active ? T.green : T.dim}>{s.is_active ? 'Aktif' : 'Nonaktif'}</Tag>
              </div>

              {s.description && (
                <div style={{ fontSize: 12, color: T.sub, marginTop: 8, lineHeight: 1.45 }}>{s.description}</div>
              )}
              {s.content && (
                <div style={{ fontSize: 11.5, color: T.dim, marginTop: 8, lineHeight: 1.5, maxHeight: 70, overflow: 'hidden', position: 'relative' }}>
                  {s.content.length > 220 ? s.content.slice(0, 220) + '…' : s.content}
                </div>
              )}

              {(s.tags || []).length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
                  {(s.tags || []).map((t) => <Tag key={t} color={T.tint} style={{ fontSize: 9 }}>#{t}</Tag>)}
                </div>
              )}

              {s.file_url && (
                <a href={s.file_url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 10, padding: '7px 11px', borderRadius: 8, background: T.inset, border: `1px solid ${T.line}`, fontSize: 11.5, color: T.sky, textDecoration: 'none' }}>
                  <Icon name="FileText" size={14} color={T.sky} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{s.file_name || 'Lampiran'}</span>
                  <span style={{ color: T.dim, fontSize: 10 }}>{s.file_type?.toUpperCase()} · {fmtSize(s.file_size)}</span>
                </a>
              )}

              <div style={{ display: 'flex', gap: 6, marginTop: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <Btn v="ghost" size="sm" onClick={() => toggleActive(s)}>{s.is_active ? 'Nonaktifkan' : 'Aktifkan'}</Btn>
                <Btn v="ghost" size="sm" icon="Pencil" onClick={() => startEdit(s)}>Edit</Btn>
                <Btn v="ghost" size="sm" icon="Trash2" onClick={() => remove(s)}>Hapus</Btn>
              </div>
              <div style={{ fontSize: 10, color: T.dim, marginTop: 8, fontFamily: T.mono }}>
                {new Date(s.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                {s.created_by ? ` · ${s.created_by}` : ''}
              </div>
            </Panel>
          ))}
        </div>
      )}

      {/* Modal form */}
      {showForm && (
        <div onClick={() => !busy && setShowForm(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(0,0,0,0.55)', display: 'grid', placeItems: 'center', padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ width: 'min(620px, 100%)', maxHeight: '92vh', overflowY: 'auto', background: T.panel, border: `1px solid ${T.line}`, borderRadius: 14, padding: 20 }}>
            <PanelHead
              title={editing ? 'Edit Skill' : 'Tambah Skill'}
              sub="Boleh isi konten teks, lampiran file, atau dua-duanya"
              icon="BookOpen" accent={T.sky}
              right={<button onClick={() => !busy && setShowForm(false)} style={{ background: 'none', border: 'none', color: T.sub, fontSize: 22, cursor: 'pointer' }}>×</button>}
            />

            <div style={{ display: 'grid', gap: 12, padding: '14px 4px 4px' }}>
              <div>
                <label style={labelStyle}>Judul Skill <span style={{ opacity: 0.5, textTransform: 'none' }}>(opsional, auto dari nama file)</span></label>
                <input style={inputStyle} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Kosongkan untuk pakai nama file" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={labelStyle}>Kategori</label>
                  <input style={inputStyle} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Sales / Desain / SOP / dll" />
                </div>
                <div>
                  <label style={labelStyle}>Tag (pisah koma)</label>
                  <input style={inputStyle} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="closing, leads, premium" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Deskripsi Singkat</label>
                <input style={inputStyle} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ringkas isi skill ini" />
              </div>
              <div>
                <label style={labelStyle}>Konten / Instruksi</label>
                <textarea
                  value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Tulis isi skill / SOP / instruksi AI di sini. Boleh kosong jika cukup pakai file lampiran."
                  style={{ ...inputStyle, minHeight: 140, resize: 'vertical', fontFamily: T.font, lineHeight: 1.5 }}
                />
              </div>

              <div>
                <label style={labelStyle}>Lampiran File (opsional)</label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    ref={fileRef} type="file" accept={ACCEPTED_FILE}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f) }}
                    style={{ flex: 1, color: T.sub, fontSize: 12 }}
                  />
                  {file && (
                    <span style={{ fontSize: 11.5, color: T.sky, fontFamily: T.mono }}>{file.name} · {fmtSize(file.size)}</span>
                  )}
                  {editing?.file_url && !file && (
                    <span style={{ fontSize: 11, color: T.dim }}>Sudah ada file: {editing.file_name}</span>
                  )}
                </div>
                <div style={{ fontSize: 10.5, color: T.dim, marginTop: 6 }}>
                  Format yang didukung: <code>.md</code> · maks {fmtSize(MAX_FILE_BYTES)}.
                </div>
              </div>

              {uploadProgress && <div style={{ fontSize: 11.5, color: T.sky }}>{uploadProgress}</div>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
              <Btn v="ghost" onClick={() => !busy && setShowForm(false)}>Batal</Btn>
              <Btn onClick={submit}>{busy ? 'Menyimpan…' : (editing ? 'Update Skill' : 'Simpan Skill')}</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default KnowledgeBase
