import { useState, useMemo } from 'react'
import styles from './App.module.css'
import type { HarmonicaKey, ScaleType, TuningType } from './data/harmonicas'
import { AVAILABLE_KEYS, SCALE_TYPES, TUNING_TYPES, getHarmonicaPosition } from './data/harmonicas'
import { useHarmonicaScale } from './hooks/useHarmonicaScale'
import { HoleColumn } from './components/HoleColumn'

function App() {
  const [harmonicaKey, setHarmonicaKey] = useState<HarmonicaKey>('C')
  const [songKey, setSongKey] = useState('C')
  const [scaleType, setScaleType] = useState<ScaleType>('major')
  const [tuning, setTuning] = useState<TuningType>('richter')
  const [showDegrees, setShowDegrees] = useState(false)

  const { harmonica, scaleNotes, playableBlowHoles, playableDrawHoles } = useHarmonicaScale(
    harmonicaKey,
    songKey,
    scaleType,
    tuning
  )

  const position = useMemo(() => getHarmonicaPosition(harmonicaKey, songKey), [harmonicaKey, songKey])
  const positionSuffix = position === 1 ? 'st' : position === 2 ? 'nd' : position === 3 ? 'rd' : 'th'

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
            <select value={songKey} onChange={(e) => setSongKey(e.target.value)} id="song-key">
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
          <h2>
            {songKey} {scaleType.charAt(0).toUpperCase() + scaleType.slice(1)} Scale
            <span style={{ marginLeft: '12px', fontSize: '0.85em', fontWeight: 'normal', color: '#666' }}>
              ({position}{positionSuffix} position)
            </span>
          </h2>
          <div className={styles.scaleNotes}>
            {scaleNotes.map((note) => (
              <span key={note} className={styles.scaleNote}>
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
