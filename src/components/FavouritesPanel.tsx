import type { City } from '../types/city'
import './FavouritesPanel.css'

interface FavouritesPanelProps {
  favourites: City[]
  selectedCityId: number | null
  currentTempC: number | null
  onSelectCity: (city: City) => void
}

export function FavouritesPanel({ favourites, selectedCityId, currentTempC, onSelectCity }: FavouritesPanelProps) {
  if (favourites.length === 0) {
    return null
  }

  return (
    <div className="favouritesPanel">
      <h2 className="favouritesPanel__title">Favourites</h2>
      <div className="favouritesPanel__list">
        {favourites.map((city) => {
          const isActive = city.id === selectedCityId
          const temp = isActive && currentTempC !== null ? Math.round(currentTempC) : null

          return (
            <button
              key={city.id}
              type="button"
              className={isActive ? 'favouritesPanel__chip favouritesPanel__chip--active' : 'favouritesPanel__chip'}
              aria-current={isActive ? 'true' : undefined}
              onClick={() => onSelectCity(city)}
            >
              <span className="favouritesPanel__chipName">{city.name}</span>
              {temp !== null && <span className="favouritesPanel__chipTemp">{temp}°</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
