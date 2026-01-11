# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server (http://localhost:5173)
npm run build        # Build for production (runs tsc -b && vite build)
npm run lint         # Run ESLint
npm test             # Run tests in watch mode
npm test -- --run    # Run tests once
npm run test:ui      # Open Vitest interactive UI
npm run test:coverage # Generate coverage report
```

## Architecture

**Harp Diem** is a React + TypeScript + Vite application for visualizing diatonic harmonica scales.

### Core Data Flow

1. **Harmonica Data** (`src/data/harmonicas.ts`): Defines a C harmonica layout in Richter tuning, then transposes it to all other keys using tonal.js. Each hole contains blow/draw notes plus bends (half-step, whole-step, minor-third) and overblows/overdraws.

2. **Scale Calculation** (`src/data/scales.ts`): Uses tonal.js `Scale.get()` to generate scale notes. The `isNoteInScale()` function compares notes ignoring octaves.

3. **State Hook** (`src/hooks/useHarmonicaScale.ts`): Combines harmonica data with scale selection. Returns which holes are playable for the selected scale via memoized calculations.

4. **UI** (`src/App.tsx`): Single component with three dropdowns (harmonica key, song key, scale type). Renders a 10-hole harmonica grid with all note variations, highlighting those in the selected scale.

### Key Types

- `HarmonicaKey`: All 17 keys including enharmonic equivalents (C, C#, Db, D, etc.)
- `HoleNote`: Contains hole number, blow/draw notes, optional bends (blowBends/drawBends as HoleBends), overblow, overdraw
- `HoleBends`: Optional halfStepBend, wholeStepBend, minorThirdBend

### Audio

`src/utils/audioPlayer.ts` uses Web Audio API with additive synthesis (5 harmonics) to create piano-like tones when clicking notes.

### Music Theory

All note transposition, interval calculation, and scale generation uses [tonal.js](https://github.com/tonaljs/tonal). Key functions: `Note.transpose()`, `Note.freq()`, `Interval.distance()`, `Scale.get()`.
