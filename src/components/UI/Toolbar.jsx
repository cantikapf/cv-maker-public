import { useRef } from 'react'
import {
  RiFilePdf2Line,
  RiDownloadLine,
  RiUploadLine,
  RiRefreshLine,
  RiSparkling2Line,
  RiArrowGoBackLine,
  RiArrowGoForwardLine,
  RiFolderLine
} from 'react-icons/ri'

export default function Toolbar({
  onOpenLibrary,
  onExportPDF,
  onExportJSON,
  onImportFile,
  onReset,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  user,
  onSignOut,
}) {
  const importRef = useRef(null)

  const handleImportClick = () => importRef.current?.click()
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      onImportFile(file)
      e.target.value = ''
    }
  }

  return (
    <header className="toolbar">
      <div className="toolbar__brand">
        <span className="toolbar__brand-icon">
          <RiSparkling2Line />
        </span>
        <span className="toolbar__brand-name">CV Editor</span>
        <span className="toolbar__brand-badge">AI-Powered</span>
      </div>

      <div className="toolbar__actions">
        {/* CV Library */}
        <button
          className="btn btn--secondary"
          onClick={onOpenLibrary}
          title="Buka Perpustakaan CV"
        >
          <RiFolderLine />
          Library
        </button>

        <div className="toolbar__divider" />

        {/* Undo / Redo */}
        <button
          id="btn-undo"
          className="btn btn--icon"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <RiArrowGoBackLine />
        </button>
        <button
          id="btn-redo"
          className="btn btn--icon"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          <RiArrowGoForwardLine />
        </button>

        <div className="toolbar__divider" />

        {/* Export PDF — opens ExportDialog */}
        <button
          id="btn-export-pdf"
          className="btn btn--primary"
          onClick={onExportPDF}
          title="Export ke PDF"
        >
          <RiFilePdf2Line />
          Export PDF
        </button>

        <div className="toolbar__divider" />

        <button
          id="btn-save-json"
          className="btn btn--ghost"
          onClick={onExportJSON}
          title="Simpan CV sebagai file JSON"
        >
          <RiDownloadLine />
          Simpan JSON
        </button>

        <button
          id="btn-load-json"
          className="btn btn--ghost"
          onClick={handleImportClick}
          title="Muat CV dari file JSON"
        >
          <RiUploadLine />
          Impor CV (JSON/PDF)
        </button>

        <input
          ref={importRef}
          type="file"
          accept=".json,.pdf"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        <button
          id="btn-reset"
          className="btn btn--danger-ghost"
          onClick={onReset}
          title="Reset ke data CV awal"
        >
          <RiRefreshLine />
        </button>

      </div>
    </header>
  )
}
