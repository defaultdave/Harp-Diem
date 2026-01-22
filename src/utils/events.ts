/**
 * Event handler utilities
 */
import type { KeyboardEvent } from 'react'

/**
 * Creates a keyboard handler that calls the callback when Enter or Space is pressed
 */
export const handleActivationKey =
  (callback: () => void, keys = ['Enter', ' ']) =>
  (e: KeyboardEvent): void => {
    if (keys.includes(e.key)) {
      e.preventDefault()
      callback()
    }
  }
