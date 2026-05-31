import { useState, useMemo, useRef, useEffect, lazy, Suspense } from 'react'
import styles from './App.module.css'
import './print.css'
import type { HarmonicaKey, ScaleType, TuningType, ChordVoicing } from './data'
import { AVAILABLE_KEYS, SCALE_TYPES, TUNING_TYPES, getHarmonicaPosition } from './data'
import { useHarmonicaScale, useTheme, useHashRouter, useDeepLinking } from './hooks'
import { HoleColumn, Legend, ScaleDisplay, ChordExplorer, RotateOverlay, NavHeader, PitchDetector, ErrorBoundary } from './components'
import { DisplaySettingsProvider, PlaybackProvider, QuizProvider, ExportProvider, useExport, PitchDetectionProvider, usePitchDetection } from './context'
import { capitalizeWords } from './utils'

// Lazy load Quiz page - only loaded when navigating to /quiz route
const QuizPage = lazy(() => import('./components/Quiz').then(module => ({ default: module.QuizPage })))

function ScalesPage() {
  const { initialParams, updateURL } = useDeepLinking()
  const [harmonicaKey, setHarmonicaKey] = useState<HarmonicaKey>(initialParams.harpKey)
  const [songKey, setSongKey] = useState<HarmonicaKey>(initialParams.songKey)
  const [scaleType, setScaleType] = useState<ScaleType>(initialParams.scaleType)
  const [tuning, setTuning] = useState<TuningType>(initialParams.tuning)
  const exportTargetRef = useRef<HTMLDivElement>(null)
  const [selectedChord, setSelectedChord] = useState<ChordVoicing | null>(null)
  const [isChordPanelOpen, setIsChordPanelOpen] = useState(false) // collapsed by default
  const { setExportConfig } = useExport()
  const { pitchResult } = usePitchDetection()

  const { harmonica, scaleNotes, playableBlowHoles, playableDrawHoles } = useHarmonicaScale(
    harmonicaKey,
    songKey,
    scaleType,
    tuning
  )

  const position = useMemo(() => getHarmonicaPosition(harmonicaKey, songKey), [harmonicaKey, songKey])

  // Register export config when component mounts, update when values change
  useEffect(() => {
    setExportConfig({ harmonicaKey, songKey, scaleType, position }, exportTargetRef)
    return () => setExportConfig(null, null)
  }, [harmonicaKey, songKey, scaleType, position, setExportConfig])

  // Determine which holes are in the selected chord
  const chordBlowHoles = useMemo(() => {
    if (!selectedChord || selectedChord.breath !== 'blow') return []
    return selectedChord.holes
  }, [selectedChord])

  const chordDrawHoles = useMemo(() => {
    if (!selectedChord || selectedChord.breath !== 'draw') return []
    return selectedChord.holes
  }, [selectedChord])

  const handleChordSelect = (chord: ChordVoicing | null) => {
    setSelectedChord(chord)
  }

  const handleToggleChordPanel = () => {
    setIsChordPanelOpen(!isChordPanelOpen)
  }

  const detectedNote = pitchResult?.note ?? null
  const detectedCents = pitchResult?.cents ?? 0

  return (
    <>
      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <label htmlFor="harmonica-key">Harmonica Key:</label>
          <select
            id="harmonica-key"
            value={harmonicaKey}
            onChange={(e) => {
              const val = e.target.value as HarmonicaKey
              setHarmonicaKey(val)
              updateURL({ harpKey: val, songKey, scaleType, tuning })
            }}
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
          <select value={songKey} onChange={(e) => {
              const val = e.target.value as HarmonicaKey
              setSongKey(val)
              updateURL({ harpKey: harmonicaKey, songKey: val, scaleType, tuning })
            }} id="song-key">
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
            onChange={(e) => {
              const val = e.target.value as ScaleType
              setScaleType(val)
              updateURL({ harpKey: harmonicaKey, songKey, scaleType: val, tuning })
            }}
          >
            {SCALE_TYPES.map((type) => (
              <option key={type} value={type}>
                {capitalizeWords(type, ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.controlGroup}>
          <label htmlFor="tuning">Tuning:</label>
          <select
            id="tuning"
            value={tuning}
            onChange={(e) => {
              const val = e.target.value as TuningType
              setTuning(val)
              updateURL({ harpKey: harmonicaKey, songKey, scaleType, tuning: val })
            }}
          >
            {TUNING_TYPES.map((t) => (
              <option key={t} value={t}>
                {capitalizeWords(t)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div ref={exportTargetRef}>
        <ScaleDisplay
          songKey={songKey}
          scaleType={scaleType}
          position={position}
          scaleNotes={scaleNotes}
          harmonica={harmonica}
        />

        <div className={`${styles.scaleContent} ${isChordPanelOpen ? '' : styles.scaleContentCollapsed}`}>
          <div
            className={styles.harmonicaDisplay}
            role="region"
            aria-label={`${harmonicaKey} Diatonic Harmonica visualization showing ${songKey} ${scaleType} scale`}
          >
            <h2>
              {harmonicaKey} Diatonic Harmonica
              {tuning !== 'richter' && (
                <span style={{ marginLeft: '8px', fontSize: '0.75em', fontWeight: 'normal', color: 'var(--color-text-muted)' }}>
                  ({capitalizeWords(tuning)})
                </span>
              )}
            </h2>
            <PitchDetector scaleNotes={scaleNotes} />
            <div className={styles.holesContainer} role="group" aria-label="Harmonica holes 1 through 10">
              {harmonica.holes.map((hole) => (
                <HoleColumn
                  key={hole.hole}
                  hole={hole}
                  scaleNotes={scaleNotes}
                  isBlowPlayable={playableBlowHoles.includes(hole.hole)}
                  isDrawPlayable={playableDrawHoles.includes(hole.hole)}
                  isBlowInChord={chordBlowHoles.includes(hole.hole)}
                  isDrawInChord={chordDrawHoles.includes(hole.hole)}
                  detectedNote={detectedNote}
                  detectedCents={detectedCents}
                />
              ))}
            </div>

            <Legend />
          </div>

          <div className={styles.chordPanelColumn}>
            <button
              className={styles.chordPanelToggle}
              onClick={handleToggleChordPanel}
              aria-label={isChordPanelOpen ? 'Collapse chord panel' : 'Expand chord panel'}
              aria-expanded={isChordPanelOpen}
              type="button"
            >
              <span className={styles.toggleButtonText}>Chords</span>
              <span className={styles.toggleChevron} aria-hidden="true">
                {isChordPanelOpen ? '›' : '‹'}
              </span>
            </button>

            {isChordPanelOpen && (
              <div className={styles.chordExplorerWrapper}>
                <ChordExplorer
                  harmonicaKey={harmonicaKey}
                  tuning={tuning}
                  scaleNotes={scaleNotes}
                  onChordSelect={handleChordSelect}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function AppContent() {
  const { theme, toggleTheme } = useTheme()
  const { route, navigate } = useHashRouter()

  return (
    <div className={styles.app}>
      <NavHeader
        currentRoute={route}
        onNavigate={navigate}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className={styles.main}>
        {route === '/' && <ScalesPage />}
        {route === '/quiz' && (
          <ErrorBoundary>
            <Suspense fallback={<div className={styles.loading}>Loading quiz...</div>}>
              <QuizPage />
            </Suspense>
          </ErrorBoundary>
        )}
      </main>

      <footer
        style={{
          textAlign: 'center',
          padding: '1.25rem',
          fontSize: '0.8rem',
          color: 'var(--color-text-secondary)',
        }}
      >
        <a href="/privacy.html" style={{ color: 'inherit' }}>Privacy</a>
        {' · '}
        <a
          href="https://github.com/defaultdave/Harp-Diem"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'inherit' }}
        >
          Source on GitHub
        </a>
      </footer>
    </div>
  )
}

function App() {
  return (
    <DisplaySettingsProvider>
      <PlaybackProvider>
        <PitchDetectionProvider>
          <QuizProvider>
            <ExportProvider>
              <AppContent />
              <RotateOverlay />
            </ExportProvider>
          </QuizProvider>
        </PitchDetectionProvider>
      </PlaybackProvider>
    </DisplaySettingsProvider>
  )
}

export default App
