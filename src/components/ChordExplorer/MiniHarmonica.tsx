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

  return (
    <div className={styles.miniHarmonica} aria-label={`Holes ${voicing.holes.join(', ')}`}>
      {holes.map((hole) => {
        const isActive = voicing.holes.includes(hole)
        return (
          <div
            key={hole}
            className={cn(
              styles.hole,
              isActive && styles.holeActive,
              isActive && voicing.breath === 'blow' && styles.holeBlow,
              isActive && voicing.breath === 'draw' && styles.holeDraw
            )}
            aria-label={isActive ? `Hole ${hole}` : undefined}
          >
            <span className={styles.holeNumber}>{hole}</span>
          </div>
        )
      })}
    </div>
  )
}
