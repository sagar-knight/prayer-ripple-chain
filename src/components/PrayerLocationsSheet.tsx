import { useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Loader2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SharePrayerDialog from "@/components/SharePrayerDialog";
import { supabase } from "@/integrations/supabase/client";
import WorldRippleMap, { type CountryStat } from "@/components/WorldRippleMap";
import PrayerRippleStats from "@/components/PrayerRippleStats";
import { countries as countryDirectory } from "@/data/countries";
import { useUserCountry } from "@/hooks/useUserCountry";
import {
  computeStats,
  getPrayerRippleLocations,
  getShareCount,
  savePrayerRippleCountryFallback,
  topCountries,
  topCities,
  flagFor,
  type RippleLocationRow,
} from "@/lib/prayerLocations";

const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  USA: "US",
  US: "US",
  "United States": "US",
  UK: "GB",
  "United Kingdom": "GB",
  Korea: "KR",
  "South Korea": "KR",
};

function codeForCountry(country: string) {
  return COUNTRY_NAME_TO_CODE[country] ?? countryDirectory.find((c) => c.name === country)?.code ?? null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Accepts both prop names so any existing callsite keeps working. */
  prayerId?: string;
  prayerRequestId?: string;
  sourceType?: "global" | "church" | "family";
  originCountryCode?: string | null;
  /** Total prayers from the prayer request (for ripple summary). */
  prayerCount?: number;
  /** Optional title used by the share dialog. */
  prayerTitle?: string;
}

/**
 * Bottom-sheet that shows approximate prayer locations on a Mapbox map.
 * Replaces the legacy Leaflet-based locations sheet.
 */
