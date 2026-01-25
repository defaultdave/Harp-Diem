/**
 * @packageDocumentation
 * Context for managing display settings across the harmonica visualization.
 *
 * @category Context
 */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react'

/**
 * How notes should be displayed in the harmonica visualization.
 *
 * - `'notes'` - Display as musical note names (C, D, E, etc.)
 * - `'tab'` - Display as harmonica tablature (+1, -4, etc.)
 */
export type NoteDisplayMode = 'notes' | 'tab'

/**
 * Context value for display settings.
 *
 * @remarks
 * Controls various display options in the harmonica visualization:
 * - Note display mode (musical notes vs tab notation)
 * - Scale degree visibility
 * - Interval markers visibility
 */
interface DisplaySettingsContextValue {
  /** Current note display mode */
  noteDisplay: NoteDisplayMode
  /** Whether to show scale degree numbers on notes */
  showDegrees: boolean
  /** Whether to show interval markers between scale notes */
  showIntervals: boolean
  /** Sets the note display mode */
  setNoteDisplay: (mode: NoteDisplayMode) => void
  /** Toggles scale degree display */
  setShowDegrees: (show: boolean) => void
  /** Toggles interval marker display */
  setShowIntervals: (show: boolean) => void
}

const DisplaySettingsContext = createContext<DisplaySettingsContextValue | null>(null)

interface DisplaySettingsProviderProps {
  children: ReactNode
}

/**
 * Provider component for display settings context.
 *
 * @remarks
 * Wrap your component tree with this provider to enable display settings
 * throughout the application. Components can then use {@link useDisplaySettings}
 * to access and modify display options.
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <DisplaySettingsProvider>
 *       <HarmonicaView />
 *       <Legend />
 *     </DisplaySettingsProvider>
 *   )
 * }
 * ```
 */
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

/**
 * Hook to access display settings context.
 *
 * @remarks
 * Must be used within a {@link DisplaySettingsProvider}.
 *
 * @returns The display settings context value
 * @throws Error if used outside of DisplaySettingsProvider
 *
 * @example
 * ```tsx
 * function NoteCell({ note }: { note: string }) {
 *   const { noteDisplay, showDegrees } = useDisplaySettings()
 *
 *   return (
 *     <div>
 *       {noteDisplay === 'notes' ? note : getTabNotation(note)}
 *       {showDegrees && <span className="degree">{degree}</span>}
 *     </div>
 *   )
 * }
 * ```
 */
export function useDisplaySettings(): DisplaySettingsContextValue {
  const context = useContext(DisplaySettingsContext)
  if (!context) {
    throw new Error('useDisplaySettings must be used within a DisplaySettingsProvider')
  }
  return context
}
