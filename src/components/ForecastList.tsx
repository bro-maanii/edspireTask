import type { DailyForecast } from '../types/weather'
import { formatDayLabel } from '../utils/dates'
import { conditionToIcon } from '../utils/weatherIcons'
import './ForecastList.css'

interface ForecastListProps {
  daily: DailyForecast[]
}

export function ForecastList({ daily }: ForecastListProps) {
  return (
    <ul className="forecastGrid" aria-label="5-day forecast">
      {daily.map((day) => (
        <li key={day.date} className="forecastCard">
          <span className="forecastCard__day">{formatDayLabel(day.date)}</span>
          <span className="forecastCard__icon" aria-hidden="true">
            {conditionToIcon(day.condition, day.isDaytime)}
          </span>
          <span className="forecastCard__temps">
            <span className="forecastCard__max">{Math.round(day.maxTempC)}°</span>
            <span className="forecastCard__min">{Math.round(day.minTempC)}°</span>
          </span>
        </li>
      ))}
    </ul>
  )
}
