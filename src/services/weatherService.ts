import type { ConditionId, CurrentWeather, DailyForecast, WeatherData } from '../types/weather'
import { CONDITION_LABELS } from '../types/weather'
import type { OwmCurrentResponse, OwmForecastListItem, OwmForecastResponse } from '../types/owm'
import type { OpenMeteoDaily, OpenMeteoResponse } from '../types/openMeteo'
import { ApiError } from '../types/apiError'
import { fetchJson, isAbortError } from './httpClient'
import { msToKph } from '../utils/units'

const OWM_BASE_URL = 'https://api.openweathermap.org/data/2.5'
const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast'
const FORECAST_DAYS = 5

/**
 * Gets current weather + a 5-day forecast for a coordinate.
 * Tries OpenWeatherMap first; if it fails with a rate limit, an auth
 * error, or a network error, automatically retries with Open-Meteo
 * (no key required). Both paths return the same normalized `WeatherData`
 * shape, so callers never need to know which source answered.
 */
export async function getWeather(lat: number, lon: number, signal?: AbortSignal): Promise<WeatherData> {
  try {
    return await getOwmWeather(lat, lon, signal)
  } catch (error) {
    if (isAbortError(error)) throw error
    if (error instanceof ApiError && shouldFallBackToOpenMeteo(error)) {
      return await getOpenMeteoWeather(lat, lon, signal)
    }
    throw error
  }
}

function shouldFallBackToOpenMeteo(error: ApiError): boolean {
  return error.kind === 'rate_limit' || error.kind === 'auth' || error.kind === 'network'
}

// ---------------------------------------------------------------------------
// OpenWeatherMap
// ---------------------------------------------------------------------------

async function getOwmWeather(lat: number, lon: number, signal?: AbortSignal): Promise<WeatherData> {
  const apiKey = import.meta.env.VITE_OWM_API_KEY
  if (!apiKey) {
    throw new ApiError('auth', 'load weather from OpenWeatherMap')
  }

  const params = `lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`

  const [current, forecast] = await Promise.all([
    fetchJson<OwmCurrentResponse>(`${OWM_BASE_URL}/weather?${params}`, {
      signal,
      context: 'load current weather from OpenWeatherMap',
    }),
    fetchJson<OwmForecastResponse>(`${OWM_BASE_URL}/forecast?${params}`, {
      signal,
      context: 'load the forecast from OpenWeatherMap',
    }),
  ])

  return {
    source: 'openweathermap',
    lat,
    lon,
    current: normalizeOwmCurrent(current),
    daily: groupOwmForecastByDay(forecast.list),
  }
}

function normalizeOwmCurrent(raw: OwmCurrentResponse): CurrentWeather {
  const weather = raw.weather[0]
  const condition = mapOwmConditionId(weather?.id ?? -1)

  return {
    tempC: raw.main.temp,
    feelsLikeC: raw.main.feels_like,
    humidity: raw.main.humidity,
    windSpeedKph: msToKph(raw.wind.speed),
    windDirectionDeg: raw.wind.deg,
    condition,
    conditionLabel: weather?.description ?? CONDITION_LABELS[condition],
    isDaytime: weather?.icon.endsWith('d') ?? true,
    observedAt: new Date(raw.dt * 1000).toISOString(),
  }
}

/** OWM's /forecast is 3-hour steps; group into days and summarize each. */
function groupOwmForecastByDay(list: OwmForecastListItem[]): DailyForecast[] {
  const byDate = new Map<string, OwmForecastListItem[]>()

  for (const item of list) {
    const date = item.dt_txt.slice(0, 10)
    const existing = byDate.get(date)
    if (existing) {
      existing.push(item)
    } else {
      byDate.set(date, [item])
    }
  }

  return [...byDate.entries()].slice(0, FORECAST_DAYS).map(([date, entries]) => {
    const midday = closestToHour(entries, 12)
    const weather = midday.weather[0]
    const condition = mapOwmConditionId(weather?.id ?? -1)

    return {
      date,
      minTempC: Math.min(...entries.map((entry) => entry.main.temp_min)),
      maxTempC: Math.max(...entries.map((entry) => entry.main.temp_max)),
      condition,
      conditionLabel: weather?.description ?? CONDITION_LABELS[condition],
      isDaytime: weather?.icon.endsWith('d') ?? true,
    }
  })
}

