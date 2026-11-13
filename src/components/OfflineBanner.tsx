import { formatSavedTime } from '../utils/dates'
import './OfflineBanner.css'

interface OfflineBannerProps {
  isOnline: boolean
  cityName: string | null
  savedAt: string | null
}

export function OfflineBanner({ isOnline, cityName, savedAt }: OfflineBannerProps) {
  if (isOnline) {
    return null
  }

  const message =
    cityName && savedAt
      ? `You're offline — showing saved weather for ${cityName} from ${formatSavedTime(savedAt)}.`
      : "You're offline — weather data isn't available until you're back online."

  return (
    <div className="offlineBanner" role="status">
      {message}
    </div>
  )
}
