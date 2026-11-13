/**
 * Normalized condition vocabulary shared by every weather provider.
 * Each provider's own codes are mapped onto this set in its service module.
 */
export type ConditionId =
  | 'clear'
  | 'mostly-clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'rain-showers'
  | 'freezing-rain'
  | 'snow'
  | 'snow-showers'
  | 'thunderstorm'
  | 'unknown'

export const CONDITION_LABELS: Record<ConditionId, string> = {
  clear: 'Clear',
  'mostly-clear': 'Mostly clear',
  'partly-cloudy': 'Partly cloudy',
  cloudy: 'Cloudy',
  fog: 'Fog',
  drizzle: 'Drizzle',
  rain: 'Rain',
  'rain-showers': 'Rain showers',
  'freezing-rain': 'Freezing rain',
  snow: 'Snow',
  'snow-showers': 'Snow showers',
  thunderstorm: 'Thunderstorm',
  unknown: 'Unknown',
}

export type WeatherSource = 'openweathermap' | 'open-meteo'

export interface CurrentWeather {
  tempC: number
  feelsLikeC: number
  humidity: number
  windSpeedKph: number
  /** Meteorological degrees the wind is blowing from, when the provider supplies it. */
  windDirectionDeg?: number
  condition: ConditionId
  conditionLabel: string
  isDaytime: boolean
  /** ISO-ish timestamp of when this reading was taken. */
  observedAt: string
}

export interface DailyForecast {
  /** Calendar date, YYYY-MM-DD. */
  date: string
  minTempC: number
  maxTempC: number
  condition: ConditionId
  conditionLabel: string
  isDaytime: boolean
}

export interface WeatherData {
  source: WeatherSource
  lat: number
  lon: number
  current: CurrentWeather
  daily: DailyForecast[]
}
