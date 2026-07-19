import { useState, useCallback, useRef } from 'react'
import {
  RiAddLine,
  RiDeleteBin6Line,
  RiEditLine,
  RiCheckLine,
  RiCloseLine,
  RiArrowUpLine,
  RiArrowDownLine,
} from 'react-icons/ri'
import MarkdownToolbar from '../UI/MarkdownToolbar'
import GithubProjectImporter from '../UI/GithubProjectImporter'

/* ── Section field configurations ─────────────────────────── */
const SECTION_CONFIG = {
  workExperience: {
    titleKey: 'jobTitle',
    subtitleKey: 'company',
    fields: [
      { key: 'jobTitle', label: 'Job Title', type: 'text', required: true },
      { key: 'company', label: 'Company', type: 'text', required: true },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'startDate', label: 'Start Date', type: 'text', placeholder: 'e.g. Jan 2023' },
      { key: 'endDate', label: 'End Date', type: 'text', placeholder: 'e.g. Dec 2023 or Present' },
    ],
    hasBullets: true,
    emptyEntry: { jobTitle: '', company: '', location: '', startDate: '', endDate: '', bullets: [] },
  },
  education: {
    titleKey: 'degree',
    subtitleKey: 'institution',
    fields: [
      { key: 'degree', label: 'Degree / Program', type: 'text', required: true },
      { key: 'institution', label: 'Institution', type: 'text', required: true },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'startDate', label: 'Start Date', type: 'text', placeholder: 'e.g. Sep 2018' },
      { key: 'endDate', label: 'End Date', type: 'text', placeholder: 'e.g. Dec 2022' },
      { key: 'gpa', label: 'GPA', type: 'text', placeholder: 'e.g. GPA: 3.73 / 4.00' },
    ],
    hasBullets: true,
    emptyEntry: { degree: '', institution: '', location: '', startDate: '', endDate: '', gpa: '', bullets: [] },
  },
  organizationalExperience: {
    titleKey: 'role',
    subtitleKey: 'organization',
    fields: [
      { key: 'role', label: 'Role / Position', type: 'text', required: true },
      { key: 'organization', label: 'Organization', type: 'text', required: true },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'startDate', label: 'Start Date', type: 'text', placeholder: 'e.g. Jul 2019' },
      { key: 'endDate', label: 'End Date', type: 'text', placeholder: 'e.g. May 2029' },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
    hasBullets: false,
    emptyEntry: { role: '', organization: '', location: '', startDate: '', endDate: '', description: '' },
  },
  projects: {
    titleKey: 'title',
    subtitleKey: 'startDate',
    fields: [
      { key: 'title', label: 'Project Title', type: 'text', required: true },
      { key: 'url', label: 'URL / Link', type: 'text', placeholder: 'https://...' },
      { key: 'startDate', label: 'Start Date', type: 'text', placeholder: 'e.g. Jan 2024' },
      { key: 'endDate', label: 'End Date', type: 'text', placeholder: 'e.g. Dec 2024' },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
    hasBullets: true,
    emptyEntry: { title: '', url: '', startDate: '', endDate: '', description: '', bullets: [] },
  },
  certifications: {
    titleKey: 'name',
    subtitleKey: 'issuer',
    fields: [
      { key: 'name', label: 'Certification Name', type: 'text', required: true },
      { key: 'issuer', label: 'Issuer', type: 'text' },
      { key: 'date', label: 'Date', type: 'text', placeholder: 'e.g. Dec 2024' },
      { key: 'credentialId', label: 'Credential ID', type: 'text' },
    ],
    hasBullets: false,
    emptyEntry: { name: '', issuer: '', date: '', credentialId: '' },
  },
  awards: {
    titleKey: 'title',
    subtitleKey: 'issuer',
    fields: [
      { key: 'title', label: 'Award Title', type: 'text', required: true },
      { key: 'issuer', label: 'Issuer', type: 'text' },
      { key: 'date', label: 'Date', type: 'text', placeholder: 'e.g. Oct 2022' },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
    hasBullets: false,
    emptyEntry: { title: '', issuer: '', date: '', description: '' },
  },
  publications: {
    titleKey: 'title',
    subtitleKey: 'conference',
    fields: [
      { key: 'title', label: 'Publication Title', type: 'text', required: true },
      { key: 'conference', label: 'Conference / Journal', type: 'text' },
      { key: 'date', label: 'Date', type: 'text', placeholder: 'e.g. Sep 2023' },
      { key: 'url', label: 'URL / DOI', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
    hasBullets: false,
    emptyEntry: { title: '', conference: '', date: '', url: '', description: '' },
  },
  languages: {
    titleKey: 'name',
    subtitleKey: 'proficiency',
    fields: [
      { key: 'name', label: 'Language', type: 'text', required: true },
      { key: 'proficiency', label: 'Proficiency', type: 'text', placeholder: 'e.g. Native proficiency' },
    ],
    hasBullets: false,
    emptyEntry: { name: '', proficiency: '' },
  },
  skills: {
    titleKey: 'category',
    subtitleKey: 'items',
    fields: [
      { key: 'category', label: 'Category Name', type: 'text', placeholder: 'e.g. Technology Skills', required: true },
      { key: 'items', label: 'Skills List', type: 'textarea', placeholder: 'e.g. Python, React, Data Analysis' },
    ],
    hasBullets: false,
    emptyEntry: { category: '', items: '' },
  },
}

/* ── BulletEditor sub-component ───────────────────────────── */
function BulletEditor({ bullets = [], onChange }) {
  const [newBullet, setNewBullet] = useState('')
  const newBulletRef = useRef(null)

  const addBullet = () => {
    if (!newBullet.trim()) return
    onChange([...bullets, newBullet.trim()])
    setNewBullet('')
  }

  const updateBullet = (idx, val) => {
    const updated = [...bullets]
    updated[idx] = val
    onChange(updated)
  }

  const removeBullet = (idx) => onChange(bullets.filter((_, i) => i !== idx))

  return (
    <div className="bullet-editor">
      <label className="field__label">Bullet Points</label>
      {bullets.map((b, idx) => {
        const ref = { current: null }
        return (
          <div key={idx} className="bullet-editor__row">
            <span className="bullet-editor__dot">•</span>
            <div className="bullet-editor__field">
              <MarkdownToolbar
                textareaRef={ref}
                value={b}
                onChange={(val) => updateBullet(idx, val)}
              />
              <textarea
                ref={ref}
                className="field__input field__input--textarea bullet-editor__input"
                value={b}
                onChange={(e) => updateBullet(idx, e.target.value)}
                rows={2}
              />
            </div>
            <button
              className="btn btn--icon btn--danger-ghost"
              onClick={() => removeBullet(idx)}
              title="Hapus bullet"
            >
              <RiCloseLine />
            </button>
          </div>
        )
      })}
      <div className="bullet-editor__add">
        <MarkdownToolbar
          textareaRef={newBulletRef}
          value={newBullet}
          onChange={setNewBullet}
        />
        <textarea
          ref={newBulletRef}
          className="field__input field__input--textarea"
          placeholder="Tambahkan bullet point baru..."
          value={newBullet}
          onChange={(e) => setNewBullet(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              addBullet()
            }
          }}
          rows={2}
        />
        <button
          className="btn btn--ghost btn--sm"
          onClick={addBullet}
          disabled={!newBullet.trim()}
        >
          <RiAddLine /> Tambah
        </button>
      </div>
    </div>
  )
}

/* ── EntryCard sub-component ──────────────────────────────── */
function EntryCard({ entry, config, onUpdate, onDelete, onMoveUp, onMoveDown, showUp, showDown }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [draft, setDraft] = useState({ ...entry })

  const handleSave = () => {
    onUpdate(draft)
    setIsExpanded(false)
  }

  const handleCancel = () => {
    setDraft({ ...entry })
    setIsExpanded(false)
  }

  const setField = (key, val) => setDraft((prev) => ({ ...prev, [key]: val }))

  const title = entry[config.titleKey] || '(Untitled)'
  const subtitle = entry[config.subtitleKey] || ''

  return (
    <div className={`entry-card ${isExpanded ? 'entry-card--expanded' : ''}`}>
      <div className="entry-card__header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="entry-card__meta">
          <span className="entry-card__title">{title}</span>
          {subtitle && <span className="entry-card__subtitle">{subtitle}</span>}
        </div>
        <div className="entry-card__controls" onClick={(e) => e.stopPropagation()}>
          {showUp && (
            <button className="btn btn--icon" onClick={onMoveUp} title="Geser ke atas">
              <RiArrowUpLine />
            </button>
          )}
          {showDown && (
            <button className="btn btn--icon" onClick={onMoveDown} title="Geser ke bawah">
              <RiArrowDownLine />
            </button>
          )}
          <button
            className="btn btn--icon"
            onClick={() => setIsExpanded(!isExpanded)}
            title="Edit"
          >
            <RiEditLine />
          </button>
          <button
            className="btn btn--icon btn--danger-ghost"
            onClick={onDelete}
            title="Hapus entry"
          >
            <RiDeleteBin6Line />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="entry-card__body">
          {config.fields.map((field) => {
            const fieldRef = { current: null }
            return (
              <div key={field.key} className="field">
                <label className="field__label">
                  {field.label}
                  {field.required && <span className="field__required">*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <>
                    <MarkdownToolbar
                      textareaRef={fieldRef}
                      value={draft[field.key] || ''}
                      onChange={(val) => setField(field.key, val)}
                    />
                    <textarea
                      ref={fieldRef}
                      className="field__input field__input--textarea"
                      value={draft[field.key] || ''}
                      onChange={(e) => setField(field.key, e.target.value)}
                      placeholder={field.placeholder || ''}
                      rows={3}
                    />
                  </>
                ) : (
                  <input
                    className="field__input"
                    type="text"
                    value={draft[field.key] || ''}
                    onChange={(e) => setField(field.key, e.target.value)}
                    placeholder={field.placeholder || ''}
                  />
                )}
              </div>
            )
          })}

          {config.hasBullets && (
            <BulletEditor
              bullets={draft.bullets || []}
              onChange={(bullets) => setField('bullets', bullets)}
            />
          )}

          <div className="entry-card__footer">
            <button className="btn btn--ghost btn--sm" onClick={handleCancel}>
              <RiCloseLine /> Batal
            </button>
            <button className="btn btn--primary btn--sm" onClick={handleSave}>
              <RiCheckLine /> Simpan
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Main SectionEditor ───────────────────────────────────── */
export default function SectionEditor({ section, entries, onAdd, onUpdate, onDelete, onReorder, onAnalyzeRepo }) {
  const config = SECTION_CONFIG[section]
  if (!config) return null

  const handleAdd = () => {
    onAdd(section, { ...config.emptyEntry })
  }

  return (
    <div className="section-editor">
      {section === 'projects' && (
        <GithubProjectImporter
          onAnalyzeRepo={onAnalyzeRepo}
          onAddProject={(project) => onAdd('projects', project)}
        />
      )}

      {entries.length === 0 && (
        <div className="section-editor__empty">
          Belum ada data. Tambahkan entry pertama di bawah.
        </div>
      )}

      <div className="section-editor__list">
        {entries.map((entry, idx) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            config={config}
            onUpdate={(updated) => onUpdate(section, entry.id, updated)}
            onDelete={() => onDelete(section, entry.id)}
            onMoveUp={() => onReorder(section, idx, idx - 1)}
            onMoveDown={() => onReorder(section, idx, idx + 1)}
            showUp={idx > 0}
            showDown={idx < entries.length - 1}
          />
        ))}
      </div>

      <button className="btn btn--add" onClick={handleAdd}>
        <RiAddLine />
        Tambah Entry Baru
      </button>
    </div>
  )
}
