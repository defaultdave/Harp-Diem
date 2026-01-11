# Harmonica Scale Viewer

A modern web application to visualize diatonic harmonica scales. Choose your harmonica key, song key, and scale type to instantly see which holes to play.

## Features

- 🎵 **Multiple Harmonica Keys**: Support for C, D, E, F, G, A, and B diatonic harmonicas
- 🎼 **Scale Selection**: Major, minor, pentatonic, and blues scales
- 📊 **Complete Harmonica Layout**: Shows blow notes, draw notes, and all variations:
  - **Blow notes** - Primary notes played by blowing into holes
  - **Draw notes** - Notes played by drawing air out
  - **Blow bends** - Half step and whole step bends (↓1, ↓2)
  - **Draw bends** - Half step, whole step, and minor third bends (↑1, ↑2, ↑3)
  - **Overblows/Overdraws** - Advanced techniques for altissimo register (OB, OD)
- 🎯 **Scale Highlighting**: Visual indicators show which holes play the selected scale
- 🔊 **Note Frequencies**: Exact frequencies for each note
- ✅ **Fully Tested**: Comprehensive test suite with Vitest (9+ passing tests)
- 📦 **Modern Stack**: React + TypeScript + Vite + tonal.js

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Testing**: Vitest with React Testing Library
- **Music Theory**: [tonal.js](https://github.com/tonaljs/tonal)
- **Styling**: CSS with responsive design

## Project Structure

```
src/
├── components/          # React components (future expansions)
├── data/
│   ├── harmonicas.ts   # Diatonic harmonica layouts and definitions
│   ├── scales.ts       # Scale calculations using tonal.js
│   └── *.test.ts       # Unit tests for data modules
├── hooks/
│   └── useHarmonicaScale.ts  # Custom hook for scale logic
├── utils/              # Utility functions (for future features)
├── test/
│   └── setup.ts        # Vitest configuration
├── App.tsx            # Main application component
├── App.css            # Application styling
└── main.tsx           # Application entry point
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

Run the test suite:

```bash
npm test              # Watch mode
npm test -- --run    # Run once
npm run test:ui      # Open Vitest UI
npm run test:coverage # Coverage report
```

### Building

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## How to Use

1. **Select Harmonica Key**: Choose which harmonica you're playing (C, D, E, F, G, A, or B)
2. **Select Song Key**: Pick the key of the song you want to play
3. **Choose Scale Type**: Select major, minor, pentatonic, or blues scale
4. **View Results**: See all hole variations with scale highlighting
   - **Green/Highlighted holes**: Playable notes (blow or draw) in the selected scale
   - **Standard display**: Grayed out or normal display for non-scale notes

### Harmonica Display

Each hole displays all available notes and techniques:

- **Blow** - Main blow note (displayed in blue)
- **Draw** - Main draw note (displayed in purple)
- **↓1, ↓2** - Blow bends (yellow) - lower the blow note by half/whole step
- **↑1, ↑2, ↑3** - Draw bends (orange) - raise the draw note by half/whole/minor-third steps
- **OB** - Overblow (red) - advanced technique for blow holes
- **OD** - Overdraw (orange-red) - advanced technique for draw holes

Each note shows:
- Note name (e.g., C4, E4)
- Frequency in Hz
- Visual indication if it's in your selected scale

## Key Concepts

### Diatonic Harmonica
A diatonic harmonica has 10 holes with two notes per hole (blow and draw). This app uses Richter tuning, the most common tuning system.

### Music Theory
The application uses the excellent [tonal.js](https://tonaljs.github.io/tonal/docs) library for:
- Note transposition
- Scale generation
- Frequency calculations
- Interval operations

## Future Features

- 🎙️ **Microphone Input**: Listen to what you play and display detected notes
- 📈 **Visual Feedback**: Real-time pitch detection visualization
- 📱 **Mobile Optimized**: Full mobile experience for on-the-go learning
- 🎯 **Practice Mode**: Exercises and guided learning
- 💾 **Favorites**: Save preferred key/scale combinations

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm test` - Run tests in watch mode
- `npm test -- --run` - Run tests once
- `npm run test:ui` - Open interactive test UI
- `npm run test:coverage` - Generate coverage report
- `npm run lint` - Run ESLint

## Architecture Notes

### State Management
The app uses React hooks with `useState` for UI state and `useMemo` for derived calculations. This is lightweight and sufficient for the current scope. As features grow, consider adding Context API or a state management library.

### Testing
- Data modules are thoroughly tested with unit tests
- Use Vitest for fast, modern testing
- The `useHarmonicaScale` hook is testable with React Testing Library (future)

### Performance
- Memoized scale calculations prevent unnecessary recalculations
- CSS Grid layout for responsive hole display
- Minimal dependencies (only React + tonal.js)

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

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
