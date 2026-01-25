# ADR-0002: Layered Architecture with Pure Data Layer

## Status
Accepted

## Context
The application performs complex music theory calculations:
- Harmonica note layouts and transposition
- Scale note calculations
- Chord voicing generation
- Playability analysis (bends, overblows)

These calculations need to be:
- Testable without React rendering
- Reusable across different UI components
- Performant (memoizable)

## Decision
Implement a **layered architecture** where the data layer (`src/data/`) contains pure functions with no React dependencies.

```
UI Components → Hooks → Context → Data Layer → tonal.js
```

The data layer includes:
- `harmonicas.ts` - Harmonica layouts, transposition
- `scales.ts` - Scale calculations, note matching
- `chords.ts` - Chord voicing generation
- `progressions.ts` - Quiz chord progressions

All functions are pure: same inputs always produce same outputs, no side effects.

## Consequences

### Positive
- Data functions are trivially unit testable
- Easy to memoize expensive calculations
- Clear dependency direction (data knows nothing about UI)
- Can be extracted to a separate package if needed
- Enables parallel development of data logic and UI

### Negative
- Requires discipline to maintain layer boundaries
- Some duplication of types between layers
- Hook layer acts as "glue code" which can feel redundant

### Neutral
- tonal.js dependency isolated to data layer
- Types defined in data layer, re-exported via barrels

---
*Created: 2026-01-25 by [architect]*
