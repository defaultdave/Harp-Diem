import { useState, useRef } from 'react'
import { exportAsPNG, exportAsPDF, printView } from '../../utils/export'
import type { ExportOptions } from '../../utils/export'
import styles from './ExportButton.module.css'

interface ExportButtonProps {
  exportOptions: ExportOptions
  targetRef: React.RefObject<HTMLElement | null>
}

export function ExportButton({ exportOptions, targetRef }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleExport = async (type: 'png' | 'pdf' | 'print') => {
    if (!targetRef.current || isExporting) return

    setShowMenu(false)
    setIsExporting(true)

    try {
      switch (type) {
        case 'png':
          await exportAsPNG(targetRef.current, exportOptions)
          break
        case 'pdf':
          await exportAsPDF(targetRef.current, exportOptions)
          break
        case 'print':
          printView()
          break
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className={styles.exportContainer}>
      <button
        className={styles.exportButton}
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting}
        aria-label="Export options"
        aria-expanded={showMenu}
        aria-haspopup="menu"
      >
        {isExporting ? (
          <>
            <span className={styles.spinner} aria-hidden="true"></span>
            Exporting...
          </>
        ) : (
          <>
            <span aria-hidden="true">📥</span> Export
          </>
        )}
      </button>

      {showMenu && !isExporting && (
        <div
          ref={menuRef}
          className={styles.exportMenu}
          role="menu"
          aria-label="Export format options"
        >
          <button
            className={styles.menuItem}
            onClick={() => handleExport('png')}
            role="menuitem"
            aria-label="Export as PNG image"
          >
            <span aria-hidden="true">🖼️</span> Export as PNG
          </button>
          <button
            className={styles.menuItem}
            onClick={() => handleExport('pdf')}
            role="menuitem"
            aria-label="Export as PDF document"
          >
            <span aria-hidden="true">📄</span> Export as PDF
          </button>
          <button
            className={styles.menuItem}
            onClick={() => handleExport('print')}
            role="menuitem"
            aria-label="Open print dialog"
          >
            <span aria-hidden="true">🖨️</span> Print
          </button>
        </div>
      )}
    </div>
  )
}
