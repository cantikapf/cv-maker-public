import { useEffect } from 'react'
import { RiAlertLine, RiCloseLine, RiCheckLine } from 'react-icons/ri'

export default function ConfirmDialog({ isOpen, message, onConfirm, onCancel }) {
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => {
      if (e.key === 'Escape') onCancel()
      if (e.key === 'Enter') onConfirm()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onConfirm, onCancel])

  if (!isOpen) return null

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog__icon">
          <RiAlertLine />
        </div>
        <h3 className="dialog__title">Konfirmasi Perubahan</h3>
        <p className="dialog__message">{message}</p>
        <div className="dialog__actions">
          <button className="btn btn--ghost" onClick={onCancel}>
            <RiCloseLine />
            Batalkan
          </button>
          <button className="btn btn--primary" onClick={onConfirm}>
            <RiCheckLine />
            Ya, Lanjutkan
          </button>
        </div>
      </div>
    </div>
  )
}
