import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from './useAuth'

const LIBRARY_KEY = 'cv_maker_library_v1'
const MAX_CVS = 10

function generateId() {
  return 'cv_' + Math.random().toString(36).substr(2, 9)
}

export function useCVLibrary() {
  const { user } = useAuth()
  const [library, setLibrary] = useState({ activeCvId: null, list: [] })
  const [isSyncing, setIsSyncing] = useState(true)

  // Initial load: offline cache + Supabase sync
  useEffect(() => {
    let isMounted = true

    const loadLibrary = async () => {
      if (!user) {
        setIsSyncing(false)
        return
      }
      setIsSyncing(true)
      
      try {
        // Try to load offline cache first for instant UI
        const stored = localStorage.getItem(LIBRARY_KEY)
        if (stored) {
          setLibrary(JSON.parse(stored))
        }

        // Fetch from Supabase
        if (supabase) {
          const { data, error } = await supabase
            .from('cv_documents')
            .select('id, name, updated_at')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })

          if (error) throw error

          if (isMounted) {
            if (data && data.length > 0) {
              const newList = data.map(d => ({
                id: d.id,
                name: d.name,
                updatedAt: new Date(d.updated_at).getTime()
              }))
              
              setLibrary(prev => {
                // Ensure activeCvId is valid
                let activeId = prev.activeCvId
                if (!activeId || !newList.some(cv => cv.id === activeId)) {
                  activeId = newList[0].id
                }
                const newLibrary = { activeCvId: activeId, list: newList }
                localStorage.setItem(LIBRARY_KEY, JSON.stringify(newLibrary))
                return newLibrary
              })
            } else {
              // If empty in Supabase but we have a user, maybe it's their first time.
              // Let's create a default CV for them.
              const defaultId = generateId()
              const defaultLibrary = {
                activeCvId: defaultId,
                list: [{ id: defaultId, name: 'My CV', updatedAt: Date.now() }]
              }
              setLibrary(defaultLibrary)
              localStorage.setItem(LIBRARY_KEY, JSON.stringify(defaultLibrary))
            }
          }
        }
      } catch (err) {
        console.error('Failed to load library from Supabase', err)
      } finally {
        if (isMounted) setIsSyncing(false)
      }
    }

    loadLibrary()
    return () => { isMounted = false }
  }, [user])

  const createNewCV = useCallback(async (name = 'New CV') => {
    if (!user) return null
    let newCvId = null
    
    // Optimistic UI update
    setLibrary(prev => {
      if (prev.list.length >= MAX_CVS) {
        alert(`Batas maksimal CV tercapai (${MAX_CVS}). Hapus CV lama untuk membuat yang baru.`)
        return prev
      }
      newCvId = generateId()
      const newLibrary = {
        activeCvId: newCvId,
        list: [
          { id: newCvId, name, updatedAt: Date.now() },
          ...prev.list
        ]
      }
      localStorage.setItem(LIBRARY_KEY, JSON.stringify(newLibrary))
      return newLibrary
    })

    return newCvId
  }, [user])

  const duplicateCV = useCallback(async (sourceId) => {
    if (!user) return null
    
    // We will handle the duplication of the actual data in the component or useCVData.
    // For now, let's just do the metadata optimistic update.
    let newId = null
    setLibrary(prev => {
      if (prev.list.length >= MAX_CVS) {
        alert(`Batas maksimal CV tercapai (${MAX_CVS}).`)
        return prev
      }
      
      const sourceMeta = prev.list.find(cv => cv.id === sourceId)
      if (!sourceMeta) return prev

      newId = generateId()
      const newLibrary = {
        activeCvId: newId,
        list: [
          { id: newId, name: `${sourceMeta.name} (Copy)`, updatedAt: Date.now() },
          ...prev.list
        ]
      }
      localStorage.setItem(LIBRARY_KEY, JSON.stringify(newLibrary))
      return newLibrary
    })
    
    if (newId && supabase) {
      // Fetch source data from Supabase to duplicate
      const { data: sourceData } = await supabase
        .from('cv_documents')
        .select('data')
        .eq('id', sourceId)
        .single()
        
      if (sourceData) {
        await supabase.from('cv_documents').insert({
          id: newId,
          user_id: user.id,
          name: `${library.list.find(c=>c.id===sourceId)?.name || 'CV'} (Copy)`,
          data: sourceData.data
        })
      }
    }
  }, [user, library])

  const deleteCV = useCallback(async (idToDelete) => {
    if (!user) return
    setLibrary(prev => {
      if (prev.list.length <= 1) {
        alert('Anda tidak bisa menghapus satu-satunya CV yang tersisa.')
        return prev
      }

      const confirmDelete = window.confirm('Yakin ingin menghapus CV ini secara permanen?')
      if (!confirmDelete) return prev

      const newList = prev.list.filter(cv => cv.id !== idToDelete)
      const nextActiveId = prev.activeCvId === idToDelete ? newList[0].id : prev.activeCvId

      const newLibrary = { activeCvId: nextActiveId, list: newList }
      localStorage.setItem(LIBRARY_KEY, JSON.stringify(newLibrary))
      return newLibrary
    })

    if (supabase) {
      await supabase.from('cv_documents').delete().eq('id', idToDelete)
    }
    localStorage.removeItem(`cv_maker_cv_${idToDelete}`)
  }, [user])

  const switchToCV = useCallback((id) => {
    setLibrary(prev => {
      const exists = prev.list.some(cv => cv.id === id)
      if (!exists) return prev
      const newLib = { ...prev, activeCvId: id }
      localStorage.setItem(LIBRARY_KEY, JSON.stringify(newLib))
      return newLib
    })
  }, [])

  const renameCV = useCallback(async (id, newName) => {
    if (!newName.trim() || !user) return
    
    setLibrary(prev => {
      const newLib = {
        ...prev,
        list: prev.list.map(cv => cv.id === id ? { ...cv, name: newName, updatedAt: Date.now() } : cv)
      }
      localStorage.setItem(LIBRARY_KEY, JSON.stringify(newLib))
      return newLib
    })

    if (supabase) {
      await supabase.from('cv_documents').update({ name: newName }).eq('id', id)
    }
  }, [user])

  const updateCVTimestamp = useCallback((id) => {
    setLibrary(prev => {
      const newLib = {
        ...prev,
        list: prev.list.map(cv => cv.id === id ? { ...cv, updatedAt: Date.now() } : cv)
      }
      localStorage.setItem(LIBRARY_KEY, JSON.stringify(newLib))
      return newLib
    })
  }, [])

  return {
    cvList: library.list,
    activeCvId: library.activeCvId,
    activeStorageKey: `cv_maker_cv_${library.activeCvId}`,
    isSyncing,
    createNewCV,
    duplicateCV,
    deleteCV,
    switchToCV,
    renameCV,
    updateCVTimestamp
  }
}
