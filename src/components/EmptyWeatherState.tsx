import type { City } from '../types/city'
import './EmptyWeatherState.css'

interface EmptyWeatherStateProps {
  onSelectCity: (city: City) => void
}

// Negative ids keep these distinct from real GeoDB city ids.
const QUICK_PICK_CITIES: City[] = [
  { id: -1, name: 'Karachi', region: 'Sindh', country: 'Pakistan', countryCode: 'PK', lat: 24.8607, lon: 67.0011 },
  { id: -2, name: 'London', region: 'England', country: 'United Kingdom', countryCode: 'GB', lat: 51.5074, lon: -0.1278 },
  { id: -3, name: 'Dubai', region: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', lat: 25.2048, lon: 55.2708 },
  { id: -4, name: 'New York', region: 'New York', country: 'United States', countryCode: 'US', lat: 40.7128, lon: -74.006 },
]

export function EmptyWeatherState({ onSelectCity }: EmptyWeatherStateProps) {
  return (
    <section className="emptyWeatherState">
      <p className="emptyWeatherState__title">Search for a city to see its weather.</p>
      <p className="emptyWeatherState__hint">Or try one of these:</p>
      <div className="emptyWeatherState__quickPicks">
        {QUICK_PICK_CITIES.map((city) => (
          <button
            key={city.id}
            type="button"
            className="emptyWeatherState__quickPick"
            onClick={() => onSelectCity(city)}
          >
            {city.name}
          </button>
        ))}
      </div>
    </section>
  )
}
