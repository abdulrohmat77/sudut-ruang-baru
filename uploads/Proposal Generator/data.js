/* ============================================================
   Sudut Ruang Arsitek — Proposal OS
   Seed data (real company data + plausible proposal records)
   Plain JS — attaches everything to window.SRA
   ============================================================ */
(function () {
  const team = [
    { id: "habib", name: "M. Habib Arrohman I.", role: "Principal Architect", initials: "HA", color: "#043666" },
    { id: "patricia", name: "Patricia Soebakrie", role: "Interior Designer", initials: "PS", color: "#045D93" },
    { id: "rasia", name: "Rasia Maharani", role: "Lighting Specialist", initials: "RM", color: "#1E7FB8" },
    { id: "maldini", name: "Raden Maldini", role: "Specialized Design", initials: "RM", color: "#4AB3D8" },
    { id: "dewi", name: "Dewi Anjani", role: "Business Development", initials: "DA", color: "#0A3863" },
  ];

  const rupiah = (n) => {
    if (n >= 1e9) return "Rp " + (n / 1e9).toFixed(n % 1e9 === 0 ? 0 : 1) + " M";
    if (n >= 1e6) return "Rp " + (n / 1e6).toFixed(0) + " jt";
    return "Rp " + n.toLocaleString("id-ID");
  };

  const proposals = [
    { id: "p-manggo", title: "Manggo Villa — Design & Build", client: "PT Manggo Properti", type: "Design & Build", status: "Review", value: 1850000000, progress: 78, owner: "habib", updated: "2 jam lalu", folder: "Hospitality", tags: ["Villa", "Bali", "Premium"], deadline: "8 Jun 2026" },
    { id: "p-ikn-flats", title: "Hunian ASN Tahap II — IKN", client: "Otorita IKN", type: "Tender Pemerintah", status: "Submitted", value: 12400000000, progress: 100, owner: "dewi", updated: "Kemarin", folder: "Government", tags: ["IKN", "Tender", "Konstruksi"], deadline: "Terkirim" },
    { id: "p-lavana", title: "Lavana Skin Clinic — Interior", client: "Lavana Aesthetic", type: "Interior", status: "Won", value: 640000000, progress: 100, owner: "patricia", updated: "3 hari lalu", folder: "Commercial", tags: ["Klinik", "Interior"], deadline: "Menang" },
    { id: "p-ubud", title: "Ubud Villa — Architecture", client: "Bpk. Sutanto", type: "Arsitektur", status: "Draft", value: 980000000, progress: 34, owner: "habib", updated: "1 jam lalu", folder: "Residential", tags: ["Villa", "Ubud"], deadline: "12 Jun 2026" },
    { id: "p-kyoto", title: "Kyoto Gion Coffee — Bogor", client: "Gion F&B Group", type: "Design & Build", status: "Won", value: 720000000, progress: 100, owner: "patricia", updated: "1 minggu lalu", folder: "Commercial", tags: ["F&B", "Cafe"], deadline: "Menang" },
    { id: "p-lisa", title: "Lisa House Surabaya — DED", client: "Kel. Wibowo", type: "Arsitektur", status: "Review", value: 410000000, progress: 62, owner: "maldini", updated: "5 jam lalu", folder: "Residential", tags: ["Rumah", "DED"], deadline: "15 Jun 2026" },
    { id: "p-royal", title: "Royal Palace Lounge & Spa — Bali", client: "Royal Palace Group", type: "Interior", status: "Lost", value: 1300000000, progress: 100, owner: "patricia", updated: "2 minggu lalu", folder: "Hospitality", tags: ["Lounge", "Spa"], deadline: "Kalah" },
    { id: "p-clubhouse", title: "Clubhouse Bali — Design & Build", client: "Bali Estate Dev.", type: "Design & Build", status: "Draft", value: 2200000000, progress: 18, owner: "dewi", updated: "30 menit lalu", folder: "Hospitality", tags: ["Clubhouse", "Bali"], deadline: "20 Jun 2026" },
    { id: "p-afr", title: "AFR House Malang — DED", client: "Bpk. Firmansyah", type: "Arsitektur", status: "Submitted", value: 350000000, progress: 100, owner: "maldini", updated: "4 hari lalu", folder: "Residential", tags: ["Rumah", "Malang"], deadline: "Terkirim" },
    { id: "p-nuraga", title: "Nuraga Flats — CM Proposal", client: "Pemprov Jatim", type: "Manajemen Konstruksi", status: "Won", value: 8600000000, progress: 100, owner: "dewi", updated: "3 minggu lalu", folder: "Government", tags: ["Rusun", "CM"], deadline: "Menang" },
  ];

  const statusMeta = {
    Draft: { label: "Draft", color: "#5A6B76", bg: "#EDF1F4" },
    Review: { label: "Review", color: "#045D93", bg: "#E1F0F8" },
    Submitted: { label: "Submitted", color: "#1E7FB8", bg: "#E1F0F8" },
    Won: { label: "Won", color: "#1F8A5B", bg: "#E3F4EC" },
    Lost: { label: "Lost", color: "#B4452F", bg: "#FBEAE6" },
    Archived: { label: "Archived", color: "#A9B6BF", bg: "#F2F9FC" },
  };

  const templates = [
    { id: "t-gov", name: "Government Tender", cat: "Pemerintah", desc: "Struktur tender 9-bagian, kepatuhan administratif, dokumen teknis & legal.", sections: 14, time: "25 mnt", uses: 32, accent: "#043666", hero: "navy" },
    { id: "t-db", name: "Design & Build", cat: "Design & Build", desc: "Proposal terintegrasi konsep hingga konstruksi, jadwal & manajemen risiko.", sections: 11, time: "20 mnt", uses: 47, accent: "#045D93", hero: "blue" },
    { id: "t-res", name: "Premium Residential", cat: "Hunian", desc: "Naratif hangat, pengalaman ruang, privasi & kustomisasi material.", sections: 9, time: "15 mnt", uses: 58, accent: "#4AB3D8", hero: "sky" },
    { id: "t-corp", name: "Corporate", cat: "Korporat", desc: "ROI-framing, arsitektur sebagai aset brand, efisiensi rancang-bangun.", sections: 10, time: "18 mnt", uses: 24, accent: "#0A3863", hero: "navy" },
    { id: "t-cp", name: "Company Profile", cat: "Profil", desc: "Filosofi · Layanan · Karya Pilihan · Tim · Kontak.", sections: 8, time: "12 mnt", uses: 41, accent: "#1E7FB8", hero: "blue" },
    { id: "t-tech", name: "Technical Proposal", cat: "Teknis", desc: "Metodologi, spesifikasi, koordinasi struktur & MEP, BIM.", sections: 12, time: "22 mnt", uses: 19, accent: "#045D93", hero: "blue" },
    { id: "t-fin", name: "Financial Proposal", cat: "Finansial", desc: "RAB, struktur fee, termin pembayaran, PPN, ringkasan investasi.", sections: 7, time: "14 mnt", uses: 27, accent: "#4AB3D8", hero: "sky" },
    { id: "t-pitch", name: "Client Pitch Deck", cat: "Presentasi", desc: "Format 9-slide persuasif: konteks → gagasan → respons → visi.", sections: 9, time: "16 mnt", uses: 36, accent: "#043666", hero: "navy" },
  ];

  // AI Writer — generated sections (text shown with type-in animation)
  const aiSections = [
    {
      id: "exec", label: "Executive Summary",
      text: "Manggo Villa dirancang sebagai sebuah retret tropis kontemporer di jantung Bali — sebuah ruang yang tumbuh bersama ritme alam dan penghuninya. Sudut Ruang Arsitek menghadirkan pendekatan Design & Build terintegrasi: satu tim, satu visi, dari sketsa pertama hingga serah terima kunci. Proposal ini menempatkan kenyamanan, kejujuran material, dan efisiensi anggaran dalam satu kesatuan yang utuh.",
    },
    {
      id: "understanding", label: "Project Understanding",
      text: "Tapak menghadap barat dengan paparan sinar sore yang kuat. Kami membaca ini bukan sebagai kendala, melainkan peluang: orientasi massa diputar 15°, secondary skin roster ditambahkan, dan bukaan diatur untuk menangkap angin laut. Privasi dijaga melalui buffer lanskap, sementara visual ke arah sawah tetap dibingkai dengan presisi.",
    },
    {
      id: "concept", label: "Design Concept",
      text: "Gagasan besar: 'Tropis yang Tenang'. Atap pelana lebar merespons hujan tropis, material lokal — batu andesit, kayu ulin, beton ekspos — dibiarkan jujur pada teksturnya. Setiap sudut ruang dirancang sebagai pengalaman: kolam infinity yang menyatu dengan cakrawala, void yang mengundang cahaya, dan transisi mulus antara interior dan lanskap.",
    },
  ];

  const aiPrompts = [
    "Tulis ulang dengan nada lebih formal untuk klien pemerintah",
    "Perpendek menjadi 3 kalimat kunci",
    "Tambahkan data kredibilitas IKN",
    "Terjemahkan ke Bahasa Inggris korporat",
  ];

  // Analytics
  const analytics = {
    kpis: [
      { label: "Total Proposal", value: "248", delta: "+12%", up: true, icon: "file-text" },
      { label: "Proposal Aktif", value: "31", delta: "+5", up: true, icon: "loader" },
      { label: "Win Rate", value: "63%", delta: "+8 pts", up: true, icon: "trophy" },
      { label: "Total Nilai", value: "Rp 184 M", delta: "+22%", up: true, icon: "wallet" },
    ],
    funnel: [
      { stage: "Draft", count: 84, pct: 100 },
      { stage: "Review", count: 61, pct: 73 },
      { stage: "Submitted", count: 48, pct: 57 },
      { stage: "Won", count: 30, pct: 36 },
    ],
    monthly: [42, 55, 48, 67, 72, 61, 80, 88, 76, 95, 102, 118],
    byType: [
      { type: "Design & Build", win: 71, value: 64 },
      { type: "Tender Pemerintah", win: 58, value: 88 },
      { type: "Arsitektur", win: 67, value: 32 },
      { type: "Interior", win: 74, value: 41 },
      { type: "Manajemen Konstruksi", win: 52, value: 96 },
    ],
    topTemplates: [
      { name: "Premium Residential", rate: 78, uses: 58 },
      { name: "Design & Build", rate: 71, uses: 47 },
      { name: "Client Pitch Deck", rate: 69, uses: 36 },
      { name: "Government Tender", rate: 61, uses: 32 },
    ],
  };

  // Asset Library — real projects grouped
  const projects = [
    { id: "ikn-minister", name: "Minister's House — IKN", scope: "Design & Build", loc: "IKN, Kalimantan Timur", year: "2022–2024", cat: "Residential", tone: "#043666" },
    { id: "ubud-villa", name: "Ubud Villa", scope: "Architecture", loc: "Ubud, Bali", year: "2025", cat: "Residential", tone: "#045D93" },
    { id: "steve-japandi", name: "Mr. Steve House — Japandi", scope: "DED", loc: "Surabaya", year: "2025", cat: "Residential", tone: "#1E7FB8" },
    { id: "kyoto-gion", name: "Kyoto Gion Coffee", scope: "DED", loc: "Bogor", year: "2025", cat: "Commercial", tone: "#4AB3D8" },
    { id: "lavana", name: "Lavana Skin Clinic", scope: "Interior", loc: "Surabaya", year: "2025", cat: "Commercial", tone: "#0A3863" },
    { id: "royal-palace", name: "Royal Palace Lounge & Spa", scope: "Interior", loc: "Bali", year: "2023", cat: "Hospitality", tone: "#045D93" },
    { id: "ikn-presidential", name: "Presidential Palace Sarpras 1A", scope: "Construction Mgmt", loc: "KIPP IKN", year: "2023–2024", cat: "Government", tone: "#043666" },
    { id: "nuraga", name: "Nuraga Flats Development", scope: "Construction Mgmt", loc: "Jawa Timur", year: "2023–2024", cat: "Government", tone: "#1E7FB8" },
  ];

  const certifications = [
    "Ahli Perancang Lanskap — Madya", "Ahli Muda Manajemen Konstruksi",
    "Ahli Desain Interior — Madya", "Building Information Modelling (BIM)",
  ];

  // Pricing engine reference
  const designFees = [
    { service: "Arsitektur — Standar", per_m2: 75000, percent: 7, fit: "Tipe 36–70, < 100 m²" },
    { service: "Arsitektur — Menengah", per_m2: 100000, percent: 5, fit: "Tipe 70–150, villa" },
    { service: "Arsitektur — Premium", per_m2: 200000, percent: 4, fit: "Mewah, komersial besar" },
    { service: "Interior — Menengah", per_m2: 100000, percent: 5, fit: "Full unit" },
    { service: "Interior — Premium", per_m2: 200000, percent: 4, fit: "Mewah, hospitality" },
    { service: "Lansekap — Premium", per_m2: 100000, percent: 5, fit: "Villa, resort" },
    { service: "Komersial (Cafe/Resto)", per_m2: 200000, percent: 4, fit: "Konsep + branding ruang" },
  ];

  const constructionGrades = [
    { type: "Rumah Tinggal", grade: "Menengah Atas", min: 6000000, max: 8000000 },
    { type: "Villa / Guest House", grade: "Premium", min: 10000000, max: 12000000 },
    { type: "Cafe / Restoran", grade: "Premium", min: 7000000, max: 10000000 },
    { type: "Kantor", grade: "Grade A", min: 5000000, max: 8000000 },
  ];

  // Wizard steps
  const wizardSteps = [
    { n: 1, key: "project", label: "Project Information", icon: "building-2", desc: "Nama, tipe, lokasi & ringkasan proyek" },
    { n: 2, key: "client", label: "Client Information", icon: "user-round", desc: "Klien, kontak & sektor" },
    { n: 3, key: "service", label: "Service Selection", icon: "layout-grid", desc: "Lini layanan yang ditawarkan" },
    { n: 4, key: "scope", label: "Scope of Work", icon: "list-checks", desc: "Lingkup & deliverables" },
    { n: 5, key: "method", label: "Methodology", icon: "git-branch", desc: "Pendekatan & tahapan kerja" },
    { n: 6, key: "team", label: "Team Assignment", icon: "users", desc: "Personel & peran" },
    { n: 7, key: "portfolio", label: "Portfolio Selection", icon: "image", desc: "Karya pendukung kredibilitas" },
    { n: 8, key: "pricing", label: "Pricing Structure", icon: "calculator", desc: "Struktur fee & termin" },
    { n: 9, key: "review", label: "Review & Generate", icon: "sparkles", desc: "Tinjau & hasilkan proposal" },
  ];

  const proposalTypes = [
    "Arsitektur", "Interior", "Landscape", "Design & Build",
    "Tender Pemerintah", "Manajemen Konstruksi", "Company Profile",
    "Technical Proposal", "Financial Proposal", "Pitch Deck",
  ];

  // Builder section blocks
  const builderBlocks = [
    { id: "cover", label: "Cover", icon: "panel-top" },
    { id: "summary", label: "Executive Summary", icon: "text" },
    { id: "understanding", label: "Project Understanding", icon: "lightbulb" },
    { id: "concept", label: "Design Concept", icon: "compass" },
    { id: "method", label: "Methodology", icon: "git-branch" },
    { id: "team", label: "Team Profile", icon: "users" },
    { id: "portfolio", label: "Portfolio", icon: "image" },
    { id: "pricing", label: "Pricing", icon: "calculator" },
    { id: "closing", label: "Closing", icon: "flag" },
  ];

  const activity = [
    { who: "habib", action: "menyelesaikan Design Concept di", target: "Manggo Villa", time: "2 jam lalu", icon: "check" },
    { who: "dewi", action: "mengirim", target: "Hunian ASN Tahap II — IKN", time: "Kemarin", icon: "send" },
    { who: "patricia", action: "memenangkan", target: "Lavana Skin Clinic", time: "3 hari lalu", icon: "trophy" },
    { who: "maldini", action: "membuat draft", target: "Lisa House Surabaya", time: "5 jam lalu", icon: "file-plus" },
    { who: "dewi", action: "memulai proposal", target: "Clubhouse Bali", time: "30 menit lalu", icon: "sparkles" },
  ];

  window.SRA = {
    team, proposals, statusMeta, templates, aiSections, aiPrompts,
    analytics, projects, certifications, designFees, constructionGrades,
    wizardSteps, proposalTypes, builderBlocks, activity, rupiah,
    memberById: (id) => team.find((t) => t.id === id) || team[0],
  };
})();