const PrayerLocationsSheet = ({
  open,
  onOpenChange,
  prayerId,
  prayerRequestId,
  sourceType = "global",
  prayerCount = 0,
  prayerTitle,
}: Props) => {
  const id = prayerRequestId ?? prayerId ?? "";
  const [locations, setLocations] = useState<RippleLocationRow[]>([]);
  const [shareCount, setShareCount] = useState(0);
  const [actionCountries, setActionCountries] = useState<CountryStat[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const { countryCode: myCountryCode, countryName: myCountryName } = useUserCountry();

  useEffect(() => {
    if (!open || !id) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    Promise.all([
      getPrayerRippleLocations(id),
      getShareCount(id, sourceType),
      (supabase as any)
        .from("prayer_actions")
        .select("action_type, prayer_country_code, prayer_country_name")
        .eq("prayer_id", id)
        .eq("source_type", sourceType),
    ])
      .then(async ([rows, shares, actionsRes]) => {
        if (cancelled) return;
        let resolvedRows = rows;
        if (rows.length === 0 && prayerCount > 0) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { count } = await (supabase as any)
              .from("prayer_actions")
              .select("id", { count: "exact", head: true })
              .eq("prayer_id", id)
              .eq("source_type", sourceType)
              .eq("user_id", user.id)
              .eq("action_type", "prayed");
            if ((count ?? 0) > 0) {
              const saved = await savePrayerRippleCountryFallback(id, sourceType);
              if (saved) resolvedRows = await getPrayerRippleLocations(id);
            }
          }
        }
        if (cancelled) return;
        setLocations(resolvedRows);
        setShareCount(shares);
        // Build country stats from prayer_actions (same source the Ripple page uses).
        const map = new Map<string, CountryStat>();
        const actions = (actionsRes as any)?.data || [];
        for (const a of actions) {
          const code = a.prayer_country_code;
          if (!code) continue;
          const existing = map.get(code) || {
            country_code: code,
            country: a.prayer_country_name || code,
            prayers: 0,
            forwards: 0,
            participants: 0,
          };
          if (a.action_type === "prayed") existing.prayers = (existing.prayers || 0) + 1;
          if (a.action_type === "shared" || a.action_type === "forwarded")
            existing.forwards = (existing.forwards || 0) + 1;
          map.set(code, existing);
        }
        setActionCountries(Array.from(map.values()));
      })
      .catch(() => {
        if (!cancelled) setLoadError("load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, id, sourceType, prayerCount]);

  const stats = useMemo(() => computeStats(locations), [locations]);
  const countries = useMemo(() => topCountries(locations, 10), [locations]);
  const cities = useMemo(() => topCities(locations, 6), [locations]);
  const mapData = useMemo<CountryStat[]>(() => {
    // Merge: action-derived country stats (primary) + ripple_locations fallback.
    const merged = new Map<string, CountryStat>();
    for (const c of actionCountries) merged.set(c.country_code.toUpperCase(), { ...c });
    for (const c of countries) {
      const code = codeForCountry(c.country);
      if (!code) continue;
      const key = code.toUpperCase();
      const existing = merged.get(key);
      if (existing) {
        existing.prayers = Math.max(existing.prayers || 0, c.count);
        existing.participants = Math.max(existing.participants || 0, c.count);
      } else {
        merged.set(key, {
          country_code: code,
          country: c.country,
          prayers: c.count,
          participants: c.count,
        });
      }
    }
    // Final fallback: if still empty but we know prayer count > 0, show viewer's country.
    if (merged.size === 0 && prayerCount > 0 && myCountryCode) {
      merged.set(myCountryCode.toUpperCase(), {
        country_code: myCountryCode,
        country: myCountryName || myCountryCode,
        prayers: prayerCount,
        participants: prayerCount,
      });
    }
    return Array.from(merged.values());
  }, [actionCountries, countries, prayerCount, myCountryCode, myCountryName]);

  const totalCountries = Math.max(stats.countries, mapData.length);
  const totalPrayers = Math.max(prayerCount, stats.total, mapData.reduce((s, c) => s + (c.prayers || 0), 0));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[90vh] sm:max-w-2xl sm:mx-auto rounded-t-2xl p-0 overflow-hidden"
      >
        <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-muted-foreground/30" aria-hidden />
        <div className="px-5 pt-3 pb-4 space-y-4 overflow-y-auto max-h-[calc(90vh-1.5rem)]">
          <SheetHeader className="text-left space-y-1">
            <SheetTitle className="font-serif text-xl">Where people are praying</SheetTitle>
            <SheetDescription>
              See the approximate places where people joined this prayer.
            </SheetDescription>
          </SheetHeader>

          <PrayerRippleStats
            prayers={totalPrayers}
            countries={totalCountries}
            shares={shareCount}
          />

          <div className="w-full rounded-xl border bg-muted/30 overflow-hidden relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading prayer locations...
              </div>
            ) : loadError ? (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground p-6 text-center">
                We couldn't load prayer locations right now.
              </div>
            ) : (
              <WorldRippleMap
                data={mapData}
                metric="prayers"
                emptyMessage="Prayer locations are saved. The world map will light up as countries are identified."
              />
            )}
          </div>

          {(countries.length > 0 || cities.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {countries.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground/70">
                    Top Countries
                  </p>
                  <ul className="divide-y divide-border/60 rounded-xl border bg-card/40">
                    {countries.slice(0, 6).map((c) => (
                      <li key={c.country} className="flex items-center justify-between px-3 py-2 text-sm">
                        <span className="flex items-center gap-2 min-w-0">
                          <span aria-hidden>{flagFor(c.country)}</span>
                          <span className="truncate">{c.country}</span>
                        </span>
                        <span className="tabular-nums text-muted-foreground shrink-0">{c.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {cities.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground/70">
                    Top Cities
                  </p>
                  <ul className="divide-y divide-border/60 rounded-xl border bg-card/40">
                    {cities.slice(0, 6).map((c) => (
                      <li
                        key={`${c.city}-${c.country ?? ""}`}
                        className="flex items-center justify-between px-3 py-2 text-sm"
                      >
                        <span className="min-w-0 truncate">
                          {c.city}
                          {c.country ? <span className="text-muted-foreground">, {c.country}</span> : null}
                        </span>
                        <span className="tabular-nums text-muted-foreground shrink-0">{c.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {shareCount === 0 && locations.length === 0 && (
            <div className="flex flex-col items-center gap-2 pt-1">
              <p className="text-xs text-muted-foreground italic">
                Share this prayer to start the ripple.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setShowShare(true)}
                disabled={!id}
              >
                <Share2 className="h-4 w-4" />
                Share prayer
              </Button>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            Only users who share their location when praying will appear on the map. Locations are shown approximately for privacy.
          </p>
        </div>
      </SheetContent>
      {id && (
        <SharePrayerDialog
          open={showShare}
          onOpenChange={setShowShare}
          prayerId={id}
          prayerTitle={prayerTitle}
        />
      )}
    </Sheet>
  );
};

export default PrayerLocationsSheet;