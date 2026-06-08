import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import WorldRippleMap, { CountryStat } from "@/components/WorldRippleMap";
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prayerId: string;
  sourceType?: "global" | "church";
  originCountryCode?: string | null;
}

const PrayerLocationsSheet = ({ open, onOpenChange, prayerId, sourceType = "global", originCountryCode }: Props) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CountryStat[]>([]);

  useEffect(() => {
    if (!open || !prayerId) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data: rows, error } = await (supabase as any).rpc("get_prayer_geography", {
        _prayer_id: prayerId,
        _source_type: sourceType,
      });
      if (cancelled) return;
      if (!error && Array.isArray(rows)) {
        setData(rows as CountryStat[]);
      } else {
        setData([]);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, prayerId, sourceType]);

  const totalPeople = data.reduce((sum, d) => sum + (d.participants || 0), 0);
  const countryCount = data.filter((d) => d.country_code !== "XX").length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle className="font-serif text-xl">Where people are praying</SheetTitle>
          <SheetDescription>
            Locations are shown approximately, at the country level, to protect privacy.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {loading ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading map
            </div>
          ) : (
            <>
              <WorldRippleMap data={data} metric="participants" originCode={originCountryCode || undefined} />
              {data.length > 0 ? (
                <p className="text-sm text-muted-foreground text-center">
                  {totalPeople.toLocaleString()} {totalPeople === 1 ? "person" : "people"} praying
                  {countryCount > 0 && (
                    <> from {countryCount} {countryCount === 1 ? "country" : "countries"}</>
                  )}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground text-center">
                  Be the first to pray. When people share their location while praying, lights will appear here.
                </p>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PrayerLocationsSheet;