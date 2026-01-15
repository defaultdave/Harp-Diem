/**
 * Tab notation utilities for harmonica tablature display.
 *
 * Standard harmonica tab format:
 * - Blow notes: +1 through +10
 * - Draw notes: -1 through -10
 * - Draw bends: -4' (half step), -4'' (whole step), -4''' (minor third)
 * - Blow bends: +8' (half step), +8'' (whole step)
 * - Overblows: OB1 through OB6
 * - Overdraws: OD7 through OD10
 */

export type NoteType =
  | 'blow'
  | 'draw'
  | 'blowHalfBend'
  | 'blowWholeBend'
  | 'drawHalfBend'
  | 'drawWholeBend'
  | 'drawMinorThirdBend'
  | 'overblow'
  | 'overdraw'

/**
 * Converts a hole number and note type to standard harmonica tab notation.
 *
 * @param holeNumber - The harmonica hole number (1-10)
 * @param noteType - The type of note being played
 * @returns The tab notation string (e.g., "+4", "-4", "-4'", "OB6")
 */
export function getTabNotation(holeNumber: number, noteType: NoteType): string {
  switch (noteType) {
    case 'blow':
      return `+${holeNumber}`
    case 'draw':
      return `-${holeNumber}`
    case 'blowHalfBend':
      return `+${holeNumber}'`
    case 'blowWholeBend':
      return `+${holeNumber}''`
    case 'drawHalfBend':
      return `-${holeNumber}'`
    case 'drawWholeBend':
      return `-${holeNumber}''`
    case 'drawMinorThirdBend':
      return `-${holeNumber}'''`
    case 'overblow':
      return `OB${holeNumber}`
    case 'overdraw':
      return `OD${holeNumber}`
    default:
      return `${holeNumber}`
  }
}

/**
 * Maps the label used in HoleColumn to a NoteType for tab conversion.
 *
 * @param label - The display label from HoleColumn (e.g., "Blow", "Draw", "↑1", "↓2")
 * @returns The corresponding NoteType
 */
export function labelToNoteType(label: string): NoteType {
  switch (label) {
    case 'Blow':
      return 'blow'
    case 'Draw':
      return 'draw'
    case '↑1':
      return 'blowHalfBend'
    case '↑2':
      return 'blowWholeBend'
    case '↓1':
      return 'drawHalfBend'
    case '↓2':
      return 'drawWholeBend'
    case '↓3':
      return 'drawMinorThirdBend'
    case 'OB':
      return 'overblow'
    case 'OD':
      return 'overdraw'
    default:
      return 'blow'
  }
}
