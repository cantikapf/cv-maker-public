# 📁 CV Maker — Sub-Agents Directory

Daftar sub-agents yang tersedia untuk membantu development, debugging, dan quality assurance project **CV Maker**.

> Semua agent mengikuti aturan di `AGENTS.md` dan bekerja dengan workflow terstruktur (Discovery → Analyze → Fix → Verify).

---

## Agent Roster

| File | Agent | Emoji | Gunakan Saat |
|---|---|---|---|
| [cv-debugger.md](cv-debugger.md) | CV Debugger | 🔧 | Ada error/bug di React, Vite, CSS, atau AI pipeline |
| [cv-tester.md](cv-tester.md) | CV Tester | 🧪 | Butuh unit test, integration test, atau setup Vitest |
| [cv-preview-checker.md](cv-preview-checker.md) | CV Preview Checker | 👁️ | Template CV preview tidak cocok dengan PDF asli |
| [ai-pipeline-reviewer.md](ai-pipeline-reviewer.md) | AI Pipeline Reviewer | 🤖 | Audit alur AI → useCVData, cek apakah pipeline linear |
| [code-reviewer.md](code-reviewer.md) | Code Reviewer | 📋 | Review kode baru, cek AGENTS.md compliance |
| [performance-auditor.md](performance-auditor.md) | Performance Auditor | ⚡ | Bundle terlalu besar, print layout rusak, memory leak |

---

## Cara Menggunakan

Aktivasi agent dengan menyebutkan namanya di awal sesi:

```
"Aktifkan CV Debugger — ada error di CVHeader.jsx saat render tanpa foto"
"Aktifkan CV Tester — tulis unit test untuk parseMarkdown"
"Aktifkan CV Preview Checker — cek apakah header sudah cocok dengan PDF asli"
"Aktifkan AI Pipeline Reviewer — audit pipeline setelah perubahan di useAI.js"
"Aktifkan Code Reviewer — review perubahan di useCVData.js dan SectionEditor.jsx"
"Aktifkan Performance Auditor — cek print CSS setelah update layout"
```

---

## Scope & Constraints

Semua agent mematuhi **Linear Change Protocol** dari `AGENTS.md`:

1. **Research** — baca file sebelum mengubah
2. **Plan** — tentukan satu perubahan spesifik
3. **Execute** — kerjakan satu file sampai selesai
4. **Verify** — pastikan tidak merusak file lain
5. **Changelog** — update `CHANGELOG.md` setiap perubahan fungsional

---

## Referensi

- Aturan project: [AGENTS.md](AGENTS.md)
- Format terinspirasi dari: [agency-agents](https://github.com/msitarzewski/agency-agents)
- PDF referensi template: `D:\CV\2026-02_February-Cantikaputri Febrianti-resume.pdf`
