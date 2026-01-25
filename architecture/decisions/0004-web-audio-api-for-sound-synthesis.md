# ADR-0004: Web Audio API for Sound Synthesis

## Status
Accepted

## Context
The application needs to play musical notes when users interact with the harmonica visualization. Requirements:
- Play individual notes at specific frequencies
- Play chords (multiple notes simultaneously)
- Play chord progressions with timing
- Low latency for interactive feedback
- Work across browsers without plugins

Options considered:
1. **Pre-recorded audio files** - MP3/WAV samples for each note
2. **Web Audio API with oscillators** - Synthesize sounds programmatically
3. **Tone.js library** - High-level Web Audio abstraction
4. **MIDI.js** - MIDI playback library

## Decision
Use the **Web Audio API directly** with additive synthesis (multiple harmonics) to create piano-like tones.

Implementation (`src/utils/audioPlayer.ts`):
- `OscillatorNode` for tone generation
- 5 harmonics with decreasing amplitude for richer sound
- ADSR-like envelope via `GainNode`
- Shared `AudioContext` for efficiency

## Consequences

### Positive
- No audio files to load (instant startup)
- Precise frequency control (any note, any tuning)
- Small bundle size (no audio assets)
- Low latency for interactive playback
- Works in all modern browsers

### Negative
- Sound quality less realistic than samples
- More complex to create "harmonica" timbre
- Browser autoplay policies require user interaction first
- Some mobile browsers have audio quirks

### Neutral
- Could add sampled audio as enhancement later
- Web Audio API is well-supported but has learning curve

---
*Created: 2026-01-25 by [architect]*
