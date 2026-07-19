import React, { useState } from 'react'
import {
  RiAddLine,
  RiDeleteBinLine,
  RiEditLine,
  RiEyeFill,
  RiEyeOffFill,
  RiArrowUpLine,
  RiArrowDownLine,
} from 'react-icons/ri'

// Standard sections labels
const STANDARD_LABELS = {
  workExperience: 'Pekerjaan',
  education: 'Pendidikan',
  skills: 'Skills',
  languages: 'Bahasa',
  certifications: 'Sertifikasi',
  awards: 'Penghargaan',
  publications: 'Publikasi',
  projects: 'Proyek',
  organizationalExperience: 'Organisasi',
}

export default function SectionManager({
  cvData,
  onToggleSectionVisibility,
  onAddCustomSection,
  onUpdateCustomSection,
  onDeleteCustomSection,
  onReorderSectionConfig,
}) {
  const [newSectionName, setNewSectionName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')

  const hiddenSections = cvData.sectionConfig?.hiddenSections || []
  const customSections = cvData.customSections || []
  const sectionOrder = cvData.sectionConfig?.sectionOrder || Object.keys(STANDARD_LABELS)

  const handleAdd = (e) => {
    e.preventDefault()
    if (newSectionName.trim()) {
      onAddCustomSection(newSectionName.trim())
      setNewSectionName('')
    }
  }

  const handleSaveEdit = (id) => {
    if (editingName.trim()) {
      onUpdateCustomSection(id, editingName.trim())
    }
    setEditingId(null)
  }

  return (
    <div className="section-manager">
      <div className="section-manager__block">
        <h4 className="section-manager__title">Urutan & Visibilitas Section</h4>
        <p className="section-manager__desc">
          Atur urutan section yang akan dicetak di PDF menggunakan tombol panah, atau sembunyikan section menggunakan ikon mata.
        </p>
        <div className="section-manager__list">
          {sectionOrder.map((secId, index) => {
            const isCustom = secId.startsWith('cs_')
            const customSec = isCustom ? customSections.find((s) => s.id === secId) : null
            const label = isCustom ? customSec?.title : STANDARD_LABELS[secId]
            const isHidden = hiddenSections.includes(secId)

            if (!label && !isCustom) return null // Edge case: invalid standard section

            return (
              <div key={secId} className="section-manager__item">
                {/* ── ARROW CONTROLS ── */}
                <div className="section-manager__arrows">
                  <button
                    className="btn-icon btn-icon--small"
                    onClick={() => onReorderSectionConfig(index, index - 1)}
                    disabled={index === 0}
                    title="Geser ke Atas"
                  >
                    <RiArrowUpLine />
                  </button>
                  <button
                    className="btn-icon btn-icon--small"
                    onClick={() => onReorderSectionConfig(index, index + 1)}
                    disabled={index === sectionOrder.length - 1}
                    title="Geser ke Bawah"
                  >
                    <RiArrowDownLine />
                  </button>
                </div>

                {/* ── LABEL / EDIT ── */}
                {editingId === secId && isCustom ? (
                  <input
                    type="text"
                    className="field__input field__input--small section-manager__label-input"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => handleSaveEdit(secId)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(secId)}
                    autoFocus
                  />
                ) : (
                  <span className={`section-manager__label ${isHidden ? 'section-manager__label--hidden' : ''}`}>
                    {label || '(Tidak Bernama)'}
                    {isCustom && <span className="section-manager__badge">Custom</span>}
                  </span>
                )}

                {/* ── ACTIONS ── */}
                <div className="section-manager__actions">
                  {isCustom && (
                    <>
                      <button
                        className="btn-icon"
                        onClick={() => {
                          setEditingId(secId)
                          setEditingName(label)
                        }}
                        title="Ubah Nama"
                      >
                        <RiEditLine />
                      </button>
                      <button
                        className="btn-icon btn-icon--danger"
                        onClick={() => {
                          if (window.confirm(`Hapus section "${label}" beserta seluruh isinya?`)) {
                            onDeleteCustomSection(secId)
                          }
                        }}
                        title="Hapus"
                      >
                        <RiDeleteBinLine />
                      </button>
                    </>
                  )}
                  <button
                    className={`btn-icon ${isHidden ? 'btn-icon--hidden' : 'btn-icon--visible'}`}
                    onClick={() => onToggleSectionVisibility(secId)}
                    title={isHidden ? 'Tampilkan' : 'Sembunyikan'}
                  >
                    {isHidden ? <RiEyeOffFill /> : <RiEyeFill />}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="section-manager__block">
        <h4 className="section-manager__title">Buat Custom Section</h4>
        <p className="section-manager__desc">
          Tambahkan section baru secara dinamis (misal: "Hobi", "Pengalaman Relawan"). Section baru otomatis akan ditambahkan di urutan paling bawah.
        </p>
        
        <form className="section-manager__form" onSubmit={handleAdd}>
          <input
            type="text"
            className="field__input"
            placeholder="Nama section baru..."
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
          />
          <button type="submit" className="btn btn--primary" disabled={!newSectionName.trim()}>
            <RiAddLine /> Tambah
          </button>
        </form>
      </div>
    </div>
  )
}
