/// <reference lib="webworker" />

/**
 * This app has no backend. True Web Push — a server waking this worker to
 * show a notification even while the browser is closed — needs a push
 * service subscription and a server to send to it, which doesn't exist
 * here. Periodic Background Sync (used below) is the closest client-only
 * substitute, and it is a much weaker guarantee:
 *   - Chromium only (Chrome, Edge); no Safari or Firefox support.
 *   - Only fires for an installed PWA, not a regular browser tab.
 *   - Chrome decides the actual schedule based on a "site engagement" score
 *     and battery/network conditions — `minInterval` is a minimum, not a
 *     promise, and Chrome can simply skip a tick.
 *   - If the device is off or the browser hasn't run in a while, nothing
 *     fires until it's next opened.
 * In short: this can supplement the in-app timer, but cannot replace it.
 * See the README's "Known limitations" section for what a real
 * server + Web Push + VAPID setup would look like instead.
 */

import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { readLastCity, readReminderSettings, writeReminderSettings } from './services/reminderDb'
import { buildReminderNotification } from './services/reminderNotification'
import { getTodayKey, hasPassedToday } from './utils/reminderTime'

declare let self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>
}

const NOTIFICATION_ICON = '/icon-192.png'
const PERIODIC_SYNC_TAG = 'daily-weather-reminder'

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

registerRoute(
  ({ url }) => url.hostname === 'fonts.googleapis.com',
  new CacheFirst({
    cacheName: 'google-fonts-stylesheets',
    plugins: [new ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 60 * 60 * 24 * 365 })],
  }),
)

registerRoute(
  ({ url }) => url.hostname === 'fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [
      new ExpirationPlugin({ maxEntries: 8, maxAgeSeconds: 60 * 60 * 24 * 365 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
)

registerRoute(
  ({ url }) => url.hostname === 'api.openweathermap.org' || url.hostname === 'api.open-meteo.com',
  new NetworkFirst({
    cacheName: 'weather-api-cache',
    networkTimeoutSeconds: 8,
    plugins: [
      new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 60 * 60 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
)

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

async function checkDailyReminder(): Promise<void> {
  const settings = await readReminderSettings()
  if (!settings || !settings.enabled) return

  const todayKey = getTodayKey()
  if (settings.lastNotifiedDate === todayKey) return
  if (!hasPassedToday(settings.time)) return

  const city = await readLastCity()
  if (!city) return

  try {
    const { title, body } = await buildReminderNotification(city)
    await self.registration.showNotification(title, {
      body,
      icon: NOTIFICATION_ICON,
      tag: PERIODIC_SYNC_TAG,
    })
    await writeReminderSettings({ ...settings, lastNotifiedDate: todayKey })
  } catch {
    // Best effort (e.g. offline with no cached response). lastNotifiedDate is
    // deliberately left unset so the next tick, or the app's own foreground
    // timer, can still retry today.
  }
}

interface PeriodicSyncEvent extends ExtendableEvent {
  tag: string
}

self.addEventListener('periodicsync', (event) => {
  const syncEvent = event as PeriodicSyncEvent
  if (syncEvent.tag === PERIODIC_SYNC_TAG) {
    syncEvent.waitUntil(checkDailyReminder())
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsList) => {
      const existing = clientsList.find((client): client is WindowClient => 'focus' in client)
      if (existing) {
        return existing.focus()
      }
      return self.clients.openWindow('/')
    }),
  )
})
