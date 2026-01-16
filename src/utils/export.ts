import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export interface ExportOptions {
  harmonicaKey: string
  songKey: string
  scaleType: string
  position: number
}

/**
 * Exports the current harmonica view as a PNG image
 * @param element - The DOM element to capture
 * @param options - Export metadata (harmonica key, song key, scale type)
 * @returns Promise that resolves when download is complete
 */
export async function exportAsPNG(element: HTMLElement | null, options: ExportOptions): Promise<void> {
  if (!element) {
    throw new Error('No element provided for export')
  }
  
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher resolution for better quality
      logging: false,
      useCORS: true,
    })

    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => {
        if (b) resolve(b)
      }, 'image/png')
    })

    // Create download link
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const fileName = generateFileName(options, 'png')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting as PNG:', error)
    throw new Error('Failed to export as PNG')
  }
}

/**
 * Exports the current harmonica view as a PDF document
 * @param element - The DOM element to capture
 * @param options - Export metadata (harmonica key, song key, scale type)
 * @returns Promise that resolves when download is complete
 */
export async function exportAsPDF(element: HTMLElement | null, options: ExportOptions): Promise<void> {
  if (!element) {
    throw new Error('No element provided for export')
  }
  
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true,
    })

    const imgData = canvas.toDataURL('image/png')
    
    // Create PDF in landscape orientation for better harmonica layout
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    })

    // Calculate dimensions to fit the image on the page
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
    const scaledWidth = imgWidth * ratio
    const scaledHeight = imgHeight * ratio

    // Center the image on the page
    const x = (pdfWidth - scaledWidth) / 2
    const y = (pdfHeight - scaledHeight) / 2

    pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight)
    
    const fileName = generateFileName(options, 'pdf')
    pdf.save(fileName)
  } catch (error) {
    console.error('Error exporting as PDF:', error)
    throw new Error('Failed to export as PDF')
  }
}

/**
 * Opens the browser print dialog for the current view
 */
export function printView(): void {
  window.print()
}

/**
 * Generates a descriptive file name for exports
 * @param options - Export metadata
 * @param extension - File extension (png or pdf)
 * @returns Generated file name
 */
function generateFileName(options: ExportOptions, extension: 'png' | 'pdf'): string {
  const { harmonicaKey, songKey, scaleType, position } = options
  const timestamp = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  const scaleName = scaleType.charAt(0).toUpperCase() + scaleType.slice(1)
  const positionSuffix = position === 1 ? 'st' : position === 2 ? 'nd' : position === 3 ? 'rd' : 'th'
  
  return `harp-diem_${harmonicaKey}-harp_${songKey}-${scaleName}_${position}${positionSuffix}-pos_${timestamp}.${extension}`
}
