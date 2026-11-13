import { useRelativeTime } from '../hooks/useRelativeTime'
import type { City } from '../types/city'
import type { WeatherData } from '../types/weather'
import { conditionToIcon } from '../utils/weatherIcons'
import { degreesToCompassDirection } from '../utils/wind'
import './WeatherCard.css'

interface CurrentWeatherCardProps {
  city: City
  data: WeatherData
}

export function CurrentWeatherCard({ city, data }: CurrentWeatherCardProps) {
  const { current } = data
  const updatedLabel = useRelativeTime(current.observedAt)

  return (
    <section className="weatherCard" aria-label={`Current weather in ${city.name}`}>
      <h2 className="weatherCard__city">
        {city.name}, {city.country}
      </h2>

      <div className="weatherCard__top">
        <span className="weatherCard__icon" aria-hidden="true">
          {conditionToIcon(current.condition, current.isDaytime)}
        </span>
        <span className="weatherCard__temp">{Math.round(current.tempC)}°</span>
        <span className="weatherCard__condition">{current.conditionLabel}</span>
      </div>

      <dl className="weatherCard__stats">
        <div className="weatherCard__stat">
          <dt>Feels like</dt>
          <dd>{Math.round(current.feelsLikeC)}°</dd>
        </div>
        <div className="weatherCard__stat">
          <dt>Humidity</dt>
          <dd>{Math.round(current.humidity)}%</dd>
        </div>
        <div className="weatherCard__stat">
          <dt>Wind</dt>
          <dd>
            {Math.round(current.windSpeedKph)} km/h
            {current.windDirectionDeg !== undefined ? ` ${degreesToCompassDirection(current.windDirectionDeg)}` : ''}
          </dd>
        </div>
      </dl>

      <p className="weatherCard__updated">{updatedLabel}</p>

      {data.source === 'open-meteo' && <p className="weatherCard__sourceNote">Data from backup source</p>}
    </section>
  )
}
