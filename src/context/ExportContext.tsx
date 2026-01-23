/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode, type RefObject } from 'react'
import type { ExportOptions } from '../utils/export'

interface ExportContextValue {
  exportOptions: ExportOptions | null
  targetRef: RefObject<HTMLElement | null> | null
  setExportConfig: (options: ExportOptions | null, ref: RefObject<HTMLElement | null> | null) => void
}

const ExportContext = createContext<ExportContextValue | null>(null)

export function ExportProvider({ children }: { children: ReactNode }) {
  const [exportOptions, setExportOptions] = useState<ExportOptions | null>(null)
  const [targetRef, setTargetRef] = useState<RefObject<HTMLElement | null> | null>(null)

  const setExportConfig = useCallback(
    (options: ExportOptions | null, ref: RefObject<HTMLElement | null> | null) => {
      setExportOptions(options)
      setTargetRef(ref)
    },
    []
  )

  return (
    <ExportContext.Provider value={{ exportOptions, targetRef, setExportConfig }}>
      {children}
    </ExportContext.Provider>
  )
}

export function useExport() {
  const context = useContext(ExportContext)
  if (!context) {
    throw new Error('useExport must be used within ExportProvider')
  }
  return context
}
