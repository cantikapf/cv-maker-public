import { useEffect, useRef } from 'react'
import {
  RiSendPlane2Line,
  RiRobot2Line,
  RiUserLine,
  RiDeleteBin6Line,
  RiLoader4Line,
  RiCheckLine,
  RiCloseLine,
} from 'react-icons/ri'
import { useState } from 'react'

export default function AIChat({ chatMessages, isLoading, pendingPatch, onSend, onConfirm, onCancel, onClear }) {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, isLoading])

  const handleSend = () => {
    if (!input.trim() || isLoading) return
    onSend(input.trim())
    setInput('')
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="ai-chat">
      {/* Header */}
      <div className="ai-chat__header">
        <div className="ai-chat__header-info">
          <RiRobot2Line className="ai-chat__header-icon" />
          <div>
            <span className="ai-chat__header-title">Edit with AI</span>
            <span className="ai-chat__header-model">Groq · llama-3.3-70b</span>
          </div>
        </div>
        {chatMessages.length > 0 && (
          <button
            className="btn btn--icon"
            onClick={onClear}
            title="Bersihkan riwayat chat"
          >
            <RiDeleteBin6Line />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="ai-chat__messages">
        {chatMessages.length === 0 && !isLoading && (
          <div className="ai-chat__welcome">
            <RiRobot2Line className="ai-chat__welcome-icon" />
            <h4>Halo! Saya AI editor CV kamu.</h4>
            <p>Coba katakan:</p>
            <div className="ai-chat__suggestions">
              {[
                'Terjemahkan semua isi CV ke Bahasa Inggris profesional',
                'Tambahkan pekerjaan baru di...',
                'Perbaiki bullet points pengalaman di...',
                'Urutkan pengalaman kerja dari yang terbaru',
              ].map((s) => (
                <button
                  key={s}
                  className="ai-chat__suggestion"
                  onClick={() => { setInput(s); textareaRef.current?.focus() }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`ai-chat__bubble ai-chat__bubble--${msg.role} ${msg.isError ? 'ai-chat__bubble--error' : ''}`}
          >
            <div className="ai-chat__bubble-avatar">
              {msg.role === 'user' ? <RiUserLine /> : <RiRobot2Line />}
            </div>
            <div className="ai-chat__bubble-content">
              <p>{msg.content}</p>
              {msg.patch?.action && msg.patch.action !== 'none' && msg.patch.action !== 'confirm_required' && msg.patch.action !== 'batch_update' && (
                <span className="ai-chat__bubble-tag">
                  ✓ CV diperbarui
                </span>
              )}
              {msg.patch?.action === 'batch_update' && (
                <span className="ai-chat__bubble-tag ai-chat__bubble-tag--batch">
                  ⚡ Pembaruan massal siap dikonfirmasi
                </span>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="ai-chat__bubble ai-chat__bubble--assistant">
            <div className="ai-chat__bubble-avatar">
              <RiRobot2Line />
            </div>
            <div className="ai-chat__bubble-content ai-chat__typing">
              <span /><span /><span />
            </div>
          </div>
        )}

        {/* Pending Confirmation Banner */}
        {pendingPatch && (
          <div className="ai-chat__confirm-banner">
            <div className="ai-chat__confirm-header">
              <span className="ai-chat__confirm-icon">
                {pendingPatch.action === 'batch_update' ? '⚡' : '⚠️'}
              </span>
              <span className="ai-chat__confirm-label">
                {pendingPatch.action === 'batch_update' ? 'Konfirmasi Pembaruan Massal' : 'Konfirmasi Perubahan'}
              </span>
            </div>
            <p className="ai-chat__confirm-text">{pendingPatch.confirmMessage}</p>
            <div className="ai-chat__confirm-actions">
              <button className="btn btn--ghost btn--sm" onClick={onCancel}>
                <RiCloseLine /> Batal
              </button>
              <button className="btn btn--primary btn--sm" onClick={onConfirm}>
                <RiCheckLine /> {pendingPatch.action === 'batch_update' ? 'Terapkan Semua' : 'Konfirmasi'}
              </button>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="ai-chat__input-area">
        <textarea
          ref={textareaRef}
          id="ai-chat-input"
          className="ai-chat__input"
          placeholder="Ketik perintah AI... (Enter untuk kirim, Shift+Enter baris baru)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          disabled={isLoading || !!pendingPatch}
        />
        <button
          id="ai-chat-send"
          className="btn btn--primary ai-chat__send"
          onClick={handleSend}
          disabled={!input.trim() || isLoading || !!pendingPatch}
          title="Kirim pesan"
        >
          {isLoading ? <RiLoader4Line className="spin" /> : <RiSendPlane2Line />}
        </button>
      </div>
    </div>
  )
}
