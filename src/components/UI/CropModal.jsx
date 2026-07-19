import { useState, useRef, useCallback, useEffect } from 'react'
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { RiCloseLine, RiCheckLine, RiZoomInLine, RiZoomOutLine } from 'react-icons/ri'

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  )
}

export default function CropModal({ imageSrc, onCropComplete, onClose }) {
  const [crop, setCrop] = useState()
  const [completedCrop, setCompletedCrop] = useState(null)
  const imgRef = useRef(null)
  const canvasRef = useRef(null)

  // 3:4 aspect ratio for photo
  const ASPECT = 3 / 4

  const onImageLoad = useCallback((e) => {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget
    setCrop(centerAspectCrop(width, height, ASPECT))
  }, [])

  const handleConfirm = useCallback(() => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) return

    const image = imgRef.current
    const canvas = canvasRef.current
    const crop = completedCrop

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    const ctx = canvas.getContext('2d')

    const pixelRatio = window.devicePixelRatio
    canvas.width = Math.floor(crop.width * scaleX * pixelRatio)
    canvas.height = Math.floor(crop.height * scaleY * pixelRatio)

    ctx.scale(pixelRatio, pixelRatio)
    ctx.imageSmoothingQuality = 'high'

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    )

    canvas.toBlob((blob) => {
      if (!blob) return
      const reader = new FileReader()
      reader.onloadend = () => onCropComplete(reader.result)
      reader.readAsDataURL(blob)
    }, 'image/jpeg', 0.92)
  }, [completedCrop, onCropComplete])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="crop-modal" onClick={(e) => e.stopPropagation()}>
        <div className="crop-modal__header">
          <h3 className="crop-modal__title">Crop Foto Profil (3 × 4)</h3>
          <button className="btn btn--icon" onClick={onClose}>
            <RiCloseLine />
          </button>
        </div>

        <div className="crop-modal__body">
          <ReactCrop
            crop={crop}
            onChange={(_, pct) => setCrop(pct)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={ASPECT}
            minWidth={60}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop preview"
              onLoad={onImageLoad}
              className="crop-modal__image"
            />
          </ReactCrop>
        </div>

        {/* Hidden canvas for pixel extraction */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <div className="crop-modal__footer">
          <p className="crop-modal__hint">
            <RiZoomInLine /> Drag area untuk memilih bagian foto. Rasio 3:4 dijaga otomatis.
          </p>
          <div className="crop-modal__actions">
            <button className="btn btn--ghost" onClick={onClose}>
              <RiCloseLine /> Batal
            </button>
            <button
              className="btn btn--primary"
              onClick={handleConfirm}
              disabled={!completedCrop}
            >
              <RiCheckLine /> Gunakan Foto
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
