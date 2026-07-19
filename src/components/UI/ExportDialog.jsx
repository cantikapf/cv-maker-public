import { useState, useCallback } from 'react'
import { RiPrinterLine, RiFileCopyLine, RiCloseLine, RiCheckLine } from 'react-icons/ri'
import { generateCVFilename, MONTH_NAMES } from '../../utils/cvExport'

export default function ExportDialog({ cvData, ownerName, onClose }) {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth()) // 0-indexed
  const [year, setYear]   = useState(now.getFullYear())
  const [copied, setCopied] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const filename = generateCVFilename(ownerName, new Date(year, month, 1)) + '.pdf'

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(filename)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for browsers without clipboard API
      const el = document.createElement('textarea')
      el.value = filename
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [filename])

  const handleExportPDF = useCallback(() => {
    // Inject filename as document title so it defaults in the save dialog
    const originalTitle = document.title
    document.title = filename
    
    // Set a flag or trigger print directly
    // Note: the user must select "Save as PDF" instead of "Microsoft Print to PDF" to keep links
    window.print()
    
    // Restore original title
    setTimeout(() => {
      document.title = originalTitle
    }, 100)
    
    onClose()
  }, [filename, onClose])

  // Build year options: current year ± 2
  const yearOptions = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i)

  return (
    <div className="dialog-overlay" onClick={!isGenerating ? onClose : undefined}>
      <div className="dialog export-dialog" onClick={e => e.stopPropagation()}>
        <div className="dialog__header">
          <div className="dialog__icon dialog__icon--pdf">
            <RiPrinterLine />
          </div>
          <div>
            <h3 className="dialog__title">Export ke PDF</h3>
            <p className="dialog__subtitle">Pilih bulan & tahun untuk nama file</p>
          </div>
          <button className="btn btn--icon dialog__close" onClick={onClose} disabled={isGenerating}>
            <RiCloseLine />
          </button>
        </div>

        {/* Month / Year selectors */}
        <div className="export-dialog__selectors">
          <div className="field">
            <label className="field__label">Bulan</label>
            <select
              className="field__input field__select"
              value={month}
              onChange={e => setMonth(Number(e.target.value))}
              disabled={isGenerating}
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx}>{name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field__label">Tahun</label>
            <select
              className="field__input field__select"
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              disabled={isGenerating}
            >
              {yearOptions.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filename preview */}
        <div className="export-dialog__preview">
          <label className="field__label">Nama file yang akan disimpan</label>
          <div className="export-dialog__filename">
            <code>{filename}</code>
            <button
              className={`btn btn--ghost btn--sm ${copied ? 'btn--success' : ''}`}
              onClick={handleCopy}
              title="Salin nama file"
              disabled={isGenerating}
            >
              {copied ? <><RiCheckLine /> Disalin!</> : <><RiFileCopyLine /> Salin</>}
            </button>
          </div>
          <div className="export-dialog__tips">
            <div className="export-dialog__tip export-dialog__tip--danger" style={{ color: '#d97706', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: 'var(--s2)', borderRadius: 'var(--r-sm)' }}>
              ⚠️ <strong>Penting: Pengaturan Cetak Browser</strong>
            </div>
            <p className="export-dialog__tip">
              Karena mencetak langsung dari browser, harap pastikan pengaturan berikut saat dialog cetak muncul:
            </p>
            <p className="export-dialog__tip">
              1. <strong>Destination / Printer:</strong> Pilih <strong>"Save as PDF" (Simpan sebagai PDF)</strong>. <br/>
              <em>*JANGAN memilih "Microsoft Print to PDF" karena itu akan menghapus semua hyperlink/tautan Anda dan membuatnya tidak bisa diklik!*</em><br/>
              2. <strong>Margins:</strong> Pilih <strong>"Default"</strong> atau <strong>"None"</strong>.<br/>
              3. <strong>Options:</strong> Matikan <strong>"Headers and footers"</strong> agar bersih dari URL browser.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="dialog__actions">
          <button className="btn btn--ghost" onClick={onClose} disabled={isGenerating}>
            <RiCloseLine /> Batal
          </button>
          <button className="btn btn--primary" onClick={handleExportPDF} disabled={isGenerating}>
            {isGenerating ? 'Mengekspor...' : <><RiPrinterLine /> Unduh PDF</>}
          </button>
        </div>
      </div>
    </div>
  )
}
