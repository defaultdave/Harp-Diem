# Harp Diem

*Seize the harmonica!* A modern web application to visualize diatonic harmonica scales. Choose your harmonica key, song key, and scale type to instantly see which holes to play.

## Features

- **All Harmonica Keys**: Support for all 12 keys (C, Db, D, Eb, E, F, F#, G, Ab, A, Bb, B)
- **Multiple Tunings**: Richter (standard), Paddy Richter, Natural Minor, Country, and Melody Maker
- **12 Scale Types**: Major, minor, harmonic minor, melodic minor, dorian, phrygian, lydian, mixolydian, locrian, major pentatonic, minor pentatonic, and blues
- **Complete Harmonica Layout**: Shows blow notes, draw notes, and all variations:
  - **Blow notes** - Primary notes played by blowing into holes
  - **Draw notes** - Notes played by drawing air out
  - **Blow bends** - Half step and whole step bends (↑1, ↑2)
  - **Draw bends** - Half step, whole step, and minor third bends (↓1, ↓2, ↓3)
  - **Overblows/Overdraws** - Advanced techniques (OB, OD)
- **Scale Highlighting**: Green indicates notes in the selected scale, grey for notes outside the scale
- **Tab Notation Toggle**: Switch between standard note names (C, D, E) and harmonica tablature (+1, -1, -4', etc.)
- **Scale Degrees**: Toggle to display Roman numerals (I-VII) showing each note's position in the scale
- **Play Scale**: Automatically play all notes in the selected scale in ascending order with visual highlighting
- **Playback Controls**: Stop button to halt playback mid-scale and tempo slider (40-200 BPM) to adjust playback speed
- **Visual Feedback**: Harmonica holes highlight during scale playback to guide playing
- **Chord Diagrams**: View playable chords for the selected scale with color-coded quality indicators (major, minor, dominant 7th, diminished)
- **Interactive Chord Highlighting**: Click any chord to highlight its constituent holes on the harmonica
- **Dark Mode**: Toggle between light and dark themes with system preference detection and localStorage persistence
- **Mobile Support**: Portrait mobile users see a prompt to rotate their device for the best harmonica viewing experience
- **Audio Playback**: Click any note or chord to hear it played with piano-like synthesis
- **Keyboard Accessible**: Full keyboard navigation with Enter/Space to play notes
- **Key Identification Quiz**: Test your ear training skills by identifying keys from chord progressions
- **Export Options**: Save harmonica diagrams as PNG or PDF, or print directly
- **Interval Display**: Toggle to show intervals between consecutive scale notes
- **API Documentation**: TypeDoc-generated API documentation with the rhineai theme
- **Fully Tested**: Comprehensive test suite with unit tests and E2E tests using Playwright

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Testing**: Vitest with React Testing Library, Playwright for E2E testing
- **State Management**: React Context API (DisplaySettingsContext, PlaybackContext, QuizContext, ExportContext)
- **Music Theory**: [tonal.js](https://github.com/tonaljs/tonal)
- **Audio**: Web Audio API with additive synthesis
- **Export**: html2canvas + jsPDF for PNG/PDF export (lazy-loaded)
- **Documentation**: TypeDoc with rhineai theme
- **Styling**: CSS Grid with responsive design and CSS custom properties

## Project Structure

```
src/
├── components/           # UI components
│   ├── ChordDisplay/     # Chord diagram visualization
│   ├── ExportMenu/       # PNG/PDF export and print menu
│   ├── HoleColumn/       # Individual harmonica hole display
│   ├── Legend/           # Scale legend with display toggles
│   ├── Quiz/             # Key identification quiz
│   ├── RotateOverlay/    # Mobile rotation prompt
│   ├── ScaleDisplay/     # Scale information and playback
│   └── ErrorBoundary.tsx # Error handling wrapper
├── context/              # React contexts (barrel exports via index.ts)
│   ├── DisplaySettingsContext.tsx  # Display mode state
│   ├── ExportContext.tsx           # Export functionality state
│   ├── PlaybackContext.tsx         # Audio playback state
│   └── QuizContext.tsx             # Quiz state management
├── data/                 # Core data layer (barrel exports via index.ts)
│   ├── harmonicas.ts     # Harmonica layouts and tunings
│   ├── scales.ts         # Scale calculations using tonal.js
│   ├── chords.ts         # Chord voicing generation
│   └── progressions.ts   # Quiz chord progressions
├── hooks/                # Custom hooks (barrel exports via index.ts)
│   ├── useHarmonicaScale.ts  # Harmonica + scale logic
│   ├── useHashRouter.ts      # Hash-based routing
│   ├── useMobileDetection.ts # Mobile viewport detection
│   └── useTheme.ts           # Dark/light theme management
├── types/                # TypeScript type definitions
├── utils/                # Utilities (barrel exports via index.ts)
│   ├── audioPlayer.ts    # Web Audio API synthesis
│   ├── export.ts         # PNG/PDF export functions
│   ├── exportLazy.ts     # Lazy-loaded export (reduces bundle)
│   ├── tabNotation.ts    # Harmonica tablature notation
│   └── ...               # Other utilities
├── App.tsx               # Main application component
├── variables.css         # CSS custom properties (design tokens)
└── main.tsx              # Application entry point
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Development with Dev Container (Recommended)

This project includes a Dev Container configuration for VS Code that provides a fully configured development environment:

1. Install the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
2. Open the project in VS Code
3. Click "Reopen in Container" when prompted (or use Command Palette: "Dev Containers: Reopen in Container")

The container includes:
- Node.js 20 LTS
- Playwright with Chromium for E2E testing
- Pre-configured VS Code extensions (ESLint, Prettier, Vitest, Playwright)
- Network firewall for secure Claude Code YOLO mode

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Testing

```bash
npm test              # Watch mode
npm test -- --run     # Run once
npm run test:ui       # Open Vitest UI
npm run test:coverage # Coverage report
```

### Building

```bash
npm run build         # Build for production
npm run preview       # Preview production build
```

## How to Use

1. **Select Harmonica Key**: Choose which harmonica you're playing
2. **Select Tuning**: Choose your harmonica's tuning (Richter is the default)
3. **Select Song Key**: Pick the key of the song you want to play
4. **Choose Scale Type**: Select from 12 available scales
5. **View Results**: Green highlighted notes are in your selected scale
6. **Toggle Display Modes**:
   - Click "Show Tab" to switch between note names (C, D, E) and harmonica tablature (+1, -1, -4', etc.)
   - Click "Show Degrees" to display Roman numerals (I-VII) for scale positions
   - Click the theme toggle button to switch between light and dark modes
7. **Play Notes**: Click or press Enter/Space on any note to hear it
8. **Play Scale**: Click the "Play Scale" button to hear all notes in the scale automatically
9. **Control Playback**:
   - Adjust tempo with the slider (40-200 BPM) before or between playbacks
   - Click "Stop" to halt playback mid-scale
   - Watch notes and harmonica holes highlight as each note plays
10. **Explore Chords**: Scroll down to view playable chords for your scale
    - Click any chord to highlight its holes on the harmonica
    - Color-coded left borders indicate chord quality (green=major, orange=minor, red=dominant 7th, purple=diminished)

### Harmonica Display

Each hole displays all available notes and techniques:

- **Blow** - Main blow note
- **Draw** - Main draw note
- **↑1, ↑2** - Blow bends (lower the blow note)
- **↓1, ↓2, ↓3** - Draw bends (lower the draw note)
- **OB** - Overblow
- **OD** - Overdraw

## Key Concepts

### Diatonic Harmonica
A diatonic harmonica has 10 holes with two notes per hole (blow and draw). This app supports multiple tuning systems, with Richter being the default.

### Tunings

The app supports 5 harmonica tunings, each optimized for different playing styles:

| Tuning | Best For | Key Differences (in C) |
|--------|----------|------------------------|
| **Richter** | General use, blues, rock | Standard tuning - the default for most harmonicas |
| **Paddy Richter** | Celtic, Irish, folk | Hole 3 blow raised (G→A) for easier melody playing |
| **Natural Minor** | Minor keys, sad songs | Minor 3rds (Eb) and 7ths (Bb) built in |
| **Country** | Country, bluegrass | Hole 5 draw raised (F→F#) for major 7th |
| **Melody Maker** | Melody playing | Hole 3 blow + holes 5,9 draw raised |

Bends are calculated dynamically based on each tuning's note layout, so all tunings show accurate bend availability.

### Music Theory
The application uses [tonal.js](https://tonaljs.github.io/tonal/docs) for note transposition, scale generation, frequency calculations, and interval operations.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run tests in watch mode |
| `npm test -- --run` | Run tests once |
| `npm run test:ui` | Open interactive test UI |
| `npm run test:coverage` | Generate coverage report |
| `npm run test:e2e` | Run E2E tests with Playwright |
| `npm run test:e2e:ui` | Run E2E tests in interactive UI mode |
| `npm run test:e2e:headed` | Run E2E tests in headed browser mode |
| `npm run lint` | Run ESLint |
| `npm run docs` | Generate API documentation |
| `npm run docs:serve` | Generate and serve API docs locally |

## Contributing

1. Create a new branch for your feature
2. Add tests for new functionality
3. Ensure all tests pass: `npm test -- --run`
4. Build successfully: `npm run build`
5. Submit a pull request

## License

MIT License - feel free to use this for your own harmonica learning journey!

## Acknowledgments

- Built with [tonal.js](https://github.com/tonaljs/tonal) for music theory
- Harmonicas are awesome! 🎵
