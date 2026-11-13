import './EmptyWeatherState.css'

export function EmptyWeatherState() {
  return (
    <section className="emptyWeatherState">
      <span className="emptyWeatherState__icon" aria-hidden="true">
        🔍
      </span>
      <p className="emptyWeatherState__title">Search for a city to see its weather</p>
      <p className="emptyWeatherState__hint">Or pick one of the quick picks to get started.</p>
    </section>
  )
}
