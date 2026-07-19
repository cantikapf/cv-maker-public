import React, { useState } from 'react'
import {
  RiAlertLine,
  RiLightbulbLine,
  RiThumbUpLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiPlayLine,
  RiAddCircleLine,
  RiEditLine,
  RiCheckLine,
} from 'react-icons/ri'

export default function ResumeScorePanel({ scoreData, onNavigateTab }) {
  const {
    total = 0,
    structure = 0,
    impact = 0,
    keywords = 0,
    important = [],
    recommended = [],
    niceTohave = [],
    hasJobDesc = false,
  } = scoreData

  // Accordion state
  const [openSection, setOpenSection] = useState('important')

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section)
  }

  // Calculate bell curve indicator position
  const indicatorX = 10 + (total / 100) * 280
  const indicatorY = 110 - 95 * Math.exp(-Math.pow((indicatorX - 150) / 60, 2))

  // Determine score level color/text
  let levelColor = '#ef4444' // red
  let levelName = 'Perlu Perbaikan'
  if (total >= 80) {
    levelColor = '#10b981' // green
    levelName = 'Sangat Bagus'
  } else if (total >= 50) {
    levelColor = '#f59e0b' // orange/yellow
    levelName = 'Cukup Baik'
  }

  const renderFeedbackList = (items, category) => {
    if (items.length === 0) {
      return (
        <div className="score-panel__empty-feedback">
          <RiCheckLine className="score-panel__empty-icon" />
          <span>Semua poin di kategori ini sudah terpenuhi! Bagus sekali.</span>
        </div>
      )
    }

    return (
      <div className="score-panel__feedback-list">
        {items.map((item) => (
          <div key={item.id} className={`score-panel__feedback-item score-panel__feedback-item--${category}`}>
            <div className="score-panel__feedback-header">
              <span className="score-panel__feedback-title">{item.title}</span>
              <span className="score-panel__feedback-points">{item.points}</span>
            </div>
            <p className="score-panel__feedback-desc">{item.description}</p>
            <button
              className="score-panel__feedback-action"
              onClick={() => onNavigateTab(item.section, item.entryIndex)}
            >
              {item.action === 'add' ? (
                <>
                  <RiAddCircleLine /> Tambah Sekarang
                </>
              ) : (
                <>
                  <RiEditLine /> Perbaiki Sekarang
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="score-panel">
      {/* Header Score & Bell Curve */}
      <div className="score-panel__header">
        <div className="score-panel__score-circle" style={{ borderColor: levelColor }}>
          <span className="score-panel__score-value" style={{ color: levelColor }}>{total}</span>
          <span className="score-panel__score-label">Skor CV</span>
        </div>

        <div className="score-panel__chart-container">
          <svg className="score-panel__chart" viewBox="0 0 300 120" width="100%" height="100%">
            <defs>
              <linearGradient id="bellGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.5" />
              </linearGradient>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Shaded Area Under Curve */}
            <path
              d="M 10 110 C 90 110, 110 15, 150 15 C 190 15, 210 110, 290 110 L 290 110 L 10 110 Z"
              fill="url(#bellGrad)"
            />

            {/* Bell Curve Line */}
            <path
              d="M 10 110 C 90 110, 110 15, 150 15 C 190 15, 210 110, 290 110"
              fill="none"
              stroke="url(#lineGrad)"
              strokeWidth="3"
            />

            {/* Baseline */}
            <line x1="10" y1="110" x2="290" y2="110" stroke="#e2e8f0" strokeWidth="2" />

            {/* User Indicator Marker Line */}
            <line
              x1={indicatorX}
              y1="110"
              x2={indicatorX}
              y2={indicatorY}
              stroke={levelColor}
              strokeWidth="2"
              strokeDasharray="3 3"
            />

            {/* User Indicator Circle */}
            <circle
              cx={indicatorX}
              cy={indicatorY}
              r="6"
              fill={levelColor}
              stroke="#ffffff"
              strokeWidth="2"
              filter="url(#glow)"
            />
          </svg>
          <div className="score-panel__chart-legend">
            <span>Level: <strong>{levelName}</strong></span>
            <span>Dibandingkan jutaan CV</span>
          </div>
        </div>
      </div>

      {/* Progress Bars for 3 Dimensions */}
      <div className="score-panel__dimensions">
        {/* Structure */}
        <div className="score-panel__dimension">
          <div className="score-panel__dimension-info">
            <span className="score-panel__dimension-title">Resume Structure</span>
            <span className="score-panel__dimension-value">{structure}/100</span>
          </div>
          <div className="score-panel__progress-bar">
            <div
              className="score-panel__progress-fill score-panel__progress-fill--structure"
              style={{ width: `${structure}%` }}
            />
          </div>
        </div>

        {/* Impact */}
        <div className="score-panel__dimension">
          <div className="score-panel__dimension-info">
            <span className="score-panel__dimension-title">Resume Impact</span>
            <span className="score-panel__dimension-value">{impact}/100</span>
          </div>
          <div className="score-panel__progress-bar">
            <div
              className="score-panel__progress-fill score-panel__progress-fill--impact"
              style={{ width: `${impact}%` }}
            />
          </div>
        </div>

        {/* Keywords */}
        <div className="score-panel__dimension">
          <div className="score-panel__dimension-info">
            <span className="score-panel__dimension-title">
              Keyword Usage {hasJobDesc && <span className="score-panel__dimension-badge">Job Match Aktif</span>}
            </span>
            <span className="score-panel__dimension-value">{keywords}/100</span>
          </div>
          <div className="score-panel__progress-bar">
            <div
              className="score-panel__progress-fill score-panel__progress-fill--keywords"
              style={{ width: `${keywords}%` }}
            />
          </div>
        </div>
      </div>

      {/* Accordion Feedback Categories */}
      <div className="score-panel__accordion">
        {/* ⚠️ Important Section */}
        <div className={`score-panel__accordion-group ${openSection === 'important' ? 'score-panel__accordion-group--open' : ''}`}>
          <button
            className="score-panel__accordion-trigger score-panel__accordion-trigger--important"
            onClick={() => toggleSection('important')}
          >
            <div className="score-panel__accordion-title">
              <RiAlertLine className="score-panel__accordion-icon" />
              <span>Important</span>
              <span className="score-panel__accordion-count">{important.length}</span>
            </div>
            {openSection === 'important' ? <RiArrowUpSLine /> : <RiArrowDownSLine />}
          </button>
          {openSection === 'important' && (
            <div className="score-panel__accordion-content">
              <p className="score-panel__accordion-intro">Poin krusial yang HARUS dipenuhi di CV kamu (Harvard & NodeFlair guidelines).</p>
              {renderFeedbackList(important, 'important')}
            </div>
          )}
        </div>

        {/* 💡 Recommended Section */}
        <div className={`score-panel__accordion-group ${openSection === 'recommended' ? 'score-panel__accordion-group--open' : ''}`}>
          <button
            className="score-panel__accordion-trigger score-panel__accordion-trigger--recommended"
            onClick={() => toggleSection('recommended')}
          >
            <div className="score-panel__accordion-title">
              <RiLightbulbLine className="score-panel__accordion-icon" />
              <span>Recommended</span>
              <span className="score-panel__accordion-count">{recommended.length}</span>
            </div>
            {openSection === 'recommended' ? <RiArrowUpSLine /> : <RiArrowDownSLine />}
          </button>
          {openSection === 'recommended' && (
            <div className="score-panel__accordion-content">
              <p className="score-panel__accordion-intro">Saran peningkatan yang sangat dianjurkan oleh praktisi HR.</p>
              {renderFeedbackList(recommended, 'recommended')}
            </div>
          )}
        </div>

        {/* 👍 Nice To Have Section */}
        <div className={`score-panel__accordion-group ${openSection === 'niceTohave' ? 'score-panel__accordion-group--open' : ''}`}>
          <button
            className="score-panel__accordion-trigger score-panel__accordion-trigger--niceTohave"
            onClick={() => toggleSection('niceTohave')}
          >
            <div className="score-panel__accordion-title">
              <RiThumbUpLine className="score-panel__accordion-icon" />
              <span>Nice To Have</span>
              <span className="score-panel__accordion-count">{niceTohave.length}</span>
            </div>
            {openSection === 'niceTohave' ? <RiArrowUpSLine /> : <RiArrowDownSLine />}
          </button>
          {openSection === 'niceTohave' && (
            <div className="score-panel__accordion-content">
              <p className="score-panel__accordion-intro">Poin tambahan untuk membuat CV kamu lebih unik dibanding kandidat lain.</p>
              {renderFeedbackList(niceTohave, 'niceTohave')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
