/**
 * parseMarkdown — Lightweight inline markdown parser for CV text fields.
 *
 * Supported syntax:
 *  [text](url)   → <a href={url} target="_blank" rel="noopener noreferrer">text</a>
 *  **text**      → <strong>text</strong>
 *
 * Returns an array of React nodes (strings and JSX elements).
 * Usage: <p>{parseMarkdown(someText)}</p>
 */

const INLINE_REGEX = /(\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\))/g

/**
 * @param {string} text
 * @returns {Array<string|React.ReactElement>}
 */
export function parseMarkdown(text) {
  if (!text || typeof text !== 'string') return [text || '']

  const nodes = []
  let lastIndex = 0
  let match

  INLINE_REGEX.lastIndex = 0

  while ((match = INLINE_REGEX.exec(text)) !== null) {
    // Push plain text before this match
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }

    if (match[2] !== undefined) {
      // **bold**
      nodes.push(
        <strong key={match.index}>{match[2]}</strong>
      )
    } else if (match[3] !== undefined && match[4] !== undefined) {
      // [text](url)
      const href = match[4].trim()
      const label = match[3]
      const fullHref = href.startsWith('http') ? href : `https://${href}`
      nodes.push(
        <a
          key={match.index}
          href={fullHref}
          target="_blank"
          rel="noopener noreferrer"
          className="cv-link"
        >
          {label}
        </a>
      )
    }

    lastIndex = INLINE_REGEX.lastIndex
  }

  // Trailing plain text
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes.length > 0 ? nodes : [text]
}

/**
 * Checks whether a string contains any markdown syntax.
 * Used to show/hide the live-preview hint in the editor.
 * @param {string} text
 * @returns {boolean}
 */
export function hasMarkdown(text) {
  if (!text) return false
  return /(\*\*.+?\*\*|\[.+?\]\(.+?\))/.test(text)
}
