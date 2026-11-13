import type { UseFavouritesResult } from '../hooks/useFavourites'
import type { UseWeatherResult } from '../hooks/useWeather'
import type { City } from '../types/city'
import type { UnitSystem } from '../utils/units'
import { CurrentWeatherCard } from './CurrentWeatherCard'
import { EmptyWeatherState } from './EmptyWeatherState'
import { ForecastList } from './ForecastList'
import { WeatherErrorCard } from './WeatherErrorCard'
import { WeatherSkeleton } from './WeatherSkeleton'
import './WeatherDashboard.css'

interface WeatherDashboardProps {
  city: City | null
  weather: UseWeatherResult
  favourites: UseFavouritesResult
  unit: UnitSystem
}

export function WeatherDashboard({ city, weather, favourites, unit }: WeatherDashboardProps) {
  const { data, status, error, refetch } = weather

  if (status === 'empty') {
    return <EmptyWeatherState />
  }

  if (status === 'loading') {
    return <WeatherSkeleton />
  }

  if (status === 'error' && error) {
    return <WeatherErrorCard error={error} onRetry={refetch} />
  }

  if (status === 'success' && data && city) {
    return (
      <div className="weatherDashboard__content" key={city.id}>
        <CurrentWeatherCard city={city} data={data} favourites={favourites} unit={unit} />
        <ForecastList daily={data.daily} unit={unit} />
      </div>
    )
  }

  return null
}