function closestToHour(entries: OwmForecastListItem[], targetHour: number): OwmForecastListItem {
  return entries.reduce((closest, entry) => {
    const entryHour = Number(entry.dt_txt.slice(11, 13))
    const closestHour = Number(closest.dt_txt.slice(11, 13))
    return Math.abs(entryHour - targetHour) < Math.abs(closestHour - targetHour) ? entry : closest
  })
}

function mapOwmConditionId(id: number): ConditionId {
  if (id === 800) return 'clear'
  if (id === 801) return 'mostly-clear'
  if (id === 802) return 'partly-cloudy'
  if (id === 803 || id === 804) return 'cloudy'
  if (id >= 200 && id < 300) return 'thunderstorm'
  if (id >= 300 && id < 400) return 'drizzle'
  if (id === 511 || (id >= 611 && id <= 616)) return 'freezing-rain'
  if (id >= 520 && id < 600) return 'rain-showers'
  if (id >= 500 && id < 600) return 'rain'
  if (id >= 620 && id < 700) return 'snow-showers'
  if (id >= 600 && id < 700) return 'snow'
  if (id >= 701 && id <= 762) return 'fog'
  return 'unknown'
}

// ---------------------------------------------------------------------------
// Open-Meteo (fallback, no API key required)
// ---------------------------------------------------------------------------

async function getOpenMeteoWeather(lat: number, lon: number, signal?: AbortSignal): Promise<WeatherData> {
  const url =
    `${OPEN_METEO_URL}?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,is_day` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code` +
    `&timezone=auto&forecast_days=${FORECAST_DAYS}`

  const data = await fetchJson<OpenMeteoResponse>(url, {
    signal,
    context: 'load weather from Open-Meteo',
  })

  return {
    source: 'open-meteo',
    lat,
    lon,
    current: normalizeOpenMeteoCurrent(data),
    daily: buildOpenMeteoDaily(data.daily),
  }
}

function normalizeOpenMeteoCurrent(data: OpenMeteoResponse): CurrentWeather {
  const condition = mapWmoCode(data.current.weather_code)

  return {
    tempC: data.current.temperature_2m,
    feelsLikeC: data.current.apparent_temperature,
    humidity: data.current.relative_humidity_2m,
    windSpeedKph: data.current.wind_speed_10m,
    windDirectionDeg: data.current.wind_direction_10m,
    condition,
    conditionLabel: CONDITION_LABELS[condition],
    isDaytime: data.current.is_day === 1,
    observedAt: data.current.time,
  }
}

function buildOpenMeteoDaily(daily: OpenMeteoDaily): DailyForecast[] {
  return daily.time.slice(0, FORECAST_DAYS).map((date, index) => {
    const condition = mapWmoCode(daily.weather_code[index] ?? -1)

    return {
      date,
      minTempC: daily.temperature_2m_min[index] ?? 0,
      maxTempC: daily.temperature_2m_max[index] ?? 0,
      condition,
      conditionLabel: CONDITION_LABELS[condition],
      isDaytime: true,
    }
  })
}

/** Maps WMO weather codes (used by Open-Meteo) onto our shared condition vocabulary. */
function mapWmoCode(code: number): ConditionId {
  if (code === 0) return 'clear'
  if (code === 1) return 'mostly-clear'
  if (code === 2) return 'partly-cloudy'
  if (code === 3) return 'cloudy'
  if (code === 45 || code === 48) return 'fog'
  if (code === 51 || code === 53 || code === 55) return 'drizzle'
  if (code === 56 || code === 57 || code === 66 || code === 67) return 'freezing-rain'
  if (code === 61 || code === 63 || code === 65) return 'rain'
  if (code === 71 || code === 73 || code === 75 || code === 77) return 'snow'
  if (code === 80 || code === 81 || code === 82) return 'rain-showers'
  if (code === 85 || code === 86) return 'snow-showers'
  if (code === 95 || code === 96 || code === 99) return 'thunderstorm'
  return 'unknown'
}
