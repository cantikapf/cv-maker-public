import { useCallback, useRef } from 'react'
import { RiLinkM, RiBold } from 'react-icons/ri'

/**
 * MarkdownToolbar — Mini toolbar above markdown-enabled textareas.
 * Inserts [text](url) or **text** at current cursor position.
 */
export default function MarkdownToolbar({ textareaRef, onChange, value }) {
  const insertAtCursor = useCallback(
    (before, after, placeholder) => {
      const el = textareaRef?.current
      if (!el) return

      const start = el.selectionStart
      const end = el.selectionEnd
      const selected = value.slice(start, end) || placeholder

      const newText =
        value.slice(0, start) +
        before + selected + after +
        value.slice(end)

      onChange(newText)

      // Re-focus and position cursor inside the inserted syntax
      requestAnimationFrame(() => {
        el.focus()
        const cursorPos = start + before.length + selected.length + after.length
        el.setSelectionRange(
          start + before.length,
          start + before.length + selected.length
        )
      })
    },
    [textareaRef, value, onChange]
  )

  const insertLink = () => {
    insertAtCursor('[', '](https://)', 'teks link')
  }

  const insertBold = () => {
    insertAtCursor('**', '**', 'teks tebal')
  }

  return (
    <div className="md-toolbar">
      <button
        type="button"
        className="md-toolbar__btn"
        onClick={insertBold}
        title="Bold — **teks**"
      >
        <RiBold />
        <span>Bold</span>
      </button>
      <button
        type="button"
        className="md-toolbar__btn"
        onClick={insertLink}
        title="Insert link — [teks](url)"
      >
        <RiLinkM />
        <span>Link</span>
      </button>
      <span className="md-toolbar__hint">
        <code>[teks](url)</code> · <code>**bold**</code>
      </span>
    </div>
  )
}
