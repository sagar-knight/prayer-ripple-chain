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
  let sub: string;

  if (answered) {
    main = `${totalCount} ${totalCount === 1 ? "prayer" : "prayers"} offered`;
    sub = "God answered. Share your testimony to encourage others.";
  } else if (isLive && totalCount > 0) {
    main = `${activeCount} praying with you`;
    sub = `${totalCount} ${totalCount === 1 ? "prayer" : "prayers"} offered`;
  } else if (isLive) {
    main = "Someone is praying now";
    sub = "You’re being prayed for";
  } else if (totalCount > 0) {
    main = `${totalCount} ${totalCount === 1 ? "prayer" : "prayers"} offered`;
    sub = "People have prayed for this";
  } else {
    main = "Your request has been shared";
    sub = "People will pray for you soon";
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-primary/25 bg-card/60 px-4 py-3 shadow-[0_0_18px_-6px_hsl(var(--primary)/0.4)] backdrop-blur-sm">
      <div className="flex items-center gap-2 shrink-0">
        <Globe className="h-4 w-4 text-primary" />
        {isLive && (
          <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/70" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{main}</p>
        <p className="truncate text-xs text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
};

export default LivePrayerRipple;