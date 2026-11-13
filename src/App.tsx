import './App.css'
import { CitySearch } from './components/CitySearch'
import { DailyReminderSettings } from './components/DailyReminderSettings'
import { FavouritesPanel } from './components/FavouritesPanel'
import { InstallAppButton } from './components/InstallAppButton'
import { OfflineBanner } from './components/OfflineBanner'
import { QuickPicks } from './components/QuickPicks'
import { ThemeToggle } from './components/ThemeToggle'
import { UnitToggle } from './components/UnitToggle'
import { WeatherDashboard } from './components/WeatherDashboard'
import { useFavourites } from './hooks/useFavourites'
import { useLocalStorageState } from './hooks/useLocalStorageState'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import { useUnitPreference } from './hooks/useUnitPreference'
import { useWeather } from './hooks/useWeather'
import type { City } from './types/city'
import { getWeatherMood } from './utils/weatherMood'

const LAST_CITY_STORAGE_KEY = 'weatherboard.lastCity'

function App() {
  const [selectedCity, setSelectedCity] = useLocalStorageState<City | null>(LAST_CITY_STORAGE_KEY, null)
  const weather = useWeather(selectedCity)
  const favourites = useFavourites()
  const isOnline = useOnlineStatus()
  const [unit, setUnit] = useUnitPreference()

  const mood = weather.data ? getWeatherMood(weather.data.current.condition, weather.data.current.isDaytime) : undefined

  return (
    <div className="app" data-weather-mood={mood}>
      <div className="app__shell">
        <header className="app__header">
          <h1 className="app__title">WeatherBoard</h1>
          <div className="app__headerControls">
            <ThemeToggle />
            <UnitToggle unit={unit} onChange={setUnit} />
            <InstallAppButton />
          </div>
        </header>

        <aside className="app__sidebar">
          <CitySearch onSelect={setSelectedCity} disabled={!isOnline} />
          <FavouritesPanel
            favourites={favourites.favourites}
            selectedCityId={selectedCity?.id ?? null}
            currentTempC={weather.data?.current.tempC ?? null}
            unit={unit}
            onSelectCity={setSelectedCity}
          />
          {favourites.favourites.length === 0 && <QuickPicks onSelectCity={setSelectedCity} />}
          <DailyReminderSettings city={selectedCity} />
        </aside>

        <main className="app__main">
          <OfflineBanner isOnline={isOnline} cityName={selectedCity?.name ?? null} savedAt={weather.snapshotSavedAt} />
          <WeatherDashboard city={selectedCity} weather={weather} favourites={favourites} unit={unit} />
        </main>
      </div>
    </div>
  )
}

export default App
