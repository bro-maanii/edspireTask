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

export type IconAnimation = 'rotate' | 'pulse' | 'drift' | 'fall' | 'none'

const SKY_CONDITIONS: ConditionId[] = ['mostly-clear', 'partly-cloudy', 'cloudy', 'fog']
const PRECIPITATION_CONDITIONS: ConditionId[] = [
  'drizzle',
  'rain',
  'rain-showers',
  'freezing-rain',
  'thunderstorm',
]
const SNOW_CONDITIONS: ConditionId[] = ['snow', 'snow-showers']

/** Sun rotates, clouds drift, rain/snow fall — matched to conditionToIcon's glyph for the same condition. */
export function getIconAnimation(condition: ConditionId, isDaytime: boolean): IconAnimation {
  if (condition === 'clear') return isDaytime ? 'rotate' : 'pulse'
  if (SKY_CONDITIONS.includes(condition) || SNOW_CONDITIONS.includes(condition)) return 'drift'
  if (PRECIPITATION_CONDITIONS.includes(condition)) return 'fall'
  return 'none'
}
