const REGIONAL_INDICATOR_OFFSET = 127397

/** Converts an ISO 3166-1 alpha-2 country code (e.g. "US") to its flag emoji. */
export function countryCodeToFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => REGIONAL_INDICATOR_OFFSET + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}
