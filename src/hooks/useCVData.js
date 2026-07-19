import { useState, useEffect, useCallback, useRef } from 'react'
import { defaultCV } from '../data/defaultCV'
import { downloadJSON } from '../utils/cvExport'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from './useAuth'

const MAX_HISTORY = 50

export function useCVData(storageKey = 'cv_maker_data_v1') {
  const { user } = useAuth()
  const [cvData, setCvData] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        let modified = false
        // Migrate skills from object to array (architecture migration, v1.1 → v1.2)
        if (parsed.skills && !Array.isArray(parsed.skills)) {
          const newSkills = []
          if (parsed.skills.technology) {
            newSkills.push({ id: 'skill_' + Date.now() + '1', category: 'Technology Skills', items: parsed.skills.technology })
          }
          if (parsed.skills.businessProfessional) {
            newSkills.push({ id: 'skill_' + Date.now() + '2', category: 'Business & Professional Skills', items: parsed.skills.businessProfessional })
          }
          parsed.skills = newSkills
          modified = true
        }

        if (modified) {
          localStorage.setItem(storageKey, JSON.stringify(parsed))
        }
        return parsed
      }
      return defaultCV
    } catch {
      return defaultCV
    }
  })

  // ── Undo / Redo stacks (useRef — no re-render on push/pop) ──────────────
  const undoStack = useRef([])
  const redoStack = useRef([])
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  // Listen for storageKey changes (when user switches CV)
  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      let parsed = defaultCV
      
      // 1. Try local cache first for instant UI
      try {
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          parsed = JSON.parse(stored)
          if (isMounted) setCvData(parsed)
        } else if (isMounted) {
          setCvData(defaultCV)
        }
      } catch {
        if (isMounted) setCvData(defaultCV)
      }

      // 2. Try fetching from Supabase to get the most up-to-date data
      if (user && supabase) {
        try {
          const cvId = storageKey.replace('cv_maker_cv_', '')
          if (cvId && cvId !== 'cv_maker_data_v1') {
            const { data, error } = await supabase
              .from('cv_documents')
              .select('data')
              .eq('id', cvId)
              .single()

            if (!error && data && isMounted) {
              parsed = data.data
              setCvData(parsed)
              localStorage.setItem(storageKey, JSON.stringify(parsed))
            }
          }
        } catch (err) {
          console.error('[useCVData] Failed to fetch from Supabase:', err)
        }
      }
    }

    loadData()

    // Clear history on switch
    undoStack.current = []
    redoStack.current = []
    setCanUndo(false)
    setCanRedo(false)
    
    return () => { isMounted = false }
  }, [storageKey, user])

  // Auto-save to localStorage AND Supabase on every state change
  useEffect(() => {
    // Save to local storage
    try {
      localStorage.setItem(storageKey, JSON.stringify(cvData))
    } catch (err) {
      console.error('[useCVData] Failed to save to localStorage:', err)
    }

    // Save to Supabase (debounce this in a real-world scenario to save API calls)
    const saveToSupabase = async () => {
      if (!user || !supabase) return
      try {
        const cvId = storageKey.replace('cv_maker_cv_', '')
        if (!cvId || cvId === 'cv_maker_data_v1') return

        await supabase.from('cv_documents').upsert({
          id: cvId,
          user_id: user.id,
          name: cvData.personalInfo?.name || 'My CV', // This might overwrite renamed names, ideally sync from useCVLibrary. For now it's okay or just don't update name here.
          data: cvData,
          updated_at: new Date().toISOString(),
        })
      } catch (err) {
        console.error('[useCVData] Failed to save to Supabase:', err)
      }
    }
    
    // Simple debounce to avoid spamming the DB (500ms)
    const timeoutId = setTimeout(() => {
      saveToSupabase()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [cvData, storageKey, user])

  // ── History helpers ─────────────────────────────────────────────────────
  /** Call BEFORE any state mutation to record current state */
  const recordHistory = useCallback((currentState) => {
    undoStack.current = [...undoStack.current, currentState].slice(-MAX_HISTORY)
    redoStack.current = []
    setCanUndo(true)
    setCanRedo(false)
  }, [])

  /** Wrap setCvData so history is always recorded first */
  const setWithHistory = useCallback((updater) => {
    setCvData(prev => {
      recordHistory(prev)
      return typeof updater === 'function' ? updater(prev) : updater
    })
  }, [recordHistory])

  const undo = useCallback(() => {
    if (!undoStack.current.length) return
    setCvData(prev => {
      const past = [...undoStack.current]
      const target = past.pop()
      undoStack.current = past
      redoStack.current = [prev, ...redoStack.current].slice(0, MAX_HISTORY)
      setCanUndo(past.length > 0)
      setCanRedo(true)
      return target
    })
  }, [])

  const redo = useCallback(() => {
    if (!redoStack.current.length) return
    setCvData(prev => {
      const future = [...redoStack.current]
      const target = future.shift()
      redoStack.current = future
      undoStack.current = [...undoStack.current, prev].slice(-MAX_HISTORY)
      setCanRedo(future.length > 0)
      setCanUndo(true)
      return target
    })
  }, [])

  // ── Personal Info ───────────────────────────────────────────────────────
  const updatePersonalInfo = useCallback((field, value) => {
    setWithHistory(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }))
  }, [setWithHistory])

  // ── Configuration & Custom Sections ──────────────────────────────────────
  const toggleSectionVisibility = useCallback((sectionId) => {
    setWithHistory(prev => {
      const hidden = prev.sectionConfig?.hiddenSections || []
      const isHidden = hidden.includes(sectionId)
      return {
        ...prev,
        sectionConfig: {
          ...prev.sectionConfig,
          hiddenSections: isHidden ? hidden.filter(id => id !== sectionId) : [...hidden, sectionId]
        }
      }
    })
  }, [setWithHistory])

  const addCustomSection = useCallback((title) => {
    const id = `cs_${Date.now()}`
    setWithHistory(prev => ({
      ...prev,
      customSections: [...(prev.customSections || []), { id, title, entries: [] }],
      sectionConfig: {
        ...prev.sectionConfig,
        sectionOrder: [...(prev.sectionConfig?.sectionOrder || []), id]
      }
    }))
    return id
  }, [setWithHistory])

  const updateCustomSection = useCallback((id, title) => {
    setWithHistory(prev => ({
      ...prev,
      customSections: (prev.customSections || []).map(s => s.id === id ? { ...s, title } : s)
    }))
  }, [setWithHistory])

  const deleteCustomSection = useCallback((id) => {
    setWithHistory(prev => ({
      ...prev,
      customSections: (prev.customSections || []).filter(s => s.id !== id),
      sectionConfig: {
        ...prev.sectionConfig,
        sectionOrder: (prev.sectionConfig?.sectionOrder || []).filter(sId => sId !== id)
      }
    }))
  }, [setWithHistory])

  const reorderSectionConfig = useCallback((fromIndex, toIndex) => {
    setWithHistory(prev => {
      const arr = [...(prev.sectionConfig?.sectionOrder || [])]
      const [moved] = arr.splice(fromIndex, 1)
      arr.splice(toIndex, 0, moved)
      return {
        ...prev,
        sectionConfig: {
          ...prev.sectionConfig,
          sectionOrder: arr
        }
      }
    })
  }, [setWithHistory])

  // ── Generic CRUD for array sections (Built-in & Custom) ─────────────────
  const addEntry = useCallback((section, entry) => {
    const id = `${section}_${Date.now()}`
    setWithHistory(prev => {
      if (section.startsWith('cs_')) {
        return {
          ...prev,
          customSections: (prev.customSections || []).map(s => 
            s.id === section ? { ...s, entries: [...(s.entries || []), { ...entry, id }] } : s
          )
        }
      }
      return {
        ...prev,
        [section]: [...(prev[section] || []), { ...entry, id }],
      }
    })
    return id
  }, [setWithHistory])

  const updateEntry = useCallback((section, id, updatedFields) => {
    setWithHistory(prev => {
      if (section.startsWith('cs_')) {
        return {
          ...prev,
          customSections: (prev.customSections || []).map(s => 
            s.id === section ? { 
              ...s, 
              entries: s.entries.map(item => item.id === id ? { ...item, ...updatedFields } : item) 
            } : s
          )
        }
      }
      return {
        ...prev,
        [section]: prev[section].map(item =>
          item.id === id ? { ...item, ...updatedFields } : item
        ),
      }
    })
  }, [setWithHistory])

  const deleteEntry = useCallback((section, id) => {
    setWithHistory(prev => {
      if (section.startsWith('cs_')) {
        return {
          ...prev,
          customSections: (prev.customSections || []).map(s => 
            s.id === section ? { ...s, entries: s.entries.filter(item => item.id !== id) } : s
          )
        }
      }
      return {
        ...prev,
        [section]: prev[section].filter(item => item.id !== id),
      }
    })
  }, [setWithHistory])

  const reorderEntries = useCallback((section, fromIndex, toIndex) => {
    setWithHistory(prev => {
      if (section.startsWith('cs_')) {
        return {
          ...prev,
          customSections: (prev.customSections || []).map(s => {
            if (s.id === section) {
              const arr = [...(s.entries || [])]
              const [moved] = arr.splice(fromIndex, 1)
              arr.splice(toIndex, 0, moved)
              return { ...s, entries: arr }
            }
            return s
          })
        }
      }
      const arr = [...(prev[section] || [])]
      const [moved] = arr.splice(fromIndex, 1)
      arr.splice(toIndex, 0, moved)
      return { ...prev, [section]: arr }
    })
  }, [setWithHistory])

  const reorderSection = useCallback((section, newIdOrder) => {
    setWithHistory(prev => {
      if (!Array.isArray(prev[section]) || !Array.isArray(newIdOrder)) return prev
      const currentItems = [...prev[section]]
      const newItems = []
      newIdOrder.forEach(id => {
        const item = currentItems.find(i => i.id === id)
        if (item) newItems.push(item)
      })
      // Append any items the AI might have missed
      currentItems.forEach(item => {
        if (!newItems.find(i => i.id === item.id)) {
          newItems.push(item)
        }
      })
      return { ...prev, [section]: newItems }
    })
  }, [setWithHistory])

  // ── AI Patch Applicator ─────────────────────────────────────────────────
  // Single pipeline: AI → applyPatch → useCVData → re-render
  const applyPatch = useCallback(
    (patch) => {
      const { action, section, targetId, data, updates } = patch
      if (!action || action === 'none') return

      // Helper: apply a single update operation
      const applySingle = (op) => {
        const { action: opAction, section: opSection, targetId: opTargetId, data: opData } = op
        const effectiveAction = opAction || 'update'
        if (effectiveAction === 'add') {
          addEntry(opSection, opData)
        } else if (effectiveAction === 'update' || effectiveAction === 'improve' || effectiveAction === 'update') {
          if (opSection === 'personalInfo') {
            Object.entries(opData).forEach(([k, v]) => updatePersonalInfo(k, v))
          } else {
            updateEntry(opSection, opTargetId, opData)
          }
        } else if (effectiveAction === 'delete') {
          deleteEntry(opSection, opTargetId)
        }
      }

      if (action === 'batch_update') {
        // Apply each update in the batch sequentially
        if (Array.isArray(updates)) {
          updates.forEach(op => applySingle(op))
        }
      } else if (action === 'add') {
        addEntry(section, data)
      } else if (action === 'update' || action === 'improve') {
        if (section === 'personalInfo') {
          Object.entries(data).forEach(([k, v]) => updatePersonalInfo(k, v))
        } else {
          updateEntry(section, targetId, data)
        }
      } else if (action === 'delete') {
        deleteEntry(section, targetId)
      } else if (action === 'reorder') {
        reorderSection(section, data)
      }
    },
    [addEntry, updateEntry, deleteEntry, updatePersonalInfo, reorderSection]
  )

  // ── Export JSON (with naming convention) ───────────────────────────────
  const exportJSON = useCallback((date) => {
    downloadJSON(cvData, cvData.personalInfo?.name, date)
  }, [cvData])

  // ── Import JSON / PDF ───────────────────────────────────────────────────
  const importFile = useCallback(async (file) => {
    return new Promise((resolve, reject) => {
      // Determine file type
      const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      
      if (isPDF) {
        // PDF flow
        import('../utils/pdfParser').then(async ({ extractTextFromPDF }) => {
          try {
            console.log('Extracting text from PDF...')
            const rawText = await extractTextFromPDF(file)
            console.log('PDF Extracted Text length:', rawText.length)
            
            const { callCVImportMapper } = await import('../utils/groqClient')
            const parsed = await callCVImportMapper(rawText)

            recordHistory(cvData)
            setCvData(parsed)
            resolve()
          } catch (err) {
            reject(err)
          }
        }).catch(err => reject(new Error('Gagal memuat modul PDF Parser.')))
      } else {
        // JSON flow
        const reader = new FileReader()
        reader.onload = async (e) => {
          try {
            const { processImportedJSON } = await import('../utils/cvImportMapper')
            const parsed = await processImportedJSON(e.target.result)
            
            recordHistory(cvData)
            setCvData(parsed)
            resolve()
          } catch (err) {
            reject(err)
          }
        }
        reader.onerror = () => reject(new Error('Gagal membaca file'))
        reader.readAsText(file)
      }
    })
  }, [cvData, recordHistory])

  const resetToDefault = useCallback(() => {
    recordHistory(cvData)
    setCvData(defaultCV)
  }, [cvData, recordHistory])

  return {
    cvData,
    // Undo / Redo
    undo,
    redo,
    canUndo,
    canRedo,
    // CRUD
    updatePersonalInfo,
    addEntry,
    updateEntry,
    deleteEntry,
    reorderEntries,
    applyPatch,
    // Custom Sections & Config
    toggleSectionVisibility,
    addCustomSection,
    updateCustomSection,
    deleteCustomSection,
    reorderSectionConfig,
    // Import / Export
    exportJSON,
    importFile,
    resetToDefault,
  }
}
