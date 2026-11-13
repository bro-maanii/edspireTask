import { useCallback, useState } from 'react'
import type { City } from '../types/city'

const STORAGE_KEY = 'weatherboard.favourites'
export const MAX_FAVOURITES = 5

export type AddFavouriteReason = 'duplicate' | 'limit'

export interface AddFavouriteResult {
  ok: boolean
  reason?: AddFavouriteReason
}

export interface UseFavouritesResult {
  favourites: City[]
  isFull: boolean
  isStoragePersisted: boolean
  isFavourite: (cityId: number) => boolean
  addFavourite: (city: City) => AddFavouriteResult
  removeFavourite: (cityId: number) => void
}

function readStoredFavourites(): City[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? (JSON.parse(stored) as City[]) : []
}

export function useFavourites(): UseFavouritesResult {
  const [favourites, setFavourites] = useState<City[]>(() => {
    try {
      return readStoredFavourites()
    } catch {
      return []
    }
  })
  const [isStoragePersisted, setIsStoragePersisted] = useState<boolean>(() => {
    try {
      readStoredFavourites()
      return true
    } catch {
      return false
    }
  })

  const persist = useCallback((next: City[]) => {
    setFavourites(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      setIsStoragePersisted(false)
    }
  }, [])

  const isFavourite = useCallback(
    (cityId: number) => favourites.some((city) => city.id === cityId),
    [favourites],
  )

  const addFavourite = useCallback(
    (city: City): AddFavouriteResult => {
      if (favourites.some((existing) => existing.id === city.id)) {
        return { ok: false, reason: 'duplicate' }
      }
      if (favourites.length >= MAX_FAVOURITES) {
        return { ok: false, reason: 'limit' }
      }
      persist([...favourites, city])
      return { ok: true }
    },
    [favourites, persist],
  )

  const removeFavourite = useCallback(
    (cityId: number) => {
      persist(favourites.filter((city) => city.id !== cityId))
    },
    [favourites, persist],
  )

  return {
    favourites,
    isFull: favourites.length >= MAX_FAVOURITES,
    isStoragePersisted,
    isFavourite,
    addFavourite,
    removeFavourite,
  }
}
