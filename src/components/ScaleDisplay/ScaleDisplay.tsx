import { useState, useMemo, useCallback } from 'react'
import type { DiatonicHarmonica } from '../../data/harmonicas'
import type { NoteNames } from '../../types'
import { isNoteInScale } from '../../data/scales'
import { playTone } from '../../utils/audioPlayer'
import styles from './ScaleDisplay.module.css'

interface PlayableNote {
  note: string
  frequency: number
}

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
  const [isPlayingScale, setIsPlayingScale] = useState(false)
  const [currentlyPlayingNote, setCurrentlyPlayingNote] = useState<string | null>(null)

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

    const noteDuration = 1 // seconds
    const gapBetweenNotes = 500 // milliseconds

    for (const note of playableNotesWithFrequencies) {
      setCurrentlyPlayingNote(note.note)
      await playTone(note.frequency, noteDuration)
      await new Promise((resolve) => setTimeout(resolve, gapBetweenNotes))
    }

    setCurrentlyPlayingNote(null)
    setIsPlayingScale(false)
  }, [isPlayingScale, playableNotesWithFrequencies])

  return (
    <div className={styles.scaleDisplay}>
      <div className={styles.scaleHeader}>
        <h2>
          {songKey} {scaleType.charAt(0).toUpperCase() + scaleType.slice(1)} Scale
          <span className={styles.positionLabel}>
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
  )
}
