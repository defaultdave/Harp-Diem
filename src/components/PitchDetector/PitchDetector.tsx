/**
 * PitchDetector component - always-visible tuner strip with a moving marker
 * showing detected pitch relative to the nearest note.
 */
import { useState, useMemo, useRef } from 'react'
import { usePitchDetection } from '../../context'
import { isNoteInScale } from '../../data'
import type { NoteNames } from '../../types'
import { Note } from 'tonal'
import styles from './PitchDetector.module.css'

interface PitchDetectorProps {
  scaleNotes: NoteNames
}

export function PitchDetector({ scaleNotes }: PitchDetectorProps) {
  const { isListening, startListening, stopListening, pitchResult, error, isSupported } = usePitchDetection()
  const [lastNote, setLastNote] = useState<string | null>(null)
  const [lastCents, setLastCents] = useState(0)
  const lastNoteRef = useRef<string | null>(null)
  const lastCentsRef = useRef(0)

  // Keep the last detected note visible so the display doesn't flash
  const displayNote = pitchResult?.note ?? lastNote
  const displayCents = pitchResult ? pitchResult.cents : (lastNote ? lastCents : 0)
  const hasSignal = pitchResult !== null

  // Update last known values when we get a result
  if (pitchResult && (pitchResult.note !== lastNoteRef.current || pitchResult.cents !== lastCentsRef.current)) {
    lastNoteRef.current = pitchResult.note
    lastCentsRef.current = pitchResult.cents
    if (pitchResult.note !== lastNote) setLastNote(pitchResult.note)
    if (pitchResult.cents !== lastCents) setLastCents(pitchResult.cents)
  }

  const handleToggleMic = async () => {
    if (isListening) {
      stopListening()
    } else {
      try {
        await startListening()
      } catch (err) {
        console.error('Failed to start microphone:', err)
      }
    }
  }

  // Strip octave for display: "C#4" -> "C#"
  const noteLabel = useMemo(() => {
    if (!displayNote) return null
    return Note.get(displayNote).pc
  }, [displayNote])

  // Check if detected note is in the selected scale
  const noteInScale = useMemo(() => {
    if (!noteLabel) return false
    return isNoteInScale(noteLabel, scaleNotes)
  }, [noteLabel, scaleNotes])

  // Tuning category for color
  const tuningCategory = useMemo(() => {
    if (!displayNote) return null
    const absCents = Math.abs(displayCents)
    if (absCents <= 5) return 'inTune' as const
    if (absCents <= 15) return 'slightlyOff' as const
    return 'outOfTune' as const
  }, [displayNote, displayCents])

  // Marker position: cents -50..+50 mapped to 0%..100%
  const markerPosition = useMemo(() => {
    const clamped = Math.max(-50, Math.min(50, displayCents))
    return ((clamped + 50) / 100) * 100
  }, [displayCents])

  if (!isSupported) {
    return (
      <div className={styles.pitchDetector}>
        <div className={styles.statusMessage}>
          Pitch detection is not supported in this browser.
        </div>
      </div>
    )
  }

  return (
    <div className={styles.pitchDetector}>
      <div className={styles.tunerRow}>
        <button
          className={`${styles.micButton} ${isListening ? styles.listening : ''}`}
          onClick={handleToggleMic}
          aria-label={isListening ? 'Stop microphone' : 'Start microphone'}
          type="button"
        >
          {isListening ? '⏹' : '🎤'}
        </button>

        <div className={styles.tunerStrip} role="meter" aria-label="Pitch tuning meter" aria-valuemin={-50} aria-valuemax={50} aria-valuenow={displayNote ? displayCents : undefined}>
          <span className={styles.flatLabel}>♭</span>

          <div className={styles.meterTrack}>
            {/* Tick marks */}
            <div className={styles.tickCenter} />
            <div className={`${styles.tick} ${styles.tickLeft}`} />
            <div className={`${styles.tick} ${styles.tickRight}`} />

            {/* Note label at center */}
            <div className={`${styles.noteLabel} ${noteInScale ? styles.inScale : ''} ${!displayNote ? styles.noNote : ''}`}>
              {noteLabel ?? '—'}
            </div>

            {/* Moving marker */}
            {displayNote && (
              <div
                className={`${styles.marker} ${tuningCategory ? styles[tuningCategory] : ''} ${!hasSignal ? styles.faded : ''}`}
                style={{ left: `${markerPosition}%` }}
                data-testid="tuning-indicator"
                data-tuning-category={tuningCategory ?? ''}
              />
            )}
          </div>

          <span className={styles.sharpLabel}>♯</span>
        </div>

        {displayNote && (
          <div className={`${styles.centsReadout} ${tuningCategory ? styles[tuningCategory] : ''} ${!hasSignal ? styles.faded : ''}`}>
            {displayCents > 0 ? '+' : ''}{displayCents}¢
          </div>
        )}
        {!displayNote && isListening && (
          <div className={styles.centsReadout}>···</div>
        )}
      </div>

      {error && (
        <div className={styles.errorMessage} role="alert">{error}</div>
      )}
    </div>
  )
}
