import * as pdfjsLib from 'pdfjs-dist/build/pdf'

// Configure worker to load from a CDN to avoid Vite bundling issues with web workers
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

/**
 * Extracts text from a given PDF file.
 * @param {File} file - The PDF file object.
 * @returns {Promise<string>} The extracted raw text from all pages.
 */
export async function extractTextFromPDF(file) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    
    fileReader.onload = async function() {
      const typedarray = new Uint8Array(this.result)

      try {
        const loadingTask = pdfjsLib.getDocument(typedarray)
        const pdf = await loadingTask.promise
        
        const numPages = pdf.numPages
        let fullText = ''

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          const page = await pdf.getPage(pageNum)
          const textContent = await page.getTextContent()
          
          const pageText = textContent.items.map(item => item.str).join(' ')
          fullText += pageText + '\n'
        }

        resolve(fullText.trim())
      } catch (error) {
        console.error('Error extracting text from PDF:', error)
        reject(new Error('Gagal mengekstrak teks dari file PDF. Pastikan file tidak diproteksi password dan berisikan teks (bukan hasil scan).'))
      }
    }

    fileReader.onerror = function() {
      reject(new Error('Gagal membaca file.'))
    }

    fileReader.readAsArrayBuffer(file)
  })
}
