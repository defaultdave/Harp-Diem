/**
 * @packageDocumentation
 * CSS class name composition utility.
 *
 * @category Utils
 */

/**
 * Combines CSS class names, filtering out falsy values.
 *
 * @remarks
 * A lightweight alternative to classnames/clsx libraries.
 * Accepts strings and falsy values, returning a space-separated string
 * of all truthy class names.
 *
 * @param classes - Class names or falsy values to combine
 * @returns Space-separated string of truthy class names
 *
 * @example
 * ```typescript
 * cn('base', 'active')           // "base active"
 * cn('base', false && 'hidden')  // "base"
 * cn('btn', isLarge && 'btn-lg') // "btn" or "btn btn-lg"
 * cn('a', null, undefined, 'b')  // "a b"
 * ```
 */
export const cn = (...classes: (string | false | null | undefined)[]): string =>
  classes.filter(Boolean).join(' ')
