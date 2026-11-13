const COMPASS_DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']

export function degreesToCompassDirection(deg: number): string {
  const index = Math.round(deg / 45) % COMPASS_DIRECTIONS.length
  return COMPASS_DIRECTIONS[index] ?? 'N'
}
