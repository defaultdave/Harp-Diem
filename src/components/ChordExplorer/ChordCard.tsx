/**
 * Individual chord card with voicing navigation and mini harmonica diagram.
 * @packageDocumentation
 */
import { useState, useRef } from 'react'
import type { ChordVoicing, ChordGroup } from '../../data'
import { areChordsSame, playChord, cn } from '../../utils'
import { usePlayback } from '../../context'
import { MiniHarmonica } from './MiniHarmonica'
import styles from './ChordCard.module.css'

interface ChordCardProps {
  /** The chord group with all voicings */
  chordGroup: ChordGroup
  /** Callback when this chord is selected/deselected */
  onChordSelect?: (chord: ChordVoicing | null) => void
}

export function ChordCard({ chordGroup, onChordSelect }: ChordCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedChord, setSelectedChord] = useState<ChordVoicing | null>(null)
  const { setCurrentlyPlayingChord } = usePlayback()
  const abortControllerRef = useRef<AbortController | null>(null)

  const currentVoicing = chordGroup.voicings[currentIndex]
  const isSelected = areChordsSame(selectedChord, currentVoicing)

  const handlePrevVoicing = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev - 1 + chordGroup.voicings.length) % chordGroup.voicings.length)
  }

  const handleNextVoicing = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev + 1) % chordGroup.voicings.length)
  }

  const handleCardClick = () => {
    const isDeselecting = isSelected
    const newSelection = isDeselecting ? null : currentVoicing
    setSelectedChord(newSelection)
    onChordSelect?.(newSelection)

    // Abort any currently playing chord
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }

    // Play audio only when selecting
    if (!isDeselecting) {
      const abortController = new AbortController()
      abortControllerRef.current = abortController

      playChord(currentVoicing.notes, {
        signal: abortController.signal,
        onStart: () =>
          setCurrentlyPlayingChord({ notes: currentVoicing.notes, breath: currentVoicing.breath }),
        onEnd: () => {
          setCurrentlyPlayingChord(null)
          if (abortControllerRef.current === abortController) {
            abortControllerRef.current = null
          }
        },
      })
    }
  }

  const getQualityClass = () => {
    switch (chordGroup.quality) {
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

  return (
    <div
      className={cn(
        styles.chordCard,
        isSelected && styles.chordCardSelected,
        getQualityClass()
      )}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-label={`${currentVoicing.name} chord, voicing ${currentIndex + 1} of ${chordGroup.voicings.length}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleCardClick()
        }
      }}
    >
      {/* Chord name */}
      <div className={styles.chordName}>
        <span className={styles.chordShortName}>{chordGroup.name}</span>
        <span className={styles.chordFullName}>{currentVoicing.name}</span>
      </div>

      {/* Mini harmonica diagram */}
      <MiniHarmonica voicing={currentVoicing} />

      {/* Breath indicator */}
      <div className={styles.breathIndicator}>
        <span className={styles.breathDirection} data-breath={currentVoicing.breath}>
          {currentVoicing.breath === 'blow' ? '↑ Blow' : '↓ Draw'}
        </span>
      </div>

      {/* Voicing navigation */}
      {chordGroup.voicings.length > 1 && (
        <div className={styles.voicingNav}>
          <button
            className={styles.navButton}
            onClick={handlePrevVoicing}
            aria-label="Previous voicing"
            disabled={chordGroup.voicings.length === 1}
          >
            ‹
          </button>
          <span className={styles.voicingCounter}>
            {currentIndex + 1} of {chordGroup.voicings.length}
          </span>
          <button
            className={styles.navButton}
            onClick={handleNextVoicing}
            aria-label="Next voicing"
            disabled={chordGroup.voicings.length === 1}
          >
            ›
          </button>
        </div>
      )}
    </div>
  )
}
