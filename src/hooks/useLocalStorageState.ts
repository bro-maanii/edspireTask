import { useState } from 'react'

export function useLocalStorageState<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? (JSON.parse(stored) as T) : defaultValue
    } catch {
      return defaultValue
    }
  })

  function setPersistedValue(next: T) {
    setValue(next)
    try {
      localStorage.setItem(key, JSON.stringify(next))
    } catch {
      // Storage may be disabled or full; the in-memory value still updates.
    }
  }

  return [value, setPersistedValue] as const
}
