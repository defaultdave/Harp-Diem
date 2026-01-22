/**
 * String formatting utilities
 */

/**
 * Capitalizes the first character of a string
 */
export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1)

/**
 * Capitalizes the first character of each word in a string
 * @param str - The string to capitalize
 * @param separator - The word separator (default: '-')
 */
export const capitalizeWords = (str: string, separator = '-'): string =>
  str.split(separator).map(capitalize).join(' ')

/**
 * Returns the ordinal suffix for a number (st, nd, rd, th)
 */
export const getOrdinalSuffix = (n: number): string => {
  const suffixes = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]
}
