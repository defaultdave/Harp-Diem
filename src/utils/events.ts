/**
 * Event handler utilities for accessibility and keyboard navigation.
 * @packageDocumentation
 */
import type { KeyboardEvent } from 'react'

/** Creates a keyboard event handler that triggers callback on Enter or Space. */
export const handleActivationKey =
  (callback: () => void, keys = ['Enter', ' ']) =>
  (e: KeyboardEvent): void => {
    if (keys.includes(e.key)) {
      e.preventDefault()
      callback()
    }
  }
