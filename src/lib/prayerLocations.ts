/**
 * Prayer ripple location helpers.
 *
 * PRIVACY: We never store or transmit a user's exact GPS coordinates.
 * `toApproximate()` rounds the browser-provided lat/lng to ~11 km
 * precision (1 decimal place) and applies a small random jitter so
 * markers never sit on a real address. All persistence goes through
 * `savePrayerRippleLocation()` which only writes the approximated
 * values to the database.
 */
import { supabase } from "@/integrations/supabase/client";
import { fetchIpCountry, reverseGeocodeToCity } from "@/lib/ipGeolocation";

export interface ApproxLocation {
  approximate_lat: number;
  approximate_lng: number;
  country?: string | null;
  region?: string | null;
  city?: string | null;
}

export interface RippleLocationRow {
  id: string;
  prayer_request_id: string;
  approximate_lat: number;
  approximate_lng: number;
  country: string | null;
  region: string | null;
  city: string | null;
  created_at: string;
}

const LS_KEY = (prayerId: string) => `pf:ripple-location:${prayerId}`;

/** Reduce precision of a coordinate for privacy. */
export function toApproximate(lat: number, lng: number): { lat: number; lng: number } {
  // PRIVACY: round to city-scale precision (1 decimal ≈ a city neighborhood)
  // and add tiny jitter so points never sit on a real address or snap to a
  // perfect grid that could re-identify users.
  const round = (n: number) => Math.round(n * 10) / 10;
  const jitter = () => (Math.random() - 0.5) * 0.05;
  return { lat: round(lat) + jitter(), lng: round(lng) + jitter() };
}

export async function getPrayerRippleLocations(prayerRequestId: string): Promise<RippleLocationRow[]> {
  const { data, error } = await (supabase as any)
    .from("prayer_ripple_locations")
    .select("id, prayer_request_id, approximate_lat, approximate_lng, country, region, city, created_at")
    .eq("prayer_request_id", prayerRequestId)
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) throw error;
  return (data ?? []) as RippleLocationRow[];
}

export interface RippleStats {
  total: number;
  countries: number;
  regions: number;
}

export function computeStats(rows: RippleLocationRow[]): RippleStats {
  const countries = new Set<string>();
  const regions = new Set<string>();
  for (const r of rows) {
    if (r.country) countries.add(r.country);
    if (r.region) regions.add(`${r.country ?? ""}|${r.region}`);
  }
  return { total: rows.length, countries: countries.size, regions: regions.size };
}

export interface CountryTally {
  country: string;
  count: number;
}
export interface CityTally {
  city: string;
  country: string | null;
  count: number;
}

export function topCountries(rows: RippleLocationRow[], limit = 10): CountryTally[] {
  const map = new Map<string, number>();
  for (const r of rows) {
    if (!r.country) continue;
    map.set(r.country, (map.get(r.country) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function topCities(rows: RippleLocationRow[], limit = 6): CityTally[] {
  const map = new Map<string, { count: number; country: string | null }>();
  for (const r of rows) {
    if (!r.city) continue;
    const key = r.city;
    const existing = map.get(key);
    if (existing) existing.count += 1;
    else map.set(key, { count: 1, country: r.country });
  }
  return Array.from(map.entries())
    .map(([city, v]) => ({ city, country: v.country, count: v.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** Best-effort country-name → flag emoji for common countries.
 *  Falls back to 🌐 when unknown so the UI always renders something. */
const COUNTRY_FLAGS: Record<string, string> = {
  "United States": "🇺🇸", USA: "🇺🇸", US: "🇺🇸",
  India: "🇮🇳", Canada: "🇨🇦",
  "United Kingdom": "🇬🇧", UK: "🇬🇧",
  Australia: "🇦🇺", Nigeria: "🇳🇬", Kenya: "🇰🇪",
  Germany: "🇩🇪", France: "🇫🇷", Brazil: "🇧🇷",
  Mexico: "🇲🇽", "South Africa": "🇿🇦", Philippines: "🇵🇭",
  Indonesia: "🇮🇩", Japan: "🇯🇵", China: "🇨🇳", Korea: "🇰🇷",
  Italy: "🇮🇹", Spain: "🇪🇸", Netherlands: "🇳🇱",
  Sweden: "🇸🇪", Norway: "🇳🇴", Denmark: "🇩🇰",
  Ireland: "🇮🇪", "New Zealand": "🇳🇿", Singapore: "🇸🇬",
  Ghana: "🇬🇭", Uganda: "🇺🇬", Pakistan: "🇵🇰",
};
export function flagFor(country: string | null | undefined): string {
  if (!country) return "🌐";
  return COUNTRY_FLAGS[country] ?? "🌐";
}

export async function getShareCount(
  prayerId: string,
  sourceType: "global" | "church" | "family" = "global",
): Promise<number> {
  const { count, error } = await (supabase as any)
    .from("prayer_actions")
    .select("id", { count: "exact", head: true })
    .eq("prayer_id", prayerId)
    .eq("source_type", sourceType)
    .eq("action_type", "shared");
  if (error) return 0;
  return count ?? 0;
}

export function hasLocallySharedLocation(prayerId: string): boolean {
  try {
    return !!localStorage.getItem(LS_KEY(prayerId));
  } catch {
    return false;
  }
}

function markLocallyShared(prayerId: string) {
  try {
    localStorage.setItem(LS_KEY(prayerId), String(Date.now()));
  } catch {
    /* ignore */
  }
}

/**
 * Save an approximate prayer location for the signed-in user.
 * Accepts the browser's exact coordinates internally and converts to
 * approximate values before writing. Throws if the user is not signed in.
 */
export async function savePrayerRippleLocation(
  prayerRequestId: string,
  exact: { lat: number; lng: number },
  meta: { source_type?: "global" | "church" | "family"; country?: string; region?: string; city?: string } = {},
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("not_authenticated");
  }

  // PRIVACY: resolve the exact coords to a *city only* (street/house data
  // is discarded) and persist a city-scale approximate point. Exact GPS is
  // never written to the database.
  let city = meta.city ?? null;
  let region = meta.region ?? null;
  let country = meta.country ?? null;
  if (!city || !country) {
    const geo = await reverseGeocodeToCity(exact.lat, exact.lng);
    if (geo) {
      city = city ?? geo.city;
      region = region ?? geo.region;
      country = country ?? geo.country;
    }
  }
  const approx = toApproximate(exact.lat, exact.lng);

  const payload = {
    prayer_request_id: prayerRequestId,
    user_id: user.id,
    approximate_lat: approx.lat,
    approximate_lng: approx.lng,
    source_type: meta.source_type ?? "global",
    source: "prayer",
    country,
    region,
    city,
  };

  const { error } = await (supabase as any)
    .from("prayer_ripple_locations")
    .upsert(payload, { onConflict: "prayer_request_id,user_id" });

  if (error) throw error;
  markLocallyShared(prayerRequestId);
}

/** Wraps navigator.geolocation in a promise with a sane timeout. */
export function requestBrowserLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("unavailable"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
    );
  });
}

/**
 * Best-effort country-only fallback when the user declines precise location.
 * Uses an IP lookup to resolve the country and writes a country-centroid pin.
 * Silent: returns false on any failure (auth, network, already-shared).
 */
export async function savePrayerRippleCountryFallback(
  prayerRequestId: string,
  sourceType: "global" | "church" | "family" = "global",
): Promise<boolean> {
  try {
    if (hasLocallySharedLocation(prayerRequestId)) return false;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const info = await fetchIpCountry();
    if (!info) return false;

    // Country-centroid pin: jitter slightly so multiple users in the same
    // country don't stack on a single pixel.
    const jitter = () => (Math.random() - 0.5) * 0.8;
    const payload = {
      prayer_request_id: prayerRequestId,
      user_id: user.id,
      approximate_lat: info.lat + jitter(),
      approximate_lng: info.lng + jitter(),
      source_type: sourceType,
      source: "ip_country",
      country: info.country_name,
      region: null,
      city: null,
    };
    const { error } = await (supabase as any)
      .from("prayer_ripple_locations")
      .upsert(payload, { onConflict: "prayer_request_id,user_id" });
    if (error) return false;
    markLocallyShared(prayerRequestId);
    return true;
  } catch {
    return false;
  }
}