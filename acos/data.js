/* ACOS — Data layer. Real Sudut Ruang Arsitek company data + realistic operational seed. */
(function () {
  const fmtRp = (n) => {
    if (n == null) return "—";
    if (n >= 1e9) return `Rp ${(n / 1e9).toFixed(n % 1e9 === 0 ? 0 : 1)} M`;
    if (n >= 1e6) return `Rp ${(n / 1e6).toFixed(0)} jt`;
    return `Rp ${n.toLocaleString("id-ID")}`;
  };
  const fmtRpFull = (n) => `Rp ${Number(n).toLocaleString("id-ID")}`;

  // ── COMPANY ────────────────────────────────────────────
  const company = {
    brand: "Sudut Ruang Arsitek",
    legal: "CV. Sudut Ruang Archineering",
    tagline: "Designing Corners · Defining Spaces",
    city: "Surabaya, Jawa Timur",
    web: "sudutruang.com",
    phone: "+62 851-7700-0990",
    email: "admin@sudutruang.com",
    nib: "2802260010569",
  };

  const team = [
    { name: "M. Habib Arrohman I.", role: "Principal Architect · CEO", initials: "HA", color: "#4AB3D8" },
    { name: "Patricia Soebakrie", role: "Interior Designer", initials: "PS", color: "#1E7FB8" },
    { name: "Rasia Maharani", role: "Lighting Specialist", initials: "RM", color: "#045D93" },
    { name: "Raden Maldini", role: "Specialized Design Areas", initials: "RM", color: "#0A3863" },
    { name: "Syifa (AI Agent)", role: "Auto Estimator · AI", initials: "AI", color: "#8FD0E8", bot: true },
  ];

  // ── PRICING (from Rate Biaya 2026) ─────────────────────
  const designFees = [
    { service: "Arsitektur — Standar", perM2: 75000, percent: 0.07, fit: "Type 36–70, < 100 m²" },
    { service: "Arsitektur — Menengah", perM2: 100000, percent: 0.05, fit: "Type 70–150, villa" },
    { service: "Arsitektur — Premium", perM2: 200000, percent: 0.04, fit: "Luxury, > 150 m²" },
    { service: "Interior — Menengah", perM2: 100000, percent: 0.05, fit: "Full unit + 3D render" },
    { service: "Komersial (Cafe/Resto)", perM2: 200000, percent: 0.04, fit: "Full concept + branding" },
    { service: "Lansekap — Premium", perM2: 100000, percent: 0.05, fit: "Villa, resort" },
  ];
  const ppn = 0.11;

  // ── PIPELINE STAGES (the ACOS canonical flow) ──────────
  const FLOW = [
    { key: "lead", label: "Lead", icon: "Inbox", sub: "WA / IG / Web masuk" },
    { key: "crm", label: "CRM", icon: "Users", sub: "Kualifikasi + simpan" },
    { key: "ai", label: "AI Agent", icon: "Bot", sub: "Syifa balas + skor" },
    { key: "estimate", label: "Estimasi", icon: "Calculator", sub: "RAB + fee otomatis" },
    { key: "proposal", label: "Proposal", icon: "FileText", sub: "Generate branded" },
    { key: "spk", label: "SPK", icon: "FileCheck", sub: "Kontrak + e-sign" },
    { key: "invoice", label: "Invoice", icon: "Receipt", sub: "Termin 30/30/30/10" },
    { key: "payment", label: "Payment", icon: "CreditCard", sub: "Konfirmasi + rekon" },
    { key: "project", label: "Project", icon: "Kanban", sub: "Eksekusi 4 termin" },
    { key: "portfolio", label: "Portfolio", icon: "Award", sub: "Publish + studi kasus" },
  ];

  // ── LEADS / CRM ────────────────────────────────────────
  const leads = [
    { id: "L-2041", name: "Budi Santoso", channel: "WhatsApp", project: "Rumah 2 Lantai", loc: "BSD, Tangerang", area: 150, value: 900e6, fee: 45e6, score: 94, stage: "proposal", status: "hot", handler: "AI", last: "5 mnt", prob: 88, msgs: 7 },
    { id: "L-2042", name: "Rina Kusuma", channel: "Instagram", project: "Kafe Industrial", loc: "Jakarta Selatan", area: 120, value: 720e6, fee: 28.8e6, score: 87, stage: "estimate", status: "hot", handler: "AI", last: "12 mnt", prob: 82, msgs: 12 },
    { id: "L-2043", name: "Pak Darmawan", channel: "WhatsApp", project: "Villa Pantai", loc: "Anyer, Banten", area: 300, value: 3.0e9, fee: 120e6, score: 72, stage: "ai", status: "warm", handler: "AI", last: "1 jam", prob: 64, msgs: 4 },
    { id: "L-2044", name: "CV Mitra Bangun", channel: "Tender", project: "Gedung Kantor 3 Lt", loc: "Surabaya", area: 500, value: 2.5e9, fee: 100e6, score: 91, stage: "spk", status: "hot", handler: "Human", last: "3 jam", prob: 91, msgs: 18 },
    { id: "L-2045", name: "Ibu Sandra Halim", channel: "Referral", project: "Resort Tropis", loc: "Labuan Bajo", area: 800, value: 8.0e9, fee: 320e6, score: 78, stage: "crm", status: "warm", handler: "AI", last: "6 jam", prob: 55, msgs: 3 },
    { id: "L-2046", name: "Anton Wijaya", channel: "Website", project: "Renovasi Interior", loc: "Surabaya", area: 80, value: 320e6, fee: 16e6, score: 61, stage: "lead", status: "cold", handler: "AI", last: "1 hari", prob: 30, msgs: 1 },
    { id: "L-2047", name: "PT Graha Sukses", channel: "WhatsApp", project: "Ruko 4 Lantai", loc: "Sidoarjo", area: 420, value: 2.1e9, fee: 84e6, score: 83, stage: "estimate", status: "warm", handler: "AI", last: "2 jam", prob: 60, msgs: 9 },
    { id: "L-2048", name: "Dr. Lavana", channel: "Instagram", project: "Skin Clinic", loc: "Surabaya", area: 200, value: 1.4e9, fee: 56e6, score: 89, stage: "proposal", status: "hot", handler: "Human", last: "40 mnt", prob: 85, msgs: 15 },
  ];
  const CRM_COLS = [
    { key: "lead", label: "New Lead", color: "#6E8AA3" },
    { key: "crm", label: "Qualified", color: "#4AB3D8" },
    { key: "ai", label: "Engaged (AI)", color: "#1E7FB8" },
    { key: "estimate", label: "Estimating", color: "#8FD0E8" },
    { key: "proposal", label: "Proposal Sent", color: "#045D93" },
    { key: "spk", label: "Closing", color: "#34D399" },
  ];

  // ── PROJECTS (real Sudut Ruang portfolio names) ────────
  const projects = [
    { id: "PRJ-0142", name: "Minister's House — IKN", client: "Kementerian / IKN", scope: "Design & Build", loc: "IKN, Kaltim", value: 8.4e9, stage: "Design Dev", termin: 3, progress: 68, risk: "med", due: "30 Sep 2026", lead: "HA" },
    { id: "PRJ-0151", name: "Ubud Villa", client: "Private — Bali", scope: "Architecture", loc: "Ubud, Bali", value: 3.2e9, stage: "Construction", termin: 4, progress: 82, risk: "low", due: "12 Aug 2026", lead: "HA" },
    { id: "PRJ-0156", name: "Mr. Steve House — Japandi", client: "Mr. Steve", scope: "DED", loc: "Surabaya", value: 1.1e9, stage: "Schematic", termin: 2, progress: 41, risk: "low", due: "20 Oct 2026", lead: "PS" },
    { id: "PRJ-0159", name: "Kyoto Gion Coffee", client: "Gion F&B", scope: "DED + Interior", loc: "Bogor", value: 1.4e9, stage: "Design Dev", termin: 3, progress: 55, risk: "med", due: "05 Sep 2026", lead: "PS" },
    { id: "PRJ-0163", name: "Lavana Skin Clinic", client: "Dr. Lavana", scope: "Arch / Interior", loc: "Surabaya", value: 1.4e9, stage: "Proposal", termin: 1, progress: 12, risk: "low", due: "28 Aug 2026", lead: "RM" },
    { id: "PRJ-0148", name: "Royal Palace — Lounge & Spa", client: "Royal Group", scope: "DED Reno + Interior", loc: "Bali", value: 2.6e9, stage: "Final Docs", termin: 4, progress: 94, risk: "high", due: "18 Jun 2026", lead: "HA" },
    { id: "PRJ-0167", name: "Clubhouse in Bali", client: "Bali Estate", scope: "DED", loc: "Bali", value: 2.0e9, stage: "Schematic", termin: 2, progress: 33, risk: "med", due: "15 Nov 2026", lead: "RD" },
    { id: "PRJ-0170", name: "Lisa House Surabaya", client: "Ibu Lisa", scope: "DED", loc: "Surabaya", value: 980e6, stage: "Design Dev", termin: 3, progress: 60, risk: "low", due: "22 Sep 2026", lead: "PS" },
  ];
  const PRJ_STAGES = ["Proposal", "Schematic", "Design Dev", "Final Docs", "Construction"];

  // ── FINANCE / INVOICES (termin model) ──────────────────
  const invoices = [
    { no: "INV-061/VI/2026", project: "Royal Palace — Lounge & Spa", client: "Royal Group", termin: "Termin 4 · 10%", amount: 260e6, status: "overdue", age: "+12 hari", method: "Transfer" },
    { no: "INV-059/VI/2026", project: "Minister's House — IKN", client: "Kementerian / IKN", termin: "Termin 3 · 30%", amount: 2.52e9, status: "due", age: "5 hari lagi", method: "Transfer" },
    { no: "INV-058/V/2026", project: "Ubud Villa", client: "Private — Bali", termin: "Termin 4 · 10%", amount: 320e6, status: "paid", age: "Lunas", method: "Transfer" },
    { no: "INV-057/V/2026", project: "Kyoto Gion Coffee", client: "Gion F&B", termin: "Termin 3 · 30%", amount: 420e6, status: "due", age: "9 hari lagi", method: "QRIS" },
    { no: "INV-056/V/2026", project: "Lisa House Surabaya", client: "Ibu Lisa", termin: "Termin 2 · 30%", amount: 294e6, status: "paid", age: "Lunas", method: "Transfer" },
    { no: "INV-055/V/2026", project: "Lavana Skin Clinic", client: "Dr. Lavana", termin: "Termin 1 · 30%", amount: 168e6, status: "sent", age: "Terkirim", method: "—" },
  ];

  // ── n8n WORKFLOWS (the user's REAL instance) ───────────
  const workflows = [
    { id: "WF-0", name: "0 · Dashboard Message Handler", trigger: "Webhook", status: "active", runs24: 214, success: 99.5, avgMs: 380, lastRun: "8 dtk lalu", published: true, conns: 1,
      desc: "Routing pesan dari dashboard ACOS ke channel + log Supabase.",
      nodes: ["Webhook /dashboard-msg", "Switch channel", "WhatsApp Send", "Supabase: messages.insert", "Respond 200"] },
    { id: "WF-1", name: "1 · Incoming Message Handler (v3 + Memory)", trigger: "Webhook · WA", status: "active", runs24: 1280, success: 98.8, avgMs: 1240, lastRun: "12 dtk lalu", published: true, conns: 4,
      desc: "Pesan WA masuk → ambil memory percakapan → Groq LLM → balas + simpan.",
      nodes: ["Webhook /wa-incoming", "Supabase: get memory", "Groq llama-3.3-70b", "Lead scorer", "WhatsApp Reply", "Supabase: upsert lead+msg"] },
    { id: "WF-2", name: "2 · Auto Estimator (Syifa)", trigger: "Webhook · AI", status: "active", runs24: 96, success: 97.9, avgMs: 2100, lastRun: "3 mnt lalu", published: true, conns: 4,
      desc: "Hitung RAB & fee dari brief klien, susun balasan estimasi, simpan draft.",
      nodes: ["Webhook /estimate", "Parse brief", "Rate table lookup", "RAB + fee + PPN calc", "Groq compose reply", "Supabase: estimates.insert"] },
    { id: "WF-4", name: "4 · Supabase Sync Hub", trigger: "Schedule · 5m", status: "active", runs24: 288, success: 100, avgMs: 540, lastRun: "2 mnt lalu", published: true, conns: 1,
      desc: "Sinkronisasi dua arah: Supabase ↔ Google Sheet CRM + reconcile status.",
      nodes: ["Cron 5m", "Supabase: read deltas", "Google Sheets sync", "Reconcile status", "Emit events"] },
    { id: "WF-6", name: "6 · Toggle Mode (AI ↔ Manual)", trigger: "Webhook", status: "active", runs24: 34, success: 100, avgMs: 210, lastRun: "22 mnt lalu", published: true, conns: 1,
      desc: "Alihkan penanganan percakapan antara AI (Syifa) dan staf manusia.",
      nodes: ["Webhook /toggle", "Update conversation.mode", "Notify staff"] },
    { id: "WF-PING", name: "WF-Ping (Health Check)", trigger: "Schedule · 1m", status: "active", runs24: 1440, success: 100, avgMs: 90, lastRun: "31 dtk lalu", published: true, conns: 0,
      desc: "Heartbeat tiap menit — pantau uptime seluruh workflow & alert bila gagal.",
      nodes: ["Cron 1m", "Ping endpoints", "Assert healthy", "Alert on fail"] },
  ];

  // live automation event feed
  const autoFeed = [
    { t: "Baru saja", wf: "WF-1", msg: "Lead L-2041 (Budi S.) skor 94 — auto-tag HOT", kind: "ok" },
    { t: "12 dtk", wf: "WF-1", msg: "Balasan AI terkirim ke +62 811·· (WhatsApp)", kind: "ok" },
    { t: "3 mnt", wf: "WF-2", msg: "Estimasi RAB Rp 720 jt dibuat untuk Rina K.", kind: "ok" },
    { t: "8 mnt", wf: "WF-4", msg: "Supabase ↔ Sheet tersinkron · 14 baris", kind: "ok" },
    { t: "16 mnt", wf: "WF-2", msg: "Retry 1× — Groq timeout, berhasil pada percobaan ke-2", kind: "warn" },
    { t: "22 mnt", wf: "WF-6", msg: "Percakapan Dr. Lavana dialihkan ke Human", kind: "info" },
    { t: "41 mnt", wf: "WF-1", msg: "Memory window dipangkas (>20 turn) untuk L-2043", kind: "info" },
  ];

  // ── KPIs / ANALYTICS ───────────────────────────────────
  const kpis = {
    pipelineValue: 18.66e9,
    activeProjects: 8,
    monthRevenue: 3.84e9,
    arOutstanding: 3.2e9,
    leadsMonth: 64,
    winRate: 38,
    avgFee: 6.2, // %
    aiHandled: 86, // %
    avgResponse: 1.2, // mins
    docsAuto: 142,
  };
  // 12-week pipeline trend (value in M)
  const trend = [6.2, 7.1, 6.8, 8.4, 9.0, 8.2, 10.1, 11.4, 10.8, 12.6, 14.2, 18.66];
  const revenueBars = [
    { m: "Jan", v: 2.1 }, { m: "Feb", v: 2.8 }, { m: "Mar", v: 2.4 }, { m: "Apr", v: 3.3 },
    { m: "Mei", v: 3.0 }, { m: "Jun", v: 3.84 },
  ];
  const channelSplit = [
    { label: "WhatsApp", v: 52, color: "#34D399" },
    { label: "Instagram", v: 24, color: "#4AB3D8" },
    { label: "Referral", v: 14, color: "#1E7FB8" },
    { label: "Website", v: 6, color: "#8FD0E8" },
    { label: "Tender", v: 4, color: "#045D93" },
  ];
  const funnel = [
    { label: "Lead Masuk", v: 64 },
    { label: "Qualified", v: 41 },
    { label: "Estimasi", v: 29 },
    { label: "Proposal", v: 18 },
    { label: "SPK / Closing", v: 9 },
  ];

  // ── DATABASE SCHEMA (Blueprint) ────────────────────────
  const schema = [
    { name: "clients", icon: "Users", color: "#4AB3D8", desc: "Master data klien — single source of truth.",
      cols: [["id", "uuid PK"], ["name", "text"], ["company", "text"], ["phone", "text"], ["email", "text"], ["segment", "enum"], ["created_at", "timestamptz"]] },
    { name: "leads", icon: "Inbox", color: "#8FD0E8", desc: "Inbound lead + skor AI + tahap pipeline.",
      cols: [["id", "uuid PK"], ["client_id", "fk→clients"], ["channel", "enum"], ["score", "int"], ["stage", "enum"], ["prob", "int"], ["owner", "fk→users"]] },
    { name: "conversations", icon: "MessageSquare", color: "#1E7FB8", desc: "Thread WA/IG + mode AI/Manual + memory.",
      cols: [["id", "uuid PK"], ["lead_id", "fk→leads"], ["mode", "enum ai|manual"], ["memory", "jsonb"], ["updated_at", "timestamptz"]] },
    { name: "estimates", icon: "Calculator", color: "#045D93", desc: "RAB + fee + PPN dari Auto Estimator.",
      cols: [["id", "uuid PK"], ["lead_id", "fk→leads"], ["area_m2", "numeric"], ["rab", "bigint"], ["fee_pct", "numeric"], ["total", "bigint"]] },
    { name: "proposals", icon: "FileText", color: "#4AB3D8", desc: "Proposal terbit + status approval.",
      cols: [["id", "uuid PK"], ["estimate_id", "fk→estimates"], ["no", "text"], ["status", "enum"], ["pdf_url", "text"], ["valid_until", "date"]] },
    { name: "spk", icon: "FileCheck", color: "#34D399", desc: "Surat Perjanjian Kerja + e-signature.",
      cols: [["id", "uuid PK"], ["proposal_id", "fk→proposals"], ["no", "text"], ["signed_at", "timestamptz"], ["pasal", "jsonb"]] },
    { name: "invoices", icon: "Receipt", color: "#1E7FB8", desc: "Invoice per termin (30/30/30/10).",
      cols: [["id", "uuid PK"], ["spk_id", "fk→spk"], ["termin", "int"], ["amount", "bigint"], ["status", "enum"], ["due_date", "date"]] },
    { name: "payments", icon: "CreditCard", color: "#045D93", desc: "Konfirmasi bayar + rekonsiliasi.",
      cols: [["id", "uuid PK"], ["invoice_id", "fk→invoices"], ["paid_amount", "bigint"], ["method", "enum"], ["paid_at", "timestamptz"]] },
    { name: "projects", icon: "Kanban", color: "#4AB3D8", desc: "Proyek aktif + tahap + progress.",
      cols: [["id", "uuid PK"], ["client_id", "fk→clients"], ["spk_id", "fk→spk"], ["stage", "enum"], ["progress", "int"], ["due_date", "date"]] },
    { name: "tasks", icon: "CheckSquare", color: "#8FD0E8", desc: "Task & milestone per proyek.",
      cols: [["id", "uuid PK"], ["project_id", "fk→projects"], ["title", "text"], ["assignee", "fk→users"], ["status", "enum"], ["due", "date"]] },
    { name: "portfolio_items", icon: "Award", color: "#1E7FB8", desc: "Karya selesai → publish ke web.",
      cols: [["id", "uuid PK"], ["project_id", "fk→projects"], ["title", "text"], ["images", "jsonb"], ["published", "bool"]] },
    { name: "workflow_runs", icon: "Workflow", color: "#34D399", desc: "Log eksekusi n8n — observability.",
      cols: [["id", "uuid PK"], ["wf_id", "text"], ["status", "enum"], ["duration_ms", "int"], ["payload", "jsonb"], ["ran_at", "timestamptz"]] },
  ];

  // ── AUDIT FINDINGS (Blueprint) ─────────────────────────
  const audit = [
    { sev: "high", area: "Data Silo", title: "Modul berdiri sendiri", finding: "9 dari 17 menu masih placeholder; CRM, Project, Finance belum terhubung. Data lead diketik ulang di tiap tahap.", fix: "Satu sumber kebenaran di Supabase; semua modul membaca tabel yang sama." },
    { sev: "high", area: "Duplikasi Input", title: "Input data berulang", finding: "Nama, nilai, & detail klien diketik ulang di Estimator → Proposal → SPK → Invoice.", fix: "Entity reuse: client_id mengalir otomatis lintas dokumen via foreign key." },
    { sev: "high", area: "Observability", title: "n8n tak terpantau", finding: "6 workflow berjalan tanpa dashboard status, retry, atau alert terpusat.", fix: "Automation Center membaca workflow_runs realtime + health ping." },
    { sev: "med", area: "Handoff", title: "Transisi manual", finding: "Proposal disetujui → SPK & Invoice dibuat manual, rawan terlewat & telat.", fix: "Event-driven: 'proposal.approved' memicu SPK + invoice termin-1 otomatis." },
    { sev: "med", area: "Auth & Peran", title: "Tanpa role & audit trail", finding: "Login tunggal, tak ada hak akses per peran maupun jejak aktivitas.", fix: "RBAC (Owner/Architect/Finance/Staff) + activity_log per aksi." },
    { sev: "med", area: "Konsistensi", title: "Builder dokumen terpisah", finding: "Proposal/SPK/Invoice adalah HTML lepas dengan styling & data sendiri-sendiri.", fix: "Engine dokumen bersama menarik data dari tabel & template brand." },
    { sev: "low", area: "Skalabilitas", title: "State di memori klien", finding: "Data hidup di state React, hilang saat refresh; tak ada persistensi.", fix: "Postgres + Realtime subscriptions; cache di edge." },
  ];

  // ── ROADMAP ────────────────────────────────────────────
  const roadmap = [
    { phase: "MVP", tag: "Fase 1 · 0–3 bln", color: "#4AB3D8", goal: "Satukan data & otomatiskan alur inti.",
      items: ["Supabase schema + RLS", "Command Center + Automation Center live", "CRM ↔ Estimator ↔ Proposal terhubung", "n8n: WF-1, WF-2, WF-4 ke produksi", "Auth + RBAC dasar"] },
    { phase: "V2", tag: "Fase 2 · 3–6 bln", color: "#1E7FB8", goal: "Tutup loop sampai pembayaran & proyek.",
      items: ["SPK e-sign + Invoice termin otomatis", "Payment reconciliation + reminder WA", "Project board + task + timeline", "Realtime notifications", "Portfolio auto-publish"] },
    { phase: "Enterprise", tag: "Fase 3 · 6–12 bln", color: "#045D93", goal: "Skala, intelijen & multi-tim.",
      items: ["Analytics & forecasting AI", "Multi-branch & multi-currency", "Client portal + approval", "Audit log + compliance (PSN/Gov)", "Open API + marketplace integrasi"] },
  ];

  // ── CONVERSATIONS (WhatsApp transcripts handled by Syifa AI) ─
  const conversations = {
    "L-2041": {
      channel: "WhatsApp", number: "+62 811-2345-678", mode: "ai",
      msgs: [
        { from: "client", t: "09:12", text: "Halo, saya mau bangun rumah 2 lantai di BSD. Bisa minta info?" },
        { from: "ai", t: "09:12", text: "Halo Pak Budi, terima kasih sudah menghubungi Sudut Ruang Arsitek. Senang membantu mewujudkan rumah impian Anda. Boleh saya tahu perkiraan luas tanah & bangunannya?", meta: "intent: high · greet+qualify" },
        { from: "client", t: "09:15", text: "Tanah 200m², rencana bangunan sekitar 150m². Budget belum fix tapi serius." },
        { from: "ai", t: "09:15", text: "Baik Pak. Untuk rumah 2 lantai ±150 m² dengan kualitas menengah, kisaran nilai konstruksi sekitar Rp 900 jt, dengan design fee Rp 100rb/m² atau ~5%. Apakah Bapak ingin sekalian interiornya?", meta: "estimate drafted · RAB Rp 900 jt" },
        { from: "client", t: "09:18", text: "Arsitektur dulu aja. Lokasi di BSD Tangerang. Kapan bisa konsultasi?" },
        { from: "ai", t: "09:18", text: "Siap Pak Budi. Saya sudah catat: rumah 2 lantai, 150 m², BSD Tangerang, fokus arsitektur. Tim kami akan kirim proposal lengkap hari ini. Untuk jadwal konsultasi, apakah Kamis atau Jumat ini cocok?", meta: "lead scored 94 → HOT · stage→proposal" },
        { from: "client", t: "09:21", text: "Kamis siang boleh. Ditunggu proposalnya ya." },
      ],
      aiSummary: "Lead HOT (skor 94). Brief lengkap: rumah 2 lantai, 150 m², BSD, arsitektur menengah. Estimasi Rp 900 jt / fee Rp 45 jt sudah dibuat. Proposal otomatis di-generate; jadwal konsultasi Kamis. Tidak ada ambiguitas — aman dilanjutkan.",
      flags: [],
    },
    "L-2042": {
      channel: "Instagram", number: "@rina.kusuma", mode: "ai",
      msgs: [
        { from: "client", t: "14:02", text: "Halo kak, lihat portfolio kafe industrial kalian. Aku mau buka kafe juga." },
        { from: "ai", t: "14:02", text: "Halo Kak Rina, terima kasih. Kami senang bisa bantu konsep kafe Anda. Boleh tahu perkiraan luas ruang & lokasinya?", meta: "intent: high" },
        { from: "client", t: "14:09", text: "Sekitar 120m² di Jaksel. Konsep industrial mix japandi gitu." },
        { from: "ai", t: "14:10", text: "Menarik Kak. Untuk kafe komersial 120 m² konsep industrial-japandi, kisaran Rp 720 jt (Rp 200rb/m² · ~4% fee) sudah termasuk konsep + branding. Mau saya buatkan estimasi rinci?", meta: "estimate drafted · RAB Rp 720 jt" },
        { from: "client", t: "14:15", text: "Boleh kak, tapi aku masih bandingin sama vendor lain juga sih" },
        { from: "ai", t: "14:15", text: "Tentu Kak Rina, tidak masalah. Saya kirimkan estimasi & contoh karya kafe kami agar bisa jadi pertimbangan. Apakah ada referensi gambar yang Kakak suka?", meta: "objection handled · nurture" },
      ],
      aiSummary: "Lead HOT (skor 87) namun sedang membandingkan vendor. Brief: kafe 120 m², Jaksel, industrial-japandi. Estimasi Rp 720 jt dibuat. AI menangani objection dengan baik. Rekomendasi: follow-up manusia untuk closing.",
      flags: ["Sedang bandingkan kompetitor — pertimbangkan sentuhan personal"],
    },
    "L-2043": {
      channel: "WhatsApp", number: "+62 813-9988-771", mode: "ai",
      msgs: [
        { from: "client", t: "11:40", text: "Mau tanya villa di Anyer, sekalian sama kolam." },
        { from: "ai", t: "11:40", text: "Halo Pak, dengan senang hati. Untuk villa di Anyer, boleh tahu luas lahan & jumlah kamar yang diinginkan?", meta: "intent: medium" },
        { from: "client", t: "12:30", text: "300m an. nanti dulu deh masih mikir2" },
        { from: "ai", t: "12:30", text: "Baik Pak, tidak terburu-buru. Saya simpan datanya ya. Bila berkenan, saya bisa kirim beberapa referensi villa tropis kami sebagai inspirasi. Kapan saja Bapak siap, kami siap membantu.", meta: "low urgency · nurture mode" },
      ],
      aiSummary: "Lead WARM (skor 72). Brief belum lengkap (kamar belum disebut), klien masih menimbang. AI masuk mode nurture. Belum perlu intervensi.",
      flags: ["Brief belum lengkap — jumlah kamar & budget belum diketahui"],
    },
  };
  const defaultConvo = {
    channel: "WhatsApp", number: "+62 8xx-xxxx-xxxx", mode: "manual",
    msgs: [
      { from: "client", t: "—", text: "Percakapan belum dimulai untuk lead ini." },
    ],
    aiSummary: "Belum ada riwayat percakapan AI untuk lead ini.",
    flags: [],
  };

  // ── AI AGENT CONFIG (Syifa) — editable in Settings ─────
  const aiConfig = {
    name: "Syifa",
    model: "llama-3.3-70b-versatile",
    provider: "Groq",
    temperature: 0.4,
    maxTokens: 800,
    autoReply: true,
    workingHours: "08:00 – 21:00 WIB",
    escalateScoreBelow: 50,
    handoffKeywords: ["komplain", "bicara dengan orang", "manusia", "manager"],
    persona: "Profesional, hangat, dan tidak hard-sell. Mewakili studio (\"Kami\"), menyapa klien (\"Anda/Pak/Bu\"). Bahasa Indonesia formal-namun-ramah.",
    systemPrompt: "Anda adalah Syifa, asisten AI dari Sudut Ruang Arsitek (CV. Sudut Ruang Archineering), studio arsitektur & desain di Surabaya.\n\nTUGAS:\n1. Sapa klien dengan hangat dan profesional.\n2. Kualifikasi kebutuhan: jenis proyek, luas (m²), lokasi, dan ekspektasi budget.\n3. Berikan estimasi awal menggunakan rate 2026 (Standar Rp 75rb/m², Menengah Rp 100rb/m², Premium Rp 200rb/m²; komersial Rp 200rb/m²). Selalu sebut PPN 11% terpisah.\n4. Tawarkan langkah lanjut: proposal & jadwal konsultasi.\n5. Skor intensi lead 0–100 dan tandai HOT/WARM/COLD.\n\nGAYA: Premium, minimal, tidak berlebihan. Tanpa emoji. Maksimal 3 kalimat per balasan. Jangan pernah menjanjikan harga final — selalu \"kisaran/estimasi\".\n\nESKALASI: Bila klien minta bicara dengan manusia, komplain, atau skor < 50 setelah 3 pesan, alihkan ke staf (WF-6).",
  };

  // ── INTEGRATIONS ───────────────────────────────────────
  const integrations = [
    { key: "n8n", name: "n8n Automation", icon: "Workflow", status: "connected", color: "#34D399",
      fields: [["Instance URL", "n8n.srv1696073.hstgr.cloud"], ["Webhook Base", "/webhook/"], ["API Key", "n8n_api_••••••••••3f2a"], ["Health Interval", "60 detik"], ["Retry Policy", "3× exponential backoff"]] },
    { key: "groq", name: "Groq LLM", icon: "Sparkles", status: "connected", color: "#4AB3D8",
      fields: [["Model", "llama-3.3-70b-versatile"], ["API Key", "gsk_••••••••••7d10"], ["Rate Limit", "30 req/min"], ["Avg Latency", "1.2 detik"]] },
    { key: "supabase", name: "Supabase", icon: "Database", status: "connected", color: "#34D399",
      fields: [["Project URL", "srnxq••••.supabase.co"], ["Region", "ap-southeast-1 (Singapore)"], ["Service Key", "sb_••••••••••a91c"], ["Realtime", "Aktif · 13 tabel"]] },
    { key: "whatsapp", name: "WhatsApp Cloud API", icon: "MessageCircle", status: "connected", color: "#34D399",
      fields: [["Nomor Bisnis", "+62 851-7700-0990"], ["Phone Number ID", "1098••••••231"], ["Token", "EAAG••••••••••xZ"], ["Template Approved", "4 template"]] },
    { key: "instagram", name: "Instagram DM", icon: "Instagram", status: "connected", color: "#34D399",
      fields: [["Akun", "@sudutruang.arsitek"], ["Page ID", "1784••••••556"], ["Auto-reply", "Aktif via WF-1"]] },
    { key: "gsheet", name: "Google Sheets", icon: "Table", status: "warning", color: "#FBBF24",
      fields: [["Spreadsheet", "SudutRuang — CRM"], ["Sync", "Tiap 5 menit (WF-4)"], ["Status", "Token kadaluarsa 14 hari lagi"]] },
    { key: "payment", name: "Payment Gateway / QRIS", icon: "CreditCard", status: "disconnected", color: "#5F7C97",
      fields: [["Provider", "Belum terhubung"], ["Metode", "Transfer manual saat ini"], ["Rekomendasi", "Hubungkan Midtrans / Xendit (V2)"]] },
  ];

  window.ACOS_DATA = {
    fmtRp, fmtRpFull, company, team, designFees, ppn, FLOW,
    leads, CRM_COLS, projects, PRJ_STAGES, invoices, workflows, autoFeed,
    kpis, trend, revenueBars, channelSplit, funnel, schema, audit, roadmap,
    conversations, defaultConvo, aiConfig, integrations,
  };
})();
