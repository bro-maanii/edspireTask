import { useEffect, useRef } from 'react'
import { buildReminderNotification } from '../services/reminderNotification'
import type { City } from '../types/city'
import { getTodayKey, hasPassedToday, msUntilNextOccurrence } from '../utils/reminderTime'
import { withTimeout } from '../utils/withTimeout'

const NOTIFICATION_ICON = '/icon-192.png'
const FETCH_TIMEOUT_MS = 10_000

interface UseDailyReminderOptions {
  time: string
  enabled: boolean
  /** Notification permission === 'granted'. */
  canNotify: boolean
  lastNotifiedDate: string | null
  city: City | null
  onFired: () => void
}

/**
 * Fires the reminder while the app is open: a timer for the chosen time each
 * day, plus a one-time catch-up check on mount if today's time already
 * passed before the app was opened. This is the only reliable path — see
 * the Periodic Background Sync comment in src/sw.ts for why the
 * installed-PWA background path can't be counted on by itself.
 */
export function useDailyReminder({ time, enabled, canNotify, lastNotifiedDate, city, onFired }: UseDailyReminderOptions) {
  const hasCheckedCatchUpRef = useRef(false)

  useEffect(() => {
    if (!enabled || !canNotify || !city) {
      return
    }

    let cancelled = false

    async function fireNotification() {
      if (!city) return
      try {
        // Fired directly from the page context — no navigator.serviceWorker.ready
        // here. That would hang forever whenever no service worker is registered
        // (e.g. dev mode), which would permanently stop this timer from ever
        // rescheduling (onFired() below would never run). new Notification()
        // works immediately and needs no service worker.
        const { title, body } = await withTimeout(
          buildReminderNotification(city),
          FETCH_TIMEOUT_MS,
          'Fetching weather for the daily reminder took too long.',
        )
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title, { body, icon: NOTIFICATION_ICON, tag: 'daily-weather-reminder' })
        }
      } catch {
        // Best effort — a failed or slow weather fetch just means today's reminder is skipped.
      }
      if (!cancelled) {
        onFired()
      }
    }

    if (!hasCheckedCatchUpRef.current) {
      hasCheckedCatchUpRef.current = true
      if (hasPassedToday(time) && lastNotifiedDate !== getTodayKey()) {
        void fireNotification()
      }
    }

    const timeoutId = setTimeout(() => {
      void fireNotification()
    }, msUntilNextOccurrence(time))

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [enabled, canNotify, city, time, lastNotifiedDate, onFired])
}
