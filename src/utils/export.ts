/**
 * @packageDocumentation
 * Export utilities for PNG, PDF, and print functionality.
 *
 * @remarks
 * This module provides the eagerly-loaded export functions.
 * For lazy-loaded versions that reduce initial bundle size,
 * see {@link ./exportLazy}.
 *
 * @category Utils
 */
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

/**
 * Metadata for generating export filenames.
 */
export interface ExportOptions {
  /** Key of the harmonica (e.g., "G") */
  harmonicaKey: string
  /** Key of the song/scale (e.g., "D") */
  songKey: string
  /** Type of scale (e.g., "blues", "major") */
  scaleType: string
  /** Harmonica position (1-12) */
  position: number
}

/**
 * Exports an element as a PNG image.
 *
 * @remarks
 * Uses html2canvas to render the element to a canvas, then converts
 * to PNG and triggers a download. For lazy-loaded version, see
 * {@link ./exportLazy.exportAsPNG}.
 *
 * @param element - The HTML element to export
 * @param options - Export metadata for generating filename
 * @throws Error if element is null or export fails
 */
export async function exportAsPNG(element: HTMLElement | null, options: ExportOptions): Promise<void> {
  if (!element) {
    throw new Error('No element provided for export')
  }
  
  try {
    const canvas = await html2canvas(element, {
      // White background ensures print-friendly output regardless of theme
      backgroundColor: '#ffffff',
      scale: 2, // Higher resolution for better quality
      logging: false,
      useCORS: true,
    })

    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) {
          resolve(b)
        } else {
          reject(new Error('Failed to convert canvas to blob'))
        }
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
 * Exports an element as a PDF document.
 *
 * @remarks
 * Uses html2canvas and jspdf to render the element to a landscape A4 PDF.
 * For lazy-loaded version, see {@link ./exportLazy.exportAsPDF}.
 *
 * @param element - The HTML element to export
 * @param options - Export metadata for generating filename
 * @throws Error if element is null or export fails
 */
export async function exportAsPDF(element: HTMLElement | null, options: ExportOptions): Promise<void> {
  if (!element) {
    throw new Error('No element provided for export')
  }
  
  try {
    const canvas = await html2canvas(element, {
      // White background ensures print-friendly output regardless of theme
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
 * Opens the browser's print dialog for the current page.
 */
export function printView(): void {
  window.print()
}

/**
 * Generates a descriptive file name for exports.
 * @internal
 */
function generateFileName(options: ExportOptions, extension: 'png' | 'pdf'): string {
  const { harmonicaKey, songKey, scaleType, position } = options
  const timestamp = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  const scaleName = scaleType.charAt(0).toUpperCase() + scaleType.slice(1)
  const positionSuffix = getOrdinalSuffix(position)
  
  return `harp-diem_${harmonicaKey}-harp_${songKey}-${scaleName}_${position}${positionSuffix}-pos_${timestamp}.${extension}`
}

/**
 * Gets the ordinal suffix for a position number.
 * @internal
 */
function getOrdinalSuffix(position: number): string {
  if (position === 1) return 'st'
  if (position === 2) return 'nd'
  if (position === 3) return 'rd'
  return 'th'
}
