/** Raw shapes returned by the Open-Meteo /v1/forecast endpoint. */
export interface OpenMeteoCurrent {
  time: string
  temperature_2m: number
  apparent_temperature: number
  relative_humidity_2m: number
  weather_code: number
  wind_speed_10m: number
  wind_direction_10m: number
  is_day: 0 | 1
}

export interface OpenMeteoDaily {
  time: string[]
  temperature_2m_max: number[]
  temperature_2m_min: number[]
  weather_code: number[]
}

export interface OpenMeteoResponse {
  current: OpenMeteoCurrent
  daily: OpenMeteoDaily
}
