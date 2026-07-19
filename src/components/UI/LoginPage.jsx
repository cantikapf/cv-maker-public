import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

export default function LoginPage() {
  const { signInWithGoogle } = useAuth()
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { error } = await signInWithGoogle()
      if (error) throw error
    } catch (err) {
      setError(err.message || 'Gagal login dengan Google.')
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-sans)'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '400px',
        width: '90%'
      }}>
        <h1 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', fontWeight: 600 }}>CV Maker</h1>
        <p style={{ margin: '0 0 2rem 0', color: 'var(--text-secondary)' }}>Login untuk menyimpan dan mengakses CV Anda dari mana saja.</p>
        
        {error && (
          <div style={{ backgroundColor: 'var(--bg-danger)', color: 'white', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <button 
          onClick={handleLogin}
          disabled={isLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: '0.75rem',
            backgroundColor: 'var(--bg-brand)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            fontWeight: 500,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
            transition: 'opacity 0.2s'
          }}
        >
          {isLoading ? 'Memuat...' : 'Login dengan Google'}
        </button>
        
        <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
          Hanya pengguna yang diizinkan (berdasarkan Row Level Security) yang bisa mengakses data pribadi Anda.
        </p>
      </div>
    </div>
  )
}
