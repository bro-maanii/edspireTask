export type UnitSystem = 'metric' | 'imperial'

export function msToKph(speedMetersPerSecond: number): number {
  return speedMetersPerSecond * 3.6
}

export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32
}

export function kphToMph(kph: number): number {
  return kph / 1.609344
}

/** Converts (if needed) and formats a Celsius temperature for display, e.g. "21°". */
export function formatTemp(celsius: number, unit: UnitSystem): string {
  const value = unit === 'imperial' ? celsiusToFahrenheit(celsius) : celsius
  return `${Math.round(value)}°`
}

/** Converts (if needed) and formats a km/h wind speed for display, e.g. "14 km/h" or "9 mph". */
export function formatWindSpeed(kph: number, unit: UnitSystem): string {
  const value = unit === 'imperial' ? kphToMph(kph) : kph
  const label = unit === 'imperial' ? 'mph' : 'km/h'
  return `${Math.round(value)} ${label}`
}
