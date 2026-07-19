import { useState, useCallback } from 'react'
import { callGroq, callJobMatch, callSummaryAction, callGithubProjectAnalysis } from '../utils/groqClient'

const MAX_HISTORY = 20

export function useAI() {
  // Chat messages displayed in UI: { id, role: 'user'|'assistant', content, patch? }
  const [chatMessages, setChatMessages] = useState([])
  // Raw API history (role + content only, no UI metadata)
  const [apiHistory, setApiHistory] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  // Pending patch waiting for confirmation: { patch, confirmMessage }
  const [pendingPatch, setPendingPatch] = useState(null)

  /**
   * Send a message to the AI with full CV context.
   * Pipeline: AIChat → sendMessage → callGroq → return patch → applyPatch (via callback)
   */
  const sendMessage = useCallback(async (userText, cvData) => {
    if (!userText.trim() || isLoading) return

    setError(null)
    const userMsg = { role: 'user', content: userText }

    // Add user message to UI
    const userChatMsg = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: userText,
    }
    setChatMessages(prev => [...prev, userChatMsg])

    // Build new API history (circular buffer: keep last MAX_HISTORY messages)
    const newApiHistory = [...apiHistory, userMsg].slice(-MAX_HISTORY)
    setApiHistory(newApiHistory)

    setIsLoading(true)
    try {
      const aiResponse = await callGroq(newApiHistory, cvData)

      // Add AI reply to UI
      const aiChatMsg = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: aiResponse.message,
        patch: aiResponse,
      }
      setChatMessages(prev => [...prev, aiChatMsg])

      // Update API history with assistant reply (without CV context bloat)
      const assistantApiMsg = { role: 'assistant', content: aiResponse.message }
      setApiHistory(prev => [...prev, assistantApiMsg].slice(-MAX_HISTORY))

      // Return the patch for the calling component to handle
      return aiResponse
    } catch (err) {
      const errMsg = err.message ?? 'Terjadi kesalahan saat menghubungi AI.'
      setError(errMsg)
      setChatMessages(prev => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          role: 'assistant',
          content: `❌ ${errMsg}`,
          isError: true,
        },
      ])
      return null
    } finally {
      setIsLoading(false)
    }
  }, [apiHistory, isLoading])

  /**
   * Match CV data with job description using AI.
   */
  const matchWithJob = useCallback(async (cvData, jobDescription) => {
    if (!jobDescription.trim() || isLoading) return null
    setIsLoading(true)
    setError(null)
    try {
      const res = await callJobMatch(cvData, jobDescription)
      return res
    } catch (err) {
      const errMsg = err.message ?? 'Gagal mencocokkan CV dengan job description.'
      setError(errMsg)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [isLoading])

  /**
   * Perform summary action (enhance, fix-grammar, highlight-keywords, etc.) using AI.
   */
  const enhanceSummary = useCallback(async (currentSummary, cvData, action) => {
    if (isLoading) return null
    setIsLoading(true)
    setError(null)
    try {
      const res = await callSummaryAction(currentSummary, cvData, action)
      return res
    } catch (err) {
      const errMsg = err.message ?? 'Gagal memproses Summary dengan AI.'
      setError(errMsg)
      throw err // Re-throw so caller gets the actual error message
    } finally {
      setIsLoading(false)
    }
  }, [isLoading])

  /**
   * Called when user confirms a pending destructive action.
   */
  const confirmPatch = useCallback(() => {
    const patch = pendingPatch
    setPendingPatch(null)
    return patch
  }, [pendingPatch])

  /**
   * Called when user cancels a pending action.
   */
  const cancelPatch = useCallback(() => {
    setChatMessages(prev => [
      ...prev,
      {
        id: `msg_cancel_${Date.now()}`,
        role: 'assistant',
        content: 'Baik, perubahan dibatalkan.',
      },
    ])
    setPendingPatch(null)
  }, [])

  const clearChat = useCallback(() => {
    setChatMessages([])
    setApiHistory([])
    setPendingPatch(null)
    setError(null)
  }, [])

  /**
   * Analyze GitHub repo metadata and readme content to generate a CV project.
   */
  const analyzeGithubRepo = useCallback(async (repoMetadata, readmeText) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await callGithubProjectAnalysis(repoMetadata, readmeText)
      return res
    } catch (err) {
      const errMsg = err.message ?? 'Gagal menganalisis repositori GitHub.'
      setError(errMsg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    chatMessages,
    isLoading,
    error,
    pendingPatch,
    setPendingPatch,
    sendMessage,
    matchWithJob,
    enhanceSummary,
    analyzeGithubRepo,
    confirmPatch,
    cancelPatch,
    clearChat,
  }
}

