# Harp Diem

*Seize the harmonica!* A modern web application to visualize diatonic harmonica scales. Choose your harmonica key, song key, and scale type to instantly see which holes to play.

## Features

- **All Harmonica Keys**: Support for all 17 keys including enharmonic equivalents (C, C#, Db, D, D#, Eb, E, F, F#, Gb, G, G#, Ab, A, A#, Bb, B)
- **12 Scale Types**: Major, minor, harmonic minor, melodic minor, dorian, phrygian, lydian, mixolydian, locrian, major pentatonic, minor pentatonic, and blues
- **Complete Harmonica Layout**: Shows blow notes, draw notes, and all variations:
  - **Blow notes** - Primary notes played by blowing into holes
  - **Draw notes** - Notes played by drawing air out
  - **Blow bends** - Half step and whole step bends (↑1, ↑2)
  - **Draw bends** - Half step, whole step, and minor third bends (↓1, ↓2, ↓3)
  - **Overblows/Overdraws** - Advanced techniques (OB, OD)
- **Scale Highlighting**: Green indicates notes in the selected scale, grey for notes outside the scale
- **Audio Playback**: Click any note to hear it played with piano-like synthesis
- **Keyboard Accessible**: Full keyboard navigation with Enter/Space to play notes
- **Fully Tested**: Comprehensive test suite with 20 passing tests

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Testing**: Vitest with React Testing Library
- **Music Theory**: [tonal.js](https://github.com/tonaljs/tonal)
- **Audio**: Web Audio API with additive synthesis
- **Styling**: CSS Grid with responsive design

## Project Structure

```
src/
├── components/
│   ├── HoleColumn.tsx      # Individual harmonica hole display
│   └── ErrorBoundary.tsx   # Error handling wrapper
├── data/
│   ├── harmonicas.ts       # Diatonic harmonica layouts (Richter tuning)
│   ├── harmonicas.test.ts  # Harmonica data tests
│   ├── scales.ts           # Scale calculations using tonal.js
│   └── scales.test.ts      # Scale logic tests
├── hooks/
│   ├── useHarmonicaScale.ts      # Custom hook for scale logic
│   └── useHarmonicaScale.test.ts # Hook tests
├── utils/
│   └── audioPlayer.ts      # Web Audio API tone generation
├── test/
│   └── setup.ts            # Vitest configuration
├── App.tsx                 # Main application component
├── App.css                 # Application styling
└── main.tsx                # Application entry point
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

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
2. **Select Song Key**: Pick the key of the song you want to play
3. **Choose Scale Type**: Select from 12 available scales
4. **View Results**: Green highlighted notes are in your selected scale
5. **Play Notes**: Click or press Enter/Space on any note to hear it

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
A diatonic harmonica has 10 holes with two notes per hole (blow and draw). This app uses Richter tuning, the most common tuning system.

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
| `npm run lint` | Run ESLint |

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
