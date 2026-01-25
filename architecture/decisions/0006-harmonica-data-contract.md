# ADR-0006: Harmonica Data Contract

## Status
Accepted

## Context
The `getHarmonica` function in `src/data/harmonicas.ts` is the primary data source for the application. All harmonica visualization, audio playback, scale matching, and chord generation depend on this data contract. Changes to this structure would require updates across multiple components and hooks.

This ADR documents the data contract to establish clear expectations for consumers and define invariants that must be maintained.

## Decision
Document the `getHarmonica` data contract as the canonical interface for harmonica data.

### Function Signature

```typescript
getHarmonica(key: HarmonicaKey, tuning?: TuningType): DiatonicHarmonica
```

### Core Types

```typescript
interface DiatonicHarmonica {
  key: HarmonicaKey                    // 'C' | 'Db' | ... | 'B' (12 keys)
  holes: HoleNote[]                    // Always exactly 10 holes
}

interface HoleNote {
  hole: number                         // 1-10
  blow: HarmonicaNote                  // Always present
  draw: HarmonicaNote                  // Always present
  blowBends?: HoleBends                // Present when blow > draw (holes 7-10)
  drawBends?: HoleBends                // Present when draw > blow (holes 1-6)
  overblow?: HarmonicaNote             // Present on holes [1, 4, 5, 6]
  overdraw?: HarmonicaNote             // Present on holes [7, 9, 10]
}

interface HoleBends {
  halfStepBend?: HarmonicaNote         // -1 semitone from parent note
  wholeStepBend?: HarmonicaNote        // -2 semitones (if interval >= 3)
  minorThirdBend?: HarmonicaNote       // -3 semitones (if interval >= 4)
}

interface HarmonicaNote {               // Alias for MusicalNote
  note: string                          // e.g., "C4", "Eb5"
  frequency: number                     // Hz (always > 0)
}

type HarmonicaKey = 'C' | 'Db' | 'D' | 'Eb' | 'E' | 'F' | 'F#' | 'G' | 'Ab' | 'A' | 'Bb' | 'B'

type TuningType = 'richter' | 'paddy-richter' | 'natural-minor' | 'country' | 'melody-maker'
```

### Invariants (Guaranteed Properties)

1. **Always 10 holes** - `holes.length === 10`
2. **Holes numbered 1-10** - `holes[i].hole === i + 1`
3. **Blow/draw always present** - Never undefined, always have valid frequency > 0
4. **Bends are conditional** - Based on interval between blow and draw
5. **Frequencies always valid** - All `HarmonicaNote.frequency > 0`
6. **Notes are simplified** - Enharmonics normalized (Fb -> E, B# -> C)
7. **Caching** - Same key+tuning returns cached instance

### Bend Availability Rules

| Condition | Result |
|-----------|--------|
| Draw pitch > Blow pitch | `drawBends` populated, `blowBends` undefined |
| Blow pitch > Draw pitch | `blowBends` populated, `drawBends` undefined |
| Interval >= 2 semitones | `halfStepBend` available |
| Interval >= 3 semitones | `wholeStepBend` available |
| Interval >= 4 semitones | `minorThirdBend` available |

### Overblow/Overdraw Availability

- **Overblows**: Holes 1, 4, 5, 6 (where draw > blow)
- **Overdraws**: Holes 7, 9, 10 (where blow > draw)

### Consumers

| Consumer | What it accesses |
|----------|------------------|
| `useHarmonicaScale` | `harmonica.holes`, filters by `.blow.note` / `.draw.note` |
| `HoleColumn` | All `HoleNote` properties for rendering |
| `ScaleDisplay` | `harmonica.holes` for playback note collection |
| `playableNotes` | All note variants including bends |

## Consequences

### Positive
- Clear contract for all consumers enables confident refactoring
- Invariants documented for testing validation
- Guides future modifications to maintain compatibility

### Negative
- Contract changes require ADR updates
- Adds documentation maintenance overhead

### Neutral
- Formalizes existing implicit contract
- Types already exist in code; this documents their semantics

---
*Created: 2026-01-25 by [architect]*
