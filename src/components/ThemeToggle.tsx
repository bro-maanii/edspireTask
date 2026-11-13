import { useTheme } from '../hooks/useTheme'
import type { ThemePreference } from '../utils/theme'
import { SegmentedToggle } from './SegmentedToggle'

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

export function ThemeToggle() {
  const { preference, setPreference } = useTheme()
  return <SegmentedToggle label="Theme" options={OPTIONS} value={preference} onChange={setPreference} />
}
