import type { City } from '../types/city'
import type { GeoDbCitiesResponse, GeoDbCityRaw } from '../types/geoDb'
import { ApiError } from '../types/apiError'
import { fetchJson } from './httpClient'

const GEODB_HOST = 'wft-geo-db.p.rapidapi.com'
const GEODB_CITIES_URL = `https://${GEODB_HOST}/v1/geo/cities`

/**
 * Searches cities by name prefix.
 * Free-tier GeoDB keys are limited to 1 request/second — a 429 here is
 * surfaced as a clear `rate_limit` ApiError; callers (e.g. a search input
 * hook) are responsible for debouncing keystrokes so they don't exceed it.
 */
export async function searchCities(query: string, signal?: AbortSignal): Promise<City[]> {
  const trimmed = query.trim()
  if (trimmed.length === 0) {
    return []
  }

  const apiKey = import.meta.env.VITE_GEODB_API_KEY
  if (!apiKey) {
    throw new ApiError('auth', 'search for cities')
  }

  const url = `${GEODB_CITIES_URL}?namePrefix=${encodeURIComponent(trimmed)}&limit=10&sort=-population`

  const response = await fetchJson<GeoDbCitiesResponse>(url, {
    signal,
    context: 'search for cities',
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': GEODB_HOST,
    },
  })

  return response.data.map(toCity)
}

function toCity(raw: GeoDbCityRaw): City {
  return {
    id: raw.id,
    name: raw.name,
    region: raw.region,
    country: raw.country,
    countryCode: raw.countryCode,
    lat: raw.latitude,
    lon: raw.longitude,
  }
}
