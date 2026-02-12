/**
 * Container component managing chord grid and scale-filtered chords.
 * @packageDocumentation
 */
import { useMemo, useState } from 'react'
import type { HarmonicaKey, TuningType, ChordVoicing } from '../../data'
import { getScaleFilteredChords, getScaleFilteredTongueBlockingChords, groupChordsByName } from '../../data'
import { cn } from '../../utils'
import { ChordCard } from './ChordCard'
import styles from './ChordExplorer.module.css'

interface ChordExplorerProps {
  /** The harmonica key */
  harmonicaKey: HarmonicaKey
  /** The harmonica tuning */
  tuning: TuningType
  /** Notes in the selected scale (pitch classes, e.g., ["C", "D", "E", ...]) */
  scaleNotes: string[]
  /** Callback when a chord voicing is selected/deselected */
  onChordSelect?: (chord: ChordVoicing | null) => void
}

export function ChordExplorer({
  harmonicaKey,
  tuning,
  scaleNotes,
  onChordSelect,
}: ChordExplorerProps) {
  const [showTongueBlocking, setShowTongueBlocking] = useState(false)

  // Compute scale-filtered consecutive chords and group by name
  const chordGroups = useMemo(() => {
    const filtered = getScaleFilteredChords(harmonicaKey, tuning, scaleNotes)
      .filter(v => v.isConsecutive)
    return groupChordsByName(filtered)
  }, [harmonicaKey, tuning, scaleNotes])

  // Compute tongue blocking chords when enabled
  const tongueBlockingGroups = useMemo(() => {
    if (!showTongueBlocking) return []
    const filtered = getScaleFilteredTongueBlockingChords(harmonicaKey, tuning, scaleNotes)
    return groupChordsByName(filtered)
  }, [showTongueBlocking, harmonicaKey, tuning, scaleNotes])

  return (
    <div className={styles.chordExplorer} role="region" aria-label="Chord explorer">
      <div className={styles.chordHeader}>
        <h2>Chords in Scale</h2>
        <p className={styles.chordSubheading}>
          Click a chord to highlight on the harmonica. Use arrows to see different voicings.
        </p>
      </div>

      {/* Tongue blocking toggle */}
      <div className={styles.tongueBlockingSection}>
        <button
          className={cn(styles.tongueBlockingToggle, showTongueBlocking && styles.toggleActive)}
          onClick={() => setShowTongueBlocking(!showTongueBlocking)}
          aria-pressed={showTongueBlocking}
        >
          {showTongueBlocking ? 'Hide' : 'Show'} Tongue Blocking
        </button>
      </div>

      <div className={styles.chordGrid}>
        {chordGroups.length === 0 && !showTongueBlocking && (
          <p className={styles.emptyState}>
            No chords available for this scale. Try a different scale or harmonica key.
          </p>
        )}
        {chordGroups.map((group) => (
          <ChordCard key={group.name} chordGroup={group} onChordSelect={onChordSelect} />
        ))}
      </div>

      {/* Tongue blocking chords section */}
      {showTongueBlocking && tongueBlockingGroups.length > 0 && (
        <>
          <h3 className={styles.sectionHeader}>Tongue Blocking</h3>
          <div className={styles.chordGrid}>
            {tongueBlockingGroups.map((group) => (
              <ChordCard key={`tb-${group.name}`} chordGroup={group} onChordSelect={onChordSelect} />
            ))}
          </div>
        </>
      )}

      {showTongueBlocking && tongueBlockingGroups.length === 0 && (
        <p className={styles.emptyState}>
          No tongue blocking chords available for this scale.
        </p>
      )}

      {/* Quality legend */}
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
    </div>
  )
}
