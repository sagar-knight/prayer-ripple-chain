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
  // PRIVACY: round to 1 decimal (~11km) then add a small random jitter
  // so points don't snap to a perfect grid that could re-identify users.
  const round = (n: number) => Math.round(n * 10) / 10;
  const jitter = () => (Math.random() - 0.5) * 0.05; // ±~2.5km
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

  // PRIVACY: convert exact -> approximate before persisting.
  const approx = toApproximate(exact.lat, exact.lng);

  const payload = {
    prayer_request_id: prayerRequestId,
    user_id: user.id,
    approximate_lat: approx.lat,
    approximate_lng: approx.lng,
    source_type: meta.source_type ?? "global",
    source: "prayer",
    country: meta.country ?? null,
    region: meta.region ?? null,
    city: meta.city ?? null,
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