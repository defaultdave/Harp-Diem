/**
 * Microphone access and real-time pitch detection hook.
 * @packageDocumentation
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { detectPitch, type PitchResult, type PitchDebugInfo } from '../utils/pitchDetection'

/** Size of the FFT buffer for frequency analysis */
const FFT_SIZE = 2048

/** Return type for the useMicrophone hook */
export interface UseMicrophoneResult {
  /** Whether the microphone is currently active and listening */
  isListening: boolean
  /** Start microphone capture and pitch detection */
  startListening: () => Promise<void>
  /** Stop microphone capture and cleanup */
  stopListening: () => void
  /** Current pitch detection result, null if no pitch detected or not listening */
  pitchResult: PitchResult | null
  /** Error message if microphone access failed */
  error: string | null
  /** Whether the browser supports the required Web Audio APIs */
  isSupported: boolean
  /** Enable/disable debug logging to console */
  setDebugMode: (enabled: boolean, expectedNote?: string) => void
}

let microphoneAudioContext: AudioContext | null = null

/**
 * Get or create the AudioContext for microphone input.
 * Uses a separate context from the playback AudioContext.
 */
function getMicrophoneAudioContext(): AudioContext {
  if (!microphoneAudioContext) {
    microphoneAudioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  return microphoneAudioContext
}

/**
 * Hook for accessing microphone input and performing real-time pitch detection.
 * Manages MediaStream, AudioContext, and AnalyserNode lifecycle.
 *
 * @returns Object with listening state, control functions, pitch result, error, and support status
 *
 * @example
 * ```tsx
 * function Tuner() {
 *   const { isListening, startListening, stopListening, pitchResult, error } = useMicrophone()
 *
 *   return (
 *     <div>
 *       <button onClick={isListening ? stopListening : startListening}>
 *         {isListening ? 'Stop' : 'Start'}
 *       </button>
 *       {pitchResult && <div>{pitchResult.note} ({pitchResult.cents} cents)</div>}
 *       {error && <div>Error: {error}</div>}
 *     </div>
 *   )
 * }
 * ```
 */
/**
 * Check if the browser supports Web Audio API and getUserMedia
 */
function checkBrowserSupport(): boolean {
  const hasMediaDevices = typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia
  const hasAudioContext = typeof window !== 'undefined' && (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)
  return hasMediaDevices && Boolean(hasAudioContext)
}

export function useMicrophone(): UseMicrophoneResult {
  const [isListening, setIsListening] = useState(false)
  const [pitchResult, setPitchResult] = useState<PitchResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSupported] = useState(checkBrowserSupport)

  const streamRef = useRef<MediaStream | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const debugModeRef = useRef(false)
  const debugExpectedNoteRef = useRef<string | undefined>(undefined)
  const debugCountRef = useRef(0)

  const setDebugMode = useCallback((enabled: boolean, expectedNote?: string) => {
    debugModeRef.current = enabled
    debugExpectedNoteRef.current = expectedNote
    debugCountRef.current = 0
    if (enabled) {
      console.log(`[PitchDebug] Debug mode ON${expectedNote ? ` — expecting: ${expectedNote}` : ''}`)
    } else {
      console.log('[PitchDebug] Debug mode OFF')
    }
  }, [])

  const startListening = useCallback(async () => {
    if (!isSupported) {
      setError('Web Audio API or getUserMedia not supported in this browser')
      return
    }

    try {
      setError(null)

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Create audio context and analyser
      const context = getMicrophoneAudioContext()
      audioContextRef.current = context

      // Resume context if suspended (autoplay policy)
      if (context.state === 'suspended') {
        await context.resume()
      }

      const analyser = context.createAnalyser()
      analyser.fftSize = FFT_SIZE
      analyser.smoothingTimeConstant = 0 // No smoothing — we need raw time-domain data for autocorrelation
      analyserRef.current = analyser

      // Connect microphone to analyser
      const source = context.createMediaStreamSource(stream)
      source.connect(analyser)

      setIsListening(true)

      // Start pitch detection loop
      const dataArray = new Float32Array(analyser.fftSize)
      const debugInfo: PitchDebugInfo = { rms: 0, bestLag: -1, bestCorrelation: -1, confidence: 0, frequency: null, rejectedReason: null, sampleRate: 0, bufferSize: 0 }

      const detectPitchLoop = () => {
        if (!analyserRef.current) return

        // Get time-domain data
        analyserRef.current.getFloatTimeDomainData(dataArray)

        // Detect pitch (pass debug info object when debug mode is on)
        const isDebug = debugModeRef.current
        const result = detectPitch(dataArray, context.sampleRate, isDebug ? debugInfo : undefined)
        setPitchResult(result)

        // Log debug info (throttled to every 15th frame ~4/sec)
        if (isDebug) {
          debugCountRef.current++
          if (debugCountRef.current % 15 === 0) {
            const expected = debugExpectedNoteRef.current
            if (result) {
              console.log(
                `[PitchDebug] DETECTED: ${result.note} (${result.frequency.toFixed(1)} Hz) cents=${result.cents} conf=${result.confidence.toFixed(4)} rms=${debugInfo.rms.toFixed(4)}` +
                (expected ? ` | expected=${expected} match=${result.note.replace(/\d+/, '') === expected.replace(/\d+/, '')}` : '')
              )
            } else {
              console.log(
                `[PitchDebug] REJECTED: reason=${debugInfo.rejectedReason} rms=${debugInfo.rms.toFixed(4)} lag=${debugInfo.bestLag} conf=${debugInfo.confidence.toFixed(4)} freq=${debugInfo.frequency?.toFixed(1) ?? 'n/a'}`
              )
            }
          }
        }

        // Continue loop
        animationFrameRef.current = requestAnimationFrame(detectPitchLoop)
      }

      detectPitchLoop()

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access microphone'
      setError(errorMessage)
      setIsListening(false)
    }
  }, [isSupported])

  const stopListening = useCallback(() => {
    // Cancel animation frame
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    // Stop microphone stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    // Clean up analyser
    if (analyserRef.current) {
      analyserRef.current.disconnect()
      analyserRef.current = null
    }

    // Note: We don't close the AudioContext here because it might be reused
    // The context will be garbage collected when no longer needed

    setIsListening(false)
    setPitchResult(null)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening()
    }
  }, [stopListening])

  return {
    isListening,
    startListening,
    stopListening,
    pitchResult,
    error,
    isSupported,
    setDebugMode,
  }
}
