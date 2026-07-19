import { useState, useEffect, useCallback } from 'react'

const LIBRARY_KEY = 'cv_maker_library_v1'
const MAX_CVS = 10

function generateId() {
  return 'cv_' + Math.random().toString(36).substr(2, 9)
}

export function useCVLibrary() {
  const [library, setLibrary] = useState({ activeCvId: null, list: [] })

  useEffect(() => {
    const stored = localStorage.getItem(LIBRARY_KEY)
    if (stored) {
      setLibrary(JSON.parse(stored))
    } else {
      const defaultId = generateId()
      const defaultLibrary = {
        activeCvId: defaultId,
        list: [{ id: defaultId, name: 'My CV', updatedAt: Date.now() }]
      }
      setLibrary(defaultLibrary)
      localStorage.setItem(LIBRARY_KEY, JSON.stringify(defaultLibrary))
    }
  }, [])

  const createNewCV = useCallback(async (name = 'New CV') => {
    let newCvId = null
    
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
  }, [])

  const duplicateCV = useCallback(async (sourceId) => {
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

    // Duplicate local storage content
    if (newId) {
       const sourceKey = sourceId === 'default' ? 'cv_maker_data_v1' : `cv_maker_cv_${sourceId}`
       const sourceData = localStorage.getItem(sourceKey)
       if (sourceData) {
         localStorage.setItem(`cv_maker_cv_${newId}`, sourceData)
       }
    }
  }, [])

  const deleteCV = useCallback(async (idToDelete) => {
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

    localStorage.removeItem(`cv_maker_cv_${idToDelete}`)
  }, [])

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
    if (!newName.trim()) return
    
    setLibrary(prev => {
      const newLib = {
        ...prev,
        list: prev.list.map(cv => cv.id === id ? { ...cv, name: newName, updatedAt: Date.now() } : cv)
      }
      localStorage.setItem(LIBRARY_KEY, JSON.stringify(newLib))
      return newLib
    })
  }, [])

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
    isSyncing: false,
    createNewCV,
    duplicateCV,
    deleteCV,
    switchToCV,
    renameCV,
    updateCVTimestamp
  }
}
