import type { ConditionId } from '../types/weather'

export type WeatherMood = 'clear' | 'cloudy' | 'rain' | 'snow' | 'night'

const SNOW_CONDITIONS: ConditionId[] = ['snow', 'snow-showers']
const RAIN_CONDITIONS: ConditionId[] = ['drizzle', 'rain', 'rain-showers', 'freezing-rain', 'thunderstorm']
const CLOUDY_CONDITIONS: ConditionId[] = ['cloudy', 'fog', 'mostly-clear', 'partly-cloudy']

/** Precipitation wins regardless of time of day; otherwise night takes over from clear/cloudy. */
export function getWeatherMood(condition: ConditionId, isDaytime: boolean): WeatherMood {
  if (SNOW_CONDITIONS.includes(condition)) return 'snow'
  if (RAIN_CONDITIONS.includes(condition)) return 'rain'
  if (!isDaytime) return 'night'
  if (CLOUDY_CONDITIONS.includes(condition)) return 'cloudy'
  return 'clear'
}
