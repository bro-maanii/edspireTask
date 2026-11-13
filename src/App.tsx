import { useState } from 'react'
import { CitySearch } from './components/CitySearch'
import type { City } from './types/city'

function App() {
  const [selectedCity, setSelectedCity] = useState<City | null>(null)

  return (
    <main>
      <h1>WeatherBoard</h1>
      <CitySearch onSelect={setSelectedCity} />
      {selectedCity && (
        <p>
          Selected: {selectedCity.name}, {selectedCity.country} ({selectedCity.lat}, {selectedCity.lon})
        </p>
      )}
    </main>
  )
}

export default App
