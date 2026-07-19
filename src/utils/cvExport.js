const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/**
 * Generate a CV filename matching the D:\CV naming convention:
 * YYYY-MM_MonthName-OwnerName-resume
 * e.g. 2026-07_July-Cantikaputri Febrianti-resume
 *
 * @param {string} ownerName  - CV owner's full name
 * @param {Date}   date       - Target month/year (default: now)
 * @returns {string}          - Filename WITHOUT extension
 */
export function generateCVFilename(ownerName, date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const monthName = MONTH_NAMES[date.getMonth()]
  const name = ownerName || 'Resume'
  return `${year}-${month}_${monthName}-${name}-resume`
}

/**
 * Export CV data as a JSON file with the naming convention filename.
 * @param {Object} data
 * @param {string} ownerName
 * @param {Date}   date
 */
export function downloadJSON(data, ownerName, date = new Date()) {
  const filename = generateCVFilename(ownerName, date) + '.json'
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Reads and parses a JSON file.
 * @param {File} file
 * @returns {Promise<Object>}
 */
export function readJSONFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        resolve(JSON.parse(e.target.result))
      } catch {
        reject(new Error('File tidak valid: bukan JSON yang dapat dibaca'))
      }
    }
    reader.onerror = () => reject(new Error('Gagal membaca file'))
    reader.readAsText(file)
  })
}

/**
 * Trigger browser print dialog (for PDF export).
 */
export function printToPDF() {
  window.print()
}

export { MONTH_NAMES }
