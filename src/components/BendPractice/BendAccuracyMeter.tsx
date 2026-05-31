/**
 * Horizontal cents meter for bend practice. The center line is the target note;
 * the marker shows how flat/sharp the user currently is. Adapted from the
 * PitchDetector tuner strip, but centered on the target rather than the nearest
 * chromatic note.
 */
import { HOLD_TOLERANCE_CENTS, LASER_TOLERANCE_CENTS } from '../../hooks'
import styles from './BendAccuracyMeter.module.css'

interface BendAccuracyMeterProps {
  /** Live cents offset from the target, or null when there is no signal. */
  cents: number | null
}

/** Cents shown from center to each edge of the track. */
const RANGE_CENTS = 50

/** Maps a cents value (-RANGE..+RANGE) to a 0-100% horizontal position. */
const centsToPercent = (cents: number): number => {
  const clamped = Math.max(-RANGE_CENTS, Math.min(RANGE_CENTS, cents))
  return ((clamped + RANGE_CENTS) / (2 * RANGE_CENTS)) * 100
}

export function BendAccuracyMeter({ cents }: BendAccuracyMeterProps) {
  const hasSignal = cents !== null
  const value = cents ?? 0
  const absCents = Math.abs(value)
  const category =
    absCents <= LASER_TOLERANCE_CENTS ? 'laser' : absCents <= HOLD_TOLERANCE_CENTS ? 'inRange' : 'off'

  return (
    <div
      className={styles.meter}
      role="meter"
      aria-label="Bend accuracy"
      aria-valuemin={-RANGE_CENTS}
      aria-valuemax={RANGE_CENTS}
      aria-valuenow={hasSignal ? Math.round(value) : undefined}
    >
      <span className={styles.edgeLabel}>♭</span>

      <div className={styles.track}>
        <div className={styles.rangeZone} aria-hidden="true" />
        <div className={styles.laserZone} aria-hidden="true" />
        <div className={styles.centerLine} aria-hidden="true" />

        {hasSignal && (
          <div
            className={`${styles.marker} ${styles[category]}`}
            style={{ left: `${centsToPercent(value)}%` }}
            data-testid="bend-marker"
            data-category={category}
          />
        )}
      </div>

      <span className={styles.edgeLabel}>♯</span>

      <span className={`${styles.readout} ${styles[category]} ${hasSignal ? '' : styles.faded}`}>
        {hasSignal ? `${value > 0 ? '+' : ''}${Math.round(value)}¢` : '···'}
      </span>
    </div>
  )
}
