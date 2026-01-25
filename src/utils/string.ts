/**
 * @packageDocumentation
 * String formatting utilities for display text.
 *
 * @category Utils
 */

/**
 * Capitalizes the first character of a string.
 *
 * @param str - The string to capitalize
 * @returns String with first character uppercased
 *
 * @example
 * ```typescript
 * capitalize('hello')  // "Hello"
 * capitalize('HELLO')  // "HELLO"
 * capitalize('')       // ""
 * ```
 */
export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1)

/**
 * Capitalizes the first character of each word in a string.
 *
 * @param str - The string to capitalize
 * @param separator - The word separator (default: '-')
 * @returns String with each word capitalized, separated by spaces
 *
 * @example
 * ```typescript
 * capitalizeWords('paddy-richter')     // "Paddy Richter"
 * capitalizeWords('natural-minor')     // "Natural Minor"
 * capitalizeWords('foo_bar_baz', '_')  // "Foo Bar Baz"
 * ```
 */
export const capitalizeWords = (str: string, separator = '-'): string =>
  str.split(separator).map(capitalize).join(' ')

/**
 * Returns the ordinal suffix for a number.
 *
 * @param n - The number to get the suffix for
 * @returns The ordinal suffix (st, nd, rd, or th)
 *
 * @example
 * ```typescript
 * getOrdinalSuffix(1)   // "st"
 * getOrdinalSuffix(2)   // "nd"
 * getOrdinalSuffix(3)   // "rd"
 * getOrdinalSuffix(4)   // "th"
 * getOrdinalSuffix(11)  // "th"
 * getOrdinalSuffix(21)  // "st"
 * ```
 */
export const getOrdinalSuffix = (n: number): string => {
  const suffixes = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]
}
