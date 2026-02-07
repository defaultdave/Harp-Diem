# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev            # Start development server (http://localhost:5173)
npm run build          # Build for production (runs tsc -b && vite build)
npm run lint           # Run ESLint
npm test               # Run tests in watch mode
npm test -- --run      # Run tests once
npm run test:ui        # Open Vitest interactive UI
npm run test:coverage  # Generate coverage report
npm run test:e2e       # Run Playwright E2E tests
npm run test:e2e:ui    # Run E2E tests in interactive UI mode
```

## Architecture

**Harp Diem** is a React + TypeScript + Vite application for visualizing diatonic harmonica scales.

### Core Data Flow

1. **Harmonica Data** (`src/data/harmonicas.ts`): Defines a C harmonica layout in Richter tuning, then transposes it to all other keys using tonal.js. Each hole contains blow/draw notes plus bends (half-step, whole-step, minor-third) and overblows/overdraws.

2. **Scale Calculation** (`src/data/scales.ts`): Uses tonal.js `Scale.get()` to generate scale notes. The `isNoteInScale()` function compares notes ignoring octaves.

3. **Chord Calculation** (`src/data/chords.ts`): Generates playable chords for the selected scale. Each chord includes quality (major/minor/dominant/diminished), holes to play, and breath direction.

4. **State Hook** (`src/hooks/useHarmonicaScale.ts`): Combines harmonica data with scale selection. Returns which holes are playable for the selected scale via memoized calculations.

5. **UI** (`src/App.tsx`): Main component with dropdowns (harmonica key, tuning, song key, scale type). Renders the harmonica grid, chord display, and theme toggle.

6. **Pitch Detection** (`src/utils/pitchDetection.ts` + `src/hooks/useMicrophone.ts`): Real-time pitch detection using autocorrelation on microphone input via Web Audio API. Detects frequency, identifies nearest note with enharmonic-safe MIDI matching, calculates cents offset, and provides confidence scoring. `PitchDetectionContext` manages global state with configurable reference pitch (A4 Hz).

### Key Types

- `HarmonicaKey`: All 17 keys including enharmonic equivalents (C, C#, Db, D, etc.)
- `HoleNote`: Contains hole number, blow/draw notes, optional bends (blowBends/drawBends as HoleBends), overblow, overdraw
- `HoleBends`: Optional halfStepBend, wholeStepBend, minorThirdBend
- `Chord`: Contains chord name, quality, holes array, breath direction, and roman numeral
- `PitchResult`: Detected frequency (Hz), note name, cents offset, confidence score (0-1)

### Key Hooks

- `useHarmonicaScale`: Combines harmonica data with scale selection
- `useTheme`: Manages light/dark theme with localStorage persistence and system preference detection
- `useMobileDetection`: Detects mobile devices in portrait orientation for rotate overlay
- `useMicrophone`: Manages microphone access via MediaStream, real-time pitch detection using AnalyserNode with FFT analysis, and cleanup lifecycle

### Contexts

- `DisplaySettingsContext`: Tab notation and scale degrees display toggles
- `PlaybackContext`: Audio playback state management
- `QuizContext`: Quiz state and scoring
- `ExportContext`: PNG/PDF export configuration
- `PitchDetectionContext`: Microphone access, pitch detection state, reference Hz configuration with localStorage persistence

### Audio

**Playback:** `src/utils/audioPlayer.ts` uses Web Audio API with additive synthesis (5 harmonics) to create piano-like tones when clicking notes.

**Pitch Detection:** `src/utils/pitchDetection.ts` implements autocorrelation for real-time frequency detection from microphone input. Uses separate AudioContext from playback. Detects all note types (blow, draw, bends, overblows, overdraws) with enharmonic-safe MIDI matching and configurable reference pitch (A4 = 410-460 Hz).

### Theming

CSS custom properties in `src/variables.css` define colors for light and dark modes. The `data-theme` attribute on `<html>` controls the active theme. Key variable categories:
- `--color-bg-*`: Background colors
- `--color-text-*`: Text colors
- `--color-playable`: Scale-playable note highlighting
- `--color-chord-*`: Chord quality colors (major, minor, dominant, diminished)
- `--color-breath-*`: Blow/draw indicators

### Music Theory

All note transposition, interval calculation, and scale generation uses [tonal.js](https://github.com/tonaljs/tonal). Key functions: `Note.transpose()`, `Note.freq()`, `Interval.distance()`, `Scale.get()`.

### Key Components

- `HoleColumn`: Renders a single harmonica hole with all note variations
- `ChordDisplay`: Shows playable chords with interactive highlighting
- `ScaleDisplay`: Scale info and playback controls (play/stop, tempo slider)
- `Legend`: Display toggles for tab notation and scale degrees
- `RotateOverlay`: Mobile prompt to rotate device for optimal viewing
- `PitchDetector`: Tuner strip with microphone toggle, real-time pitch visualization (note + cents offset), in-scale highlighting, and configurable A4 reference pitch

### Dev Container

The project includes a `.devcontainer/` configuration for VS Code with:
- Node 20 LTS with Playwright dependencies
- Pre-configured extensions (ESLint, Prettier, Vitest, Playwright, Claude Code)
- Network firewall for secure Claude Code YOLO mode (restricts network to allowlisted domains)
