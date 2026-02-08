/**
 * Small 10-hole harmonica diagram highlighting active holes.
 * @packageDocumentation
 */
import type { ChordVoicing } from '../../data'
import { cn } from '../../utils'
import styles from './MiniHarmonica.module.css'

interface MiniHarmonicaProps {
  /** The chord voicing to display */
  voicing: ChordVoicing
}

export function MiniHarmonica({ voicing }: MiniHarmonicaProps) {
  const holes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  const minHole = Math.min(...voicing.holes)
  const maxHole = Math.max(...voicing.holes)

  return (
    <div className={styles.miniHarmonica} aria-label={`Holes ${voicing.holes.join(', ')}`}>
      {holes.map((hole) => {
        const isActive = voicing.holes.includes(hole)
        const isBlocked = !voicing.isConsecutive && !isActive && hole >= minHole && hole <= maxHole
        return (
          <div
            key={hole}
            className={cn(
              styles.hole,
              isActive && styles.holeActive,
              isActive && voicing.breath === 'blow' && styles.holeBlow,
              isActive && voicing.breath === 'draw' && styles.holeDraw,
              isBlocked && styles.holeBlocked
            )}
            aria-label={isActive ? `Hole ${hole}` : isBlocked ? `Hole ${hole} blocked` : undefined}
          >
            <span className={styles.holeNumber}>{isBlocked ? '×' : hole}</span>
          </div>
        )
      })}
    </div>
  )
}
