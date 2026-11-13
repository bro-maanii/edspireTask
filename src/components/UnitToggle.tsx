import type { UnitSystem } from '../utils/units'
import { SegmentedToggle } from './SegmentedToggle'

interface UnitToggleProps {
  unit: UnitSystem
  onChange: (unit: UnitSystem) => void
}

const OPTIONS: { value: UnitSystem; label: string }[] = [
  { value: 'metric', label: '°C' },
  { value: 'imperial', label: '°F' },
]

export function UnitToggle({ unit, onChange }: UnitToggleProps) {
  return <SegmentedToggle label="Temperature units" options={OPTIONS} value={unit} onChange={onChange} />
}
