import { useState, useRef } from 'react'
import type { ChordVoicing } from '../../data/chords'
import { getCommonChords } from '../../data/chords'
import type { HarmonicaKey } from '../../data/harmonicas'
import { getChordKey, areChordsSame } from '../../utils/chord'
import { cn } from '../../utils/classNames'
import { playChord } from '../../utils/audioPlayer'
import { usePlayback } from '../../context'
import styles from './ChordDisplay.module.css'

interface ChordDisplayProps {
  harmonicaKey: HarmonicaKey
  onChordSelect?: (chord: ChordVoicing | null) => void
}

export function ChordDisplay({ harmonicaKey, onChordSelect }: ChordDisplayProps) {
  const [selectedChord, setSelectedChord] = useState<ChordVoicing | null>(null)
  const chords = getCommonChords(harmonicaKey)
  const { setCurrentlyPlayingChord } = usePlayback()
  const isPlayingRef = useRef(false)

  const handleChordClick = (chord: ChordVoicing) => {
    const isDeselecting = areChordsSame(selectedChord, chord)
    const newSelection = isDeselecting ? null : chord
    setSelectedChord(newSelection)
    onChordSelect?.(newSelection)

    // Play audio only when selecting a chord (not when deselecting)
    if (!isDeselecting && !isPlayingRef.current) {
      isPlayingRef.current = true
      playChord(chord.notes, {
        onStart: () => setCurrentlyPlayingChord({ notes: chord.notes, breath: chord.breath }),
        onEnd: () => {
          setCurrentlyPlayingChord(null)
          isPlayingRef.current = false
        },
      })
    }
  }

  const getChordQualityColor = (quality: ChordVoicing['quality']) => {
    switch (quality) {
      case 'major':
        return styles.qualityMajor
      case 'minor':
        return styles.qualityMinor
      case 'dominant7':
        return styles.qualityDominant
      case 'diminished':
        return styles.qualityDiminished
      default:
        return ''
    }
  }

  const isChordSelected = (chord: ChordVoicing) => areChordsSame(selectedChord, chord)

  return (
    <div className={styles.chordDisplay} role="region" aria-label="Harmonica chord diagrams">
      <div className={styles.chordHeader}>
        <h2>Available Chords</h2>
        <p className={styles.chordSubheading}>
          Click a chord to highlight it on the harmonica diagram
        </p>
      </div>

      <div className={styles.chordGrid}>
        {chords.map((chord, index) => (
          <button
            key={`${getChordKey(chord)}-${index}`}
            className={cn(styles.chordCard, isChordSelected(chord) && styles.chordCardSelected, getChordQualityColor(chord.quality))}
            onClick={() => handleChordClick(chord)}
            aria-label={`${chord.name} chord: holes ${chord.holes.join(', ')} ${chord.breath}${isChordSelected(chord) ? ', currently selected' : ''}`}
          >
            <div className={styles.chordName}>
              <span className={styles.chordShortName}>{chord.shortName}</span>
              <span className={styles.chordFullName}>{chord.name}</span>
            </div>
            
            <div className={styles.chordInfo}>
              <div className={styles.chordHoles}>
                <span className={styles.chordLabel}>Holes:</span>
                <span className={styles.chordValue}>{chord.holes.join('-')}</span>
              </div>

              <div className={styles.chordBreath}>
                <span className={styles.breathDirection} data-breath={chord.breath}>
                  {chord.breath === 'blow' ? '↑ Blow' : '↓ Draw'}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className={styles.qualityLegend} role="note" aria-label="Chord quality color legend">
        <span className={styles.legendLabel}>Chord Quality:</span>
        <div className={styles.legendItems}>
          <span className={styles.legendItem}>
            <span className={cn(styles.legendColor, styles.legendMajor)} aria-hidden="true" />
            Major
          </span>
          <span className={styles.legendItem}>
            <span className={cn(styles.legendColor, styles.legendMinor)} aria-hidden="true" />
            Minor
          </span>
          <span className={styles.legendItem}>
            <span className={cn(styles.legendColor, styles.legendDominant)} aria-hidden="true" />
            Dominant 7th
          </span>
          <span className={styles.legendItem}>
            <span className={cn(styles.legendColor, styles.legendDiminished)} aria-hidden="true" />
            Diminished
          </span>
        </div>
      </div>

      {selectedChord && (
        <div className={styles.selectedChordInfo} role="status" aria-live="polite">
          Selected: {selectedChord.name} (holes {selectedChord.holes.join('-')} {selectedChord.breath})
        </div>
      )}
    </div>
  )
}
