/**
 * PitchDetector component - displays microphone input pitch detection
 * with visual tuning feedback and in-scale detection.
 * @packageDocumentation
 */
import { useMemo } from 'react'
import { usePitchDetection } from '../../context'
import { isNoteInScale } from '../../data'
import type { NoteNames } from '../../types'
import { Note } from 'tonal'
import styles from './PitchDetector.module.css'

interface PitchDetectorProps {
  scaleNotes: NoteNames
}

/**
 * Main pitch detector component.
 * Shows microphone controls, detected note, tuning meter, and in-scale feedback.
 */
export function PitchDetector({ scaleNotes }: PitchDetectorProps) {
  const { isListening, startListening, stopListening, pitchResult, error, isSupported } = usePitchDetection()

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

  // Determine tuning accuracy category
  const tuningCategory = useMemo(() => {
    if (!pitchResult) return null
    const absCents = Math.abs(pitchResult.cents)
    if (absCents <= 5) return 'inTune'
    if (absCents <= 15) return 'slightlyOff'
    return 'outOfTune'
  }, [pitchResult])

  // Check if detected note is in the selected scale
  const noteInScale = useMemo(() => {
    if (!pitchResult) return false
    // Strip octave from detected note
    const noteWithoutOctave = Note.get(pitchResult.note).pc
    return isNoteInScale(noteWithoutOctave, scaleNotes)
  }, [pitchResult, scaleNotes])

  // Calculate meter indicator position (cents: -50 to +50 -> position: 0% to 100%)
  const meterPosition = useMemo(() => {
    if (!pitchResult) return 50 // Center
    // Map -50 to 0%, 0 to 50%, +50 to 100%
    return ((pitchResult.cents + 50) / 100) * 100
  }, [pitchResult])

  if (!isSupported) {
    return (
      <div className={styles.pitchDetector}>
        <div className={styles.statusMessage}>
          Pitch detection is not supported in this browser. Please use a modern browser with Web Audio API support.
        </div>
      </div>
    )
  }

  return (
    <div className={styles.pitchDetector}>
      <div className={styles.header}>
        <h3 className={styles.title}>Pitch Tuner</h3>
        <button
          className={`${styles.micButton} ${isListening ? styles.listening : ''}`}
          onClick={handleToggleMic}
          aria-label={isListening ? 'Stop microphone' : 'Start microphone'}
          type="button"
        >
          <span className={styles.micIcon}>{isListening ? '⏹' : '🎤'}</span>
          <span>{isListening ? 'Stop' : 'Start Mic'}</span>
        </button>
      </div>

      {error && (
        <div className={styles.errorMessage} role="alert">
          {error}
        </div>
      )}

      <div className={styles.display}>
        {!isListening && !error && (
          <div className={styles.statusMessage}>Click "Start Mic" to begin pitch detection</div>
        )}

        {isListening && !pitchResult && !error && (
          <div className={styles.statusMessage}>Listening... Play a note</div>
        )}

        {pitchResult && (
          <>
            <div className={styles.noteDisplay}>
              <h2 className={styles.noteName}>{pitchResult.note}</h2>
              <p className={styles.frequency}>{pitchResult.frequency.toFixed(1)} Hz</p>
              {noteInScale ? (
                <div className={`${styles.inScaleIndicator} ${styles.inScale}`}>
                  <span>✓</span>
                  <span>In Scale</span>
                </div>
              ) : (
                <div className={`${styles.inScaleIndicator} ${styles.notInScale}`}>
                  <span>○</span>
                  <span>Not in Scale</span>
                </div>
              )}
            </div>

            <div className={styles.tuningMeter}>
              <div className={styles.meterLabel}>
                <span>Flat</span>
                <span>In Tune</span>
                <span>Sharp</span>
              </div>
              <div className={styles.meterTrack}>
                <div className={styles.meterCenter} />
                <div
                  className={`${styles.meterIndicator} ${tuningCategory ? styles[tuningCategory] : ''}`}
                  style={{ left: `${meterPosition}%` }}
                  data-testid="tuning-indicator"
                  data-tuning-category={tuningCategory || ''}
                  aria-hidden="true"
                />
              </div>
              <div className={`${styles.centsDisplay} ${tuningCategory ? styles[tuningCategory] : ''}`}>
                {pitchResult.cents > 0 ? '+' : ''}
                {pitchResult.cents} cents
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
