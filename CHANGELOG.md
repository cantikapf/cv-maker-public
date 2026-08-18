# Changelog

All notable changes to **CV Editor** will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [1.2.1] - 2026-08-18

### Fixed
- **Supabase Keepalive GitHub Action**: Memperbaiki syntax `curl` pada cron job GitHub Action yang digunakan untuk mencegah database Supabase auto-pause (inactivity). Sebelumnya request gagal karena mengirimkan publishable key sebagai token JWT. Menambahkan flag `-f` agar error HTTP terdeteksi pada workflow.

---

## [1.2.0] - 2026-07-07

### Added
- **Resume Score & Insights** (terinspirasi NodeFlair) — fitur scoring kualitas CV real-time.
- **Scoring Engine 3-Dimensi** — dihitung instan berdasarkan rubrik terpadu (Resume Structure 35%, Resume Impact 40%, Keyword Usage 25%) yang diselaraskan dengan panduan resmi *Harvard Career Services Resume Guide*.
- **Bell Curve SVG Visualization** — grafik distribusi skor normal interaktif dengan penanda posisi dinamis sesuai skor CV user saat ini.
- **Action Verbs & Passive Phrases Checks** — mendeteksi penggunaan kata kerja aktif standar Harvard dan mendeteksi kalimat pasif yang perlu dihindari.
- **Job Match AI** — fitur optimasi ATS, membandingkan CV dengan deskripsi pekerjaan eksternal untuk mendeteksi keywords yang kurang.
- **SummaryAIDropdown** — menu dropdown AI di field Summary profil untuk melakukan optimasi terpandu (generate samples, enhance, fix grammar, highlight keywords, write from resume, make compact).
- Integrasi navigasi instan pada panel review score yang memindahkan editor ke section bermasalah secara otomatis ketika diklik.
- **Fitur "Make summary compact"** — Opsi baru di menu AI Summary untuk memadatkan ringkasan menjadi 20-50 kata secara otomatis sesuai pedoman Harvard.
- **Sistem Fallback API Key Otomatis (Groq & Nvidia)** — Fitur deteksi kegagalan API Key. Ketika sebuah kunci utama mengalami kegagalan/limit, sistem secara otomatis mengalihkan permintaan ke kunci cadangan yang dikonfigurasi di file .env. Sistem juga secara dinamis mendeteksi kunci Nvidia NIM (`nvapi-` prefix) untuk mengalihkan rute endpoint ke Nvidia NIM completions dan model `meta/llama-3.1-70b-instruct` secara transparan.
- **GitHub Project Importer dengan AI** — Fitur penyelesaian *pain point* pengguna untuk mengimpor proyek secara otomatis dari URL GitHub. Mengambil metadata repositori & README via GitHub REST API, menganalisis tumpukan teknologi menggunakan AI (Groq/Nvidia NIM), serta menyusun judul, deskripsi singkat, dan 3 poin pencapaian berstandar Harvard Resume Guide secara instan.

### Changed
- **Penyelarasan Layout Foto Header** — Mengubah ukuran foto profil menjadi `33mm × 44mm` (rasio 3:4 yang lebih proporsional) serta menyelaraskan judul nama dan informasi kontak menjadi rata tengah (*centered*) untuk estetika visual yang lebih seimbang di halaman cetak A4.
- **Desain Tampilan Link Dokumen (`index.css`, `print.css`)** — Mengubah gaya visual `.cv-link` agar teks tetap berwarna hitam (mengikuti warna teks dokumen/inherit) dan menghapus garis bawah default, diganti dengan ikon tautan eksternal (external link symbol `↗`) di sebelah kanan teks menggunakan CSS pseudo-element `::after` (baik di pratinjau editor maupun saat dicetak ke PDF).

