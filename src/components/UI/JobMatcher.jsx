import React, { useState } from 'react'
import {
  RiCompass3Line,
  RiCheckLine,
  RiCloseLine,
  RiSparklingLine,
  RiCloseCircleLine,
  RiLoader5Line,
} from 'react-icons/ri'

export default function JobMatcher({
  cvData,
  onMatchJob,
  isLoading,
  onClearMatch,
  matchResults,
}) {
  const [jobDescription, setJobDescription] = useState('')

  const handleMatch = async () => {
    if (!jobDescription.trim()) return
    await onMatchJob(jobDescription)
  }

  const handleClear = () => {
    setJobDescription('')
    onClearMatch()
  }

  return (
    <div className="job-matcher">
      <div className="job-matcher__header">
        <RiCompass3Line className="job-matcher__header-icon" />
        <h4 className="job-matcher__title">Match Resume with Job Opening</h4>
      </div>
      <p className="job-matcher__desc">
        Sesuaikan CV kamu dengan lowongan kerja yang diincar. Copy-paste deskripsi pekerjaan untuk mendapatkan rekomendasi kata kunci (ATS optimization).
      </p>

      {!matchResults ? (
        <div className="job-matcher__form">
          <textarea
            className="job-matcher__textarea"
            placeholder="Paste job description / kualifikasi lowongan pekerjaan di sini..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={6}
          />
          <button
            className="job-matcher__button"
            onClick={handleMatch}
            disabled={isLoading || jobDescription.trim().length < 50}
          >
            {isLoading ? (
              <>
                <RiLoader5Line className="job-matcher__spinner" /> Menganalisis...
              </>
            ) : (
              <>
                <RiSparklingLine /> Match Resume
              </>
            )}
          </button>
          {jobDescription.trim().length > 0 && jobDescription.trim().length < 50 && (
            <span className="job-matcher__warning">Masukkan minimal 50 karakter untuk memulai analisis.</span>
          )}
        </div>
      ) : (
        <div className="job-matcher__results">
          {/* Analysis Summary message */}
          {matchResults.message && (
            <div className="job-matcher__summary-box">
              <RiSparklingLine className="job-matcher__sparkle" />
              <p className="job-matcher__summary-text">{matchResults.message}</p>
            </div>
          )}

          {/* Keywords Matched and Missing */}
          <div className="job-matcher__keywords-grid">
            {/* Matched Keywords */}
            <div className="job-matcher__keyword-col">
              <span className="job-matcher__keyword-col-title">
                <RiCheckLine className="job-matcher__icon--success" /> Matched Keywords ({matchResults.matched?.length || 0})
              </span>
              <div className="job-matcher__keyword-tags">
                {matchResults.matched && matchResults.matched.length > 0 ? (
                  matchResults.matched.map((kw, i) => (
                    <span key={i} className="job-matcher__tag job-matcher__tag--matched">
                      {kw}
                    </span>
                  ))
                ) : (
                  <span className="job-matcher__empty-tags">Belum ada kata kunci yang cocok.</span>
                )}
              </div>
            </div>

            {/* Missing Keywords */}
            <div className="job-matcher__keyword-col">
              <span className="job-matcher__keyword-col-title">
                <RiCloseLine className="job-matcher__icon--danger" /> Missing Keywords ({matchResults.missing?.length || 0})
              </span>
              <div className="job-matcher__keyword-tags">
                {matchResults.missing && matchResults.missing.length > 0 ? (
                  matchResults.missing.map((kw, i) => (
                    <span key={i} className="job-matcher__tag job-matcher__tag--missing">
                      + {kw}
                    </span>
                  ))
                ) : (
                  <span className="job-matcher__empty-tags">Tidak ada kata kunci penting yang terlewat!</span>
                )}
              </div>
            </div>
          </div>

          {/* Actionable Suggestions */}
          {matchResults.suggestions && matchResults.suggestions.length > 0 && (
            <div className="job-matcher__suggestions">
              <span className="job-matcher__suggestions-title">Rekomendasi Perbaikan:</span>
              <ul className="job-matcher__suggestions-list">
                {matchResults.suggestions.map((s, i) => (
                  <li key={i} className="job-matcher__suggestions-item">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Reset / Match new button */}
          <button className="job-matcher__clear-button" onClick={handleClear}>
            <RiCloseCircleLine /> Bersihkan & Analisis Lowongan Lain
          </button>
        </div>
      )}
    </div>
  )
}
