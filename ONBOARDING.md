# Harp Diem — New Hire Onboarding Guide

## What Is Harp Diem?

A **diatonic harmonica visualization tool** built with React + TypeScript + Vite. Users pick a harmonica key, tuning, song key, and scale type, and the app shows which holes to play, what chords are available, and can even detect pitch from a microphone in real time. It's deployed via GitHub Pages.

---

## Project Stats at a Glance

| Metric | Value |
|--------|-------|
| Source code | ~7,000 lines across `src/` |
| Test code | ~3,500 lines (unit) + E2E tests (Playwright) |
| Dependencies | Minimal: React 19, html2canvas, jspdf |
| Key dev dep | **tonal.js** (all music theory), Vitest, Playwright |
| Build | Vite 7, TypeScript 5.9 |

---

## Directory Structure

```
src/
├── App.tsx                 # Root component — routing, context providers, ScalesPage
├── main.tsx                # Vite entry point
├── variables.css           # CSS custom properties (light/dark themes)
├── data/                   # Pure data & music theory (no React)
│   ├── harmonicas.ts       # Harmonica layouts, tunings, transposition
│   ├── scales.ts           # Scale generation, note-in-scale checks
│   ├── chords.ts           # Chord detection & voicing generation
│   └── progressions.ts     # Chord progression patterns
├── hooks/                  # Custom React hooks
│   ├── useHarmonicaScale.ts  # THE central hook — wires data → UI
│   ├── useTheme.ts           # Dark/light mode with localStorage
│   ├── useMicrophone.ts      # Web Audio API mic access + pitch stream
│   ├── useMobileDetection.ts # Portrait orientation detection
│   └── useHashRouter.ts      # Simple hash-based routing
├── context/                # React contexts (global state)
│   ├── DisplaySettingsContext  # Tab notation vs. note names toggle
│   ├── PlaybackContext         # Audio playback state
│   ├── PitchDetectionContext   # Mic + pitch detection state
│   ├── QuizContext             # Quiz scoring & state machine
│   └── ExportContext           # PNG/PDF export config
├── components/             # UI components
│   ├── HoleColumn.tsx        # Single harmonica hole (blow/draw/bends)
│   ├── ChordExplorer/        # Chord panel with card UI + mini harmonica
│   ├── ScaleDisplay/         # Scale info bar + playback controls
│   ├── PitchDetector/        # Tuner strip with real-time pitch
│   ├── Quiz/                 # Quiz game (lazy-loaded)
│   ├── Legend/               # Display toggle controls
│   ├── NavHeader/            # Top nav bar
│   ├── ExportButton/         # PNG/PDF export
│   ├── RotateOverlay/        # Mobile "rotate your phone" prompt
│   └── ErrorBoundary.tsx     # React error boundary
├── utils/                  # Pure utility functions
│   ├── audioPlayer.ts        # Web Audio additive synthesis
│   ├── pitchDetection.ts     # Autocorrelation pitch detection
│   ├── tabNotation.ts        # Harmonica tab notation (e.g., "4↓")
│   ├── playableNotes.ts      # Bend playability logic
│   ├── export.ts             # html2canvas/jspdf wrappers
│   └── classNames.ts, events.ts, string.ts, chord.ts
└── types/                  # Shared TypeScript interfaces
    └── index.ts
```

---

## The Core Data Pipeline

This is the most important thing to understand. Data flows in one direction:

```
1. harmonicas.ts    →  Generates a 10-hole harmonica for any key + tuning
2. scales.ts        →  Generates scale notes for the selected song key
3. useHarmonicaScale →  Combines 1 + 2, returning which holes are "playable"
4. chords.ts        →  Detects chords from groups of adjacent or tongue-blocked holes
5. HoleColumn       →  Renders one column per hole, highlighting playable notes
```

### Step 1: Harmonica data (`src/data/harmonicas.ts`)

- All tunings are defined as note arrays for a **C harmonica** (lines 133-154)
- Non-C keys are created by **transposing** from C using tonal.js `Note.transpose()`
- Each hole gets: blow note, draw note, draw bends, blow bends, overblow, overdraw
- Results are **cached** in a `Map` so each key+tuning combo is built only once
- 5 tunings: richter, paddy-richter, natural-minor, country, melody-maker

### Step 2: Scale calculation (`src/data/scales.ts`)

- Thin wrapper around `tonal.Scale.get()` — just 64 lines
- `isNoteInScale()` uses **chroma comparison** (pitch class), so C# matches Db automatically
- Also provides degree calculation and Roman numeral conversion

