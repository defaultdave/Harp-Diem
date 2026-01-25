/**
 * @packageDocumentation
 * Event handler utilities for accessibility and keyboard navigation.
 *
 * @category Utils
 */
import type { KeyboardEvent } from 'react'

/**
 * Creates a keyboard event handler for activation keys.
 *
 * @remarks
 * Used to make clickable elements keyboard-accessible. The handler calls
 * the callback when Enter or Space is pressed (or custom keys if specified).
 * Prevents default behavior to avoid scrolling on Space.
 *
 * @param callback - Function to call when an activation key is pressed
 * @param keys - Array of key values to respond to (default: Enter and Space)
 * @returns Keyboard event handler function
 *
 * @example
 * ```tsx
 * function ClickableNote({ onPlay }: Props) {
 *   return (
 *     <div
 *       role="button"
 *       tabIndex={0}
 *       onClick={onPlay}
 *       onKeyDown={handleActivationKey(onPlay)}
 *     >
 *       C4
 *     </div>
 *   )
 * }
 * ```
 */
export const handleActivationKey =
  (callback: () => void, keys = ['Enter', ' ']) =>
  (e: KeyboardEvent): void => {
    if (keys.includes(e.key)) {
      e.preventDefault()
      callback()
    }
  }
