/**
 * PitchDetector component - always-visible tuner strip with a moving marker
 * showing detected pitch relative to the nearest note.
 */
import { useMemo } from 'react'
import { usePitchDetection } from '../../context'
import { isNoteInScale } from '../../data'
import type { NoteNames } from '../../types'
import { Note } from 'tonal'
import { reportError } from '../../utils'
import styles from './PitchDetector.module.css'

interface PitchDetectorProps {
  scaleNotes: NoteNames
}

export function PitchDetector({ scaleNotes }: PitchDetectorProps) {
  const { isListening, startListening, stopListening, pitchResult, lastPitchResult, error, isSupported, referenceHz, setReferenceHz } = usePitchDetection()

  // Show current pitch, or fall back to last detected pitch so display doesn't flash
  const displayNote = pitchResult?.note ?? lastPitchResult?.note ?? null
  const displayCents = pitchResult ? pitchResult.cents : (lastPitchResult ? lastPitchResult.cents : 0)
  const hasSignal = pitchResult !== null

  const handleToggleMic = async () => {
    if (isListening) {
      stopListening()
    } else {
      try {
        await startListening()
      } catch (err) {
        reportError(err, { context: 'PitchDetector.startListening' })
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
          title="Audio is analyzed in your browser only — nothing is recorded or uploaded."
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

        <div className={`${styles.centsReadout} ${tuningCategory ? styles[tuningCategory] : ''} ${!displayNote || !hasSignal ? styles.faded : ''}`}>
          {displayNote ? <>{displayCents > 0 ? '+' : ''}{displayCents}¢</> : isListening ? '···' : ''}
        </div>

        <label className={styles.referenceHz} title="Reference pitch for A4 (most harmonicas use 442-443 Hz)">
          <span className={styles.referenceHzLabel}>A4</span>
          <input
            className={styles.referenceHzInput}
            type="number"
            min={410}
            max={460}
            step={1}
            value={referenceHz}
            onChange={(e) => setReferenceHz(Number(e.target.value))}
            aria-label="Reference pitch in Hz"
          />
          <span className={styles.referenceHzUnit}>Hz</span>
        </label>

      </div>

      {/*
        Screen-reader live region. Announces the note name and scale membership only —
        intentionally NOT the cents value, which updates ~60x/sec and would flood
        assistive tech. noteLabel / noteInScale change infrequently enough to be useful.
      */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {noteLabel ? `Detected ${noteLabel}, ${noteInScale ? 'in scale' : 'not in scale'}` : ''}
      </div>

      {error && (
        <div className={styles.errorMessage} role="alert">{error}</div>
      )}
    </div>
  )
}
