import type { ConditionId } from '../types/weather'

const DAYTIME_ICONS: Record<ConditionId, string> = {
  clear: '☀️',
  'mostly-clear': '🌤️',
  'partly-cloudy': '⛅',
  cloudy: '☁️',
  fog: '🌫️',
  drizzle: '🌦️',
  rain: '🌧️',
  'rain-showers': '🌧️',
  'freezing-rain': '🌧️',
  snow: '❄️',
  'snow-showers': '🌨️',
  thunderstorm: '⛈️',
  unknown: '🌡️',
}

const NIGHTTIME_OVERRIDES: Partial<Record<ConditionId, string>> = {
  clear: '🌙',
  'mostly-clear': '🌙',
  'partly-cloudy': '☁️',
}

export function conditionToIcon(condition: ConditionId, isDaytime: boolean): string {
  if (!isDaytime) {
    const nightIcon = NIGHTTIME_OVERRIDES[condition]
    if (nightIcon) return nightIcon
  }
  return DAYTIME_ICONS[condition]
}
