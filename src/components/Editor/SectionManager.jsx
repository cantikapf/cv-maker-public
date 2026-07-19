import React, { useState } from 'react'
import { RiAddLine, RiDeleteBinLine, RiEditLine, RiEyeFill, RiEyeOffFill } from 'react-icons/ri'

// Standard sections that can be toggled
const STANDARD_SECTIONS = [
  { id: 'workExperience', label: 'Pekerjaan' },
  { id: 'education', label: 'Pendidikan' },
  { id: 'skills', label: 'Skills' },
  { id: 'languages', label: 'Bahasa' },
  { id: 'certifications', label: 'Sertifikasi' },
  { id: 'awards', label: 'Penghargaan' },
  { id: 'publications', label: 'Publikasi' },
  { id: 'projects', label: 'Proyek' },
  { id: 'organizationalExperience', label: 'Organisasi' },
]

export default function SectionManager({
  cvData,
  onToggleSectionVisibility,
  onAddCustomSection,
  onUpdateCustomSection,
  onDeleteCustomSection
}) {
  const [newSectionName, setNewSectionName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')

  const hiddenSections = cvData.sectionConfig?.hiddenSections || []
  const customSections = cvData.customSections || []

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
        <h4 className="section-manager__title">Section Bawaan</h4>
        <p className="section-manager__desc">
          Sembunyikan section yang tidak Anda butuhkan agar tidak memenuhi Editor.
        </p>
        <div className="section-manager__list">
          {STANDARD_SECTIONS.map((sec) => {
            const isHidden = hiddenSections.includes(sec.id)
            return (
              <div key={sec.id} className="section-manager__item">
                <span className={`section-manager__label ${isHidden ? 'section-manager__label--hidden' : ''}`}>
                  {sec.label}
                </span>
                <button
                  className={`btn-icon ${isHidden ? 'btn-icon--hidden' : 'btn-icon--visible'}`}
                  onClick={() => onToggleSectionVisibility(sec.id)}
                  title={isHidden ? 'Tampilkan' : 'Sembunyikan'}
                >
                  {isHidden ? <RiEyeOffFill /> : <RiEyeFill />}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <div className="section-manager__block">
        <h4 className="section-manager__title">Custom Sections</h4>
        <p className="section-manager__desc">
          Tambahkan section baru sesuai kebutuhan (misal: "Hobi", "Pengalaman Relawan").
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

        {customSections.length > 0 && (
          <div className="section-manager__list">
            {customSections.map((sec) => (
              <div key={sec.id} className="section-manager__item">
                {editingId === sec.id ? (
                  <input
                    type="text"
                    className="field__input field__input--small"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => handleSaveEdit(sec.id)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(sec.id)}
                    autoFocus
                  />
                ) : (
                  <span className="section-manager__label">{sec.title}</span>
                )}
                
                <div className="section-manager__actions">
                  <button
                    className="btn-icon"
                    onClick={() => {
                      setEditingId(sec.id)
                      setEditingName(sec.title)
                    }}
                    title="Ubah Nama"
                  >
                    <RiEditLine />
                  </button>
                  <button
                    className="btn-icon btn-icon--danger"
                    onClick={() => {
                      if (window.confirm(`Hapus section "${sec.title}" beserta seluruh isinya?`)) {
                        onDeleteCustomSection(sec.id)
                      }
                    }}
                    title="Hapus"
                  >
                    <RiDeleteBinLine />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
