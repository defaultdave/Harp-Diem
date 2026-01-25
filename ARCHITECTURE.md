# Architecture Overview

**Harp Diem** is a React 19 + TypeScript web application for visualizing diatonic harmonica scales, chords, and providing interactive music education features.

## System Structure

The application follows a **layered architecture** with clear separation between data logic, state management, and presentation:

```
┌─────────────────────────────────────────────────┐
│           UI Components Layer                   │
│  (HoleColumn, ChordDisplay, ScaleDisplay, etc.) │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│      Custom Hooks + Context Consumers           │
│   (useHarmonicaScale, usePlayback, useQuiz)     │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│    React Context Providers (State Management)   │
│  (DisplaySettings, Playback, Quiz, Export)      │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│   Data Layer + Utils (Pure Functions, No React) │
│   (harmonicas.ts, scales.ts, chords.ts, etc.)   │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│    External Libraries (tonal.js, Web Audio)     │
└─────────────────────────────────────────────────┘
```

## Key Components

### Directory Structure

```
src/
├── components/          # UI presentation layer
│   ├── ChordDisplay/    # Chord visualization
│   ├── ExportButton/    # PNG/PDF export
│   ├── HoleColumn.tsx   # Harmonica hole (memo-optimized)
│   ├── Legend/          # Display toggles
│   ├── NavHeader/       # Navigation & theme
│   ├── Quiz/            # Key identification quiz
│   ├── RotateOverlay/   # Mobile rotation prompt
│   ├── ScaleDisplay/    # Scale info & playback
│   └── ErrorBoundary.tsx
│
├── context/             # React Context providers
│   ├── DisplaySettingsContext.tsx
│   ├── PlaybackContext.tsx
│   ├── QuizContext.tsx
│   └── ExportContext.tsx
│
├── data/                # Core music theory (pure functions)
│   ├── harmonicas.ts    # Harmonica layouts & transposition
│   ├── scales.ts        # Scale calculations
│   ├── chords.ts        # Chord voicing generation
│   └── progressions.ts  # Quiz chord progressions
│
├── hooks/               # Custom React hooks
│   ├── useHarmonicaScale.ts
│   ├── useHashRouter.ts
│   ├── useMobileDetection.ts
│   └── useTheme.ts
│
├── utils/               # Utilities & helpers
│   ├── audioPlayer.ts   # Web Audio synthesis
│   ├── export.ts        # PNG/PDF export
│   ├── tabNotation.ts   # Harmonica tablature
│   └── playableNotes.ts # Bend playability
│
├── types/               # TypeScript definitions
├── App.tsx              # Root component
├── main.tsx             # Entry point
├── variables.css        # Design tokens
└── index.css            # Global styles
```

### Component Responsibilities

| Component | Purpose |
|-----------|---------|
| **HoleColumn** | Renders a single harmonica hole with blow/draw notes, bends, and audio playback |
| **ChordDisplay** | Interactive chord diagram with playback and hole highlighting |
| **ScaleDisplay** | Scale information, playback controls, and tempo slider |
| **Legend** | Display toggles for notes/tab notation, degrees, and intervals |
| **NavHeader** | Navigation between pages, theme toggle |
| **Quiz** | Key identification quiz with difficulty levels |
| **ExportButton** | PNG/PDF/Print export functionality |

## Data Flow

### Scale Selection Example

```
User selects key/scale
  ↓
App.tsx state update
  ↓
useHarmonicaScale hook
  ├─ getHarmonica(key, tuning) → DiatonicHarmonica
  ├─ getScaleNotes(songKey, scaleType) → MusicalNote[]
  └─ Filter holes via isNoteInScale()
  ↓
HoleColumn components receive playable/unplayable data
  ↓
DisplaySettingsContext controls visual mode
  ↓
PlaybackContext handles audio on click
```

### Audio Playback

```
User clicks note/chord
  ↓
audioPlayer.ts (Web Audio API)
  ├─ Create OscillatorNode
  ├─ Apply additive synthesis (5 harmonics)
  └─ Play with ADSR envelope
  ↓
PlaybackContext updates state
  ↓
Components highlight playing notes
```

## Patterns Used

### Barrel Files
All major modules export via `index.ts` for clean imports:
```typescript
import { ChordDisplay, HoleColumn, ScaleDisplay } from './components'
```

### React Context for State
Four separate contexts for distinct concerns:
- **DisplaySettingsContext**: UI display toggles (notes/tab, degrees, intervals)
- **PlaybackContext**: Audio playback and note highlighting
- **QuizContext**: Quiz state and question generation
- **ExportContext**: Export configuration

### Memoization
- `HoleColumn` wrapped in `memo()` to prevent unnecessary re-renders
- `useHarmonicaScale` uses `useMemo()` for expensive calculations

### Lazy Loading
- Quiz module loaded via `React.lazy()` only when navigated to
- Export libraries (html2canvas, jsPDF) in separate chunk

### Hash-Based Routing
Client-side routing using `window.location.hash` for GitHub Pages compatibility (no server rewrites needed).

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI framework |
| TypeScript | ~5.9.3 | Type safety |
| Vite | 7.2.4 | Build tool |
| tonal.js | 6.4.2 | Music theory calculations |
| html2canvas | 1.4.1 | PNG export |
| jsPDF | 4.0.0 | PDF export |
| Vitest | 4.0.16 | Unit testing |
| Playwright | 1.57.0 | E2E testing |

## Technology Decisions

See [Architecture Decision Records](./architecture/decisions/) for documented decisions.

## Conventions

### Code Organization
- **Barrel files** for all module exports
- **Pure functions** in data layer (no React dependencies)
- **Custom hooks** for reusable stateful logic
- **Context providers** for cross-cutting state

### Styling
- **CSS Modules** for component scoping
- **CSS Custom Properties** (design tokens) in `variables.css`
- **Dark/light theming** via `data-theme` attribute

### TypeScript
- Strict mode enabled
- Types exported via barrel files
- Avoid `any` - use proper typing

### Testing
- Unit tests for data layer and hooks
- Component tests with React Testing Library
- E2E tests with Playwright

---
*Last updated: 2026-01-25 by [architect]*
