import { useRelativeTime } from '../hooks/useRelativeTime'
import type { UseFavouritesResult } from '../hooks/useFavourites'
import type { City } from '../types/city'
import type { WeatherData } from '../types/weather'
import { formatTemp, formatWindSpeed, type UnitSystem } from '../utils/units'
import { conditionToIcon, getIconAnimation } from '../utils/weatherIcons'
import { degreesToCompassDirection } from '../utils/wind'
import { FavouriteButton } from './FavouriteButton'
import './WeatherCard.css'
import './WeatherIcon.css'

interface CurrentWeatherCardProps {
  city: City
  data: WeatherData
  favourites: UseFavouritesResult
  unit: UnitSystem
}

export function CurrentWeatherCard({ city, data, favourites, unit }: CurrentWeatherCardProps) {
  const { current } = data
  const updatedLabel = useRelativeTime(current.observedAt)
  const iconAnimation = getIconAnimation(current.condition, current.isDaytime)

  return (
    <section className="weatherCard" aria-label={`Current weather in ${city.name}`}>
      <div className="weatherCard__header">
        <h2 className="weatherCard__city">
          {city.name}, {city.country}
        </h2>
        <FavouriteButton city={city} favourites={favourites} />
      </div>

      {!favourites.isStoragePersisted && (
        <p className="weatherCard__storageNotice" role="status">
          Favourites won't be saved after you close this tab
        </p>
      )}

      <div className="weatherCard__top">
        <span className={`weatherCard__icon animatedIcon--${iconAnimation}`} aria-hidden="true">
          {conditionToIcon(current.condition, current.isDaytime)}
        </span>
        <span className="weatherCard__temp">{formatTemp(current.tempC, unit)}</span>
        <span className="weatherCard__condition">{current.conditionLabel}</span>
      </div>

      <dl className="weatherCard__stats">
        <div className="weatherCard__stat">
          <dt>Feels like</dt>
          <dd>{formatTemp(current.feelsLikeC, unit)}</dd>
        </div>
        <div className="weatherCard__stat">
          <dt>Humidity</dt>
          <dd>{Math.round(current.humidity)}%</dd>
        </div>
        <div className="weatherCard__stat">
          <dt>Wind</dt>
          <dd>
            {formatWindSpeed(current.windSpeedKph, unit)}
            {current.windDirectionDeg !== undefined ? ` ${degreesToCompassDirection(current.windDirectionDeg)}` : ''}
          </dd>
        </div>
      </dl>

      <p className="weatherCard__updated">{updatedLabel}</p>

      {data.source === 'open-meteo' && <p className="weatherCard__sourceNote">Data from backup source</p>}
    </section>
  )
}
