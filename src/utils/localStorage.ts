import type { Favorite } from '../types'

const FAVORITES_KEY = 'harp-diem-favorites'

/**
 * Get all favorites from localStorage
 */
export const getFavorites = (): Favorite[] => {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY)
    if (!stored) return []
    return JSON.parse(stored) as Favorite[]
  } catch (error) {
    console.error('Error loading favorites:', error)
    return []
  }
}

/**
 * Generate a unique ID (fallback for environments without crypto.randomUUID)
 */
const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback: timestamp + random number
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

/**
 * Save a new favorite to localStorage
 */
export const saveFavorite = (favorite: Omit<Favorite, 'id' | 'createdAt'>): Favorite => {
  const favorites = getFavorites()
  const newFavorite: Favorite = {
    ...favorite,
    id: generateId(),
    createdAt: Date.now(),
  }
  favorites.push(newFavorite)
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  return newFavorite
}

/**
 * Delete a favorite from localStorage
 */
export const deleteFavorite = (id: string): void => {
  const favorites = getFavorites()
  const filtered = favorites.filter((f) => f.id !== id)
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered))
}

/**
 * Clear all favorites from localStorage
 */
export const clearFavorites = (): void => {
  localStorage.removeItem(FAVORITES_KEY)
}
