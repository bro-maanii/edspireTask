import type { City } from '../types/city'
import { getWeather } from './weatherService'

export interface ReminderNotificationContent {
  title: string
  body: string
}

function capitalizeFirst(text: string): string {
  if (text.length === 0) return text
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** Framework-free so it can be imported from both the app and src/sw.ts. */
export async function buildReminderNotification(city: City): Promise<ReminderNotificationContent> {
  const weather = await getWeather(city.lat, city.lon)
  const temp = Math.round(weather.current.tempC)
  return {
    title: 'Good morning!',
    body: `${city.name}: ${temp}°C, ${capitalizeFirst(weather.current.conditionLabel)}`,
  }
}
