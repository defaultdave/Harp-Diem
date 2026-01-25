/**
 * CSS class name composition utility.
 * @packageDocumentation
 */

/** Combines CSS class names, filtering out falsy values. */
export const cn = (...classes: (string | false | null | undefined)[]): string =>
  classes.filter(Boolean).join(' ')
