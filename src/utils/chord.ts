/**
 * @packageDocumentation
 * Chord comparison and identification utilities.
 *
 * @category Utils
 */

/**
 * Minimal chord identity for comparison (holes + breath direction).
 * @internal
 */
interface ChordIdentity {
  holes: number[]
  breath: 'blow' | 'draw'
}

/**
 * Generates a unique string key for a chord based on its holes and breath direction.
 *
 * @remarks
 * Used for deduplication and comparison of chord voicings.
 * Two chords with the same holes and breath direction are considered identical.
 *
 * @param chord - Object with holes array and breath direction
 * @returns Unique key string (e.g., "1,2,3-blow")
 *
 * @example
 * ```typescript
 * getChordKey({ holes: [1, 2, 3], breath: 'blow' })  // "1,2,3-blow"
 * getChordKey({ holes: [2, 3, 4], breath: 'draw' })  // "2,3,4-draw"
 * ```
 */
export const getChordKey = (chord: ChordIdentity): string =>
  `${chord.holes.join(',')}-${chord.breath}`

/**
 * Compares two chords to check if they represent the same voicing.
 *
 * @param a - First chord (can be null/undefined)
 * @param b - Second chord
 * @returns True if chords have same holes and breath, false otherwise
 *
 * @example
 * ```typescript
 * areChordsSame(chordA, chordB)  // true if same voicing
 * areChordsSame(null, chordB)    // false
 * ```
 */
export const areChordsSame = (
  a: ChordIdentity | null | undefined,
  b: ChordIdentity
): boolean => (a ? getChordKey(a) === getChordKey(b) : false)
