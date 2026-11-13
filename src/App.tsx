import './App.css'
import { CitySearch } from './components/CitySearch'
import { FavouritesPanel } from './components/FavouritesPanel'
import { QuickPicks } from './components/QuickPicks'
import { WeatherDashboard } from './components/WeatherDashboard'
import { useFavourites } from './hooks/useFavourites'
import { useLocalStorageState } from './hooks/useLocalStorageState'
import { useWeather } from './hooks/useWeather'
import type { City } from './types/city'
import { getWeatherMood } from './utils/weatherMood'

const LAST_CITY_STORAGE_KEY = 'weatherboard.lastCity'

function App() {
  const [selectedCity, setSelectedCity] = useLocalStorageState<City | null>(LAST_CITY_STORAGE_KEY, null)
  const weather = useWeather(selectedCity)
  const favourites = useFavourites()

  const mood = weather.data ? getWeatherMood(weather.data.current.condition, weather.data.current.isDaytime) : undefined

  return (
    <div className="app" data-weather-mood={mood}>
      <div className="app__shell">
        <header className="app__header">
          <h1 className="app__title">WeatherBoard</h1>
        </header>

        <aside className="app__sidebar">
          <CitySearch onSelect={setSelectedCity} />
          <FavouritesPanel
            favourites={favourites.favourites}
            selectedCityId={selectedCity?.id ?? null}
            currentTempC={weather.data?.current.tempC ?? null}
            onSelectCity={setSelectedCity}
          />
          {favourites.favourites.length === 0 && <QuickPicks onSelectCity={setSelectedCity} />}
        </aside>

        <main className="app__main">
          <WeatherDashboard city={selectedCity} weather={weather} favourites={favourites} />
        </main>
      </div>
    </div>
  )
}

export default App
