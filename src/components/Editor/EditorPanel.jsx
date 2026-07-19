import { useState } from 'react'
import {
  RiUser3Line,
  RiBriefcaseLine,
  RiGraduationCapLine,
  RiToolsLine,
  RiTranslate2,
  RiAwardLine,
  RiMedalLine,
  RiArticleLine,
  RiCodeSSlashLine,
  RiTeamLine,
  RiRobot2Line,
  RiBarChart2Line,
} from 'react-icons/ri'
import SectionEditor from './SectionEditor'
import ProfilePhotoEditor from './ProfilePhotoEditor'
import AIChat from './AIChat'
import ResumeScorePanel from '../UI/ResumeScorePanel'
import JobMatcher from '../UI/JobMatcher'
import SummaryAIDropdown from '../UI/SummaryAIDropdown'

const ARRAY_SECTIONS = [
  'workExperience',
  'education',
  'skills',
  'languages',
  'certifications',
  'awards',
  'publications',
  'projects',
  'organizationalExperience',
]

export default function EditorPanel({
  cvData,
  onUpdatePersonal,
  onAdd,
  onUpdate,
  onDelete,
  onReorder,
  onPhotoChange,
  chatMessages,
  isLoading,
  pendingPatch,
  onAISend,
  onAIConfirm,
  onAICancel,
  onAIClear,
  scoreData,
  onMatchJob,
  onClearMatch,
  matchResults,
  onAISummaryAction,
  onApplySummary,
  onAnalyzeRepo,
}) {
  const [activeTab, setActiveTab] = useState('personal')
  const { personalInfo } = cvData

  const tabsList = [
    { id: 'personal', label: 'Profil', icon: <RiUser3Line /> },
    { id: 'workExperience', label: 'Pekerjaan', icon: <RiBriefcaseLine /> },
    { id: 'education', label: 'Pendidikan', icon: <RiGraduationCapLine /> },
    { id: 'skills', label: 'Skills', icon: <RiToolsLine /> },
    { id: 'languages', label: 'Bahasa', icon: <RiTranslate2 /> },
    { id: 'certifications', label: 'Sertifikasi', icon: <RiAwardLine /> },
    { id: 'awards', label: 'Penghargaan', icon: <RiMedalLine /> },
    { id: 'publications', label: 'Publikasi', icon: <RiArticleLine /> },
    { id: 'projects', label: 'Proyek', icon: <RiCodeSSlashLine /> },
    { id: 'organizationalExperience', label: 'Organisasi', icon: <RiTeamLine /> },
    { id: 'score', label: `Skor CV (${scoreData?.total ?? 0})`, icon: <RiBarChart2Line /> },
    { id: 'ai', label: 'AI Chat', icon: <RiRobot2Line />, isAI: true },
  ]

  const handleNavigateTab = (tabId, entryIndex) => {
    setActiveTab(tabId)
    // Dynamic navigation when user clicks 'Add Now' or 'Edit Now'
    if (entryIndex !== null && entryIndex !== undefined) {
      setTimeout(() => {
        const elements = document.querySelectorAll('.section-editor__entry')
        if (elements && elements[entryIndex]) {
          elements[entryIndex].scrollIntoView({ behavior: 'smooth' })
          elements[entryIndex].classList.add('section-editor__entry--highlight')
          setTimeout(() => {
            elements[entryIndex].classList.remove('section-editor__entry--highlight')
          }, 2000)
        }
      }, 100)
    }
  }

  return (
    <aside className="editor-panel">
      {/* Tab Navigation */}
      <nav className="editor-tabs">
        {tabsList.map((tab) => (
          <button
            key={tab.id}
            className={`editor-tabs__tab ${activeTab === tab.id ? 'editor-tabs__tab--active' : ''} ${tab.isAI ? 'editor-tabs__tab--ai' : ''} ${tab.id === 'score' ? 'editor-tabs__tab--score' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            title={tab.label}
          >
            <span className="editor-tabs__icon">{tab.icon}</span>
            <span className="editor-tabs__label">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <div className="editor-content">
        {/* ── Personal Info ── */}
        {activeTab === 'personal' && (
          <div className="editor-content__section">
            <h3 className="editor-content__heading">Informasi Pribadi</h3>
            <ProfilePhotoEditor
              photo={personalInfo.photo}
              onPhotoChange={onPhotoChange}
            />
            {[
              { key: 'name', label: 'Nama Lengkap', type: 'text' },
              { key: 'location', label: 'Lokasi', type: 'text' },
              { key: 'email', label: 'Email', type: 'email' },
              { key: 'phone', label: 'Nomor Telepon', type: 'text' },
              { key: 'linkedin', label: 'LinkedIn URL', type: 'text' },
              { key: 'github', label: 'GitHub URL', type: 'text' },
              { key: 'portfolio', label: 'Portfolio URL', type: 'text' },
            ].map((field) => (
              <div key={field.key} className="field">
                <label className="field__label">{field.label}</label>
                <input
                  className="field__input"
                  type={field.type}
                  value={personalInfo[field.key] || ''}
                  onChange={(e) => onUpdatePersonal(field.key, e.target.value)}
                />
              </div>
            ))}
            <div className="field">
              <div className="field__header-row">
                <label className="field__label">Ringkasan / Summary</label>
                <SummaryAIDropdown
                  currentSummary={personalInfo.summary}
                  cvData={cvData}
                  onApplySummary={onApplySummary}
                  onAIAction={onAISummaryAction}
                  isLoading={isLoading}
                />
              </div>
              <textarea
                className="field__input field__input--textarea"
                value={personalInfo.summary || ''}
                onChange={(e) => onUpdatePersonal('summary', e.target.value)}
                rows={5}
              />
            </div>
          </div>
        )}

        {/* ── Array Sections ── */}
        {ARRAY_SECTIONS.includes(activeTab) && (
          <div className="editor-content__section">
            <h3 className="editor-content__heading">
              {tabsList.find((t) => t.id === activeTab)?.label}
            </h3>
            <SectionEditor
              section={activeTab}
              entries={cvData[activeTab] || []}
              onAdd={onAdd}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onReorder={onReorder}
              onAnalyzeRepo={onAnalyzeRepo}
            />
          </div>
        )}

        {/* ── CV Score Tab ── */}
        {activeTab === 'score' && (
          <div className="editor-content__section">
            <h3 className="editor-content__heading">Resume Score & Insights</h3>
            <ResumeScorePanel
              scoreData={scoreData}
              onNavigateTab={handleNavigateTab}
            />
            <hr className="editor-content__divider" />
            <JobMatcher
              cvData={cvData}
              onMatchJob={onMatchJob}
              isLoading={isLoading}
              onClearMatch={onClearMatch}
              matchResults={matchResults}
            />
          </div>
        )}

        {/* ── AI Chat ── */}
        {activeTab === 'ai' && (
          <AIChat
            chatMessages={chatMessages}
            isLoading={isLoading}
            pendingPatch={pendingPatch}
            onSend={onAISend}
            onConfirm={onAIConfirm}
            onCancel={onAICancel}
            onClear={onAIClear}
          />
        )}
      </div>
    </aside>
  )
}

