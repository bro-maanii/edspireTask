import { useCallback, useEffect, useState } from 'react'
import { searchCities } from '../services/geoDbService'
import { isAbortError } from '../services/httpClient'
import { ApiError } from '../types/apiError'
import type { City } from '../types/city'
import { useDebouncedValue } from './useDebouncedValue'

export const MIN_QUERY_LENGTH = 2
const DEBOUNCE_MS = 300

export type CitySearchStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error'

export interface UseCitySearchResult {
  cities: City[]
  status: CitySearchStatus
  error: ApiError | null
  retry: () => void
}

interface SearchOutcome {
  query: string
  retryToken: number
  cities: City[]
}

interface SearchFailure {
  query: string
  retryToken: number
  error: ApiError
}

export function useCitySearch(query: string): UseCitySearchResult {
  const debouncedQuery = useDebouncedValue(query, DEBOUNCE_MS)
  const [outcome, setOutcome] = useState<SearchOutcome | null>(null)
  const [failure, setFailure] = useState<SearchFailure | null>(null)
  const [retryToken, setRetryToken] = useState(0)

  const retry = useCallback(() => setRetryToken((token) => token + 1), [])

  const trimmedQuery = query.trim()
  const trimmedDebouncedQuery = debouncedQuery.trim()
  const isTooShort = trimmedQuery.length < MIN_QUERY_LENGTH

  useEffect(() => {
    if (trimmedDebouncedQuery.length < MIN_QUERY_LENGTH) {
      return
    }

    const controller = new AbortController()

    searchCities(trimmedDebouncedQuery, controller.signal)
      .then((results) => {
        setOutcome({ query: trimmedDebouncedQuery, retryToken, cities: results })
        setFailure(null)
      })
      .catch((caughtError: unknown) => {
        if (isAbortError(caughtError)) return
        const apiError =
          caughtError instanceof ApiError
            ? caughtError
            : new ApiError('unknown', 'search for cities', { cause: caughtError })
        setFailure({ query: trimmedDebouncedQuery, retryToken, error: apiError })
        setOutcome(null)
      })

    return () => {
      controller.abort()
    }
  }, [trimmedDebouncedQuery, retryToken])

  if (isTooShort) {
    return { cities: [], status: 'idle', error: null, retry }
  }

  const isCurrent = (record: { query: string; retryToken: number }) =>
    record.query === trimmedDebouncedQuery && record.retryToken === retryToken

  if (failure && isCurrent(failure)) {
    return { cities: [], status: 'error', error: failure.error, retry }
  }

  if (outcome && isCurrent(outcome)) {
    return {
      cities: outcome.cities,
      status: outcome.cities.length === 0 ? 'empty' : 'success',
      error: null,
      retry,
    }
  }

  return { cities: [], status: 'loading', error: null, retry }
}
