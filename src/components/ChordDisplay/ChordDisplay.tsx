import { useState } from 'react'
import type { ChordVoicing } from '../../data/chords'
import { getCommonChords } from '../../data/chords'
import type { HarmonicaKey } from '../../data/harmonicas'
import styles from './ChordDisplay.module.css'

interface ChordDisplayProps {
  harmonicaKey: HarmonicaKey
  onChordSelect?: (chord: ChordVoicing | null) => void
}

const getOrdinalSuffix = (num: number): string => {
  if (num === 1) return 'st'
  if (num === 2) return 'nd'
  if (num === 3) return 'rd'
  return 'th'
}

export function ChordDisplay({ harmonicaKey, onChordSelect }: ChordDisplayProps) {
  const [selectedChord, setSelectedChord] = useState<ChordVoicing | null>(null)
  const chords = getCommonChords(harmonicaKey)

  const handleChordClick = (chord: ChordVoicing) => {
    const newSelection = selectedChord?.holes.join(',') === chord.holes.join(',') && 
                        selectedChord?.breath === chord.breath ? null : chord
    setSelectedChord(newSelection)
    onChordSelect?.(newSelection)
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

  const isChordSelected = (chord: ChordVoicing) => {
    return selectedChord?.holes.join(',') === chord.holes.join(',') && 
           selectedChord?.breath === chord.breath
  }

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
            key={`${chord.holes.join(',')}-${chord.breath}-${index}`}
            className={`${styles.chordCard} ${isChordSelected(chord) ? styles.chordCardSelected : ''} ${getChordQualityColor(chord.quality)}`}
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

            <div className={styles.chordNotes}>
              <span className={styles.chordLabel}>Notes:</span>
              <span className={styles.chordValue}>
                {chord.notes.map(note => note.replace(/\d+$/, '')).join(' • ')}
              </span>
            </div>

            <div className={styles.chordPosition}>
              <span className={styles.positionBadge}>
                {chord.position}{getOrdinalSuffix(chord.position)} pos
              </span>
              <span className={styles.romanNumeral}>{chord.romanNumeral}</span>
            </div>
          </button>
        ))}
      </div>

      {selectedChord && (
        <div className={styles.selectedChordInfo} role="status" aria-live="polite">
          Selected: {selectedChord.name} (holes {selectedChord.holes.join('-')} {selectedChord.breath})
        </div>
      )}
    </div>
  )
}
