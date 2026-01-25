/**
 * @packageDocumentation
 * Lazy-loaded export utilities for PNG, PDF, and print functionality.
 *
 * @remarks
 * This module provides the same export functionality as `export.ts` but
 * lazy-loads html2canvas and jspdf only when needed. This reduces the
 * initial bundle size by ~200KB.
 *
 * @category Utils
 */
import type { ExportOptions } from './export'

/**
 * Exports an element as a PNG image with lazy-loaded dependencies.
 *
 * @remarks
 * Dynamically imports html2canvas only when the export is triggered,
 * keeping it out of the initial bundle. The image is generated with:
 * - White background (print-friendly regardless of theme)
 * - 2x scale for higher resolution
 *
 * @param element - The HTML element to export
 * @param options - Export metadata for generating filename
 * @throws Error if element is null or export fails
 *
 * @example
 * ```typescript
 * const diagramRef = useRef<HTMLDivElement>(null)
 *
 * const handleExport = async () => {
 *   await exportAsPNG(diagramRef.current, {
 *     harmonicaKey: 'G',
 *     songKey: 'D',
 *     scaleType: 'blues',
 *     position: 2
 *   })
 * }
 * ```
 */
export async function exportAsPNG(element: HTMLElement | null, options: ExportOptions): Promise<void> {
  if (!element) {
    throw new Error('No element provided for export')
  }
  
  try {
    // Dynamically import html2canvas only when export is triggered
    const { default: html2canvas } = await import('html2canvas')
    
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
 * Exports an element as a PDF document with lazy-loaded dependencies.
 *
 * @remarks
 * Dynamically imports both html2canvas and jspdf only when the export
 * is triggered. The PDF is generated in landscape A4 format with the
 * image centered on the page.
 *
 * @param element - The HTML element to export
 * @param options - Export metadata for generating filename
 * @throws Error if element is null or export fails
 *
 * @example
 * ```typescript
 * await exportAsPDF(diagramRef.current, {
 *   harmonicaKey: 'C',
 *   songKey: 'G',
 *   scaleType: 'major',
 *   position: 2
 * })
 * ```
 */
export async function exportAsPDF(element: HTMLElement | null, options: ExportOptions): Promise<void> {
  if (!element) {
    throw new Error('No element provided for export')
  }
  
  try {
    // Dynamically import both html2canvas and jspdf only when export is triggered
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf')
    ])
    
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
 *
 * @remarks
 * Simply calls `window.print()`. The print stylesheet in `index.css`
 * handles print-specific styling.
 */
export function printView(): void {
  window.print()
}

/**
 * Generates a descriptive file name for exports.
 *
 * @param options - Export metadata (harmonica key, song key, scale, position)
 * @param extension - File extension (png or pdf)
 * @returns Generated filename in format: harp-diem_{harpKey}-harp_{songKey}-{Scale}_{position}-pos_{date}.{ext}
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
 *
 * @param position - Position number (1-12)
 * @returns Ordinal suffix (st, nd, rd, th)
 * @internal
 */
function getOrdinalSuffix(position: number): string {
  if (position === 1) return 'st'
  if (position === 2) return 'nd'
  if (position === 3) return 'rd'
  return 'th'
}
