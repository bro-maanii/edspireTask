function parseTime(time: string): { hours: number; minutes: number } {
  const [hoursStr, minutesStr] = time.split(':')
  return { hours: Number(hoursStr), minutes: Number(minutesStr) }
}

function todayAt(time: string): Date {
  const { hours, minutes } = parseTime(time)
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0)
}

export function getTodayKey(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

/** Whether today's occurrence of `time` (24h "HH:MM") has already passed. */
export function hasPassedToday(time: string): boolean {
  return Date.now() >= todayAt(time).getTime()
}

/** Milliseconds until the next occurrence of `time` (today if still ahead, else tomorrow). */
export function msUntilNextOccurrence(time: string): number {
  const next = todayAt(time)
  if (next.getTime() <= Date.now()) {
    next.setDate(next.getDate() + 1)
  }
  return next.getTime() - Date.now()
}
