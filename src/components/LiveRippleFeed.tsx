import { Card, CardContent } from "@/components/ui/card";
import { Heart, Share2, Globe2, Sparkles, Activity } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

type FeedItem = {
  id: string;
  type: "prayed" | "shared" | "country" | "church";
  message: string;
  at: Date;
};

const iconFor = (t: FeedItem["type"]) => {
  switch (t) {
    case "prayed":
      return <Heart className="h-4 w-4 text-primary" />;
    case "shared":
      return <Share2 className="h-4 w-4 text-accent" />;
    case "country":
      return <Globe2 className="h-4 w-4 text-success" />;
    case "church":
      return <Sparkles className="h-4 w-4 text-primary" />;
  }
};

const LiveRippleFeed = () => {
  const { user } = useAuth();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["live_ripple_feed", user?.id],
    queryFn: async (): Promise<FeedItem[]> => {
      if (!user) return [];
      const { data: requests } = await supabase
        .from("global_prayer_requests")
        .select("id, title")
        .eq("created_by", user.id);
      const ids = (requests || []).map((r) => r.id);
      if (!ids.length) return [];

      const { data: actions } = await supabase
        .from("prayer_actions")
        .select("id, action_type, prayer_country_name, created_at, prayer_id")
        .in("prayer_id", ids)
        .order("created_at", { ascending: false })
        .limit(15);

      const seenCountries = new Set<string>();
      const feed: FeedItem[] = [];
      for (const a of (actions || []) as any[]) {
        const at = new Date(a.created_at);
        if (a.action_type === "prayed") {
          feed.push({
            id: a.id,
            type: "prayed",
            message: "Someone prayed for your request",
            at,
          });
        } else if (a.action_type === "shared" || a.action_type === "forwarded") {
          feed.push({
            id: a.id,
            type: "shared",
            message: "Your prayer was forwarded",
            at,
          });
        }
        if (a.prayer_country_name && !seenCountries.has(a.prayer_country_name)) {
          seenCountries.add(a.prayer_country_name);
          feed.push({
            id: `${a.id}-country`,
            type: "country",
            message: `Your ripple reached ${a.prayer_country_name}`,
            at,
          });
        }
      }
      return feed
        .sort((a, b) => b.at.getTime() - a.at.getTime())
        .slice(0, 8);
    },
    enabled: !!user,
  });

  return (
    <section className="space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="font-playfair text-2xl sm:text-3xl font-semibold text-foreground flex items-center justify-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Live Ripple Feed
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5">
          Quiet moments of grace as your prayer travels.
        </p>
      </div>

      <Card className="card-glass border-0 max-w-md mx-auto">
        <CardContent className="py-5">
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Listening for activity...
            </p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6 italic">
              When someone prays for you, it will appear here.
            </p>
          ) : (
            <ul className="divide-y divide-border/40">
              {items.map((it) => (
                <li
                  key={it.id}
                  className="flex items-start gap-3 py-3 first:pt-0 last:pb-0 animate-gentle-fade"
                >
                  <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20 shrink-0">
                    {iconFor(it.type)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground leading-snug">{it.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDistanceToNow(it.at, { addSuffix: true })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default LiveRippleFeed;