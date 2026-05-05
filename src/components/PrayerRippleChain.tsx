import { Card, CardContent } from "@/components/ui/card";
import PrayerRequestCard from "@/components/PrayerRequestCard";
import { Heart, Share2, Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface ChainNode {
  label: string;
  type: "requester" | "prayed" | "shared";
}

interface PrayerChainData {
  prayerId: string;
  title: string;
  category: string;
  prayedCount: number;
  uniquePeople: number;
  forwardCount: number;
  lastPrayedAt: Date | null;
  chain: ChainNode[];
}

const PrayerRippleChain = () => {
  const { user } = useAuth();

  const { data: chains, isLoading } = useQuery({
    queryKey: ["prayer_ripple_chains", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Fetch user's global prayer requests
      const { data: requests } = await supabase
        .from("global_prayer_requests")
        .select("*")
        .eq("created_by", user.id)
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(10);

      if (!requests?.length) return [];

      const prayerIds = requests.map((r) => r.id);

      // Fetch coverage data
      const { data: coverageData } = await supabase
        .from("prayer_coverage")
        .select("*")
        .in("prayer_id", prayerIds);

      const coverageMap = new Map(
        (coverageData || []).map((c) => [c.prayer_id, c])
      );

      // Fetch chain nodes for these prayers
      const { data: chainNodes } = await supabase
        .from("prayer_chain_nodes")
        .select("*")
        .in("prayer_id", prayerIds)
        .order("depth_level", { ascending: true });

      // Fetch action counts for chain visualization
      const { data: actions } = await supabase
        .from("prayer_actions")
        .select("prayer_id, action_type, user_id, created_at")
        .in("prayer_id", prayerIds);

      // Build chains
      return requests.map((req): PrayerChainData => {
        const coverage = coverageMap.get(req.id);
        const reqActions = (actions || []).filter((a) => a.prayer_id === req.id);
        const prayedActions = reqActions.filter((a) => a.action_type === "prayed");
        const sharedActions = reqActions.filter((a) => a.action_type === "shared");

        // Build anonymized chain for display
        const chain: ChainNode[] = [
          { label: "You requested prayer", type: "requester" },
        ];

        // Add unique prayed participants (anonymized)
        const uniquePrayers = new Set(prayedActions.map((a) => a.user_id));
        const prayerNames = [
          "A prayer partner", "Someone", "A believer",
          "A community member", "A faithful friend",
          "A prayer warrior", "A caring soul",
          "A fellow believer",
        ];

        let nameIdx = 0;
        uniquePrayers.forEach(() => {
          chain.push({
            label: `${prayerNames[nameIdx % prayerNames.length]} prayed`,
            type: "prayed",
          });
          nameIdx++;
        });

        // Add shares
        sharedActions.forEach(() => {
          chain.push({
            label: "Passed forward",
            type: "shared",
          });
        });

        const lastAction = reqActions
          .map((a) => new Date(a.created_at as any))
          .sort((a, b) => b.getTime() - a.getTime())[0] ?? null;

        return {
          prayerId: req.id,
          title: req.title,
          category: req.category,
          prayedCount: coverage?.current_prayers ?? req.prayer_count,
          uniquePeople: coverage?.unique_people_prayed ?? 0,
          forwardCount: coverage?.passed_forward_count ?? 0,
          lastPrayedAt: lastAction,
          chain,
        };
      });
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Loading prayer chains...</span>
      </div>
    );
  }

  if (!chains?.length) {
    return (
      <PrayerRequestCard
        header="Your prayer requests"
        description="Submit a prayer request to see how it ripples through the community."
        className="text-center"
      />
    );
  }

  const recentlyPrayed = (date: Date | null) =>
    !!date && Date.now() - date.getTime() < 24 * 60 * 60 * 1000;

  return (
    <div className="space-y-6">
      {chains.map((chain) => (
        <Card
          key={chain.prayerId}
          className="rounded-xl animate-gentle-fade"
        >
          {/* Calm card header */}
          <CardContent className="px-6 py-8 sm:px-8 sm:py-10 space-y-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground/70 font-medium text-center">
              Your prayer request
            </p>
            <p className="text-base sm:text-lg text-foreground leading-relaxed text-center font-serif">
              {chain.title}
            </p>
            {/* Single main line: people praying */}
            <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
              <Heart className="h-3.5 w-3.5 text-primary/60" />
              <span>
                {chain.uniquePeople > 0
                  ? `🙏 ${chain.uniquePeople} ${
                      chain.uniquePeople === 1 ? "person is" : "people are"
                    } praying with you`
                  : "Be the first to pray 🙏"}
              </span>
            </div>

            {/* Optional share metric (only if > 0) */}
            {chain.forwardCount > 0 && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Share2 className="h-3 w-3 text-primary/60" />
                <span>
                  Shared {chain.forwardCount}{" "}
                  {chain.forwardCount === 1 ? "time" : "times"}
                </span>
              </div>
            )}

            {/* Calm recent activity hint */}
            {recentlyPrayed(chain.lastPrayedAt) && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3 text-primary/60" />
                <span>Someone prayed recently</span>
              </div>
            )}

            {/* Milestone message */}
            {chain.prayedCount >= 5 && (
              <div className="bg-primary/5 rounded-lg p-3 text-center">
                <p className="text-sm text-primary font-medium italic">
                  {chain.prayedCount >= 25
                    ? "Your request has been carried in prayer by many across the community."
                    : chain.prayedCount >= 10
                    ? "Several people have joined in prayer for this request."
                    : "This prayer is being lifted up by the community."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PrayerRippleChain;
