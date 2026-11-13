import { useCallback, useEffect, useState } from 'react'
import { isAbortError } from '../services/httpClient'
import { getWeather } from '../services/weatherService'
import { ApiError } from '../types/apiError'
import type { City } from '../types/city'
import type { WeatherData } from '../types/weather'

export type WeatherStatus = 'empty' | 'loading' | 'success' | 'error'

export interface UseWeatherResult {
  data: WeatherData | null
  status: WeatherStatus
  error: ApiError | null
  refetch: () => void
}

interface Outcome {
  cityId: number
  retryToken: number
  data: WeatherData
}

interface Failure {
  cityId: number
  retryToken: number
  error: ApiError
}

export function useWeather(city: City | null): UseWeatherResult {
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [failure, setFailure] = useState<Failure | null>(null)
  const [retryToken, setRetryToken] = useState(0)

  const refetch = useCallback(() => setRetryToken((token) => token + 1), [])

  useEffect(() => {
    if (!city) {
      return
    }

    const controller = new AbortController()

    getWeather(city.lat, city.lon, controller.signal)
      .then((data) => {
        setOutcome({ cityId: city.id, retryToken, data })
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
  }, [city, retryToken])

  if (!city) {
    return { data: null, status: 'empty', error: null, refetch }
  }

  const isCurrent = (record: { cityId: number; retryToken: number }) =>
    record.cityId === city.id && record.retryToken === retryToken

  if (failure && isCurrent(failure)) {
    return { data: null, status: 'error', error: failure.error, refetch }
  }

  if (outcome && isCurrent(outcome)) {
    return { data: outcome.data, status: 'success', error: null, refetch }
  }

  return { data: null, status: 'loading', error: null, refetch }
}
