import './SegmentedToggle.css'

interface SegmentedToggleOption<T extends string> {
  value: T
  label: string
}

interface SegmentedToggleProps<T extends string> {
  label: string
  options: SegmentedToggleOption<T>[]
  value: T
  onChange: (value: T) => void
}

export function SegmentedToggle<T extends string>({ label, options, value, onChange }: SegmentedToggleProps<T>) {
  return (
    <div className="segmentedToggle" role="radiogroup" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          className={
            value === option.value
              ? 'segmentedToggle__option segmentedToggle__option--active'
              : 'segmentedToggle__option'
          }
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
