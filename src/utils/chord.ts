/**
 * Chord comparison and identification utilities
 */

interface ChordIdentity {
  holes: number[]
  breath: 'blow' | 'draw'
}

/**
 * Generates a unique string key for a chord based on its holes and breath direction
 */
export const getChordKey = (chord: ChordIdentity): string =>
  `${chord.holes.join(',')}-${chord.breath}`

/**
 * Compares two chords to check if they represent the same voicing
 */
export const areChordsSame = (
  a: ChordIdentity | null | undefined,
  b: ChordIdentity
): boolean => (a ? getChordKey(a) === getChordKey(b) : false)
