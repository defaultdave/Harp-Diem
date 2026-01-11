import { useState } from 'react'
import './App.css'
import type { HarmonicaKey, ScaleType } from './data/harmonicas'
import { AVAILABLE_KEYS, SCALE_TYPES } from './data/harmonicas'
import { useHarmonicaScale } from './hooks/useHarmonicaScale'
import { HoleColumn } from './components/HoleColumn'

function App() {
  const [harmonicaKey, setHarmonicaKey] = useState<HarmonicaKey>('C')
  const [songKey, setSongKey] = useState('C')
  const [scaleType, setScaleType] = useState<ScaleType>('major')

  const { harmonica, scaleNotes, playableBlowHoles, playableDrawHoles } = useHarmonicaScale(
    harmonicaKey,
    songKey,
    scaleType
  )

  return (
    <div className="app">
      <header>
        <h1>🎵 Harmonica Scale Viewer</h1>
      </header>

      <main>
        <div className="controls">
          <div className="control-group">
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

          <div className="control-group">
            <label htmlFor="song-key">Song Key:</label>
            <select value={songKey} onChange={(e) => setSongKey(e.target.value)} id="song-key">
              {AVAILABLE_KEYS.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
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
        </div>

        <div className="scale-display">
          <h2>
            {songKey} {scaleType.charAt(0).toUpperCase() + scaleType.slice(1)} Scale
          </h2>
          <div className="scale-notes">
            {scaleNotes.map((note) => (
              <span key={note} className="scale-note">
                {note}
              </span>
            ))}
          </div>
        </div>

        <div
          className="harmonica-display"
          role="region"
          aria-label={`${harmonicaKey} Diatonic Harmonica visualization showing ${songKey} ${scaleType} scale`}
        >
          <h2>{harmonicaKey} Diatonic Harmonica</h2>
          <div className="holes-container" role="group" aria-label="Harmonica holes 1 through 10">
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

          <div className="legend" role="note" aria-label="Legend for scale visualization">
            <h3>Legend</h3>
            <div className="legend-items">
              <div className="legend-item">
                <div className="legend-color note-section playable" aria-hidden="true"></div>
                <span>In Scale</span>
              </div>
              <div className="legend-item">
                <div className="legend-color note-section" aria-hidden="true"></div>
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
