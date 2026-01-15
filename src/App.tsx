import { useState, useMemo, useCallback } from 'react'
import styles from './App.module.css'
import type { HarmonicaKey, ScaleType, TuningType } from './data/harmonicas'
import { AVAILABLE_KEYS, SCALE_TYPES, TUNING_TYPES, getHarmonicaPosition } from './data/harmonicas'
import { useHarmonicaScale } from './hooks/useHarmonicaScale'
import { HoleColumn } from './components/HoleColumn'
import { isNoteInScale } from './data/scales'
import { playTone } from './utils/audioPlayer'

interface PlayableNote {
  note: string
  frequency: number
}

function App() {
  const [harmonicaKey, setHarmonicaKey] = useState<HarmonicaKey>('C')
  const [songKey, setSongKey] = useState<HarmonicaKey>('C')
  const [scaleType, setScaleType] = useState<ScaleType>('major')
  const [tuning, setTuning] = useState<TuningType>('richter')
  const [showDegrees, setShowDegrees] = useState(false)
  const [isPlayingScale, setIsPlayingScale] = useState(false)
  const [currentlyPlayingNote, setCurrentlyPlayingNote] = useState<string | null>(null)

  const { harmonica, scaleNotes, playableBlowHoles, playableDrawHoles } = useHarmonicaScale(
    harmonicaKey,
    songKey,
    scaleType,
    tuning
  )

  const position = useMemo(() => getHarmonicaPosition(harmonicaKey, songKey), [harmonicaKey, songKey])
  const positionSuffix = position === 1 ? 'st' : position === 2 ? 'nd' : position === 3 ? 'rd' : 'th'

  // Collect all playable notes with frequencies, sorted by pitch (ascending)
  const playableNotesWithFrequencies = useMemo(() => {
    const notes: PlayableNote[] = []
    const seenFrequencies = new Set<number>()

    for (const hole of harmonica.holes) {
      // Check blow note
      if (isNoteInScale(hole.blow.note, scaleNotes)) {
        if (!seenFrequencies.has(hole.blow.frequency)) {
          notes.push({ note: hole.blow.note, frequency: hole.blow.frequency })
          seenFrequencies.add(hole.blow.frequency)
        }
      }

      // Check draw note
      if (isNoteInScale(hole.draw.note, scaleNotes)) {
        if (!seenFrequencies.has(hole.draw.frequency)) {
          notes.push({ note: hole.draw.note, frequency: hole.draw.frequency })
          seenFrequencies.add(hole.draw.frequency)
        }
      }

      // Check blow bends
      if (hole.blowBends?.halfStepBend && isNoteInScale(hole.blowBends.halfStepBend.note, scaleNotes)) {
        if (!seenFrequencies.has(hole.blowBends.halfStepBend.frequency)) {
          notes.push({ note: hole.blowBends.halfStepBend.note, frequency: hole.blowBends.halfStepBend.frequency })
          seenFrequencies.add(hole.blowBends.halfStepBend.frequency)
        }
      }
      if (hole.blowBends?.wholeStepBend && isNoteInScale(hole.blowBends.wholeStepBend.note, scaleNotes)) {
        if (!seenFrequencies.has(hole.blowBends.wholeStepBend.frequency)) {
          notes.push({ note: hole.blowBends.wholeStepBend.note, frequency: hole.blowBends.wholeStepBend.frequency })
          seenFrequencies.add(hole.blowBends.wholeStepBend.frequency)
        }
      }

      // Check draw bends
      if (hole.drawBends?.halfStepBend && isNoteInScale(hole.drawBends.halfStepBend.note, scaleNotes)) {
        if (!seenFrequencies.has(hole.drawBends.halfStepBend.frequency)) {
          notes.push({ note: hole.drawBends.halfStepBend.note, frequency: hole.drawBends.halfStepBend.frequency })
          seenFrequencies.add(hole.drawBends.halfStepBend.frequency)
        }
      }
      if (hole.drawBends?.wholeStepBend && isNoteInScale(hole.drawBends.wholeStepBend.note, scaleNotes)) {
        if (!seenFrequencies.has(hole.drawBends.wholeStepBend.frequency)) {
          notes.push({ note: hole.drawBends.wholeStepBend.note, frequency: hole.drawBends.wholeStepBend.frequency })
          seenFrequencies.add(hole.drawBends.wholeStepBend.frequency)
        }
      }
      if (hole.drawBends?.minorThirdBend && isNoteInScale(hole.drawBends.minorThirdBend.note, scaleNotes)) {
        if (!seenFrequencies.has(hole.drawBends.minorThirdBend.frequency)) {
          notes.push({ note: hole.drawBends.minorThirdBend.note, frequency: hole.drawBends.minorThirdBend.frequency })
          seenFrequencies.add(hole.drawBends.minorThirdBend.frequency)
        }
      }

      // Check overblow/overdraw
      if (hole.overblow && isNoteInScale(hole.overblow.note, scaleNotes)) {
        if (!seenFrequencies.has(hole.overblow.frequency)) {
          notes.push({ note: hole.overblow.note, frequency: hole.overblow.frequency })
          seenFrequencies.add(hole.overblow.frequency)
        }
      }
      if (hole.overdraw && isNoteInScale(hole.overdraw.note, scaleNotes)) {
        if (!seenFrequencies.has(hole.overdraw.frequency)) {
          notes.push({ note: hole.overdraw.note, frequency: hole.overdraw.frequency })
          seenFrequencies.add(hole.overdraw.frequency)
        }
      }
    }

    // Sort by frequency (ascending pitch)
    return notes.sort((a, b) => a.frequency - b.frequency)
  }, [harmonica.holes, scaleNotes])

  const playScale = useCallback(async () => {
    if (isPlayingScale || playableNotesWithFrequencies.length === 0) return

    setIsPlayingScale(true)

    const noteDuration = 0.4 // seconds
    const gapBetweenNotes = 100 // milliseconds

    for (const note of playableNotesWithFrequencies) {
      setCurrentlyPlayingNote(note.note)
      await playTone(note.frequency, noteDuration)
      await new Promise((resolve) => setTimeout(resolve, gapBetweenNotes))
    }

    setCurrentlyPlayingNote(null)
    setIsPlayingScale(false)
  }, [isPlayingScale, playableNotesWithFrequencies])

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>🎵 Harp Diem</h1>
      </header>

      <main className={styles.main}>
        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <label htmlFor="harmonica-key">Harmonica Key:</label>
            <select
              id="harmonica-key"
              value={harmonicaKey}
              onChange={(e) => setHarmonicaKey(e.target.value as HarmonicaKey)}
            >
              {AVAILABLE_KEYS.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.controlGroup}>
            <label htmlFor="song-key">Song Key:</label>
            <select value={songKey} onChange={(e) => setSongKey(e.target.value as HarmonicaKey)} id="song-key">
              {AVAILABLE_KEYS.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.controlGroup}>
            <label htmlFor="scale-type">Scale Type:</label>
            <select
              id="scale-type"
              value={scaleType}
              onChange={(e) => setScaleType(e.target.value as ScaleType)}
            >
              {SCALE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.controlGroup}>
            <label htmlFor="tuning">Tuning:</label>
            <select
              id="tuning"
              value={tuning}
              onChange={(e) => setTuning(e.target.value as TuningType)}
            >
              {TUNING_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.scaleDisplay}>
          <div className={styles.scaleHeader}>
            <h2>
              {songKey} {scaleType.charAt(0).toUpperCase() + scaleType.slice(1)} Scale
              <span style={{ marginLeft: '12px', fontSize: '0.85em', fontWeight: 'normal', color: '#666' }}>
                ({position}{positionSuffix} position)
              </span>
            </h2>
            <button
              className={`${styles.playScaleButton} ${isPlayingScale ? styles.playScaleButtonPlaying : ''}`}
              onClick={playScale}
              disabled={isPlayingScale || playableNotesWithFrequencies.length === 0}
              aria-label={isPlayingScale ? 'Playing scale' : 'Play scale ascending'}
            >
              {isPlayingScale ? (
                <>
                  <span className={styles.playingIndicator} aria-hidden="true"></span>
                  Playing...
                </>
              ) : (
                <>
                  <span aria-hidden="true">&#9654;</span> Play Scale
                </>
              )}
            </button>
          </div>
          <div className={styles.scaleNotes}>
            {scaleNotes.map((note) => (
              <span
                key={note}
                className={`${styles.scaleNote} ${currentlyPlayingNote === note ? styles.scaleNotePlaying : ''}`}
              >
                {note}
              </span>
            ))}
          </div>
        </div>

        <div
          className={styles.harmonicaDisplay}
          role="region"
          aria-label={`${harmonicaKey} Diatonic Harmonica visualization showing ${songKey} ${scaleType} scale`}
        >
          <h2>
            {harmonicaKey} Diatonic Harmonica
            {tuning !== 'richter' && (
              <span style={{ marginLeft: '8px', fontSize: '0.75em', fontWeight: 'normal', color: '#666' }}>
                ({tuning.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')})
              </span>
            )}
          </h2>
          <div className={styles.holesContainer} role="group" aria-label="Harmonica holes 1 through 10">
            {harmonica.holes.map((hole) => (
              <HoleColumn
                key={hole.hole}
                hole={hole}
                scaleNotes={scaleNotes}
                isBlowPlayable={playableBlowHoles.includes(hole.hole)}
                isDrawPlayable={playableDrawHoles.includes(hole.hole)}
                showDegrees={showDegrees}
              />
            ))}
          </div>

          <div className={styles.legend} role="note" aria-label="Legend for scale visualization">
            <div className={styles.legendHeader}>
              <h3>Legend</h3>
              <button
                className={`${styles.toggleButton} ${showDegrees ? styles.toggleActive : ''}`}
                onClick={() => setShowDegrees(!showDegrees)}
                aria-pressed={showDegrees}
              >
                {showDegrees ? 'Hide' : 'Show'} Degrees
              </button>
            </div>
            <div className={styles.legendItems}>
              <div className={styles.legendItem}>
                <div className={`${styles.legendColor} ${styles.legendColorPlayable}`} aria-hidden="true"></div>
                <span>In Scale</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendColor} ${styles.legendColorNotPlayable}`} aria-hidden="true"></div>
                <span>Not In Scale</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
