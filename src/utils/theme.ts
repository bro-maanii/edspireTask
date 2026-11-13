export type ThemePreference = 'system' | 'light' | 'dark'

export const THEME_STORAGE_KEY = 'weatherboard.theme'

const LIGHT_THEME_COLOR = '#f8fafc'
const DARK_THEME_COLOR = '#0f172a'

function resolveIsDark(preference: ThemePreference): boolean {
  if (preference === 'dark') return true
  if (preference === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/** Applies the theme to the DOM. The no-flash bootstrap script in index.html duplicates this logic in plain JS, since it must run before any module loads. */
export function applyTheme(preference: ThemePreference): void {
  const root = document.documentElement
  const isDark = resolveIsDark(preference)

  if (preference === 'system') {
    root.removeAttribute('data-theme')
  } else {
    root.setAttribute('data-theme', preference)
  }

  root.style.colorScheme = isDark ? 'dark' : 'light'

  const meta = document.querySelector('meta[name="theme-color"]')
  meta?.setAttribute('content', isDark ? DARK_THEME_COLOR : LIGHT_THEME_COLOR)
}
