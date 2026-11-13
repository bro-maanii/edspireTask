import type { ApiError } from '../types/apiError'
import './WeatherErrorCard.css'

interface WeatherErrorCardProps {
  error: ApiError
  onRetry: () => void
}

function describeWeatherError(error: ApiError): string {
  switch (error.kind) {
    case 'network':
      return "Couldn't reach the weather service. Check your internet connection and try again."
    case 'rate_limit':
      return 'The weather service is receiving too many requests right now. Wait a moment and try again.'
    case 'auth':
      return 'The weather service rejected the request because the API key is missing or invalid. Check your .env file and restart the dev server.'
    case 'not_found':
      return "Couldn't find weather data for this location. Try selecting a different city."
    case 'unknown':
    default:
      return `${error.message} ${error.action}`
  }
}

export function WeatherErrorCard({ error, onRetry }: WeatherErrorCardProps) {
  return (
    <section className="weatherErrorCard" role="alert">
      <p className="weatherErrorCard__message">{describeWeatherError(error)}</p>
      <button type="button" className="weatherErrorCard__retryButton" onClick={onRetry}>
        Retry
      </button>
    </section>
  )
}
