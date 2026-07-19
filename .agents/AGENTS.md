# CV Maker — Agent Rules

## Prinsip Utama: Linear Change Protocol
Setiap perubahan yang dilakukan agent pada project ini harus mengikuti urutan berikut:
1. **Research** — Baca file yang relevan terlebih dahulu sebelum membuat perubahan
2. **Plan** — Tentukan satu perubahan spesifik yang akan dilakukan
3. **Execute** — Lakukan perubahan tersebut satu per satu (tidak paralel)
4. **Verify** — Pastikan perubahan tidak merusak file lain sebelum lanjut ke perubahan berikutnya

## Aturan File & Struktur
- Jangan pernah membuat file baru tanpa memeriksa apakah file serupa sudah ada
- Selalu ikuti struktur folder yang sudah didefinisikan di implementation_plan.md
- Setiap komponen React harus berada di folder yang sesuai: `Editor/`, `Preview/`, atau `UI/`
- State management hanya boleh dilakukan di `hooks/` — komponen tidak boleh punya state CV sendiri

## Aturan State & Data CV
- **Single source of truth**: Semua data CV hanya boleh ada di `useCVData.js`
- Tidak boleh ada duplikasi state CV di komponen manapun
- Setiap operasi CRUD pada CV harus melalui fungsi yang di-expose oleh `useCVData.js`
- `localStorage` harus selalu sinkron dengan state — jangan update salah satu tanpa yang lain

## Aturan AI Integration
- Setiap perubahan CV yang dipicu oleh AI **harus** melalui satu pipeline linear:
  `AIChat → useAI.sendMessage() → parse response → useCVData.applyPatch() → re-render`
- Tidak boleh ada komponen yang memanggil Groq atau Nvidia API secara langsung (selain `groqClient.js`)
- `groqClient.js` wajib mendukung sistem fallback otomatis antara Groq API (Llama 3.3) dan Nvidia NIM API (Llama 3.1) jika API utama gagal/limit.
- AI tidak boleh memperbarui state CV secara langsung — harus selalu melalui `useCVData`
- Jika AI response JSON tidak valid, log error dan tampilkan pesan error ke user — jangan crash

## Aturan Perubahan Bertahap
- Saat mengedit beberapa file sekaligus, kerjakan satu file sampai selesai sebelum pindah ke file berikutnya
- Jangan membuat perubahan yang saling bergantung secara paralel
- Jika sebuah perubahan memerlukan update di lebih dari 3 file, buat task checklist terlebih dahulu
- Setiap perubahan pada `defaultCV.js` (data) TIDAK boleh mengubah skema/struktur tanpa juga mengupdate:
  - `useCVData.js` (CRUD functions)
  - `groqClient.js` (CV DATA SCHEMA di system prompt)
  - `CVPreview.jsx` (rendering)

## Aturan Styling
- Semua warna dan spacing harus menggunakan CSS variables yang didefinisikan di `index.css`
- Tidak boleh ada hardcoded hex color atau pixel value di komponen
- Class naming convention: BEM (Block__Element--Modifier)
- Print CSS (`print.css`) tidak boleh diubah tanpa testing print preview terlebih dahulu

## Aturan Export PDF
- Perubahan apapun pada CV layout HARUS diverifikasi di print preview sebelum commit
- Foto profil harus selalu muncul dengan rasio 3:4 — tidak boleh stretch atau crop berbeda

## Aturan Changelog
- Setiap perubahan fungsional pada webapp **WAJIB** dicatat di `CHANGELOG.md`
- Format mengikuti [Keep a Changelog](https://keepachangelog.com/) dengan Semantic Versioning:
  - **MAJOR** (x.0.0) — perubahan arsitektur besar atau breaking change
  - **MINOR** (1.x.0) — fitur baru yang backward-compatible
  - **PATCH** (1.0.x) — bug fix atau perbaikan kecil
- Setiap entry changelog harus mencantumkan tanggal dan kategori perubahan:
  - `Added` — fitur baru
  - `Changed` — perubahan pada fitur yang sudah ada
  - `Fixed` — bug fix
  - `Removed` — fitur yang dihapus
  - `Security` — perbaikan keamanan
- Jangan pernah edit atau hapus entry changelog yang sudah ada — selalu tambahkan di atas

## Urutan Pengerjaan yang Benar
Jika ada task besar, selalu kerjakan dalam urutan ini:
1. Data layer (`defaultCV.js`, `useCVData.js`)
2. AI layer (`groqClient.js`, `useAI.js`)
3. UI Components (Editor terlebih dahulu, lalu Preview)
4. Styling (`index.css`, lalu `print.css`)
5. Verification
6. Update `CHANGELOG.md`

---

## Aturan Git Branch: Public vs Personal

Project ini menggunakan dua branch dengan tujuan berbeda:

| Branch | Tujuan | Yang Berbeda |
|--------|--------|-------------|
| `main` | Versi publik — di-deploy ke hosting publik | `defaultCV.js` berisi template placeholder generik |
| `personal` | Versi pribadi — hanya dipakai secara lokal atau di-deploy ke instansi private | `defaultCV.js` berisi data CV pribadi pemilik |

### Aturan Ketat untuk Agent

1. **JANGAN PERNAH** commit data pribadi (nama, email, nomor telepon, URL personal) ke branch `main`.
2. **JANGAN PERNAH** push branch `personal` ke remote GitHub yang bersifat publik.
3. Sebelum melakukan perubahan pada `defaultCV.js`, SELALU periksa branch yang aktif dengan `git branch`.
4. Jika agent diminta mengedit `defaultCV.js` dan sedang di branch `main`, isi HANYA dengan data placeholder/generik.
5. Jika agent diminta mengedit `defaultCV.js` dan sedang di branch `personal`, boleh menggunakan data pribadi pemilik.

### Alur Update Fitur Baru (Wajib Diikuti)

Ketika ada fitur baru atau bug fix yang harus ada di **kedua** versi:

```
1. Pastikan aktif di branch `main`:
   git checkout main

2. Buat semua perubahan fitur di `main` (TANPA menyentuh defaultCV.js personal)

3. Commit di `main`:
   git commit -m "feat/fix: [deskripsi perubahan]"

4. Pindah ke `personal` dan merge:
   git checkout personal
   git merge main

5. Resolve conflict HANYA di `defaultCV.js` — selalu pertahankan versi `personal`.

6. Commit merge di `personal`:
   git commit -m "merge: sync feature from main"
```

### File yang HANYA Boleh Berbeda Antar Branch

Hanya satu file yang boleh berbeda antara `main` dan `personal`:
- `src/data/defaultCV.js`

Semua file lain (komponen, hooks, utils, CSS) HARUS identik di kedua branch. Jika ada perbedaan selain di file tersebut, itu adalah bug yang harus segera diperbaiki.

### Cara Memeriksa Status Branch Sebelum Commit

Sebelum melakukan `git add` dan `git commit` manapun, agent WAJIB menjalankan:
```
git branch
git diff --name-only HEAD
```
Pastikan branch aktif sesuai konteks perubahan yang diminta.
