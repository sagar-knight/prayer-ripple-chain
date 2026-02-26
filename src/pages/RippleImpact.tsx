import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, Share2, ChevronDown, ChevronUp, Waves } from "lucide-react";

const RippleImpact = () => {
  const [userStats] = useState({
    prayersOffered: 47,
    prayersReceived: 12,
    chainsStarted: 3,
  });

  const [expandedChain, setExpandedChain] = useState<string | null>(null);

  const rippleChains = [
    {
      id: "1",
      title: "Healing Prayer Chain",
      status: "Active" as const,
      totalPrayers: 42,
      uniquePeople: 38,
      shares: 17,
      depth: 5,
      layers: [3, 6, 10, 12, 7],
    },
    {
      id: "2",
      title: "Family Restoration Chain",
      status: "Active" as const,
      totalPrayers: 32,
      uniquePeople: 28,
      shares: 11,
      depth: 4,
      layers: [4, 8, 10, 6],
    },
    {
      id: "3",
      title: "Financial Breakthrough Chain",
      status: "Answered" as const,
      totalPrayers: 19,
      uniquePeople: 15,
      shares: 7,
      depth: 3,
      layers: [3, 5, 7],
    },
  ];

  const toggleChain = (id: string) => {
    setExpandedChain(expandedChain === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-background py-10 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10 animate-gentle-fade">
          <Waves className="h-10 w-10 text-primary/60 mx-auto mb-3" />
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-3">
            Your Prayer Journey
          </h1>
          <p className="text-muted-foreground text-base max-w-lg mx-auto leading-relaxed">
            Every prayer matters. Even when unseen, God is at work.
          </p>
        </div>

        {/* Section 1: Personal Prayer Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {/* Card 1: Faithfulness */}
          <Card className="border-border/50 shadow-sm animate-gentle-fade">
            <CardContent className="pt-6 pb-5 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="h-6 w-6 text-primary/70" />
              </div>
              <h3 className="font-playfair text-lg font-semibold text-foreground mb-1">
                Your Faithfulness
              </h3>
              <p className="text-foreground text-base">
                You have prayed for others{" "}
                <span className="font-semibold text-primary">{userStats.prayersOffered}</span>{" "}
                times.
              </p>
              <p className="text-xs text-muted-foreground mt-1">Total Prayers Offered</p>
            </CardContent>
          </Card>

          {/* Card 2: Support Around You */}
          <Card className="border-border/50 shadow-sm animate-gentle-fade" style={{ animationDelay: "100ms" }}>
            <CardContent className="pt-6 pb-5 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary/70" />
              </div>
              <h3 className="font-playfair text-lg font-semibold text-foreground mb-1">
                Support Around You
              </h3>
              <p className="text-foreground text-base">
                <span className="font-semibold text-primary">{userStats.prayersReceived}</span>{" "}
                people have prayed for your requests.
              </p>
              <p className="text-xs text-muted-foreground mt-1">Total Prayers Received</p>
            </CardContent>
          </Card>

          {/* Card 3: Prayer Chains Started */}
          <Card className="border-border/50 shadow-sm animate-gentle-fade" style={{ animationDelay: "200ms" }}>
            <CardContent className="pt-6 pb-5 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                <Share2 className="h-6 w-6 text-primary/70" />
              </div>
              <h3 className="font-playfair text-lg font-semibold text-foreground mb-1">
                Prayer Chains Started
              </h3>
              <p className="text-foreground text-base">
                You began{" "}
                <span className="font-semibold text-primary">{userStats.chainsStarted}</span>{" "}
                prayer chains that encouraged others to pray.
              </p>
              <p className="text-xs text-muted-foreground mt-1">Chains Initiated</p>
            </CardContent>
          </Card>
        </div>

        {/* Section 2: Ripple Visualization */}
        <div className="mb-10">
          <h2 className="font-playfair text-2xl font-semibold text-foreground mb-2">
            How Your Prayer Spread
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            See how far each prayer chain has traveled through people and communities.
          </p>

          <div className="space-y-4">
            {rippleChains.map((chain, index) => (
              <Card
                key={chain.id}
                className="border-border/50 shadow-sm animate-gentle-fade"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="font-playfair text-lg text-foreground">
                        {chain.title}
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className={`mt-1.5 text-xs ${
                          chain.status === "Answered"
                            ? "bg-accent/20 text-accent-foreground"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {chain.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 space-y-3">
                  {/* Chain metrics grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-muted/40 rounded-lg p-3 text-center">
                      <div className="text-lg font-semibold text-foreground">{chain.totalPrayers}</div>
                      <div className="text-xs text-muted-foreground">Total Prayers</div>
                    </div>
                    <div className="bg-muted/40 rounded-lg p-3 text-center">
                      <div className="text-lg font-semibold text-foreground">{chain.uniquePeople}</div>
                      <div className="text-xs text-muted-foreground">Unique People</div>
                    </div>
                    <div className="bg-muted/40 rounded-lg p-3 text-center">
                      <div className="text-lg font-semibold text-foreground">{chain.shares}</div>
                      <div className="text-xs text-muted-foreground">Shares</div>
                    </div>
                    <div className="bg-muted/40 rounded-lg p-3 text-center">
                      <div className="text-lg font-semibold text-foreground">{chain.depth}</div>
                      <div className="text-xs text-muted-foreground">Depth Layers</div>
                    </div>
                  </div>

                  {/* Expandable Ripple Map */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-muted-foreground hover:text-primary"
                    onClick={() => toggleChain(chain.id)}
                  >
                    {expandedChain === chain.id ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-1.5" />
                        Hide Ripple Map
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-1.5" />
                        View Ripple Map
                      </>
                    )}
                  </Button>

                  {expandedChain === chain.id && (
                    <div className="bg-muted/30 rounded-lg p-4 space-y-1.5 animate-gentle-fade">
                      <div className="text-sm font-medium text-foreground flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                        You
                      </div>
                      {chain.layers.map((count, layerIdx) => (
                        <div
                          key={layerIdx}
                          className="text-sm text-muted-foreground"
                          style={{ paddingLeft: `${(layerIdx + 1) * 20}px` }}
                        >
                          ↳ {count} {count === 1 ? "person" : "people"}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Section 3: Encouragement Footer */}
        <div className="text-center py-8 border-t border-border/50 animate-gentle-fade">
          <p className="font-playfair text-lg italic text-foreground/80 mb-2">
            "The prayer of a righteous person is powerful and effective."
          </p>
          <p className="text-sm text-muted-foreground mb-4">— James 5:16</p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Your faithfulness creates impact beyond what you can see.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RippleImpact;
