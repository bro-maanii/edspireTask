import { useId, useRef, useState } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import { MIN_QUERY_LENGTH, useCitySearch } from '../hooks/useCitySearch'
import type { City } from '../types/city'
import { countryCodeToFlagEmoji } from '../utils/flags'
import './CitySearch.css'

interface CitySearchProps {
  label?: string
  placeholder?: string
  onSelect: (city: City) => void
}

function formatCityLabel(city: City): string {
  const parts = [city.name]
  if (city.region && city.region !== city.name) {
    parts.push(city.region)
  }
  parts.push(city.country)
  return parts.join(', ')
}

export function CitySearch({ label = 'City', placeholder = 'Search for a city…', onSelect }: CitySearchProps) {
  const baseId = useId()
  const inputId = `${baseId}-input`
  const listboxId = `${baseId}-listbox`
  const errorId = `${baseId}-error`
  const optionId = (index: number) => `${baseId}-option-${index}`

  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [blurError, setBlurError] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  // Set right before we blur the input ourselves after a selection, so the
  // resulting blur (which now sees a cleared input) skips validation.
  const skipNextBlurValidationRef = useRef(false)

  const { cities, status, error, retry } = useCitySearch(query)

  const trimmedQuery = query.trim()
  const showPanel = isOpen && trimmedQuery.length >= MIN_QUERY_LENGTH && status !== 'idle'
  // Default to highlighting the first result so Enter works without requiring an arrow key press first.
  const effectiveActiveIndex = activeIndex === -1 && status === 'success' && cities.length > 0 ? 0 : activeIndex
  const activeOptionId = effectiveActiveIndex >= 0 && status === 'success' ? optionId(effectiveActiveIndex) : undefined

  function handleSelect(city: City) {
    setQuery('')
    setSelectedCity(city)
    setIsOpen(false)
    setActiveIndex(-1)
    setBlurError(null)
    onSelect(city)
    skipNextBlurValidationRef.current = true
    inputRef.current?.blur()
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value
    setQuery(value)
    setIsOpen(true)
    setActiveIndex(-1)
    if (selectedCity && value !== formatCityLabel(selectedCity)) {
      setSelectedCity(null)
    }
    if (blurError) {
      setBlurError(null)
    }
  }

  function handleFocus() {
    if (trimmedQuery.length >= MIN_QUERY_LENGTH) {
      setIsOpen(true)
    }
  }

  function handleBlur() {
    setIsOpen(false)

    if (skipNextBlurValidationRef.current) {
      skipNextBlurValidationRef.current = false
      return
    }

    if (trimmedQuery.length === 0) {
      setBlurError('Enter a city name')
      return
    }

    if (!selectedCity) {
      setBlurError('Pick a city from the list so we get the right location')
      return
    }

    setBlurError(null)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setIsOpen(false)
      setActiveIndex(-1)
      return
    }

    if (status !== 'success' || cities.length === 0) {
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setIsOpen(true)
      setActiveIndex(effectiveActiveIndex === cities.length - 1 ? 0 : effectiveActiveIndex + 1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setIsOpen(true)
      setActiveIndex(effectiveActiveIndex <= 0 ? cities.length - 1 : effectiveActiveIndex - 1)
    } else if (event.key === 'Enter' && effectiveActiveIndex >= 0) {
      event.preventDefault()
      const city = cities[effectiveActiveIndex]
      if (city) {
        handleSelect(city)
      }
    }
  }

  return (
    <div className="citySearch">
      <label htmlFor={inputId} className="citySearch__label">
        {label}
      </label>

      <input
        ref={inputRef}
        id={inputId}
        type="text"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        aria-autocomplete="list"
        aria-activedescendant={activeOptionId}
        aria-invalid={blurError ? true : undefined}
        aria-describedby={blurError ? errorId : undefined}
        className={blurError ? 'citySearch__input citySearch__input--invalid' : 'citySearch__input'}
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />

      {showPanel && (
        <div className="citySearch__panel">
          {status === 'loading' && (
            <p className="citySearch__status" role="status">
              <span className="citySearch__spinner" aria-hidden="true" />
              Searching…
            </p>
          )}

          {status === 'empty' && (
            <p className="citySearch__status" role="status">
              {`No cities match '${trimmedQuery}' — check the spelling or try a bigger nearby city.`}
            </p>
          )}

          {status === 'error' && error && (
            <div className="citySearch__status citySearch__status--error" role="alert">
              <p className="citySearch__statusText">
                {error.kind === 'rate_limit' ? 'Too many searches, wait a second.' : `${error.message} ${error.action}`}
              </p>
              <button
                type="button"
                className="citySearch__retryButton"
                onMouseDown={(event) => event.preventDefault()}
                onClick={retry}
              >
                Retry
              </button>
            </div>
          )}

          {status === 'success' && (
            <ul id={listboxId} role="listbox" aria-label="City suggestions" className="citySearch__listbox">
              {cities.map((city, index) => (
                <li
                  key={city.id}
                  id={optionId(index)}
                  role="option"
                  aria-selected={index === effectiveActiveIndex}
                  className={
                    index === effectiveActiveIndex
                      ? 'citySearch__option citySearch__option--active'
                      : 'citySearch__option'
                  }
                  onMouseDown={(event) => {
                    event.preventDefault()
                    handleSelect(city)
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <span className="citySearch__flag" aria-hidden="true">
                    {countryCodeToFlagEmoji(city.countryCode)}
                  </span>
                  <span className="citySearch__cityInfo">
                    <span className="citySearch__cityName">{city.name}</span>
                    <span className="citySearch__cityMeta">
                      {city.region ? `${city.region}, ` : ''}
                      {city.country}
                    </span>
                  </span>
                  <span className="citySearch__countryCode">{city.countryCode}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {blurError && (
        <p id={errorId} className="citySearch__error" role="alert">
          {blurError}
        </p>
      )}
    </div>
  )
}
