/**
 * Container component managing chord grid and scale-filtered chords.
 * @packageDocumentation
 */
import { useMemo } from 'react'
import type { HarmonicaKey, TuningType, ChordVoicing } from '../../data'
import { getScaleFilteredChords, groupChordsByName } from '../../data'
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
  // Compute scale-filtered chords and group by name
  const chordGroups = useMemo(() => {
    const filtered = getScaleFilteredChords(harmonicaKey, tuning, scaleNotes)
    return groupChordsByName(filtered)
  }, [harmonicaKey, tuning, scaleNotes])

  return (
    <div className={styles.chordExplorer} role="region" aria-label="Chord explorer">
      <div className={styles.chordHeader}>
        <h2>Chords in Scale</h2>
        <p className={styles.chordSubheading}>
          Click a chord to highlight on the harmonica. Use arrows to see different voicings.
        </p>
      </div>

      {/* Phase 2: Tongue blocking config would go here */}

      <div className={styles.chordGrid}>
        {chordGroups.length === 0 && (
          <p className={styles.emptyState}>
            No chords available for this scale. Try a different scale or harmonica key.
          </p>
        )}
        {chordGroups.map((group) => (
          <ChordCard key={group.name} chordGroup={group} onChordSelect={onChordSelect} />
        ))}
      </div>

      {/* Quality legend (reuse from ChordDisplay) */}
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
