import { useState, useRef, useCallback } from 'react'
import { RiUserLine, RiUpload2Line, RiDeleteBin6Line } from 'react-icons/ri'
import CropModal from '../UI/CropModal'

export default function ProfilePhotoEditor({ photo, onPhotoChange }) {
  const [cropSrc, setCropSrc] = useState(null)
  const fileRef = useRef(null)

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setCropSrc(reader.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }, [])

  const handleCropComplete = useCallback(
    (base64) => {
      onPhotoChange(base64)
      setCropSrc(null)
    },
    [onPhotoChange]
  )

  return (
    <div className="photo-editor">
      <label className="photo-editor__label">Foto Profil (3 × 4)</label>

      <div className="photo-editor__preview-wrap">
        {photo ? (
          <img src={photo} alt="Foto profil" className="photo-editor__preview" />
        ) : (
          <div className="photo-editor__placeholder">
            <RiUserLine />
            <span>Belum ada foto</span>
          </div>
        )}
      </div>

      <div className="photo-editor__actions">
        <button
          id="btn-upload-photo"
          className="btn btn--ghost btn--sm"
          onClick={() => fileRef.current?.click()}
        >
          <RiUpload2Line />
          {photo ? 'Ganti Foto' : 'Upload Foto'}
        </button>

        {photo && (
          <button
            className="btn btn--danger-ghost btn--sm"
            onClick={() => onPhotoChange(null)}
          >
            <RiDeleteBin6Line />
            Hapus
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {cropSrc && (
        <CropModal
          imageSrc={cropSrc}
          onCropComplete={handleCropComplete}
          onClose={() => setCropSrc(null)}
        />
      )}
    </div>
  )
}
