import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { requestBrowserLocation, savePrayerRippleLocation, savePrayerRippleCountryFallback } from "@/lib/prayerLocations";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prayerRequestId: string;
  sourceType?: "global" | "church" | "family";
  onShared?: () => void;
}

/**
 * Optional, post-prayer prompt to share an approximate location.
 * Skipping or denying must never affect the prayer count or any
 * other existing prayer behavior.
 */
const PrayerLocationPrompt = ({ open, onOpenChange, prayerRequestId, sourceType = "global", onShared }: Props) => {
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    setBusy(true);
    try {
      const exact = await requestBrowserLocation();
      // PRIVACY: savePrayerRippleLocation coarsens exact coords before saving.
      await savePrayerRippleLocation(prayerRequestId, exact, { source_type: sourceType });
      toast({ title: "Your city was added to the prayer map." });
      onShared?.();
      onOpenChange(false);
    } catch (err: any) {
      const code = err?.code ?? err?.message;
      if (code === 1 || code === "PERMISSION_DENIED") {
        // Silent country-only fallback so the map still lights up.
        const ok = await savePrayerRippleCountryFallback(prayerRequestId, sourceType);
        if (ok) onShared?.();
        toast({ title: "That's okay", description: "Your prayer was still counted." });
      } else if (code === "unavailable") {
        const ok = await savePrayerRippleCountryFallback(prayerRequestId, sourceType);
        if (ok) onShared?.();
        toast({ title: "Location sharing is not available on this device." });
      } else if (code === "not_authenticated") {
        toast({ title: "Sign in to share your prayer location." });
      } else {
        const ok = await savePrayerRippleCountryFallback(prayerRequestId, sourceType);
        if (ok) onShared?.();
        toast({ title: "We couldn't save your location.", description: "Your prayer was still counted." });
      }
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  const handleNotNow = async () => {
    // Silent country-only fallback so the map still shows a pin for this prayer.
    onOpenChange(false);
    const ok = await savePrayerRippleCountryFallback(prayerRequestId, sourceType);
    if (ok) onShared?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-serif">
            <MapPin className="h-5 w-5 text-primary" />
            Share your city?
          </DialogTitle>
          <DialogDescription>
            Add your city to the prayer map so others can see where prayers are coming from.
          </DialogDescription>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">
          Only your city is stored. Your street, address, and exact GPS are never saved or shown.
        </p>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={handleNotNow} disabled={busy}>
            Not now
          </Button>
          <Button onClick={handleShare} disabled={busy} className="gap-2">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
            Share my city
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrayerLocationPrompt;