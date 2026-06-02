import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star, Users, Clock } from "lucide-react";

interface Stats {
  prayedToday: number;
  lastPrayedAt: Date | null;
  totalPrayers: number;
}

function timeAgo(date: Date): string {
  const sec = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} ${min === 1 ? "minute" : "minutes"} ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} ${hr === 1 ? "hour" : "hours"} ago`;
  const d = Math.floor(hr / 24);
  return `${d} ${d === 1 ? "day" : "days"} ago`;
}

/**
 * Lightweight, anonymous activity indicators sourced from public prayer_coverage
 * aggregates. Never exposes user identity. Shows a calm fallback when there is
 * no recent activity.
 */
const ActivityPulse = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const [todayRes, totalRes, lastRes] = await Promise.all([
          supabase
            .from("prayer_coverage")
            .select("current_prayers", { count: "exact", head: false })
            .eq("source_type", "global")
            .gte("last_prayed_at", since),
          supabase
            .from("prayer_coverage")
            .select("current_prayers")
            .eq("source_type", "global"),
          supabase
            .from("prayer_coverage")
            .select("last_prayed_at")
            .eq("source_type", "global")
            .not("last_prayed_at", "is", null)
            .order("last_prayed_at", { ascending: false })
            .limit(1),
        ]);

        if (cancelled) return;

        const prayedToday = (todayRes.data || []).reduce(
          (sum, r: any) => sum + (r.current_prayers || 0),
          0
        );
        const totalPrayers = (totalRes.data || []).reduce(
          (sum, r: any) => sum + (r.current_prayers || 0),
          0
        );
        const last = (lastRes.data?.[0] as any)?.last_prayed_at;
        setStats({
          prayedToday,
          totalPrayers,
          lastPrayedAt: last ? new Date(last) : null,
        });
      } catch {
        if (!cancelled) setStats({ prayedToday: 0, totalPrayers: 0, lastPrayedAt: null });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return null;

  const recent =
    stats?.lastPrayedAt &&
    Date.now() - stats.lastPrayedAt.getTime() < 6 * 60 * 60 * 1000;

  const items: { icon: typeof Star; label: string }[] = [];

  if (recent && stats?.lastPrayedAt) {
    items.push({
      icon: Star,
      label: `Someone prayed ${timeAgo(stats.lastPrayedAt)}`,
    });
  }

  if (stats && stats.prayedToday > 0) {
    items.push({
      icon: Users,
      label: `${stats.prayedToday} ${
        stats.prayedToday === 1 ? "prayer" : "prayers"
      } offered today`,
    });
  } else {
    // Calm, honest fallback (no fake numbers).
    items.push({
      icon: Clock,
      label: "A new day to begin praying together",
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div key={idx} className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <Icon className="h-3.5 w-3.5 text-primary" />
            <span>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityPulse;