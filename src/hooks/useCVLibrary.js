import { useState, useEffect, useCallback } from 'react'

const LIBRARY_KEY = 'cv_maker_library_v1'
const LEGACY_STORAGE_KEY = 'cv_maker_data_v1'
const MAX_CVS = 10

function generateId() {
  return 'cv_' + Math.random().toString(36).substr(2, 9)
}

export function useCVLibrary() {
  const [library, setLibrary] = useState(() => {
    try {
      const stored = localStorage.getItem(LIBRARY_KEY)
      if (stored) {
        return JSON.parse(stored)
      }

      // Migration: Check if legacy data exists
      const legacyData = localStorage.getItem(LEGACY_STORAGE_KEY)
      const defaultId = 'default'
      const now = Date.now()
      
      const initialLibrary = {
        activeCvId: defaultId,
        list: [
          {
            id: defaultId,
            name: 'My CV',
            updatedAt: now
          }
        ]
      }

      if (legacyData) {
        // Copy legacy data to new key
        localStorage.setItem(`cv_maker_cv_${defaultId}`, legacyData)
      }

      localStorage.setItem(LIBRARY_KEY, JSON.stringify(initialLibrary))
      return initialLibrary
    } catch {
      return { activeCvId: 'default', list: [{ id: 'default', name: 'My CV', updatedAt: Date.now() }] }
    }
  })

  // Auto-save library metadata
  useEffect(() => {
    try {
      localStorage.setItem(LIBRARY_KEY, JSON.stringify(library))
    } catch (err) {
      console.error('Failed to save library meta', err)
    }
  }, [library])

  const createNewCV = useCallback((name = 'New CV') => {
    let newCvId = null
    setLibrary(prev => {
      if (prev.list.length >= MAX_CVS) {
        alert(`Batas maksimal CV tercapai (${MAX_CVS}). Hapus CV lama untuk membuat yang baru.`)
        return prev
      }
      const newId = generateId()
      newCvId = newId
      return {
        activeCvId: newId,
        list: [
          { id: newId, name, updatedAt: Date.now() },
          ...prev.list
        ]
      }
    })
    return newCvId
  }, [])

  const duplicateCV = useCallback((sourceId) => {
    setLibrary(prev => {
      if (prev.list.length >= MAX_CVS) {
        alert(`Batas maksimal CV tercapai (${MAX_CVS}).`)
        return prev
      }
      
      const sourceMeta = prev.list.find(cv => cv.id === sourceId)
      if (!sourceMeta) return prev

      const newId = generateId()
      
      // Copy data in localStorage
      try {
        const sourceData = localStorage.getItem(`cv_maker_cv_${sourceId}`) || localStorage.getItem(LEGACY_STORAGE_KEY)
        if (sourceData) {
          localStorage.setItem(`cv_maker_cv_${newId}`, sourceData)
        }
      } catch (err) {
        console.error('Failed to duplicate data', err)
      }

      return {
        activeCvId: newId, // switch to the duplicated one
        list: [
          { id: newId, name: `${sourceMeta.name} (Copy)`, updatedAt: Date.now() },
          ...prev.list
        ]
      }
    })
  }, [])

  const deleteCV = useCallback((idToDelete) => {
    setLibrary(prev => {
      if (prev.list.length <= 1) {
        alert('Anda tidak bisa menghapus satu-satunya CV yang tersisa.')
        return prev
      }

      const confirmDelete = window.confirm('Yakin ingin menghapus CV ini secara permanen?')
      if (!confirmDelete) return prev

      // Remove from localStorage
      localStorage.removeItem(`cv_maker_cv_${idToDelete}`)
      
      const newList = prev.list.filter(cv => cv.id !== idToDelete)
      const nextActiveId = prev.activeCvId === idToDelete ? newList[0].id : prev.activeCvId

      return {
        activeCvId: nextActiveId,
        list: newList
      }
    })
  }, [])

  const switchToCV = useCallback((id) => {
    setLibrary(prev => {
      const exists = prev.list.some(cv => cv.id === id)
      if (!exists) return prev
      return { ...prev, activeCvId: id }
    })
  }, [])

  const renameCV = useCallback((id, newName) => {
    if (!newName.trim()) return
    setLibrary(prev => ({
      ...prev,
      list: prev.list.map(cv => cv.id === id ? { ...cv, name: newName, updatedAt: Date.now() } : cv)
    }))
  }, [])

  const updateCVTimestamp = useCallback((id) => {
    setLibrary(prev => ({
      ...prev,
      list: prev.list.map(cv => cv.id === id ? { ...cv, updatedAt: Date.now() } : cv)
    }))
  }, [])

  return {
    cvList: library.list,
    activeCvId: library.activeCvId,
    activeStorageKey: library.activeCvId === 'default' ? 'cv_maker_data_v1' : `cv_maker_cv_${library.activeCvId}`,
    createNewCV,
    duplicateCV,
    deleteCV,
    switchToCV,
    renameCV,
    updateCVTimestamp
  }
}
