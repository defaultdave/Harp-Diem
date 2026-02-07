/**
 * Context for managing pitch detection state across the app.
 * Wraps the useMicrophone hook and provides pitch detection state.
 * @packageDocumentation
 */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, type ReactNode } from 'react'
import { useMicrophone } from '../hooks/useMicrophone'
import type { PitchResult } from '../utils/pitchDetection'

/** Context value for pitch detection */
interface PitchDetectionContextValue {
  isListening: boolean
  startListening: () => Promise<void>
  stopListening: () => void
  pitchResult: PitchResult | null
  error: string | null
  isSupported: boolean
}

const PitchDetectionContext = createContext<PitchDetectionContextValue | null>(null)

interface PitchDetectionProviderProps {
  children: ReactNode
}

/** Provider for pitch detection context. */
export function PitchDetectionProvider({ children }: PitchDetectionProviderProps) {
  const microphoneState = useMicrophone()

  return (
    <PitchDetectionContext.Provider
      value={{
        isListening: microphoneState.isListening,
        startListening: microphoneState.startListening,
        stopListening: microphoneState.stopListening,
        pitchResult: microphoneState.pitchResult,
        error: microphoneState.error,
        isSupported: microphoneState.isSupported,
      }}
    >
      {children}
    </PitchDetectionContext.Provider>
  )
}

/** Hook to access pitch detection state. Must be used within PitchDetectionProvider. */
export function usePitchDetection(): PitchDetectionContextValue {
  const context = useContext(PitchDetectionContext)
  if (!context) {
    throw new Error('usePitchDetection must be used within a PitchDetectionProvider')
  }
  return context
}
