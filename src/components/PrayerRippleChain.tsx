import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PrayerRequestCard from "@/components/PrayerRequestCard";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, Share2, Loader2 } from "lucide-react";
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
        .select("prayer_id, action_type, user_id")
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

        return {
          prayerId: req.id,
          title: req.title,
          category: req.category,
          prayedCount: coverage?.current_prayers ?? req.prayer_count,
          uniquePeople: coverage?.unique_people_prayed ?? 0,
          forwardCount: coverage?.passed_forward_count ?? 0,
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

  return (
    <div className="space-y-6">
      {chains.map((chain) => (
        <Card
          key={chain.prayerId}
          className="border-0 shadow-[var(--shadow-peaceful)] animate-gentle-fade"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="font-playfair text-lg">{chain.title}</CardTitle>
              <Badge variant="secondary" className="text-xs flex-shrink-0">
                {chain.category}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-primary/5 rounded-lg p-3 text-center">
                <p className="text-lg font-semibold text-foreground">{chain.prayedCount}</p>
                <p className="text-[10px] text-muted-foreground">
                  Prayed {chain.prayedCount} {chain.prayedCount === 1 ? "time" : "times"}
                </p>
              </div>
              <div className="bg-primary/5 rounded-lg p-3 text-center">
                <p className="text-lg font-semibold text-foreground">{chain.uniquePeople}</p>
                <p className="text-[10px] text-muted-foreground">
                  {chain.uniquePeople} {chain.uniquePeople === 1 ? "person" : "people"} prayed
                </p>
              </div>
              <div className="bg-primary/5 rounded-lg p-3 text-center">
                <p className="text-lg font-semibold text-foreground">{chain.forwardCount}</p>
                <p className="text-[10px] text-muted-foreground">
                  Passed forward {chain.forwardCount} {chain.forwardCount === 1 ? "time" : "times"}
                </p>
              </div>
            </div>

            {/* Visual chain */}
            {chain.chain.length > 1 && (
              <div className="space-y-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Prayer Chain
                </p>
                <div className="space-y-0">
                  {chain.chain.map((node, idx) => (
                    <div key={idx} className="flex items-stretch">
                      {/* Vertical line connector */}
                      <div className="flex flex-col items-center mr-3 w-6">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                            node.type === "requester"
                              ? "bg-primary/20"
                              : node.type === "shared"
                              ? "bg-accent/20"
                              : "bg-primary/10"
                          }`}
                        >
                          {node.type === "requester" ? (
                            <Heart className="h-3 w-3 text-primary" />
                          ) : node.type === "shared" ? (
                            <Share2 className="h-3 w-3 text-accent-foreground" />
                          ) : (
                            <Users className="h-3 w-3 text-primary" />
                          )}
                        </div>
                        {idx < chain.chain.length - 1 && (
                          <div className="w-px flex-1 bg-primary/15 min-h-[12px]" />
                        )}
                      </div>
                      {/* Label */}
                      <div className="pb-3 flex items-start">
                        <p className="text-sm text-foreground/80 pt-0.5">{node.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
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
