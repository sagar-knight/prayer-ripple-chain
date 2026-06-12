/**
 * IP-based country fallback for prayer ripple locations.
 *
 * PRIVACY: We only resolve a coarse country (and use a country centroid
 * for the map pin). We never store the user's IP address or any sub-country
 * location data derived from it.
 */

// Rough centroid (lat, lng) for common countries. Falls back to a generic
// point if unknown so we never write null coordinates.
const COUNTRY_CENTROIDS: Record<string, { lat: number; lng: number; name: string }> = {
  US: { lat: 39.8, lng: -98.5, name: "United States" },
  CA: { lat: 56.1, lng: -106.3, name: "Canada" },
  MX: { lat: 23.6, lng: -102.5, name: "Mexico" },
  BR: { lat: -14.2, lng: -51.9, name: "Brazil" },
  AR: { lat: -38.4, lng: -63.6, name: "Argentina" },
  GB: { lat: 54.0, lng: -2.0, name: "United Kingdom" },
  IE: { lat: 53.4, lng: -8.2, name: "Ireland" },
  FR: { lat: 46.6, lng: 1.9, name: "France" },
  DE: { lat: 51.2, lng: 10.4, name: "Germany" },
  ES: { lat: 40.5, lng: -3.7, name: "Spain" },
  IT: { lat: 41.9, lng: 12.6, name: "Italy" },
  NL: { lat: 52.1, lng: 5.3, name: "Netherlands" },
  SE: { lat: 60.1, lng: 18.6, name: "Sweden" },
  NO: { lat: 60.5, lng: 8.5, name: "Norway" },
  DK: { lat: 56.3, lng: 9.5, name: "Denmark" },
  PL: { lat: 51.9, lng: 19.1, name: "Poland" },
  IN: { lat: 20.6, lng: 78.9, name: "India" },
  PK: { lat: 30.4, lng: 69.3, name: "Pakistan" },
  CN: { lat: 35.9, lng: 104.2, name: "China" },
  JP: { lat: 36.2, lng: 138.3, name: "Japan" },
  KR: { lat: 35.9, lng: 127.8, name: "Korea" },
  ID: { lat: -0.8, lng: 113.9, name: "Indonesia" },
  PH: { lat: 12.9, lng: 121.8, name: "Philippines" },
  SG: { lat: 1.4, lng: 103.8, name: "Singapore" },
  AU: { lat: -25.3, lng: 133.8, name: "Australia" },
  NZ: { lat: -40.9, lng: 174.9, name: "New Zealand" },
  NG: { lat: 9.1, lng: 8.7, name: "Nigeria" },
  KE: { lat: -0.0, lng: 37.9, name: "Kenya" },
  GH: { lat: 7.9, lng: -1.0, name: "Ghana" },
  UG: { lat: 1.4, lng: 32.3, name: "Uganda" },
  ZA: { lat: -30.6, lng: 22.9, name: "South Africa" },
  EG: { lat: 26.8, lng: 30.8, name: "Egypt" },
  AE: { lat: 23.4, lng: 53.8, name: "United Arab Emirates" },
  SA: { lat: 23.9, lng: 45.1, name: "Saudi Arabia" },
  TR: { lat: 38.9, lng: 35.2, name: "Turkey" },
};

export function getCountryCentroidByCode(code: string | null | undefined) {
  if (!code) return null;
  return COUNTRY_CENTROIDS[code.toUpperCase()] ?? null;
}

export interface IpCountryInfo {
  country_code: string;
  country_name: string;
  lat: number;
  lng: number;
}

/**
 * Fetch the visitor's country from a public IP lookup. Returns null on any
 * failure (no network, blocked by ad-blocker, etc.) so callers can degrade
 * silently. Times out after ~3s.
 */
export async function fetchIpCountry(): Promise<IpCountryInfo | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 3000);
    const res = await fetch("https://ipapi.co/json/", { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    const data = await res.json();
    const code = (data?.country_code || data?.country || "").toUpperCase();
    if (!code) return null;
    const centroid = getCountryCentroidByCode(code);
    return {
      country_code: code,
      country_name: data?.country_name || centroid?.name || code,
      lat: centroid?.lat ?? 0,
      lng: centroid?.lng ?? 0,
    };
  } catch {
    return null;
  }
}

export interface CityReverseGeocode {
  city: string | null;
  region: string | null;
  country: string | null;
}

/**
 * Reverse-geocode an exact lat/lng to a city name only.
 * Uses BigDataCloud's free client endpoint (no API key, no IP logging
 * tied to your account). We discard street-level fields entirely.
 * Returns null on any failure so callers degrade silently.
 */
export async function reverseGeocodeToCity(
  lat: number,
  lng: number,
): Promise<CityReverseGeocode | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 3000);
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    const data = await res.json();
    const city: string | null =
      data?.city || data?.locality || data?.localityInfo?.administrative?.[3]?.name || null;
    const region: string | null = data?.principalSubdivision || null;
    const country: string | null = data?.countryName || null;
    if (!city && !region && !country) return null;
    return { city, region, country };
  } catch {
    return null;
  }
}