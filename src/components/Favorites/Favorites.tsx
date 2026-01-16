import { useState } from 'react'
import type { HarmonicaKey, ScaleType, TuningType } from '../../data/harmonicas'
import type { Favorite } from '../../types'
import { getFavorites, saveFavorite, deleteFavorite } from '../../utils/localStorage'
import styles from './Favorites.module.css'

interface FavoritesProps {
  currentHarmonicaKey: HarmonicaKey
  currentTuning: TuningType
  currentSongKey: HarmonicaKey
  currentScaleType: ScaleType
  onLoadFavorite: (favorite: Favorite) => void
}

export function Favorites({
  currentHarmonicaKey,
  currentTuning,
  currentSongKey,
  currentScaleType,
  onLoadFavorite,
}: FavoritesProps) {
  const [favorites, setFavorites] = useState<Favorite[]>(getFavorites())
  const [isExpanded, setIsExpanded] = useState(false)
  const [favoriteName, setFavoriteName] = useState('')
  const [showSaveForm, setShowSaveForm] = useState(false)

  const handleSave = () => {
    if (!favoriteName.trim()) return

    saveFavorite({
      name: favoriteName.trim(),
      harmonicaKey: currentHarmonicaKey,
      tuning: currentTuning,
      songKey: currentSongKey,
      scaleType: currentScaleType,
    })

    setFavorites(getFavorites())
    setFavoriteName('')
    setShowSaveForm(false)
  }

  const handleDelete = (id: string) => {
    deleteFavorite(id)
    setFavorites(getFavorites())
  }

  const handleLoad = (favorite: Favorite) => {
    onLoadFavorite(favorite)
  }

  return (
    <div className={styles.favorites}>
      <div className={styles.header}>
        <button
          className={styles.toggleButton}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
        >
          ⭐ Favorites ({favorites.length})
          <span className={styles.arrow}>{isExpanded ? '▼' : '▶'}</span>
        </button>
      </div>

      {isExpanded && (
        <div className={styles.content}>
          <div className={styles.actions}>
            {!showSaveForm ? (
              <button className={styles.saveButton} onClick={() => setShowSaveForm(true)}>
                + Save Current
              </button>
            ) : (
              <div className={styles.saveForm}>
                <input
                  type="text"
                  value={favoriteName}
                  onChange={(e) => setFavoriteName(e.target.value)}
                  placeholder="Enter favorite name..."
                  className={styles.nameInput}
                  maxLength={50}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave()
                    if (e.key === 'Escape') {
                      setShowSaveForm(false)
                      setFavoriteName('')
                    }
                  }}
                  autoFocus
                />
                <button
                  className={styles.confirmButton}
                  onClick={handleSave}
                  disabled={!favoriteName.trim()}
                >
                  Save
                </button>
                <button
                  className={styles.cancelButton}
                  onClick={() => {
                    setShowSaveForm(false)
                    setFavoriteName('')
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {favorites.length === 0 ? (
            <p className={styles.emptyMessage}>No favorites saved yet. Save your first combination above!</p>
          ) : (
            <ul className={styles.list}>
              {favorites.map((favorite) => (
                <li key={favorite.id} className={styles.item}>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{favorite.name}</span>
                    <span className={styles.itemDetails}>
                      {favorite.harmonicaKey} harmonica • {favorite.tuning} • {favorite.songKey} {favorite.scaleType}
                    </span>
                  </div>
                  <div className={styles.itemActions}>
                    <button
                      className={styles.loadButton}
                      onClick={() => handleLoad(favorite)}
                      title="Load this favorite"
                    >
                      Load
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDelete(favorite.id)}
                      title="Delete this favorite"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
