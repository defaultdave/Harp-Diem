import { describe, it, expect, beforeEach } from 'vitest'
import { getFavorites, saveFavorite, deleteFavorite, clearFavorites } from './localStorage'

describe('localStorage utilities', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    clearFavorites()
  })

  describe('getFavorites', () => {
    it('returns empty array when no favorites exist', () => {
      const favorites = getFavorites()
      expect(favorites).toEqual([])
    })

    it('returns saved favorites', () => {
      saveFavorite({
        name: 'Test Favorite',
        harmonicaKey: 'C',
        tuning: 'richter',
        songKey: 'G',
        scaleType: 'major',
      })

      const favorites = getFavorites()
      expect(favorites).toHaveLength(1)
      expect(favorites[0]).toMatchObject({
        name: 'Test Favorite',
        harmonicaKey: 'C',
        tuning: 'richter',
        songKey: 'G',
        scaleType: 'major',
      })
    })
  })

  describe('saveFavorite', () => {
    it('creates a new favorite with id and timestamp', () => {
      const favorite = saveFavorite({
        name: 'My Favorite',
        harmonicaKey: 'A',
        tuning: 'richter',
        songKey: 'D',
        scaleType: 'blues',
      })

      expect(favorite).toHaveProperty('id')
      expect(favorite).toHaveProperty('createdAt')
      expect(typeof favorite.id).toBe('string')
      expect(typeof favorite.createdAt).toBe('number')
      expect(favorite.name).toBe('My Favorite')
    })

    it('saves multiple favorites', () => {
      saveFavorite({ name: 'First', harmonicaKey: 'C', tuning: 'richter', songKey: 'C', scaleType: 'major' })
      saveFavorite({ name: 'Second', harmonicaKey: 'G', tuning: 'richter', songKey: 'D', scaleType: 'minor' })

      const favorites = getFavorites()
      expect(favorites).toHaveLength(2)
    })
  })

  describe('deleteFavorite', () => {
    it('removes a favorite by id', () => {
      const favorite1 = saveFavorite({
        name: 'Keep',
        harmonicaKey: 'C',
        tuning: 'richter',
        songKey: 'C',
        scaleType: 'major',
      })
      const favorite2 = saveFavorite({
        name: 'Delete',
        harmonicaKey: 'G',
        tuning: 'richter',
        songKey: 'D',
        scaleType: 'minor',
      })

      deleteFavorite(favorite2.id)

      const favorites = getFavorites()
      expect(favorites).toHaveLength(1)
      expect(favorites[0].id).toBe(favorite1.id)
    })

    it('does nothing when id does not exist', () => {
      saveFavorite({ name: 'Test', harmonicaKey: 'C', tuning: 'richter', songKey: 'C', scaleType: 'major' })
      
      deleteFavorite('non-existent-id')

      const favorites = getFavorites()
      expect(favorites).toHaveLength(1)
    })
  })

  describe('clearFavorites', () => {
    it('removes all favorites', () => {
      saveFavorite({ name: 'First', harmonicaKey: 'C', tuning: 'richter', songKey: 'C', scaleType: 'major' })
      saveFavorite({ name: 'Second', harmonicaKey: 'G', tuning: 'richter', songKey: 'D', scaleType: 'minor' })

      clearFavorites()

      const favorites = getFavorites()
      expect(favorites).toEqual([])
    })
  })
})
