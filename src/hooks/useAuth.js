import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'

export function useAuth() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    if (!supabase) return { error: new Error('Supabase not configured') }
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
  }

  const signOut = async () => {
    if (!supabase) return { error: new Error('Supabase not configured') }
    return supabase.auth.signOut()
  }

  return {
    session,
    user: session?.user || null,
    loading,
    signInWithGoogle,
    signOut,
  }
}
