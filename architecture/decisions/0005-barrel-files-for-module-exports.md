# ADR-0005: Barrel Files for Module Exports

## Status
Accepted

## Context
As the codebase grows, import statements can become verbose and reveal internal module structure:

```typescript
// Without barrels - verbose, exposes internal paths
import { HoleColumn } from './components/HoleColumn'
import { ChordDisplay } from './components/ChordDisplay/ChordDisplay'
import { getHarmonica } from './data/harmonicas'
import { getScaleNotes } from './data/scales'
```

Options considered:
1. **Direct imports** - Import from exact file paths
2. **Barrel files (index.ts)** - Re-export from index files
3. **Path aliases** - TypeScript path mapping

## Decision
Use **barrel files** (`index.ts`) in each major module directory to consolidate exports.

```typescript
// src/components/index.ts
export { HoleColumn } from './HoleColumn'
export { ChordDisplay } from './ChordDisplay'
export { ScaleDisplay } from './ScaleDisplay'
// ...

// Consumer code - clean imports
import { HoleColumn, ChordDisplay, ScaleDisplay } from './components'
```

Applied to:
- `src/components/index.ts`
- `src/context/index.ts`
- `src/data/index.ts`
- `src/hooks/index.ts`
- `src/utils/index.ts`
- `src/types/index.ts`

## Consequences

### Positive
- Cleaner import statements
- Encapsulates internal module structure
- Easy to refactor internal file organization
- Single source of truth for public API of each module
- IDE autocomplete works better with consolidated exports

### Negative
- Must maintain barrel files when adding/removing exports
- Can cause circular dependency issues if not careful
- Slightly more files to manage
- Tree-shaking may be affected (mitigated by explicit re-exports)

### Neutral
- Convention requires team alignment
- TypeScript handles type re-exports seamlessly

---
*Created: 2026-01-25 by [architect]*
