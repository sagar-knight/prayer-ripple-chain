import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, HandHeart, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import ReminderBellButton from "./ReminderBellButton";

interface CarriedPrayer {
  prayerId: string;
  title: string;
  category: string | null;
  timesYouPrayed: number;
  totalPraying: number;
  status: string;
  lastPrayedByYou: Date | null;
  slug: string | null;
}

const PrayersYouAreCarrying = () => {
  const { user } = useAuth();

  const { data: carried, isLoading } = useQuery({
    queryKey: ["prayers_you_are_carrying", user?.id],
    queryFn: async (): Promise<CarriedPrayer[]> => {
      if (!user) return [];

      // All "prayed" actions by this user on others' prayers
      const { data: actions } = await supabase
        .from("prayer_actions")
        .select("prayer_id, source_type, created_at")
        .eq("user_id", user.id)
        .eq("action_type", "prayed")
        .eq("source_type", "global");

      if (!actions?.length) return [];

      // Group by prayer_id
      const byPrayer = new Map<string, { count: number; last: Date }>();
      for (const a of actions) {
        const id = a.prayer_id as string;
        const ts = new Date(a.created_at as any);
        const cur = byPrayer.get(id);
        if (cur) {
          cur.count++;
          if (ts > cur.last) cur.last = ts;
        } else {
          byPrayer.set(id, { count: 1, last: ts });
        }
      }

      const ids = Array.from(byPrayer.keys());

      // Fetch the prayer requests (exclude your own)
      const { data: prayers } = await supabase
        .from("global_prayer_requests")
        .select("id, title, category, status, prayer_count, slug, created_by")
        .in("id", ids);

      return (prayers || [])
        .filter((p) => p.created_by !== user.id)
        .map((p) => {
          const meta = byPrayer.get(p.id)!;
          return {
            prayerId: p.id,
            title: p.title,
            category: p.category,
            timesYouPrayed: meta.count,
            totalPraying: p.prayer_count ?? 0,
            status: p.status,
            lastPrayedByYou: meta.last,
            slug: p.slug,
          };
        })
        .sort((a, b) => (b.lastPrayedByYou?.getTime() ?? 0) - (a.lastPrayedByYou?.getTime() ?? 0))
        .slice(0, 12);
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!carried?.length) {
    return (
      <Card className="card-glass border-0">
        <CardContent className="p-6 text-center space-y-2">
          <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <HandHeart className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground">Prayers you're carrying</p>
          <p className="text-xs text-muted-foreground">
            When you pray for others, those requests will appear here with their live counts.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-glass border border-border/40">
      <CardContent className="p-5 sm:p-6 space-y-4">
        <div>
          <h3 className="font-playfair text-xl sm:text-2xl font-semibold text-foreground flex items-center gap-2">
            <HandHeart className="h-5 w-5 text-primary" />
            Prayers you're carrying
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Requests from others that you've prayed for, with how many are praying alongside you.
          </p>
        </div>

        <div className="space-y-2">
          {carried.map((p) => {
            const inner = (
              <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border/60 bg-card/50 hover:bg-card transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    {p.category && (
                      <Badge variant="outline" className="text-[10px] py-0 h-5">
                        {p.category}
                      </Badge>
                    )}
                    <span className="text-[11px] text-muted-foreground">
                      You prayed {p.timesYouPrayed}{" "}
                      {p.timesYouPrayed === 1 ? "time" : "times"}
                    </span>
                  </div>
                </div>
                <div
                  className="shrink-0 flex items-center gap-2"
                  onClick={(e) => e.preventDefault()}
                >
                  <ReminderBellButton
                    prayerId={p.prayerId}
                    prayerTitle={p.title}
                    size="icon"
                  />
                  <div className="text-right">
                  <div className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
                    <Heart className="h-3.5 w-3.5 text-primary" />
                    {p.totalPraying}
                  </div>
                  <p className="text-[10px] text-muted-foreground">praying</p>
                  </div>
                </div>
              </div>
            );
            return p.slug ? (
              <Link key={p.prayerId} to={`/p/${p.slug}`} className="block">
                {inner}
              </Link>
            ) : (
              <div key={p.prayerId}>{inner}</div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default PrayersYouAreCarrying;