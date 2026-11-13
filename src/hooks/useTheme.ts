import { useEffect } from 'react'
import { applyTheme, THEME_STORAGE_KEY, type ThemePreference } from '../utils/theme'
import { useLocalStorageState } from './useLocalStorageState'

export function useTheme() {
  const [preference, setPreference] = useLocalStorageState<ThemePreference>(THEME_STORAGE_KEY, 'system')

  useEffect(() => {
    applyTheme(preference)

    if (preference !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    function handleChange() {
      applyTheme('system')
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [preference])

  return { preference, setPreference }
}
