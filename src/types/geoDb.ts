/** Raw shapes returned by the GeoDB Cities API (RapidAPI). */
export interface GeoDbCityRaw {
  id: number
  name: string
  country: string
  countryCode: string
  region: string
  latitude: number
  longitude: number
}

export interface GeoDbCitiesResponse {
  data: GeoDbCityRaw[]
}
