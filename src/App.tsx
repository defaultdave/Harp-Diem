import { useState, useMemo, useRef } from 'react'
import styles from './App.module.css'
import type { HarmonicaKey, ScaleType, TuningType } from './data/harmonicas'
import { AVAILABLE_KEYS, SCALE_TYPES, TUNING_TYPES, getHarmonicaPosition } from './data/harmonicas'
import { useHarmonicaScale } from './hooks/useHarmonicaScale'
import { useTouchGestures } from './hooks/useTouchGestures'
import { HoleColumn } from './components/HoleColumn'
import { Legend } from './components/Legend'
import { ScaleDisplay } from './components/ScaleDisplay/ScaleDisplay'
import { GestureHints } from './components/GestureHints'
import { DisplaySettingsProvider, PlaybackProvider } from './context'

function AppContent() {
  const [harmonicaKey, setHarmonicaKey] = useState<HarmonicaKey>('C')
  const [songKey, setSongKey] = useState<HarmonicaKey>('C')
  const [scaleType, setScaleType] = useState<ScaleType>('major')
  const [tuning, setTuning] = useState<TuningType>('richter')
  const [zoomScale, setZoomScale] = useState(1)
  const [isPinching, setIsPinching] = useState(false)

  const mainRef = useRef<HTMLDivElement>(null)

  const { harmonica, scaleNotes, playableBlowHoles, playableDrawHoles } = useHarmonicaScale(
    harmonicaKey,
    songKey,
    scaleType,
    tuning
  )

  const position = useMemo(() => getHarmonicaPosition(harmonicaKey, songKey), [harmonicaKey, songKey])

  // Gesture handlers for harmonica key (left/right swipe)
  const handleSwipeLeft = () => {
    const currentIndex = AVAILABLE_KEYS.indexOf(harmonicaKey)
    const nextIndex = (currentIndex + 1) % AVAILABLE_KEYS.length
    setHarmonicaKey(AVAILABLE_KEYS[nextIndex])
  }

  const handleSwipeRight = () => {
    const currentIndex = AVAILABLE_KEYS.indexOf(harmonicaKey)
    const prevIndex = (currentIndex - 1 + AVAILABLE_KEYS.length) % AVAILABLE_KEYS.length
    setHarmonicaKey(AVAILABLE_KEYS[prevIndex])
  }

  // Gesture handlers for scale type (up/down swipe)
  const handleSwipeUp = () => {
    const currentIndex = SCALE_TYPES.indexOf(scaleType)
    const nextIndex = (currentIndex + 1) % SCALE_TYPES.length
    setScaleType(SCALE_TYPES[nextIndex])
  }

  const handleSwipeDown = () => {
    const currentIndex = SCALE_TYPES.indexOf(scaleType)
    const prevIndex = (currentIndex - 1 + SCALE_TYPES.length) % SCALE_TYPES.length
    setScaleType(SCALE_TYPES[prevIndex])
  }

  // Pinch to zoom handler
  const handlePinch = (scale: number) => {
    setIsPinching(true)
    // Clamp scale between 0.5 and 2
    const clampedScale = Math.max(0.5, Math.min(2, scale))
    setZoomScale(clampedScale)
  }

  const handlePinchEnd = () => {
    setIsPinching(false)
  }

  // Attach gestures to the main container
  useTouchGestures(
    mainRef,
    {
      onSwipeLeft: handleSwipeLeft,
      onSwipeRight: handleSwipeRight,
      onSwipeUp: handleSwipeUp,
      onSwipeDown: handleSwipeDown,
    },
    {
      onPinch: handlePinch,
      onPinchEnd: handlePinchEnd,
    }
  )

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>🎵 Harp Diem</h1>
      </header>

      <main className={styles.main} ref={mainRef}>
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
            <select value={songKey} onChange={(e) => setSongKey(e.target.value as HarmonicaKey)} id="song-key">
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

        <ScaleDisplay
          songKey={songKey}
          scaleType={scaleType}
          position={position}
          scaleNotes={scaleNotes}
          harmonica={harmonica}
        />

        <div
          className={styles.harmonicaDisplay}
          style={{ 
            transform: `scale(${zoomScale})`, 
            transformOrigin: 'center top', 
            transition: isPinching ? 'none' : 'transform 0.2s ease-out' 
          }}
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
              />
            ))}
          </div>

          <Legend />
        </div>

        <GestureHints />
      </main>
    </div>
  )
}

function App() {
  return (
    <DisplaySettingsProvider>
      <PlaybackProvider>
        <AppContent />
      </PlaybackProvider>
    </DisplaySettingsProvider>
  )
}

export default App
