import { useState } from 'react'
import {
  RiCloseLine,
  RiAddLine,
  RiFileCopyLine,
  RiDeleteBinLine,
  RiEditLine,
  RiDownloadLine,
  RiCheckLine,
} from 'react-icons/ri'

export default function CVLibraryPanel({
  cvList,
  activeCvId,
  onClose,
  onCreate,
  onSwitch,
  onDuplicate,
  onRename,
  onDelete,
  onExport,
}) {
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')

  const startRename = (cv) => {
    setEditingId(cv.id)
    setEditName(cv.name)
  }

  const handleRenameSubmit = (e) => {
    e.preventDefault()
    if (editName.trim()) {
      onRename(editingId, editName)
    }
    setEditingId(null)
  }

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog cv-library-dialog" onClick={e => e.stopPropagation()}>
        <div className="dialog__header">
          <h2 className="dialog__title">Perpustakaan CV</h2>
          <button className="btn-close" onClick={onClose}>
            <RiCloseLine />
          </button>
        </div>

        <div className="dialog__body cv-library-body">
          <div className="cv-library__actions">
            <button className="btn btn--primary" onClick={() => onCreate()}>
              <RiAddLine /> Buat CV Baru
            </button>
            <p className="cv-library__count">{cvList.length}/10 CV tersimpan</p>
          </div>

          <div className="cv-library__grid">
            {cvList.map(cv => (
              <div key={cv.id} className={`cv-card ${cv.id === activeCvId ? 'cv-card--active' : ''}`}>
                <div className="cv-card__header">
                  {editingId === cv.id ? (
                    <form onSubmit={handleRenameSubmit} className="cv-card__rename-form">
                      <input
                        autoFocus
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onBlur={handleRenameSubmit}
                      />
                    </form>
                  ) : (
                    <h3 className="cv-card__name" onClick={() => startRename(cv)}>
                      {cv.name}
                      <RiEditLine className="edit-icon" />
                    </h3>
                  )}
                  {cv.id === activeCvId && <span className="badge badge--active">AKTIF</span>}
                </div>
                
                <div className="cv-card__meta">
                  Terakhir diedit: {new Date(cv.updatedAt).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </div>

                <div className="cv-card__actions">
                  <button 
                    className="btn btn--secondary" 
                    onClick={() => { onSwitch(cv.id); onClose(); }}
                    disabled={cv.id === activeCvId}
                  >
                    <RiCheckLine /> {cv.id === activeCvId ? 'Terbuka' : 'Buka CV'}
                  </button>
                  <button 
                    className="btn btn--icon" 
                    onClick={() => onDuplicate(cv.id)}
                    title="Duplikat"
                  >
                    <RiFileCopyLine />
                  </button>
                  <button 
                    className="btn btn--icon" 
                    onClick={() => onExport(cv.id)}
                    title="Export JSON"
                  >
                    <RiDownloadLine />
                  </button>
                  <button 
                    className="btn btn--icon btn--danger-ghost" 
                    onClick={() => onDelete(cv.id)}
                    title="Hapus"
                  >
                    <RiDeleteBinLine />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
