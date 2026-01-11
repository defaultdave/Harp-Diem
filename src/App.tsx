import { useState } from 'react'
import './App.css'
import type { HarmonicaKey, ScaleType } from './data/harmonicas'
import { AVAILABLE_KEYS, SCALE_TYPES } from './data/harmonicas'
import { useHarmonicaScale } from './hooks/useHarmonicaScale'
import { playTone } from './utils/audioPlayer'

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

        <div className="harmonica-display">
          <h2>{harmonicaKey} Diatonic Harmonica</h2>
          <div className="holes-container">
            {harmonica.holes.map((hole: typeof harmonica.holes[0]) => {
              const isBlowPlayable = playableBlowHoles.includes(hole.hole)
              const isDrawPlayable = playableDrawHoles.includes(hole.hole)
              
              // Check if each note type is in the scale
              const isOverblowPlayable = hole.overblow && scaleNotes.includes(hole.overblow.note)
              const isBlowWholeStepPlayable = hole.blowBends?.wholeStepBend && scaleNotes.includes(hole.blowBends.wholeStepBend.note)
              const isBlowHalfStepPlayable = hole.blowBends?.halfStepBend && scaleNotes.includes(hole.blowBends.halfStepBend.note)
              const isDrawHalfStepPlayable = hole.drawBends?.halfStepBend && scaleNotes.includes(hole.drawBends.halfStepBend.note)
              const isDrawWholeStepPlayable = hole.drawBends?.wholeStepBend && scaleNotes.includes(hole.drawBends.wholeStepBend.note)
              const isDrawMinorThirdPlayable = hole.drawBends?.minorThirdBend && scaleNotes.includes(hole.drawBends.minorThirdBend.note)
              const isOverdrawPlayable = hole.overdraw && scaleNotes.includes(hole.overdraw.note)
              
              return (
                <div key={hole.hole} className="hole-column">
                  {/* Overblow and Blow Bends - Top */}
                  <div className="note-group blow-group">
                    {hole.overblow && (
                      <div 
                        className={`note-section ${isOverblowPlayable ? 'playable' : ''}`}
                        onClick={() => playTone(hole.overblow!.frequency)}
                      >
                        <div className="label">OB</div>
                        <div className="note">{hole.overblow.note}</div>
                      </div>
                    )}
                    {hole.blowBends?.wholeStepBend && (
                      <div 
                        className={`note-section ${isBlowWholeStepPlayable ? 'playable' : ''}`}
                        onClick={() => playTone(hole.blowBends!.wholeStepBend!.frequency)}
                      >
                        <div className="label">↑2</div>
                        <div className="note">{hole.blowBends.wholeStepBend.note}</div>
                      </div>
                    )}
                    {hole.blowBends?.halfStepBend && (
                      <div 
                        className={`note-section ${isBlowHalfStepPlayable ? 'playable' : ''}`}
                        onClick={() => playTone(hole.blowBends!.halfStepBend!.frequency)}
                      >
                        <div className="label">↑1</div>
                        <div className="note">{hole.blowBends.halfStepBend.note}</div>
                      </div>
                    )}
                    {/* Blow Note - Middle */}
                    <div 
                      className={`note-section ${isBlowPlayable ? 'playable' : ''}`}
                      onClick={() => playTone(hole.blow.frequency)}
                    >
                      <div className="label">Blow</div>
                      <div className="note">{hole.blow.note}</div>
                    </div>
                  </div>


                  {/* Hole Number */}
                  <div className="hole-number">{hole.hole}</div>


                  {/* Draw Bends and Overdraw - Bottom */}
                  <div className="note-group draw-group">
                    {/* Draw Note - Below Blow */}
                    <div 
                      className={`note-section ${isDrawPlayable ? 'playable' : ''}`}
                      onClick={() => playTone(hole.draw.frequency)}
                    >
                      <div className="label">Draw</div>
                      <div className="note">{hole.draw.note}</div>
                    </div>
                    {hole.drawBends?.halfStepBend && (
                      <div 
                        className={`note-section ${isDrawHalfStepPlayable ? 'playable' : ''}`}
                        onClick={() => playTone(hole.drawBends!.halfStepBend!.frequency)}
                      >
                        <div className="label">↓1</div>
                        <div className="note">{hole.drawBends.halfStepBend.note}</div>
                      </div>
                    )}
                    {hole.drawBends?.wholeStepBend && (
                      <div 
                        className={`note-section ${isDrawWholeStepPlayable ? 'playable' : ''}`}
                        onClick={() => playTone(hole.drawBends!.wholeStepBend!.frequency)}
                      >
                        <div className="label">↓2</div>
                        <div className="note">{hole.drawBends.wholeStepBend.note}</div>
                      </div>
                    )}
                    {hole.drawBends?.minorThirdBend && (
                      <div 
                        className={`note-section ${isDrawMinorThirdPlayable ? 'playable' : ''}`}
                        onClick={() => playTone(hole.drawBends!.minorThirdBend!.frequency)}
                      >
                        <div className="label">↓3</div>
                        <div className="note">{hole.drawBends.minorThirdBend.note}</div>
                      </div>
                    )}
                    {hole.overdraw && (
                      <div 
                        className={`note-section ${isOverdrawPlayable ? 'playable' : ''}`}
                        onClick={() => playTone(hole.overdraw!.frequency)}
                      >
                        <div className="label">OD</div>
                        <div className="note">{hole.overdraw.note}</div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="legend">
            <h3>Legend</h3>
            <div className="legend-items">
              <div className="legend-item">
                <div className="legend-color note-section playable"></div>
                <span>In Scale</span>
              </div>
              <div className="legend-item">
                <div className="legend-color note-section"></div>
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
