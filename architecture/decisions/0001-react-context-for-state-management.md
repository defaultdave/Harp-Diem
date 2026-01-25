# ADR-0001: React Context for State Management

## Status
Accepted

## Context
The application needs to manage several types of state that are shared across multiple components:
- Display settings (notes/tab notation, scale degrees, intervals)
- Audio playback state (currently playing notes, playback status)
- Quiz state (questions, answers, scores)
- Export configuration (target element, options)

Options considered:
1. **Redux/Zustand** - External state management library
2. **React Context** - Built-in React API
3. **Component prop drilling** - Pass state through component tree

## Decision
Use **React Context API** with multiple focused contexts rather than a single global store or external library.

Four separate contexts are implemented:
- `DisplaySettingsContext` - UI display toggles
- `PlaybackContext` - Audio playback state
- `QuizContext` - Quiz game state
- `ExportContext` - Export configuration

## Consequences

### Positive
- No additional dependencies for state management
- Natural fit with React's component model
- Clear separation of concerns with multiple contexts
- Easy to test contexts in isolation
- Simpler mental model for a medium-sized application

### Negative
- May need optimization (memoization) if context updates become frequent
- No built-in dev tools like Redux DevTools
- Multiple providers can lead to "provider hell" at the app root

### Neutral
- Context consumers re-render on any context value change (mitigated by splitting contexts)
- Future scaling may require reconsidering if state becomes more complex

---
*Created: 2026-01-25 by [architect]*
