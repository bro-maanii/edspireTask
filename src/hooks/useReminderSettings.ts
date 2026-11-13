import { useCallback, useEffect, useState } from 'react'
import { writeLastCity, writeReminderSettings } from '../services/reminderDb'
import { buildReminderNotification } from '../services/reminderNotification'
import { ApiError } from '../types/apiError'
import type { City } from '../types/city'
import { DEFAULT_REMINDER_SETTINGS, type ReminderSettings } from '../types/reminder'
import { getTodayKey } from '../utils/reminderTime'
import { withTimeout } from '../utils/withTimeout'
import { useLocalStorageState } from './useLocalStorageState'

const SETTINGS_STORAGE_KEY = 'weatherboard.reminderSettings'
const PERIODIC_SYNC_TAG = 'daily-weather-reminder'
const NOTIFICATION_ICON = '/icon-192.png'
const TEST_NOTIFICATION_TIMEOUT_MS = 10_000
const SUCCESS_MESSAGE_DURATION_MS = 5_000

export type NotificationSupport = 'unsupported' | 'default' | 'denied' | 'granted'

export type TestNotificationStatus =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'success' }
  | { kind: 'error'; message: string }

export interface UseReminderSettingsResult {
  settings: ReminderSettings
  support: NotificationSupport
  setTime: (time: string) => void
  enableReminders: () => Promise<void>
  disableReminders: () => void
  sendTestNotification: () => Promise<void>
  testNotificationStatus: TestNotificationStatus
  markNotified: () => void
}

function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

interface PeriodicSyncManager {
  register: (tag: string, options: { minInterval: number }) => Promise<void>
  unregister: (tag: string) => Promise<void>
}

function getPeriodicSync(registration: ServiceWorkerRegistration): PeriodicSyncManager | undefined {
  return (registration as ServiceWorkerRegistration & { periodicSync?: PeriodicSyncManager }).periodicSync
}

export function useReminderSettings(city: City | null): UseReminderSettingsResult {
  const [settings, setSettings] = useLocalStorageState<ReminderSettings>(
    SETTINGS_STORAGE_KEY,
    DEFAULT_REMINDER_SETTINGS,
  )
  const [permission, setPermission] = useState<NotificationPermission | null>(() =>
    isNotificationSupported() ? Notification.permission : null,
  )
  const [testNotificationStatus, setTestNotificationStatus] = useState<TestNotificationStatus>({ kind: 'idle' })

  const supported = isNotificationSupported()

  useEffect(() => {
    if (testNotificationStatus.kind !== 'success') return
    const timeoutId = setTimeout(() => setTestNotificationStatus({ kind: 'idle' }), SUCCESS_MESSAGE_DURATION_MS)
    return () => clearTimeout(timeoutId)
  }, [testNotificationStatus])

  // Keep IndexedDB's copy of the last city current so src/sw.ts can read it
  // during a periodic-sync tick — localStorage isn't reachable from there.
  useEffect(() => {
    void writeLastCity(city)
  }, [city])

  useEffect(() => {
    if (!supported || !('permissions' in navigator)) return

    let status: PermissionStatus | undefined

    navigator.permissions
      .query({ name: 'notifications' as PermissionName })
      .then((result) => {
        status = result
        setPermission(result.state as NotificationPermission)
        status.onchange = () => setPermission(status?.state as NotificationPermission)
      })
      .catch(() => {
        // Permissions API query unsupported for this name; Notification.permission remains authoritative.
      })

    return () => {
      if (status) {
        status.onchange = null
      }
    }
  }, [supported])

  const updateSettings = useCallback(
    (next: ReminderSettings) => {
      setSettings(next)
      void writeReminderSettings(next)
    },
    [setSettings],
  )

  const setTime = useCallback(
    (time: string) => updateSettings({ ...settings, time }),
    [settings, updateSettings],
  )

  const markNotified = useCallback(
    () => updateSettings({ ...settings, lastNotifiedDate: getTodayKey() }),
    [settings, updateSettings],
  )

  const registerPeriodicSync = useCallback(() => {
    navigator.serviceWorker.ready
      .then((registration) => getPeriodicSync(registration)?.register(PERIODIC_SYNC_TAG, { minInterval: 12 * 60 * 60 * 1000 }))
      .catch(() => {
        // Periodic Background Sync is unsupported, blocked by the browser's engagement
        // heuristic, or this isn't an installed PWA — the foreground timer still covers us.
      })
  }, [])

  const enableReminders = useCallback(async () => {
    if (!supported) return
    const result = await Notification.requestPermission()
    setPermission(result)
    if (result === 'granted') {
      updateSettings({ ...settings, enabled: true })
      registerPeriodicSync()
    }
  }, [supported, settings, updateSettings, registerPeriodicSync])

  const disableReminders = useCallback(() => {
    updateSettings({ ...settings, enabled: false })
    navigator.serviceWorker.ready
      .then((registration) => getPeriodicSync(registration)?.unregister(PERIODIC_SYNC_TAG))
      .catch(() => {
        // Nothing to clean up if periodic sync was never registered.
      })
  }, [settings, updateSettings])

  const sendTestNotification = useCallback(async () => {
    setTestNotificationStatus({ kind: 'sending' })

    if (!city) {
      setTestNotificationStatus({
        kind: 'error',
        message: 'Select a city first so the test notification has weather to show.',
      })
      return
    }

    if (!supported) {
      setTestNotificationStatus({ kind: 'error', message: "Your browser doesn't support notifications." })
      return
    }

    if (Notification.permission !== 'granted') {
      setTestNotificationStatus({ kind: 'error', message: 'Notification permission is not granted.' })
      return
    }

    try {
      // Fired directly from the page — no need for navigator.serviceWorker.ready here,
      // which would hang forever in dev mode (no SW is ever registered there) and is
      // unnecessary even in production: new Notification() works immediately from a
      // user-initiated click. Only src/sw.ts (which has no Notification constructor)
      // needs self.registration.showNotification.
      const { title, body } = await withTimeout(
        buildReminderNotification(city),
        TEST_NOTIFICATION_TIMEOUT_MS,
        'Fetching weather for the test notification took too long.',
      )
      new Notification(title, { body, icon: NOTIFICATION_ICON, tag: 'reminder-test' })
      setTestNotificationStatus({ kind: 'success' })
    } catch (error) {
      setTestNotificationStatus({
        kind: 'error',
        message:
          error instanceof ApiError
            ? `${error.message} ${error.action}`
            : error instanceof Error
              ? error.message
              : "Couldn't send a test notification right now. Try again in a moment.",
      })
    }
  }, [city, supported])

  const support: NotificationSupport = !supported
    ? 'unsupported'
    : permission === 'granted'
      ? 'granted'
      : permission === 'denied'
        ? 'denied'
        : 'default'

  return {
    settings,
    support,
    setTime,
    enableReminders,
    disableReminders,
    sendTestNotification,
    testNotificationStatus,
    markNotified,
  }
}
