/**
 * Context for managing pitch detection state across the app.
 * Wraps the useMicrophone hook and provides pitch detection state.
 * @packageDocumentation
 */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useRef, type ReactNode } from 'react'
import { useMicrophone } from '../hooks/useMicrophone'
import type { PitchResult } from '../utils/pitchDetection'

const REFERENCE_HZ_KEY = 'harp-diem-tuning-reference'
const DEFAULT_REFERENCE_HZ = 442

function loadReferenceHz(): number {
  try {
    const stored = localStorage.getItem(REFERENCE_HZ_KEY)
    if (stored !== null) {
      const parsed = Number(stored)
      if (!isNaN(parsed) && parsed >= 410 && parsed <= 460) return parsed
    }
  } catch { /* localStorage unavailable */ }
  return DEFAULT_REFERENCE_HZ
}

/** Context value for pitch detection */
interface PitchDetectionContextValue {
  isListening: boolean
  startListening: () => Promise<void>
  stopListening: () => void
  pitchResult: PitchResult | null
  error: string | null
  isSupported: boolean
  setDebugMode: (enabled: boolean, expectedNote?: string) => void
  referenceHz: number
  setReferenceHz: (hz: number) => void
}

const PitchDetectionContext = createContext<PitchDetectionContextValue | null>(null)

interface PitchDetectionProviderProps {
  children: ReactNode
}

/** Provider for pitch detection context. */
export function PitchDetectionProvider({ children }: PitchDetectionProviderProps) {
  const [referenceHz, setReferenceHzState] = useState(loadReferenceHz)
  const referenceHzRef = useRef(referenceHz)

  const setReferenceHz = (hz: number) => {
    const clamped = Math.max(410, Math.min(460, Math.round(hz)))
    referenceHzRef.current = clamped
    setReferenceHzState(clamped)
    try { localStorage.setItem(REFERENCE_HZ_KEY, String(clamped)) } catch { /* ignore */ }
  }

  const microphoneState = useMicrophone(referenceHzRef)

  return (
    <PitchDetectionContext.Provider
      value={{
        isListening: microphoneState.isListening,
        startListening: microphoneState.startListening,
        stopListening: microphoneState.stopListening,
        pitchResult: microphoneState.pitchResult,
        error: microphoneState.error,
        isSupported: microphoneState.isSupported,
        setDebugMode: microphoneState.setDebugMode,
        referenceHz,
        setReferenceHz,
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
