import { useCallback, useEffect, useState } from 'react'
import { useCVData } from './hooks/useCVData'
import { useCVLibrary } from './hooks/useCVLibrary'
import { useAI } from './hooks/useAI'
import { useAuth } from './hooks/useAuth'
import Toolbar from './components/UI/Toolbar'
import EditorPanel from './components/Editor/EditorPanel'
import CVPreview from './components/Preview/CVPreview'
import ExportDialog from './components/UI/ExportDialog'
import CVLibraryPanel from './components/UI/CVLibraryPanel'
import LoginPage from './components/UI/LoginPage'
import { scoreCV } from './utils/scoreEngine'

export default function App() {
  const {
    cvList,
    activeCvId,
    activeStorageKey,
    createNewCV,
    duplicateCV,
    deleteCV,
    switchToCV,
    renameCV,
    updateCVTimestamp
  } = useCVLibrary()

  const {
    cvData,
    undo, redo, canUndo, canRedo,
    updatePersonalInfo,
    addEntry,
    updateEntry,
    deleteEntry,
    reorderEntries,
    applyPatch,
    exportJSON,
    importFile,
    resetToDefault,
    toggleSectionVisibility,
    addCustomSection,
    updateCustomSection,
    deleteCustomSection,
  } = useCVData(activeStorageKey)

  const {
    chatMessages,
    isLoading,
    pendingPatch,
    setPendingPatch,
    sendMessage,
    matchWithJob,
    enhanceSummary,
    confirmPatch,
    cancelPatch,
    clearChat,
    analyzeGithubRepo,
  } = useAI()

  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [isLibraryOpen, setIsLibraryOpen] = useState(false)
  const [jobDescription, setJobDescription] = useState('')
  const [matchResults, setMatchResults] = useState(null)

  // Calculate CV score dynamically whenever cvData or jobDescription changes
  const scoreData = scoreCV(cvData, jobDescription)

  // ── Global keyboard shortcuts: Ctrl+Z / Ctrl+Y ─────────────────────────
  useEffect(() => {
    const handler = (e) => {
      const activeTag = document.activeElement?.tagName
      // Don't intercept when typing in an input or textarea
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return

      if (e.ctrlKey && !e.shiftKey && e.key === 'z') {
        e.preventDefault()
        undo()
      } else if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo])

  // Update timestamp whenever CV data mutates significantly
  useEffect(() => {
    updateCVTimestamp(activeCvId)
  }, [cvData, activeCvId, updateCVTimestamp])

  // ── AI send handler (linear pipeline) ──────────────────────────────────
  const handleAISend = useCallback(
    async (text) => {
      const response = await sendMessage(text, cvData)
      if (!response) return

      const { action } = response
      if (action === 'confirm_required') {
        setPendingPatch(response)
      } else if (action === 'batch_update') {
        // Batch updates always require confirmation — show summary before applying
        setPendingPatch({ ...response, action: 'batch_update' })
      } else if (action && action !== 'none') {
        applyPatch(response)
      }
    },
    [sendMessage, cvData, applyPatch, setPendingPatch]
  )

  const handleAIConfirm = useCallback(() => {
    const patch = confirmPatch()
    if (patch) applyPatch(patch)
  }, [confirmPatch, applyPatch])

  // ── Job Match Handlers ──────────────────────────────────────────────────
  const handleMatchJob = useCallback(
    async (jobDesc) => {
      setJobDescription(jobDesc)
      const res = await matchWithJob(cvData, jobDesc)
      if (res) {
        setMatchResults(res)
      }
    },
    [matchWithJob, cvData]
  )

  const handleClearMatch = useCallback(() => {
    setJobDescription('')
    setMatchResults(null)
  }, [])

  // ── Summary Actions Handlers ────────────────────────────────────────────
  const handleAISummaryAction = useCallback(
    async (action) => {
      return await enhanceSummary(cvData.personalInfo?.summary || '', cvData, action)
    },
    [enhanceSummary, cvData]
  )

  const handleApplySummary = useCallback(
    (newSummary) => {
      updatePersonalInfo('summary', newSummary)
    },
    [updatePersonalInfo]
  )

  // ── Photo handler ───────────────────────────────────────────────────────
  const handlePhotoChange = useCallback(
    (base64) => updatePersonalInfo('photo', base64),
    [updatePersonalInfo]
  )

  // ── Import JSON / PDF ───────────────────────────────────────────────────
  const handleImportFile = useCallback(
    async (file) => {
      try {
        await importFile(file)
      } catch (err) {
        alert(`Import gagal: ${err.message}`)
      }
    },
    [importFile]
  )

  // ── Export JSON ─────────────────────────────────────────────────────────
  const handleExportCV = useCallback(
    async (cvId) => {
      try {
        const { downloadJSON } = await import('./utils/cvExport')
        if (cvId === activeCvId) {
          downloadJSON(cvData, cvData.personalInfo?.name)
        } else {
          const storageKey = cvId === 'default' ? 'cv_maker_data_v1' : `cv_maker_cv_${cvId}`
          const stored = localStorage.getItem(storageKey)
          if (stored) {
            const parsed = JSON.parse(stored)
            downloadJSON(parsed, parsed.personalInfo?.name)
          } else {
            alert('CV data not found.')
          }
        }
      } catch (err) {
        console.error('Export failed:', err)
      }
    },
    [activeCvId, cvData]
  )

  // ── Reset ───────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    if (window.confirm('Reset semua data CV ke default? Perubahan yang belum disimpan akan hilang.')) {
      resetToDefault()
    }
  }, [resetToDefault])

  return (
    <div className="app">
      <Toolbar
        onOpenLibrary={() => setIsLibraryOpen(true)}
        onExportPDF={() => setIsExportDialogOpen(true)}
        onExportJSON={() => handleExportCV(activeCvId)}
        onImportFile={handleImportFile}
        onReset={handleReset}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      <main className="app__body">
        <EditorPanel
          cvData={cvData}
          onUpdatePersonal={updatePersonalInfo}
          onAdd={addEntry}
          onUpdate={updateEntry}
          onDelete={deleteEntry}
          onReorder={reorderEntries}
          onPhotoChange={handlePhotoChange}
          chatMessages={chatMessages}
          isLoading={isLoading}
          pendingPatch={pendingPatch}
          onAISend={handleAISend}
          onAIConfirm={handleAIConfirm}
          onAICancel={cancelPatch}
          onAIClear={clearChat}
          scoreData={scoreData}
          onMatchJob={handleMatchJob}
          onClearMatch={handleClearMatch}
          matchResults={matchResults}
          onAISummaryAction={handleAISummaryAction}
          onApplySummary={handleApplySummary}
          onAnalyzeRepo={analyzeGithubRepo}
          onToggleSectionVisibility={toggleSectionVisibility}
          onAddCustomSection={addCustomSection}
          onUpdateCustomSection={updateCustomSection}
          onDeleteCustomSection={deleteCustomSection}
        />

        <section className="preview-panel">
          <CVPreview cvData={cvData} />
        </section>
      </main>

      {isExportDialogOpen && (
        <ExportDialog
          cvData={cvData}
          ownerName={cvData.personalInfo?.name}
          onClose={() => setIsExportDialogOpen(false)}
        />
      )}

      {isLibraryOpen && (
        <CVLibraryPanel
          cvList={cvList}
          activeCvId={activeCvId}
          onClose={() => setIsLibraryOpen(false)}
          onCreate={createNewCV}
          onSwitch={switchToCV}
          onDuplicate={duplicateCV}
          onRename={renameCV}
          onDelete={deleteCV}
          onExport={handleExportCV}
        />
      )}
    </div>
  )
}

