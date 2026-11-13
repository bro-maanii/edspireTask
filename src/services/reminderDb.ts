import type { City } from '../types/city'
import type { ReminderSettings } from '../types/reminder'

/**
 * localStorage isn't reachable from a service worker, so the daily-reminder
 * settings and the last-viewed city are mirrored here in IndexedDB too —
 * this is the only storage the periodic-sync handler in src/sw.ts can read.
 */

const DB_NAME = 'weatherboard'
const DB_VERSION = 1
const STORE_NAME = 'reminder'
const SETTINGS_KEY = 'settings'
const LAST_CITY_KEY = 'lastCity'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function getValue<T>(storeName: string, key: string): Promise<T | null> {
  return openDb().then(
    (db) =>
      new Promise<T | null>((resolve, reject) => {
        const request = db.transaction(storeName, 'readonly').objectStore(storeName).get(key)
        request.onsuccess = () => resolve((request.result as T | undefined) ?? null)
        request.onerror = () => reject(request.error)
      }),
  )
}

function putValue(storeName: string, key: string, value: unknown): Promise<void> {
  return openDb().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const request = db.transaction(storeName, 'readwrite').objectStore(storeName).put(value, key)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      }),
  )
}

export async function readReminderSettings(): Promise<ReminderSettings | null> {
  try {
    return await getValue<ReminderSettings>(STORE_NAME, SETTINGS_KEY)
  } catch {
    return null
  }
}

export async function writeReminderSettings(settings: ReminderSettings): Promise<void> {
  try {
    await putValue(STORE_NAME, SETTINGS_KEY, settings)
  } catch {
    // Best effort — the service worker just won't see this update until the next successful write.
  }
}

export async function readLastCity(): Promise<City | null> {
  try {
    return await getValue<City>(STORE_NAME, LAST_CITY_KEY)
  } catch {
    return null
  }
}

export async function writeLastCity(city: City | null): Promise<void> {
  try {
    await putValue(STORE_NAME, LAST_CITY_KEY, city)
  } catch {
    // Best effort — same fallback as writeReminderSettings.
  }
}
