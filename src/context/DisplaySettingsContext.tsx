/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react'

export type NoteDisplayMode = 'notes' | 'tab'

interface DisplaySettingsContextValue {
  noteDisplay: NoteDisplayMode
  showDegrees: boolean
  setNoteDisplay: (mode: NoteDisplayMode) => void
  setShowDegrees: (show: boolean) => void
}

const DisplaySettingsContext = createContext<DisplaySettingsContextValue | null>(null)

interface DisplaySettingsProviderProps {
  children: ReactNode
}

export function DisplaySettingsProvider({ children }: DisplaySettingsProviderProps) {
  const [noteDisplay, setNoteDisplay] = useState<NoteDisplayMode>('notes')
  const [showDegrees, setShowDegrees] = useState(false)

  return (
    <DisplaySettingsContext.Provider
      value={{ noteDisplay, showDegrees, setNoteDisplay, setShowDegrees }}
    >
      {children}
    </DisplaySettingsContext.Provider>
  )
}

export function useDisplaySettings(): DisplaySettingsContextValue {
  const context = useContext(DisplaySettingsContext)
  if (!context) {
    throw new Error('useDisplaySettings must be used within a DisplaySettingsProvider')
  }
  return context
}
