import React, { useState } from 'react'
import {
  RiGithubFill,
  RiSparklingLine,
  RiCheckLine,
  RiCloseLine,
  RiLoader5Line,
  RiErrorWarningLine,
} from 'react-icons/ri'

export default function GithubProjectImporter({ onAnalyzeRepo, onAddProject }) {
  const [urlInput, setUrlInput] = useState('')
  const [localLoading, setLocalLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)

  const handleImport = async () => {
    setError(null)
    setPreview(null)
    setLocalLoading(true)
    try {
      const cleanUrl = urlInput.trim().replace(/\.git$/, '')
      // Match owner/repo pattern
      const match = cleanUrl.match(/github\.com[\/:][^\/]+\/[^\/]+/i)
      if (!match) {
        throw new Error('URL GitHub tidak valid. Contoh format: https://github.com/username/repository')
      }

      const parts = match[0].split('/')
      const owner = parts[1]
      const repo = parts[2]

      // 1. Fetch Repository Metadata
      const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`)
      if (!repoRes.ok) {
        if (repoRes.status === 404) {
          throw new Error('Repositori tidak ditemukan. Pastikan repositori bersifat Publik.')
        }
        throw new Error(`Gagal mengambil metadata repo (Status: ${repoRes.status})`)
      }
      const repoData = await repoRes.json()

      // 2. Fetch README (optional)
      let readmeText = ''
      try {
        const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`)
        if (readmeRes.ok) {
          const readmeData = await readmeRes.json()
          if (readmeData.content && readmeData.encoding === 'base64') {
            const base64Cleaned = readmeData.content.replace(/\s/g, '')
            readmeText = decodeURIComponent(escape(atob(base64Cleaned)))
          }
        }
      } catch (err) {
        console.warn('Could not fetch or decode README:', err)
      }

      // Truncate readme to keep tokens low
      const truncatedReadme = readmeText.slice(0, 5000)

      // 3. Request AI Analysis
      const generatedProject = await onAnalyzeRepo(repoData, truncatedReadme)
      setPreview(generatedProject)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Gagal mengimpor dari GitHub.')
    } finally {
      setLocalLoading(false)
    }
  }

  const handleApply = () => {
    if (preview) {
      onAddProject(preview)
      setPreview(null)
      setUrlInput('')
    }
  }

  const handleCancel = () => {
    setPreview(null)
    setError(null)
  }

  return (
    <div className="github-importer">
      <div className="github-importer__header">
        <RiGithubFill className="github-importer__logo" />
        <span className="github-importer__title">Impor Proyek dari GitHub</span>
      </div>

      <div className="github-importer__body">
        <div className="github-importer__row">
          <input
            className="field__input github-importer__input"
            type="text"
            placeholder="e.g. https://github.com/username/repository"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            disabled={localLoading}
          />
          <button
            className="btn btn--primary github-importer__btn"
            onClick={handleImport}
            disabled={localLoading || !urlInput.trim()}
            type="button"
          >
            {localLoading ? (
              <>
                <RiLoader5Line className="github-importer__spinner" /> Menganalisis...
              </>
            ) : (
              <>
                <RiSparklingLine /> Impor Proyek
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="github-importer__error">
            <RiErrorWarningLine />
            <span>{error}</span>
          </div>
        )}

        {preview && (
          <div className="github-importer__preview">
            <div className="github-importer__preview-header">Pratinjau Hasil Impor AI</div>
            <div className="github-importer__preview-card">
              <div className="github-importer__preview-row">
                <span className="github-importer__preview-title">{preview.title}</span>
                <span className="github-importer__preview-date">
                  {preview.startDate} {preview.endDate ? `- ${preview.endDate}` : ''}
                </span>
              </div>
              <div className="github-importer__preview-url">{preview.url}</div>
              <p className="github-importer__preview-desc">{preview.description}</p>
              {preview.bullets && preview.bullets.length > 0 && (
                <ul className="github-importer__preview-bullets">
                  {preview.bullets.map((b, idx) => (
                    <li key={idx}>{b}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="github-importer__preview-actions">
              <button className="btn btn--ghost btn--sm" onClick={handleCancel} type="button">
                <RiCloseLine /> Batal
              </button>
              <button className="btn btn--primary btn--sm" onClick={handleApply} type="button">
                <RiCheckLine /> Terapkan ke CV
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
