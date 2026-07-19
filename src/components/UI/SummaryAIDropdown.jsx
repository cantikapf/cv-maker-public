import React, { useState, useRef, useEffect } from 'react'
import {
  RiSparklingLine,
  RiArrowDownSLine,
  RiCheckLine,
  RiCloseLine,
  RiLoader5Line,
} from 'react-icons/ri'

export default function SummaryAIDropdown({
  currentSummary,
  cvData,
  onApplySummary,
  onAIAction, // should accept (actionName) and return the AI response { result, samples, message }
  isLoading,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [localLoading, setLocalLoading] = useState(false)
  const [aiResult, setAiResult] = useState(null) // { type: 'single'|'samples', content, message }
  const [localError, setLocalError] = useState(null)
  const dropdownRef = useRef(null)

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAction = async (action) => {
    setIsOpen(false)
    setLocalLoading(true)
    setAiResult(null)
    setLocalError(null)
    try {
      const res = await onAIAction(action)
      if (res) {
        if (action === 'generate-samples') {
          const samples = res.samples || []
          if (samples.length === 0) {
            throw new Error('AI tidak mengembalikan contoh summary.')
          }
          setAiResult({
            type: 'samples',
            content: samples,
            message: res.message || 'Pilih salah satu contoh ringkasan di bawah:',
          })
        } else {
          const finalResult = res.result || ''
          if (!finalResult.trim()) {
            throw new Error('AI tidak mengembalikan hasil summary.')
          }
          setAiResult({
            type: 'single',
            content: finalResult,
            message: res.message || 'Hasil optimasi summary oleh AI:',
          })
        }
      }
    } catch (err) {
      console.error('AI summary action failed:', err)
      setLocalError(err.message || 'Terjadi kesalahan saat memproses dengan AI.')
    } finally {
      setLocalLoading(false)
    }
  }

  const handleApplySingle = () => {
    if (aiResult && aiResult.type === 'single') {
      onApplySummary(aiResult.content)
      setAiResult(null)
    }
  }

  const handleApplySample = (sampleText) => {
    onApplySummary(sampleText)
    setAiResult(null)
  }

  return (
    <div className="summary-ai" ref={dropdownRef}>
      <div className="summary-ai__controls">
        <button
          className="summary-ai__btn"
          onClick={() => setIsOpen(!isOpen)}
          disabled={localLoading || isLoading}
          type="button"
        >
          {localLoading ? (
            <>
              <RiLoader5Line className="summary-ai__spinner" /> Memproses...
            </>
          ) : (
            <>
              <RiSparklingLine /> ✨ Generate Summary <RiArrowDownSLine />
            </>
          )}
        </button>

        {isOpen && (
          <ul className="summary-ai__dropdown">
            <li className="summary-ai__dropdown-item" onClick={() => handleAction('generate-samples')}>
              <div className="summary-ai__dropdown-title">Generate samples of great summary</div>
              <div className="summary-ai__dropdown-desc">Dapatkan ide ringkasan profesional, pilih contoh yang paling cocok.</div>
            </li>
            <li className="summary-ai__dropdown-item" onClick={() => handleAction('enhance')}>
              <div className="summary-ai__dropdown-title">Enhance summary</div>
              <div className="summary-ai__dropdown-desc">Tingkatkan gaya bahasa dan efektivitas summary yang sudah ada.</div>
            </li>
            <li className="summary-ai__dropdown-item" onClick={() => handleAction('fix-grammar')}>
              <div className="summary-ai__dropdown-title">Fix spelling & grammar</div>
              <div className="summary-ai__dropdown-desc">Koreksi tata bahasa Inggris dan perbaiki typo.</div>
            </li>
            <li className="summary-ai__dropdown-item" onClick={() => handleAction('highlight-keywords')}>
              <div className="summary-ai__dropdown-title">Auto highlight important keywords</div>
              <div className="summary-ai__dropdown-desc">Tandai (bold) kata kunci industri penting agar CV menonjol.</div>
            </li>
            <li className="summary-ai__dropdown-item" onClick={() => handleAction('write-from-resume')}>
              <div className="summary-ai__dropdown-title">Write summary from resume details</div>
              <div className="summary-ai__dropdown-desc">Buat summary otomatis berdasarkan riwayat pekerjaan dan pendidikan.</div>
            </li>
            <li className="summary-ai__dropdown-item" onClick={() => handleAction('make-compact')}>
              <div className="summary-ai__dropdown-title">Make summary compact</div>
              <div className="summary-ai__dropdown-desc">Ringkas dan optimalkan summary agar padat (20–50 kata) sesuai panduan Harvard.</div>
            </li>
          </ul>
        )}
      </div>

      {/* AI Results Preview panel */}
      {aiResult && (
        <div className="summary-ai__result-panel">
          <div className="summary-ai__result-header">
            <span className="summary-ai__result-message">{aiResult.message}</span>
            <button className="summary-ai__result-close" onClick={() => setAiResult(null)} type="button">
              <RiCloseLine />
            </button>
          </div>

          {aiResult.type === 'single' ? (
            <div className="summary-ai__single-preview">
              <div className="summary-ai__preview-box">{aiResult.content}</div>
              <div className="summary-ai__preview-actions">
                <button className="summary-ai__preview-apply" onClick={handleApplySingle} type="button">
                  <RiCheckLine /> Terapkan Perubahan
                </button>
                <button className="summary-ai__preview-cancel" onClick={() => setAiResult(null)} type="button">
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <div className="summary-ai__samples-list">
              {aiResult.content.map((sample, idx) => (
                <div key={idx} className="summary-ai__sample-item">
                  <p className="summary-ai__sample-text">{sample}</p>
                  <button
                    className="summary-ai__sample-select"
                    onClick={() => handleApplySample(sample)}
                    type="button"
                  >
                    Gunakan Contoh Ini
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error Panel */}
      {localError && (
        <div className="summary-ai__result-panel">
          <div className="summary-ai__result-header">
            <span className="summary-ai__result-message" style={{ color: 'var(--danger)' }}>❌ Gagal memproses</span>
            <button className="summary-ai__result-close" onClick={() => setLocalError(null)} type="button">
              <RiCloseLine />
            </button>
          </div>
          <p className="summary-ai__error-text" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{localError}</p>
        </div>
      )}
    </div>
  )
}