### Step 3: The central hook (`src/hooks/useHarmonicaScale.ts`)

- Takes 4 inputs: harmonicaKey, songKey, scaleType, tuning
- Returns the harmonica object + arrays of playable blow/draw hole numbers
- Everything is `useMemo`'d — recalculates only when inputs change

### Step 4: Chord generation (`src/data/chords.ts`)

- **Consecutive chords**: Scans all 3-note and 4-note adjacent hole groups (e.g., holes 1-2-3, 2-3-4)
- **Tongue blocking chords**: Tests ~70 precomputed non-adjacent hole patterns
- Uses `tonal.Chord.detect()` to identify what chord the notes form
- Supports 6 qualities: major, minor, dominant7, minor7, diminished, augmented
- Also cached per key+tuning

### Step 5: UI rendering

- `HoleColumn` is memoized and renders blow notes on top, hole number in the middle, draw notes on bottom
- Each `NoteSection` is clickable (plays a tone via Web Audio) and shows playable/chord/detected states
- CSS modules handle all styling; CSS custom properties handle theming

---

## Key Architectural Patterns

**Pure data layer, no React**: Everything in `data/` and `utils/` is framework-agnostic. You can test it without rendering anything.

**Barrel exports**: Each directory has an `index.ts` that re-exports public APIs. Import from the directory, not individual files:
```ts
import { getHarmonica, getScaleNotes } from '../data'
import { playTone, cn } from '../utils'
```

**Context for cross-cutting concerns**: 5 contexts wrap the app. Components use the corresponding `useXxx()` hooks to access state.

**CSS Modules + CSS custom properties**: No CSS-in-JS library. Each component has a co-located `.module.css` file. Theme colors come from `variables.css`.

**tonal.js everywhere**: All music theory (transposition, chord detection, interval math, enharmonic comparison) goes through tonal. Never roll your own note math.

---

## Audio Systems

There are **two separate Web Audio pipelines**:

1. **Playback** (`audioPlayer.ts`): Additive synthesis with 5 harmonics. Triggered by clicking notes. Managed by `PlaybackContext`.

2. **Pitch detection** (`pitchDetection.ts` + `useMicrophone.ts`): Autocorrelation on mic input via `AnalyserNode`. Identifies the nearest note using MIDI matching, calculates cents offset. Managed by `PitchDetectionContext`.

They use **separate `AudioContext` instances** to avoid interference.

---

## Testing Strategy

| Layer | Tool | Files |
|-------|------|-------|
| Unit | Vitest + Testing Library | `*.test.ts` / `*.test.tsx` co-located with source |
| E2E | Playwright | `tests/e2e/*.spec.ts` |

Key test files by size (good starting points for understanding behavior):
- `chords.test.ts` (787 lines) — most comprehensive, tests all chord detection
- `harmonicas.test.ts` (439 lines) — validates tuning layouts and transposition
- `useMicrophone.test.ts` (401 lines) — Web Audio mocking patterns
- `useHarmonicaScale.test.ts` (371 lines) — integration tests for the central hook

Run tests with:
```bash
npm test -- --run          # Unit tests, single pass
npm run test:e2e           # Playwright E2E
npm run test:coverage      # Coverage report
```

---

## Quick Start for a New Developer

1. **`npm install && npm run dev`** — app at http://localhost:5173
2. **Read `harmonicas.ts`** first — this is the foundation. Understand how a C Richter tuning becomes a Bb Country tuning.
3. **Read `useHarmonicaScale.ts`** next — 66 lines that wire data to UI. This is where the magic happens.
4. **Open the app** and change the 4 dropdowns. Watch how the grid highlights change. Then read `HoleColumn.tsx` to see how.
5. **Run `npm test -- --run`** to confirm everything passes.

---

## Domain Concepts Cheat Sheet

| Term | Meaning |
|------|---------|
| **Blow / Draw** | Exhale / inhale through a hole |
| **Bend** | Lowering pitch by mouth shape (half-step, whole-step, minor-third) |
| **Overblow / Overdraw** | Advanced technique to raise pitch on specific holes |
| **Position** | Relationship between harmonica key and song key (1st = same key, 2nd = blues cross harp) |
| **Tuning** | Physical reed layout — Richter is standard, others modify specific holes |
| **Tongue blocking** | Playing non-adjacent holes by blocking middle holes with your tongue |
| **Tab notation** | Harmonica-specific notation: `4↑` = blow hole 4, `3↓'` = draw bend hole 3 |
