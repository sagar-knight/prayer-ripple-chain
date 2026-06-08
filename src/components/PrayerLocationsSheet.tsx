import { useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Loader2 } from "lucide-react";
import PrayerRippleMap from "@/components/PrayerRippleMap";
import PrayerRippleStats from "@/components/PrayerRippleStats";
import { useMapboxToken } from "@/hooks/useMapboxToken";
import {
  computeStats,
  getPrayerRippleLocations,
  type RippleLocationRow,
} from "@/lib/prayerLocations";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Accepts both prop names so any existing callsite keeps working. */
  prayerId?: string;
  prayerRequestId?: string;
  sourceType?: "global" | "church" | "family";
  originCountryCode?: string | null;
}

/**
 * Bottom-sheet that shows approximate prayer locations on a Mapbox map.
 * Replaces the legacy Leaflet-based locations sheet.
 */
const PrayerLocationsSheet = ({ open, onOpenChange, prayerId, prayerRequestId }: Props) => {
  const id = prayerRequestId ?? prayerId ?? "";
  const { token, loading: tokenLoading, error: tokenError } = useMapboxToken();
  const [locations, setLocations] = useState<RippleLocationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !id) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    getPrayerRippleLocations(id)
      .then((rows) => {
        if (!cancelled) setLocations(rows);
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
  }, [open, id]);

  const stats = useMemo(() => computeStats(locations), [locations]);

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

          {stats.total > 0 && <PrayerRippleStats stats={stats} />}

          <div className="h-[55vh] min-h-[320px] w-full rounded-xl border bg-muted/30 overflow-hidden relative">
            {tokenLoading || loading ? (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading prayer locations...
              </div>
            ) : tokenError || !token ? (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground p-6 text-center">
                Map is unavailable right now.
              </div>
            ) : loadError ? (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground p-6 text-center">
                We couldn't load prayer locations right now.
              </div>
            ) : locations.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground p-6 text-center">
                No prayer locations yet. Be the first to pray and share your approximate location.
              </div>
            ) : (
              <PrayerRippleMap token={token} locations={locations} />
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            Only users who share their location when praying will appear on the map. Locations are shown approximately for privacy.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PrayerLocationsSheet;