import type { DailyForecast } from '../types/weather'
import { formatDayLabel } from '../utils/dates'
import { formatTemp, type UnitSystem } from '../utils/units'
import { conditionToIcon, getIconAnimation } from '../utils/weatherIcons'
import './ForecastList.css'
import './WeatherIcon.css'

interface ForecastListProps {
  daily: DailyForecast[]
  unit: UnitSystem
}

export function ForecastList({ daily, unit }: ForecastListProps) {
  return (
    <ul className="forecastGrid" aria-label="5-day forecast">
      {daily.map((day) => (
        <li key={day.date} className="forecastCard">
          <span className="forecastCard__day">{formatDayLabel(day.date)}</span>
          <span className={`forecastCard__icon animatedIcon--${getIconAnimation(day.condition, day.isDaytime)}`} aria-hidden="true">
            {conditionToIcon(day.condition, day.isDaytime)}
          </span>
          <span className="forecastCard__temps">
            <span className="forecastCard__max">{formatTemp(day.maxTempC, unit)}</span>
            <span className="forecastCard__min">{formatTemp(day.minTempC, unit)}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}
