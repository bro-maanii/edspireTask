/** Raw shapes returned by the OpenWeatherMap /weather and /forecast endpoints. */
export interface OwmWeatherCondition {
  id: number
  main: string
  description: string
  /** Icon code; suffix 'd' or 'n' indicates day/night. */
  icon: string
}

export interface OwmCurrentResponse {
  dt: number
  weather: OwmWeatherCondition[]
  main: {
    temp: number
    feels_like: number
    humidity: number
  }
  wind: {
    speed: number
    deg?: number
  }
}

export interface OwmForecastListItem {
  dt: number
  dt_txt: string
  weather: OwmWeatherCondition[]
  main: {
    temp: number
    temp_min: number
    temp_max: number
    feels_like: number
    humidity: number
  }
}

export interface OwmForecastResponse {
  list: OwmForecastListItem[]
}
