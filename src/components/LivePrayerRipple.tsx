import { Globe } from "lucide-react";

interface LivePrayerRippleProps {
  /** People actively praying right now. Pass 0 when no live data is available. */
  activeCount?: number;
  /** Total prayers offered over time (historical). */
  totalCount: number;
  /** Whether this prayer has been answered. */
  answered?: boolean;
}

/**
 * Compact "Live Prayer Ripple" strip.
 *
 * Wording rules:
 * - "praying" is only ever used for live/active activity (activeCount > 0).
 * - "prayed" / "prayers offered" is only used for history/total metrics.
 *
 * Fallback safety: if no active/live data exists we never claim someone is
 * "praying now" — we fall back to historical wording instead.
 */
const LivePrayerRipple = ({
  activeCount = 0,
  totalCount,
  answered = false,
}: LivePrayerRippleProps) => {
  const isLive = activeCount > 0;

  let main: string;
  let sub: string | null;

  if (answered) {
    main = `${totalCount} ${totalCount === 1 ? "prayer" : "prayers"} offered`;
    sub = "God answered. Share your testimony to encourage others.";
  } else if (isLive && totalCount > 0) {
    main = `${activeCount} praying with you now`;
    sub = `${totalCount} ${totalCount === 1 ? "prayer" : "prayers"} offered`;
  } else if (isLive) {
    main = "Someone is praying now";
    sub = null;
  } else if (totalCount > 0) {
    main = `${totalCount} ${totalCount === 1 ? "prayer" : "prayers"} offered`;
    sub = null;
  } else {
    main = "Your request has been shared";
    sub = "People will pray for you soon";
  }

  return (
    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
      <div className="relative flex items-center justify-center shrink-0">
        <Globe className="h-4 w-4 text-primary/80" />
        {isLive && (
          <span
            className="absolute -right-1 -top-1 flex h-2 w-2"
            aria-hidden="true"
          >
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
        )}
      </div>
      <p className="truncate">
        <span className="font-medium text-foreground">{main}</span>
        {sub && <span className="text-muted-foreground"> · {sub}</span>}
      </p>
    </div>
  );
};

export default LivePrayerRipple;