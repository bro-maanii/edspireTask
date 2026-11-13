import { useCallback, useEffect, useState } from 'react'
import { isAbortError } from '../services/httpClient'
import { readWeatherSnapshot, saveWeatherSnapshot } from '../services/weatherCache'
import { getWeather } from '../services/weatherService'
import { ApiError } from '../types/apiError'
import type { City } from '../types/city'
import type { WeatherData } from '../types/weather'
import { useOnlineStatus } from './useOnlineStatus'

export type WeatherStatus = 'empty' | 'loading' | 'success' | 'error'

export interface UseWeatherResult {
  data: WeatherData | null
  status: WeatherStatus
  error: ApiError | null
  refetch: () => void
  /** True when `data` came from the last-saved offline snapshot, not a live fetch. */
  isOfflineSnapshot: boolean
  snapshotSavedAt: string | null
}

interface Outcome {
  cityId: number
  retryToken: number
  data: WeatherData
  snapshotSavedAt: string | null
}

interface Failure {
  cityId: number
  retryToken: number
  error: ApiError
}

export function useWeather(city: City | null): UseWeatherResult {
  const isOnline = useOnlineStatus()
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [failure, setFailure] = useState<Failure | null>(null)
  const [retryToken, setRetryToken] = useState(0)

  const refetch = useCallback(() => setRetryToken((token) => token + 1), [])

  useEffect(() => {
    if (!city) {
      return
    }

    const controller = new AbortController()

    // Offline uses the same promise-based shape as the live fetch (rather than
    // branching into a synchronous setState) so every outcome is still only
    // ever written to state from inside a .then()/.catch() callback.
    const resultPromise: Promise<{ data: WeatherData; snapshotSavedAt: string | null }> = isOnline
      ? getWeather(city.lat, city.lon, controller.signal).then((data) => {
          saveWeatherSnapshot(city, data)
          return { data, snapshotSavedAt: null }
        })
      : Promise.resolve().then(() => {
          const snapshot = readWeatherSnapshot(city.id)
          if (!snapshot) {
            throw new ApiError('network', 'load the weather', { cause: 'offline with no saved snapshot' })
          }
          return { data: snapshot.data, snapshotSavedAt: snapshot.savedAt }
        })

    resultPromise
      .then(({ data, snapshotSavedAt }) => {
        setOutcome({ cityId: city.id, retryToken, data, snapshotSavedAt })
        setFailure(null)
      })
      .catch((caughtError: unknown) => {
        if (isAbortError(caughtError)) return
        const apiError =
          caughtError instanceof ApiError
            ? caughtError
            : new ApiError('unknown', 'load the weather', { cause: caughtError })
        setFailure({ cityId: city.id, retryToken, error: apiError })
        setOutcome(null)
      })

    return () => {
      controller.abort()
    }
  }, [city, retryToken, isOnline])

  if (!city) {
    return { data: null, status: 'empty', error: null, refetch, isOfflineSnapshot: false, snapshotSavedAt: null }
  }

  const isCurrent = (record: { cityId: number; retryToken: number }) =>
    record.cityId === city.id && record.retryToken === retryToken

  if (failure && isCurrent(failure)) {
    return {
      data: null,
      status: 'error',
      error: failure.error,
      refetch,
      isOfflineSnapshot: false,
      snapshotSavedAt: null,
    }
  }

  if (outcome && isCurrent(outcome)) {
    return {
      data: outcome.data,
      status: 'success',
      error: null,
      refetch,
      isOfflineSnapshot: outcome.snapshotSavedAt !== null,
      snapshotSavedAt: outcome.snapshotSavedAt,
    }
  }

  return { data: null, status: 'loading', error: null, refetch, isOfflineSnapshot: false, snapshotSavedAt: null }
}
