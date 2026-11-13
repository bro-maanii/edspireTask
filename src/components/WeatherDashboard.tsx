import { useWeather } from '../hooks/useWeather'
import type { City } from '../types/city'
import { CurrentWeatherCard } from './CurrentWeatherCard'
import { EmptyWeatherState } from './EmptyWeatherState'
import { ForecastList } from './ForecastList'
import { WeatherErrorCard } from './WeatherErrorCard'
import { WeatherSkeleton } from './WeatherSkeleton'

interface WeatherDashboardProps {
  city: City | null
  onSelectCity: (city: City) => void
}

export function WeatherDashboard({ city, onSelectCity }: WeatherDashboardProps) {
  const { data, status, error, refetch } = useWeather(city)

  if (status === 'empty') {
    return <EmptyWeatherState onSelectCity={onSelectCity} />
  }

  if (status === 'loading') {
    return <WeatherSkeleton />
  }

  if (status === 'error' && error) {
    return <WeatherErrorCard error={error} onRetry={refetch} />
  }

  if (status === 'success' && data && city) {
    return (
      <>
        <CurrentWeatherCard city={city} data={data} />
        <ForecastList daily={data.daily} />
      </>
    )
  }

  return null
}
