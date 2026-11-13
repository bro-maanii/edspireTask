import type { City } from '../types/city'
import type { WeatherData } from '../types/weather'

const CACHE_KEY = 'weatherboard.lastWeather'

export interface WeatherSnapshot {
  city: City
  data: WeatherData
  savedAt: string
}

/**
 * Backup of the last successfully fetched weather, read when the network is
 * unavailable and the service worker's own runtime cache misses.
 */
export function saveWeatherSnapshot(city: City, data: WeatherData): void {
  try {
    const snapshot: WeatherSnapshot = { city, data, savedAt: new Date().toISOString() }
    localStorage.setItem(CACHE_KEY, JSON.stringify(snapshot))
  } catch {
    // Best-effort only; offline fallback just won't be available this session.
  }
}

export function readWeatherSnapshot(cityId: number): WeatherSnapshot | null {
  try {
    const stored = localStorage.getItem(CACHE_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored) as WeatherSnapshot
    return parsed.city.id === cityId ? parsed : null
  } catch {
    return null
  }
}
