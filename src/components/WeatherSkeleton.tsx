import './WeatherCard.css'
import './ForecastList.css'

const FORECAST_PLACEHOLDER_COUNT = 5

export function WeatherSkeleton() {
  return (
    <div aria-live="polite" aria-busy="true">
      <span className="srOnly">Loading weather…</span>

      <section className="weatherCard" aria-hidden="true">
        <div className="weatherCard__header">
          <span className="skeletonBar weatherCard__city" style={{ width: '60%' }} />
          <span className="skeletonBar" style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)' }} />
        </div>

        <div className="weatherCard__top">
          <span className="skeletonBar weatherCard__icon" />
          <span className="skeletonBar weatherCard__temp" style={{ width: '4rem' }} />
          <span className="skeletonBar weatherCard__condition" style={{ width: '40%' }} />
        </div>

        <dl className="weatherCard__stats">
          {[0, 1, 2].map((index) => (
            <div className="weatherCard__stat" key={index}>
              <dt>
                <span className="skeletonBar" style={{ width: '70%' }} />
              </dt>
              <dd>
                <span className="skeletonBar" style={{ width: '50%' }} />
              </dd>
            </div>
          ))}
        </dl>

        <p className="weatherCard__updated">
          <span className="skeletonBar" style={{ width: '30%' }} />
        </p>
      </section>

      <ul className="forecastGrid" aria-hidden="true">
        {Array.from({ length: FORECAST_PLACEHOLDER_COUNT }, (_, index) => (
          <li key={index} className="forecastCard">
            <span className="skeletonBar forecastCard__day" style={{ width: '70%' }} />
            <span className="skeletonBar forecastCard__icon" />
            <span className="skeletonBar" style={{ width: '60%', height: '1rem' }} />
          </li>
        ))}
      </ul>
    </div>
  )
}
