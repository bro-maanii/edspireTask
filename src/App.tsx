import './App.css'
import { CitySearch } from './components/CitySearch'
import { QuickPicks } from './components/QuickPicks'
import { WeatherDashboard } from './components/WeatherDashboard'
import { useLocalStorageState } from './hooks/useLocalStorageState'
import { useWeather } from './hooks/useWeather'
import type { City } from './types/city'
import { getWeatherMood } from './utils/weatherMood'

const LAST_CITY_STORAGE_KEY = 'weatherboard.lastCity'

function App() {
  const [selectedCity, setSelectedCity] = useLocalStorageState<City | null>(LAST_CITY_STORAGE_KEY, null)
  const weather = useWeather(selectedCity)

  const mood = weather.data ? getWeatherMood(weather.data.current.condition, weather.data.current.isDaytime) : undefined

  return (
    <div className="app" data-weather-mood={mood}>
      <div className="app__shell">
        <header className="app__header">
          <h1 className="app__title">WeatherBoard</h1>
        </header>

        <aside className="app__sidebar">
          <CitySearch onSelect={setSelectedCity} />
          <QuickPicks onSelectCity={setSelectedCity} />
        </aside>

        <main className="app__main">
          <WeatherDashboard city={selectedCity} weather={weather} />
        </main>
      </div>
    </div>
  )
}

export default App
