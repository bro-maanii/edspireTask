function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Formats a forecast day's YYYY-MM-DD date as "Today" or a short weekday name. */
export function formatDayLabel(dateKey: string): string {
  if (dateKey === toDateKey(new Date())) {
    return 'Today'
  }
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short' })
}

/** Formats an ISO timestamp as a short local clock time, e.g. "2:30 PM". */
export function formatSavedTime(isoTimestamp: string): string {
  return new Date(isoTimestamp).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}