### Fixed
- **Crop Modal Head Clipping** — Memperbaiki layout modal crop foto profil. Mengganti model pemusatan *Flexbox* (yang memotong bagian atas gambar pada *overflow*) dengan kombinasi *block layout* dan auto-margins. Sekarang, jika gambar tinggi, scrollbar akan terhitung dengan benar dari ujung atas sehingga wajah/kepala tidak terpotong lagi.
- **Sistem Error & Layout Summary AI** — Menambahkan sanitasi string JSON (`cleanJSON`) untuk mencegah error parser ketika AI memformat respons dalam blok Markdown, mengubah panel hasil rekomendasi menjadi popover absolut agar tidak terpotong, serta meloloskan pesan error asli dari API Groq (*error propagation*) ke UI agar detail kegagalan (seperti rate limit atau kuota habis) langsung terlihat oleh pengguna.
- **Context Length Exceeded (Rotasi Kunci & Payload) (`groqClient.js`)** — Menyelesaikan error kegagalan LLM context length limit. Mengimplementasikan fungsi `cleanCVDataForAI` untuk memangkas data biner gambar base64 (`personalInfo.photo`) dari payload prompt AI, serta membatasi pengiriman riwayat obrolan AI ke server hanya untuk 8 giliran (*turns*) terakhir saja guna meminimalkan konsumsi token secara drastis.
- **Sinkronisasi Link & Kontak (`defaultCV.js`, `useCVData.js`, `CVPreview.jsx`)** — Menyelaraskan seluruh link proyek, link publikasi DOI, nomor telepon, dan username GitHub berdasarkan berkas resume terbaru user (`2026-02_February-Cantikaputri Febrianti-resume.pdf`). Menambahkan logika auto-upgrade di `useCVData.js` agar data session lama di `localStorage` diperbarui secara transparan, serta memperbaiki rendering `CVPreview.jsx` untuk mendukung link tautan pada judul publikasi.
- **Gagal Cetak/Export PDF Blank (`print.css`)** — Memperbaiki bug halaman kosong/blank saat melakukan print/export PDF. Menambahkan aturan reset layout pada penampung utama `.app`, `.app__body`, dan `.preview-panel` agar di-render sebagai `display: block` dengan tinggi otomatis (`height: auto`), meniadakan pembatasan `overflow: hidden` dan tinggi `100vh` layar screen view yang memotong seluruh halaman CV saat dicetak.
- **Penyelarasan Layout Foto, Margin, & Pagination PDF (`print.css`, `CVHeader.jsx`, `index.css`)** — Menyelaraskan tata letak foto profil dan memperluas area cetak dengan margin halaman browser asli (`@media print { @page { margin: 12mm 14mm } }`), menyinkronkan ukuran foto cetak menjadi `33mm x 44mm` (identik dengan screen view), serta memperbaiki pagination halaman 2 & 3 agar memiliki batas atas yang rapi.
- **Restorasi Posisi Summary & Tips Cetak PDF (`CVHeader.jsx`, `index.css`, `ExportDialog.jsx`)** — Mengembalikan penempatan paragraf summary profil di samping kanan foto (di dalam kontainer `.cv-header__info` secara vertikal-sentris) sesuai keinginan user.
- **Nama File Cetak & Hyperlink PDF Tidak Aktif (`ExportDialog.jsx`, `index.css`, `CVDocumentPDF.jsx`)** — Mengimplementasikan pembuat PDF berbasis vektor klien-sisi dengan pustaka `@react-pdf/renderer` untuk menggantikan dialog cetak browser (`window.print()`). Pustaka ini menghasilkan berkas PDF vektor asli yang langsung terunduh, secara otomatis menyetel nama file, menghilangkan seluruh header/footer browser bawaan, serta menjaga teks tetap selectable dan **seluruh hyperlink tetap aktif & dapat diklik** untuk kesesuaian sistem ATS (Applicant Tracking System).
- **Restorasi Cetak Bawaan Browser (`window.print()`) & Fix Modal Bocor** — Mengembalikan fitur ekspor ke dialog cetak standar browser (sebelumnya sempat dicoba dengan `pdfmake` dan `@react-pdf/renderer` namun ditolak karena masalah akurasi layout). Sistem kini menggunakan `window.print()` murni yang 100% identik dengan tampilan layar, bebas dari *bug collapse* atau tata letak tumpang tindih. Selain itu, *bug* di mana kotak dialog ikut tercetak ke dalam PDF juga telah diatasi dengan menyembunyikan elemen modal sepenuhnya selama proses cetak berlangsung. Pengguna telah diinformasikan untuk wajib memilih opsi "Save as PDF" di setelan *printer* (dan bukan "Microsoft Print to PDF") agar _hyperlink_ tetap aktif dan bisa diklik.
- **Fitur AI Sorting / Reorder (Urutkan Data)** — Menambahkan kemampuan baru pada asisten AI untuk dapat melakukan pengurutan ulang (reorder) terhadap larik data di CV, seperti mengurutkan proyek dari yang terbaru ke terlama secara otomatis, menggunakan pemetaan `action="reorder"`.

