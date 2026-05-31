import { useState, useRef, useEffect } from 'react'
import { exportAsPNG, exportAsPDF, printView, type ExportOptions, reportError } from '../../utils'
import styles from './ExportButton.module.css'

interface ExportButtonProps {
  exportOptions: ExportOptions
  targetRef: React.RefObject<HTMLElement | null>
}

export function ExportButton({ exportOptions, targetRef }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    if (!showMenu) return

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

  // Close menu on Escape key
  useEffect(() => {
    if (!showMenu) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowMenu(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [showMenu])

  const handleExport = async (type: 'png' | 'pdf' | 'print') => {
    if (!targetRef.current || isExporting) return

    setShowMenu(false)
    setExportError(null)
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
      reportError(error, { context: 'ExportButton', type })
      setExportError(
        type === 'print'
          ? 'Could not open the print dialog. Please try again.'
          : `Could not export as ${type.toUpperCase()}. Please try again.`
      )
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div ref={containerRef} className={styles.exportContainer}>
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

      {exportError && (
        <div
          role="alert"
          style={{
            marginTop: '8px',
            padding: '6px 10px',
            background: 'var(--color-chord-dominant, #c0392b)',
            color: '#fff',
            borderRadius: '4px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>{exportError}</span>
          <button
            type="button"
            onClick={() => setExportError(null)}
            aria-label="Dismiss error"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '1rem',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}
