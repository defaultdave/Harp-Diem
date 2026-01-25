/**
 * Context for managing display settings across the harmonica visualization.
 * @packageDocumentation
 */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react'

export type NoteDisplayMode = 'notes' | 'tab'

interface DisplaySettingsContextValue {
  noteDisplay: NoteDisplayMode
  showDegrees: boolean
  showIntervals: boolean
  setNoteDisplay: (mode: NoteDisplayMode) => void
  setShowDegrees: (show: boolean) => void
  setShowIntervals: (show: boolean) => void
}

const DisplaySettingsContext = createContext<DisplaySettingsContextValue | null>(null)

interface DisplaySettingsProviderProps {
  children: ReactNode
}

/** Provider for display settings (note display mode, scale degrees, intervals). */
export function DisplaySettingsProvider({ children }: DisplaySettingsProviderProps) {
  const [noteDisplay, setNoteDisplay] = useState<NoteDisplayMode>('notes')
  const [showDegrees, setShowDegrees] = useState(false)
  const [showIntervals, setShowIntervals] = useState(false)

  return (
    <DisplaySettingsContext.Provider
      value={{ noteDisplay, showDegrees, showIntervals, setNoteDisplay, setShowDegrees, setShowIntervals }}
    >
      {children}
    </DisplaySettingsContext.Provider>
  )
}

/** Hook to access display settings. Must be used within DisplaySettingsProvider. */
export function useDisplaySettings(): DisplaySettingsContextValue {
  const context = useContext(DisplaySettingsContext)
  if (!context) {
    throw new Error('useDisplaySettings must be used within a DisplaySettingsProvider')
  }
  return context
}
