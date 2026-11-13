import { useCallback, useEffect, useState } from 'react'
import type { UseFavouritesResult } from '../hooks/useFavourites'
import type { City } from '../types/city'
import { ConfirmDialog } from './ConfirmDialog'
import './FavouriteButton.css'

interface FavouriteButtonProps {
  city: City
  favourites: UseFavouritesResult
}

const LIMIT_MESSAGE = 'You can save up to 5 cities. Remove one to add another.'
const LIMIT_MESSAGE_DURATION_MS = 4000

export function FavouriteButton({ city, favourites }: FavouriteButtonProps) {
  const { isFavourite, addFavourite, removeFavourite, isFull } = favourites
  const [showLimitMessage, setShowLimitMessage] = useState(false)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)

  const isFav = isFavourite(city.id)
  const addBlocked = isFull && !isFav

  useEffect(() => {
    if (!showLimitMessage) return
    const timeoutId = setTimeout(() => setShowLimitMessage(false), LIMIT_MESSAGE_DURATION_MS)
    return () => clearTimeout(timeoutId)
  }, [showLimitMessage])

  function handleClick() {
    if (isFav) {
      setShowRemoveConfirm(true)
      return
    }

    const result = addFavourite(city)
    if (!result.ok && result.reason === 'limit') {
      setShowLimitMessage(true)
    }
  }

  const handleConfirmRemove = useCallback(() => {
    removeFavourite(city.id)
    setShowRemoveConfirm(false)
  }, [city.id, removeFavourite])

  const handleCancelRemove = useCallback(() => {
    setShowRemoveConfirm(false)
  }, [])

  return (
    <div className="favouriteButton">
      <button
        type="button"
        className={isFav ? 'favouriteButton__toggle favouriteButton__toggle--active' : 'favouriteButton__toggle'}
        onClick={handleClick}
        aria-pressed={isFav}
        aria-disabled={addBlocked || undefined}
        title={addBlocked ? LIMIT_MESSAGE : undefined}
        aria-label={isFav ? `Remove ${city.name} from favourites` : `Add ${city.name} to favourites`}
      >
        <span aria-hidden="true">{isFav ? '♥' : '♡'}</span>
      </button>

      {showLimitMessage && (
        <p className="favouriteButton__limitMessage" role="status">
          {LIMIT_MESSAGE}
        </p>
      )}

      <ConfirmDialog
        open={showRemoveConfirm}
        title="Remove favourite?"
        message={`Remove ${city.name} from your favourites?`}
        confirmLabel="Remove"
        cancelLabel="Cancel"
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
      />
    </div>
  )
}
