import type { UnitSystem } from '../utils/units'
import { useLocalStorageState } from './useLocalStorageState'

const UNIT_STORAGE_KEY = 'weatherboard.units'

/**
 * Called once in App.tsx and threaded down as props — calling this
 * independently in multiple components would give each its own
 * localStorage-backed state that wouldn't stay in sync with the others.
 */
export function useUnitPreference() {
  return useLocalStorageState<UnitSystem>(UNIT_STORAGE_KEY, 'metric')
}
