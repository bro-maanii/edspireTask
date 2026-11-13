import { useEffect, useState } from 'react'

const UPDATE_INTERVAL_MS = 30_000

export function useRelativeTime(isoTimestamp: string): string {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const intervalId = setInterval(() => setNow(Date.now()), UPDATE_INTERVAL_MS)
    return () => clearInterval(intervalId)
  }, [])

  const diffMinutes = Math.max(0, Math.round((now - new Date(isoTimestamp).getTime()) / 60_000))

  if (diffMinutes < 1) return 'Updated just now'
  if (diffMinutes === 1) return 'Updated 1 min ago'
  if (diffMinutes < 60) return `Updated ${diffMinutes} min ago`

  const diffHours = Math.round(diffMinutes / 60)
  return diffHours === 1 ? 'Updated 1 hour ago' : `Updated ${diffHours} hours ago`
}
