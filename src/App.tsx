import { CitySearch } from './components/CitySearch'
import { WeatherDashboard } from './components/WeatherDashboard'
import { useLocalStorageState } from './hooks/useLocalStorageState'
import type { City } from './types/city'

const LAST_CITY_STORAGE_KEY = 'weatherboard.lastCity'

function App() {
  const [selectedCity, setSelectedCity] = useLocalStorageState<City | null>(LAST_CITY_STORAGE_KEY, null)

  return (
    <main className="app">
      <h1>WeatherBoard</h1>
      <CitySearch onSelect={setSelectedCity} />
      <WeatherDashboard city={selectedCity} onSelectCity={setSelectedCity} />
    </main>
  )
}

export default App