---

## [1.1.1] - 2026-07-06

### Added
- **6 Sub-Agents** di `.agents/` untuk membantu development, debugging, dan QA:
  - `cv-debugger.md` — 🔧 Debugging React/Vite/CSS/AI pipeline
  - `cv-tester.md` — 🧪 Unit test & integration test (Vitest + RTL)
  - `cv-preview-checker.md` — 👁️ Verifikasi visual template vs PDF asli
  - `ai-pipeline-reviewer.md` — 🤖 Audit linearitas AI → useCVData pipeline
  - `code-reviewer.md` — 📋 AGENTS.md compliance & code quality review
  - `performance-auditor.md` — ⚡ Bundle size, render, dan print CSS audit
- `.agents/README.md` — index semua agent dengan quick-reference table
- Format terinspirasi dari [agency-agents](https://github.com/msitarzewski/agency-agents)

---

## [1.4.0] - 2026-07-19
### Added
- **Dynamic Section Reordering** — Pengguna kini dapat mengatur urutan seluruh *section* (baik bawaan maupun kustom) sesuai keinginan, langsung dari tab "Pengaturan" menggunakan tombol panah atas/bawah. Pembaruan urutan ini akan secara dinamis di-render ulang di tab navigasi sisi kiri dan di tampilan *PDF Preview*.
- **Customizable Sections (Section Manager)** — Menambahkan fitur manajemen section yang memungkinkan pengguna untuk menyembunyikan/menampilkan section bawaan dan membuat *Custom Section* baru (misal: "Pengalaman Relawan", "Hobi") dengan judul bebas.
- **SectionManager Component** — Antarmuka pengguna baru di EditorPanel untuk mengatur urutan (drag/klik panah), mengatur visibilitas section, dan mengelola section kustom (tambah, edit nama, hapus) dalam satu daftar terpadu yang sinkron dengan tampilan cetak.
- Dukungan *Custom Sections* di dalam **AI Chat** (`groqClient.js`). AI kini dapat memahami, mengedit, menambah, atau menghapus entri di dalam *Custom Sections* jika diminta oleh pengguna.

### Changed
- Perombakan arsitektur *rendering* di `CVPreview.jsx` dari statis (*hardcoded*) menjadi pemetaan dinamis (melakukan loop pada larik `sectionOrder`).
- Navigasi Tab di `EditorPanel.jsx` diubah agar secara cerdas mengikuti urutan baru yang ditetapkan pengguna di menu pengaturan.
- Refaktor `useCVData.js` untuk mendukung operasi reorder section global dan operasi CRUD secara dinamis tidak hanya pada *section* bawaan, tetapi juga pada *custom sections* yang terdaftar di state `cvData.customSections`.

---

## [1.3.0] - 2026-07-19
### Fixed
- **AI Chat: Terjemahan CV ke Bahasa Inggris tidak berfungsi** — Diperbaiki 3 bug berlapis: (1) Konflik aturan di system prompt yang tidak memberi instruksi bagaimana menerjemahkan semua section sekaligus; (2) `applyPatch` yang hanya bisa memproses satu operasi per respons AI; (3) batas `max_tokens: 2048` yang terlalu kecil sehingga respons AI terpotong di tengah.

### Added
- **AI Bulk Update (`batch_update`)** — Memperkenalkan action baru `batch_update` pada pipeline AI. AI kini bisa mengirim banyak perubahan (misalnya menerjemahkan seluruh CV) dalam satu respons. Semua perubahan massal akan selalu ditampilkan dalam dialog konfirmasi sebelum diterapkan, dengan label "Terapkan Semua" yang jelas.
- **UI: Konfirmasi Pembaruan Massal** — Dialog konfirmasi di AI Chat kini menampilkan ikon ⚡ dan label "Konfirmasi Pembaruan Massal" khusus untuk operasi `batch_update`, membedakannya secara visual dari konfirmasi perubahan tunggal.
- **AI Chat Suggestion: Terjemahkan CV** — Menambahkan contoh perintah "Terjemahkan semua isi CV ke Bahasa Inggris profesional" ke daftar *quick suggestions* di AI Chat.

### Changed
- **`max_tokens` dinaikkan dari 2048 → 4096** — Untuk mengakomodasi respons AI yang lebih panjang pada operasi terjemahan dan bulk improvement.

---

## [1.2.0] - 2026-07-18
### Added
- **Fitur Multi-CV Library (Penyimpanan Ganda)** — Menambahkan panel `Perpustakaan CV` yang memungkinkan pengguna untuk membuat, menyimpan, menduplikat, dan mengelola hingga 10 CV berbeda di dalam satu peramban secara bersamaan. Data CV yang lama akan dimigrasikan secara aman tanpa kehilangan riwayat. State *Undo/Redo* sekarang terisolasi secara independen per CV.
- **Smart AI JSON Importer** — Memperkenalkan sistem prapemrosesan cerdas (AI mapping) saat pengguna mengimpor (*load*) file JSON. Jika struktur JSON yang diunggah berasal dari perangkat lunak CV lain (format asing yang tidak dikenali), AI Groq/Llama secara otomatis memetakan bidang (*fields*) data dari format tersebut langsung ke standar struktur CV Maker secara *real-time*.
- **PDF Text Extractor & AI CV Converter** — Menambahkan dukungan untuk membaca file berekstensi `.pdf` langsung di peramban (melalui Mozilla `pdfjs-dist`). Sistem akan mengekstrak teks mentah dari file PDF CV apapun (di luar template), kemudian menggunakan AI (Groq/Llama) untuk menyusun kembali teks acak tersebut ke dalam struktur form JSON aplikasi CV Maker.

### Changed
- **Editable & Dynamic Skills Categories** — Merombak struktur *Skills* dari bentuk statis/tetap (hanya *Technology* & *Business*) menjadi berbasis daftar (*array*). Pengguna kini dapat mengubah nama kategori secara bebas, menambah jumlah kategori keahlian (contoh: *Soft Skills*, *Tools*, dll), menghapusnya, serta menyusun urutannya dengan fitur *drag & drop*. CV lama akan otomatis bermigrasi ke skema yang baru.

## [1.1.0] - 2026-07-07

### Added
- **Hyperlink support** di semua text field: gunakan `[teks](url)` untuk membuat
  teks menjadi clickable link di CV preview dan hasil PDF export
- **Bold text support**: gunakan `**teks**` untuk highlight kata kunci
  (sesuai gaya CV asli dengan kata-kata bold di summary)
- **MarkdownToolbar** — mini-toolbar dengan tombol Insert Link dan Bold
  di atas setiap textarea yang mendukung markdown (description, bullets)
- **Fitur Undo** (`Ctrl+Z`) dengan 50-step history stack
- **Fitur Redo** (`Ctrl+Y` / `Ctrl+Shift+Z`)
- Tombol Undo / Redo di toolbar dengan disabled state otomatis
- **ExportDialog** — modal konfirmasi nama file sebelum print PDF:
  pilih bulan & tahun, preview filename, dan tombol copy ke clipboard
- `generateCVFilename()` — generate filename sesuai pola `D:\CV` folder

### Changed
- **CV Header**: contact info sekarang **2 baris** sesuai PDF asli:
  baris 1 = location, email, phone, linkedin;
  baris 2 = github, portfolio
- **CV Header**: link LinkedIn, GitHub, Portfolio berwarna biru dan underlined
- **CV Header**: header terpusat penuh jika tidak ada foto; flex hanya jika ada foto
- **Export PDF**: buka ExportDialog dulu untuk memilih nama file sebelum print
- **Simpan JSON**: filename otomatis mengikuti pola `YYYY-MM_MonthName-Name-resume.json`
- **Projects**: judul project otomatis jadi clickable link jika URL field diisi
- `parseMarkdown.jsx` — parser inline markdown baru untuk seluruh CV preview rendering
- `useCVData.js` — semua mutasi CV kini melewati `setWithHistory()` untuk undo/redo

---

## [1.0.0] - 2026-07-06

### Added
- Initial release of CV Editor web app (React + Vite)
- Split-screen layout: Editor panel (left 420px) + CV Preview (right, A4 format)
- Dark-mode premium UI with violet accent color system and Inter font
- Pre-filled CV data for Cantikaputri Febrianti from original template
- **Personal Info editor** — name, location, email, phone, LinkedIn, GitHub, portfolio, summary
- **Profile photo upload** with 3:4 crop via `react-image-crop` and Canvas API
- **SectionEditor** — generic form editor supporting all CV sections:
  - Work Experience (job title, company, location, dates, bullet points)
  - Education (degree, institution, GPA, bullet points)
  - Organizational & Volunteer Experience
  - Projects (title, URL, dates, description, bullet points)
  - Certifications, Awards, Publications, Languages
- **BulletEditor** — add/edit/remove bullet points per entry
- **Entry reordering** — move entries up/down within each section
- **AI Chat ("Edit with AI")** powered by Groq API (`llama-3.3-70b-versatile`):
  - Natural language commands to add, edit, delete, or improve CV content
  - Full CV context injected into every AI request
  - Multi-turn conversation memory (circular buffer, max 20 messages)
  - Structured JSON response parsing for deterministic CV updates
  - Typing indicator animation while waiting for AI response
  - Suggestion chips for quick-start commands
- **Confirmation dialog** for all destructive AI actions (update, delete, improve)
- **AI pipeline enforcement**: AIChat → useAI → groqClient → useCVData → re-render
- **Auto-save** to `localStorage` on every CV change
- **Export JSON** — download full CV data as timestamped `.json` backup
- **Import JSON** — restore CV from a previously exported `.json` file
- **Export PDF** — browser print dialog with A4-optimized `print.css`
- **print.css** — hides editor UI, sets A4 page, ensures 3:4 photo ratio in print
- **CV Preview** — exact replica of original template:
  - Name centered, large
  - Contact info row with bullet separators
  - ALL CAPS section headers with full-width underline
  - Entry rows: title (bold, left) + date (right)
  - Justified bullet points and descriptions
- **`.agents/AGENTS.md`** — workspace-scoped agent rules (Linear Change Protocol):
  - Research → Plan → Execute → Verify ordering
  - Single source of truth enforcement (`useCVData.js`)
  - AI pipeline linearity rules
  - Changelog update obligation
  - CSS variable and BEM naming conventions
- **`start.bat`** — one-click launcher: auto-installs dependencies if needed, starts dev server, opens browser
