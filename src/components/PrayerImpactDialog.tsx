import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Share2, Heart, Globe2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PrayerImpactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prayerId: string;
  prayerCount: number;
  onPrayAnother: () => void;
  onShare: () => void;
}

/**
 * Lightweight, emotional confirmation shown immediately after a user prays.
 * Shows: Thank you + how many people are praying + countries reached (if any),
 * with two clear next steps: pray for another, or share this prayer.
 */
const PrayerImpactDialog = ({
  open,
  onOpenChange,
  prayerId,
  prayerCount,
  onPrayAnother,
  onShare,
}: PrayerImpactDialogProps) => {
  const [countryCount, setCountryCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !prayerId) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const { data } = await supabase
          .from("prayer_actions" as any)
          .select("prayer_country_code")
          .eq("prayer_id", prayerId)
          .not("prayer_country_code", "is", null);
        if (cancelled) return;
        const set = new Set(((data || []) as any[]).map((a) => a.prayer_country_code));
        setCountryCount(set.size);
      } catch {
        if (!cancelled) setCountryCount(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, prayerId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-playfair text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Thank you for praying
          </DialogTitle>
          <DialogDescription>
            Your prayer joined a quiet wave of people lifting up this request.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border bg-accent/20 p-5 space-y-3 animate-gentle-fade">
          <div className="flex items-center gap-2 text-foreground">
            <Heart className="h-5 w-5 text-primary" />
            <p className="text-base">
              You joined{" "}
              <span className="font-semibold">{prayerCount}</span>{" "}
              {prayerCount === 1 ? "person" : "people"} praying for this request.
            </p>
          </div>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Counting reach...
            </div>
          ) : countryCount !== null && countryCount > 0 ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe2 className="h-4 w-4 text-primary" />
              This prayer has reached {countryCount}{" "}
              {countryCount === 1 ? "country" : "countries"}.
            </div>
          ) : null}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            variant="peaceful"
            className="flex-1 gap-2"
            onClick={onPrayAnother}
          >
            <Sparkles className="h-4 w-4" />
            Pray for another request
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={onShare}
          >
            <Share2 className="h-4 w-4" />
            Share this prayer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrayerImpactDialog;