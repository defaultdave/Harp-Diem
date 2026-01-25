import { useState, useMemo, useCallback, useRef } from 'react'
import type { DiatonicHarmonica } from '../../data'
import type { NoteNames } from '../../types'
import { getIntervalBetweenNotes } from '../../data'
import { playTone, capitalize, getOrdinalSuffix, collectPlayableNotes, cn } from '../../utils'
import { usePlayback, useDisplaySettings } from '../../context'
import styles from './ScaleDisplay.module.css'

interface ScaleDisplayProps {
  songKey: string
  scaleType: string
  position: number
  scaleNotes: NoteNames
  harmonica: DiatonicHarmonica
}

export function ScaleDisplay({
  songKey,
  scaleType,
  position,
  scaleNotes,
  harmonica,
}: ScaleDisplayProps) {
  const {
    isPlaying: isPlayingScale,
    setCurrentlyPlayingNote,
    setIsPlaying: setIsPlayingScale,
    isNoteCurrentlyPlaying,
  } = usePlayback()
  const { showIntervals, setShowIntervals } = useDisplaySettings()
  const [tempoBpm, setTempoBpm] = useState(120)
  const [playDirection, setPlayDirection] = useState<'asc' | 'desc'>('asc')
  const abortControllerRef = useRef<AbortController | null>(null)

  const positionSuffix = getOrdinalSuffix(position)

  // Collect all playable notes with frequencies, sorted by pitch (ascending)
  const playableNotesWithFrequencies = useMemo(
    () => collectPlayableNotes(harmonica.holes, scaleNotes),
    [harmonica.holes, scaleNotes]
  )

  const playScale = useCallback(async () => {
    if (isPlayingScale || playableNotesWithFrequencies.length === 0) return

    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal
    setIsPlayingScale(true)

    // Calculate timing from BPM
    // BPM = beats per minute, interval = time between note starts
    const beatInterval = 60000 / tempoBpm // ms between beats
    // Note duration is 80% of beat interval, capped at 0.8s for clarity
    const noteDuration = Math.min(0.8, (beatInterval / 1000) * 0.8) // seconds
    // playTone is non-blocking (schedules audio and returns immediately)
    // so we wait the full beat interval between note starts
    const waitBetweenNotes = Math.max(50, beatInterval) // ms

    // Get notes in the correct order based on direction
    const notesToPlay = playDirection === 'desc' 
      ? [...playableNotesWithFrequencies].reverse() 
      : playableNotesWithFrequencies

    for (const note of notesToPlay) {
      if (signal.aborted) break
      setCurrentlyPlayingNote(note.note)
      playTone(note.frequency, noteDuration) // non-blocking, no await needed
      if (signal.aborted) break
      await new Promise((resolve) => setTimeout(resolve, waitBetweenNotes))
    }

    setCurrentlyPlayingNote(null)
    setIsPlayingScale(false)
    abortControllerRef.current = null
  }, [isPlayingScale, playableNotesWithFrequencies, tempoBpm, playDirection, setCurrentlyPlayingNote, setIsPlayingScale])

  const stopScale = useCallback(() => {
    abortControllerRef.current?.abort()
    setCurrentlyPlayingNote(null)
    setIsPlayingScale(false)
  }, [setCurrentlyPlayingNote, setIsPlayingScale])

  return (
    <div className={styles.scaleDisplay}>
      <div className={styles.scaleHeader}>
        <h2>
          {songKey} {capitalize(scaleType)} Scale
          <span className={styles.positionLabel}>
            ({position}{positionSuffix} position)
          </span>
        </h2>
        <div className={styles.playbackControls}>
          <div className={styles.playControlsRow}>
            <button
              className={cn(styles.directionToggle, playDirection === 'desc' && styles.directionToggleDesc)}
              onClick={() => setPlayDirection(playDirection === 'asc' ? 'desc' : 'asc')}
              disabled={isPlayingScale}
              aria-label={`Toggle direction (currently ${playDirection === 'asc' ? 'ascending' : 'descending'})`}
              title={playDirection === 'asc' ? 'Switch to descending' : 'Switch to ascending'}
            >
              {playDirection === 'asc' ? '↑' : '↓'}
            </button>
            <button
              className={cn(styles.playScaleButton, isPlayingScale && styles.playScaleButtonPlaying)}
              onClick={isPlayingScale ? stopScale : playScale}
              disabled={playableNotesWithFrequencies.length === 0}
              aria-label={isPlayingScale ? 'Stop scale playback' : `Play scale ${playDirection === 'asc' ? 'ascending' : 'descending'}`}
            >
              {isPlayingScale ? (
                <>
                  <span className={styles.stopIcon} aria-hidden="true">&#9632;</span> Stop
                </>
              ) : (
                <>
                  <span aria-hidden="true">&#9654;</span> Play Scale
                </>
              )}
            </button>
          </div>
          <div className={styles.tempoControl}>
            <label htmlFor="tempo-slider" className={styles.tempoLabel}>
              Tempo
            </label>
            <input
              id="tempo-slider"
              type="range"
              min={40}
              max={200}
              value={tempoBpm}
              onChange={(e) => setTempoBpm(Number(e.target.value))}
              disabled={isPlayingScale}
              className={styles.tempoSlider}
              aria-label={`Tempo: ${tempoBpm} BPM`}
            />
            <span className={styles.tempoValue}>{tempoBpm} BPM</span>
          </div>
          <label className={styles.intervalToggle}>
            <input
              type="checkbox"
              checked={showIntervals}
              onChange={(e) => setShowIntervals(e.target.checked)}
              aria-label="Show intervals between notes"
            />
            <span>Show Intervals</span>
          </label>
        </div>
      </div>
      <div className={styles.scaleNotes}>
        {scaleNotes.map((note, index) => (
          <span key={note} className={styles.noteWithInterval}>
            <span
              className={cn(
                styles.scaleNote, 
                index === 0 && styles.scaleNoteRoot,
                isNoteCurrentlyPlaying(note) && styles.scaleNotePlaying
              )}
            >
              {note}
            </span>
            {showIntervals && index < scaleNotes.length - 1 && (
              <span className={styles.interval}>
                {getIntervalBetweenNotes(note, scaleNotes[index + 1])}
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}
